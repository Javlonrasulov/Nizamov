import { useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Language, translations } from '../i18n/translations';
import {
  User, users, Client, clients as initialClients,
  Order, orders as initialOrders, products as initialProducts, Product,
} from '../data/mockData';
import { AppContext } from './appContextInstance';
import { apiLogin } from '../api/auth';
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct } from '../api/products';
import { apiGetClients, apiCreateClient, apiUpdateClient, apiDeleteClient } from '../api/clients';
import { apiGetOrders, apiCreateOrder, apiUpdateOrder } from '../api/orders';
import { apiUpdateUser } from '../api/users';
import {
  apiGetExpenses,
  apiCreateExpense,
  apiDeleteExpense,
  apiGetExpenseCategories,
  apiCreateExpenseCategory,
  apiUpdateExpenseCategory as apiUpdateExpenseCategoryRequest,
  apiDeleteExpenseCategory as apiDeleteExpenseCategoryRequest,
} from '../api/expenses';

type Theme = 'light' | 'dark';

/* ─── Category definition ─── */
export interface ExpenseCategoryDef {
  id: string;
  label: string;
  iconName: string;   // lucide icon name key
  color: string;      // tailwind color key: 'blue' | 'purple' | ...
}

export const CATEGORY_COLORS = [
  'blue', 'purple', 'green', 'yellow', 'pink',
  'orange', 'cyan', 'indigo', 'teal', 'red', 'gray',
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];

export const COLOR_MAP: Record<string, { dot: string; badge: string; bar: string }> = {
  blue:   { dot: '#3b82f6', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',   bar: '#3b82f6' },
  purple: { dot: '#a855f7', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', bar: '#a855f7' },
  green:  { dot: '#22c55e', badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', bar: '#22c55e' },
  yellow: { dot: '#eab308', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', bar: '#eab308' },
  pink:   { dot: '#ec4899', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',   bar: '#ec4899' },
  orange: { dot: '#f97316', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', bar: '#f97316' },
  cyan:   { dot: '#06b6d4', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',   bar: '#06b6d4' },
  indigo: { dot: '#6366f1', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', bar: '#6366f1' },
  teal:   { dot: '#14b8a6', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',   bar: '#14b8a6' },
  red:    { dot: '#ef4444', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',       bar: '#ef4444' },
  gray:   { dot: '#6b7280', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',       bar: '#6b7280' },
};

/* Lucide icon names available for categories */
export const AVAILABLE_ICONS = [
  'Building2', 'Truck', 'Users', 'Zap', 'Megaphone', 'Wrench',
  'Package', 'ShoppingCart', 'Briefcase', 'CreditCard', 'Receipt',
  'BarChart2', 'Banknote', 'Landmark', 'Car', 'Fuel',
  'ClipboardList', 'Hammer', 'Settings', 'Globe', 'Phone',
  'Box', 'Archive', 'Tag', 'Cpu', 'Monitor',
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];

const DEFAULT_CATEGORIES: ExpenseCategoryDef[] = [];

/* ─── Expense ─── */
export interface Expense {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  comment: string;
}

const initialExpenses: Expense[] = [];

/* ─── Context type ─── */
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
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  refetchData: () => Promise<void>;
  theme: Theme;
  toggleTheme: () => void;
  adminDateFrom: string;
  adminDateTo: string;
  setAdminDateRange: (from: string, to: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  expenseCategories: ExpenseCategoryDef[];
  addExpenseCategory: (cat: Omit<ExpenseCategoryDef, 'id'>) => Promise<boolean>;
  updateExpenseCategory: (id: string, updates: Partial<Omit<ExpenseCategoryDef, 'id'>>) => Promise<boolean>;
  deleteExpenseCategory: (id: string) => Promise<boolean>;
  updateMyProfile: (data: { name: string; phone: string; password?: string }) => Promise<boolean>;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('crm_lang') as Language) || 'uz_lat');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { const s = localStorage.getItem('crm_user'); if (s) return JSON.parse(s); } catch {}
    return users.find(u => u.id === 'agent1') ?? null;
  });

  const getTodayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [clientsList, setClientsList]   = useState<Client[]>(initialClients);
  const [ordersList, setOrdersList]     = useState<Order[]>(initialOrders);
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [theme, setTheme]               = useState<Theme>(() => (localStorage.getItem('crm_theme') as Theme) || 'light');
  // Adminda default bo'yicha "Bugun" ko'rsatilsin (aks holda empty qiymatlar sabab hamma vaqt filtrlanmay qoladi)
  const todayIso = useMemo(() => getTodayIso(), []);
  const [adminDateFrom, setAdminDateFrom] = useState(todayIso);
  const [adminDateTo,   setAdminDateTo]   = useState(todayIso);

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryDef[]>(DEFAULT_CATEGORIES);

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

  const fetchExpensesData = useCallback(async () => {
    const [cats, exps] = await Promise.all([
      apiGetExpenseCategories(),
      apiGetExpenses(),
    ]);
    setExpenseCategories(cats);
    setExpenses(exps);
    localStorage.removeItem('crm_expenses');
    localStorage.removeItem('crm_expense_cats');
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
    } catch {
      // Backend ishlamasa mock ma'lumotda qolamiz
    }
    try {
      await fetchExpensesData();
    } catch {
      setExpenses([]);
      setExpenseCategories(DEFAULT_CATEGORIES);
    }
  }, [fetchExpensesData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const login = async (phone: string, password: string): Promise<User | null> => {
    try {
      const user = await apiLogin({ phone, password });
      const withPassword = { ...user, password: '' };
      setCurrentUser(withPassword as User);
      localStorage.setItem('crm_user', JSON.stringify(withPassword));
      await fetchData();
      return withPassword as User;
    } catch {
      const clean = phone.replace(/\D/g, '');
      const u = users.find(x => x.phone.replace(/\D/g, '') === clean && x.password === password);
      if (u) {
        setCurrentUser(u);
        localStorage.setItem('crm_user', JSON.stringify(u));
        return u;
      }
      return null;
    }
  };
  const logout = () => { setCurrentUser(null); localStorage.removeItem('crm_user'); };

  const updateMyProfile: AppContextType['updateMyProfile'] = async (data) => {
    if (!currentUser) return false;
    const payload: Parameters<typeof apiUpdateUser>[1] = {
      name: data.name,
      phone: data.phone,
    };
    if (data.password) payload.password = data.password;

    try {
      const updated = await apiUpdateUser(currentUser.id, payload);
      const nextUser = { ...currentUser, ...updated, password: '' };
      setCurrentUser(nextUser as User);
      localStorage.setItem('crm_user', JSON.stringify(nextUser));
      return true;
    } catch {
      // Local fallback: still update UI (server might be temporarily unavailable)
      const nextUser = { ...currentUser, ...payload, password: '' };
      setCurrentUser(nextUser as User);
      localStorage.setItem('crm_user', JSON.stringify(nextUser));
      return false;
    }
  };

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
    // Optimistic update: UI status badge/filters darhol to'g'ri ko'rinsin.
    setOrdersList(p => p.map(o => o.id === id ? { ...o, status } : o));
    try {
      const updated = await apiUpdateOrder(id, { status });
      setOrdersList(p => p.map(o => o.id === id ? updated : o));
    } catch {
      // Catch'da optimistic update o'zi yetarli.
    }
  };
  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const updated = await apiUpdateOrder(id, { status: updates.status, deliveryId: updates.deliveryId, deliveryName: updates.deliveryName, vehicleName: updates.vehicleName });
      setOrdersList(p => p.map(o => o.id === id ? { ...o, ...updates } : o));
    } catch {
      setOrdersList(p => p.map(o => o.id === id ? { ...o, ...updates } : o));
    }
  };
  const addProduct = async (p: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      const created = await apiCreateProduct(p);
      setProductsList(prev => [...prev, created]);
      return true;
    } catch {
      setProductsList(prev => [...prev, { ...p, id: `p${Date.now()}` }]);
      return false;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<boolean> => {
    try {
      const updated = await apiUpdateProduct(id, updates);
      setProductsList(p => p.map(x => x.id === id ? updated : x));
      return true;
    } catch {
      setProductsList(p => p.map(x => x.id === id ? { ...x, ...updates } : x));
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      await apiDeleteProduct(id);
      setProductsList(prev => prev.filter(p => p.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  const setAdminDateRange = (from: string, to: string) => { setAdminDateFrom(from); setAdminDateTo(to); };

  const addExpense: AppContextType['addExpense'] = async (expense) => {
    try {
      const created = await apiCreateExpense(expense);
      setExpenses(prev => [created, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  const deleteExpense: AppContextType['deleteExpense'] = async (id) => {
    try {
      await apiDeleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  const addExpenseCategory: AppContextType['addExpenseCategory'] = async (cat) => {
    try {
      const created = await apiCreateExpenseCategory(cat);
      setExpenseCategories(prev => [...prev, created].sort((a, b) => a.label.localeCompare(b.label)));
      return true;
    } catch {
      return false;
    }
  };

  const updateExpenseCategory: AppContextType['updateExpenseCategory'] = async (id, updates) => {
    try {
      const updated = await apiUpdateExpenseCategoryRequest(id, updates);
      setExpenseCategories(prev => prev.map(cat => (cat.id === id ? updated : cat)).sort((a, b) => a.label.localeCompare(b.label)));
      return true;
    } catch {
      return false;
    }
  };

  const deleteExpenseCategory: AppContextType['deleteExpenseCategory'] = async (id) => {
    try {
      await apiDeleteExpenseCategoryRequest(id);
      await fetchExpensesData();
      return true;
    } catch {
      return false;
    }
  };

  const value: AppContextType = {
    lang, setLang: setLangPersist, t,
    currentUser, login, logout,
    clients: clientsList, addClient, updateClient, deleteClient,
    orders: ordersList, addOrder, updateOrderStatus, updateOrder,
    products: productsList, addProduct, updateProduct, deleteProduct, refetchData: fetchData,
    theme, toggleTheme,
    adminDateFrom, adminDateTo, setAdminDateRange,
    expenses, addExpense, deleteExpense,
    expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory,
    updateMyProfile,
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