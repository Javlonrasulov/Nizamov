#!/bin/bash
# Xavfsiz deploy: izoh (comment) bilan
set -e
cd /var/www/nizamov

echo "1. Git pull..."
git fetch origin
git reset --hard origin/main

echo "2. DB sync (prisma db push)..."
cd backend
npx prisma db push
npx prisma generate

echo "3. Backend build..."
npm run build

echo "4. Web build..."
cd ..
npm run build

echo "5. Restart backend..."
pm2 restart crm-backend

echo "6. Tekshiruv..."
sleep 3
HTTP=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/orders 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  echo "OK: API 200"
else
  echo "XATO: API $HTTP - pm2 logs crm-backend --lines 50"
  pm2 logs crm-backend --lines 20 --nostream
  exit 1
fi
