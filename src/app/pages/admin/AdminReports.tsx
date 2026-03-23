import { useEffect, useMemo, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Check, X, Trash2, Pencil, Plus, CalendarDays,
  Download, TrendingUp, TrendingDown, Wallet, SlidersHorizontal, ChevronDown, ChevronUp, Table2, Banknote, RotateCcw, Package, Users, Truck, UserCog, Warehouse, BarChart2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp, AVAILABLE_ICONS, CATEGORY_COLORS, COLOR_MAP, ExpenseCategoryDef } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { SimpleLineChart, SimpleGroupedBar, SimpleVBarChart } from '../../components/SimpleCharts';
import { useAdminVisibleOrders, CalendarPopup, dateToIso, formatDisplay, getMonthKey, normalizeDateValue } from '../../components/AdminDateFilter';
import { apiGetClientBalance } from '../../api/payments';
import { apiGetReturns } from '../../api/returns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { apiGetOrders } from '../../api/orders';
import { apiGetSuppliers } from '../../api/suppliers';
import { apiGetUsers } from '../../api/users';
import { apiGetSupplier } from '../../api/suppliers';

const STATUS_UZ: Record<string, string> = {
  new: 'Yangi',
  tayyorlanmagan: 'Tayyorlanmagan',
  yuborilgan: 'Yuborilgan',
  accepted: 'Qabul qilindi',
  delivering: 'Yetkazilmoqda',
  delivered: 'Yetkazilgan',
  cancelled: 'Bekor qilindi',
  sent: 'Yuborilgan',
};
const ROLE_UZ: Record<string, string> = {
  agent: 'Agent',
  delivery: 'Yetkazib beruvchi',
  admin: 'Admin',
  sklad: 'Ombor',
};

function shortId(id: string, num?: number | null): string {
  if (num != null) return `#${num}`;
  return `#${id.slice(-8)}`;
}

/* ── Dynamic Lucide icon renderer ── */
function CatIcon({ name, size = 15, className = '', style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return <LucideIcons.Package size={size} className={className} style={style} />;
  return <Icon size={size} className={className} style={style} />;
}

/* ── Donut chart with legend ── */
function DonutWithLegend({
  data, totalExpense, t,
}: {
  data: { label: string; value: number; color: string; pct: number }[];
  totalExpense: number;
  t: (k: string) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 52, stroke = 22, C = 2 * Math.PI * R;
  let offset = 0;
  const segs = data.filter(d => d.value > 0).map(d => {
    const dash = (d.value / total) * C;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full">
      {/* Donut */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <svg width={144} height={144} viewBox="0 0 144 144">
          <circle cx={72} cy={72} r={R} fill="none" stroke="currentColor" strokeWidth={stroke}
            className="text-gray-100 dark:text-gray-700" />
          {segs.map((s, i) => (
            <circle key={i} cx={72} cy={72} r={R} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '72px 72px' }}
            />
          ))}
          <text x={72} y={67} textAnchor="middle" fontSize={8} className="fill-gray-400 dark:fill-gray-500">Jami</text>
          <text x={72} y={82} textAnchor="middle" fontSize={12} fontWeight="700"
            className="fill-gray-900 dark:fill-white">
            {total >= 1_000_000 ? `${(total / 1_000_000).toFixed(1)}M` : `${(total / 1000).toFixed(0)}K`}
          </text>
        </svg>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
          {totalExpense.toLocaleString()} {t('common.sum')}
        </p>
      </div>

      {/* Legend: name + % + amount */}
      <div className="flex-1 w-full space-y-2 min-w-0">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5">
            {/* Color dot */}
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            {/* Name */}
            <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate min-w-0">{s.label}</span>
            {/* Percent badge */}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums"
              style={{ background: s.color + '22', color: s.color }}>
              {s.pct.toFixed(1)}%
            </span>
            {/* Amount */}
            <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums flex-shrink-0 ml-1">
              {s.value.toLocaleString()} {t('common.sum')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Icon picker grid ── */
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1">
      {AVAILABLE_ICONS.map(name => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          title={name}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            value === name
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CatIcon name={name} size={15} />
        </button>
      ))}
    </div>
  );
}

const EXCEL_EXPORT_STORAGE_KEY = 'crm_excel_export_last';

function getLastExported(key: string): string | null {
  try {
    const raw = localStorage.getItem(EXCEL_EXPORT_STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj[key] || null;
  } catch {
    return null;
  }
}

function setLastExported(key: string, value: string) {
  try {
    const raw = localStorage.getItem(EXCEL_EXPORT_STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    obj[key] = value;
    localStorage.setItem(EXCEL_EXPORT_STORAGE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}

function buildAcceptedReturnsMapByDate(
  rows: any[],
  orderById: Map<string, any>,
  dateFrom?: string,
  dateTo?: string,
) {
  const next: Record<string, number> = {};

  for (const row of rows || []) {
    const order = orderById.get(row.orderId);
    if (!order) continue;

    const returnDate = row.date || row.acceptedAt?.slice?.(0, 10);
    if (!returnDate) continue;
    if (dateFrom && returnDate < dateFrom) continue;
    if (dateTo && returnDate > dateTo) continue;

    const priceByProductId = new Map<string, number>();
    for (const item of order.items || []) {
      priceByProductId.set(item.productId, Number(item.price || 0));
    }

    const amount = (row.items || []).reduce((sum: number, item: any) => (
      sum + Number(item.quantity || 0) * (priceByProductId.get(item.productId) || 0)
    ), 0);

    next[returnDate] = (next[returnDate] || 0) + amount;
  }

  return next;
}

/* ── Color picker ── */
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            value === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
          }`}
          style={{ background: COLOR_MAP[c].dot }}
          title={c}
        />
      ))}
    </div>
  );
}

/* ── Category manager panel ── */
function CategoryManager() {
  const { expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, t, expenses, adminDateFrom, adminDateTo } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('Package');
  const [editColor, setEditColor] = useState('gray');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState<string>('Package');
  const [newColor, setNewColor] = useState<string>('blue');

  /* Filtered expenses for percentage calc */
  const filteredExp = expenses.filter(e => {
    if (!adminDateFrom && !adminDateTo) return true;
    const from = adminDateFrom || '0000-00-00';
    const to   = adminDateTo   || '9999-99-99';
    return e.date >= from && e.date <= to;
  });
  const totalExp = filteredExp.reduce((s, e) => s + e.amount, 0);
  const catTotals: Record<string, number> = {};
  filteredExp.forEach(e => { catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount; });

  const startEdit = (cat: ExpenseCategoryDef) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditIcon(cat.iconName);
    setEditColor(cat.color);
    setShowAddForm(false);
  };

  const saveEdit = () => {
    if (!editLabel.trim() || !editingId) return;
    updateExpenseCategory(editingId, { label: editLabel.trim(), iconName: editIcon, color: editColor });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addExpenseCategory({ label: newLabel.trim(), iconName: newIcon, color: newColor });
    setNewLabel('');
    setNewIcon('Package');
    setNewColor('blue');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3">
      {/* Existing categories */}
      <div className="grid grid-cols-1 gap-2">
        {expenseCategories.map(cat => {
          const cm = COLOR_MAP[cat.color] || COLOR_MAP.gray;
          const isEditing = editingId === cat.id;
          return (
            <div key={cat.id}
              className={`rounded-xl border transition-all ${
                isEditing
                  ? 'border-[#2563EB] dark:border-blue-500 bg-blue-50/40 dark:bg-blue-900/10'
                  : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              {isEditing ? (
                <div className="p-4 space-y-3">
                  {/* Label */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">{t('admin.reports.catName')}</label>
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  {/* Icon */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{t('admin.reports.catIcon')}</label>
                    <IconPicker value={editIcon} onChange={setEditIcon} />
                  </div>
                  {/* Color */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{t('admin.reports.catColor')}</label>
                    <ColorPicker value={editColor} onChange={setEditColor} />
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                      <Check size={13} /> {t('common.save')}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <X size={13} /> {t('common.cancel')}
                    </button>
                    <button onClick={() => { deleteExpenseCategory(cat.id); setEditingId(null); }}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={13} /> {t('common.delete')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cm.dot + '22' }}>
                    <CatIcon name={cat.iconName} size={15} style={{ color: cm.dot }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cat.label}</p>
                  </div>
                  {/* ─ Foiz va progress bar ── */}
                  {(() => {
                    const amt = catTotals[cat.id] ?? 0;
                    const pct = totalExp > 0 ? (amt / totalExp) * 100 : 0;
                    return (
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {/* Progress bar */}
                        <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: pct > 0 ? `${Math.max(pct, 3)}%` : '0%',
                              background: cm.dot,
                            }}
                          />
                        </div>
                        {/* Percent badge */}
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full tabular-nums min-w-[42px] text-center"
                          style={pct > 0
                            ? { background: cm.dot + '28', color: cm.dot }
                            : { background: 'transparent', color: '#9ca3af' }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                        {/* Amount */}
                        {amt > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums hidden sm:inline">
                            {amt.toLocaleString()}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ background: cm.dot }} />
                  <button
                    onClick={() => startEdit(cat)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex-shrink-0"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new */}
      {showAddForm ? (
        <div className="rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10 p-4 space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">{t('admin.reports.newCatName')}</label>
            <input
              autoFocus
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAddForm(false); }}
              placeholder={t('admin.reports.catPlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{t('admin.reports.catIcon')}</label>
            <IconPicker value={newIcon} onChange={setNewIcon} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{t('admin.reports.catColor')}</label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={!newLabel.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={13} /> {t('common.add')}
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 transition-colors">
              <X size={13} /> {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm font-medium hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all"
        >
          <Plus size={15} /> {t('admin.reports.newCategory')}
        </button>
      )}
    </div>
  );
}

/* ── Excel Export Modal ── */
type ExportCategory = 'orders' | 'clients' | 'products' | 'suppliers' | 'staff' | 'warehouse' | 'hisobot' | 'chiqimlar' | 'agentstats';
const EXPORT_CATEGORIES: { key: ExportCategory; labelKey: string; Icon: typeof Package }[] = [
  { key: 'orders', labelKey: 'admin.ordersPage', Icon: Table2 },
  { key: 'clients', labelKey: 'admin.clientsPage', Icon: Users },
  { key: 'products', labelKey: 'admin.productsPage', Icon: Package },
  { key: 'suppliers', labelKey: 'admin.suppliers', Icon: Truck },
  { key: 'staff', labelKey: 'admin.agentsPage', Icon: UserCog },
  { key: 'warehouse', labelKey: 'admin.warehouse', Icon: Warehouse },
  { key: 'hisobot', labelKey: 'admin.reports.dailyReport', Icon: TrendingUp },
  { key: 'chiqimlar', labelKey: 'admin.reports.expenses', Icon: TrendingDown },
  { key: 'agentstats', labelKey: 'admin.agentStats', Icon: BarChart2 },
];

function ExcelExportModal({
  open,
  onOpenChange,
  t,
  orders,
  clients,
  products,
  expenses,
  expenseCategories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  t: (k: string) => string;
  orders: Array<{ id: string; date: string; clientName: string; agentName: string; total: number; status: string; items?: Array<{ productName: string; quantity: number; price: number }> }>;
  clients: Array<{ id: string; name: string; phone: string; address: string }>;
  products: Array<{ id: string; name: string; price: number; cost: number; stock: number }>;
  expenses: Array<{ date: string; amount: number; categoryId: string; comment: string }>;
  expenseCategories: ExpenseCategoryDef[];
}) {
  const today = dateToIso(new Date());
  const getThisWeekRange = () => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    const from = new Date(now);
    from.setDate(now.getDate() - day);
    return { from: dateToIso(from), to: today };
  };
  const getThisMonthRange = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: dateToIso(from), to: today };
  };
  const week = getThisWeekRange();
  const month = getThisMonthRange();

  const [selected, setSelected] = useState<Record<ExportCategory, boolean>>({
    orders: false,
    clients: false,
    products: false,
    suppliers: false,
    staff: false,
    warehouse: false,
    hisobot: false,
    chiqimlar: false,
    agentstats: false,
  });
  const [tempFrom, setTempFrom] = useState(today);
  const [tempTo, setTempTo] = useState(today);
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (key: ExportCategory, v: boolean) => {
    setSelected(prev => ({ ...prev, [key]: v }));
  };

  const selectAll = (v: boolean) => {
    setSelected({ orders: v, clients: v, products: v, suppliers: v, staff: v, warehouse: v, hisobot: v, chiqimlar: v, agentstats: v });
  };

  const allSelected = Object.values(selected).every(Boolean);
  const anySelected = Object.values(selected).some(Boolean);

  const handleDateSelect = (iso: string) => {
    if (selecting === 'from') {
      setTempFrom(iso);
      setTempTo(iso);
      setSelecting('to');
    } else {
      if (iso < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(iso);
      } else {
        setTempTo(iso);
      }
      setCalendarOpen(false);
    }
  };

  const handleQuickDate = (from: string, to: string) => {
    setTempFrom(from);
    setTempTo(to);
    setCalendarOpen(false);
  };

  const doExport = async () => {
    if (!anySelected) return;
    setLoading(true);
    const from = tempFrom || today;
    const to = tempTo || tempFrom || today;
    const wb = XLSX.utils.book_new();
    const now = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');

    try {
      if (selected.orders) {
        const ord = await apiGetOrders({ dateFrom: from, dateTo: to }) as any[];
        const h = ['#', 'Sana', 'Klient', 'Telefon', 'Manzil', 'Agent', 'Yetkazuvchi', 'Mashina', 'Jami', 'Status', 'Mahsulotlar', 'Izoh'];
        const rows = ord.map(o => [
          shortId(o.id, o.orderNumber),
          formatDisplay(o.date || ''),
          o.clientName || '',
          o.clientPhone || '',
          o.clientAddress || '',
          o.agentName || '',
          o.deliveryName || '',
          o.vehicleName || '',
          o.total || 0,
          STATUS_UZ[o.status] || o.status,
          (o.items || []).map((i: any) => `${i.productName} ${i.quantity}×${i.price}`).join('; ') || '',
          o.comment || '',
        ]);
        const ws = XLSX.utils.aoa_to_sheet([h, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, 'Zakazlar');
        setLastExported('orders', new Date().toISOString());
      }

      if (selected.clients) {
        const [balances, agentUsers] = await Promise.all([
          Promise.all(clients.map(c => apiGetClientBalance(c.id).catch(() => null))),
          apiGetUsers('agent').catch(() => []),
        ]);
        const agentMap = new Map(agentUsers.map(u => [u.id, u.name]));
        const h = ['#', 'Ism', 'Telefon', 'Manzil', 'Agent', 'Tashrif kunlari', 'Jami zakaz', 'Jami savdo', 'Qarz'];
        const rows = clients.map((c, i) => {
          const bal = balances[i];
          const cd = c as any;
          return [
            shortId(c.id),
            c.name || '',
            c.phone || '',
            c.address || '',
            agentMap.get(cd.agentId) || cd.agentName || '-',
            (cd.visitDays || []).join(', ') || '-',
            bal?.perOrder?.length ?? 0,
            bal?.deliveredTotal ?? 0,
            bal?.debt ?? 0,
          ];
        });
        const ws = XLSX.utils.aoa_to_sheet([h, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, 'Klientlar');
        setLastExported('clients', new Date().toISOString());
      }

      if (selected.products) {
        const h = ['#', 'Nomi', 'Narx', 'Tannarx', 'Qoldiq', 'Foyda'];
        const rows = products.map(p => [
          shortId(p.id),
          p.name || '',
          p.price ?? 0,
          p.cost ?? 0,
          p.stock ?? 0,
          ((p.price ?? 0) - (p.cost ?? 0)),
        ]);
        const ws = XLSX.utils.aoa_to_sheet([h, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');
        setLastExported('products', new Date().toISOString());
      }

      if (selected.suppliers) {
        const supp = await apiGetSuppliers();
        const h = ['#', 'Nomi', 'Telefon', 'Manzil', 'Izoh', 'Olingan', "To'langan", 'Qarz', "Oxirgi yetkazish", "Oxirgi to'lov"];
        const rows = supp.map(s => [
          shortId(s.id),
          s.name || '',
          s.phone || '',
          s.address || '',
          s.comment || '',
          s.totalReceived ?? 0,
          s.totalPaid ?? 0,
          s.remainingDebt ?? 0,
          s.lastDeliveryAt || '-',
          s.lastPaymentAt || '-',
        ]);
        const ws = XLSX.utils.aoa_to_sheet([h, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, 'Yetkazib beruvchilar');
        setLastExported('suppliers', new Date().toISOString());
      }

      if (selected.staff) {
        const users = await apiGetUsers();
        const h = ['#', 'Ism', 'Telefon', 'Rol', 'Mashina'];
        const rows = users.map(u => [
          shortId(u.id),
          u.name || '',
          u.phone || '',
          ROLE_UZ[u.role] || u.role,
          (u as any).vehicleName || '',
        ]);
        const ws = XLSX.utils.aoa_to_sheet([h, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, 'Xodimlar');
        setLastExported('staff', new Date().toISOString());
      }

      if (selected.hisobot) {
        const ord = await apiGetOrders({ dateFrom: from, dateTo: to }) as any[];
        const delivered = ord.filter((o: any) => o.status === 'delivered');
        const visibleOrderById = new Map(
          orders
            .filter((o: any) => o.status !== 'new')
            .map((o: any) => [o.id, o] as const),
        );
        const productCostById: Record<string, number> = {};
        products.forEach(p => { productCostById[p.id] = p.cost ?? 0; });

        let paidByOrderId: Record<string, number> = {};
        let returnsDetailByOrderId: Record<string, { returnedAmount: number; deliveredAmount: number; returnedQtyByProductId: Record<string, number> }> = {};
        let acceptedReturnsByDate: Record<string, number> = {};

        if (delivered.length > 0 || visibleOrderById.size > 0) {
          const clientIds = Array.from(new Set(delivered.map((o: any) => o.clientId).filter(Boolean)));
          const [balances, allReturnsRows, acceptedReturnsRows] = await Promise.all([
            Promise.all(clientIds.map((cid: string) => apiGetClientBalance(cid).catch(() => null))),
            apiGetReturns().catch(() => []),
            apiGetReturns({ status: 'accepted' }).catch(() => []),
          ]);
          for (const balance of balances) {
            for (const row of balance?.perOrder ?? []) {
              paidByOrderId[row.orderId] = row.paid ?? 0;
            }
          }
          acceptedReturnsByDate = buildAcceptedReturnsMapByDate(
            acceptedReturnsRows || [],
            visibleOrderById,
            from || undefined,
            to || undefined,
          );

          const orderMap = new Map(delivered.map((o: any) => [o.id, o]));
          const returnedQtyByOrder = new Map<string, Record<string, number>>();
          for (const row of allReturnsRows || []) {
            if (!orderMap.has(row.orderId)) continue;
            const byProduct = returnedQtyByOrder.get(row.orderId) || {};
            for (const item of row.items || []) {
              byProduct[item.productId] = (byProduct[item.productId] || 0) + (item.quantity || 0);
            }
            returnedQtyByOrder.set(row.orderId, byProduct);
          }
          for (const order of delivered) {
            const returnedQtyByProductId = returnedQtyByOrder.get(order.id) || {};
            let returnedAmount = 0, deliveredAmount = 0;
            for (const item of order.items || []) {
              const oq = Number(item.quantity || 0), rq = Math.min(oq, returnedQtyByProductId[item.productId] || 0);
              returnedAmount += rq * (item.price || 0);
              deliveredAmount += Math.max(0, oq - rq) * (item.price || 0);
            }
            returnsDetailByOrderId[order.id] = { returnedAmount, deliveredAmount, returnedQtyByProductId };
          }
        }

        const dateMap: Record<string, number> = {};
        const profitMap: Record<string, number> = {};
        const ordersCountMap: Record<string, number> = {};
        const debtMap: Record<string, number> = {};
        for (const order of delivered) {
          const rd = returnsDetailByOrderId[order.id];
          const paid = Math.max(0, paidByOrderId[order.id] ?? 0);
          const adjustedRevenue = rd?.deliveredAmount ?? order.total;
          const returnedAmount = rd?.returnedAmount ?? 0;
          const collected = Math.min(adjustedRevenue, paid);
          const debt = Math.max(0, adjustedRevenue - collected);
          let adjustedGrossProfit = 0;
          for (const item of order.items || []) {
            const returnedQty = Math.min(Number(item.quantity || 0), rd?.returnedQtyByProductId[item.productId] || 0);
            const deliveredQty = Math.max(0, Number(item.quantity || 0) - returnedQty);
            const cost = productCostById[item.productId] ?? 0;
            adjustedGrossProfit += deliveredQty * ((item.price || 0) - cost);
          }
          const collectionRatio = adjustedRevenue > 0 ? Math.min(1, collected / adjustedRevenue) : 0;
          const realizedGrossProfit = adjustedGrossProfit * collectionRatio;

          dateMap[order.date] = (dateMap[order.date] || 0) + collected;
          profitMap[order.date] = (profitMap[order.date] || 0) + realizedGrossProfit;
          ordersCountMap[order.date] = (ordersCountMap[order.date] || 0) + 1;
          debtMap[order.date] = (debtMap[order.date] || 0) + debt;
        }
        const fromStr = from || '0000-00-00', toStr = to || '9999-99-99';
        const expByDate: Record<string, number> = {};
        expenses.filter(e => e.date >= fromStr && e.date <= toStr).forEach(e => {
          expByDate[e.date] = (expByDate[e.date] || 0) + e.amount;
        });
        const reportDates = Array.from(new Set([
          ...Object.keys(dateMap),
          ...Object.keys(acceptedReturnsByDate),
          ...Object.keys(expByDate),
        ])).sort();
        const dailyRows = reportDates.map((date) => ({
          date,
          orders: ordersCountMap[date] || 0,
          sales: dateMap[date] || 0,
          returns: acceptedReturnsByDate[date] || 0,
          debt: debtMap[date] || 0,
          profit: profitMap[date] || 0,
        }));
        const h1 = ['Sana', 'Zakazlar', 'Savdo', 'Vozvrat', 'Qarz', 'Chiqim', 'Foyda', 'Sof foyda'];
        const r1 = dailyRows.map(r => {
          const chiqim = expByDate[r.date] || 0;
          const sofFoyda = Math.round(r.profit) - chiqim;
          return [r.date, r.orders, r.sales, r.returns, r.debt, chiqim, Math.round(r.profit), sofFoyda];
        });
        const totalOrders = r1.reduce((s, r) => s + (r[1] as number), 0);
        const totalSales = r1.reduce((s, r) => s + (r[2] as number), 0);
        const totalReturns = r1.reduce((s, r) => s + (r[3] as number), 0);
        const totalDebt = r1.reduce((s, r) => s + (r[4] as number), 0);
        const totalChiqim = Object.values(expByDate).reduce((s, v) => s + v, 0);
        const totalFoyda = r1.reduce((s, r) => s + (r[6] as number), 0);
        const totalSofFoyda = totalFoyda - totalChiqim;
        r1.push(['Umumiy', totalOrders, totalSales, totalReturns, totalDebt, totalChiqim, totalFoyda, totalSofFoyda]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([h1, ...r1]), 'Hisobot');
        setLastExported('hisobot', new Date().toISOString());
      }

      if (selected.chiqimlar) {
        const fromStr = from || '0000-00-00', toStr = to || '9999-99-99';
        const filtered = expenses.filter(e => e.date >= fromStr && e.date <= toStr);
        const h2 = ['Sana', 'Kategoriya', 'Summa', 'Izoh'];
        const r2 = filtered.map(e => [
          e.date,
          expenseCategories.find(c => c.id === e.categoryId)?.label || e.categoryId,
          e.amount,
          e.comment,
        ]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([h2, ...r2]), 'Chiqimlar');
        setLastExported('chiqimlar', new Date().toISOString());
      }

      if (selected.agentstats) {
        const ord = await apiGetOrders({ dateFrom: from, dateTo: to }) as any[];
        const refDate = to || from || today;
        const refMonth = getMonthKey(refDate, today);
        const byAgent = new Map<string, { name: string; periodSales: number; monthlySales: number; ordersCount: number; itemsSold: number }>();
        for (const o of ord) {
          const aid = o.agentId || 'unknown';
          const cur = byAgent.get(aid) || { name: o.agentName || aid, periodSales: 0, monthlySales: 0, ordersCount: 0, itemsSold: 0 };
          cur.periodSales += o.total || 0;
          cur.ordersCount += 1;
          cur.itemsSold += (o.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0);
          if (getMonthKey(o.date, refDate) === refMonth) cur.monthlySales += o.total || 0;
          byAgent.set(aid, cur);
        }
        const agentList = Array.from(byAgent.values()).sort((a, b) => b.periodSales - a.periodSales);
        const h = ['Agent', 'Davr savdosi', 'Oylik savdo', 'Zakazlar soni', 'Mahsulotlar soni'];
        const rows = agentList.map(a => [a.name, a.periodSales, a.monthlySales, a.ordersCount, a.itemsSold]);
        const totSales = rows.reduce((s, r) => s + (r[1] as number), 0);
        const totMonthly = rows.reduce((s, r) => s + (r[2] as number), 0);
        const totOrders = rows.reduce((s, r) => s + (r[3] as number), 0);
        const totItems = rows.reduce((s, r) => s + (r[4] as number), 0);
        rows.push(['Umumiy', totSales, totMonthly, totOrders, totItems]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([h, ...rows]), 'Agent statistikasi');
        setLastExported('agentstats', new Date().toISOString());
      }

      if (selected.warehouse) {
        const ord = orders as any[];
        const soldByProduct: Record<string, number> = {};
        ord
          .filter((o: any) => o.status !== 'cancelled' && o.status !== 'new')
          .forEach((o: any) => (o.items || []).forEach((it: any) => {
            soldByProduct[it.productId] = (soldByProduct[it.productId] || 0) + (it.quantity || 0);
          }));
        const h1 = ['#', 'Mahsulot', 'Jami kirgan', 'Jami sotilgan', 'Qoldiq', 'Tannarx', 'Sotuv narxi', 'Foyda', 'Holat'];
        const rows1 = products.map(p => {
          const totalSold = soldByProduct[p.id] || 0;
          const remaining = p.stock || 0;
          const totalIn = remaining + totalSold;
          const profit = (p.price ?? 0) - (p.cost ?? 0);
          const ratio = totalIn > 0 ? remaining / totalIn : 0;
          const holat = ratio > 0.5 ? 'Yetarli' : ratio > 0.2 ? "O'rta" : 'Kam';
          return [
            shortId(p.id),
            p.name || '',
            totalIn,
            totalSold,
            remaining,
            p.cost ?? 0,
            p.price ?? 0,
            profit,
            holat,
          ];
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([h1, ...rows1]), 'Ombor');
        const suppList = await apiGetSuppliers();
        const allStockIns: Array<{ date: string; supplierName: string; productName: string; qty: number; cost: number; total: number }> = [];
        await Promise.all(suppList.map(async (s) => {
          try {
            const detail = await apiGetSupplier(s.id);
            for (const si of detail.stockIns || []) {
              for (const it of si.items || []) {
                allStockIns.push({
                  date: si.date,
                  supplierName: detail.name || s.name || '',
                  productName: it.productName || '',
                  qty: it.quantity || 0,
                  cost: it.costPrice || 0,
                  total: it.total || 0,
                });
              }
            }
          } catch { /* ignore */ }
        }));
        allStockIns.sort((a, b) => a.date.localeCompare(b.date));
        const h2 = ['Sana', 'Yetkazib beruvchi', 'Mahsulot', 'Miqdor', 'Tannarx', 'Summa'];
        const rows2 = allStockIns.map(r => [formatDisplay(r.date), r.supplierName, r.productName, r.qty, r.cost, r.total]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([h2, ...rows2]), 'Ombor kirimlari');
        setLastExported('warehouse', new Date().toISOString());
      }

      const fn = `eksport_${from}${to !== from ? `_${to}` : ''}_${now}.xlsx`;
      XLSX.writeFile(wb, fn);
      onOpenChange(false);
    } catch (e) {
      console.error('Excel export error:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatLast = (key: string) => {
    const v = getLastExported(key);
    if (!v) return t('admin.exportExcel.neverExported') || "Hech qachon";
    const d = new Date(v);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-6 gap-5 [&>button]:top-4 [&>button]:right-4 [&>button]:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Download size={18} className="text-green-600 dark:text-green-400" />
            </div>
            {t('admin.exportExcel')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Kategoriya tanlash */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {t('admin.exportExcel.selectCategories')}
            </p>
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  allSelected
                    ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Checkbox checked={allSelected} onCheckedChange={(v) => selectAll(!!v)} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t('admin.exportExcel.selectAll')}</span>
              </label>
              {EXPORT_CATEGORIES.map(({ key, labelKey, Icon }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selected[key]
                      ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected[key]} onCheckedChange={(v) => toggle(key, !!v)} />
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                      <Icon size={15} className="text-[#2563EB] dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t(labelKey)}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">{formatLast(key)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sana filtri — kalendar yashirin, ochganda bitta kalendardan tanlash */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {t('admin.exportExcel.dateFilter')}
            </p>
            <div className="flex gap-2 mb-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickDate(today, today)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  tempFrom === today && tempTo === today ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {t('admin.dateFilter.today')}
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(week.from, week.to)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  tempFrom === week.from && tempTo === week.to ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {t('admin.dateFilter.thisWeek')}
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(month.from, month.to)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  tempFrom === month.from && tempTo === month.to ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {t('admin.dateFilter.thisMonth')}
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setCalendarOpen(o => !o); setSelecting('from'); }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-[#2563EB] transition-all text-left"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {tempFrom === tempTo ? formatDisplay(tempFrom) : `${formatDisplay(tempFrom)} — ${formatDisplay(tempTo)}`}
              </span>
              {calendarOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {calendarOpen && (
              <div className="mt-2">
                <CalendarPopup selecting={selecting} dateFrom={tempFrom} dateTo={tempTo} onSelect={handleDateSelect} />
              </div>
            )}
          </div>

          <button
            onClick={doExport}
            disabled={!anySelected || loading}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-green-200/50 dark:shadow-green-900/20 transition-colors"
          >
            <Download size={16} />
            {loading ? t('common.loading') : t('admin.exportExcel.exportBtn')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export const AdminReports = () => {
  const { t, adminDateFrom, adminDateTo, expenses, addExpense, deleteExpense, expenseCategories, products, orders, clients } = useApp();
  const filteredOrders = useAdminVisibleOrders();
  const hasDateFilter = adminDateFrom || adminDateTo;
  const allAdminVisibleOrders = useMemo(
    () => orders.filter(o => o.status !== 'new'),
    [orders],
  );
  const deliveredOrders = useMemo(
    () => filteredOrders.filter(o => o.status === 'delivered'),
    [filteredOrders],
  );
  const [paidByOrderId, setPaidByOrderId] = useState<Record<string, number>>({});
  const [returnsDetailByOrderId, setReturnsDetailByOrderId] = useState<Record<string, {
    returnedAmount: number;
    deliveredAmount: number;
    returnedQtyByProductId: Record<string, number>;
  }>>({});
  const [acceptedReturnsByDate, setAcceptedReturnsByDate] = useState<Record<string, number>>({});

  /* Filtered expenses */
  const filteredExpenses = expenses.filter(e => {
    if (!adminDateFrom && !adminDateTo) return true;
    const from = adminDateFrom || '0000-00-00';
    const to   = adminDateTo   || '9999-99-99';
    return e.date >= from && e.date <= to;
  });

  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const productCostById: Record<string, number> = {};
  products.forEach(p => { productCostById[p.id] = p.cost ?? 0; });

  useEffect(() => {
    const clientIds = Array.from(new Set(deliveredOrders.map(o => o.clientId).filter(Boolean)));
    let cancelled = false;

    if (clientIds.length === 0) {
      setPaidByOrderId({});
      return;
    }

    (async () => {
      const balances = await Promise.all(
        clientIds.map(async clientId => {
          try {
            return await apiGetClientBalance(clientId);
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;

      const nextPaid: Record<string, number> = {};
      for (const balance of balances) {
        for (const row of balance?.perOrder ?? []) {
          nextPaid[row.orderId] = row.paid ?? 0;
        }
      }
      setPaidByOrderId(nextPaid);
    })();

    return () => { cancelled = true; };
  }, [deliveredOrders]);

  useEffect(() => {
    const orderMap = new Map(deliveredOrders.map(order => [order.id, order] as const));
    let cancelled = false;

    if (orderMap.size === 0) {
      setReturnsDetailByOrderId({});
      return;
    }

    (async () => {
      try {
        const rows = await apiGetReturns({ status: 'accepted' });
        if (cancelled) return;

        const returnedQtyByOrder = new Map<string, Record<string, number>>();
        for (const row of rows || []) {
          if (!orderMap.has(row.orderId)) continue;
          const byProduct = returnedQtyByOrder.get(row.orderId) || {};
          for (const item of row.items || []) {
            byProduct[item.productId] = (byProduct[item.productId] || 0) + (item.quantity || 0);
          }
          returnedQtyByOrder.set(row.orderId, byProduct);
        }

        const nextDetail: Record<string, {
          returnedAmount: number;
          deliveredAmount: number;
          returnedQtyByProductId: Record<string, number>;
        }> = {};

        for (const [orderId, order] of orderMap.entries()) {
          const returnedQtyByProductId = returnedQtyByOrder.get(orderId) || {};
          let returnedAmount = 0;
          let deliveredAmount = 0;

          for (const item of order.items || []) {
            const orderedQty = Number(item.quantity || 0);
            const returnedQty = Math.min(orderedQty, returnedQtyByProductId[item.productId] || 0);
            const deliveredQty = Math.max(0, orderedQty - returnedQty);
            const price = Number(item.price || 0);
            returnedAmount += returnedQty * price;
            deliveredAmount += deliveredQty * price;
          }

          nextDetail[orderId] = {
            returnedAmount,
            deliveredAmount,
            returnedQtyByProductId,
          };
        }

        setReturnsDetailByOrderId(nextDetail);
      } catch {
        if (!cancelled) setReturnsDetailByOrderId({});
      }
    })();

    return () => { cancelled = true; };
  }, [deliveredOrders]);

  useEffect(() => {
    const orderMap = new Map(allAdminVisibleOrders.map(order => [order.id, order] as const));
    let cancelled = false;

    (async () => {
      try {
        const rows = await apiGetReturns({ status: 'accepted' });
        if (cancelled) return;

        setAcceptedReturnsByDate(
          buildAcceptedReturnsMapByDate(rows || [], orderMap, adminDateFrom || undefined, adminDateTo || undefined),
        );
      } catch {
        if (!cancelled) setAcceptedReturnsByDate({});
      }
    })();

    return () => { cancelled = true; };
  }, [allAdminVisibleOrders, adminDateFrom, adminDateTo]);

  const financialOrders = useMemo(() => {
    return deliveredOrders.map(order => {
      const returnDetail = returnsDetailByOrderId[order.id];
      const paid = Math.max(0, paidByOrderId[order.id] ?? 0);
      const adjustedRevenue = returnDetail?.deliveredAmount ?? order.total;
      const returnedAmount = returnDetail?.returnedAmount ?? 0;
      const collected = Math.min(adjustedRevenue, paid);
      const debt = Math.max(0, adjustedRevenue - collected);

      const adjustedGrossProfit = (order.items || []).reduce((sum, item) => {
        const returnedQty = Math.min(
          Number(item.quantity || 0),
          returnDetail?.returnedQtyByProductId[item.productId] || 0,
        );
        const deliveredQty = Math.max(0, Number(item.quantity || 0) - returnedQty);
        const cost = productCostById[item.productId] ?? 0;
        return sum + deliveredQty * ((item.price || 0) - cost);
      }, 0);

      const collectionRatio = adjustedRevenue > 0
        ? Math.min(1, collected / adjustedRevenue)
        : 0;
      const realizedGrossProfit = adjustedGrossProfit * collectionRatio;

      return {
        ...order,
        adjustedRevenue,
        returnedAmount,
        collected,
        debt,
        adjustedGrossProfit,
        realizedGrossProfit,
      };
    });
  }, [deliveredOrders, paidByOrderId, productCostById, returnsDetailByOrderId]);

  const totalSales = financialOrders.reduce((sum, order) => sum + order.collected, 0);
  const totalOrders = financialOrders.length;
  const totalReturns = Object.values(acceptedReturnsByDate).reduce((sum, value) => sum + value, 0);
  const totalDebt = financialOrders.reduce((sum, order) => sum + order.debt, 0);
  const totalGrossProfit = financialOrders.reduce((sum, order) => sum + order.realizedGrossProfit, 0);
  const netProfit = totalGrossProfit - totalExpense;

  /* Form state */
  const today = new Date().toISOString().split('T')[0];
  const defaultCatId = expenseCategories[0]?.id || 'other';
  const [showForm, setShowForm]           = useState(false);
  const [showCatMgr, setShowCatMgr]       = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [form, setForm] = useState({ date: today, amount: '', categoryId: defaultCatId, comment: '' });
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expenseCategories.length === 0) return;
    const hasSelectedCategory = expenseCategories.some(cat => cat.id === form.categoryId);
    if (!hasSelectedCategory) {
      setForm(prev => ({ ...prev, categoryId: expenseCategories[0].id }));
    }
  }, [expenseCategories, form.categoryId]);

  const handleAddExpense = () => {
    if (!form.amount || !form.comment.trim()) return;
    const categoryId = expenseCategories.some(cat => cat.id === form.categoryId)
      ? form.categoryId
      : defaultCatId;
    addExpense({ date: form.date, amount: parseInt(form.amount), categoryId, comment: form.comment.trim() });
    setForm(p => ({ ...p, amount: '', categoryId, comment: '' }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    amountRef.current?.focus();
  };

  /* Category stats — group directly from expenses, fallback for unknown categories */
  const catStats = (() => {
    const grouped: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      grouped[e.categoryId] = (grouped[e.categoryId] || 0) + e.amount;
    });
    return Object.entries(grouped).map(([catId, total]) => {
      const cat = expenseCategories.find(c => c.id === catId) ?? {
        id: catId, label: catId, iconName: 'Package', color: 'gray' as const,
      };
      const pct = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
      return { ...cat, total, pct };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  })();

  const donutData = catStats.map(c => ({ label: c.label, value: c.total, color: COLOR_MAP[c.color]?.dot || '#6b7280' }));

  /* Charts */
  const dateMap: Record<string, number> = {};
  const profitMap: Record<string, number> = {};
  const ordersCountMap: Record<string, number> = {};
  const debtMap: Record<string, number> = {};
  financialOrders.forEach(o => {
    dateMap[o.date] = (dateMap[o.date] || 0) + o.collected;
    profitMap[o.date] = (profitMap[o.date] || 0) + o.realizedGrossProfit;
    ordersCountMap[o.date] = (ordersCountMap[o.date] || 0) + 1;
    debtMap[o.date] = (debtMap[o.date] || 0) + o.debt;
  });
  const lineData = Object.entries(dateMap).sort(([a], [b]) => a.localeCompare(b)).map(([d, v]) => ({ label: d.slice(5), value: v }));

  const agentMap: Record<string, number> = {};
  financialOrders.forEach(o => { agentMap[o.agentName] = (agentMap[o.agentName] || 0) + o.collected; });
  const agentBarData = Object.entries(agentMap).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ label: name.split(' ')[0], value }));

  const reportDates = Array.from(new Set([
    ...Object.keys(dateMap),
    ...Object.keys(acceptedReturnsByDate),
    ...Object.keys(debtMap),
    ...Object.keys(profitMap),
  ])).sort();
  const dailyRows = reportDates.map((date) => ({
    date,
    orders: ordersCountMap[date] || 0,
    sales: dateMap[date] || 0,
    returns: acceptedReturnsByDate[date] || 0,
    debt: debtMap[date] || 0,
    profit: profitMap[date] || 0,
  }));

  /* Expense charts data */
  const expDateMap: Record<string, number> = {};
  filteredExpenses.forEach(e => { expDateMap[e.date] = (expDateMap[e.date] || 0) + e.amount; });
  const expLineData = Object.entries(expDateMap).sort(([a], [b]) => a.localeCompare(b)).map(([d, v]) => ({ label: d.slice(5), value: v }));

  // Income vs Expense grouped: all dates combined
  const allDates = Array.from(new Set([...Object.keys(dateMap), ...Object.keys(expDateMap)])).sort();
  const groupedData = allDates.map(d => ({
    label: d.slice(5),
    a: dateMap[d] || 0,
    b: expDateMap[d] || 0,
  }));

  const handleExport = () => {
    const h1 = ['Sana', 'Zakazlar', 'Savdo', 'Vozvrat', 'Qarz', 'Foyda'];
    const r1 = dailyRows.map(r => [r.date, r.orders, r.sales, r.returns, r.debt, Math.round(r.profit)]);
    const h2 = ['Sana', 'Kategoriya', 'Summa', 'Izoh'];
    const r2 = filteredExpenses.map(e => [
      e.date,
      expenseCategories.find(c => c.id === e.categoryId)?.label || e.categoryId,
      e.amount,
      e.comment,
    ]);

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([h1, ...r1]);
    const ws2 = XLSX.utils.aoa_to_sheet([h2, ...r2]);

    XLSX.utils.book_append_sheet(wb, ws1, 'Hisobot');
    XLSX.utils.book_append_sheet(wb, ws2, 'Chiqimlar');

    const from = adminDateFrom || 'barchasi';
    const to = adminDateTo && adminDateTo !== adminDateFrom ? `_${adminDateTo}` : '';
    XLSX.writeFile(wb, `hisobot_${from}${to}.xlsx`);
  };

  /* ── Helper to get category def ── */
  const getCat = (id: string) => expenseCategories.find(c => c.id === id) ?? { label: id, iconName: 'Package', color: 'gray', id };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ─ Header ─ */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.reportsPage')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {hasDateFilter
                ? (adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`)
                : t('admin.reports.allTimeReport')}
            </p>
          </div>
          <button onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
            <Download size={15} /> {t('admin.exportExcel')}
          </button>
          <ExcelExportModal
            open={exportModalOpen}
            onOpenChange={setExportModalOpen}
            t={t}
            orders={orders}
            clients={clients}
            products={products}
            expenses={expenses}
            expenseCategories={expenseCategories}
          />
        </div>

        {/* ─ Summary cards ─ */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { label: t('admin.reports.totalSales'),   value: `${totalSales.toLocaleString()} ${t('common.sum')}`,   Icon: TrendingUp,   bg: 'bg-blue-50 dark:bg-blue-900/20',   ic: 'text-blue-600 dark:text-blue-400',   val: 'text-blue-700 dark:text-blue-300' },
            { label: t('admin.reports.totalExpense'),  value: `${totalExpense.toLocaleString()} ${t('common.sum')}`,  Icon: TrendingDown, bg: 'bg-red-50 dark:bg-red-900/20',     ic: 'text-red-500 dark:text-red-400',     val: 'text-red-600 dark:text-red-300' },
            { label: t('admin.reports.netProfit'),    value: `${netProfit.toLocaleString()} ${t('common.sum')}`,     Icon: Wallet,       bg: netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20', ic: netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400', val: netProfit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-600 dark:text-orange-300' },
            { label: t('admin.reports.totalDebt'), value: `${totalDebt.toLocaleString()} ${t('common.sum')}`, Icon: Banknote, bg: 'bg-amber-50 dark:bg-amber-900/20', ic: 'text-amber-600 dark:text-amber-400', val: 'text-amber-700 dark:text-amber-300' },
            { label: t('admin.reports.totalReturns'), value: `${totalReturns.toLocaleString()} ${t('common.sum')}`, Icon: RotateCcw, bg: 'bg-purple-50 dark:bg-purple-900/20', ic: 'text-purple-600 dark:text-purple-400', val: 'text-purple-700 dark:text-purple-300' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                <s.Icon size={17} className={s.ic} />
              </div>
              <p className={`text-base font-bold break-all leading-snug ${s.val}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ══════════════════════
            CHIQIMLAR SECTION
        ══════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <TrendingDown size={16} className="text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-base">{t('admin.reports.expenses')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {filteredExpenses.length} {t('admin.reports.records')} · {totalExpense.toLocaleString()} {t('common.sum')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Category manager toggle */}
              <button
                onClick={() => { setShowCatMgr(v => !v); setShowForm(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  showCatMgr
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <SlidersHorizontal size={13} />
                {t('admin.reports.categories')}
              </button>
              {/* Add expense toggle */}
              <button
                onClick={() => { setShowForm(v => !v); setShowCatMgr(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  showForm
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200/50'
                }`}
              >
                {showForm ? <X size={15} /> : <Plus size={15} />}
                {showForm ? t('admin.reports.close') : t('admin.reports.addExpense')}
              </button>
            </div>
          </div>

          {/* ── CATEGORY MANAGER ── */}
          {showCatMgr && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/80">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={15} className="text-[#2563EB]" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('admin.reports.manageCategories')}</h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {expenseCategories.length} {t('admin.reports.catCount')}
                </span>
              </div>
              <CategoryManager />
            </div>
          )}

          {/* ── ADD EXPENSE FORM ── */}
          {showForm && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-red-50/30 dark:bg-red-900/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    {t('common.date')}
                  </label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    {t('admin.reports.amount')}
                  </label>
                  <input ref={amountRef} type="number" value={form.amount} placeholder="0"
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500"
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    {t('admin.reports.category')}
                  </label>
                  <div className="relative">
                    <select value={form.categoryId}
                      onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                      className="crm-select w-full pl-9 pr-3 py-2.5"
                    >
                      {expenseCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    {/* Selected category icon */}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <CatIcon name={getCat(form.categoryId).iconName} size={14} />
                    </span>
                  </div>
                </div>
                {/* Comment */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    {t('admin.reports.comment')}
                  </label>
                  <input type="text" value={form.comment} placeholder={t('admin.reports.comment')}
                    onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleAddExpense}
                  disabled={!form.amount || !form.comment.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    saved
                      ? 'bg-green-500 text-white'
                      : !form.amount || !form.comment.trim()
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-red-200/50'
                  }`}
                >
                  {saved ? <><Check size={15} /> {t('admin.reports.saved')}</> : <><Plus size={15} /> {t('admin.reports.addExpenseBtn')}</>}
                </button>
                {form.amount && (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    = {parseInt(form.amount || '0').toLocaleString()} {t('common.sum')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── EXPENSE LIST ── */}
          {filteredExpenses.length > 0 ? (
            <>
              {/* ── TABLE DROPDOWN TOGGLE ── */}
              <button
                type="button"
                onClick={() => setShowExpenseTable(v => !v)}
                className="w-full flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/40 hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Table2 size={15} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {t('admin.reports.expensesTable')}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full tabular-nums">
                    {filteredExpenses.length}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${showExpenseTable ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>

              {/* ── EXPENSE TABLE (collapsible) ── */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${showExpenseTable ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                        <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-5 py-3">{t('common.date')}</th>
                        <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-5 py-3">{t('admin.reports.category')}</th>
                        <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-5 py-3">{t('admin.reports.comment')}</th>
                        <th className="text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-5 py-3">{t('admin.reports.amount')}</th>
                        <th className="text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-5 py-3">{t('admin.reports.share')}</th>
                        <th className="w-10 px-3 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.slice().sort((a, b) => b.amount - a.amount).map(exp => {
                        const cat = getCat(exp.categoryId);
                        const cm  = COLOR_MAP[cat.color] || COLOR_MAP.gray;
                        const pct = totalExpense > 0 ? ((exp.amount / totalExpense) * 100).toFixed(1) : '0';
                        return (
                          <tr key={exp.id}
                            className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-red-50/20 dark:hover:bg-red-900/5 transition-colors group">
                            <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{exp.date}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cm.badge}`}>
                                <CatIcon name={cat.iconName} size={11} />
                                {cat.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-200 max-w-xs truncate">{exp.comment}</td>
                            <td className="px-5 py-3.5 text-right text-sm font-bold text-red-500 dark:text-red-400 whitespace-nowrap">
                              {exp.amount.toLocaleString()} {t('common.sum')}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full tabular-nums">
                                {pct}%
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <button onClick={() => deleteExpense(exp.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-red-50/60 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/30">
                        <td colSpan={3} className="px-5 py-3 text-sm font-bold text-gray-800 dark:text-white">{t('admin.reports.totalExpenseRow')}</td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-red-500 dark:text-red-400">
                          {totalExpense.toLocaleString()} {t('common.sum')}
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-bold text-gray-400">100%</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <TrendingDown size={22} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.reports.noExpenses')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {hasDateFilter ? t('admin.reports.noExpensesForPeriod') : t('admin.reports.addExpenseHint')}
              </p>
            </div>
          )}
        </div>

        {/* ── SAVDO CHARTS ── */}
        {totalOrders > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {lineData.length > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('admin.reports.dailySales')}</h3>
                  <SimpleLineChart data={lineData} color="#2563EB" height={220}
                    formatY={v => v.toLocaleString()} formatTooltip={v => `${v.toLocaleString()} so'm`} />
                </div>
              )}
              {agentBarData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('admin.salesByAgent')}</h3>
                  <SimpleVBarChart data={agentBarData} color="#2563EB" height={220}
                    formatY={v => v.toLocaleString()} formatTooltip={v => `${v.toLocaleString()} so'm`} />
                </div>
              )}
            </div>

            {/* Kunlik jadval */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('admin.reports.dailyReport')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                      {[t('common.date'), t('common.orders'), t('admin.reports.sales'), t('admin.reports.totalReturns'), t('admin.reports.totalDebt'), t('admin.reports.profit22')].map((h, i) => (
                        <th key={h} className={`text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-6 py-3 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRows.map(row => (
                      <tr key={row.date} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.date}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">{row.orders}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{row.sales.toLocaleString()} {t('common.sum')}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-purple-600 dark:text-purple-400">{row.returns.toLocaleString()} {t('common.sum')}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-amber-600 dark:text-amber-400">{row.debt.toLocaleString()} {t('common.sum')}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600 dark:text-green-400">{Math.round(row.profit).toLocaleString()} {t('common.sum')}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/60 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-900/30">
                      <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">{t('common.total')}</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">{totalOrders}</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-[#2563EB] dark:text-blue-400">{totalSales.toLocaleString()} {t('common.sum')}</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-purple-600 dark:text-purple-400">{totalReturns.toLocaleString()} {t('common.sum')}</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-amber-600 dark:text-amber-400">{totalDebt.toLocaleString()} {t('common.sum')}</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">{Math.round(totalGrossProfit).toLocaleString()} {t('common.sum')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── CHIQIM CHARTS ── */}
        {filteredExpenses.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {expLineData.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('admin.reports.dailyExpense')}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{t('admin.reports.dailyExpenseDesc')}</p>
                <SimpleLineChart
                  data={expLineData}
                  color="#ef4444"
                  height={200}
                  formatY={v => `${(v / 1000).toFixed(0)}K`}
                  formatTooltip={v => `${v.toLocaleString()} ${t('common.sum')}`}
                />
              </div>
            )}
            {groupedData.length > 0 && (totalOrders > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('admin.reports.incomeVsExpense')}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{t('admin.reports.incomeVsExpenseDesc')}</p>
                <SimpleGroupedBar
                  data={groupedData}
                  colorA="#2563EB"
                  colorB="#ef4444"
                  labelA={t('admin.reports.sales')}
                  labelB={t('admin.reports.expenses')}
                  height={200}
                  formatY={v => `${(v / 1000).toFixed(0)}K`}
                  formatTooltip={v => `${v.toLocaleString()} ${t('common.sum')}`}
                />
              </div>
            )}
          </div>
        )}

        {totalOrders === 0 && filteredExpenses.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <CalendarDays size={40} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('admin.reports.noData')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('admin.reports.selectDateHint')}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};