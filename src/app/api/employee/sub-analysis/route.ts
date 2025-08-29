import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (applicationId) {
      const sub = await prisma.subFinancingAnalysis.findUnique({ where: { applicationId } });
      if (!sub) return NextResponse.json({ message: 'Sub-analysis not found for this application.' }, { status: 404 });

      // Map DB fields -> form field names expected by the page
      const payload = {
        suami: String(sub.pemasukanSuami ?? ''),
        istri: String(sub.pemasukanIstri ?? ''),
        lainnya1: String(sub.pemasukanLainnya1 ?? ''),
        // Store total of other incomes in "lainnya2"; UI also has "lainnya3" which we leave empty
        lainnya2: String(sub.pemasukanLainnya2 ?? ''),
        lainnya3: '',

        suamiPengeluaran: String(sub.pengeluaranSuami ?? ''),
        istriPengeluaran: String(sub.pengeluaranIstri ?? ''),
        makan: String(sub.makan ?? ''),
        listrik: String(sub.listrik ?? ''),
        sosial: String(sub.sosial ?? ''),
        tanggunganLain: String(sub.tanggunganLain ?? ''),

        jumlahAnak: String(sub.jumlahAnak ?? ''),
        sekolah: String(sub.pengeluaranSekolah ?? ''),
        uangSaku: String(sub.uangSaku ?? ''),

        pendapatanBersih: String(sub.pendapatanBersih ?? ''),
        jangkaPembiayaan: String(sub.jangkaPembiayaan ?? ''),
        angsuranMaksimal: String(sub.angsuranMaksimal ?? ''),
        plafonMaksimal: String(sub.plafonMaksimal ?? ''),
      };
      return NextResponse.json(payload);
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
    const lainnya3 = parseFloat(formData.lainnya3) || 0 // Optional field; not stored separately

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
      pemasukanSuami: suami,
      pemasukanIstri: istri,
      pemasukanLainnya1: lainnya1,
      // Store sum of other incomes 2+3 in field lainnya2
      pemasukanLainnya2: (lainnya2 + lainnya3),
      pengeluaranSuami: suamiPengeluaran,
      pengeluaranIstri: istriPengeluaran,
      makan,
      listrik,
      sosial,
      tanggunganLain,
      jumlahAnak: parseInt(formData.jumlahAnak) || 0,
      pengeluaranSekolah: sekolah,
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

      // Check if FinancingAnalysis also exists and update application status
      const financingAnalysisExists = await prisma.financingAnalysis.findUnique({
        where: { applicationId },
      });

      if (financingAnalysisExists) {
        await prisma.financingApplication.update({
          where: { id: applicationId },
          data: { status: 'ANALYZED' },
        });
      }

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

      // Check if FinancingAnalysis also exists and update application status
      const financingAnalysisExists = await prisma.financingAnalysis.findUnique({
        where: { applicationId },
      });

      if (financingAnalysisExists) {
        await prisma.financingApplication.update({
          where: { id: applicationId },
          data: { status: 'ANALYZED' },
        });
      }

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
