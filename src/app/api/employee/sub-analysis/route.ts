import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (applicationId) {
      const subAnalysis = await prisma.subFinancingAnalysis.findUnique({
        where: { applicationId },
      });
      if (subAnalysis) {
        return NextResponse.json(subAnalysis);
      } else {
        return NextResponse.json({ message: "Sub-analysis not found for this application." }, { status: 404 });
      }
    } else {
      // If no applicationId, return all (or handle as error if not intended)
      const subAnalyses = await prisma.subFinancingAnalysis.findMany({
        include: {
          application: {
            select: {
              fullName: true,
            }
          }
        }
      });
      return NextResponse.json(subAnalyses); // Return array directly
    }
  } catch (error) {
    console.error("Error fetching sub-analyses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("Incoming request to /api/employee/sub-analysis");
  try {
    const body = await request.json();
    console.log("Request body:", body);
    const { applicationId, ...formData } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID tidak ditemukan" },
        { status: 400 }
      )
    }

    // Calculate pendapatan bersih - Adjusted to frontend field names
    const suami = parseFloat(formData.suami) || 0
    const istri = parseFloat(formData.istri) || 0
    const lainnya1 = parseFloat(formData.lainnya1) || 0
    const lainnya2 = parseFloat(formData.lainnya2) || 0
    const lainnya3 = parseFloat(formData.lainnya3) || 0 // Added this field

    const suamiPengeluaran = parseFloat(formData.suamiPengeluaran) || 0
    const istriPengeluaran = parseFloat(formData.istriPengeluaran) || 0
    const makan = parseFloat(formData.makan) || 0
    const listrik = parseFloat(formData.listrik) || 0
    const sosial = parseFloat(formData.sosial) || 0
    const tanggunganLain = parseFloat(formData.tanggunganLain) || 0

    const sekolah = parseFloat(formData.sekolah) || 0
    const uangSaku = parseFloat(formData.uangSaku) || 0

    const totalPemasukan = suami + istri + lainnya1 + lainnya2 + lainnya3
    const totalPengeluaran = suamiPengeluaran + istriPengeluaran + makan + listrik + sosial + tanggunganLain
    const totalAnakPengeluaran = sekolah + uangSaku
    const pendapatanBersih = totalPemasukan - totalPengeluaran - totalAnakPengeluaran
    const jangkaPembiayaan = parseInt(formData.jangkaPembiayaan) || 0
    
    // Calculate angsuran maksimal (70% of net income)
    const angsuranMaksimal = pendapatanBersih * 0.7
    
    // Calculate plafon maksimal based on angsuran maksimal and financing period
    const plafonMaksimal = angsuranMaksimal * jangkaPembiayaan

    const dataToStore = {
            suami,
      istri,
      lainnya1,
      lainnya2,
      lainnya3,
      suamiPengeluaran,
      istriPengeluaran,
      makan,
      listrik,
      sosial,
      tanggunganLain,
      jumlahAnak: parseInt(formData.jumlahAnak) || 0,
      sekolah,
      uangSaku,
      pendapatanBersih,
      jangkaPembiayaan,
      angsuranMaksimal,
      plafonMaksimal,
    };

    // Check if sub-analysis for this application already exists
    const existingSubAnalysis = await prisma.subFinancingAnalysis.findUnique({
      where: { applicationId },
    });

    if (existingSubAnalysis) {
      // Update existing record
      const updatedSubAnalysis = await prisma.subFinancingAnalysis.update({
        where: { applicationId },
        data: dataToStore,
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
          ...dataToStore,
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
