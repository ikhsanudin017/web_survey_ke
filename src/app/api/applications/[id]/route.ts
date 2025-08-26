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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const body = await request.json()
    const { uploadedFiles, ...restOfBody } = body

    const application = await prisma.financingApplication.update({
      where: { id },
      data: {
        ...restOfBody,
        loanAmount: parseFloat(restOfBody.loanAmount),
        monthlyIncome: parseFloat(restOfBody.monthlyIncome),
        spouseIncome: parseFloat(restOfBody.spouseIncome) || 0,
        businessIncome: parseFloat(restOfBody.businessIncome) || 0,
        businessDuration: parseFloat(restOfBody.businessDuration) || 0,
        loanTerm: parseInt(restOfBody.loanTerm),
        birthDate: new Date(restOfBody.birthDate),
      },
    })

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui pengajuan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    await prisma.financingApplication.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Pengajuan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus pengajuan' },
      { status: 500 }
    )
  }
}

