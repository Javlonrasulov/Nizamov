export type Language = 'uz_lat' | 'uz_kir' | 'ru';

type TranslationKeys = {
  // Common
  'common.brandName': string;
  'common.adminPanel': string;
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
  'common.print': string;
  'common.select': string;
  'common.loading': string;
  'common.confirm': string;
  'common.logout': string;
  'common.sum': string;
  'common.pcs': string;
  'common.map': string;
  'common.reports': string;
  'common.optional': string;
  'common.collapse': string;
  'common.expand': string;
  'common.stockLevel.sufficient': string;
  'common.stockLevel.medium': string;
  'common.stockLevel.low': string;

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
  'login.role.sklad': string;
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

  // Payments / Debts
  'payments.in.title': string;
  'payments.method': string;
  'payments.method.cash': string;
  'payments.method.terminal': string;
  'payments.method.transfer': string;
  'payments.amount': string;
  'payments.amount.placeholder': string;
  'payments.saved': string;
  'payments.badge.paid': string;
  'payments.badge.debt': string;
  'payments.clientDebt': string;
  'payments.history': string;
  'payments.collectedBy': string;
  'payments.paid': string;

  // Admin orders
  'admin.orders.deliveredDebt': string;
  'admin.orders.netTotal': string;

  // Admin clients
  'admin.clients.debtorsOnly': string;

  // Clients
  'clients.title': string;
  'clients.search': string;
  'clients.add': string;
  'clients.empty': string;
  'clients.form.title': string;
  'clients.form.name': string;
  'clients.form.phone': string;
  'clients.form.address': string;
  'clients.form.location': string;
  'clients.form.locationBtn': string;
  'clients.form.locationSuccess': string;
  
  // MapPicker
  'mapPicker.title': string;
  'mapPicker.searchPlaceholder': string;
  'mapPicker.myLocation': string;
  'mapPicker.hintPickOnMap': string;
  'mapPicker.mapLoading': string;
  'mapPicker.confirmLocation': string;
  'mapPicker.selectLocation': string;

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
  'orders.comment': string;
  'orders.commentPlaceholder': string;
  'orders.success': string;
  'orders.empty': string;
  'orders.history': string;
  'orders.today': string;

  // Days
  'days.all': string;
  'days.monday': string;
  'days.tuesday': string;
  'days.wednesday': string;
  'days.thursday': string;
  'days.friday': string;
  'days.saturday': string;
  'days.monday.short': string;
  'days.tuesday.short': string;
  'days.wednesday.short': string;
  'days.thursday.short': string;
  'days.friday.short': string;
  'days.saturday.short': string;

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

  // Status sent / tayyorlanmagan
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
  'admin.profilePage': string;
  'admin.profile.title': string;
  'admin.profile.subtitle': string;
  'admin.profile.save': string;
  'admin.profile.saving': string;
  'admin.profile.savedOk': string;
  'admin.profile.savedLocal': string;
  'admin.profile.saveError': string;
  'admin.profile.needLogin': string;
  'admin.profile.account': string;
  'admin.profile.accountHint': string;
  'admin.profile.security': string;
  'admin.profile.securityHint': string;
  'admin.profile.newPassword': string;
  'admin.profile.passwordHint': string;
  'admin.profile.role': string;
  'admin.profile.namePlaceholder': string;
  'admin.profile.validation.name': string;
  'admin.profile.validation.phone': string;
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
  'admin.reports.totalDebt': string;
  'admin.reports.totalReturns': string;
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
  'admin.reports.expensesTable': string;

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
  'admin.suppliers.currentSalePrice': string;
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
  'admin.suppliers.edit': string;
  'admin.suppliers.delete': string;
  'admin.suppliers.deleteTitle': string;
  'admin.suppliers.deleteConfirm': string;
  'admin.suppliers.deleted': string;
  'admin.suppliers.updated': string;

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
  'admin.staff.deleteTitle': string;
  'admin.staff.deleteConfirm': string;
  'admin.staff.deleteWarning': string;
  'admin.staff.addVehicle': string;
  'admin.staff.editTitle': string;
  'admin.staff.form.fullName': string;
  'admin.staff.form.phone': string;
  'admin.staff.form.password': string;
  'admin.staff.form.passwordHint': string;
  'admin.staff.form.role': string;
  'admin.staff.form.vehicleLabel': string;
  'admin.staff.form.vehicleSelect': string;
  'admin.staff.form.vehicleOther': string;
  'admin.staff.card.todaySales': string;
  'admin.staff.card.monthSales': string;
  'admin.staff.card.ordersAgent': string;
  'admin.staff.card.ordersDelivery': string;
  'admin.staff.card.itemsAgent': string;
  'admin.staff.card.itemsDelivery': string;

  // Admin date filter
  'admin.dateFilter.label': string;
  'admin.dateFilter.clear': string;
  'admin.dateFilter.from': string;
  'admin.dateFilter.to': string;
  'admin.dateFilter.apply': string;
  'admin.dateFilter.today': string;
  'admin.dateFilter.thisWeek': string;
  'admin.dateFilter.thisMonth': string;
  'admin.dateFilter.all': string;
  'admin.dateFilter.pickStart': string;
  'admin.dateFilter.pickEnd': string;

  // Admin dashboard
  'admin.dashboard.latestOrders': string;
  'admin.dashboard.filteredOrders': string;
  'admin.dashboard.noOrdersForDate': string;
  'admin.dashboard.noChartForDate': string;

  // Admin agent stats
  'admin.agentStats.subtitle': string;
  'admin.agentStats.tableTitle': string;
  'admin.agentStats.periodSalesByAgent': string;
  'admin.agentStats.todaySalesChart': string;
  'admin.agentStats.monthlySalesChart': string;
  'admin.agentStats.totalCompare': string;
  'admin.agentStats.noData': string;
  'admin.agentStats.noDataForPeriod': string;

  // Admin orders
  'admin.orders.searchPlaceholder': string;
  'admin.orders.mapTitle': string;
  'admin.orders.viewItems': string;
  'orders.vehicle': string;

  // Returns
  'returns.title': string;
  'returns.selectClient': string;
  'returns.searchClient': string;
  'returns.onlyOrderedClients': string;
  'returns.selectOrder': string;
  'returns.selectItems': string;
  'returns.returnAll': string;
  'returns.quantity': string;
  'returns.remaining': string;
  'returns.save': string;
  'returns.saved': string;
  'returns.error.noItems': string;
  'returns.error.noOrder': string;
  'returns.allCancelled': string;
  'returns.allCancelledLabel': string;
  'returns.partialCancelled': string;
  'returns.accept': string;
  'returns.pendingReturns': string;
  'returns.returnedProducts': string;
  'returns.sentDate': string;
  'returns.returnedBy': string;
  'returns.deliveryPerson': string;
  'returns.acceptConfirmTitle': string;
  'returns.acceptConfirmMessage': string;
  'returns.acceptConfirmYes': string;
  'returns.acceptConfirmNo': string;
  'returns.acceptedBy': string;
  'returns.comment': string;
  'returns.commentPlaceholder': string;
  'returns.acceptedReturnsHistory': string;
  'returns.deliveredAmount': string;
  'returns.cancelledAmount': string;
  'returns.orderedQty': string;
  'returns.cancelledQty': string;
  'returns.deliveredQty': string;

  // Admin clients
  'admin.clients.searchPlaceholder': string;
  'admin.clients.add': string;
  'admin.clients.notFound': string;
  'admin.clients.addHint': string;
  'admin.clients.allAgents': string;
  'admin.clients.history': string;
  'admin.clients.totalOrders': string;
  'admin.clients.totalAmount': string;
  'admin.clients.average': string;
  'admin.clients.noOrdersYet': string;
  'admin.clients.productsCount': string;
  'admin.clients.agentLabel': string;
  'admin.clients.gpsAvailable': string;
  'admin.clients.gpsCoords': string;
  'admin.clients.unknownAgent': string;
  'admin.clients.editClient': string;
  'admin.clients.addClient': string;
  'admin.clients.deleteTitle': string;
  'admin.clients.deleteConfirm': string;
  'admin.clients.deleteWarning': string;
  'admin.clients.validation.nameRequired': string;
  'admin.clients.validation.phoneRequired': string;
  'admin.clients.validation.addressRequired': string;
  'admin.clients.validation.agentRequired': string;
  'admin.products.product': string;
  'admin.products.profitPercent': string;
  'admin.products.soldQty': string;
  'admin.products.revenue': string;
  'admin.products.empty': string;
  'admin.products.emptyForDate': string;
  'admin.products.editTitle': string;
  'admin.products.editSubtitle': string;
  'admin.products.nameLabel': string;
  'common.view.card': string;
  'common.view.list': string;
};

const uz_lat: TranslationKeys = {
  'common.brandName': 'Sainur CRM',
  'common.adminPanel': 'Admin panel',
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
  'common.print': 'Chop etish',
  'common.select': 'Tanlash',
  'common.loading': 'Yuklanmoqda...',
  'common.confirm': 'Tasdiqlash',
  'common.logout': 'Chiqish',
  'common.sum': "so'm",
  'common.pcs': 'ta',
  'common.map': 'Xarita',
  'common.reports': 'Hisobotlar',
  'common.optional': '(ixtiyoriy)',
  'common.collapse': "Yig'ish",
  'common.expand': 'Kengaytirish',
  'common.stockLevel.sufficient': 'Yetarli',
  'common.stockLevel.medium': "O'rtacha",
  'common.stockLevel.low': 'Kam',

  'login.title': 'Sainur CRM',
  'login.subtitle': 'Mahsulot distribyutorlari uchun',
  'login.phone': 'Telefon raqam',
  'login.password': 'Parol',
  'login.button': 'Kirish',
  'login.role': 'Rolni tanlang',
  'login.role.agent': 'Agent',
  'login.role.delivery': 'Dostavkachi',
  'login.role.admin': 'Direktor',
  'login.role.sklad': 'Skladchi',
  'login.phone.placeholder': '+998 90 123 45 67',
  'login.password.placeholder': 'Parolni kiriting',

  'status.new': 'Yangi',
  'status.accepted': 'Qabul qilindi',
  'status.delivering': 'Yetkazilmoqda',
  'status.cancelled': 'Bekor qilindi',

  'agent.dashboard.title': 'Dashboard',
  'agent.dashboard.todayOrders': 'Bugungi zakazlar',
  'agent.dashboard.todaySales': 'Bugungi savdo',
  'agent.dashboard.quickActions': 'Tezkor amallar',
  'agent.dashboard.newOrder': 'Yangi zakaz',
  'agent.dashboard.addClient': 'Yangi klient',
  'agent.dashboard.greeting': 'Xush kelibsiz',

  'payments.in.title': 'Pul kiritish',
  'payments.method': "To'lov usuli",
  'payments.method.cash': 'Naqd',
  'payments.method.terminal': 'Terminal',
  'payments.method.transfer': "Pul ko'chirish",
  'payments.amount': 'Summa',
  'payments.amount.placeholder': 'Masalan: 100000',
  'payments.saved': 'Saqlandi',
  'payments.badge.paid': 'To‘landi',
  'payments.badge.debt': 'Qarz',
  'payments.clientDebt': 'Qarz',
  'payments.history': 'To‘lovlar tarixi',
  'payments.collectedBy': 'Kim oldi',
  'payments.paid': "To'langan",

  'admin.orders.deliveredDebt': 'Yetkazilgan (qarz)',
  'admin.orders.netTotal': 'Umumiy',
  'admin.clients.debtorsOnly': 'Qarzdorlar',

  'clients.title': 'Klientlar',
  'clients.search': 'Klient qidirish...',
  'clients.add': "Klient qo'shish",
  'clients.empty': "Klientlar topilmadi",
  'clients.form.title': "Yangi klient qo'shish",
  'clients.form.name': 'Ism',
  'clients.form.phone': 'Telefon raqam',
  'clients.form.address': 'Manzil',
  'clients.form.location': 'Lokatsiya',
  'clients.form.locationBtn': 'GPS orqali lokatsiya olish',
  'clients.form.locationSuccess': 'Lokatsiya olindi',
  'mapPicker.title': 'Xaritadan joy tanlash',
  'mapPicker.searchPlaceholder': "Qidiruv: ko'cha, mahalla...",
  'mapPicker.myLocation': 'Mening joylashuvim',
  'mapPicker.hintPickOnMap': '📍 Xaritaga bosib aniq joyni belgilang',
  'mapPicker.mapLoading': 'Xarita yuklanmoqda...',
  'mapPicker.confirmLocation': 'Lokatsiyani tasdiqlash',
  'mapPicker.selectLocation': 'Xaritadan joy tanlang',

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
  'orders.delivery': 'Dostavkachi',
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
  'orders.comment': 'Izoh',
  'orders.commentPlaceholder': "Zakaz uchun izoh yozing",
  'orders.success': 'Zakaz muvaffaqiyatli yaratildi!',
  'orders.empty': 'Zakazlar topilmadi',
  'orders.history': 'Zakazlar tarixi',
  'orders.today': 'Bugun',

  'days.all': 'Barcha kunlar',
  'days.monday': 'Dushanba',
  'days.tuesday': 'Seshanba',
  'days.wednesday': 'Chorshanba',
  'days.thursday': 'Payshanba',
  'days.friday': 'Juma',
  'days.saturday': 'Shanba',
  'days.monday.short': 'Du',
  'days.tuesday.short': 'Se',
  'days.wednesday.short': 'Ch',
  'days.thursday.short': 'Pa',
  'days.friday.short': 'Ju',
  'days.saturday.short': 'Sh',

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
  'status.delivered': 'Yetkazilgan',

  'delivery.title': 'Dostavka',
  'delivery.myOrders': 'Mening zakazlarim',
  'delivery.orderDetail': 'Zakaz tafsilotlari',
  'delivery.startRoute': "Yo'lni boshlash",
  'delivery.delivered': 'Yetkazildi',
  'delivery.notDelivered': 'Yetkazilmadi',
  'delivery.mapView': "Xaritada ko'rish",
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
  'admin.agentsPage': 'Xodimlar',
  'admin.reportsPage': 'Hisobotlar',
  'admin.profilePage': 'Profil',
  'admin.profile.title': 'Profil',
  'admin.profile.subtitle': 'Ism, telefon va parolni o‘zgartiring',
  'admin.profile.save': 'Saqlash',
  'admin.profile.saving': 'Saqlanmoqda...',
  'admin.profile.savedOk': 'Saqlandi',
  'admin.profile.savedLocal': 'Backend ulanmadi — vaqtincha faqat shu brauzerda saqlandi',
  'admin.profile.saveError': 'Saqlashda xatolik',
  'admin.profile.needLogin': 'Iltimos, avval tizimga kiring',
  'admin.profile.account': 'Shaxsiy ma’lumotlar',
  'admin.profile.accountHint': 'Asosiy ma’lumotlaringiz',
  'admin.profile.security': 'Xavfsizlik',
  'admin.profile.securityHint': 'Parolni yangilash',
  'admin.profile.newPassword': 'Yangi parol',
  'admin.profile.passwordHint': 'Bo‘sh qoldirsangiz parol o‘zgarmaydi',
  'admin.profile.role': 'Rol',
  'admin.profile.namePlaceholder': 'Ismingizni kiriting',
  'admin.profile.validation.name': 'Ism kiritilishi shart',
  'admin.profile.validation.phone': 'Telefon raqam kiritilishi shart',
  'admin.salePrice': 'Sotuv narxi',
  'admin.costPrice': 'Tannarx',
  'admin.warehouseQty': 'Ombor miqdori',
  'admin.dateRange': 'Sana oralig\'i',
  'admin.exportExcel': 'Excel export',
  'admin.addProduct': "Mahsulot qo'shish",
  'admin.addAgent': "Xodim qo'shish",
  'admin.salesByAgent': "Agentlar bo'yicha savdo",

  // Admin Reports page
  'admin.reports.totalExpense': 'Jami chiqim',
  'admin.reports.netProfit': 'Sof foyda',
  'admin.reports.avgOrder': "O'rtacha zakaz",
  'admin.reports.totalDebt': 'Qarz summasi',
  'admin.reports.totalReturns': 'Vozvrat summasi',
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
  'admin.reports.profit22': 'Foyda',
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
  'admin.reports.expensesTable': 'Chiqimlar jadvali',

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
  'admin.suppliers.currentSalePrice': 'Hozirgi sotuv narxi',
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
  'admin.suppliers.edit': 'Tahrirlash',
  'admin.suppliers.delete': "O'chirish",
  'admin.suppliers.deleteTitle': "Yetkazib beruvchini o'chirish",
  'admin.suppliers.deleteConfirm': "Rostdan ham o'chirmoqchimisiz? Kirimlar va to'lovlar ham o'chadi.",
  'admin.suppliers.deleted': "O'chirildi",
  'admin.suppliers.updated': 'Yangilandi',

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
  'admin.staff.deleteTitle': "Xodimni o'chirish",
  'admin.staff.deleteConfirm': "Rostdan ham ushbu xodimni o'chirmoqchimisiz?",
  'admin.staff.deleteWarning': "Diqqat: bog'langan ma'lumotlar bo'lsa, o'chirish amalga oshmasligi mumkin.",
  'admin.staff.addVehicle': "Mashina qo'shish",
  'admin.staff.editTitle': 'Xodimni tahrirlash',
  'admin.staff.form.fullName': 'Ism familiya',
  'admin.staff.form.phone': 'Telefon',
  'admin.staff.form.password': 'Parol',
  'admin.staff.form.passwordHint': "(bo'sh qoldiring — o'zgarmaydi)",
  'admin.staff.form.role': 'Lavozim',
  'admin.staff.form.vehicleLabel': 'Moshina',
  'admin.staff.form.vehicleSelect': 'Mashina tanlang',
  'admin.staff.form.vehicleOther': 'Boshqa',
  'admin.staff.card.todaySales': 'Bugungi savdo',
  'admin.staff.card.monthSales': 'Oylik savdo',
  'admin.staff.card.ordersAgent': 'Zakazlar',
  'admin.staff.card.ordersDelivery': 'Yetkazilgan zakazlar',
  'admin.staff.card.itemsAgent': 'Sotildi',
  'admin.staff.card.itemsDelivery': 'Yetkazilgan mahsulot',
  'admin.dateFilter.label': "Sana bo'yicha filter",
  'admin.dateFilter.clear': 'Filterni tozalash',
  'admin.dateFilter.from': 'DAN',
  'admin.dateFilter.to': 'GACHA',
  'admin.dateFilter.apply': "Qo'llash",
  'admin.dateFilter.today': 'Bugun',
  'admin.dateFilter.thisWeek': 'Bu hafta',
  'admin.dateFilter.thisMonth': 'Bu oy',
  'admin.dateFilter.all': 'Barchasi',
  'admin.dateFilter.pickStart': 'Boshlanish sanasini tanlang',
  'admin.dateFilter.pickEnd': 'Tugash sanasini tanlang',
  'admin.dashboard.latestOrders': "So'nggi zakazlar",
  'admin.dashboard.filteredOrders': 'Filtrlangan zakazlar',
  'admin.dashboard.noOrdersForDate': "Bu sana uchun zakaz yo'q",
  'admin.dashboard.noChartForDate': "Bu sana uchun grafik ma'lumot yo'q",
  'admin.agentStats.subtitle': "Agentlar savdo ko'rsatkichlari",
  'admin.agentStats.tableTitle': 'Agent jadvali',
  'admin.agentStats.periodSalesByAgent': "Davr savdosi (agent bo'yicha)",
  'admin.agentStats.todaySalesChart': 'Bugungi savdo',
  'admin.agentStats.monthlySalesChart': 'Oylik savdo',
  'admin.agentStats.totalCompare': 'Jami savdo taqqoslama',
  'admin.agentStats.noData': "Statistika yo'q",
  'admin.agentStats.noDataForPeriod': 'Bu davr uchun statistika yo\'q',
  'admin.orders.searchPlaceholder': 'Zakaz, klient, agent qidirish...',
  'admin.orders.mapTitle': "Xaritada ochish",
  'admin.orders.viewItems': "Mahsulotlarni ko'rish",
  'orders.vehicle': 'Moshina',
  'returns.title': 'Vozvrat',
  'returns.selectClient': 'Klientni tanlang',
  'returns.searchClient': 'Klientni qidirish...',
  'returns.onlyOrderedClients': 'Faqat zakaz qilgan klientlar',
  'returns.selectOrder': 'Zakazni tanlang (sanasi bilan)',
  'returns.selectItems': 'Mahsulotlarni belgilang',
  'returns.returnAll': 'Hammasini qaytarish',
  'returns.quantity': 'Soni',
  'returns.remaining': 'Qolgan',
  'returns.save': 'Saqlash',
  'returns.saved': 'Vozvrat saqlandi',
  'returns.error.noItems': 'Mahsulot tanlanmadi',
  'returns.error.noOrder': 'Zakaz tanlanmadi',
  'returns.allCancelled': 'Hammasi bekor boldi',
  'returns.allCancelledLabel': 'Hammasi bekor qilingan',
  'returns.partialCancelled': 'Qisman bekor',
  'returns.accept': 'Qabul qilindi',
  'returns.pendingReturns': 'Kutilayotgan vozvratlar',
  'returns.returnedProducts': 'Qaytarilgan mahsulotlar',
  'returns.sentDate': 'Yuborilgan sana',
  'returns.returnedBy': 'Kimdan qaytarilmoqda',
  'returns.deliveryPerson': 'Dostavkachi',
  'returns.acceptConfirmTitle': 'Qabul qilish',
  'returns.acceptConfirmMessage': 'Hamma mahsulotlar tekshirildimi? Hammasini qabul qildingizmi?',
  'returns.acceptConfirmYes': 'Ha, qabul qilaman',
  'returns.acceptConfirmNo': 'Bekor qilish',
  'returns.acceptedBy': 'Kim qabul qildi',
  'returns.comment': 'Izoh',
  'returns.commentPlaceholder': 'Izoh yozing (ixtiyoriy)',
  'returns.acceptedReturnsHistory': 'Qabul qilingan vozvratlar',
  'returns.deliveredAmount': 'Olingan summa',
  'returns.cancelledAmount': 'Bekor qilingan summa',
  'returns.orderedQty': 'Buyurtma',
  'returns.cancelledQty': 'Bekor',
  'returns.deliveredQty': 'Yetkazilgan',
  'admin.clients.searchPlaceholder': 'Klient qidirish...',
  'admin.clients.add': "Yangi klient",
  'admin.clients.notFound': 'Klient topilmadi',
  'admin.clients.addHint': "Yangi klient qo'shing",
  'admin.clients.allAgents': 'Barcha agentlar',
  'admin.clients.history': 'Buyurtmalar tarixi',
  'admin.clients.totalOrders': 'Jami zakaz',
  'admin.clients.totalAmount': 'Jami summa',
  'admin.clients.average': "O'rtacha",
  'admin.clients.noOrdersYet': "Hali zakaz yo'q",
  'admin.clients.productsCount': 'ta mahsulot',
  'admin.clients.agentLabel': 'Agent',
  'admin.clients.gpsAvailable': 'GPS mavjud',
  'admin.clients.gpsCoords': 'GPS koordinatalar',
  'admin.clients.unknownAgent': "Noma'lum agent",
  'admin.clients.editClient': 'Klientni tahrirlash',
  'admin.clients.addClient': "Yangi klient qo'shish",
  'admin.clients.deleteTitle': "Klientni o'chirish",
  'admin.clients.deleteConfirm': "o'chirilsinmi?",
  'admin.clients.deleteWarning': "Bu amalni qaytarib bo'lmaydi.",
  'admin.clients.validation.nameRequired': 'Ism kiritilishi shart',
  'admin.clients.validation.phoneRequired': 'Telefon kiritilishi shart',
  'admin.clients.validation.addressRequired': 'Manzil kiritilishi shart',
  'admin.clients.validation.agentRequired': 'Agent tanlanishi shart',
  'admin.products.product': 'Mahsulot',
  'admin.products.profitPercent': 'Foyda %',
  'admin.products.soldQty': 'Sotildi',
  'admin.products.revenue': 'Savdo',
  'admin.products.empty': 'Mahsulot topilmadi',
  'admin.products.emptyForDate': 'Bu sana uchun mahsulot topilmadi',
  'admin.products.editTitle': 'Mahsulotni tahrirlash',
  'admin.products.editSubtitle': 'Nomi yangilanadi va hamma joyda ko‘rinadi.',
  'admin.products.nameLabel': 'Mahsulot nomi',
  'common.view.card': 'Card',
  'common.view.list': 'List',
};

const uz_kir: TranslationKeys = {
  'common.brandName': 'Sainur CRM',
  'common.adminPanel': 'Админ панел',
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
  'common.print': 'Чоп этиш',
  'common.select': 'Танлаш',
  'common.loading': 'Юкланмоқда...',
  'common.confirm': 'Тасдиқлаш',
  'common.logout': 'Чиқиш',
  'common.sum': 'сўм',
  'common.pcs': 'та',
  'common.map': 'Харита',
  'common.reports': 'Ҳисоботлар',
  'common.optional': '(ихтиёрий)',
  'common.collapse': "Йиғиш",
  'common.expand': 'Кенгайтириш',
  'common.stockLevel.sufficient': 'Етарли',
  'common.stockLevel.medium': "Ўртача",
  'common.stockLevel.low': 'Кам',

  'login.title': 'Sainur CRM',
  'login.subtitle': 'Маҳсулот дистрибьюторлари учун',
  'login.phone': 'Телефон рақам',
  'login.password': 'Парол',
  'login.button': 'Кириш',
  'login.role': 'Ролни танланг',
  'login.role.agent': 'Агент',
  'login.role.delivery': 'Доставкачи',
  'login.role.admin': 'Директор',
  'login.role.sklad': 'Складчи',
  'login.phone.placeholder': '+998 90 123 45 67',
  'login.password.placeholder': 'Паролни киритинг',

  'status.new': 'Янги',
  'status.accepted': 'Қабул қилинди',
  'status.delivering': 'Етказилмоқда',
  'status.cancelled': 'Бекор қилинди',

  'agent.dashboard.title': 'Дашборд',
  'agent.dashboard.todayOrders': 'Бугунги заказлар',
  'agent.dashboard.todaySales': 'Бугунги савдо',
  'agent.dashboard.quickActions': 'Тезкор амаллар',
  'agent.dashboard.newOrder': 'Янги заказ',
  'agent.dashboard.addClient': 'Янги клиент',
  'agent.dashboard.greeting': 'Хуш келибсиз',

  'payments.in.title': 'Пул киритиш',
  'payments.method': 'Тўлов усули',
  'payments.method.cash': 'Нақд',
  'payments.method.terminal': 'Терминал',
  'payments.method.transfer': 'Пул кўчириш',
  'payments.amount': 'Сумма',
  'payments.amount.placeholder': 'Масалан: 100000',
  'payments.saved': 'Сақланди',
  'payments.badge.paid': 'Тўланди',
  'payments.badge.debt': 'Қарз',
  'payments.clientDebt': 'Қарз',
  'payments.history': 'Тўловлар тарихи',
  'payments.collectedBy': 'Ким олди',
  'payments.paid': 'Тўланган',

  'admin.orders.deliveredDebt': 'Етказилган (қарз)',
  'admin.orders.netTotal': 'Умумий',
  'admin.clients.debtorsOnly': 'Қарздорлар',

  'clients.title': 'Клиентлар',
  'clients.search': 'Клиент қидириш...',
  'clients.add': 'Клиент қўшиш',
  'clients.empty': 'Клиентлар топилмади',
  'clients.form.title': 'Янги клиент қўшиш',
  'clients.form.name': 'Исм',
  'clients.form.phone': 'Телефон рақам',
  'clients.form.address': 'Манзил',
  'clients.form.location': 'Локация',
  'clients.form.locationBtn': 'GPS орқали локация олиш',
  'clients.form.locationSuccess': 'Локация олинди',
  'mapPicker.title': 'Харитадан жой танлаш',
  'mapPicker.searchPlaceholder': 'Қидирув: кўча, маҳалла...',
  'mapPicker.myLocation': 'Менинг жойлашувим',
  'mapPicker.hintPickOnMap': '📍 Харитага босиб аниқ жойни белгиланг',
  'mapPicker.mapLoading': 'Харита юкланмоқда...',
  'mapPicker.confirmLocation': 'Локацияни тасдиқлаш',
  'mapPicker.selectLocation': 'Харитадан жой танланг',

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
  'orders.delivery': 'Доставкачи',
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
  'orders.comment': 'Изоҳ',
  'orders.commentPlaceholder': 'Заказ учун изоҳ ёзинг',
  'orders.success': 'Заказ муваффақиятли яратилди!',
  'orders.empty': 'Заказлар топилмади',
  'orders.history': 'Заказлар тарихи',
  'orders.today': 'Бугун',

  'days.all': 'Барча кунлар',
  'days.monday': 'Душанба',
  'days.tuesday': 'Сешанба',
  'days.wednesday': 'Чоршанба',
  'days.thursday': 'Пайшанба',
  'days.friday': 'Жума',
  'days.saturday': 'Шанба',
  'days.monday.short': 'Ду',
  'days.tuesday.short': 'Се',
  'days.wednesday.short': 'Ч',
  'days.thursday.short': 'Па',
  'days.friday.short': 'Жу',
  'days.saturday.short': 'Ш',

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
  'status.delivered': 'Етказилган',

  'delivery.title': 'Доставка',
  'delivery.myOrders': 'Менинг заказларим',
  'delivery.orderDetail': 'Заказ тафсилотлари',
  'delivery.startRoute': 'Йўлни бошлаш',
  'delivery.delivered': 'Етказилди',
  'delivery.notDelivered': 'Етказилмади',
  'delivery.mapView': 'Харитада кўриш',
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
  'admin.agentsPage': 'Ходимлар',
  'admin.reportsPage': 'Ҳисоботлар',
  'admin.profilePage': 'Профил',
  'admin.profile.title': 'Профил',
  'admin.profile.subtitle': 'Исм, телефон ва паролни ўзгартиринг',
  'admin.profile.save': 'Сақлаш',
  'admin.profile.saving': 'Сақланмоқда...',
  'admin.profile.savedOk': 'Сақланди',
  'admin.profile.savedLocal': 'Бэкенд уланмади — вақтинча фақат шу браузерда сақланди',
  'admin.profile.saveError': 'Сақлашда хатолик',
  'admin.profile.needLogin': 'Илтимос, аввал тизимга киринг',
  'admin.profile.account': 'Шахсий маълумотлар',
  'admin.profile.accountHint': 'Асосий маълумотларингиз',
  'admin.profile.security': 'Хавфсизлик',
  'admin.profile.securityHint': 'Паролни янгилаш',
  'admin.profile.newPassword': 'Янги парол',
  'admin.profile.passwordHint': 'Бўш қолдирсангиз парол ўзгармайди',
  'admin.profile.role': 'Рол',
  'admin.profile.namePlaceholder': 'Исмингизни киритинг',
  'admin.profile.validation.name': 'Исм киритилиши шарт',
  'admin.profile.validation.phone': 'Телефон рақам киритилиши шарт',
  'admin.salePrice': 'Сотув нархи',
  'admin.costPrice': 'Таннарх',
  'admin.warehouseQty': 'Омбор миқдори',
  'admin.dateRange': 'Сана оралиғи',
  'admin.exportExcel': 'Excel экспорт',
  'admin.addProduct': 'Маҳсулот қўшиш',
  'admin.addAgent': 'Ходим қўшиш',
  'admin.salesByAgent': 'Агентлар бўйича савдо',

  // Admin Reports page
  'admin.reports.totalExpense': 'Жами чиқим',
  'admin.reports.netProfit': 'Соф фойда',
  'admin.reports.avgOrder': 'Ўртача заказ',
  'admin.reports.totalDebt': 'Қарз суммаси',
  'admin.reports.totalReturns': 'Возврат суммаси',
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
  'admin.reports.profit22': 'Фойда',
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
  'admin.reports.expensesTable': 'Чиқимлар жадвали',

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
  'admin.suppliers.currentSalePrice': 'Ҳозирги сотув нархи',
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
  'admin.suppliers.edit': 'Таҳрирлаш',
  'admin.suppliers.delete': "Ўчириш",
  'admin.suppliers.deleteTitle': "Етказиб берувчини ўчириш",
  'admin.suppliers.deleteConfirm': "Ростдан ҳам ўчирмоқчимисиз? Киримлар ва тўловлар ҳам ўчади.",
  'admin.suppliers.deleted': "Ўчирилди",
  'admin.suppliers.updated': 'Янгиланди',

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
  'admin.staff.deleteTitle': "Ходимни ўчириш",
  'admin.staff.deleteConfirm': "Ростдан ҳам ушбу ходимни ўчирмоқчимисиз?",
  'admin.staff.deleteWarning': "Диққат: боғланган маълумотлар бўлса, ўчириш амалга ошмаслиги мумкин.",
  'admin.staff.addVehicle': 'Машина қўшиш',
  'admin.staff.editTitle': 'Ходимни таҳрирлаш',
  'admin.staff.form.fullName': 'Исми фамилия',
  'admin.staff.form.phone': 'Телефон',
  'admin.staff.form.password': 'Парол',
  'admin.staff.form.passwordHint': '(бош қолдиринг — ўзгармайди)',
  'admin.staff.form.role': 'Лавозим',
  'admin.staff.form.vehicleLabel': 'Мошина',
  'admin.staff.form.vehicleSelect': 'Машина танланг',
  'admin.staff.form.vehicleOther': 'Бошқа',
  'admin.staff.card.todaySales': 'Бугунги савдо',
  'admin.staff.card.monthSales': 'Ойлик савдо',
  'admin.staff.card.ordersAgent': 'Заказлар',
  'admin.staff.card.ordersDelivery': 'Етказилган заказлар',
  'admin.staff.card.itemsAgent': 'Сотилди',
  'admin.staff.card.itemsDelivery': 'Етказилган маҳсулот',
  'admin.dateFilter.label': 'Сана бўйича фильтр',
  'admin.dateFilter.clear': 'Фильтрни тозалаш',
  'admin.dateFilter.from': 'ДАН',
  'admin.dateFilter.to': 'ГАЧА',
  'admin.dateFilter.apply': "Қўллаш",
  'admin.dateFilter.today': 'Бугун',
  'admin.dateFilter.thisWeek': 'Бу ҳафта',
  'admin.dateFilter.thisMonth': 'Бу ой',
  'admin.dateFilter.all': 'Барчаси',
  'admin.dateFilter.pickStart': 'Бошланиш санасини танланг',
  'admin.dateFilter.pickEnd': 'Тугаш санасини танланг',
  'admin.dashboard.latestOrders': "Сўнгги закaзлар",
  'admin.dashboard.filteredOrders': 'Фильтрланган закaзлар',
  'admin.dashboard.noOrdersForDate': "Бу сана учун закaз йўқ",
  'admin.dashboard.noChartForDate': "Бу сана учун график маълумот йўқ",
  'admin.agentStats.subtitle': "Агентлар савдо кўрсаткичлари",
  'admin.agentStats.tableTitle': 'Агент жадвали',
  'admin.agentStats.periodSalesByAgent': "Давр савдоси (агент бўйича)",
  'admin.agentStats.todaySalesChart': 'Бугунги савдо',
  'admin.agentStats.monthlySalesChart': 'Ойлик савдо',
  'admin.agentStats.totalCompare': 'Жами савдо таққослама',
  'admin.agentStats.noData': 'Статистика йўқ',
  'admin.agentStats.noDataForPeriod': 'Бу давр учун статистика йўқ',
  'admin.orders.searchPlaceholder': 'Закaз, клиент, агент қидириш...',
  'admin.orders.mapTitle': "Харитада очиш",
  'admin.orders.viewItems': "Маҳсулотларни кўриш",
  'orders.vehicle': 'Мошина',
  'returns.title': 'Возврат',
  'returns.selectClient': 'Клиентни танланг',
  'returns.searchClient': 'Клиентни қидириш...',
  'returns.onlyOrderedClients': 'Фақат заказ қилган клиентлар',
  'returns.selectOrder': 'Заказни танланг (санаси билан)',
  'returns.selectItems': 'Маҳсулотларни белгиланг',
  'returns.returnAll': 'Ҳаммасини қайтариш',
  'returns.quantity': 'Сони',
  'returns.remaining': 'Қолган',
  'returns.save': 'Сақлаш',
  'returns.saved': 'Возврат сақланди',
  'returns.error.noItems': 'Маҳсулот танланмади',
  'returns.error.noOrder': 'Заказ танланмади',
  'returns.allCancelled': 'Ҳаммаси бекор бўлди',
  'returns.allCancelledLabel': 'Ҳаммаси бекор қилинган',
  'returns.partialCancelled': 'Қисман бекор',
  'returns.accept': 'Қабул қилинди',
  'returns.pendingReturns': 'Кутилаётган возвратлар',
  'returns.returnedProducts': 'Қайтарилган маҳсулотлар',
  'returns.sentDate': 'Юборилган сана',
  'returns.returnedBy': 'Кимдан қайтарилмоқда',
  'returns.deliveryPerson': 'Доставкачи',
  'returns.acceptConfirmTitle': 'Қабул қилиш',
  'returns.acceptConfirmMessage': 'Ҳамма маҳсулотлар тексририлдими? Ҳаммасини қабул қилдингизми?',
  'returns.acceptConfirmYes': 'Ҳа, қабул қиламан',
  'returns.acceptConfirmNo': 'Бекор қилиш',
  'returns.acceptedBy': 'Ким қабул қилди',
  'returns.comment': 'Изоҳ',
  'returns.commentPlaceholder': 'Изоҳ ёзинг (ихтиёрий)',
  'returns.acceptedReturnsHistory': 'Қабул қилинган возвратлар',
  'returns.deliveredAmount': 'Олинган сумма',
  'returns.cancelledAmount': 'Бекор қилинган сумма',
  'returns.orderedQty': 'Буюртма',
  'returns.cancelledQty': 'Бекор',
  'returns.deliveredQty': 'Етказилган',
  'admin.clients.searchPlaceholder': 'Клиент қидириш...',
  'admin.clients.add': "Янги клиент",
  'admin.clients.notFound': 'Клиент топилмади',
  'admin.clients.addHint': "Янги клиент қўшинг",
  'admin.clients.allAgents': 'Барча агентлар',
  'admin.clients.history': 'Буюртмалар тарихи',
  'admin.clients.totalOrders': 'Жами закaз',
  'admin.clients.totalAmount': 'Жами сумма',
  'admin.clients.average': "Ўртача",
  'admin.clients.noOrdersYet': "Ҳали закaз йўқ",
  'admin.clients.productsCount': 'та маҳсулот',
  'admin.clients.agentLabel': 'Агент',
  'admin.clients.gpsAvailable': 'GPS мавжуд',
  'admin.clients.gpsCoords': 'GPS координаталар',
  'admin.clients.unknownAgent': "Номаълум агент",
  'admin.clients.editClient': 'Клиентни таҳрирлаш',
  'admin.clients.addClient': "Янги клиент қўшиш",
  'admin.clients.deleteTitle': "Клиентни ўчириш",
  'admin.clients.deleteConfirm': "ўчирилсинми?",
  'admin.clients.deleteWarning': "Бу амални қайтариб бўлмайди.",
  'admin.clients.validation.nameRequired': 'Исм киритилиши шарт',
  'admin.clients.validation.phoneRequired': 'Телефон киритилиши шарт',
  'admin.clients.validation.addressRequired': 'Манзил киритилиши шарт',
  'admin.clients.validation.agentRequired': 'Агент танланиши шарт',
  'admin.products.product': 'Маҳсулот',
  'admin.products.profitPercent': 'Фойда %',
  'admin.products.soldQty': 'Сотилди',
  'admin.products.revenue': 'Савдо',
  'admin.products.empty': 'Маҳсулот топилмади',
  'admin.products.emptyForDate': 'Бу сана учун маҳсулот топилмади',
  'admin.products.editTitle': 'Маҳсулотни таҳрирлаш',
  'admin.products.editSubtitle': 'Номи янгиланади ва ҳамма жойда кўринади.',
  'admin.products.nameLabel': 'Маҳсулот номи',
  'common.view.card': 'Card',
  'common.view.list': 'List',
};

const ru: TranslationKeys = {
  'common.brandName': 'Sainur CRM',
  'common.adminPanel': 'Админ панель',
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
  'common.print': 'Печать',
  'common.select': 'Выбрать',
  'common.loading': 'Загрузка...',
  'common.confirm': 'Подтвердить',
  'common.logout': 'Выйти',
  'common.sum': 'сум',
  'common.pcs': 'шт',
  'common.map': 'Карта',
  'common.reports': 'Отчёты',
  'common.optional': '(необязательно)',
  'common.collapse': 'Свернуть',
  'common.expand': 'Развернуть',
  'common.stockLevel.sufficient': 'Достаточно',
  'common.stockLevel.medium': 'Средне',
  'common.stockLevel.low': 'Мало',

  'login.title': 'Sainur CRM',
  'login.subtitle': 'Для дистрибьюторов продукции',
  'login.phone': 'Номер телефона',
  'login.password': 'Пароль',
  'login.button': 'Войти',
  'login.role': 'Выберите роль',
  'login.role.agent': 'Агент',
  'login.role.delivery': 'Доставщик',
  'login.role.admin': 'Директор',
  'login.role.sklad': 'Склад',
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

  'payments.in.title': 'Внести оплату',
  'payments.method': 'Способ оплаты',
  'payments.method.cash': 'Наличные',
  'payments.method.terminal': 'Терминал',
  'payments.method.transfer': 'Перевод',
  'payments.amount': 'Сумма',
  'payments.amount.placeholder': 'Напр.: 100000',
  'payments.saved': 'Сохранено',
  'payments.badge.paid': 'Оплачено',
  'payments.badge.debt': 'Долг',
  'payments.clientDebt': 'Долг',
  'payments.history': 'История оплат',
  'payments.collectedBy': 'Кто принял',
  'payments.paid': 'Оплачено',

  'admin.orders.deliveredDebt': 'Доставлено (долг)',
  'admin.orders.netTotal': 'Итого (нетто)',
  'admin.clients.debtorsOnly': 'Должники',

  'clients.title': 'Клиенты',
  'clients.search': 'Поиск клиента...',
  'clients.add': 'Добавить клиента',
  'clients.empty': 'Клиенты не найдены',
  'clients.form.title': 'Добавить нового клиента',
  'clients.form.name': 'Имя',
  'clients.form.phone': 'Номер телефона',
  'clients.form.address': 'Адрес',
  'clients.form.location': 'Локация',
  'clients.form.locationBtn': 'Получить локацию через GPS',
  'clients.form.locationSuccess': 'Локация получена',
  'mapPicker.title': 'Выбор местоположения на карте',
  'mapPicker.searchPlaceholder': 'Поиск: улица, район...',
  'mapPicker.myLocation': 'Мое местоположение',
  'mapPicker.hintPickOnMap': '📍 Нажмите на карту, чтобы отметить точное место',
  'mapPicker.mapLoading': 'Карта загружается...',
  'mapPicker.confirmLocation': 'Подтвердить локацию',
  'mapPicker.selectLocation': 'Выберите место на карте',

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
  'orders.comment': 'Комментарий',
  'orders.commentPlaceholder': 'Введите комментарий к заказу',
  'orders.success': 'Заказ успешно создан!',
  'orders.empty': 'Заказы не найдены',
  'orders.history': 'История заказов',
  'orders.today': 'Сегодня',

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

  'orders.sendToWarehouse': 'Отправить на склад',
  'orders.sentToWarehouse': 'Отправлено на склад',
  'orders.selectDay': 'Выберите день',
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
  'admin.agentsPage': 'Сотрудники',
  'admin.reportsPage': 'Отчёты',
  'admin.profilePage': 'Профиль',
  'admin.profile.title': 'Профиль',
  'admin.profile.subtitle': 'Измените имя, телефон и пароль',
  'admin.profile.save': 'Сохранить',
  'admin.profile.saving': 'Сохранение...',
  'admin.profile.savedOk': 'Сохранено',
  'admin.profile.savedLocal': 'Бэкенд недоступен — временно сохранено только в этом браузере',
  'admin.profile.saveError': 'Ошибка при сохранении',
  'admin.profile.needLogin': 'Пожалуйста, сначала войдите в систему',
  'admin.profile.account': 'Личные данные',
  'admin.profile.accountHint': 'Ваши основные данные',
  'admin.profile.security': 'Безопасность',
  'admin.profile.securityHint': 'Обновление пароля',
  'admin.profile.newPassword': 'Новый пароль',
  'admin.profile.passwordHint': 'Если оставить пустым — пароль не изменится',
  'admin.profile.role': 'Роль',
  'admin.profile.namePlaceholder': 'Введите имя',
  'admin.profile.validation.name': 'Имя обязательно',
  'admin.profile.validation.phone': 'Телефон обязателен',
  'admin.salePrice': 'Цена продажи',
  'admin.costPrice': 'Себестоимсть',
  'admin.warehouseQty': 'Коичество на складе',
  'admin.dateRange': 'Диапазон дат',
  'admin.exportExcel': 'Экспорт Excel',
  'admin.addProduct': 'Добавить товар',
  'admin.addAgent': 'Добавить сотрудника',
  'admin.salesByAgent': 'Продажи по агентам',

  // Admin Reports page
  'admin.reports.totalExpense': 'Общие расходы',
  'admin.reports.netProfit': 'Чистая прибыль',
  'admin.reports.avgOrder': 'Средний заказ',
  'admin.reports.totalDebt': 'Сумма долга',
  'admin.reports.totalReturns': 'Сумма возврата',
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
  'admin.reports.profit22': 'Прибыль',
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
  'admin.reports.expensesTable': 'Таблица расходов',

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
  'admin.suppliers.currentSalePrice': 'Текущая цена продажи',
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
  'admin.suppliers.edit': 'Редактировать',
  'admin.suppliers.delete': 'Удалить',
  'admin.suppliers.deleteTitle': 'Удалить поставщика',
  'admin.suppliers.deleteConfirm': 'Вы уверены? Поступления и платежи тоже будут удалены.',
  'admin.suppliers.deleted': 'Удалено',
  'admin.suppliers.updated': 'Обновлено',

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
  'admin.staff.deleteTitle': 'Удалить сотрудника',
  'admin.staff.deleteConfirm': 'Вы действительно хотите удалить этого сотрудника?',
  'admin.staff.deleteWarning': 'Внимание: если есть связанные данные, удаление может не выполниться.',
  'admin.staff.addVehicle': 'Добавить машину',
  'admin.staff.editTitle': 'Редактировать сотрудника',
  'admin.staff.form.fullName': 'ФИО',
  'admin.staff.form.phone': 'Телефон',
  'admin.staff.form.password': 'Пароль',
  'admin.staff.form.passwordHint': '(оставьте пустым — не изменится)',
  'admin.staff.form.role': 'Должность',
  'admin.staff.form.vehicleLabel': 'Машина',
  'admin.staff.form.vehicleSelect': 'Выберите машину',
  'admin.staff.form.vehicleOther': 'Другое',
  'admin.staff.card.todaySales': 'Продажи сегодня',
  'admin.staff.card.monthSales': 'Продажи за месяц',
  'admin.staff.card.ordersAgent': 'Заказы',
  'admin.staff.card.ordersDelivery': 'Доставленные заказы',
  'admin.staff.card.itemsAgent': 'Продано',
  'admin.staff.card.itemsDelivery': 'Доставлено товаров',
  'admin.dateFilter.label': 'Фильтр по дате',
  'admin.dateFilter.clear': 'Очистить фильтр',
  'admin.dateFilter.from': 'С',
  'admin.dateFilter.to': 'ПО',
  'admin.dateFilter.apply': 'Применить',
  'admin.dateFilter.today': 'Сегодня',
  'admin.dateFilter.thisWeek': 'Эта неделя',
  'admin.dateFilter.thisMonth': 'Этот месяц',
  'admin.dateFilter.all': 'Все',
  'admin.dateFilter.pickStart': 'Выберите дату начала',
  'admin.dateFilter.pickEnd': 'Выберите дату окончания',
  'admin.dashboard.latestOrders': 'Последние заказы',
  'admin.dashboard.filteredOrders': 'Отфильтрованные заказы',
  'admin.dashboard.noOrdersForDate': 'Нет заказов за эту дату',
  'admin.dashboard.noChartForDate': 'Нет данных для графика за эту дату',
  'admin.agentStats.subtitle': 'Показатели продаж агентов',
  'admin.agentStats.tableTitle': 'Таблица агентов',
  'admin.agentStats.periodSalesByAgent': 'Продажи за период (по агентам)',
  'admin.agentStats.todaySalesChart': 'Продажи сегодня',
  'admin.agentStats.monthlySalesChart': 'Продажи за месяц',
  'admin.agentStats.totalCompare': 'Сравнение продаж',
  'admin.agentStats.noData': 'Статистика отсутствует',
  'admin.agentStats.noDataForPeriod': 'За этот период статистика отсутствует',
  'admin.orders.searchPlaceholder': 'Поиск: заказ, клиент, агент...',
  'admin.orders.mapTitle': 'Открыть на карте',
  'admin.orders.viewItems': 'Посмотреть товары',
  'orders.vehicle': 'Машина',
  'returns.title': 'Возврат',
  'returns.selectClient': 'Выберите клиента',
  'returns.searchClient': 'Поиск клиента...',
  'returns.onlyOrderedClients': 'Только клиенты с заказами',
  'returns.selectOrder': 'Выберите заказ (с датой)',
  'returns.selectItems': 'Отметьте товары',
  'returns.returnAll': 'Вернуть всё',
  'returns.quantity': 'Кол-во',
  'returns.remaining': 'Остаток',
  'returns.save': 'Сохранить',
  'returns.saved': 'Возврат сохранён',
  'returns.error.noItems': 'Товары не выбраны',
  'returns.error.noOrder': 'Заказ не выбран',
  'returns.allCancelled': 'Всё отменено',
  'returns.allCancelledLabel': 'Всё отменено',
  'returns.partialCancelled': 'Частично отменено',
  'returns.accept': 'Принято',
  'returns.pendingReturns': 'Ожидающие возвраты',
  'returns.returnedProducts': 'Возвращённые товары',
  'returns.sentDate': 'Дата отправки',
  'returns.returnedBy': 'От кого возврат',
  'returns.deliveryPerson': 'Доставщик',
  'returns.acceptConfirmTitle': 'Принять возврат',
  'returns.acceptConfirmMessage': 'Все товары проверены? Вы принимаете всё?',
  'returns.acceptConfirmYes': 'Да, принимаю',
  'returns.acceptConfirmNo': 'Отмена',
  'returns.acceptedBy': 'Кто принял',
  'returns.comment': 'Комментарий',
  'returns.commentPlaceholder': 'Напишите комментарий (необязательно)',
  'returns.acceptedReturnsHistory': 'Принятые возвраты',
  'returns.deliveredAmount': 'Сумма полученного',
  'returns.cancelledAmount': 'Сумма отменённого',
  'returns.orderedQty': 'Заказано',
  'returns.cancelledQty': 'Отменено',
  'returns.deliveredQty': 'Доставлено',
  'admin.clients.searchPlaceholder': 'Поиск клиента...',
  'admin.clients.add': 'Новый клиент',
  'admin.clients.notFound': 'Клиент не найден',
  'admin.clients.addHint': 'Добавьте нового клиента',
  'admin.clients.allAgents': 'Все агенты',
  'admin.clients.history': 'История заказов',
  'admin.clients.totalOrders': 'Всего заказов',
  'admin.clients.totalAmount': 'Общая сумма',
  'admin.clients.average': 'Среднее',
  'admin.clients.noOrdersYet': 'Пока нет заказов',
  'admin.clients.productsCount': 'товаров',
  'admin.clients.agentLabel': 'Агент',
  'admin.clients.gpsAvailable': 'GPS доступен',
  'admin.clients.gpsCoords': 'GPS координаты',
  'admin.clients.unknownAgent': 'Неизвестный агент',
  'admin.clients.editClient': 'Редактировать клиента',
  'admin.clients.addClient': 'Добавить клиента',
  'admin.clients.deleteTitle': 'Удалить клиента',
  'admin.clients.deleteConfirm': 'удалить?',
  'admin.clients.deleteWarning': 'Это действие нельзя отменить.',
  'admin.clients.validation.nameRequired': 'Имя обязательно',
  'admin.clients.validation.phoneRequired': 'Телефон обязателен',
  'admin.clients.validation.addressRequired': 'Адрес обязателен',
  'admin.clients.validation.agentRequired': 'Выберите агента',
  'admin.products.product': 'Товар',
  'admin.products.profitPercent': 'Прибыль %',
  'admin.products.soldQty': 'Продано',
  'admin.products.revenue': 'Выручка',
  'admin.products.empty': 'Товары не найдены',
  'admin.products.emptyForDate': 'За выбранную дату товаров не найдено',
  'admin.products.editTitle': 'Редактировать товар',
  'admin.products.editSubtitle': 'Название обновится и будет видно везде.',
  'admin.products.nameLabel': 'Название товара',
  'common.view.card': 'Карточки',
  'common.view.list': 'Список',
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