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

    // Create the financing analysis - FIXED: removed analysisNotes field
    const analysis = await prisma.financingAnalysis.create({
      data: {
        applicationId: analysisData.applicationId,
        employeeId: employee.id,
        
        // Analisa Karakter
        agama: analysisData.character?.applicantCharacter || null,
        pengalaman: analysisData.character?.businessExperience || null,
        hubMasyarakat: analysisData.character?.businessReputation || null,
        
        // Analisa Kapasitas
        kapasitasDanKelancaran: `Kemampuan Bayar: ${analysisData.capacity?.paymentAbility || 'N/A'}, Cash Flow: ${analysisData.capacity?.cashFlow || 'N/A'}, Proyeksi Usaha: ${analysisData.capacity?.businessProjection || 'N/A'}, Rasio Hutang: ${analysisData.capacity?.debtRatio || 'N/A'}`,
        
        // Analisa Modal
        rumah: analysisData.capital?.ownCapital || null,
        kendaraanMotor: analysisData.capital?.motorVehicleCount ? parseInt(analysisData.capital.motorVehicleCount) : 0,
        kendaraanMobil: analysisData.capital?.carVehicleCount ? parseInt(analysisData.capital.carVehicleCount) : 0,
        lainnya: `Modal Pinjaman: ${analysisData.capital?.loanCapital || 'N/A'}, Rasio Modal: ${analysisData.capital?.capitalRatio || 'N/A'}`,
        
        // Analisa Jaminan
        jenisJaminan: analysisData.collateral?.collateralType || null,
        nilaiTaksiran: analysisData.collateral?.collateralValue ? parseFloat(analysisData.collateral.collateralValue) : null,
        kondisiJaminan: analysisData.collateral?.collateralCondition || null,
        nilaiJaminanSetelahPotongan: analysisData.collateral?.collateralRatio ? parseFloat(analysisData.collateral.collateralRatio) : null,
        
        // Kesimpulan - Store recommendation notes in lainnya field instead
        kesimpulanAkhir: analysisData.conclusion?.recommendation || "Layak",
        // Store detailed analysis notes in an existing field like lainnya or create a combined string
        lainnya: analysisData.lainnya || `Notes: Recommended Amount: ${analysisData.conclusion?.recommendedAmount || 'N/A'}, Recommended Term: ${analysisData.conclusion?.recommendedTerm || 'N/A'}, Notes: ${analysisData.conclusion?.notes || 'N/A'}`,
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