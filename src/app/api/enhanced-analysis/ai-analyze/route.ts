import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AIAnalyzeRequestSchema = z.object({
  applicationId: z.string().uuid(),
  step: z.number().min(1).max(5)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, step } = AIAnalyzeRequestSchema.parse(body);

    // Fetch the financing application with related data
    const application = await prisma.financingApplication.findUnique({
      where: { id: applicationId },
      include: {
        client: true,
        documents: true,
        financingAnalysis: true,
        subFinancingAnalysis: true,
        biChecking: true
      }
    });

    if (!application) {
      return NextResponse.json({
        error: 'Application not found'
      }, { status: 404 });
    }

    // Prepare context for AI analysis
    const context = {
      applicant: {
        name: application.fullName,
        email: application.client.email,
        phone: application.phoneNumber,
        address: application.homeAddress
      },
      application: {
        amount: application.loanAmount,
        purpose: application.loanPurpose,
        term: application.loanTerm,
        monthlyIncome: application.monthlyIncome,
        businessType: application.businessType,
        businessIncome: application.businessIncome
      },
      documents: application.documents,
      analysis: application.financingAnalysis,
      subAnalysis: application.subFinancingAnalysis,
      biChecking: application.biChecking
    };

    // Generate AI analysis based on step
    let prompt = '';
    switch (step) {
      case 1:
        prompt = `Analyze the character assessment for loan application:
          Applicant: ${application.fullName}
          Occupation: ${application.occupation}
          Business: ${application.businessName} (${application.businessType})
          Monthly Income: ${application.monthlyIncome}
          Business Income: ${application.businessIncome}
          
          Character analysis from financing analysis: ${JSON.stringify(application.financingAnalysis)}
          
          Provide a summary of character assessment with risk level and recommendations. Focus on:
          1. Professional stability and experience
          2. Business sustainability
          3. Income reliability
          4. Overall character rating`;
        break;
      case 2:
        prompt = `Analyze document verification status:
          Documents: ${JSON.stringify(application.documents)}
          
          Provide analysis of document completeness and authenticity. Focus on:
          1. Document completeness
          2. Document validity
          3. Missing documents
          4. Document quality assessment`;
        break;
      case 3:
        prompt = `Analyze collateral assessment:
          Collateral details: ${application.collateral}
          Financing analysis: ${JSON.stringify(application.financingAnalysis?.jenisJaminan)} ${JSON.stringify(application.financingAnalysis?.nilaiTaksiran)}
          
          Provide collateral valuation and risk assessment. Focus on:
          1. Collateral type and value
          2. Market value assessment
          3. Liquidity risk
          4. Legal documentation status`;
        break;
      case 4:
        prompt = `Analyze financial capacity:
          Monthly Income: ${application.monthlyIncome}
          Business Income: ${application.businessIncome}
          Sub-financing analysis: ${JSON.stringify(application.subFinancingAnalysis)}
          
          Provide financial health assessment and repayment capacity analysis. Focus on:
          1. Income stability
          2. Debt-to-income ratio
          3. Repayment capacity
          4. Financial risk factors`;
        break;
      case 5:
        prompt = `Provide comprehensive loan decision analysis based on:
          Applicant: ${application.fullName}
          Loan Amount: ${application.loanAmount}
          Loan Purpose: ${application.loanPurpose}
          Loan Term: ${application.loanTerm} months
          
          Character Analysis: ${JSON.stringify(application.financingAnalysis)}
          Financial Analysis: ${JSON.stringify(application.subFinancingAnalysis)}
          BI Checking: ${JSON.stringify(application.biChecking)}
          
          Provide final recommendation with risk level and reasoning. Consider:
          1. Overall creditworthiness
          2. Risk assessment
          3. Loan approval recommendation
          4. Conditions or requirements`;
        break;
    }

    // Mock AI response for now (replace with actual OpenAI integration)
    const mockAIResponses = {
      1: {
        summary: "Analisis karakter menunjukkan pemohon memiliki stabilitas pekerjaan yang baik dengan pengalaman usaha yang cukup. Karakter dalam pembayaran angsuran terlihat baik berdasarkan hasil survey.",
        riskLevel: "MEDIUM",
        recommendation: "REVIEW",
        confidenceScore: 75,
        factors: ["Stabilitas pekerjaan", "Pengalaman usaha", "Karakter pembayaran"],
        warnings: ["Perlu verifikasi dokumen lebih lanjut"]
      },
      2: {
        summary: "Dokumen yang diperlukan sudah lengkap dan valid. Semua dokumen identitas dan pendukung telah diverifikasi.",
        riskLevel: "LOW",
        recommendation: "APPROVE",
        confidenceScore: 90,
        factors: ["Dokumen lengkap", "Dokumen valid", "Identitas terkonfirmasi"],
        warnings: []
      },
      3: {
        summary: "Jaminan yang diajukan memiliki nilai yang memadai untuk menutupi jumlah pinjaman. Nilai taksiran sesuai dengan pasar.",
        riskLevel: "LOW",
        recommendation: "APPROVE",
        confidenceScore: 85,
        factors: ["Nilai jaminan memadai", "Dokumen jaminan lengkap", "Nilai pasar sesuai"],
        warnings: []
      },
      4: {
        summary: "Kapasitas keuangan pemohon cukup baik dengan rasio utang terhadap pendapatan yang masih dalam batas wajar.",
        riskLevel: "MEDIUM",
        recommendation: "APPROVE",
        confidenceScore: 80,
        factors: ["Pendapatan stabil", "Rasio utang wajar", "Kemampuan bayar memadai"],
        warnings: ["Pantau fluktuasi pendapatan"]
      },
      5: {
        summary: "Secara keseluruhan, pemohon memenuhi kriteria pemberian pembiayaan dengan tingkat risiko yang dapat dikelola.",
        riskLevel: "MEDIUM",
        recommendation: "APPROVE",
        confidenceScore: 82,
        factors: ["Karakter baik", "Dokumen lengkap", "Jaminan memadai", "Kapasitas keuangan cukup"],
        warnings: ["Lakukan monitoring berkala"]
      }
    };

    const aiAnalysis = mockAIResponses[step as keyof typeof mockAIResponses];

    // Store AI analysis in the financing analysis
    if (application.financingAnalysis) {
      await prisma.financingAnalysis.update({
        where: { id: application.financingAnalysis.id },
        data: {
          ...(step === 1 && { kesimpulanKarakter: aiAnalysis.summary }),
          ...(step === 5 && { 
            kesimpulanAkhir: aiAnalysis.recommendation === 'APPROVE' ? 'Layak' : 'Tidak Layak'
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      aiAnalysis
    });

  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI analysis'
    }, { status: 500 });
  }
}
