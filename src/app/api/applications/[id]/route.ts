import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single application by ID
export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = params;

    const application = await prisma.financingApplication.findUnique({
      where: { id },
      include: {
        client: true,
        documents: true,
        subFinancingAnalysis: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error(`Error fetching application:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE an application by ID
export async function DELETE(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = params;

    await prisma.financingApplication.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting application:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT (Update) an application by ID
export async function PUT(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = params;
    const updatedData = await request.json();

    const application = await prisma.financingApplication.update({
      where: { id },
      data: {
        // Update fields based on your FinancingApplication schema
        // Example fields (you'll need to map all relevant fields from updatedData)
        fullName: updatedData.fullName,
        birthPlace: updatedData.birthPlace,
        birthDate: new Date(updatedData.birthDate),
        gender: updatedData.gender,
        maritalStatus: updatedData.maritalStatus,
        education: updatedData.education,
        occupation: updatedData.occupation,
        monthlyIncome: parseFloat(updatedData.monthlyIncome),
        spouseName: updatedData.spouseName || null,
        spouseOccupation: updatedData.spouseOccupation || null,
        spouseIncome: updatedData.spouseIncome ? parseFloat(updatedData.spouseIncome) : null,
        homeAddress: updatedData.homeAddress,
        phoneNumber: updatedData.phoneNumber,
        contact1: updatedData.contact1 || null,
        contact2: updatedData.contact2 || null,
        contact3: updatedData.contact3 || null,
        contact4: updatedData.contact4 || null,
        contact5: updatedData.contact5 || null,
        businessName: updatedData.businessName || null,
        businessType: updatedData.businessType || null,
        businessAddress: updatedData.businessAddress || null,
        businessDuration: updatedData.businessDuration ? (parseInt(updatedData.businessDuration) * 12) : null, // Convert years to months
        businessIncome: updatedData.businessIncome ? parseFloat(updatedData.businessIncome) : null,
        loanAmount: parseFloat(updatedData.loanAmount),
        loanPurpose: updatedData.loanPurpose,
        loanTerm: parseInt(updatedData.loanTerm),
        collateral: updatedData.collateral || null,
        // status: updatedData.status, // Consider if status should be updated via this form
      },
    });

    // Optionally update related client data if needed
    if (updatedData.client) {
      await prisma.client.update({
        where: { id: application.clientId },
        data: {
          name: updatedData.client.name,
          email: updatedData.client.email,
          phone: updatedData.client.phone,
          address: updatedData.homeAddress, // Assuming homeAddress is client's address
        },
      });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error(`Error updating application:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}