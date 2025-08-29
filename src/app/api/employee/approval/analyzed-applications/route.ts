import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only approver 'toha' can view approval queue
    if ((session.user as any).id !== 'toha' || (session.user as any).role !== 'approver') {
      return NextResponse.json({ error: 'Forbidden: hanya user "toha" yang dapat melihat daftar persetujuan.' }, { status: 403 });
    }

    // Fetch applications that have been analyzed and are waiting for approval
    const applications = await prisma.financingApplication.findMany({
      where: {
        status: {
          in: ['ANALYZED', 'APPROVED', 'REJECTED']
        }
      },
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        },
        financingAnalysis: {
          select: {
            id: true,
            kesimpulan_rekomendasi: true,
            petugasSurvei: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching analyzed applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
