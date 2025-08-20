import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Buat client baru (tanpa autentikasi)
    const client = await prisma.client.create({
      data: {
        email: data.phoneNumber + '@temp.com', // Email sementara dari nomor telepon
        password: 'temp', // Password sementara
        name: data.fullName,
        phone: data.phoneNumber,
        address: data.homeAddress,
      }
    })

    // Buat pengajuan pembiayaan
    const application = await prisma.financingApplication.create({
      data: {
        clientId: client.id,
        fullName: data.fullName,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        education: data.education,
        occupation: data.occupation,
        monthlyIncome: parseFloat(data.monthlyIncome),
        spouseName: data.spouseName || null,
        spouseOccupation: data.spouseOccupation || null,
        spouseIncome: data.spouseIncome ? parseFloat(data.spouseIncome) : null,
        homeAddress: data.homeAddress,
        phoneNumber: data.phoneNumber,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        businessName: data.businessName || null,
        businessType: data.businessType || null,
        businessAddress: data.businessAddress || null,
        businessDuration: data.businessDuration ? parseInt(data.businessDuration) : null,
        businessIncome: data.businessIncome ? parseFloat(data.businessIncome) : null,
        loanAmount: parseFloat(data.loanAmount),
        loanPurpose: data.loanPurpose,
        loanTerm: parseInt(data.loanTerm),
        collateral: data.collateral || null,
        status: 'PENDING'
      }
    })

    // Buat checklist kosong
    await prisma.applicationChecklist.create({
      data: {
        applicationId: application.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pengajuan berhasil disimpan',
      applicationId: application.id
    })

  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menyimpan data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const applications = await prisma.financingApplication.findMany({
      include: {
        client: true,
        checklist: true,
        financingAnalysis: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      applications
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}
