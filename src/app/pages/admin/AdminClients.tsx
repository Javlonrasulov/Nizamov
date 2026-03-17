import { useState, useEffect } from 'react';
import {
  Search, MapPin, Phone, CalendarDays, Plus, LayoutGrid, List,
  Edit2, Trash2, X, Check, User, Users, Package, ShoppingBag,
  TrendingUp, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { useFilteredOrders, useAdminVisibleOrders } from '../../components/AdminDateFilter';
import { apiGetUsers } from '../../api/users';
import { Client, WeekDay, users, Order } from '../../data/mockData';

const WEEK_DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: 'du', label: 'Dushanba',   short: 'Du' },
  { key: 'se', label: 'Seshanba',   short: 'Se' },
  { key: 'ch', label: 'Chorshanba', short: 'Ch' },
  { key: 'pa', label: 'Payshanba',  short: 'Pa' },
  { key: 'ju', label: 'Juma',       short: 'Ju' },
  { key: 'sh', label: 'Shanba',     short: 'Sh' },
];

const AVATAR_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/40',   text: 'text-blue-700 dark:text-blue-300'   },
  { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
  { bg: 'bg-green-100 dark:bg-green-900/40',  text: 'text-green-700 dark:text-green-300'  },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40',    text: 'text-pink-700 dark:text-pink-300'    },
  { bg: 'bg-teal-100 dark:bg-teal-900/40',    text: 'text-teal-700 dark:text-teal-300'    },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-red-100 dark:bg-red-900/40',      text: 'text-red-700 dark:text-red-300'      },
];

const agentUsersMock = users.filter(u => u.role === 'agent');

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColor = (idx: number) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

/* ─── Client Form Modal ─── */
interface FormState {
  name: string;
  phone: string;
  address: string;
  agentId: string;
  visitDays: WeekDay[];
  lat: string;
  lng: string;
}

const getEmptyForm = (agents: { id: string }[]) => ({
  name: '', phone: '', address: '', agentId: agents[0]?.id || '',
  visitDays: [] as WeekDay[], lat: '', lng: '',
});

function clientToForm(c: Client): FormState {
  return {
    name: c.name, phone: c.phone, address: c.address,
    agentId: c.agentId, visitDays: c.visitDays || [],
    lat: c.lat !== undefined ? String(c.lat) : '',
    lng: c.lng !== undefined ? String(c.lng) : '',
  };
}

interface AgentUser {
  id: string;
  name: string;
}

interface ClientModalProps {
  editClient: Client | null;
  agentUsers: AgentUser[];
  onClose: () => void;
  onSave: (form: FormState) => void;
}

function ClientModal({ editClient, agentUsers, onClose, onSave }: ClientModalProps) {
  const { t } = useApp();
  const weekDays = [
    { key: 'du' as const, label: t('days.monday') },
    { key: 'se' as const, label: t('days.tuesday') },
    { key: 'ch' as const, label: t('days.wednesday') },
    { key: 'pa' as const, label: t('days.thursday') },
    { key: 'ju' as const, label: t('days.friday') },
    { key: 'sh' as const, label: t('days.saturday') },
  ];
  const emptyForm = getEmptyForm(agentUsers);
  const [form, setForm] = useState<FormState>(editClient ? clientToForm(editClient) : emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    setForm(editClient ? clientToForm(editClient) : getEmptyForm(agentUsers));
    setErrors({});
  }, [editClient, agentUsers]);

  const set = (field: keyof FormState, value: string | WeekDay[]) =>
    setForm(f => ({ ...f, [field]: value }));

  const toggleDay = (day: WeekDay) =>
    setForm(f => ({
      ...f,
      visitDays: f.visitDays.includes(day)
        ? f.visitDays.filter(d => d !== day)
        : [...f.visitDays, day],
    }));

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = t('admin.clients.validation.nameRequired');
    if (!form.phone.trim()) e.phone = t('admin.clients.validation.phoneRequired');
    if (!form.address.trim()) e.address = t('admin.clients.validation.addressRequired');
    if (!form.agentId) e.agentId = t('admin.clients.validation.agentRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {editClient ? t('admin.clients.editClient') : t('admin.clients.addClient')}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('clients.form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Bek Supermarket"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('clients.form.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+998901234567"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'}`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('clients.form.address')} <span className="text-red-500">*</span>
              </label>
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Toshkent, Chilonzor, 4-kvartal"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.address ? 'border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'}`}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            {/* Agent */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('orders.agent')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={form.agentId}
                  onChange={e => set('agentId', e.target.value)}
                  className={`crm-select w-full pl-9 pr-4 py-2.5 ${errors.agentId ? 'border-red-400 dark:border-red-500' : ''}`}
                >
                  <option value="">{t('orders.agent')}...</option>
                  {agentUsers.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              {errors.agentId && <p className="text-xs text-red-500 mt-1">{errors.agentId}</p>}
            </div>

            {/* Visit Days */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                {t('clients.form.visitDays')}
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(day => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      form.visitDays.includes(day.key)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Coordinates */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t('admin.clients.gpsCoords')} <span className="text-gray-400 font-normal">{t('common.optional')}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.lat}
                  onChange={e => set('lat', e.target.value)}
                  placeholder="Kenglik (lat)"
                  type="number"
                  step="any"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <input
                  value={form.lng}
                  onChange={e => set('lng', e.target.value)}
                  placeholder="Uzunlik (lng)"
                  type="number"
                  step="any"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
            {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check size={15} />
            {editClient ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete Confirm ─── */
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useApp();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-10 p-6">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-center mb-1">{t('admin.clients.deleteTitle')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span> {t('admin.clients.deleteConfirm')}
          {' '}
          {t('admin.clients.deleteWarning')}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status badge ─── */
const STATUS_STYLES: Record<string, string> = {
  new:        'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  tayyorlanmagan: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  yuborilgan: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
  sent:       'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
  accepted:   'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
  delivering: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  delivered:  'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled:  'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
};
const statusKey = (s: string) => (`status.${s}` as const);

/* ─── Client History Panel ─── */
interface HistoryPanelProps {
  client: Client;
  orders: Order[];
  onClose: () => void;
  onEdit: (c: Client) => void;
  getAgentName: (id: string) => string;
}

function ClientHistoryPanel({ client, orders, onClose, onEdit, getAgentName }: HistoryPanelProps) {
  const { t, lang } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );

  const totalSpent    = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const avgOrder      = orders.length > 0 ? Math.round(totalSpent / orders.length) : 0;

  const av = AVATAR_COLORS[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">{client.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.clients.history')}</p>
          </div>
          <button
            onClick={() => { onClose(); onEdit(client); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            <Edit2 size={12} />
            {t('common.edit')}
          </button>
        </div>

        {/* Client Info */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold ${av.bg} ${av.text}`}>
              {getInitials(client.name)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <Phone size={12} className="text-gray-400" />
                {client.phone}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <MapPin size={11} className="text-gray-400" />
                {client.address}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
              <User size={10} className="inline mr-1" />{getAgentName(client.agentId)}
            </span>
            {client.visitDays && client.visitDays.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                <CalendarDays size={10} className="inline mr-1" />
                {WEEK_DAYS.filter(d => client.visitDays!.includes(d.key)).map(d => d.short).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
          {[
            { icon: ShoppingBag, label: t('admin.clients.totalOrders'), value: `${orders.length} ${t('common.pcs')}`, color: 'text-blue-500' },
            { icon: TrendingUp,  label: t('admin.clients.totalAmount'), value: `${totalSpent.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')} ${t('common.sum')}`, color: 'text-green-500' },
            { icon: Clock,       label: t('admin.clients.average'),     value: `${avgOrder.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')} ${t('common.sum')}`, color: 'text-purple-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 px-3 py-3 text-center">
              <s.icon size={16} className={`mx-auto mb-1 ${s.color}`} />
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="font-semibold text-gray-900 dark:text-white text-xs mt-0.5 break-all leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
              <Package size={32} className="mb-2 opacity-40" />
              <p className="text-sm">{t('admin.clients.noOrdersYet')}</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {orders.map(order => {
                const isOpen = expandedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Order header — clickable to expand */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                      onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                    >
                      {/* Date block */}
                      <div className="flex-shrink-0 w-10 text-center bg-blue-50 dark:bg-blue-900/30 rounded-xl py-1.5">
                        <p className="text-[10px] text-blue-400 leading-none">
                          {new Date(order.date).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { month: 'short' }).toUpperCase()}
                        </p>
                        <p className="font-bold text-blue-600 dark:text-blue-300 text-sm leading-tight">
                          {new Date(order.date).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{order.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[order.status] || ''}`}>
                            {t(statusKey(order.status) as any)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {order.items.length} {t('admin.clients.productsCount')} · {order.total.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')} {t('common.sum')}
                        </p>
                      </div>
                      {isOpen
                        ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
                        : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                      }
                    </button>

                    {/* Order items — expanded */}
                    {isOpen && (
                      <div className="border-t border-gray-100 dark:border-gray-700">
                        {/* Items table */}
                        <div className="px-4 pt-3 pb-2 space-y-2">
                          <div className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 uppercase tracking-wide pb-1 border-b border-gray-50 dark:border-gray-700">
                            <span className="col-span-5">{t('admin.suppliers.productName')}</span>
                            <span className="col-span-2 text-center">{t('admin.suppliers.quantity')}</span>
                            <span className="col-span-3 text-right">{t('admin.suppliers.salePrice')}</span>
                            <span className="col-span-2 text-right">{t('common.total')}</span>
                          </div>
                          {order.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-12 items-center py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                              <div className="col-span-5 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                  <Package size={11} className="text-blue-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">
                                  {item.productName}
                                </span>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="col-span-3 text-right text-xs text-gray-500 dark:text-gray-400">
                                {item.price.toLocaleString()}
                              </div>
                              <div className="col-span-2 text-right text-xs font-semibold text-gray-800 dark:text-gray-200">
                                {(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Total */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.agentName && (
                              <span>{t('admin.clients.agentLabel')}: <span className="text-gray-700 dark:text-gray-300">{order.agentName}</span></span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1.5">{t('common.total')}:</span>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {order.total.toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ')} {t('common.sum')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ─── */
export const AdminClients = () => {
  const { t, clients, addClient, updateClient, deleteClient, adminDateFrom, adminDateTo, orders: allOrders } = useApp();
  const filteredOrders = useAdminVisibleOrders();

  const [agentUsers, setAgentUsers] = useState<{ id: string; name: string }[]>(agentUsersMock.map(u => ({ id: u.id, name: u.name })));
  const [search, setSearch]       = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [viewMode, setViewMode]   = useState<'card' | 'list'>('card');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);

  useEffect(() => {
    apiGetUsers('agent').then(arr => setAgentUsers(arr.map(u => ({ id: u.id, name: u.name })))).catch(() => {});
  }, []);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hasFilter = adminDateFrom || adminDateTo;
  const activeClientIds = hasFilter
    ? new Set(filteredOrders.map(o => o.clientId))
    : null;

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q);
    const matchDate  = !activeClientIds || activeClientIds.has(c.id);
    const matchAgent = agentFilter === 'all' || c.agentId === agentFilter;
    return matchSearch && matchDate && matchAgent;
  });

  const clientOrderCounts: Record<string, number> = {};
  filteredOrders.forEach(o => {
    clientOrderCounts[o.clientId] = (clientOrderCounts[o.clientId] || 0) + 1;
  });

  const getAgentName = (agentId: string) =>
    agentUsers.find(a => a.id === agentId)?.name || t('admin.clients.unknownAgent');

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (c: Client) => { setSelectedClient(null); setEditTarget(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSave = (form: FormState) => {
    const payload: Omit<Client, 'id'> = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      agentId: form.agentId,
      visitDays: form.visitDays,
      lat: form.lat ? parseFloat(form.lat) : undefined,
      lng: form.lng ? parseFloat(form.lng) : undefined,
    };
    if (editTarget) updateClient(editTarget.id, payload);
    else addClient(payload);
    closeModal();
  };

  const handleDelete = () => {
    if (deleteTarget) { deleteClient(deleteTarget.id); setDeleteTarget(null); }
  };

  /* ─── Visit Day Chips ─── */
  const VisitDayChips = ({ days }: { days?: WeekDay[] }) => {
    if (!days || days.length === 0)
      return <span className="text-xs text-gray-400 dark:text-gray-500">Belgilanmagan</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {WEEK_DAYS.filter(d => days.includes(d.key)).map(d => (
          <span key={d.key} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-medium">
            {d.short}
          </span>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.clientsPage')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} {t('common.pcs')}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasFilter && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <CalendarDays size={13} className="text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`}
                </span>
              </div>
            )}
            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <LayoutGrid size={14} />
                {t('common.view.card')}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <List size={14} />
                {t('common.view.list')}
              </button>
            </div>
            {/* Add button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} />
              {t('admin.clients.add')}
            </button>
          </div>
        </div>

        {/* ─── Filters ─── */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.clients.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:placeholder:text-gray-500"
            />
          </div>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="crm-select pl-8 pr-8 py-2.5"
            >
              <option value="all">{t('admin.clients.allAgents')}</option>
              {agentUsers.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── Empty ─── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Users size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.clients.notFound')}</p>
            <button onClick={openAdd} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {t('admin.clients.addHint')}
            </button>
          </div>
        ) : viewMode === 'card' ? (
          /* ─── CARD VIEW ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client, idx) => {
              const av = avatarColor(idx);
              const orderCount = clientOrderCounts[client.id] || 0;
              return (
                <div key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all overflow-hidden">
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-sm ${av.bg} ${av.text}`}>
                        {getInitials(client.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{client.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <User size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getAgentName(client.agentId)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); openEdit(client); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteTarget(client); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{client.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{client.address}</span>
                      </div>
                    </div>

                    {/* Visit days */}
                    {client.visitDays && client.visitDays.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <CalendarDays size={12} className="text-gray-400 flex-shrink-0" />
                        <VisitDayChips days={client.visitDays} />
                      </div>
                    )}

                    {/* GPS + order count */}
                    <div className="mt-3 flex items-center justify-between">
                      {client.lat ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-xs text-green-600 dark:text-green-400">{t('admin.clients.gpsAvailable')}</span>
                        </div>
                      ) : <span />}
                      {hasFilter && orderCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                          {orderCount} {t('common.orders')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── LIST VIEW ─── */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('clients.form.name')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('clients.form.phone')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('clients.form.address')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.agent')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('clients.form.visitDays')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('admin.clients.gpsCoords')}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client, idx) => {
                    const av = avatarColor(idx);
                    const orderCount = clientOrderCounts[client.id] || 0;
                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        {/* Name + initials */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${av.bg} ${av.text}`}>
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                              {hasFilter && orderCount > 0 && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400">{orderCount} {t('common.orders')}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{client.phone}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 max-w-[180px]">
                          <span className="line-clamp-2">{client.address}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg whitespace-nowrap">
                            {getAgentName(client.agentId)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <VisitDayChips days={client.visitDays} />
                        </td>
                        <td className="px-5 py-3.5">
                          {client.lat ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-xs text-green-600 dark:text-green-400">Mavjud</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={e => { e.stopPropagation(); openEdit(client); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setDeleteTarget(client); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── History Panel ─── */}
      {selectedClient && (
        <ClientHistoryPanel
          client={selectedClient}
          orders={allOrders
            .filter(o => o.clientId === selectedClient.id)
            .sort((a, b) => b.date.localeCompare(a.date))}
          onClose={() => setSelectedClient(null)}
          onEdit={openEdit}
          getAgentName={getAgentName}
        />
      )}

      {/* ─── Modal ─── */}
      {modalOpen && (
        <ClientModal
          editClient={editTarget}
          agentUsers={agentUsers}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ─── Delete Confirm ─── */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
};