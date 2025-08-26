import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIAnalysisEngine } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, analysisData } = body;

    if (!applicationId || !analysisData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the application
    const application = await prisma.financingApplication.findUnique({
      where: { id: applicationId },
      include: { client: true }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Perform AI analysis
    const analysisResult = AIAnalysisEngine.analyzeApplication(analysisData);

    // Create analysis record
    const analysis = await prisma.financingAnalysis.create({
      data: {
        applicationId,
        employeeId: session.user.id,
        
        status: 'COMPLETED'
      }
    });

    // Update application status
    await prisma.financingApplication.update({
      where: { id: applicationId },
      data: { 
        status: 'ANALYZED',
        
      }
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        approvalLikelihood: analysis.approvalLikelihood,
        recommendations: analysis.recommendations,
        keyConcerns: analysis.keyConcerns
      }
    });

  } catch (error) {
    console.error('Analysis creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing applicationId parameter' },
        { status: 400 }
      );
    }

    const analyses = await prisma.financingAnalysis.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ analyses });

  } catch (error) {
    console.error('Analysis fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
