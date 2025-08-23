import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, ...formData } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID tidak ditemukan" },
        { status: 400 }
      )
    }

    // Check if sub-analysis for this application already exists
    const existingSubAnalysis = await prisma.subFinancingAnalysis.findUnique({
      where: { applicationId },
    });

    if (existingSubAnalysis) {
      // Update existing record
      const updatedSubAnalysis = await prisma.subFinancingAnalysis.update({
        where: { applicationId },
        data: {
          pemasukanSuami: parseFloat(formData.pemasukanSuami) || 0,
          pemasukanIstri: parseFloat(formData.pemasukanIstri) || 0,
          pemasukanLainnya1: parseFloat(formData.pemasukanLainnya1) || 0,
          pemasukanLainnya2: parseFloat(formData.pemasukanLainnya2) || 0,
          pengeluaranSuami: parseFloat(formData.pengeluaranSuami) || 0,
          pengeluaranIstri: parseFloat(formData.pengeluaranIstri) || 0,
          makan: parseFloat(formData.makan) || 0,
          listrik: parseFloat(formData.listrik) || 0,
          sosial: parseFloat(formData.sosial) || 0,
          tanggunganLain: parseFloat(formData.tanggunganLain) || 0,
          jumlahAnak: parseInt(formData.jumlahAnak) || 0,
          pengeluaranSekolah: parseFloat(formData.pengeluaranSekolah) || 0,
          uangSaku: parseFloat(formData.uangSaku) || 0,
          pendapatanBersih: parseFloat(formData.pendapatanBersih) || 0,
        },
      });
      return NextResponse.json(
        {
          message: "Sub-analisa berhasil diperbarui!",
          subAnalysisId: updatedSubAnalysis.id
        },
        { status: 200 }
      );
    } else {
      // Create new record
      const subAnalysis = await prisma.subFinancingAnalysis.create({
        data: {
          applicationId: applicationId,
          pemasukanSuami: parseFloat(formData.pemasukanSuami) || 0,
          pemasukanIstri: parseFloat(formData.pemasukanIstri) || 0,
          pemasukanLainnya1: parseFloat(formData.pemasukanLainnya1) || 0,
          pemasukanLainnya2: parseFloat(formData.pemasukanLainnya2) || 0,
          pengeluaranSuami: parseFloat(formData.pengeluaranSuami) || 0,
          pengeluaranIstri: parseFloat(formData.pengeluaranIstri) || 0,
          makan: parseFloat(formData.makan) || 0,
          listrik: parseFloat(formData.listrik) || 0,
          sosial: parseFloat(formData.sosial) || 0,
          tanggunganLain: parseFloat(formData.tanggunganLain) || 0,
          jumlahAnak: parseInt(formData.jumlahAnak) || 0,
          pengeluaranSekolah: parseFloat(formData.pengeluaranSekolah) || 0,
          uangSaku: parseFloat(formData.uangSaku) || 0,
          pendapatanBersih: parseFloat(formData.pendapatanBersih) || 0,
        }
      })
      return NextResponse.json(
        {
          message: "Sub-analisa berhasil disimpan!",
          subAnalysisId: subAnalysis.id
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("Error creating/updating sub-analysis:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data sub-analisa" },
      { status: 500 }
    )
  }
}
