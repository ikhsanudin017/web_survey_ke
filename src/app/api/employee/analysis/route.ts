import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AnalysisBody = {
  applicationId: string
  [key: string]: any
}

async function ensureEmployee(session: any) {
  try {
    await prisma.employee.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name ?? session.user.id,
        role: session.user.role ?? 'employee',
      },
      create: {
        id: session.user.id,
        email: `${session.user.id}@local`,
        password: 'local',
        name: session.user.name ?? session.user.id,
        role: session.user.role ?? 'employee',
      },
    })
  } catch (e) {
    console.error('ensureEmployee upsert failed:', e)
  }
}

function normalizeDecimal(input: any): number | undefined {
  if (input === null || input === undefined || input === '') return undefined
  const n = Number(input)
  return Number.isFinite(n) ? n : undefined
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - Please login as employee' }, { status: 401 })
    }
    if (session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Access denied - Employee role required' }, { status: 403 })
    }

    const body: AnalysisBody = await request.json()
    const { applicationId, ...analysisData } = body
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 })
    }
    if (!analysisData.kesimpulan_rekomendasi || !analysisData.petugasSurvei) {
      return NextResponse.json({ error: 'Kesimpulan dan nama petugas survei wajib diisi.' }, { status: 400 })
    }

    await ensureEmployee(session)

    const application = await prisma.financingApplication.findUnique({ where: { id: applicationId } })
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const existing = await prisma.financingAnalysis.findFirst({ where: { applicationId } })
    if (existing) {
      return NextResponse.json({ error: 'Analysis already exists for this application' }, { status: 409 })
    }

    const created = await prisma.financingAnalysis.create({
      data: {
        applicationId,
        employeeId: session.user.id,
        nama: analysisData.nama,
        alamat: analysisData.alamat,
        jenisUsaha: analysisData.jenisUsaha,
        pengajuan: analysisData.pengajuan,
        jangkaWaktu: analysisData.jangkaWaktu,
        karakter_agama: analysisData.karakter_agama,
        karakter_pengalaman: analysisData.karakter_pengalaman,
        karakter_hubMasyarakat: analysisData.karakter_hubMasyarakat,
        karakter_angsuranLainnya: analysisData.karakter_angsuranLainnya,
        karakter_surveyLainnya: analysisData.karakter_surveyLainnya,
        karakter_surveyRating1: analysisData.karakter_surveyRating1,
        karakter_surveyRating2: analysisData.karakter_surveyRating2,
        karakter_surveyRating3: analysisData.karakter_surveyRating3,
        karakter_surveyRating4: analysisData.karakter_surveyRating4,
        karakter_surveyRating5: analysisData.karakter_surveyRating5,
        karakter_input1: analysisData.karakter_input1,
        karakter_input2: analysisData.karakter_input2,
        karakter_input3: analysisData.karakter_input3,
        karakter_input4: analysisData.karakter_input4,
        karakter_input5: analysisData.karakter_input5,
        karakter_kesimpulan: analysisData.karakter_kesimpulan,
        kapasitas_plafonMaksimal: normalizeDecimal(analysisData.kapasitas_plafonMaksimal) ?? 0,
        kapasitas_angsuranMaksimal: normalizeDecimal(analysisData.kapasitas_angsuranMaksimal) ?? 0,
        jaminan_jenis: analysisData.jaminan_jenis,
        jaminan_nilaiTaksiran: normalizeDecimal(analysisData.jaminan_nilaiTaksiran) ?? 0,
        jaminan_kondisi: analysisData.jaminan_kondisi,
        jaminan_plafonPokok: normalizeDecimal(analysisData.jaminan_plafonPokok) ?? 0,
        jaminan_keabsahan: analysisData.jaminan_keabsahan,
        kondisi_pekerjaan: analysisData.kondisi_pekerjaan,
        kondisi_pekerjaanLainnya: analysisData.kondisi_pekerjaanLainnya,
        kondisi_jenisKontrak: analysisData.kondisi_jenisKontrak,
        kondisi_masaBerakhirKontrak: analysisData.kondisi_masaBerakhirKontrak,
        kondisi_kesimpulanUmum: analysisData.kondisi_kesimpulanUmum,
        capital_rumah: analysisData.capital_rumah,
        capital_kendaraan: analysisData.capital_kendaraan,
        capital_hartaLainnya: analysisData.capital_hartaLainnya,
        ceklist_fcKtpPemohon: Boolean(analysisData.ceklist_fcKtpPemohon),
        ceklist_fcKk: Boolean(analysisData.ceklist_fcKk),
        ceklist_fcKtpSuamiIstri: Boolean(analysisData.ceklist_fcKtpSuamiIstri),
        ceklist_fcSlipGaji: Boolean(analysisData.ceklist_fcSlipGaji),
        ceklist_fcAgunan: Boolean(analysisData.ceklist_fcAgunan),
        kesimpulan_catatanKhusus: analysisData.kesimpulan_catatanKhusus,
        kesimpulan_rekomendasi: analysisData.kesimpulan_rekomendasi,
        petugasSurvei: analysisData.petugasSurvei,
        pengurus: analysisData.pengurus,
        approver: analysisData.approver,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Analysis creation error:', message, error)
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - Please login as employee' }, { status: 401 })
    }
    if (session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Access denied - Employee role required' }, { status: 403 })
    }

    const body: AnalysisBody = await request.json()
    const { applicationId, ...analysisData } = body
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 })
    }
    if (!analysisData.kesimpulan_rekomendasi || !analysisData.petugasSurvei) {
      return NextResponse.json({ error: 'Kesimpulan dan nama petugas survei wajib diisi.' }, { status: 400 })
    }

    await ensureEmployee(session)

    const existing = await prisma.financingAnalysis.findFirst({ where: { applicationId } })
    if (!existing) {
      return NextResponse.json({ error: 'Analysis not found for this application' }, { status: 404 })
    }

    const updated = await prisma.financingAnalysis.update({
      where: { id: existing.id },
      data: {
        employeeId: session.user.id,
        nama: analysisData.nama,
        alamat: analysisData.alamat,
        jenisUsaha: analysisData.jenisUsaha,
        pengajuan: analysisData.pengajuan,
        jangkaWaktu: analysisData.jangkaWaktu,
        karakter_agama: analysisData.karakter_agama,
        karakter_pengalaman: analysisData.karakter_pengalaman,
        karakter_hubMasyarakat: analysisData.karakter_hubMasyarakat,
        karakter_angsuranLainnya: analysisData.karakter_angsuranLainnya,
        karakter_surveyLainnya: analysisData.karakter_surveyLainnya,
        karakter_surveyRating1: analysisData.karakter_surveyRating1,
        karakter_surveyRating2: analysisData.karakter_surveyRating2,
        karakter_surveyRating3: analysisData.karakter_surveyRating3,
        karakter_surveyRating4: analysisData.karakter_surveyRating4,
        karakter_surveyRating5: analysisData.karakter_surveyRating5,
        karakter_input1: analysisData.karakter_input1,
        karakter_input2: analysisData.karakter_input2,
        karakter_input3: analysisData.karakter_input3,
        karakter_input4: analysisData.karakter_input4,
        karakter_input5: analysisData.karakter_input5,
        karakter_kesimpulan: analysisData.karakter_kesimpulan,
        kapasitas_plafonMaksimal: normalizeDecimal(analysisData.kapasitas_plafonMaksimal),
        kapasitas_angsuranMaksimal: normalizeDecimal(analysisData.kapasitas_angsuranMaksimal),
        jaminan_jenis: analysisData.jaminan_jenis,
        jaminan_nilaiTaksiran: normalizeDecimal(analysisData.jaminan_nilaiTaksiran),
        jaminan_kondisi: analysisData.jaminan_kondisi,
        jaminan_plafonPokok: normalizeDecimal(analysisData.jaminan_plafonPokok),
        jaminan_keabsahan: analysisData.jaminan_keabsahan,
        kondisi_pekerjaan: analysisData.kondisi_pekerjaan,
        kondisi_pekerjaanLainnya: analysisData.kondisi_pekerjaanLainnya,
        kondisi_jenisKontrak: analysisData.kondisi_jenisKontrak,
        kondisi_masaBerakhirKontrak: analysisData.kondisi_masaBerakhirKontrak,
        kondisi_kesimpulanUmum: analysisData.kondisi_kesimpulanUmum,
        capital_rumah: analysisData.capital_rumah,
        capital_kendaraan: analysisData.capital_kendaraan,
        capital_hartaLainnya: analysisData.capital_hartaLainnya,
        ceklist_fcKtpPemohon: Boolean(analysisData.ceklist_fcKtpPemohon),
        ceklist_fcKk: Boolean(analysisData.ceklist_fcKk),
        ceklist_fcKtpSuamiIstri: Boolean(analysisData.ceklist_fcKtpSuamiIstri),
        ceklist_fcSlipGaji: Boolean(analysisData.ceklist_fcSlipGaji),
        ceklist_fcAgunan: Boolean(analysisData.ceklist_fcAgunan),
        kesimpulan_catatanKhusus: analysisData.kesimpulan_catatanKhusus,
        kesimpulan_rekomendasi: analysisData.kesimpulan_rekomendasi,
        petugasSurvei: analysisData.petugasSurvei,
        pengurus: analysisData.pengurus,
        approver: analysisData.approver,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Analysis update error:', message, error)
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId parameter' }, { status: 400 })
    }
    const analyses = await prisma.financingAnalysis.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ analyses })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Analysis fetch error:', message, error)
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}

