import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "client") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { email: session.user.email! }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    const applications = await prisma.financingApplication.findMany({
      where: { clientId: client.id },
      orderBy: { submittedAt: "desc" }
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "client") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { email: session.user.email! }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    const applicationData = await request.json()

    const application = await prisma.financingApplication.create({
      data: {
        clientId: client.id,
        ...applicationData,
        birthDate: new Date(applicationData.birthDate),
        loanAmount: parseFloat(applicationData.loanAmount),
        monthlyIncome: parseFloat(applicationData.monthlyIncome),
        spouseIncome: applicationData.spouseIncome ? parseFloat(applicationData.spouseIncome) : null,
        businessIncome: applicationData.businessIncome ? parseFloat(applicationData.businessIncome) : null,
        businessDuration: applicationData.businessDuration ? parseInt(applicationData.businessDuration) : null,
        loanTerm: parseInt(applicationData.loanTerm)
      }
    })

    // Create checklist
    await prisma.applicationChecklist.create({
      data: {
        applicationId: application.id
      }
    })

    return NextResponse.json(
      { message: "Application created successfully", applicationId: application.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
