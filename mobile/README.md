# CRM Mobile — Agent va Delivery ilovasi

Bu loyiha **agent** va **dostavchik** (delivery) uchun mobil Android ilovasi. Asosiy CRM veb-ilovasidan ajratilgan, alohida `mobile/` papkasida.

## Texnologiyalar

- React 18, TypeScript, Vite 6
- Tailwind CSS 4
- React Router 7
- **Capacitor 6** — Android ilova (WebView)

## Ishga tushirish

### 1. Oʻrnatish

```bash
cd mobile
npm install
```

### 2. Brauzerda ishlatish (dev)

```bash
npm run dev
```

### 3. Production build

```bash
npm run build
```

### 4. Android ilova

Build qilingan `dist/` ni Android loyihasiga nusxalash va Android Studio’da ochish:

```bash
npm run build
npx cap sync android
npx cap open android
```

Yoki bitta buyruq:

```bash
npm run android
```

**Agar terminalda `JAVA_HOME is not set` xabari chiqsa:** Android Studio ni oching → **File → Open** → `mobile/android` papkasini tanlang → **Run** (yashil tugma) bosing. Emulator yoki telefon tanlang.

## Tuzilish

- **Login** — faqat **Agent** va **Dostavchik** rollari (admin vebda).
- **Agent** — Dashboard, klientlar, mahsulotlar, zakaz yaratish, zakazlar tarixi.
- **Delivery** — Dashboard, mening zakazlarim, zakaz tafsiloti, xarita, profil.

## Demo kirish

- **Agent:** +998901234567 / 1234  
- **Dostavchik:** +998909998877 / 1234  

## Backend ulanishi

Ilova backendga ulanadi. `mobile/.env` da:

- **Android emulator:** `VITE_API_URL=http://10.0.2.2:3000` (kompyuteringizda backend `npm run start:dev` ishlashi kerak).
- **Haqiqiy telefon:** kompyuter va telefon bir Wi‑Fi da bo‘lishi kerak. `.env` da kompyuteringiz IP ni yozing: `VITE_API_URL=http://192.168.x.x:3000`. Keyin `npm run build` va `npx cap sync android` qiling.

Mahsulotlar sahifasida "Backend ulanadi" / "Backend ulanmadi" va **Yangilash** tugmasi ko‘rinadi.

## Keyingi qadamlar

- Push-bildirishnomalar (Capacitor Push).
- Ilova ikonkasi va splash ekrani sozlash (`android/app/src/main/res/`).
