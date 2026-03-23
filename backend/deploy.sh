#!/bin/bash
# Serverda backend yangilash uchun skript
# Qanday ishlatish: ssh user@server "cd /path/to/backend && bash deploy.sh"
# Yoki serverga kirib: cd /path/to/backend && bash deploy.sh

set -e
echo "=== Backend yangilanishi boshlanmoqda ==="

# 1. Git'dan yangi kod
git pull origin main || git pull origin master || true

# 2. Ketma-ketlik
npm install

# 3. Prisma client generatsiya
npx prisma generate

# 4. Migratsiyalarni qo'llash (comment ustuni va boshqalar)
npx prisma migrate deploy

# 5. Build
npm run build

# 6. Restart (pm2 ishlatilsa)
if command -v pm2 &> /dev/null; then
  pm2 restart crm-backend || pm2 restart all
  echo "=== pm2 orqali qayta ishga tushirildi ==="
else
  echo "=== pm2 topilmadi. Serverni qo'lda qayta ishga tushiring ==="
fi

echo "=== Yangilanish tugadi ==="
