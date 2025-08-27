import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, note } = await request.json();
    const applicationId = id;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update the application status
    const updatedApplication = await prisma.financingApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        updatedAt: new Date()
      },
    });

    // Create a status history record (optional - for tracking)
    // You can add this if you want to track status changes
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        status,
        note: note || '',
        changedBy: session.user.id,
        changedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
