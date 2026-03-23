import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, Pencil, Plus, Search, Trash2, Truck } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useApp } from '../../context/AppContext';
import { apiCreateSupplier, apiDeleteSupplier, apiGetSuppliers, apiUpdateSupplier, SupplierListItem } from '../../api/suppliers';

const formatMoney = (n: number) => (n || 0).toLocaleString('ru-RU');

const formatDt = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const AdminSuppliers = () => {
  const { t, adminDateFrom, adminDateTo } = useApp();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<SupplierListItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SupplierListItem | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' });
  const hasFilter = adminDateFrom || adminDateTo;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await apiGetSuppliers();
      setSuppliers(list);
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(s =>
      `${s.name} ${s.phone || ''} ${s.address || ''}`.toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setError('');
    try {
      if (editing) {
        await apiUpdateSupplier(editing.id, {
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
          comment: form.comment.trim() || undefined,
        });
      } else {
        await apiCreateSupplier({
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
          comment: form.comment.trim() || undefined,
        });
      }
      setShowAdd(false);
      setEditing(null);
      setForm({ name: '', phone: '', address: '', comment: '' });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    }
  };

  const openEdit = (s: SupplierListItem) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      phone: (s.phone || '') as any,
      address: (s.address || '') as any,
      comment: (s.comment || '') as any,
    });
    setShowAdd(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setError('');
    try {
      await apiDeleteSupplier(confirmDelete.id);
      setConfirmDelete(null);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.suppliers')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filtered.length} {t('common.pcs')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasFilter && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <CalendarDays size={13} className="text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`}
                </span>
              </div>
            )}
            <button
              onClick={() => { setEditing(null); setForm({ name: '', phone: '', address: '', comment: '' }); setShowAdd(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus size={15} />
              {t('admin.suppliers.add')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.suppliers.search')}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={load}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.refresh')}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('admin.suppliers.noSuppliers')}</div>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                className="text-left p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      onClick={() => navigate(`/admin/suppliers/${s.id}`)}
                      className="w-full flex items-center gap-2 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Truck size={18} className="text-[#2563EB]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {s.phone || s.address || '—'}
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold tabular-nums ${
                      s.remainingDebt > 0
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {formatMoney(s.remainingDebt)} so&apos;m
                    </div>
                    <button
                      onClick={() => openEdit(s)}
                      className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title={t('admin.suppliers.edit')}
                    >
                      <Pencil size={16} className="text-gray-600 dark:text-gray-200" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(s)}
                      className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title={t('admin.suppliers.delete')}
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-300" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <div className="text-gray-500 dark:text-gray-400">{t('admin.suppliers.lastDelivery')}</div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">{formatDt(s.lastDeliveryAt)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                    <div className="text-gray-500 dark:text-gray-400">{t('admin.suppliers.lastPayment')}</div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">{formatDt(s.lastPaymentAt)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAdd(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {editing ? t('admin.suppliers.edit') : t('admin.suppliers.add')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {editing ? t('admin.suppliers.updated') : t('admin.suppliers.add')}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.name')}</div>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.phone')}</div>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.address')}</div>
                    <input
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.comment')}</div>
                  <input
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmDelete(null)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{t('admin.suppliers.deleteTitle')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{confirmDelete.name}</span>
                </div>
              </div>
              <div className="p-4 text-sm text-gray-700 dark:text-gray-200">
                {t('admin.suppliers.deleteConfirm')}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  {t('admin.suppliers.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

