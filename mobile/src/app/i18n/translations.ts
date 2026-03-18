export type Language = 'uz_lat' | 'uz_kir' | 'ru';

type TranslationKeys = {
  // Common
  'common.brandName': string;
  'common.serverConnected': string;
  'common.serverDisconnected': string;
  'common.continue': string;
  'common.dashboard': string;
  'common.clients': string;
  'common.products': string;
  'common.orders': string;
  'common.profile': string;
  'common.search': string;
  'common.save': string;
  'common.cancel': string;
  'common.add': string;
  'common.back': string;
  'common.edit': string;
  'common.delete': string;
  'common.total': string;
  'common.date': string;
  'common.phone': string;
  'common.address': string;
  'common.name': string;
  'common.status': string;
  'common.actions': string;
  'common.export': string;
  'common.filter': string;
  'common.all': string;
  'common.refresh': string;
  'common.loading': string;
  'common.confirm': string;
  'common.logout': string;
  'common.sum': string;
  'common.pcs': string;
  'common.map': string;
  'common.reports': string;

  // Login
  'login.title': string;
  'login.subtitle': string;
  'login.phone': string;
  'login.password': string;
  'login.button': string;
  'login.role': string;
  'login.role.agent': string;
  'login.role.delivery': string;
  'login.role.admin': string;
  'login.phone.placeholder': string;
  'login.password.placeholder': string;

  // Status badges
  'status.new': string;
  'status.accepted': string;
  'status.delivering': string;
  'status.delivered': string;
  'status.cancelled': string;

  // Agent Dashboard
  'agent.dashboard.title': string;
  'agent.dashboard.todayOrders': string;
  'agent.dashboard.todaySales': string;
  'agent.dashboard.quickActions': string;
  'agent.dashboard.newOrder': string;
  'agent.dashboard.addClient': string;
  'agent.dashboard.greeting': string;

  // Clients
  'clients.title': string;
  'clients.search': string;
  'clients.countSuffix': string;
  'clients.ordersTitle': string;
  'clients.calendar.pickFirstDay': string;
  'clients.calendar.pickLastDay': string;
  'clients.calendar.noOrders': string;
  'clients.calendar.noOrdersHint': string;
  'clients.add.shopNameLabel': string;
  'clients.add.shopNamePlaceholder': string;
  'clients.add.addressPlaceholder': string;
  'clients.add.visitDaysLabel': string;
  'clients.add.visitDaysHint': string;
  'clients.add.selectedDays': string;
  'clients.add.locationSelect': string;
  'clients.add.locationSelectedEdit': string;
  'clients.add.locationView': string;
  'clients.add.savedTitle': string;
  'clients.add.savedSubtitle': string;
  'clients.validation.nameRequired': string;
  'clients.validation.phoneRequired': string;
  'clients.validation.addressRequired': string;
  'clients.add': string;
  'clients.empty': string;
  'clients.form.title': string;
  'clients.form.name': string;
  'clients.form.phone': string;
  'clients.form.address': string;
  'clients.form.location': string;
  'clients.form.locationBtn': string;
  'clients.form.locationSuccess': string;

  // Products
  'products.title': string;
  'products.price': string;
  'products.stock': string;
  'products.cost': string;
  'products.search': string;
  'products.add': string;

  // Orders
  'orders.title': string;
  'orders.create': string;
  'orders.id': string;
  'orders.client': string;
  'orders.agent': string;
  'orders.delivery': string;
  'orders.items': string;
  'orders.summary': string;
  'orders.selectClient': string;
  'orders.selectProducts': string;
  'orders.confirmOrder': string;
  'orders.step1': string;
  'orders.step2': string;
  'orders.step3': string;
  'orders.quantity': string;
  'orders.totalAmount': string;
  'orders.success': string;
  'orders.empty': string;
  'orders.history': string;
  'orders.backToList': string;
  'orders.selectDay': string;
  'orders.allDays': string;
  'orders.clientsCount': string;
  'orders.noClientsForDay': string;
  'orders.pickAnotherDay': string;
  'orders.selectedCount': string;
  'orders.continue': string;
  'orders.backToOrders': string;
  'orders.ordersCountSuffix': string;
  'orders.today': string;
  'orders.clear': string;
  'orders.pickDay': string;
  'orders.notFoundTitle': string;
  'orders.notFoundText': string;
  'orders.stockLabel': string;
  'orders.totalLabel': string;
  'orders.productsCount': string;
  'orders.no': string;
  'orders.yesSend': string;

  // Days
  'days.all': string;
  'days.monday': string;
  'days.tuesday': string;
  'days.wednesday': string;
  'days.thursday': string;
  'days.friday': string;
  'days.saturday': string;
  'days.sunday': string;
  'days.monday.short': string;
  'days.tuesday.short': string;
  'days.wednesday.short': string;
  'days.thursday.short': string;
  'days.friday.short': string;
  'days.saturday.short': string;
  'days.sunday.short': string;

  // Agent Order new features
  'orders.sendToWarehouse': string;
  'orders.sentToWarehouse': string;
  'orders.selectDay': string;
  'orders.orderDetail': string;
  'orders.cannotEdit': string;
  'orders.tayyor': string;
  'orders.noOrdersForDay': string;
  'orders.searchProduct': string;
  'orders.pcs': string;

  // Client visit days
  'clients.form.visitDays': string;

  // Status sent
  'status.sent': string;
  'status.tayyorlanmagan': string;
  'status.yuborilgan': string;

  // Delivery
  'delivery.title': string;
  'delivery.myOrders': string;
  'delivery.orderDetail': string;
  'delivery.startRoute': string;
  'delivery.delivered': string;
  'delivery.notDelivered': string;
  'delivery.mapView': string;
  'delivery.changeStatus': string;
  'delivery.clientLocation': string;
  'delivery.openMaps': string;
  'delivery.stat.active': string;
  'delivery.stat.pending': string;
  'delivery.stat.todayTotal': string;
  'delivery.stat.info': string;
  'delivery.stat.noOrders': string;
  'delivery.stat.waitOrders': string;

  // Admin
  'admin.dashboard': string;
  'admin.todayOrders': string;
  'admin.monthOrders': string;
  'admin.totalSales': string;
  'admin.profit': string;
  'admin.dailyOrders': string;
  'admin.salesByProduct': string;
  'admin.agentStats': string;
  'admin.agentName': string;
  'admin.todaySales': string;
  'admin.monthlySales': string;
  'admin.ordersCount': string;
  'admin.itemsSold': string;
  'admin.agentSalesChart': string;
  'admin.ordersPage': string;
  'admin.clientsPage': string;
  'admin.productsPage': string;
  'admin.agentsPage': string;
  'admin.reportsPage': string;
  'admin.salePrice': string;
  'admin.costPrice': string;
  'admin.warehouseQty': string;
  'admin.dateRange': string;
  'admin.exportExcel': string;
  'admin.addProduct': string;
  'admin.addAgent': string;
  'admin.salesByAgent': string;

  // Admin Reports page
  'admin.reports.totalExpense': string;
  'admin.reports.netProfit': string;
  'admin.reports.avgOrder': string;
  'admin.reports.expenses': string;
  'admin.reports.records': string;
  'admin.reports.addExpense': string;
  'admin.reports.categories': string;
  'admin.reports.manageCategories': string;
  'admin.reports.catCount': string;
  'admin.reports.amount': string;
  'admin.reports.category': string;
  'admin.reports.comment': string;
  'admin.reports.addExpenseBtn': string;
  'admin.reports.saved': string;
  'admin.reports.catStats': string;
  'admin.reports.share': string;
  'admin.reports.noExpenses': string;
  'admin.reports.noExpensesForPeriod': string;
  'admin.reports.addExpenseHint': string;
  'admin.reports.dailySales': string;
  'admin.reports.dailyReport': string;
  'admin.reports.sales': string;
  'admin.reports.profit22': string;
  'admin.reports.noData': string;
  'admin.reports.selectDateHint': string;
  'admin.reports.allTimeReport': string;
  'admin.reports.catName': string;
  'admin.reports.catIcon': string;
  'admin.reports.catColor': string;
  'admin.reports.newCatName': string;
  'admin.reports.catPlaceholder': string;
  'admin.reports.newCategory': string;
  'admin.reports.close': string;
  'admin.reports.totalExpenseRow': string;
  'admin.reports.totalSales': string;
  'admin.reports.dailyExpense': string;
  'admin.reports.dailyExpenseDesc': string;
  'admin.reports.incomeVsExpense': string;
  'admin.reports.incomeVsExpenseDesc': string;

  // Suppliers
  'admin.suppliers': string;
  'admin.suppliers.add': string;
  'admin.suppliers.name': string;
  'admin.suppliers.phone': string;
  'admin.suppliers.debt': string;
  'admin.suppliers.lastPayment': string;
  'admin.suppliers.lastDelivery': string;
  'admin.suppliers.comment': string;
  'admin.suppliers.profile': string;
  'admin.suppliers.totalReceived': string;
  'admin.suppliers.totalPaid': string;
  'admin.suppliers.remainingDebt': string;
  'admin.suppliers.products': string;
  'admin.suppliers.addProduct': string;
  'admin.suppliers.payments': string;
  'admin.suppliers.addPayment': string;
  'admin.suppliers.productName': string;
  'admin.suppliers.costPrice': string;
  'admin.suppliers.salePrice': string;
  'admin.suppliers.quantity': string;
  'admin.suppliers.totalSum': string;
  'admin.suppliers.paymentType': string;
  'admin.suppliers.cash': string;
  'admin.suppliers.card': string;
  'admin.suppliers.bank': string;
  'admin.suppliers.address': string;
  'admin.suppliers.noSuppliers': string;
  'admin.suppliers.noProducts': string;
  'admin.suppliers.noPayments': string;
  'admin.suppliers.search': string;
  'admin.suppliers.selectSupplier': string;

  // Warehouse
  'admin.warehouse': string;
  'admin.warehouse.productName': string;
  'admin.warehouse.totalIn': string;
  'admin.warehouse.totalSold': string;
  'admin.warehouse.remaining': string;
  'admin.warehouse.salePrice': string;
  'admin.warehouse.costPrice': string;
  'admin.warehouse.profit': string;
  'admin.warehouse.noProducts': string;
};

const uz_lat: TranslationKeys = {
  'common.brandName': 'Sainur CRM',
  'common.serverConnected': "Serverga ulandi",
  'common.serverDisconnected': 'Ulanmagan',
  'common.continue': 'Davom etish',
  'common.dashboard': 'Bosh sahifa',
  'common.clients': 'Klientlar',
  'common.products': 'Mahsulotlar',
  'common.orders': 'Zakazlar',
  'common.profile': 'Profil',
  'common.search': 'Qidiruv',
  'common.save': 'Saqlash',
  'common.cancel': 'Bekor qilish',
  'common.add': "Qo'shish",
  'common.back': 'Orqaga',
  'common.edit': 'Tahrirlash',
  'common.delete': "O'chirish",
  'common.total': 'Jami',
  'common.date': 'Sana',
  'common.phone': 'Telefon',
  'common.address': 'Manzil',
  'common.name': 'Ism',
  'common.status': 'Status',
  'common.actions': 'Amallar',
  'common.export': 'Export',
  'common.filter': 'Filter',
  'common.all': 'Barchasi',
  'common.refresh': 'Yangilash',
  'common.loading': 'Yuklanmoqda...',
  'common.confirm': 'Tasdiqlash',
  'common.logout': 'Chiqish',
  'common.sum': "so'm",
  'common.pcs': 'ta',
  'common.map': 'Xarita',
  'common.reports': 'Hisobotlar',

  'login.title': 'Sainur CRM',
  'login.subtitle': 'Mahsulot distribyutorlari uchun',
  'login.phone': 'Telefon raqam',
  'login.password': 'Parol',
  'login.button': 'Kirish',
  'login.role': 'Rolni tanlang',
  'login.role.agent': 'Agent',
  'login.role.delivery': 'Dostavchik',
  'login.role.admin': 'Admin',
  'login.phone.placeholder': '+998 90 123 45 67',
  'login.password.placeholder': 'Parolni kiriting',

  'status.new': 'Yangi',
  'status.accepted': 'Qabul qilindi',
  'status.delivering': 'Yetkazilmoqda',
  'status.delivered': 'Yetkazildi',
  'status.cancelled': 'Bekor qilindi',

  'agent.dashboard.title': 'Dashboard',
  'agent.dashboard.todayOrders': 'Bugungi zakazlar',
  'agent.dashboard.todaySales': 'Bugungi savdo',
  'agent.dashboard.quickActions': 'Tezkor amallar',
  'agent.dashboard.newOrder': 'Yangi zakaz',
  'agent.dashboard.addClient': 'Yangi klient',
  'agent.dashboard.greeting': 'Xush kelibsiz',

  'clients.title': 'Klientlar',
  'clients.search': 'Klient qidirish...',
  'clients.countSuffix': 'ta klient',
  'clients.ordersTitle': 'Zakazlar',
  'clients.calendar.pickFirstDay': 'Birinchi kunni tanlang',
  'clients.calendar.pickLastDay': 'Oxirgi kunni tanlang',
  'clients.calendar.noOrders': "Kunni tanlang",
  'clients.calendar.noOrdersHint': "Tanlangan oraliqda zakaz yo'q",
  'clients.add.shopNameLabel': "Do'kon nomi",
  'clients.add.shopNamePlaceholder': "Do'kon yoki klient ismi",
  'clients.add.addressPlaceholder': "Ko'cha, mahalla, tuman",
  'clients.add.visitDaysLabel': 'Qaysi kuni boriladi',
  'clients.add.visitDaysHint': '(bir nechta tanlash mumkin)',
  'clients.add.selectedDays': 'Tanlangan',
  'clients.add.locationSelect': 'Xaritadan lokatsiya tanlash',
  'clients.add.locationSelectedEdit': "Lokatsiya tanlandi — o'zgartirish",
  'clients.add.locationView': "Xaritada ko'rish",
  'clients.add.savedTitle': 'Klient saqlandi!',
  'clients.add.savedSubtitle': "Klientlar ro'yxatiga qaytmoqda...",
  'clients.validation.nameRequired': "Do'kon nomi kiritilishi shart",
  'clients.validation.phoneRequired': 'Telefon kiritilishi shart',
  'clients.validation.addressRequired': 'Manzil kiritilishi shart',
  'clients.add': "Klient qo'shish",
  'clients.empty': "Klientlar topilmadi",
  'clients.form.title': "Yangi klient qo'shish",
  'clients.form.name': 'Ism',
  'clients.form.phone': 'Telefon raqam',
  'clients.form.address': 'Manzil',
  'clients.form.location': 'Lokatsiya',
  'clients.form.locationBtn': 'GPS orqali lokatsiya olish',
  'clients.form.locationSuccess': 'Lokatsiya olindi',

  'products.title': 'Mahsulotlar',
  'products.price': 'Narx',
  'products.stock': 'Ombor',
  'products.cost': 'Tannarx',
  'products.search': 'Mahsulot qidirish...',
  'products.add': "Mahsulot qo'shish",

  'orders.title': 'Zakazlar',
  'orders.create': 'Zakaz yaratish',
  'orders.id': 'Zakaz ID',
  'orders.client': 'Klient',
  'orders.agent': 'Agent',
  'orders.delivery': 'Dostavchik',
  'orders.items': 'Mahsulotlar',
  'orders.summary': 'Zakaz xulosa',
  'orders.selectClient': 'Klient tanlash',
  'orders.selectProducts': 'Mahsulot tanlash',
  'orders.confirmOrder': 'Zakazni tasdiqlash',
  'orders.step1': 'Klient',
  'orders.step2': 'Mahsulotlar',
  'orders.step3': 'Tasdiqlash',
  'orders.quantity': 'Miqdor',
  'orders.totalAmount': 'Jami summa',
  'orders.success': 'Zakaz muvaffaqiyatli yaratildi!',
  'orders.empty': 'Zakazlar topilmadi',
  'orders.history': 'Zakazlar tarixi',
  'orders.backToList': "Zakazlar ro'yxatiga qaytmoqda...",
  'orders.selectDay': 'Kunni tanlang',
  'orders.allDays': 'Barcha kunlar',
  'orders.clientsCount': 'ta klient',
  'orders.noClientsForDay': "Bu kun uchun klientlar yo'q",
  'orders.pickAnotherDay': 'Boshqa kun tanlang',
  'orders.selectedCount': 'ta tanlandi',
  'orders.continue': 'Davom etish',
  'orders.backToOrders': "Zakazlar ro'yxatiga qaytmoqda...",
  'orders.ordersCountSuffix': 'ta zakaz',
  'orders.today': 'Bugun',
  'orders.clear': 'Tozalash',
  'orders.pickDay': 'Kun tanlang',
  'orders.notFoundTitle': 'Zakaz topilmadi',
  'orders.notFoundText': 'Zakaz mavjud emas',
  'orders.stockLabel': 'Ombor',
  'orders.totalLabel': 'Jami',
  'orders.productsCount': 'ta mahsulot',
  'orders.no': "Yo'q",
  'orders.yesSend': 'Ha, yuborish',

  'days.all': 'Barcha kunlar',
  'days.monday': 'Dushanba',
  'days.tuesday': 'Seshanba',
  'days.wednesday': 'Chorshanba',
  'days.thursday': 'Payshanba',
  'days.friday': 'Juma',
  'days.saturday': 'Shanba',
  'days.sunday': 'Yakshanba',
  'days.monday.short': 'Du',
  'days.tuesday.short': 'Se',
  'days.wednesday.short': 'Ch',
  'days.thursday.short': 'Pa',
  'days.friday.short': 'Ju',
  'days.saturday.short': 'Sh',
  'days.sunday.short': 'Ya',

  'orders.sendToWarehouse': 'Omborga yuborish',
  'orders.sentToWarehouse': 'Omborga yuborildi',
  'orders.selectDay': 'Kunni tanlash',
  'orders.orderDetail': 'Zakaz tafsilotlari',
  'orders.cannotEdit': "Tahrirlash mumkin emas",
  'orders.tayyor': 'Tayyor',
  'orders.noOrdersForDay': 'Bu kun uchun zakazlar yo\'q',
  'orders.searchProduct': 'Mahsulot qidirish...',
  'orders.pcs': 'ta',

  'clients.form.visitDays': 'Kunlar',

  'status.sent': 'Yuborildi',
  'status.tayyorlanmagan': 'Tayyorlanmagan',
  'status.yuborilgan': 'Yuborilgan',

  'delivery.title': 'Dostavka',
  'delivery.myOrders': 'Mening zakazlarim',
  'delivery.orderDetail': 'Zakaz tafsilotlari',
  'delivery.startRoute': "Yo'lni boshlash",
  'delivery.delivered': 'Yetkazildi',
  'delivery.notDelivered': 'Yetkazilmadi',
  'delivery.mapView': "Xaritada ko'rish",
  'delivery.changeStatus': "Status o'zgartirish",
  'delivery.clientLocation': 'Klient lokatsiyasi',
  'delivery.openMaps': 'Xaritada ochish',
  'delivery.stat.active': 'Faol',
  'delivery.stat.pending': 'Kutilmoqda',
  'delivery.stat.todayTotal': 'Bugun jami',
  'delivery.stat.info': "Ma'lumotlar",
  'delivery.stat.noOrders': "Bugun zakaz yo'q",
  'delivery.stat.waitOrders': 'Yangi zakazlar tayinlanishini kuting',

  'admin.dashboard': 'Dashboard',
  'admin.todayOrders': 'Bugungi zakazlar',
  'admin.monthOrders': 'Oylik zakazlar',
  'admin.totalSales': 'Umumiy savdo',
  'admin.profit': 'Foyda',
  'admin.dailyOrders': 'Kunlik zakazlar',
  'admin.salesByProduct': "Mahsulotlar bo'yicha savdo",
  'admin.agentStats': 'Agent statistikasi',
  'admin.agentName': 'Agent nomi',
  'admin.todaySales': 'Bugungi savdo',
  'admin.monthlySales': 'Oylik savdo',
  'admin.ordersCount': 'Zakazlar soni',
  'admin.itemsSold': 'Sotilgan mahsulot',
  'admin.agentSalesChart': "Agentlar bo'yicha savdo",
  'admin.ordersPage': 'Zakazlar',
  'admin.clientsPage': 'Klientlar',
  'admin.productsPage': 'Mahsulotlar',
  'admin.agentsPage': 'Agentlar',
  'admin.reportsPage': 'Hisobotlar',
  'admin.salePrice': 'Sotuv narxi',
  'admin.costPrice': 'Tannarx',
  'admin.warehouseQty': 'Ombor miqdori',
  'admin.dateRange': 'Sana oralig\'i',
  'admin.exportExcel': 'Excel export',
  'admin.addProduct': "Mahsulot qo'shish",
  'admin.addAgent': "Agent qo'shish",
  'admin.salesByAgent': "Agentlar bo'yicha savdo",

  // Admin Reports page
  'admin.reports.totalExpense': 'Jami chiqim',
  'admin.reports.netProfit': 'Sof foyda',
  'admin.reports.avgOrder': "O'rtacha zakaz",
  'admin.reports.expenses': 'Chiqimlar',
  'admin.reports.records': 'ta yozuv',
  'admin.reports.addExpense': 'Chiqim kiritish',
  'admin.reports.categories': 'Kategoriyalar',
  'admin.reports.manageCategories': 'Kategoriyalarni boshqarish',
  'admin.reports.catCount': 'ta kategoriya',
  'admin.reports.amount': "Summa (so'm)",
  'admin.reports.category': 'Kategoriya',
  'admin.reports.comment': 'Izoh',
  'admin.reports.addExpenseBtn': "Chiqim qo'shish",
  'admin.reports.saved': 'Saqlandi!',
  'admin.reports.catStats': "Kategoriya bo'yicha statistika",
  'admin.reports.share': 'Ulush',
  'admin.reports.noExpenses': "Chiqim yo'q",
  'admin.reports.noExpensesForPeriod': 'Bu davr uchun chiqim kiritilmagan',
  'admin.reports.addExpenseHint': '"Chiqim kiritish" tugmasini bosing',
  'admin.reports.dailySales': 'Kunlik savdo',
  'admin.reports.dailyReport': 'Kunlik hisobot',
  'admin.reports.sales': 'Savdo',
  'admin.reports.profit22': 'Foyda (22%)',
  'admin.reports.noData': "Bu davr uchun ma'lumot yo'q",
  'admin.reports.selectDateHint': 'Yuqoridagi kalendardan sana tanlang',
  'admin.reports.allTimeReport': 'Barcha vaqt hisobotlari',
  'admin.reports.catName': 'Nomi',
  'admin.reports.catIcon': 'Ikona',
  'admin.reports.catColor': 'Rang',
  'admin.reports.newCatName': 'Yangi kategoriya nomi',
  'admin.reports.catPlaceholder': 'Masalan: Soliq...',
  'admin.reports.newCategory': 'Yangi kategoriya',
  'admin.reports.close': 'Yopish',
  'admin.reports.totalExpenseRow': 'Jami chiqim',
  'admin.reports.totalSales': 'Jami savdo',
  'admin.reports.dailyExpense': 'Kunlik chiqimlar',
  'admin.reports.dailyExpenseDesc': 'Har kuni qancha pul sarflangan',
  'admin.reports.incomeVsExpense': 'Kirim va Chiqim',
  'admin.reports.incomeVsExpenseDesc': 'Kunlik kirim va chiqim taqqoslash',

  // Suppliers
  'admin.suppliers': 'Yetkazib beruvchilar',
  'admin.suppliers.add': "Yetkazib beruvchi qo'shish",
  'admin.suppliers.name': 'Ismi',
  'admin.suppliers.phone': 'Telefon raqami',
  'admin.suppliers.debt': 'Qarzi',
  'admin.suppliers.lastPayment': "Oxirgi to'lov",
  'admin.suppliers.lastDelivery': 'Oxirgi yetkazib berish',
  'admin.suppliers.comment': 'Izoh',
  'admin.suppliers.profile': 'Profil',
  'admin.suppliers.totalReceived': 'Jami mahsulot olingan summa',
  'admin.suppliers.totalPaid': "Jami to'langan pul",
  'admin.suppliers.remainingDebt': 'Qarz qoldiqi',
  'admin.suppliers.products': 'Kelgan mahsulotlar',
  'admin.suppliers.addProduct': "Yangi mahsulot kiritish",
  'admin.suppliers.payments': "Yetkazib beruvchiga to'lovlar",
  'admin.suppliers.addPayment': "To'lov qo'shish",
  'admin.suppliers.productName': 'Mahsulot nomi',
  'admin.suppliers.costPrice': 'Kelgan narxi',
  'admin.suppliers.salePrice': 'Sotish narxi',
  'admin.suppliers.quantity': 'Miqdori',
  'admin.suppliers.totalSum': 'Jami summa',
  'admin.suppliers.paymentType': "To'lov turi",
  'admin.suppliers.cash': 'Naqd pul',
  'admin.suppliers.card': 'Plastik karta',
  'admin.suppliers.bank': 'Bank',
  'admin.suppliers.address': 'Manzil',
  'admin.suppliers.noSuppliers': 'Yetkazib beruvchilar topilmadi',
  'admin.suppliers.noProducts': 'Mahsulotlar topilmadi',
  'admin.suppliers.noPayments': "To'lovlar topilmadi",
  'admin.suppliers.search': 'Yetkazib beruvchi qidirish...',
  'admin.suppliers.selectSupplier': 'Yetkazib beruvchi tanlash',

  // Warehouse
  'admin.warehouse': 'Ombor',
  'admin.warehouse.productName': 'Mahsulot nomi',
  'admin.warehouse.totalIn': 'Jami kirgan',
  'admin.warehouse.totalSold': 'Jami sotilgan',
  'admin.warehouse.remaining': 'Qoldiq',
  'admin.warehouse.salePrice': 'Sotuv narxi',
  'admin.warehouse.costPrice': 'Tannarx',
  'admin.warehouse.profit': 'Foyda',
  'admin.warehouse.noProducts': 'Mahsulotlar topilmadi',
};

const uz_kir: TranslationKeys = {
  'common.brandName': 'Sainur CRM',
  'common.serverConnected': 'Серверга уланди',
  'common.serverDisconnected': 'Уланмаган',
  'common.continue': 'Давом этиш',
  'common.dashboard': 'Бош саҳифа',
  'common.clients': 'Клиентлар',
  'common.products': 'Маҳсулотлар',
  'common.orders': 'Заказлар',
  'common.profile': 'Профил',
  'common.search': 'Қидирув',
  'common.save': 'Сақлаш',
  'common.cancel': 'Бекор қилиш',
  'common.add': 'Қўшиш',
  'common.back': 'Орқага',
  'common.edit': 'Таҳрирлаш',
  'common.delete': 'Ўчириш',
  'common.total': 'Жами',
  'common.date': 'Сана',
  'common.phone': 'Телефон',
  'common.address': 'Манзил',
  'common.name': 'Исм',
  'common.status': 'Статус',
  'common.actions': 'Амаллар',
  'common.export': 'Экспорт',
  'common.filter': 'Фильтр',
  'common.all': 'Барчаси',
  'common.refresh': 'Янгилаш',
  'common.loading': 'Юкланмоқда...',
  'common.confirm': 'Тасдиқлаш',
  'common.logout': 'Чиқиш',
  'common.sum': 'сўм',
  'common.pcs': 'та',
  'common.map': 'Харита',
  'common.reports': 'Ҳисоботлар',

  'login.title': 'Sainur CRM',
  'login.subtitle': 'Маҳсулот дистрибьюторлари учун',
  'login.phone': 'Телефон рақам',
  'login.password': 'Парол',
  'login.button': 'Кириш',
  'login.role': 'Ролни танланг',
  'login.role.agent': 'Агент',
  'login.role.delivery': 'Доставчик',
  'login.role.admin': 'Админ',
  'login.phone.placeholder': '+998 90 123 45 67',
  'login.password.placeholder': 'Паролни киритинг',

  'status.new': 'Янги',
  'status.accepted': 'Қабул қилинди',
  'status.delivering': 'Етказилмоқда',
  'status.delivered': 'Етказилди',
  'status.cancelled': 'Бекор қилинди',

  'agent.dashboard.title': 'Дашборд',
  'agent.dashboard.todayOrders': 'Бугунги заказлар',
  'agent.dashboard.todaySales': 'Бугунги савдо',
  'agent.dashboard.quickActions': 'Тезкор амаллар',
  'agent.dashboard.newOrder': 'Янги заказ',
  'agent.dashboard.addClient': 'Янги клиент',
  'agent.dashboard.greeting': 'Хуш келибсиз',

  'clients.title': 'Клиентлар',
  'clients.search': 'Клиент қидириш...',
  'clients.countSuffix': 'та клиент',
  'clients.ordersTitle': 'Заказлар',
  'clients.calendar.pickFirstDay': 'Биринчи кунни танланг',
  'clients.calendar.pickLastDay': 'Охирги кунни танланг',
  'clients.calendar.noOrders': 'Кунни танланг',
  'clients.calendar.noOrdersHint': 'Танланган оралиқда заказ йўқ',
  'clients.add.shopNameLabel': 'Дўкон номи',
  'clients.add.shopNamePlaceholder': 'Дўкон ёки клиент исми',
  'clients.add.addressPlaceholder': 'Кўча, маҳалла, туман',
  'clients.add.visitDaysLabel': 'Қайси куни борилади',
  'clients.add.visitDaysHint': '(бир нечта танлаш мумкин)',
  'clients.add.selectedDays': 'Танланган',
  'clients.add.locationSelect': 'Харитадан локация танлаш',
  'clients.add.locationSelectedEdit': 'Локация танланди — ўзгартириш',
  'clients.add.locationView': "Харитада кўриш",
  'clients.add.savedTitle': 'Клиент сақланди!',
  'clients.add.savedSubtitle': 'Клиентлар рўйхатига қайтмоқда...',
  'clients.validation.nameRequired': 'Дўкон номи киритилиши шарт',
  'clients.validation.phoneRequired': 'Телефон киритилиши шарт',
  'clients.validation.addressRequired': 'Манзил киритилиши шарт',
  'clients.add': 'Клиент қўшиш',
  'clients.empty': 'Клиентлар топилмади',
  'clients.form.title': 'Янги клиент қўшиш',
  'clients.form.name': 'Исм',
  'clients.form.phone': 'Телефон рақам',
  'clients.form.address': 'Манзил',
  'clients.form.location': 'Локация',
  'clients.form.locationBtn': 'GPS орқали локация олиш',
  'clients.form.locationSuccess': 'Локация олинди',

  'products.title': 'Маҳсулотлар',
  'products.price': 'Нарх',
  'products.stock': 'Омбор',
  'products.cost': 'Таннарх',
  'products.search': 'Маҳсулот қидириш...',
  'products.add': 'Маҳсулот қўшиш',

  'orders.title': 'Заказлар',
  'orders.create': 'Заказ яратиш',
  'orders.id': 'Заказ ID',
  'orders.client': 'Клиент',
  'orders.agent': 'Агент',
  'orders.delivery': 'Доставчик',
  'orders.items': 'Маҳсулотлар',
  'orders.summary': 'Заказ хулоса',
  'orders.selectClient': 'Клиент танлаш',
  'orders.selectProducts': 'Маҳсулот танлаш',
  'orders.confirmOrder': 'Заказни тасдиқлаш',
  'orders.step1': 'Клиент',
  'orders.step2': 'Маҳсулотлар',
  'orders.step3': 'Тасдиқлаш',
  'orders.quantity': 'Миқдор',
  'orders.totalAmount': 'Жами сумма',
  'orders.success': 'Заказ муваффақиятли яратилди!',
  'orders.empty': 'Заказлар топилмади',
  'orders.history': 'Заказлар тарихи',
  'orders.backToList': 'Заказлар рўйхатига қайтмоқда...',
  'orders.selectDay': 'Кунни танланг',
  'orders.allDays': 'Барча кунлар',
  'orders.clientsCount': 'та клиент',
  'orders.noClientsForDay': 'Бу кун учун клиентлар йўқ',
  'orders.pickAnotherDay': 'Бошқа кун танланг',
  'orders.selectedCount': 'та танланди',
  'orders.continue': 'Давом этиш',
  'orders.backToOrders': 'Заказлар рўйхатига қайтмоқда...',
  'orders.ordersCountSuffix': 'та заказ',
  'orders.today': 'Бугун',
  'orders.clear': 'Тозалаш',
  'orders.pickDay': 'Кун танланг',
  'orders.notFoundTitle': 'Заказ топилмади',
  'orders.notFoundText': 'Заказ мавжуд эмас',
  'orders.stockLabel': 'Омбор',
  'orders.totalLabel': 'Жами',
  'orders.productsCount': 'та маҳсулот',
  'orders.no': "Йўқ",
  'orders.yesSend': 'Ҳа, юбориш',

  'days.all': 'Барча кунлар',
  'days.monday': 'Душанба',
  'days.tuesday': 'Сешанба',
  'days.wednesday': 'Чоршанба',
  'days.thursday': 'Пайшанба',
  'days.friday': 'Жума',
  'days.saturday': 'Шанба',
  'days.sunday': 'Якшанба',
  'days.monday.short': 'Ду',
  'days.tuesday.short': 'Се',
  'days.wednesday.short': 'Ч',
  'days.thursday.short': 'Па',
  'days.friday.short': 'Жу',
  'days.saturday.short': 'Ш',
  'days.sunday.short': 'Як',

  'orders.sendToWarehouse': 'Омборга юбориш',
  'orders.sentToWarehouse': 'Омборга юборилди',
  'orders.selectDay': 'Кунни танлаш',
  'orders.orderDetail': 'Заказ тафсилотлари',
  'orders.cannotEdit': 'Таҳрирлаш мумкин эмас',
  'orders.tayyor': 'Тайёр',
  'orders.noOrdersForDay': 'Бу кун учун заказлар йўқ',
  'orders.searchProduct': 'Маҳсулот қидириш...',
  'orders.pcs': 'та',

  'clients.form.visitDays': 'Кунлар',

  'status.sent': 'Юборилди',
  'status.tayyorlanmagan': 'Тайёрланмаган',
  'status.yuborilgan': 'Юборилган',

  'delivery.title': 'Доставка',
  'delivery.myOrders': 'Менинг заказларим',
  'delivery.orderDetail': 'Заказ тафсилотлари',
  'delivery.startRoute': 'Йўлни бошлаш',
  'delivery.delivered': 'Етказилди',
  'delivery.notDelivered': 'Етказилмади',
  'delivery.mapView': 'Харитада кўриш',
  'delivery.changeStatus': "Статусни ўзгартириш",
  'delivery.clientLocation': 'Клиент локацияси',
  'delivery.openMaps': 'Харитада очиш',
  'delivery.stat.active': 'Фаол',
  'delivery.stat.pending': 'Кутилмоқда',
  'delivery.stat.todayTotal': 'Бугун жами',
  'delivery.stat.info': 'Маълумотлар',
  'delivery.stat.noOrders': 'Бугун заказ йўқ',
  'delivery.stat.waitOrders': 'Янги заказлар тайинланишини кутинг',

  'admin.dashboard': 'Дашборд',
  'admin.todayOrders': 'Бугунги заказлар',
  'admin.monthOrders': 'Ойлик заказлар',
  'admin.totalSales': 'Умумий савдо',
  'admin.profit': 'Фойда',
  'admin.dailyOrders': 'Кунлик заказлар',
  'admin.salesByProduct': 'Маҳсулотлар бўйича савдо',
  'admin.agentStats': 'Агент статистиаси',
  'admin.agentName': 'Агент номи',
  'admin.todaySales': 'Бугунги савдо',
  'admin.monthlySales': 'Ойлик савдо',
  'admin.ordersCount': 'Заказлар сони',
  'admin.itemsSold': 'Сотилган маҳсулот',
  'admin.agentSalesChart': 'Агентлар бўйича савдо',
  'admin.ordersPage': 'Заказлар',
  'admin.clientsPage': 'Клиентлар',
  'admin.productsPage': 'Маҳсулотлар',
  'admin.agentsPage': 'Агентлар',
  'admin.reportsPage': 'Ҳисоботлар',
  'admin.salePrice': 'Сотув нархи',
  'admin.costPrice': 'Таннарх',
  'admin.warehouseQty': 'Омбор миқдори',
  'admin.dateRange': 'Сана оралиғи',
  'admin.exportExcel': 'Excel экспорт',
  'admin.addProduct': 'Маҳсулот қўшиш',
  'admin.addAgent': 'Агент қўшиш',
  'admin.salesByAgent': 'Агентлар бўйича савдо',

  // Admin Reports page
  'admin.reports.totalExpense': 'Жами чиқим',
  'admin.reports.netProfit': 'Соф фойда',
  'admin.reports.avgOrder': 'Ўртача заказ',
  'admin.reports.expenses': 'Чиқимлар',
  'admin.reports.records': 'та ёзув',
  'admin.reports.addExpense': 'Чиқим киритиш',
  'admin.reports.categories': 'Категориялар',
  'admin.reports.manageCategories': 'Категорияларни бошқариш',
  'admin.reports.catCount': 'та категория',
  'admin.reports.amount': 'Сумма (сўм)',
  'admin.reports.category': 'Категория',
  'admin.reports.comment': 'Изоҳ',
  'admin.reports.addExpenseBtn': 'Чиқим қўшиш',
  'admin.reports.saved': 'Сақланди!',
  'admin.reports.catStats': 'Категория бўйича статистика',
  'admin.reports.share': 'Улуш',
  'admin.reports.noExpenses': 'Чиқим йўқ',
  'admin.reports.noExpensesForPeriod': 'Бу давр учун чиқим киритилмаган',
  'admin.reports.addExpenseHint': '"Чиқим киритиш" тугмасини босинг',
  'admin.reports.dailySales': 'Кунлик савдо',
  'admin.reports.dailyReport': 'Кунлик ҳисобот',
  'admin.reports.sales': 'Савдо',
  'admin.reports.profit22': 'Фойда (22%)',
  'admin.reports.noData': 'Бу давр учун маълумот йўқ',
  'admin.reports.selectDateHint': 'Юқоридаги календардан сана танланг',
  'admin.reports.allTimeReport': 'Барча вақт ҳисоботлари',
  'admin.reports.catName': 'Номи',
  'admin.reports.catIcon': 'Иконка',
  'admin.reports.catColor': 'Ранг',
  'admin.reports.newCatName': 'Янги категория номи',
  'admin.reports.catPlaceholder': 'Масалан: Солиқ...',
  'admin.reports.newCategory': 'Янги категория',
  'admin.reports.close': 'Ёпиш',
  'admin.reports.totalExpenseRow': 'Жами чиқим',
  'admin.reports.totalSales': 'Жами савдо',
  'admin.reports.dailyExpense': 'Кунлик чиқимлар',
  'admin.reports.dailyExpenseDesc': 'Ҳар куни қанча пул сарфланган',
  'admin.reports.incomeVsExpense': 'Кирим ва Чиқим',
  'admin.reports.incomeVsExpenseDesc': 'Кунлик кирим ва чиқим таққослаш',

  // Suppliers
  'admin.suppliers': 'Етказиб берувчилар',
  'admin.suppliers.add': 'Етказиб берувчи қўшиш',
  'admin.suppliers.name': 'Исми',
  'admin.suppliers.phone': 'Телефон рақами',
  'admin.suppliers.debt': 'Қарзи',
  'admin.suppliers.lastPayment': 'Охирги тўлов',
  'admin.suppliers.lastDelivery': 'Охирги етказиб бериш',
  'admin.suppliers.comment': 'Изоҳ',
  'admin.suppliers.profile': 'Профил',
  'admin.suppliers.totalReceived': 'Жами маҳсулот олинган сумма',
  'admin.suppliers.totalPaid': 'Жами тўланган пул',
  'admin.suppliers.remainingDebt': 'Қарз қолдиқи',
  'admin.suppliers.products': 'Келган маҳсулотлар',
  'admin.suppliers.addProduct': 'Янги маҳсулот киритиш',
  'admin.suppliers.payments': 'Етказиб берувчига тўловлар',
  'admin.suppliers.addPayment': 'Тўлов қўшиш',
  'admin.suppliers.productName': 'Маҳсулот номи',
  'admin.suppliers.costPrice': 'Келган нархи',
  'admin.suppliers.salePrice': 'Сотиш нархи',
  'admin.suppliers.quantity': 'Миқдори',
  'admin.suppliers.totalSum': 'Жами сумма',
  'admin.suppliers.paymentType': 'Тўлов тури',
  'admin.suppliers.cash': 'Нақд пул',
  'admin.suppliers.card': 'Пластик карта',
  'admin.suppliers.bank': 'Банк',
  'admin.suppliers.address': 'Манзил',
  'admin.suppliers.noSuppliers': 'Етказиб берувчилар топилмади',
  'admin.suppliers.noProducts': 'Маҳсулотлар топилмади',
  'admin.suppliers.noPayments': 'Тўловлар топилмади',
  'admin.suppliers.search': 'Етказиб берувчи қидириш...',
  'admin.suppliers.selectSupplier': 'Етказиб берувчи танлаш',

  // Warehouse
  'admin.warehouse': 'Омбор',
  'admin.warehouse.productName': 'Маҳсулот номи',
  'admin.warehouse.totalIn': 'Жами кирган',
  'admin.warehouse.totalSold': 'Жами сотилган',
  'admin.warehouse.remaining': 'Қолдиқ',
  'admin.warehouse.salePrice': 'Сотув нархи',
  'admin.warehouse.costPrice': 'Таннарх',
  'admin.warehouse.profit': 'Фойда',
  'admin.warehouse.noProducts': 'Маҳсулотлар топилмади',
};

const ru: TranslationKeys = {
  'common.brandName': 'Sainur CRM',
  'common.serverConnected': 'Подключено к серверу',
  'common.serverDisconnected': 'Нет соединения',
  'common.dashboard': 'Главная',
  'common.clients': 'Клиенты',
  'common.products': 'Товары',
  'common.orders': 'Заказы',
  'common.profile': 'Профиль',
  'common.search': 'Поиск',
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.add': 'Добавить',
  'common.back': 'Назад',
  'common.edit': 'Редактировать',
  'common.delete': 'Удалить',
  'common.total': 'Итого',
  'common.date': 'Дата',
  'common.phone': 'Телефон',
  'common.address': 'Адрес',
  'common.name': 'Имя',
  'common.status': 'Статус',
  'common.actions': 'Действия',
  'common.export': 'Экспорт',
  'common.filter': 'Фильтр',
  'common.all': 'Все',
  'common.refresh': 'Обновить',
  'common.loading': 'Загрузка...',
  'common.confirm': 'Подтвердить',
  'common.logout': 'Выйти',
  'common.sum': 'сум',
  'common.pcs': 'шт',
  'common.map': 'Карта',
  'common.reports': 'Отчёты',

  'login.title': 'Sainur CRM',
  'login.subtitle': 'Для дистрибьюторов продукции',
  'login.phone': 'Номер телефона',
  'login.password': 'Пароль',
  'login.button': 'Войти',
  'login.role': 'Выберите роль',
  'login.role.agent': 'Агент',
  'login.role.delivery': 'Доставщик',
  'login.role.admin': 'Администратор',
  'login.phone.placeholder': '+998 90 123 45 67',
  'login.password.placeholder': 'Введите пароль',

  'status.new': 'Новый',
  'status.accepted': 'Принят',
  'status.delivering': 'Доставляется',
  'status.delivered': 'Доставлен',
  'status.cancelled': 'Отменён',

  'agent.dashboard.title': 'Главная',
  'agent.dashboard.todayOrders': 'Сегодняшние заказы',
  'agent.dashboard.todaySales': 'Сегодняшние продажи',
  'agent.dashboard.quickActions': 'Быстрые действия',
  'agent.dashboard.newOrder': 'Новый заказ',
  'agent.dashboard.addClient': 'Добавить клиента',
  'agent.dashboard.greeting': 'Добро пожаловать',

  'clients.title': 'Клиенты',
  'clients.search': 'Поиск клиента...',
  'clients.countSuffix': 'клиентов',
  'clients.ordersTitle': 'Заказы',
  'clients.calendar.pickFirstDay': 'Выберите первый день',
  'clients.calendar.pickLastDay': 'Выберите последний день',
  'clients.calendar.noOrders': 'Выберите день',
  'clients.calendar.noOrdersHint': 'За выбранный период заказов нет',
  'clients.add.shopNameLabel': 'Название магазина',
  'clients.add.shopNamePlaceholder': 'Имя магазина или клиента',
  'clients.add.addressPlaceholder': 'Улица, махалля, район',
  'clients.add.visitDaysLabel': 'День визита',
  'clients.add.visitDaysHint': '(можно выбрать несколько)',
  'clients.add.selectedDays': 'Выбрано',
  'clients.add.locationSelect': 'Выбрать локацию на карте',
  'clients.add.locationSelectedEdit': 'Локация выбрана — изменить',
  'clients.add.locationView': 'Показать на карте',
  'clients.add.savedTitle': 'Клиент сохранён!',
  'clients.add.savedSubtitle': 'Возвращаемся к списку клиентов...',
  'clients.validation.nameRequired': 'Название магазина обязательно',
  'clients.validation.phoneRequired': 'Телефон обязателен',
  'clients.validation.addressRequired': 'Адрес обязателен',
  'clients.add': 'Добавить клиента',
  'clients.empty': 'Клиенты не найдены',
  'clients.form.title': 'Добавить нового клиента',
  'clients.form.name': 'Имя',
  'clients.form.phone': 'Номер телефона',
  'clients.form.address': 'Адрес',
  'clients.form.location': 'Локация',
  'clients.form.locationBtn': 'Получить локацию через GPS',
  'clients.form.locationSuccess': 'Локация получена',

  'products.title': 'Товары',
  'products.price': 'Цена',
  'products.stock': 'Склад',
  'products.cost': 'Себестоимость',
  'products.search': 'Поиск товара...',
  'products.add': 'Добавить товар',

  'orders.title': 'Заказы',
  'orders.create': 'Создать заказ',
  'orders.id': 'ID заказа',
  'orders.client': 'Клиент',
  'orders.agent': 'Агент',
  'orders.delivery': 'Доставщик',
  'orders.items': 'Товары',
  'orders.summary': 'Итог заказа',
  'orders.selectClient': 'Выбрать клиента',
  'orders.selectProducts': 'Выбрать товары',
  'orders.confirmOrder': 'Подтвердить заказ',
  'orders.step1': 'Клиент',
  'orders.step2': 'Товары',
  'orders.step3': 'Подтверждение',
  'orders.quantity': 'Количество',
  'orders.totalAmount': 'Общая сумма',
  'orders.success': 'Заказ успешно создан!',
  'orders.empty': 'Заказы не найдены',
  'orders.history': 'История заказов',

  'days.all': 'Все дни',
  'days.monday': 'Понедельник',
  'days.tuesday': 'Вторник',
  'days.wednesday': 'Среда',
  'days.thursday': 'Четверг',
  'days.friday': 'Пятница',
  'days.saturday': 'Суббота',
  'days.monday.short': 'Пн',
  'days.tuesday.short': 'Вт',
  'days.wednesday.short': 'Ср',
  'days.thursday.short': 'Чт',
  'days.friday.short': 'Пт',
  'days.saturday.short': 'Сб',
  'days.sunday': 'Воскресенье',
  'days.sunday.short': 'Вс',

  'orders.sendToWarehouse': 'Отправить на склад',
  'orders.sentToWarehouse': 'Отправлено на склад',
  'orders.selectDay': 'Выберите день',
  'orders.allDays': 'Все дни',
  'orders.clientsCount': 'клиентов',
  'orders.noClientsForDay': 'Нет клиентов на этот день',
  'orders.pickAnotherDay': 'Выберите другой день',
  'orders.selectedCount': 'выбрано',
  'orders.continue': 'Далее',
  'orders.backToOrders': 'Возвращаемся к списку заказов...',
  'orders.ordersCountSuffix': 'заказ(ов)',
  'orders.today': 'Сегодня',
  'orders.clear': 'Очистить',
  'orders.pickDay': 'Выберите день',
  'orders.notFoundTitle': 'Заказ не найден',
  'orders.notFoundText': 'Заказ отсутствует',
  'orders.stockLabel': 'Склад',
  'orders.totalLabel': 'Итого',
  'orders.productsCount': 'товаров',
  'orders.no': 'Нет',
  'orders.yesSend': 'Да, отправить',
  'orders.orderDetail': 'Детали заказа',
  'orders.cannotEdit': 'Редактирование невозможно',
  'orders.tayyor': 'Готово',
  'orders.noOrdersForDay': 'Заказов на этот день нет',
  'orders.searchProduct': 'Поиск товара...',
  'orders.pcs': 'шт',

  'clients.form.visitDays': 'Дни визитов',

  'status.sent': 'Отправлено',
  'status.tayyorlanmagan': 'Не подготовлен',
  'status.yuborilgan': 'Отправлен',

  'delivery.title': 'Доставка',
  'delivery.myOrders': 'Мои заказы',
  'delivery.orderDetail': 'Детали заказа',
  'delivery.startRoute': 'Начать маршрут',
  'delivery.delivered': 'Доставлен',
  'delivery.notDelivered': 'Не доставлен',
  'delivery.mapView': 'Показать на карте',
  'delivery.changeStatus': 'Изменить статус',
  'delivery.clientLocation': 'Локация клиента',
  'delivery.openMaps': 'Открыть в картах',
  'delivery.stat.active': 'Активные',
  'delivery.stat.pending': 'Ожидание',
  'delivery.stat.todayTotal': 'Сегодня итого',
  'delivery.stat.info': 'Информация',
  'delivery.stat.noOrders': 'Сегодня заказов нет',
  'delivery.stat.waitOrders': 'Ожидайте назначения новых заказов',

  'admin.dashboard': 'Главная',
  'admin.todayOrders': 'Сегодняшние заказы',
  'admin.monthOrders': 'Ежемесячные заказы',
  'admin.totalSales': 'Общие продажи',
  'admin.profit': 'Прибыль',
  'admin.dailyOrders': 'Ежедневные заказы',
  'admin.salesByProduct': 'Продажи по товарам',
  'admin.agentStats': 'Статистика агентов',
  'admin.agentName': 'Имя агента',
  'admin.todaySales': 'Продажи сегодня',
  'admin.monthlySales': 'Продажи за месяц',
  'admin.ordersCount': 'Количество заказов',
  'admin.itemsSold': 'Продано товаров',
  'admin.agentSalesChart': 'Продажи по агентам',
  'admin.ordersPage': 'Заказы',
  'admin.clientsPage': 'Клиенты',
  'admin.productsPage': 'Товары',
  'admin.agentsPage': 'Агенты',
  'admin.reportsPage': 'Отчёты',
  'admin.salePrice': 'Цена продажи',
  'admin.costPrice': 'Себестоимсть',
  'admin.warehouseQty': 'Коичество на складе',
  'admin.dateRange': 'Диапазон дат',
  'admin.exportExcel': 'Экспорт Excel',
  'admin.addProduct': 'Добавить товар',
  'admin.addAgent': 'Добавить агента',
  'admin.salesByAgent': 'Продажи по агентам',

  // Admin Reports page
  'admin.reports.totalExpense': 'Общие расходы',
  'admin.reports.netProfit': 'Чистая прибыль',
  'admin.reports.avgOrder': 'Средний заказ',
  'admin.reports.expenses': 'Расходы',
  'admin.reports.records': 'записей',
  'admin.reports.addExpense': 'Добавить расход',
  'admin.reports.categories': 'Категории',
  'admin.reports.manageCategories': 'Управление категориями',
  'admin.reports.catCount': 'категорий',
  'admin.reports.amount': 'Сумма (сум)',
  'admin.reports.category': 'Категория',
  'admin.reports.comment': 'Комментарий',
  'admin.reports.addExpenseBtn': 'Добавить расход',
  'admin.reports.saved': 'Сохранено!',
  'admin.reports.catStats': 'Статистика по категориям',
  'admin.reports.share': 'Доля',
  'admin.reports.noExpenses': 'Расходов нет',
  'admin.reports.noExpensesForPeriod': 'За этот период расходов нет',
  'admin.reports.addExpenseHint': 'Нажмите кнопку "Добавить расход"',
  'admin.reports.dailySales': 'Ежедневные продажи',
  'admin.reports.dailyReport': 'Ежедневный отчёт',
  'admin.reports.sales': 'Продажи',
  'admin.reports.profit22': 'Прибыль (22%)',
  'admin.reports.noData': 'Данных за этот период нет',
  'admin.reports.selectDateHint': 'Выберите дату в календаре выше',
  'admin.reports.allTimeReport': 'Отчёты за всё время',
  'admin.reports.catName': 'Название',
  'admin.reports.catIcon': 'Иконка',
  'admin.reports.catColor': 'Цвет',
  'admin.reports.newCatName': 'Название новой категории',
  'admin.reports.catPlaceholder': 'Например: Налог...',
  'admin.reports.newCategory': 'Новая категория',
  'admin.reports.close': 'Закрыть',
  'admin.reports.totalExpenseRow': 'Итого расходов',
  'admin.reports.totalSales': 'Общие продажи',
  'admin.reports.dailyExpense': 'Ежедневные расходы',
  'admin.reports.dailyExpenseDesc': 'Сколько потрачено каждый день',
  'admin.reports.incomeVsExpense': 'Доходы и Расходы',
  'admin.reports.incomeVsExpenseDesc': 'Сравнение доходов и расходов по дням',

  // Suppliers
  'admin.suppliers': 'Поставщики',
  'admin.suppliers.add': 'Добавить поставщика',
  'admin.suppliers.name': 'Имя',
  'admin.suppliers.phone': 'Номер телефона',
  'admin.suppliers.debt': 'Долг',
  'admin.suppliers.lastPayment': 'Последний платёж',
  'admin.suppliers.lastDelivery': 'Последняя доставка',
  'admin.suppliers.comment': 'Комментарий',
  'admin.suppliers.profile': 'Профиль',
  'admin.suppliers.totalReceived': 'Всего получено',
  'admin.suppliers.totalPaid': 'Всего оплачено',
  'admin.suppliers.remainingDebt': 'Остаток долга',
  'admin.suppliers.products': 'Товары',
  'admin.suppliers.addProduct': 'Добавить товар',
  'admin.suppliers.payments': 'Платежи',
  'admin.suppliers.addPayment': 'Добавить платеж',
  'admin.suppliers.productName': 'Название товара',
  'admin.suppliers.costPrice': 'Закупочная цена',
  'admin.suppliers.salePrice': 'Цена продажи',
  'admin.suppliers.quantity': 'Количество',
  'admin.suppliers.totalSum': 'Общая сумма',
  'admin.suppliers.paymentType': 'Тип платежа',
  'admin.suppliers.cash': 'Наличные',
  'admin.suppliers.card': 'Карта',
  'admin.suppliers.bank': 'Банк',
  'admin.suppliers.address': 'Адрес',
  'admin.suppliers.noSuppliers': 'Поставщики не найдены',
  'admin.suppliers.noProducts': 'Товары не найдены',
  'admin.suppliers.noPayments': 'Платежи не найдены',
  'admin.suppliers.search': 'Поиск поставщика...',
  'admin.suppliers.selectSupplier': 'Выберите поставщика',

  // Warehouse
  'admin.warehouse': 'Склад',
  'admin.warehouse.productName': 'Название товара',
  'admin.warehouse.totalIn': 'Всего поступило',
  'admin.warehouse.totalSold': 'Всего продано',
  'admin.warehouse.remaining': 'Остаток',
  'admin.warehouse.salePrice': 'Цена продажи',
  'admin.warehouse.costPrice': 'Закупочная цена',
  'admin.warehouse.profit': 'Прибыль',
  'admin.warehouse.noProducts': 'Товары не найдены',
};

export const translations: Record<Language, TranslationKeys> = {
  uz_lat,
  uz_kir,
  ru,
};

export const languageLabels: Record<Language, string> = {
  uz_lat: "O'zbek (lotin)",
  uz_kir: 'Ўзбек (кирил)',
  ru: 'Русский',
};