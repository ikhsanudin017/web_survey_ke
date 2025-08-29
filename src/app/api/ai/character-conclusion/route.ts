import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type CharacterSurvey = {
  religion?: string
  experience?: string
  communityRelations?: string
  loanCharacter?: string
  surveyNotes?: string
  input1?: string
  input2?: string
  input3?: string
  input4?: string
  input5?: string
}

type SubAnalysis = {
  pendapatanBersih?: number
  angsuranMaksimal?: number
  plafonMaksimal?: number
  jangkaPembiayaan?: number
}

type Assessments = {
  businessProspects?: { score?: number }
  repaymentCapacity?: { score?: number }
  collateralValue?: { score?: number }
  completeness?: { score?: number }
}

const hasNeg = (s?: string | null) => {
  if (!s) return false
  const t = s.toLowerCase()
  return /(buruk|jelek|negatif|sering\s*telat|menunggak|macet|diragukan|\bkurang\b|kurang\s*lancar|sengketa|fraud|tidak\s*kooperatif)/.test(t)
}

const hasPos = (s?: string | null) => {
  if (!s) return false
  const t = s.toLowerCase()
  return /(baik|aktif|lancar|disiplin|jujur|amanah|stabil|tetap|harmonis|solid|terpercaya)/.test(t)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const avg: number = typeof body.averageScore === 'number' ? body.averageScore : 0
    const survey: CharacterSurvey = body.characterSurvey || {}
    let sub: SubAnalysis | undefined = body.subAnalysis
    const assessments: Assessments | undefined = body.assessments
    const applicationId: string | undefined = body.applicationId
    const surveyRatings: string[] = Array.isArray(body.surveyRatings) ? body.surveyRatings : []

    // If applicationId is provided but sub-analysis not supplied, fetch from DB
    if (applicationId && !sub) {
      try {
        const db = await prisma.subFinancingAnalysis.findUnique({ where: { applicationId } })
        if (db) {
          sub = {
            pendapatanBersih: Number(db.pendapatanBersih || 0),
            angsuranMaksimal: Number(db.angsuranMaksimal || 0),
            plafonMaksimal: Number(db.plafonMaksimal || 0),
            jangkaPembiayaan: Number(db.jangkaPembiayaan || 0),
          }
        }
      } catch {}
    }

    // Optionally fetch application to estimate planned installment (angsuran rencana)
    let plannedInstallment: number | undefined
    let plannedAmount: number | undefined
    let plannedTerm: number | undefined
    if (applicationId) {
      try {
        const app = await prisma.financingApplication.findUnique({
          where: { id: applicationId },
          select: { loanAmount: true, loanTerm: true },
        })
        if (app?.loanAmount && app?.loanTerm && app.loanTerm > 0) {
          plannedAmount = Number(app.loanAmount)
          plannedTerm = Number(app.loanTerm)
          plannedInstallment = plannedAmount / plannedTerm
        }
      } catch {}
    }

    // Derive qualitative band from average score
    let band: 'sangat_baik' | 'baik' | 'cukup' | 'kurang'
    if (avg >= 4.2) band = 'sangat_baik'
    else if (avg >= 3.5) band = 'baik'
    else if (avg >= 2.5) band = 'cukup'
    else band = 'kurang'

    // Aggregate simple sentiment from survey fields
    const posCount = [
      survey.religion, survey.experience, survey.communityRelations,
      survey.loanCharacter, survey.surveyNotes, survey.input1,
      survey.input2, survey.input3, survey.input4, survey.input5
    ].reduce((c, s) => c + (hasPos(s) ? 1 : 0), 0)
    const negCount = [
      survey.religion, survey.experience, survey.communityRelations,
      survey.loanCharacter, survey.surveyNotes, survey.input1,
      survey.input2, survey.input3, survey.input4, survey.input5
    ].reduce((c, s) => c + (hasNeg(s) ? 1 : 0), 0)

    // Consider assessments if provided
    const assessScores = [
      assessments?.businessProspects?.score,
      assessments?.repaymentCapacity?.score,
      assessments?.collateralValue?.score,
      assessments?.completeness?.score,
    ].filter((n): n is number => typeof n === 'number')
    const assessAvg = assessScores.length ? (assessScores.reduce((a, b) => a + b, 0) / assessScores.length) : undefined

    // Draft recommendation using combined signals
    let rec: 'layak' | 'tidak_layak' | 'pertimbangan' = 'pertimbangan'
    if (band === 'sangat_baik' || (band === 'baik' && negCount === 0)) rec = 'layak'
    if (band === 'cukup') rec = 'pertimbangan'
    if (band === 'kurang' || negCount >= 2) rec = 'tidak_layak'

    // If capacity constraints based on planned installment (not angsuranMaksimal)
    if (sub && typeof sub.pendapatanBersih === 'number' && sub.pendapatanBersih > 0 && plannedInstallment) {
      const ratio = plannedInstallment / sub.pendapatanBersih
      if (ratio > 0.6) rec = 'tidak_layak'
      else if (ratio > 0.45 && rec === 'layak') rec = 'pertimbangan'
      // Strong capacity safeguard: if installment is tiny vs income, avoid harsh downgrade unless many negatives
      else if (ratio <= 0.10 && rec === 'tidak_layak') {
        rec = (negCount >= 2 || band === 'kurang') ? 'pertimbangan' : 'layak'
      }
    }

    // Build detailed Indonesian narrative
    const lines: string[] = []
    lines.push(`Kesimpulan Karakter (AI): ${rec.toUpperCase()}.`)
    lines.push(`Ringkasan Skor: Rata-rata penilaian ${avg.toFixed(2)} (${band.replace('_', ' ')}).${assessAvg ? ` Rata-rata sub-penilaian ${assessAvg.toFixed(2)}.` : ''}`)
    if (surveyRatings.length) {
      const lc = surveyRatings.map((s) => String(s)).map(s => s.toLowerCase())
      const cnt = (kw: string) => lc.filter(s => s.includes(kw)).length
      const baik = cnt('baik'); const cukup = cnt('cukup'); const kurang = cnt('kurang'); const jelek = cnt('jelek')
      lines.push(`Distribusi Penilaian Survey (5 orang): Baik ${baik}, Cukup ${cukup}, Kurang ${kurang}, Jelek ${jelek}.`)
    }
    lines.push('Rincian Karakter:')
    if (survey.religion) lines.push(`- Agama: ${survey.religion}`)
    if (survey.experience) lines.push(`- Pengalaman: ${survey.experience}`)
    if (survey.communityRelations) lines.push(`- Hubungan dengan Masyarakat: ${survey.communityRelations}`)
    if (survey.loanCharacter) lines.push(`- Karakter Angsuran Lainnya: ${survey.loanCharacter}`)
    if (survey.surveyNotes) lines.push(`- Keterangan Survey Lainnya: ${survey.surveyNotes}`)
    const extras = [survey.input1, survey.input2, survey.input3, survey.input4, survey.input5].filter(Boolean) as string[]
    if (extras.length) lines.push(`- Catatan Tambahan: ${extras.join('; ')}`)

    if (sub) {
      lines.push('Rincian Sub-Analisis Kapasitas:')
      if (typeof sub.pendapatanBersih === 'number') lines.push(`- Pendapatan Bersih: Rp ${new Intl.NumberFormat('id-ID').format(sub.pendapatanBersih)}`)
      if (typeof sub.angsuranMaksimal === 'number') lines.push(`- Angsuran Maksimal: Rp ${new Intl.NumberFormat('id-ID').format(sub.angsuranMaksimal)}`)
      if (typeof sub.plafonMaksimal === 'number') lines.push(`- Plafon Maksimal: Rp ${new Intl.NumberFormat('id-ID').format(sub.plafonMaksimal)}`)
      if (typeof sub.jangkaPembiayaan === 'number') lines.push(`- Jangka Pembiayaan: ${sub.jangkaPembiayaan} bulan`)
      if (typeof sub.pendapatanBersih === 'number' && typeof sub.angsuranMaksimal === 'number' && sub.pendapatanBersih > 0) {
        const ratio = sub.angsuranMaksimal / sub.pendapatanBersih
        lines.push(`- Rasio Rekomendasi (Angsuran Maks/Net): ${(ratio * 100).toFixed(1)}%`) // untuk konteks saja
      }
    }

    // Planned loan details and affordability ratio
    if (plannedAmount && plannedTerm) {
      lines.push('Rencana Pembiayaan:')
      lines.push(`- Plafon Diajukan: Rp ${new Intl.NumberFormat('id-ID').format(plannedAmount)}`)
      lines.push(`- Jangka Waktu: ${plannedTerm} bulan`)
      if (plannedInstallment) {
        lines.push(`- Estimasi Angsuran per Bulan (tanpa margin): Rp ${new Intl.NumberFormat('id-ID').format(Math.round(plannedInstallment))}`)
        if (sub?.pendapatanBersih) {
          const aff = plannedInstallment / sub.pendapatanBersih
          lines.push(`- Rasio Estimasi Angsuran/Net Income: ${(aff * 100).toFixed(1)}%`)
          if (aff <= 0.10) lines.push('- Catatan: Kemampuan bayar sangat kuat (rasio <= 10%).')
          else if (aff <= 0.45) lines.push('- Catatan: Kemampuan bayar memadai (<= 45%).')
          else if (aff <= 0.60) lines.push('- Catatan: Beban angsuran mulai berat (45–60%).')
          else lines.push('- Catatan: Beban angsuran terlalu berat (> 60%).')
        }
      }
    }

    // Actionable recommendations per outcome
    if (rec === 'layak') {
      lines.push('Rekomendasi: Dapat dilanjutkan. Tetap verifikasi referensi lingkungan/mitra usaha dan konsistensi kedisiplinan pembayaran. Dokumentasi identitas & usaha harus lengkap dan valid.')
    } else if (rec === 'pertimbangan') {
      lines.push('Rekomendasi: Perlu pertimbangan. Lakukan klarifikasi tambahan kepada tetangga/mitra, minta bukti transaksi/arus kas, dan pertimbangkan penyesuaian plafon/tenor agar beban angsuran proporsional terhadap pendapatan.')
    } else {
      lines.push('Rekomendasi: Tidak disarankan saat ini. Terdapat indikator karakter/kapasitas yang perlu perbaikan (mis. kedisiplinan bayar, stabilitas pendapatan). Evaluasi ulang setelah perbaikan nyata.')
    }

    // Supporting factors
    const factors: string[] = []
    factors.push(`band=${band}`)
    factors.push(`positiveSignals=${posCount}`)
    factors.push(`negativeSignals=${negCount}`)
    if (sub?.pendapatanBersih) factors.push(`pendapatanBersih=${sub.pendapatanBersih}`)
    if (sub?.angsuranMaksimal) factors.push(`angsuranMaksimal=${sub.angsuranMaksimal}`)

    return NextResponse.json({
      summary: lines.join('\n'),
      recommendation: rec,
      factors
    })
  } catch (e) {
    return NextResponse.json({ error: 'Gagal menghasilkan kesimpulan karakter' }, { status: 500 })
  }
}
