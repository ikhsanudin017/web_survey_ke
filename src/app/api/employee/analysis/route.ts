import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);
    
    if (!session || !session.user || !session.user.id) {
      console.log('Authentication failed - no session or user');
      return NextResponse.json({ error: 'Unauthorized - Please login as employee' }, { status: 401 });
    }

    // Check if user is employee
    if (session.user.role !== 'employee') {
      console.log('User role is not employee:', session.user.role);
      return NextResponse.json({ error: 'Access denied - Employee role required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { applicationId, ...analysisData } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    // Simple validation for a few required fields
    if (!analysisData.kesimpulan_rekomendasi || !analysisData.petugasSurvei) {
        return NextResponse.json({ error: 'Kesimpulan dan nama petugas survei wajib diisi.' }, { status: 400 });
    }

    // Check if application exists
    const application = await prisma.financingApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if analysis already exists
    const existingAnalysis = await prisma.financingAnalysis.findUnique({
      where: { applicationId: applicationId }
    });

    if (existingAnalysis) {
      return NextResponse.json({ error: 'Analysis already exists for this application' }, { status: 409 });
    }

    const newAnalysis = await prisma.financingAnalysis.create({
      data: {
        applicationId: applicationId,
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
        karakter_kesimpulan: analysisData.karakter_kesimpulan,
        kapasitas_plafonMaksimal: Number(analysisData.kapasitas_plafonMaksimal) || 0,
        kapasitas_angsuranMaksimal: Number(analysisData.kapasitas_angsuranMaksimal) || 0,
        jaminan_jenis: analysisData.jaminan_jenis,
        jaminan_nilaiTaksiran: Number(analysisData.jaminan_nilaiTaksiran) || 0,
        jaminan_kondisi: analysisData.jaminan_kondisi,
        jaminan_plafonPokok: Number(analysisData.jaminan_plafonPokok) || 0,
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
    });

    // Optionally, update the main application status
    await prisma.financingApplication.update({
        where: { id: applicationId },
        data: { status: 'ANALYZED' }
    });

    return NextResponse.json(newAnalysis, { status: 201 });

  } catch (error) {
    console.error('Analysis creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// You might want to keep or adjust the GET function based on new requirements
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const applicationId = searchParams.get('applicationId');
  
      if (!applicationId) {
        return NextResponse.json(
          { error: 'Missing applicationId parameter' },
          { status: 400 }
        );
      }
  
      const analyses = await prisma.financingAnalysis.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'desc' },
      });
  
      return NextResponse.json({ analyses });
  
    } catch (error) {
      console.error('Analysis fetch error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }