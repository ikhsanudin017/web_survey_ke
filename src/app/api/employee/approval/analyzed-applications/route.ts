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
