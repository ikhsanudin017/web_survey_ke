import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    if (!formData.applicationId) {
      return NextResponse.json(
        { error: "Application ID tidak ditemukan" },
        { status: 400 }
      )
    }

    if (!formData.pdfFileUrl) {
      return NextResponse.json(
        { error: "File PDF BI Checking belum diupload" },
        { status: 400 }
      )
    }

    // Check if BI checking already exists for this application
    const existingBiChecking = await prisma.biChecking.findUnique({
      where: { applicationId: formData.applicationId },
    });

    const biCheckingData = {
      applicationId: formData.applicationId,
      pdfFileName: formData.pdfFileName,
      pdfFileUrl: formData.pdfFileUrl,
      pdfFileSize: formData.pdfFileSize,
      aiAnalysisResult: formData.aiAnalysisResult,
      creditScore: formData.creditScore,
      riskLevel: formData.riskLevel,
      recommendation: formData.recommendation,
      aiSummary: formData.aiSummary,
      manualNotes: formData.manualNotes,
      manualRating: formData.manualRating ? parseInt(formData.manualRating) : null
    };

    if (existingBiChecking) {
      // Update existing BI checking
      const updatedBiChecking = await prisma.biChecking.update({
        where: { applicationId: formData.applicationId },
        data: biCheckingData
      });

      return NextResponse.json(
        {
          message: "BI Checking berhasil diperbarui!",
          biCheckingId: updatedBiChecking.id
        },
        { status: 200 }
      );
    } else {
      // Create new BI checking
      const biChecking = await prisma.biChecking.create({
        data: biCheckingData
      });

      return NextResponse.json(
        {
          message: "BI Checking berhasil disimpan!",
          biCheckingId: biChecking.id
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating/updating BI checking:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan BI checking: " + (error as Error).message },
      { status: 500 }
    )
  }
}