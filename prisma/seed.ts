import { PrismaClient } from '@prisma/client';

import { seeder as productSeeder } from './seeds/products';

const prisma = new PrismaClient();
async function main() {
  await productSeeder(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });