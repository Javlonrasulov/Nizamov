import { useEffect, useState } from 'react';
import { Search, Plus, Package, Edit2, CalendarDays } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { useAdminVisibleOrders } from '../../components/AdminDateFilter';

export const AdminProducts = () => {
  const { t, products, addProduct, updateProduct, adminDateFrom, adminDateTo } = useApp();
  const filteredOrders = useAdminVisibleOrders();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [apiError, setApiError] = useState('');
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const hasFilter = adminDateFrom || adminDateTo;

  // Count ordered quantities per product in filtered range
  const productStats: Record<string, { qty: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productStats[item.productId]) productStats[item.productId] = { qty: 0, revenue: 0 };
      productStats[item.productId].qty += item.quantity;
      productStats[item.productId].revenue += item.quantity * item.price;
    });
  });

  // If date filter: only show products that were ordered in range
  const activeProductIds = hasFilter ? new Set(Object.keys(productStats)) : null;

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchDate = !activeProductIds || activeProductIds.has(p.id);
    return matchSearch && matchDate;
  });

  const handleAdd = async () => {
    if (!form.name) return;
    setApiError('');
    const savedToBackend = await addProduct({
      name: form.name,
      price: 0,
      cost: 0,
      stock: 0,
    });
    if (savedToBackend) {
      setForm({ name: '' });
      setShowForm(false);
    } else {
      setApiError('Backend ulanmadi — mahsulot faqat ushbu brauzerda ko\'rinadi. Agent/dostavchik ko\'rmaydi. Backend ni ishga tushiring (backend folder: npm run start:dev).');
    }
  };

  useEffect(() => {
    if (!editTarget) return;
    setEditName(editTarget.name);
    setEditError('');
  }, [editTarget]);

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const name = editName.trim();
    if (!name) {
      setEditError(t('admin.clients.validation.nameRequired'));
      return;
    }
    setEditSaving(true);
    setEditError('');
    const ok = await updateProduct(editTarget.id, { name });
    setEditSaving(false);
    if (ok) {
      setEditTarget(null);
    } else {
      // local update already applied in fallback; still close to avoid blocking user
      setEditTarget(null);
    }
  };

  const stockLevel = (stock: number) => {
    if (stock > 100) return { labelKey: 'common.stockLevel.sufficient' as const, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' };
    if (stock > 30) return { labelKey: 'common.stockLevel.medium' as const, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' };
    return { labelKey: 'common.stockLevel.low' as const, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' };
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.productsPage')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} {t('common.pcs')}</p>
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
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus size={15} />
              {t('admin.addProduct')}
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('admin.addProduct')}</h3>
            {apiError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                {apiError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">{t('admin.products.nameLabel')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.products.nameLabel')}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                {t('common.save')}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('products.search')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('admin.products.product')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('admin.salePrice')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('admin.costPrice')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('admin.products.profitPercent')}</th>
                  <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('admin.warehouseQty')}</th>
                  {hasFilter && (
                    <>
                      <th className="text-right text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide px-5 py-3">{t('admin.products.soldQty')} ({t('common.pcs')})</th>
                      <th className="text-right text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide px-5 py-3">{t('admin.products.revenue')}</th>
                    </>
                  )}
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={hasFilter ? 8 : 6} className="text-center py-12 text-gray-400 dark:text-gray-500">
                      <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">{hasFilter ? t('admin.products.emptyForDate') : t('admin.products.empty')}</p>
                    </td>
                  </tr>
                ) : filtered.map(product => {
                  const margin = ((product.price - product.cost) / product.price * 100).toFixed(0);
                  const stock = stockLevel(product.stock);
                  const stats = productStats[product.id];
                  return (
                    <tr key={product.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Package size={15} className="text-[#2563EB] dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{product.price.toLocaleString()} so'm</td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600 dark:text-gray-300">{product.cost.toLocaleString()} so'm</td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{margin}%</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stock.color}`}>
                          {product.stock} {t('common.pcs')} · {t(stock.labelKey)}
                        </span>
                      </td>
                      {hasFilter && (
                        <>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {stats ? stats.qty : 0} {t('common.pcs')}
                          </td>
                          <td className="px-5 py-4 text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {stats ? stats.revenue.toLocaleString() : 0} so'm
                          </td>
                        </>
                      )}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setEditTarget({ id: product.id, name: product.name })}
                          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 size={13} className="text-gray-600 dark:text-gray-300" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <ProductEditModal
          open={!!editTarget}
          name={editName}
          saving={editSaving}
          error={editError}
          onChangeName={setEditName}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      </div>
    </AdminLayout>
  );
};

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function ProductEditModal({
  open,
  name,
  saving,
  error,
  onChangeName,
  onClose,
  onSave,
}: {
  open: boolean;
  name: string;
  saving: boolean;
  error: string;
  onChangeName: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useApp();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-10 flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('admin.products.editTitle')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('admin.products.editSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 transition-colors"
            aria-label={t('common.cancel')}
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            {t('admin.products.nameLabel')}
          </label>
          <input
            value={name}
            onChange={e => onChangeName(e.target.value)}
            autoFocus
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'}`}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave();
              }
              if (e.key === 'Escape') onClose();
            }}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={saving}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
