Oldingi yaratilgan CRM dizaynni quyidagi talablar asosida yaxshilang va to‘ldiring.

UMUMIY TALABLAR

1. Tizimda 3 xil rol mavjud:

* Agent
* Dostavka (Courier)
* Admin

2. Har bir rol uchun:

* Light theme
* Dark theme

3. Valyuta ko‘rinishi:
   Summalar "2.1M" kabi emas, balki to‘liq ko‘rinishda bo‘lishi kerak.

Masalan:
2 100 000 so'm
360 000 so'm

4. Til tizimi:

* O‘zbek (lotin)
* O‘zbek (kiril)
* Rus

---

AGENT MOBIL ILOVASI O‘ZGARTIRISHLARI

PASTDAGI NAVBAR

Navbar quyidagilardan iborat bo‘lsin:

* Bosh sahifa
* Klientlar
* Mahsulotlar
* Zakazlar

---

ZAKAZLAR SAHIFASI (MUHIM O‘ZGARISHLAR)

Avvalgi "Barchasi / Yangi / Qabul qilindi" filtrlarini olib tashlang.

Uning o‘rniga:

1. Yuqori qismda KALENDAR bo‘lsin.

2. Foydalanuvchi kalendardan kun tanlaydi.

Masalan:
14-mart

Shunda shu kunda olingan zakazlar chiqadi.

Zakaz kartasida:

* klient nomi
* zakaz ID
* sana
* zakaz summasi
* mahsulotlar ro‘yxati

Klient nomiga bosilganda:

ORDER DETAILS sahifasi ochiladi.

Unda:

* mahsulotlar
* miqdor
* narx

ko‘rinadi.

Agar zakaz hali omborga yuborilmagan bo‘lsa:

EDIT qilish mumkin.

---

OMBORGA YUBORISH

Har bir zakazda quyidagi tugma bo‘lsin:

"Omborga yuborish"

Bosilganda:

* zakaz adminga yuboriladi
* zakaz statusi "Yuborildi" bo‘ladi
* undan keyin zakazni o‘zgartirib bo‘lmaydi

---

YANGI ZAKAZ YARATISH

"+ Yangi zakaz" tugmasi bosilganda quyidagi jarayon bo‘lsin:

1. Avval KUN tanlanadi

Masalan:

* Barchasi
* Dushanba
* Seshanba
* Chorshanba
* Payshanba
* Juma
* Shanba

2. Kun tanlangandan keyin shu kunda boriladigan klientlar chiqadi.

3. Klient ichiga kirilganda mahsulotlar ro‘yxati chiqadi.

Mahsulot kartasi:

Coca-Cola 0.5L

Miqdor tanlash:

[-] 0 [+]

Foydalanuvchi miqdorni qo‘lda ham yozishi mumkin.

Masalan:
12 dona

Mahsulotlar "yashik" emas, "dona" bilan hisoblanadi.

---

MAHSULOT QIDIRISH

Zakaz yaratish sahifasida:

Search bar bo‘lishi kerak.

Foydalanuvchi mahsulot nomini yozib qidirishi mumkin.

---

ZAKAZ TASDIQLASH

"Tayyor" tugmasi bosilganda:

Zakaz saqlanadi.

Va u avtomatik:

Pastdagi navbar → Zakazlar sahifasiga tushadi.

---

KLIENT QO‘SHISH

Yangi klient qo‘shishda quyidagi maydonlar bo‘lsin:

* Do‘kon nomi
* Telefon
* Manzil

Qo‘shimcha maydon:

"Qaysi kuni boriladi"

Kun tanlash:

* Dushanba
* Seshanba
* Chorshanba
* Payshanba
* Juma
* Shanba

---

GPS LOKATSIYA

"GPS orqali lokatsiya olish" bosilganda:

Xarita ochiladi.

Foydalanuvchi xaritadan joyni tanlaydi.

Tanlangan lokatsiya saqlanadi.

---

ADMIN PANEL QO‘SHIMCHALARI

Admin panel quyidagilarni ko‘rsatishi kerak:

1. Agentlar statistikasi

Har bir agent bo‘yicha:

* qancha zakaz olgan
* qancha mahsulot sotgan
* umumiy savdo summasi

2. Zakazlar monitoringi

Admin ko‘ra oladi:

* qaysi agent
* qaysi klient
* qaysi kunda
* qaysi mahsulotlardan
* qancha zakaz olgan

3. Ombor paneli

Agent yuborgan zakazlar:

"Ombor zakazlari"

Admin:

* zakazni qabul qiladi
* dostavkaga beradi

4. Hisobotlar

Kalendardan tanlab:

* kunlik
* haftalik
* oylik

hisobotlar ko‘rinadi.

5. Export

Excel export bo‘lishi kerak.

---

UX TALABLAR

* Agent zakazni tez yaratishi kerak
* 3–4 bosishda zakaz
* Katta tugmalar
* Minimal dizayn
* Mobile-first

Figma fayl:

* component system
* auto-layout
* responsive
* dark / light theme
* design system
