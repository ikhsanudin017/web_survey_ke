import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    // Create or find client based on email
    let client = await prisma.client.findUnique({
      where: { email: applicationData.email }
    })

    if (!client) {
      // Create new client if doesn't exist
      client = await prisma.client.create({
        data: {
          email: applicationData.email,
          name: applicationData.fullName,
          phone: applicationData.phoneNumber,
          address: applicationData.homeAddress,
          password: "default123" // Default password since no login required
        }
      })
    }

    const application = await prisma.financingApplication.create({
      data: {
        clientId: client.id,
        fullName: applicationData.fullName,
        birthPlace: applicationData.birthPlace,
        birthDate: new Date(applicationData.birthDate),
        gender: applicationData.gender,
        maritalStatus: applicationData.maritalStatus,
        education: applicationData.education,
        occupation: applicationData.occupation,
        monthlyIncome: parseFloat(applicationData.monthlyIncome),
        spouseName: applicationData.spouseName || null,
        spouseOccupation: applicationData.spouseOccupation || null,
        spouseIncome: applicationData.spouseIncome ? parseFloat(applicationData.spouseIncome) : null,
        homeAddress: applicationData.homeAddress,
        phoneNumber: applicationData.phoneNumber,
        emergencyContact: applicationData.emergencyContact,
        emergencyPhone: applicationData.emergencyPhone,
        businessName: applicationData.businessName || null,
        businessType: applicationData.businessType || null,
        businessAddress: applicationData.businessAddress || null,
        businessDuration: applicationData.businessDuration ? parseInt(applicationData.businessDuration) : null,
        businessIncome: applicationData.businessIncome ? parseFloat(applicationData.businessIncome) : null,
        loanAmount: parseFloat(applicationData.loanAmount),
        loanPurpose: applicationData.loanPurpose,
        loanTerm: parseInt(applicationData.loanTerm),
        collateral: applicationData.collateral || null
      }
    })

    // Create checklist with data from form
    await prisma.applicationChecklist.create({
      data: {
        applicationId: application.id,
        ktpOriginal: applicationData.checklist?.ktpOriginal || false,
        ktpCopy: applicationData.checklist?.ktpCopy || false,
        kkOriginal: applicationData.checklist?.kkOriginal || false,
        kkCopy: applicationData.checklist?.kkCopy || false,
        slipGaji: applicationData.checklist?.slipGaji || false,
        suratKeterjaKerja: applicationData.checklist?.suratKeterjaKerja || false,
        rekKoran: applicationData.checklist?.rekKoran || false,
        buktiPenghasilan: applicationData.checklist?.buktiPenghasilan || false,
        siup: applicationData.checklist?.siup || false,
        tdp: applicationData.checklist?.tdp || false,
        buktiTempatUsaha: applicationData.checklist?.buktiTempatUsaha || false,
        fotoUsaha: applicationData.checklist?.fotoUsaha || false,
        sertifikatTanah: applicationData.checklist?.sertifikatTanah || false,
        bpkb: applicationData.checklist?.bpkb || false,
        imb: applicationData.checklist?.imb || false,
        suratNikah: applicationData.checklist?.suratNikah || false,
        aktaKelahiran: applicationData.checklist?.aktaKelahiran || false,
        referensiBank: applicationData.checklist?.referensiBank || false
      }
    })

    // Save uploaded files to database
    if (applicationData.uploadedFiles && applicationData.uploadedFiles.length > 0) {
      await Promise.all(
        applicationData.uploadedFiles.map((file: {
          filename: string;
          originalName: string;
          size: number;
          url: string;
          category: string;
        }) =>
          prisma.document.create({
            data: {
              applicationId: application.id,
              fileName: file.filename,
              originalName: file.originalName,
              fileType: file.originalName.split('.').pop() || 'unknown',
              fileSize: file.size,
              fileUrl: file.url,
              category: file.category
            }
          })
        )
      )
    }

    return NextResponse.json(
      { 
        message: "Aplikasi pembiayaan berhasil disubmit!", 
        applicationId: application.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data pembiayaan" },
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
        documents: true
      },
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
