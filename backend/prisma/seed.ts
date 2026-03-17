import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('1234', 10);
  const adminHash = await bcrypt.hash('admin', 10);

  await prisma.user.upsert({ where: { phone: '998901234567' }, update: {}, create: { name: 'Sardor Toshmatov', phone: '998901234567', role: 'agent', password: hash } });
  await prisma.user.upsert({ where: { phone: '998907654321' }, update: {}, create: { name: 'Dilnoza Yusupova', phone: '998907654321', role: 'agent', password: hash } });
  await prisma.user.upsert({ where: { phone: '998901112233' }, update: {}, create: { name: 'Bobur Karimov', phone: '998901112233', role: 'agent', password: hash } });
  await prisma.user.upsert({ where: { phone: '998909998877' }, update: {}, create: { name: 'Jasur Razzaqov', phone: '998909998877', role: 'delivery', password: hash } });
  await prisma.user.upsert({ where: { phone: '998908887766' }, update: {}, create: { name: 'Sanjar Mirzayev', phone: '998908887766', role: 'delivery', password: hash } });
  await prisma.user.upsert({ where: { phone: '998900001122' }, update: {}, create: { name: 'Aziz Xasanov', phone: '998900001122', role: 'admin', password: adminHash } });

  const agent1 = await prisma.user.findUnique({ where: { phone: '998901234567' } });
  if (agent1 && (await prisma.client.count()) === 0) {
    await prisma.client.createMany({
      data: [
        { name: 'Bek Supermarket', phone: '+998901010101', address: 'Toshkent, Chilonzor, 4-kvartal', lat: 41.2995, lng: 69.2401, agentId: agent1.id, visitDays: '["du","ch","sh"]' },
        { name: "Hamza Do'kon", phone: '+998902020202', address: 'Toshkent, Yunusobod, Amir Temur', lat: 41.3456, lng: 69.2870, agentId: agent1.id, visitDays: '["se","pa","sh"]' },
        { name: 'Sarvar Market', phone: '+998903030303', address: "Toshkent, Mirzo Ulug'bek", lat: 41.32, lng: 69.31, agentId: agent1.id, visitDays: '["du","ju","sh"]' },
      ],
    });
  }

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
