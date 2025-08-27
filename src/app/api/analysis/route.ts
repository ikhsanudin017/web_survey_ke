import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get employee ID from session
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email }
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    const analysisData = await request.json()
    console.log('Received analysis data:', analysisData)

    // Validate required fields
    const requiredFields = ['applicationId']
    for (const field of requiredFields) {
      if (!analysisData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if analysis already exists for this application
    const existingAnalysis = await prisma.financingAnalysis.findUnique({
      where: { applicationId: analysisData.applicationId }
    })

    if (existingAnalysis) {
      return NextResponse.json(
        { error: "Analysis already exists for this application" },
        { status: 409 }
      )
    }

    // Create the financing analysis
    const analysis = await prisma.financingAnalysis.create({
      data: {
        applicationId: analysisData.applicationId,
        employeeId: employee.id,
        
        // Mapping to new schema based on PDF
        karakter_agama: analysisData.character?.applicantCharacter || null,
        karakter_pengalaman: analysisData.character?.businessExperience || null,
        karakter_hubMasyarakat: analysisData.character?.businessReputation || null,
        
        // Combining multiple fields into one, as the new schema is simpler here
        kondisi_kesimpulanUmum: `Kemampuan Bayar: ${analysisData.capacity?.paymentAbility || 'N/A'}, Cash Flow: ${analysisData.capacity?.cashFlow || 'N/A'}`,
        
        capital_rumah: analysisData.capital?.ownCapital || null,
        // The old form had separate motor/car counts, the new one has a single text field.
        capital_kendaraan: `Motor: ${analysisData.capital?.motorVehicleCount || 0}, Mobil: ${analysisData.capital?.carVehicleCount || 0}`,
        
        jaminan_jenis: analysisData.collateral?.collateralType || null,
        jaminan_nilaiTaksiran: analysisData.collateral?.collateralValue ? parseFloat(analysisData.collateral.collateralValue) : null,
        jaminan_kondisi: analysisData.collateral?.collateralCondition || null,
        jaminan_plafonPokok: analysisData.collateral?.collateralRatio ? parseFloat(analysisData.collateral.collateralRatio) : null,
        
        kesimpulan_rekomendasi: analysisData.conclusion?.recommendation || "Layak",
        kesimpulan_catatanKhusus: `Rekomendasi - Jumlah: ${analysisData.conclusion?.recommendedAmount || 'N/A'}, Jangka Waktu: ${analysisData.conclusion?.recommendedTerm || 'N/A'}, Catatan: ${analysisData.conclusion?.notes || 'N/A'}`,
      }
    })

    return NextResponse.json(
      { 
        message: "Analisa pembiayaan berhasil disimpan!", 
        analysisId: analysis.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating analysis:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan analisa: " + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const analyses = await prisma.financingAnalysis.findMany({
      include: {
        application: {
          include: {
            client: true
          }
        },
        employee: {
          select: {
            name: true,
            position: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}