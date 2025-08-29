import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only user "toha" (approver) can approve/reject
    if ((session.user as any).id !== 'toha' || (session.user as any).role !== 'approver') {
      return NextResponse.json({ error: 'Forbidden: hanya user "toha" yang dapat melakukan persetujuan.' }, { status: 403 });
    }

    const { applicationId, decision, note } = await request.json();

    if (!applicationId || !decision || !note) {
      return NextResponse.json(
        { error: 'Application ID, decision, and note are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Ensure employee exists and fetch by ID (email might be undefined for credentials login)
    try {
      await prisma.employee.upsert({
        where: { id: (session.user as any).id },
        update: {
          name: (session.user as any).name ?? (session.user as any).id,
          role: (session.user as any).role ?? 'employee',
        },
        create: {
          id: (session.user as any).id,
          email: `${(session.user as any).id}@local`,
          password: 'local',
          name: (session.user as any).name ?? (session.user as any).id,
          role: (session.user as any).role ?? 'employee',
        },
      });
    } catch (e) {
      console.error('Failed to upsert employee before approval:', e);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update the application status
    const updatedApplication = await prisma.financingApplication.update({
      where: { id: applicationId },
      data: {
        status: decision,
        updatedAt: new Date()
      },
      include: {
        client: true,
        financingAnalysis: true
      }
    });

    // Create approval record (you can add this table to schema if needed)
    // For now, we'll just update the financing analysis with approval info
    if (updatedApplication.financingAnalysis) {
      await prisma.financingAnalysis.update({
        where: { id: updatedApplication.financingAnalysis.id },
        data: {
          approver: employee.name,
          kesimpulan_catatanKhusus: `${updatedApplication.financingAnalysis.kesimpulan_catatanKhusus || ''}\n\nKeputusan: ${decision}\nCatatan Persetujuan: ${note}\nDisetujui oleh: ${employee.name}\nTanggal: ${new Date().toLocaleDateString('id-ID')}`
        }
      });
    }

    // Here you could also send notifications to the client
    // await sendNotificationToClient(updatedApplication.client.email, decision, note);

    return NextResponse.json({
      success: true,
      message: `Application ${decision.toLowerCase()} successfully`,
      application: updatedApplication
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error processing approval decision:', message, error);
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
