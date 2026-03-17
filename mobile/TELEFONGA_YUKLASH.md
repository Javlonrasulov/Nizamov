# Agent va Dostavkachi ilovasini telefonga yuklash

## 1-usul: Brauzer orqali (tezkor sinash)

Kompyuter va telefon **bir xil Wi‑Fi** da bo‘lishi kerak.

1. Kompyuterdagi **backend** ishlashi kerak:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Mobil ilova**ni ishga tushiring:
   ```bash
   cd mobile
   npm run dev
   ```

3. Terminalda chiqadigan **manzilni** ko‘ring, masalan:
   ```
   ➜  Local:   http://localhost:5174/
   ➜  Network: http://192.168.1.105:5174/
   ```

4. Telefonda **brauzer**ni oching (Chrome, Safari va h.k.) va **Network** manzilini kiriting:
   - `http://192.168.1.105:5174` (o‘rniga o‘zingizning kompyuter IP manzilingiz bo‘ladi).

5. **Backend** kompyuteringizda ishlayotgan bo‘lsa, telefonda ilova API ni topishi uchun `mobile` papkada `.env` yarating va kompyuteringiz IP sini yozing:
   ```
   VITE_API_URL=http://192.168.1.105:3000
   ```
   Keyin `npm run dev` ni qayta ishga tushiring. (192.168.1.105 o‘rniga o‘z IP ingiz — terminalda Network manzilida ko‘rsatiladi.)

6. Sahifani **“Uyga qo‘shish”** / **“Add to Home screen”** qilsangiz, uy ekranida ilova ikonkasi chiqadi (PWA tarzida).

**Kamchiligi:** Kompyuter va mobil ilova (dev server) doim ishlab turishi kerak; internet faqat backend uchun kerak bo‘lsa, kompyuter va telefon bir tarmoqda bo‘lishi yetadi.

---

## 2-usul: Android APK (haqiqiy ilova)

Telefonga **APK** o‘rnatish uchun **Android Studio** va **Android SDK** o‘rnatilgan bo‘lishi kerak.

### Birinchi marta sozlash

1. **Android Studio** o‘rnating: https://developer.android.com/studio  
2. **Java (JDK 17)** o‘rnatilgan bo‘lishi kerak (Android Studio bilan keladi).

### Har safar yangi APK yasash

1. **Backend** ni ishlatishingiz kerak bo‘lsa, u ishlab tursin (yoki keyin server manzilini ilovada sozlaysiz).

2. Mobil loyihada build qiling:
   ```bash
   cd mobile
   npm run build
   npx cap sync android
   ```

3. Android Studio da oching:
   ```bash
   npx cap open android
   ```

4. Android Studio da:
   - **Build → Build Bundle(s) / APK(s) → Build APK(s)** tanlang.
   - Tugagach **locate** orqali APK fayl ochiladi (masalan: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`).

5. Bu **app-debug.apk** ni telefonga yuboring (Telegram, USB, Google Drive va h.k.) va telefonda faylni ochib o‘rnating.

**Eslatma:** Debug APK faqat sinov uchun. Do‘kon uchun **signed release** APK yasash kerak (Build → Generate Signed Bundle / APK).

---

## Backend manzili (ilova qayerda API chaqarishi)

Agar backend boshqa kompyuter yoki serverda bo‘lsa, mobil ilovadagi API **base URL** ni o‘sha manzilga yo‘naltirish kerak (masalan `mobile/src/app/api/client.ts` ichida yoki `.env` orqali).
