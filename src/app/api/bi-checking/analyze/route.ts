import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// BI Checking analyzer with real PDF text extraction using pdf-parse.
// Extracts text, scans for key signals (kolektibilitas, tunggakan, dll),
// and computes a simple eligibility score with traceable reasons.
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    // If no file provided, default to PERHATIAN as requested
    if (!file) {
      const lines: string[] = []
      lines.push('Keputusan: PERHATIAN (warning).')
      lines.push('Ringkasan: Belum ada data BI Checking yang diunggah, sehingga penilaian otomatis belum dapat memastikan kelayakan.')
      lines.push('Rekomendasi: Unggah PDF BI Checking untuk analisis lebih akurat atau lakukan verifikasi manual sementara (cek kolektibilitas, tunggakan, DSR/DTI, dan catatan negatif).')
      const analysis = lines.join('\n')
      return NextResponse.json({ analysis, isEligible: false, status: 'PERHATIAN' }, { status: 200 })
    }

    // Read bytes and parse text
    const buf = Buffer.from(await file.arrayBuffer())
    if (buf.length === 0) {
      return NextResponse.json({ error: 'File kosong/tidak terbaca.' }, { status: 400 })
    }

    // Lazy import to avoid bundling issues in some environments
    const pdfParse = (await import('pdf-parse')).default as (b: Buffer) => Promise<{ text: string }>
    const parsed = await pdfParse(buf).catch(() => null)
    const rawText = (parsed?.text || '').replace(/\s+/g, ' ').trim()
    const text = rawText.toLowerCase()

    // Load and compare against sample PDFs in `BI Checking/` folder (Layak, Tidak Layak, Perhatian)
    const sampleDir = path.join(process.cwd(), 'BI Checking')
    type Sample = { label: 'LAYAK' | 'TIDAK_LAYAK' | 'PERHATIAN', file: string, text: string }
    const sampleCandidates: Array<{ label: Sample['label']; filename: string }> = [
      { label: 'LAYAK', filename: 'Layak.pdf' },
      { label: 'TIDAK_LAYAK', filename: 'Tidak Layak.pdf' },
      { label: 'PERHATIAN', filename: 'Perhatian.pdf' },
    ]
    const samples: Sample[] = []
    for (const s of sampleCandidates) {
      const p = path.join(sampleDir, s.filename)
      if (fs.existsSync(p)) {
        try {
          const sbuf = fs.readFileSync(p)
          const sParsed = await pdfParse(Buffer.from(sbuf)).catch(() => null)
          const sText = (sParsed?.text || '').replace(/\s+/g, ' ').trim().toLowerCase()
          if (sText) samples.push({ label: s.label, file: p, text: sText })
        } catch {}
      }
    }

    // Simple cosine similarity over token counts
    const toVector = (t: string): Map<string, number> => {
      const m = new Map<string, number>()
      const tokens = t
        .replace(/[^a-zA-Z0-9\p{L}\s]/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && w.length <= 30)
      for (const w of tokens) m.set(w, (m.get(w) || 0) + 1)
      return m
    }
    const dot = (a: Map<string, number>, b: Map<string, number>) => {
      let s = 0
      for (const [k, v] of a) {
        const bv = b.get(k)
        if (bv) s += v * bv
      }
      return s
    }
    const norm = (a: Map<string, number>) => Math.sqrt(Array.from(a.values()).reduce((c, n) => c + n * n, 0))
    const cosine = (a: Map<string, number>, b: Map<string, number>) => {
      const na = norm(a); const nb = norm(b)
      if (na === 0 || nb === 0) return 0
      return dot(a, b) / (na * nb)
    }
    let statusBySamples: 'LAYAK' | 'TIDAK_LAYAK' | 'PERHATIAN' | null = null
    let bestSampleMatch: { label: Sample['label']; score: number } | null = null
    if (samples.length) {
      const vUpload = toVector(text)
      let best: { label: Sample['label']; score: number } | null = null
      for (const s of samples) {
        const score = cosine(vUpload, toVector(s.text))
        if (!best || score > best.score) best = { label: s.label, score }
      }
      if (best) {
        bestSampleMatch = best
        // Threshold kept modest to allow template guidance; can be adjusted
        const threshold = 0.08
        if (best.score >= threshold) {
          // Map PERHATIAN -> PERHATIAN; others as-is
          statusBySamples = best.label === 'PERHATIAN' ? 'PERHATIAN' : best.label
        }
      }
    }

    // Extract key numeric fields from text (Kolektibilitas, BI Score, DSR, DTI)
    const pct = (s: string | undefined | null) => {
      if (!s) return null
      const n = Number(String(s).replace(/[^0-9.,]/g, '').replace(',', '.'))
      return isFinite(n) ? n : null
    }
    const findNumber = (re: RegExp) => {
      const m = rawText.match(re)
      return m ? pct(m[1]) : null
    }

    let kolekt: number | null = null
    {
      const m1 = text.match(/kolektibilitas\s*(\d)/)
      const m2 = text.match(/\bkol\s*(\d)\b/)
      if (m1) kolekt = parseInt(m1[1])
      else if (m2) kolekt = parseInt(m2[1])
      else if (/\blancar\b/.test(text)) kolekt = 1
      else if (/dalam\s*perhatian\s*khusus|\bdpk\b/.test(text)) kolekt = 2
      else if (/kurang\s*lancar/.test(text)) kolekt = 3
      else if (/diragukan/.test(text)) kolekt = 4
      else if (/macet/.test(text)) kolekt = 5
    }

    let biScore: number | null = null
    {
      const m = rawText.match(/(?:Skor\s*BI|BI\s*Score|DHTI)\s*[:=]?\s*(\d)/i)
      if (m) biScore = parseInt(m[1])
    }

    let dsr = findNumber(/(?:DSR|Debt\s*Service\s*Ratio)\s*[:=]?\s*([0-9.,]+)\s*%/i)
    let dti = findNumber(/(?:DTI|Debt\s*to\s*Income)\s*[:=]?\s*([0-9.,]+)\s*%/i)

    // Allow overrides via multipart fields if provided
    const formDSR = form.get('dsr') as string | null
    const formDTI = form.get('dti') as string | null
    const formBI = form.get('biScore') as string | null
    if (pct(formDSR) !== null) dsr = pct(formDSR)
    if (pct(formDTI) !== null) dti = pct(formDTI)
    if (pct(formBI) !== null) biScore = pct(formBI)

    // Keyword-based signals
    const severeNeg = [
      /blacklist|daftar\s*hitam|blokir|larangan/,
      /macet|kolektibilitas\s*5|\bkol\s*5\b/,
      /kolektibilitas\s*4|\bkol\s*4\b|diragukan/,
    ]
    const strongPos = [
      /\blancar\b|baik\s*sekali|\bclear\b/,
      /kolektibilitas\s*1|\bkol\s*1\b/,
      /tidak\s*ada\s*tunggakan|no\s*overdue|\bcurrent\b/,
    ]
    const moderate = [
      { re: /kolektibilitas\s*3|\bkol\s*3\b|kurang\s*lancar/, w: -1, r: 'kolektibilitas 3/kurang lancar' },
      { re: /restrukturisasi|restruktur/, w: -1, r: 'kredit restrukturisasi' },
      { re: /dpd\s*\d+|days\s*past\s*due/, w: -1, r: 'DPD terdeteksi' },
      { re: /kolektibilitas\s*2|\bkol\s*2\b/, w: +1, r: 'kolektibilitas 2' },
    ]

    const hits: string[] = []
    const hasSevereNegative = severeNeg.some((re) => { const m = re.test(text); if (m) hits.push('indikator berat'); return m })
    const hasStrongPositive = strongPos.some((re) => { const m = re.test(text); if (m) hits.push('indikator positif'); return m })

    let score = 0
    for (const m of moderate) { if (m.re.test(text)) { score += m.w; hits.push(m.r) } }

    const sizeKB = Math.max(1, Math.round(buf.length / 1024))

    // Contextual signals (+/-)
    const posSignals = [ /penghasilan\s*stabil|pendapatan\s*stabil/i, /agunan\s*memadai|jaminan\s*memadai/i, /pekerjaan\s*tetap|masa\s*kerja\s*\d+\s*tahun/i, /tabungan|investasi|deposito/i, /rasio\s*utang\s*rendah|debt\s*ratio\s*low/i, /usaha\s*sehat|profil\s*usaha/i ]
    const negHardSignals = [ /proses\s*hukum|pailit|bangkrut/i, /penghasilan\s*tidak\s*stabil|pekerjaan\s*tidak\s*tetap/i, /banyak\s*kredit\s*aktif/i, /fraud|penipuan/i, /domisili\s*tidak\s*j[ea]las/i ]
    const posCount = posSignals.reduce((c, r) => (r.test(rawText) ? c + 1 : c), 0)
    const hasNegHard = negHardSignals.some((r) => r.test(rawText))

    // Decision matrix
    let status: 'LAYAK' | 'TIDAK_LAYAK' | 'PERHATIAN'
    if (
      hasSevereNegative || hasNegHard || (kolekt !== null && kolekt >= 3) || (biScore !== null && biScore >= 4) ||
      (dsr !== null && dsr > 40) || (dti !== null && dti > 45)
    ) {
      status = 'TIDAK_LAYAK'
    } else if (
      (kolekt === 1) && ((biScore === null) || (biScore >= 1 && biScore <= 2)) &&
      ((dsr === null) || dsr <= 30) && ((dti === null) || dti <= 35) &&
      posCount >= 3
    ) {
      status = 'LAYAK'
    } else if (
      (kolekt === 1 || kolekt === 2) && ((biScore === null) || (biScore >= 2 && biScore <= 3)) &&
      ((dsr === null) || dsr <= 40) && ((dti === null) || dti <= 45)
    ) {
      // Map previous 'Layak Bersyarat' to warning category 'PERHATIAN'
      status = 'PERHATIAN'
    } else if (hasStrongPositive || (kolekt === 1)) {
      status = 'LAYAK'
    } else {
      status = 'TIDAK_LAYAK'
    }

    // If sample-based classification exists, override the rule-based decision
    if (statusBySamples) {
      // If samples indicate PERHATIAN explicitly, use it; otherwise use Layak/Tidak Layak match
      status = statusBySamples
    }

    // Count colored status tokens often shown in BI summary tables
    const rg = (re: RegExp) => (rawText.match(re) || []).length
    const okCount = rg(/\bOK\b/gi)
    const yCount = rg(/\b1\s*[–-]?\s*89\b/g) // yellow (1-89)
    const oCount = rg(/\b90\s*[–-]?\s*119\b/g) // orange (90-119)
    const rCount = rg(/\b(1[2-7][0-9]|180\+)\b/g) // 120-179 or 180+
    const colorTotal = okCount + yCount + oCount + rCount

    // Use color majority as an additional decision driver when present
    if (colorTotal >= 6) {
      const okRatio = okCount / colorTotal
      const riskRatio = (oCount + rCount) / colorTotal
      const redRatio = rCount / colorTotal
      if (redRatio >= 0.3 || riskRatio >= 0.5) {
        status = 'TIDAK_LAYAK'
      } else if (okRatio >= 0.6 && rCount === 0) {
        status = 'LAYAK'
      } else if (yCount / colorTotal >= 0.3 && redRatio < 0.2) {
        if (status === 'LAYAK') status = 'LAYAK' ; else status = 'PERHATIAN'
      }
    }

    const parts: string[] = []
    if (kolekt) parts.push(`kolektibilitas ${kolekt}`)
    if (biScore !== null) parts.push(`skor BI ${biScore}`)
    if (dsr !== null) parts.push(`DSR ${dsr}%`)
    if (dti !== null) parts.push(`DTI ${dti}%`)
    if (hits.length) parts.push(`indikator: ${Array.from(new Set(hits)).slice(0, 6).join(', ')}`)
    if (posCount) parts.push(`kriteria positif +${posCount}`)

    if (colorTotal > 0) parts.push(`warna: OK ${okCount}, 1-89 ${yCount}, 90-119 ${oCount}, 120+/180+ ${rCount}`)
    // Build human-friendly Indonesian narrative
    const pretty = (v: number | null | undefined, suffix = '') => v === null || v === undefined ? 'tidak ditemukan' : `${v}${suffix}`
    const statusReadable = status.replace('_', ' ')
    const lines: string[] = []
    lines.push(`Keputusan: ${statusReadable}${status === 'PERHATIAN' ? ' (warning)' : ''}.`)

    // Ringkasan alasan utama
    const summaryBits: string[] = []
    if (kolekt !== null) summaryBits.push(`kolektibilitas ${kolekt}`)
    if (typeof biScore === 'number') summaryBits.push(`skor BI ${biScore}`)
    if (typeof dsr === 'number') summaryBits.push(`DSR ${dsr}%`)
    if (typeof dti === 'number') summaryBits.push(`DTI ${dti}%`)
    if (hits.length) summaryBits.push(`indikator: ${Array.from(new Set(hits)).slice(0, 4).join(', ')}`)
    if (statusBySamples && bestSampleMatch) {
      const pct = Math.round(bestSampleMatch.score * 100)
      summaryBits.push(`mirip contoh "${statusBySamples.replace('_', ' ')}" (~${pct}%)`)
    }
    if (summaryBits.length) {
      lines.push(`Ringkasan: ${summaryBits.join('; ')}.`)
    }

    // Rincian parameter utama
    const detail: string[] = []
    detail.push(`- Kolektibilitas: ${pretty(kolekt)}`)
    detail.push(`- Skor BI: ${pretty(biScore as number | null)}`)
    detail.push(`- DSR: ${pretty(dsr, '%')}`)
    detail.push(`- DTI: ${pretty(dti, '%')}`)
    if (colorTotal > 0) {
      detail.push(`- Indikator warna: OK ${okCount}, 1-89 ${yCount}, 90-119 ${oCount}, 120+/180+ ${rCount}`)
    }
    if (hits.length) {
      detail.push(`- Sinyal khusus: ${Array.from(new Set(hits)).slice(0, 8).join(', ')}`)
    }
    lines.push('Rincian:')
    lines.push(...detail)

    // Rekomendasi tindakan
    if (status === 'LAYAK') {
      lines.push('Rekomendasi: Lanjutkan proses pembiayaan. Tetap lakukan verifikasi dokumen pendukung (mutasi, slip gaji/usaha) dan pantau rasio DSR/DTI agar dalam batas aman.')
    } else if (status === 'PERHATIAN') {
      lines.push('Rekomendasi: Lakukan peninjauan manual lebih lanjut dan minta dokumen tambahan bila perlu. Pertimbangkan penyesuaian plafon/tenor agar DSR/DTI tetap sehat.')
    } else {
      lines.push('Rekomendasi: Tidak disarankan dilanjutkan pada kondisi saat ini. Evaluasi ulang setelah perbaikan histori kolektibilitas/penurunan beban utang dan penyediaan agunan/dokumen pendukung.')
    }

    lines.push(`Catatan sistem: ukuran berkas ~${sizeKB}KB.`)
    const analysis = lines.join('\n')

    const isEligible = status === 'LAYAK'
    return NextResponse.json({ analysis, isEligible, status, kolektibilitas: kolekt, biScore, dsr, dti, okCount, yCount, oCount, rCount })
  } catch (err) {
    console.error('Failed to analyze BI Checking:', err)
    return NextResponse.json({ error: 'Gagal menganalisis BI Checking.' }, { status: 500 })
  }
}
