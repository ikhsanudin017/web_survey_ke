import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()
    console.log('Received application data:', applicationData)

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

    // Create the financing application
    const application = await prisma.financingApplication.create({
      data: {
        clientId: client.id,
        fullName: applicationData.fullName,
        birthPlace: applicationData.birthPlace,
        birthDate: new Date(applicationData.birthDate || new Date()),
        gender: applicationData.gender,
        maritalStatus: applicationData.maritalStatus,
        education: applicationData.education,
        occupation: applicationData.occupation,
        monthlyIncome: parseFloat(applicationData.monthlyIncome) || 0,
        spouseName: applicationData.spouseName || null,
        spouseOccupation: applicationData.spouseOccupation || null,
        spouseIncome: applicationData.spouseIncome ? parseFloat(applicationData.spouseIncome) || 0 : null,
        homeAddress: applicationData.homeAddress,
        phoneNumber: applicationData.phoneNumber,
        // Map the contact fields correctly
        contact1: applicationData.contact1 || null,
        contact2: applicationData.contact2 || null,
        contact3: applicationData.contact3 || null,
        contact4: applicationData.contact4 || null,
        contact5: applicationData.contact5 || null,
        businessName: applicationData.businessName || null,
        businessType: applicationData.businessType || null,
        businessAddress: applicationData.businessAddress || null,
        businessDuration: applicationData.businessDuration ? (parseInt(applicationData.businessDuration) || 0) * 12 : null, // Convert years to months
        businessIncome: applicationData.businessIncome ? parseFloat(applicationData.businessIncome) || 0 : null,
        loanAmount: parseFloat(applicationData.loanAmount) || 0,
        loanPurpose: applicationData.loanPurpose,
        loanTerm: parseInt(applicationData.loanTerm) || 0,
        collateral: applicationData.collateral || null
      }

    })

    // Create checklist with default values
    await prisma.applicationChecklist.create({
      data: {
        applicationId: application.id,
        ktpOriginal: false,
        ktpCopy: false,
        kkOriginal: false,
        kkCopy: false,
        slipGaji: false,
        suratKeterjaKerja: false,
        rekKoran: false,
        buktiPenghasilan: false,
        siup: false,
        tdp: false,
        buktiTempatUsaha: false,
        fotoUsaha: false,
        sertifikatTanah: false,
        bpkb: false,
        imb: false,
        suratNikah: false,
        aktaKelahiran: false,
        referensiBank: false
      }
    })

    const uploadedFiles = applicationData.documentUpload?.documents || []

    // Save uploaded files to database
    if (uploadedFiles.length > 0) {
      await Promise.all(
        uploadedFiles.map((file: {
          filename: string;
          originalName: string;
          size: number;
          url: string;
          category: string;
        }) =>
          prisma.document.create({
            data: {
              applicationId: application.id,
              fileName: file.filename, // Make sure this matches the property from upload API
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
      { error: "Terjadi kesalahan saat menyimpan data pembiayaan: " + (error as Error).message },
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
        documents: true,
        financingAnalysis: true, // Tambahkan ini
        subFinancingAnalysis: true // Tambahkan ini
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
