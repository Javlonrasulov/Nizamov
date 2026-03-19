import { useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Language, translations } from '../i18n/translations';
import {
  User, users, Client, clients as initialClients,
  Order, orders as initialOrders, products as initialProducts, Product,
} from '../data/mockData';
import { AppContext } from './appContextInstance';
import { apiLogin } from '../api/auth';
import { apiGetProducts, apiCreateProduct } from '../api/products';
import { apiGetClients, apiCreateClient, apiUpdateClient, apiDeleteClient } from '../api/clients';
import { apiGetOrders, apiCreateOrder, apiUpdateOrder } from '../api/orders';
import { apiGetUsers } from '../api/users';

type Theme = 'light' | 'dark';

export interface ExpenseCategoryDef {
  id: string;
  label: string;
  iconName: string;
  color: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  comment: string;
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['uz_lat']) => string;
  currentUser: User | null;
  login: (phone: string, password: string) => Promise<User | null>;
  logout: () => void;
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id'>>) => void;
  deleteClient: (id: string) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  refetchData: () => Promise<void>;
  apiConnected: boolean;
  theme: Theme;
  toggleTheme: () => void;
  adminDateFrom: string;
  adminDateTo: string;
  setAdminDateRange: (from: string, to: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  expenseCategories: ExpenseCategoryDef[];
  addExpenseCategory: (cat: Omit<ExpenseCategoryDef, 'id'>) => void;
  updateExpenseCategory: (id: string, updates: Partial<Omit<ExpenseCategoryDef, 'id'>>) => void;
  deleteExpenseCategory: (id: string) => void;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('crm_lang') as Language) || 'uz_lat');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { const s = localStorage.getItem('crm_user'); if (s) return JSON.parse(s); } catch {}
    return null;
  });
  const [clientsList, setClientsList] = useState<Client[]>(initialClients);
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders);
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('crm_theme') as Theme) || 'light');
  const [adminDateFrom, setAdminDateFrom] = useState('');
  const [adminDateTo, setAdminDateTo] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryDef[]>([]);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('crm_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const t = useCallback((key: keyof typeof translations['uz_lat']): string =>
    translations[lang][key] || key, [lang]);
  const setLangPersist = useCallback((l: Language) => {
    setLang(l); localStorage.setItem('crm_lang', l);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [prods, clis, ords] = await Promise.all([
        apiGetProducts(),
        apiGetClients(),
        apiGetOrders(),
      ]);
      setProductsList(prods);
      setClientsList(clis);
      setOrdersList(ords);
      setApiConnected(true);
    } catch {
      setApiConnected(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Ilova fokusiga qaytganda (APK yoki brauzer) serverdan ma'lumotlarni yangilash
  useEffect(() => {
    if (!currentUser) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [currentUser?.id, fetchData]);

  // Mock login holatida backend ID ni telefon orqali aniqlash
  useEffect(() => {
    if (!apiConnected || !currentUser) return;
    const phoneNorm = (s: string) => (s || '').replace(/\D/g, '');
    if (currentUser.role === 'agent') {
      if (clientsList.some(c => c.agentId === currentUser.id)) return; // allaqachon mos
      apiGetUsers('agent').then(agents => {
        const match = agents.find(a => phoneNorm(a.phone) === phoneNorm(currentUser!.phone));
        if (match && match.id !== currentUser.id) {
          const updated = { ...currentUser, id: match.id };
          setCurrentUser(updated);
          localStorage.setItem('crm_user', JSON.stringify(updated));
        }
      }).catch(() => {});
    }

    if (currentUser.role === 'delivery') {
      // Agar backend orderlar ichida deliveryId mos kelmasa, telefon orqali moslab qo'yamiz
      if (ordersList.some(o => o.deliveryId === currentUser.id)) return;
      apiGetUsers('delivery').then(deliveries => {
        const match = deliveries.find(d => phoneNorm(d.phone) === phoneNorm(currentUser!.phone));
        if (match && match.id !== currentUser.id) {
          const updated = { ...currentUser, id: match.id };
          setCurrentUser(updated);
          localStorage.setItem('crm_user', JSON.stringify(updated));
        }
      }).catch(() => {});
    }
  }, [apiConnected, currentUser?.id, currentUser?.phone, currentUser?.role, clientsList, ordersList]);

  const login = async (phone: string, password: string): Promise<User | null> => {
    try {
      const user = await apiLogin(phone, password);
      const withPassword = { ...user, password: '' } as User;
      setCurrentUser(withPassword);
      localStorage.setItem('crm_user', JSON.stringify(withPassword));
      await fetchData();
      return withPassword;
    } catch {
      const clean = phone.replace(/\D/g, '');
      const u = users.find(x => x.phone.replace(/\D/g, '') === clean && x.password === password);
      if (u) { setCurrentUser(u); localStorage.setItem('crm_user', JSON.stringify(u)); return u; }
      return null;
    }
  };
  const logout = () => { setCurrentUser(null); localStorage.removeItem('crm_user'); };

  const addClient = async (c: Omit<Client, 'id'>) => {
    try {
      const created = await apiCreateClient(c);
      setClientsList(p => [created, ...p]);
    } catch {
      setClientsList(p => [...p, { ...c, id: `c${Date.now()}` }]);
    }
  };
  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id'>>) => {
    try {
      const updated = await apiUpdateClient(id, updates);
      setClientsList(p => p.map(x => x.id === id ? updated : x));
    } catch {
      setClientsList(p => p.map(x => x.id === id ? { ...x, ...updates } : x));
    }
  };
  const deleteClient = async (id: string) => {
    try {
      await apiDeleteClient(id);
      setClientsList(p => p.filter(c => c.id !== id));
    } catch {
      setClientsList(p => p.filter(c => c.id !== id));
    }
  };
  const addOrder = async (o: Omit<Order, 'id'>) => {
    try {
      const created = await apiCreateOrder(o);
      setOrdersList(p => [created, ...p]);
    } catch {
      setOrdersList(p => [{ ...o, id: `ORD-${String(p.length + 1).padStart(3, '0')}` }, ...p]);
    }
  };
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updated = await apiUpdateOrder(id, { status });
      setOrdersList(p => p.map(o => o.id === id ? updated : o));
    } catch {
      setOrdersList(p => p.map(o => o.id === id ? { ...o, status } : o));
    }
  };
  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      await apiUpdateOrder(id, {
        status: updates.status,
        deliveryId: updates.deliveryId,
        deliveryName: updates.deliveryName,
        total: updates.total,
        items: updates.items,
      });
      setOrdersList(p => p.map(o => o.id === id ? { ...o, ...updates } : o));
    } catch {
      setOrdersList(p => p.map(o => o.id === id ? { ...o, ...updates } : o));
    }
  };
  const addProduct = async (p: Omit<Product, 'id'>) => {
    try {
      const created = await apiCreateProduct(p);
      setProductsList(prev => [...prev, created]);
    } catch {
      setProductsList(prev => [...prev, { ...p, id: `p${Date.now()}` }]);
    }
  };
  const setAdminDateRange = (from: string, to: string) => { setAdminDateFrom(from); setAdminDateTo(to); };
  const addExpense = (e: Omit<Expense, 'id'>) => setExpenses(prev => [{ ...e, id: `exp${Date.now()}` }, ...prev]);
  const deleteExpense = (id: string) => setExpenses(p => p.filter(e => e.id !== id));
  const addExpenseCategory = (cat: Omit<ExpenseCategoryDef, 'id'>) =>
    setExpenseCategories(p => [...p, { ...cat, id: `cat_${Date.now()}` }]);
  const updateExpenseCategory = () => {};
  const deleteExpenseCategory = () => {};

  const value: AppContextType = {
    lang, setLang: setLangPersist, t,
    currentUser, login, logout,
    clients: clientsList, addClient, updateClient, deleteClient,
    orders: ordersList, addOrder, updateOrderStatus, updateOrder,
    products: productsList, addProduct, refetchData: fetchData, apiConnected,
    theme, toggleTheme,
    adminDateFrom, adminDateTo, setAdminDateRange,
    expenses, addExpense, deleteExpense,
    expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx as AppContextType;
};
