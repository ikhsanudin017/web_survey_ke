const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createEmployees() {
  const employeesToCreate = [
    { email: 'sayudi@example.com', name: 'Sayudi', password: 'sayudi123', position: 'Analyst' },
    { email: 'upik@example.com', name: 'Upik', password: 'upik123', position: 'Analyst' },
    { email: 'arwan@example.com', name: 'Arwan', password: 'arwan123', position: 'Analyst' },
    { email: 'winarno@example.com', name: 'Winarno', password: 'winarno123', position: 'Analyst' },
  ];

  try {
    for (const emp of employeesToCreate) {
      const hashedPassword = await bcrypt.hash(emp.password, 12);
      
      // Check if employee already exists to avoid duplicates
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: emp.email }
      });

      if (existingEmployee) {
        console.log(`Employee ${emp.name} (${emp.email}) already exists. Skipping creation.`);
        continue;
      }

      const employee = await prisma.employee.create({
        data: {
          email: emp.email,
          password: hashedPassword,
          name: emp.name,
          position: emp.position
        }
      });
      console.log(`Employee ${emp.name} (${emp.email}) created successfully. ID: ${employee.id}`);
    }
  } catch (error) {
    console.error('Error creating employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployees();