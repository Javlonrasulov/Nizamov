export type OrderStatus = 'new' | 'tayyorlanmagan' | 'yuborilgan' | 'accepted' | 'delivering' | 'delivered' | 'cancelled' | 'sent';
export type UserRole = 'agent' | 'delivery' | 'admin' | 'sklad';
export type WeekDay = 'du' | 'se' | 'ch' | 'pa' | 'ju' | 'sh';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password?: string;
  vehicleName?: string;
  comment?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  lat?: number;
  lng?: number;
  agentId: string;
  visitDays?: WeekDay[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  promoPrice?: number | null;
}

export interface Order {
  id: string;
  orderNumber?: number;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  agentId: string;
  agentName: string;
  deliveryId?: string;
  deliveryName?: string;
  vehicleName?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  comment?: string;
}

export const users: User[] = [
  { id: 'agent1', name: 'Sardor Toshmatov', phone: '+998901234567', role: 'agent', password: '1234' },
  { id: 'agent2', name: 'Dilnoza Yusupova', phone: '+998907654321', role: 'agent', password: '1234' },
  { id: 'agent3', name: 'Bobur Karimov', phone: '+998901112233', role: 'agent', password: '1234' },
  { id: 'delivery1', name: 'Jasur Razzaqov', phone: '+998909998877', role: 'delivery', password: '1234' },
  { id: 'delivery2', name: 'Sanjar Mirzayev', phone: '+998908887766', role: 'delivery', password: '1234' },
  { id: 'admin1', name: 'Aziz Xasanov', phone: '+998900001122', role: 'admin', password: 'admin' },
];

export const clients: Client[] = [
  { id: 'c1', name: 'Bek Supermarket', phone: '+998901010101', address: 'Toshkent, Chilonzor, 4-kvartal', lat: 41.2995, lng: 69.2401, agentId: 'agent1', visitDays: ['du', 'ch', 'sh'] },
  { id: 'c2', name: "Hamza Do'kon", phone: '+998902020202', address: 'Toshkent, Yunusobod, Amir Temur', lat: 41.3456, lng: 69.2870, agentId: 'agent1', visitDays: ['se', 'pa', 'sh'] },
  { id: 'c3', name: 'Sarvar Market', phone: '+998903030303', address: "Toshkent, Mirzo Ulug'bek", lat: 41.3200, lng: 69.3100, agentId: 'agent1', visitDays: ['du', 'ju', 'sh'] },
  { id: 'c4', name: 'Gold Store', phone: '+998904040404', address: 'Toshkent, Shayxontohur', lat: 41.3100, lng: 69.2600, agentId: 'agent2', visitDays: ['se', 'sh'] },
  { id: 'c5', name: 'Royal Bozor', phone: '+998905050505', address: 'Toshkent, Olmazor, 1-mavze', lat: 41.2800, lng: 69.2200, agentId: 'agent2', visitDays: ['ch', 'ju'] },
  { id: 'c6', name: 'Fayz Magazin', phone: '+998906060606', address: 'Toshkent, Bektemir', lat: 41.2600, lng: 69.3500, agentId: 'agent3', visitDays: ['pa', 'sh'] },
  { id: "c7", name: "Nargiza Do'kon", phone: '+998907070707', address: 'Toshkent, Uchtepa', lat: 41.2900, lng: 69.2000, agentId: 'agent3', visitDays: ['du', 'se'] },
  { id: 'c8', name: 'Zafar Mini Market', phone: '+998908080808', address: 'Toshkent, Yakkasaroy, Navoiy ko\'chasi', lat: 41.3050, lng: 69.2750, agentId: 'agent1', visitDays: ['du', 'ch', 'ju', 'sh'] },
  { id: 'c9', name: 'Baraka Dokon', phone: '+998909090909', address: 'Toshkent, Sergeli, 14-mavze', lat: 41.2450, lng: 69.2650, agentId: 'agent2', visitDays: ['se', 'pa', 'sh'] },
];

export const products: Product[] = [
  { id: 'p1', name: 'Coca-Cola 0.5L (yashik)', price: 85000, cost: 65000, stock: 150 },
  { id: 'p2', name: 'Pepsi 1L (yashik)', price: 95000, cost: 72000, stock: 200 },
  { id: 'p3', name: 'Sprite 0.5L (yashik)', price: 80000, cost: 62000, stock: 180 },
  { id: 'p4', name: 'Fanta Orange (yashik)', price: 82000, cost: 64000, stock: 120 },
  { id: 'p5', name: 'Lipton Ice Tea (yashik)', price: 110000, cost: 85000, stock: 90 },
  { id: 'p6', name: 'Aqua Mineral 1.5L (yashik)', price: 45000, cost: 32000, stock: 300 },
  { id: 'p7', name: 'Red Bull 0.25L (yashik)', price: 180000, cost: 145000, stock: 60 },
  { id: 'p8', name: 'Nescafe Classic (quti)', price: 95000, cost: 75000, stock: 80 },
  { id: 'p9', name: 'Milkis Strawberry 0.5L (yashik)', price: 78000, cost: 58000, stock: 110 },
  { id: 'p10', name: 'Bonaqua Still 0.5L (yashik)', price: 42000, cost: 30000, stock: 250 },
];

export const orders: Order[] = [
  {
    id: 'ORD-001', clientId: 'c1', clientName: 'Bek Supermarket', clientPhone: '+998901010101',
    clientAddress: 'Toshkent, Chilonzor, 4-kvartal',
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    deliveryId: 'delivery1', deliveryName: 'Jasur Razzaqov',
    items: [
      { productId: 'p1', productName: 'Coca-Cola 0.5L', quantity: 5, price: 85000 },
      { productId: 'p6', productName: 'Aqua Mineral 1.5L', quantity: 3, price: 45000 },
    ],
    total: 560000, status: 'delivered', date: '2026-03-14',
  },
  {
    id: 'ORD-002', clientId: 'c2', clientName: 'Hamza Do\'kon', clientPhone: '+998902020202',
    clientAddress: 'Toshkent, Yunusobod, Amir Temur',
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    deliveryId: 'delivery1', deliveryName: 'Jasur Razzaqov',
    items: [
      { productId: 'p2', productName: 'Pepsi 1L', quantity: 4, price: 95000 },
      { productId: 'p3', productName: 'Sprite 0.5L', quantity: 2, price: 80000 },
    ],
    total: 540000, status: 'delivering', date: '2026-03-14',
  },
  {
    id: 'ORD-003', clientId: 'c3', clientName: 'Sarvar Market', clientPhone: '+998903030303',
    clientAddress: 'Toshkent, Mirzo Ulug\'bek',
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    items: [
      { productId: 'p7', productName: 'Red Bull 0.25L', quantity: 2, price: 180000 },
      { productId: 'p8', productName: 'Nescafe Classic', quantity: 3, price: 95000 },
    ],
    total: 645000, status: 'new', date: '2026-03-14',
  },
  {
    id: 'ORD-004', clientId: 'c4', clientName: 'Gold Store', clientPhone: '+998904040404',
    clientAddress: 'Toshkent, Shayxontohur',
    agentId: 'agent2', agentName: 'Dilnoza Yusupova',
    deliveryId: 'delivery2', deliveryName: 'Sanjar Mirzayev',
    items: [
      { productId: 'p4', productName: 'Fanta Orange', quantity: 6, price: 82000 },
    ],
    total: 492000, status: 'accepted', date: '2026-03-14',
  },
  {
    id: 'ORD-005', clientId: 'c5', clientName: 'Royal Bozor', clientPhone: '+998905050505',
    clientAddress: 'Toshkent, Olmazor, 1-mavze',
    agentId: 'agent2', agentName: 'Dilnoza Yusupova',
    items: [
      { productId: 'p5', productName: 'Lipton Ice Tea', quantity: 3, price: 110000 },
      { productId: 'p1', productName: 'Coca-Cola 0.5L', quantity: 2, price: 85000 },
    ],
    total: 500000, status: 'delivered', date: '2026-03-13',
  },
  {
    id: 'ORD-006', clientId: 'c6', clientName: 'Fayz Magazin', clientPhone: '+998906060606',
    clientAddress: 'Toshkent, Bektemir',
    agentId: 'agent3', agentName: 'Bobur Karimov',
    deliveryId: 'delivery1', deliveryName: 'Jasur Razzaqov',
    items: [
      { productId: 'p2', productName: 'Pepsi 1L', quantity: 5, price: 95000 },
      { productId: 'p6', productName: 'Aqua Mineral 1.5L', quantity: 10, price: 45000 },
    ],
    total: 925000, status: 'delivered', date: '2026-03-13',
  },
  {
    id: 'ORD-007', clientId: 'c7', clientName: 'Nargiza Do\'kon', clientPhone: '+998907070707',
    clientAddress: 'Toshkent, Uchtepa',
    agentId: 'agent3', agentName: 'Bobur Karimov',
    items: [
      { productId: 'p8', productName: 'Nescafe Classic', quantity: 2, price: 95000 },
    ],
    total: 190000, status: 'cancelled', date: '2026-03-12',
  },
  {
    id: 'ORD-008', clientId: 'c1', clientName: 'Bek Supermarket', clientPhone: '+998901010101',
    clientAddress: 'Toshkent, Chilonzor, 4-kvartal',
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    deliveryId: 'delivery2', deliveryName: 'Sanjar Mirzayev',
    items: [
      { productId: 'p3', productName: 'Sprite 0.5L', quantity: 4, price: 80000 },
      { productId: 'p4', productName: 'Fanta Orange', quantity: 3, price: 82000 },
    ],
    total: 566000, status: 'delivered', date: '2026-03-12',
  },
  // --- BUGUNGI (2026-03-15) ZAKAZLAR ---
  {
    id: 'ORD-009', clientId: 'c1', clientName: 'Bek Supermarket', clientPhone: '+998901010101',
    clientAddress: 'Toshkent, Chilonzor, 4-kvartal',
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    items: [
      { productId: 'p1', productName: 'Coca-Cola 0.5L (yashik)', quantity: 6, price: 85000 },
      { productId: 'p9', productName: 'Milkis Strawberry 0.5L (yashik)', quantity: 3, price: 78000 },
    ],
    total: 744000, status: 'new', date: '2026-03-15',
  },
  {
    id: 'ORD-010', clientId: 'c8', clientName: 'Zafar Mini Market', clientPhone: '+998908080808',
    clientAddress: "Toshkent, Yakkasaroy, Navoiy ko'chasi",
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    deliveryId: 'delivery1', deliveryName: 'Jasur Razzaqov',
    items: [
      { productId: 'p6', productName: 'Aqua Mineral 1.5L (yashik)', quantity: 8, price: 45000 },
      { productId: 'p10', productName: 'Bonaqua Still 0.5L (yashik)', quantity: 5, price: 42000 },
    ],
    total: 570000, status: 'delivering', date: '2026-03-15',
  },
  {
    id: 'ORD-011', clientId: 'c2', clientName: "Hamza Do'kon", clientPhone: '+998902020202',
    clientAddress: 'Toshkent, Yunusobod, Amir Temur',
    agentId: 'agent1', agentName: 'Sardor Toshmatov',
    items: [
      { productId: 'p7', productName: 'Red Bull 0.25L (yashik)', quantity: 2, price: 180000 },
      { productId: 'p2', productName: 'Pepsi 1L (yashik)', quantity: 3, price: 95000 },
    ],
    total: 645000, status: 'sent', date: '2026-03-15',
  },
  {
    id: 'ORD-012', clientId: 'c9', clientName: 'Baraka Dokon', clientPhone: '+998909090909',
    clientAddress: 'Toshkent, Sergeli, 14-mavze',
    agentId: 'agent2', agentName: 'Dilnoza Yusupova',
    deliveryId: 'delivery2', deliveryName: 'Sanjar Mirzayev',
    items: [
      { productId: 'p5', productName: 'Lipton Ice Tea (yashik)', quantity: 4, price: 110000 },
      { productId: 'p8', productName: 'Nescafe Classic (quti)', quantity: 2, price: 95000 },
    ],
    total: 630000, status: 'accepted', date: '2026-03-15',
  },
  {
    id: 'ORD-013', clientId: 'c4', clientName: 'Gold Store', clientPhone: '+998904040404',
    clientAddress: 'Toshkent, Shayxontohur',
    agentId: 'agent2', agentName: 'Dilnoza Yusupova',
    items: [
      { productId: 'p3', productName: 'Sprite 0.5L (yashik)', quantity: 5, price: 80000 },
      { productId: 'p10', productName: 'Bonaqua Still 0.5L (yashik)', quantity: 10, price: 42000 },
    ],
    total: 820000, status: 'new', date: '2026-03-15',
  },
  {
    id: 'ORD-014', clientId: 'c7', clientName: "Nargiza Do'kon", clientPhone: '+998907070707',
    clientAddress: 'Toshkent, Uchtepa',
    agentId: 'agent3', agentName: 'Bobur Karimov',
    deliveryId: 'delivery1', deliveryName: 'Jasur Razzaqov',
    items: [
      { productId: 'p9', productName: 'Milkis Strawberry 0.5L (yashik)', quantity: 6, price: 78000 },
      { productId: 'p1', productName: 'Coca-Cola 0.5L (yashik)', quantity: 4, price: 85000 },
    ],
    total: 808000, status: 'delivered', date: '2026-03-15',
  },
];

export const dailyOrdersData = [
  { day: '8-Mar', orders: 4, sales: 1200000 },
  { day: '9-Mar', orders: 6, sales: 1850000 },
  { day: '10-Mar', orders: 5, sales: 1600000 },
  { day: '11-Mar', orders: 8, sales: 2400000 },
  { day: '12-Mar', orders: 7, sales: 2100000 },
  { day: '13-Mar', orders: 9, sales: 2750000 },
  { day: '14-Mar', orders: 5, sales: 1745000 },
];

export const productSalesData = [
  { name: 'Coca-Cola', sales: 425000 },
  { name: 'Pepsi', sales: 665000 },
  { name: 'Sprite', sales: 400000 },
  { name: 'Fanta', sales: 656000 },
  { name: 'Lipton', sales: 330000 },
  { name: 'Aqua', sales: 585000 },
  { name: 'Red Bull', sales: 360000 },
  { name: 'Nescafe', sales: 285000 },
];

export const agentStatsData = [
  { id: 'agent1', name: 'Sardor Toshmatov', todaySales: 1205000, monthlySales: 8500000, ordersCount: 3, itemsSold: 19 },
  { id: 'agent2', name: 'Dilnoza Yusupova', todaySales: 992000, monthlySales: 6200000, ordersCount: 2, itemsSold: 9 },
  { id: 'agent3', name: 'Bobur Karimov', todaySales: 548000, monthlySales: 4100000, ordersCount: 2, itemsSold: 17 },
];

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ru-RU') + " so'm";
};