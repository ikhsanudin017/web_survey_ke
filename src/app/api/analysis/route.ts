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
        
        // Analisa Karakter
        karakterPemohon: analysisData.character?.applicantCharacter || null,
        reputasiUsaha: analysisData.character?.businessReputation || null,
        pengalamanUsaha: analysisData.character?.businessExperience || null,
        hubunganDenganBank: analysisData.character?.bankRelationship || null,
        
        // Analisa Kapasitas
        kemampuanBayar: analysisData.capacity?.paymentAbility || null,
        cashFlow: analysisData.capacity?.cashFlow || null,
        proyeksiUsaha: analysisData.capacity?.businessProjection || null,
        rasioHutang: analysisData.capacity?.debtRatio ? parseFloat(analysisData.capacity.debtRatio) : null,
        
        // Analisa Modal
        modalSendiri: analysisData.capital?.ownCapital ? parseFloat(analysisData.capital.ownCapital) : null,
        modalPinjaman: analysisData.capital?.loanCapital ? parseFloat(analysisData.capital.loanCapital) : null,
        rasioModal: analysisData.capital?.capitalRatio ? parseFloat(analysisData.capital.capitalRatio) : null,
        
        // Analisa Kondisi
        kondisiEkonomi: analysisData.conditions?.economicCondition || null,
        kondisiIndustri: analysisData.conditions?.industryCondition || null,
        risikoUsaha: analysisData.conditions?.businessRisk || null,
        
        // Analisa Jaminan
        jenisJaminan: analysisData.collateral?.collateralType || null,
        nilaiJaminan: analysisData.collateral?.collateralValue ? parseFloat(analysisData.collateral.collateralValue) : null,
        kondisiJaminan: analysisData.collateral?.collateralCondition || null,
        rasioJaminan: analysisData.collateral?.collateralRatio ? parseFloat(analysisData.collateral.collateralRatio) : null,
        
        // Kesimpulan
        recommendation: analysisData.conclusion?.recommendation || null,
        recommendedAmount: analysisData.conclusion?.recommendedAmount ? parseFloat(analysisData.conclusion.recommendedAmount) : null,
        recommendedTerm: analysisData.conclusion?.recommendedTerm ? parseInt(analysisData.conclusion.recommendedTerm) : null,
        notes: analysisData.conclusion?.notes || null
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
