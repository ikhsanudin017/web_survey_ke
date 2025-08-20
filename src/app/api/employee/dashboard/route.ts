import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user || session.user.role !== "employee") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get statistics
    const totalApplications = await prisma.financingApplication.count()
    const pendingApplications = await prisma.financingApplication.count({
      where: { status: "PENDING" }
    })
    const approvedApplications = await prisma.financingApplication.count({
      where: { status: "APPROVED" }
    })
    const rejectedApplications = await prisma.financingApplication.count({
      where: { status: "REJECTED" }
    })

    const stats = {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications
    }

    // Get recent applications
    const recentApplications = await prisma.financingApplication.findMany({
      take: 10,
      orderBy: { submittedAt: "desc" },
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      stats,
      recentApplications
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
