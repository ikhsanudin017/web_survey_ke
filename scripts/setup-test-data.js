const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    // Check if test employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: 'employee@test.com' }
    });

    if (!existingEmployee) {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create test employee
      const employee = await prisma.employee.create({
        data: {
          email: 'employee@test.com',
          password: hashedPassword,
          name: 'Test Employee',
          position: 'Analyst'
        }
      });
      
      console.log('✅ Test employee created successfully:');
      console.log('   Email: employee@test.com');
      console.log('   Password: password123');
      console.log('   Employee ID:', employee.id);
    } else {
      console.log('✅ Test employee already exists');
    }

    // Create a test application if none exist
    const applicationCount = await prisma.application.count();
    if (applicationCount === 0) {
      const testApplication = await prisma.application.create({
        data: {
          clientName: 'Test Client',
          clientEmail: 'client@test.com',
          loanAmount: 50000,
          purpose: 'Business expansion',
          status: 'PENDING',
          documents: JSON.stringify([
            { type: 'business_plan', url: '/uploads/test-business-plan.pdf' },
            { type: 'financial_statements', url: '/uploads/test-financials.pdf' }
          ])
        }
      });
      console.log('✅ Test application created:', testApplication.id);
    }

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
