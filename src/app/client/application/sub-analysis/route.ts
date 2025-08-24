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

    // Calculate pendapatan bersih
    const pemasukanSuami = parseFloat(formData.pemasukanSuami) || 0
    const pemasukanIstri = parseFloat(formData.pemasukanIstri) || 0
    const pemasukanLainnya1 = parseFloat(formData.pemasukanLainnya1) || 0
    const pemasukanLainnya2 = parseFloat(formData.pemasukanLainnya2) || 0

    const pengeluaranSuami = parseFloat(formData.pengeluaranSuami) || 0
    const pengeluaranIstri = parseFloat(formData.pengeluaranIstri) || 0
    const makan = parseFloat(formData.makan) || 0
    const listrik = parseFloat(formData.listrik) || 0
    const sosial = parseFloat(formData.sosial) || 0
    const tanggunganLain = parseFloat(formData.tanggunganLain) || 0

    const pengeluaranSekolah = parseFloat(formData.pengeluaranSekolah) || 0
    const uangSaku = parseFloat(formData.uangSaku) || 0

    const totalPemasukan = pemasukanSuami + pemasukanIstri + pemasukanLainnya1 + pemasukanLainnya2
    const totalPengeluaran = pengeluaranSuami + pengeluaranIstri + makan + listrik + sosial + tanggunganLain
    const totalAnakPengeluaran = pengeluaranSekolah + uangSaku
    const pendapatanBersih = totalPemasukan - totalPengeluaran - totalAnakPengeluaran

    // Check if sub-analysis for this application already exists
    const existingSubAnalysis = await prisma.subFinancingAnalysis.findUnique({
      where: { applicationId },
    });

    if (existingSubAnalysis) {
      // Update existing record
      const updatedSubAnalysis = await prisma.subFinancingAnalysis.update({
        where: { applicationId },
        data: {
          pemasukanSuami,
          pemasukanIstri,
          pemasukanLainnya1,
          pemasukanLainnya2,
          pengeluaranSuami,
          pengeluaranIstri,
          makan,
          listrik,
          sosial,
          tanggunganLain,
          jumlahAnak: parseInt(formData.jumlahAnak) || 0,
          pengeluaranSekolah,
          uangSaku,
          pendapatanBersih,
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
          applicationId,
          pemasukanSuami,
          pemasukanIstri,
          pemasukanLainnya1,
          pemasukanLainnya2,
          pengeluaranSuami,
          pengeluaranIstri,
          makan,
          listrik,
          sosial,
          tanggunganLain,
          jumlahAnak: parseInt(formData.jumlahAnak) || 0,
          pengeluaranSekolah,
          uangSaku,
          pendapatanBersih,
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
      { error: "Terjadi kesalahan saat menyimpan data sub-analisa: " + (error as Error).message },
      { status: 500 }
    )
  }
}