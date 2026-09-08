import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`DELETE FROM product_images WHERE imageType = 'VIEW_360'`;
  console.log('Deleted VIEW_360 images');
}

main().catch(console.error).finally(() => prisma.$disconnect());
