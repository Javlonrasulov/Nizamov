import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({ where: { phone: '998900001122' }, update: {}, create: { name: 'Admin', phone: '998900001122', role: 'admin', password: adminHash } });

  const products = [
    { id: 'p1', name: 'Coca-Cola 0.5L (yashik)', price: 85000, cost: 65000, stock: 150 },
    { id: 'p2', name: 'Pepsi 1L (yashik)', price: 95000, cost: 72000, stock: 200 },
    { id: 'p3', name: 'Sprite 0.5L (yashik)', price: 80000, cost: 62000, stock: 180 },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  const defaultCategories = [
    { id: 'warehouse', label: 'Ombor', iconName: 'Building2', color: 'blue' },
    { id: 'transport', label: 'Transport', iconName: 'Truck', color: 'purple' },
    { id: 'salary', label: 'Maosh', iconName: 'Users', color: 'green' },
    { id: 'other', label: 'Boshqa', iconName: 'Package', color: 'gray' },
  ];
  for (const cat of defaultCategories) {
    await prisma.expenseCategory.upsert({ where: { id: cat.id }, update: {}, create: cat });
  }

  console.log('Seed tamom.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
