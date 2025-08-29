const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = "toha";
  const password = "toha123"; // Temporary password, user should change this
  const email = "toha@example.com"; // Placeholder email
  const role = "approver";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    let employee = await prisma.employee.findUnique({
      where: {
        name: username,
      },
    });

    if (employee) {
      // Update existing employee
      employee = await prisma.employee.update({
        where: {
          id: employee.id,
        },
        data: {
          password: hashedPassword,
          role: role,
        },
      });
      console.log(`Updated employee '${username}' with role '${role}'.`);
    } else {
      // Create new employee
      employee = await prisma.employee.create({
        data: {
          name: username,
          email: email,
          password: hashedPassword,
          role: role,
        },
      });
      console.log(`Created new employee '${username}' with role '${role}'.`);
    }
  } catch (e) {
    console.error("Error creating/updating employee:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
