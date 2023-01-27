import { PrismaClient } from '@prisma/client';

import { seeder as productSeeder } from './seeds/products';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('>> Reseting the database...');

  await Promise.all([
    prisma.cart.deleteMany(),
    prisma.order.deleteMany(),
    prisma.category.deleteMany(),
    prisma.attribute.deleteMany(),
    prisma.variantImage.deleteMany(),
  ]);

  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
}

async function main() {
  await resetDatabase();

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
