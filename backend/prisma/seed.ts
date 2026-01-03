import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@hrms.local';
  const employeeEmail = 'employee@hrms.local';

  const adminPwd = await bcrypt.hash('Admin@123', 10);
  const empPwd = await bcrypt.hash('Employee@123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPwd,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: employeeEmail },
    update: {},
    create: {
      email: employeeEmail,
      passwordHash: empPwd,
      role: Role.EMPLOYEE,
    },
  });

  console.log('Seed complete: admin and employee users created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
