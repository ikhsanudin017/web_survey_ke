import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaveAnalysisRequestSchema } from '@/lib/validations/unified-enhanced-analysis';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = SaveAnalysisRequestSchema.parse(body);

    const {
      applicationId,
      applicantId,
      step,
      data,
      isDraft = true
    } = validatedData;

    // Check if analysis already exists
    const existingAnalysis = await prisma.enhancedAnalysis.findFirst({
      where: {
        applicationId,
        applicantId
      }
    });

    let analysis;
    if (existingAnalysis) {
      // Update existing analysis
      analysis = await prisma.enhancedAnalysis.update({
        where: { id: existingAnalysis.id },
        data: {
          step,
          data: {
            ...(existingAnalysis.data as any),
            ...data
          },
          isDraft,
          updatedBy: userId
        }
      });
    } else {
      // Create new analysis
      analysis = await prisma.enhancedAnalysis.create({
        data: {
          applicationId,
          applicantId,
          step,
          data,
          isDraft,
          createdBy: userId,
          updatedBy: userId
        }
      });
    }

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      step: analysis.step,
      nextStep: step < 5 ? step + 1 : undefined
    });

  } catch (error) {
    console.error('Error saving enhanced analysis:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      errors: ['Internal server error']
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const applicantId = searchParams.get('applicantId');

    if (!applicationId || !applicantId) {
      return NextResponse.json({
        error: 'applicationId and applicantId are required'
      }, { status: 400 });
    }

    const analysis = await prisma.enhancedAnalysis.findFirst({
      where: {
        applicationId,
        applicantId
      }
    });

    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        step: analysis.step,
        data: analysis.data,
        isDraft: analysis.isDraft,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching enhanced analysis:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
