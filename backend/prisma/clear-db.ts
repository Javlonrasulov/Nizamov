/**
 * Barcha ma'lumotlarni tozalaydi. Faqat admin login va parol saqlanadi.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // FK qoidalariga muvofiq tartibda o'chirish
  await prisma.returnItem.deleteMany();
  await prisma.return.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.client.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.supplierStockInItem.deleteMany();
  await prisma.supplierStockIn.deleteMany();
  await prisma.supplierPayment.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.expenseCategory.deleteMany();

  // Admindan tashqari barcha userlarni o'chirish
  await prisma.user.deleteMany({ where: { role: { not: 'admin' } } });

  console.log('Baza tozalandi. Faqat admin saqlandi.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
