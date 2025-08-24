import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    if (!formData.applicationId) {
      return NextResponse.json(
        { error: "Application ID tidak ditemukan" },
        { status: 400 }
      )
    }

    // Check if analysis already exists for this application
    const existingAnalysis = await prisma.financingAnalysis.findUnique({
      where: { applicationId: formData.applicationId },
    });

    const analysisData = {
      applicationId: formData.applicationId,
      employeeId: formData.employeeId,
      
      // Data dari Application (auto-filled)
      nama: formData.nama,
      alamat: formData.alamat,
      jenisUsaha: formData.jenisUsaha,
      pengajuan: formData.pengajuan,
      jangkaWaktu: formData.jangkaWaktu,

      // 1. KARAKTER
      agama: formData.agama,
      pengalaman: formData.pengalaman,
      hubMasyarakat: formData.hubMasyarakat,
      karakterAngsuranLannya: formData.karakterAngsuranLannya,
      kelSurveyLannya: formData.kelSurveyLannya,

      // Rating Karakter dengan penilai
      karakter1: formData.karakter1 ? parseInt(formData.karakter1) : null,
      karakter1Penilai: formData.karakter1Penilai,
      karakter2: formData.karakter2 ? parseInt(formData.karakter2) : null,
      karakter2Penilai: formData.karakter2Penilai,
      karakter3: formData.karakter3 ? parseInt(formData.karakter3) : null,
      karakter3Penilai: formData.karakter3Penilai,
      karakter4: formData.karakter4 ? parseInt(formData.karakter4) : null,
      karakter4Penilai: formData.karakter4Penilai,
      karakter5: formData.karakter5 ? parseInt(formData.karakter5) : null,
      karakter5Penilai: formData.karakter5Penilai,

      // Checklist "Jelek"
      karakterJelek1: formData.karakter1Jelek || false,
      karakterJelek2: formData.karakter2Jelek || false,
      karakterJelek3: formData.karakter3Jelek || false,
      karakterJelek4: formData.karakter4Jelek || false,
      karakterJelek5: formData.karakter5Jelek || false,

      // 2. KESIMPULAN KARAKTER (AI Generated)
      kesimpulanKarakter: formData.kesimpulanKarakter,
      kapasitasDanKelancaran: formData.kapasitasDanKelancaran,

      // 3. ANALISA JAMINAN
      jenisJaminan: formData.jenisJaminan,
      nilaiTaksiran: formData.nilaiTaksiran ? parseFloat(formData.nilaiTaksiran) : null,
      kondisiJaminan: formData.kondisiJaminan,
      nilaiJaminanSetelahPotongan: formData.nilaiJaminanSetelahPotongan ? parseFloat(formData.nilaiJaminanSetelahPotongan) : null,
      validInvalid: formData.validInvalid,

      // 4. KONDISI
      isKaryawan: formData.isKaryawan || false,
      isWiraswasta: formData.isWiraswasta || false,
      isPNSPolri: formData.isPNSPolri || false,
      isTetap: formData.isTetap || false,
      isKontrak: formData.isKontrak || false,
      isLainnya: formData.isLainnya || false,
      masaBerakhirKontrak: formData.masaBerakhirKontrak,

      // 5. CAPITAL
      rumah: formData.rumah,
      kendaraanMotor: formData.kendaraanMotor || 0,
      kendaraanMobil: formData.kendaraanMobil || 0,
      lainnya: formData.lainnya,

      // 6. CHECKLIST KELENGKAPAN DOKUMEN
      fcKtpPemohon: formData.fcKtpPemohon || false,
      fcKtpSuamiIstri: formData.fcKtpSuamiIstri || false,
      fcSlipGaji: formData.fcSlipGaji || false,

      // 7. KESIMPULAN AKHIR
      kesimpulanAkhir: formData.kesimpulanAkhir,

      // Signature fields
      petugasSurvei: formData.petugasSurvei,
      pengurus: formData.pengurus,
      approver: formData.approver
    };

    if (existingAnalysis) {
      // Update existing analysis
      const updatedAnalysis = await prisma.financingAnalysis.update({
        where: { applicationId: formData.applicationId },
        data: analysisData
      });

      return NextResponse.json(
        {
          message: "Analisa pembiayaan berhasil diperbarui!",
          analysisId: updatedAnalysis.id
        },
        { status: 200 }
      );
    } else {
      // Create new analysis
      const analysis = await prisma.financingAnalysis.create({
        data: analysisData
      });

      return NextResponse.json(
        {
          message: "Analisa pembiayaan berhasil disimpan!",
          analysisId: analysis.id
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating/updating analysis:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan analisa: " + (error as Error).message },
      { status: 500 }
    )
  }
}