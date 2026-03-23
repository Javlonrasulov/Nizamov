# CRM Backend — NestJS + Prisma + PostgreSQL

REST API: React (veb + mobil) ilova uchun.

## Stack

- **Node.js** + **NestJS**
- **PostgreSQL**
- **Prisma ORM**

## Oʻrnatish

```bash
cd backend
npm install
```

## Maʼlumotlar bazasi

1. PostgreSQL ishlatiling (lokal yoki server).
2. `.env` yarating (`.env.example` dan nusxa oling):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/crm_db?schema=public"
```

3. Migratsiya va seed:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Ishga tushirish

```bash
npm run start:dev
```

API: **http://localhost:3000**

## API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/auth/login` | Kirish (phone, password, role) |
| GET | `/users` | Foydalanuvchilar (ixtiyoriy ?role=) |
| GET | `/users/:id` | Bitta user |
| GET | `/clients` | Klientlar (?agentId=) |
| POST | `/clients` | Klient qoʻshish |
| GET | `/clients/:id` | Bitta klient |
| PUT | `/clients/:id` | Klient yangilash |
| DELETE | `/clients/:id` | Klient oʻchirish |
| GET | `/products` | Mahsulotlar |
| POST | `/products` | Mahsulot qoʻshish |
| GET | `/products/:id` | Bitta mahsulot |
| PUT | `/products/:id` | Mahsulot yangilash |
| GET | `/orders` | Zakazlar (?agentId= & ?deliveryId= & ?dateFrom= & ?dateTo=) |
| POST | `/orders` | Zakaz yaratish |
| GET | `/orders/:id` | Bitta zakaz |
| PUT | `/orders/:id` | Zakaz (status, deliveryId, deliveryName) |
| GET | `/expenses` | Chiqimlar (?dateFrom= & ?dateTo=) |
| POST | `/expenses` | Chiqim qoʻshish |
| DELETE | `/expenses/:id` | Chiqim oʻchirish |
| GET | `/expenses/categories` | Kategoriyalar |
| POST | `/expenses/categories` | Kategoriya qoʻshish |
| PUT | `/expenses/categories/:id` | Kategoriya yangilash |
| DELETE | `/expenses/categories/:id` | Kategoriya oʻchirish |

## Demo login (seed dan keyin)

- Agent: `+998901234567` / `1234`
- Dostavchik: `+998909998877` / `1234`
- Admin: `+998900001122` / `admin`

(Telefon raqamni ixtiyoriy formatda yuborish mumkin; backend faqat raqamlarni oladi.)
