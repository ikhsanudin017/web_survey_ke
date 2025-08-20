import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const applicationId = id

    const application = await prisma.financingApplication.findUnique({
      where: {
        id: applicationId
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        documents: true,
        checklist: true,
        financingAnalysis: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Pengajuan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      application
    })

  } catch (error) {
    console.error('Error fetching application detail:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil detail pengajuan' },
      { status: 500 }
    )
  }
}
