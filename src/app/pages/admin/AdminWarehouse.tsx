import { useState } from 'react';
import { Search, Warehouse, Package, ArrowUpRight, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useApp } from '../../context/AppContext';
import { useAdminVisibleOrders } from '../../components/AdminDateFilter';

interface WarehouseItem {
  id: string;
  productName: string;
  totalIn: number;
  totalSold: number;
  costPrice: number;
  salePrice: number;
}

const formatSum = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

export const AdminWarehouse = () => {
  const { t, products, deleteProduct } = useApp();
  const orders = useAdminVisibleOrders();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  // Sotilgan miqdor (cancelled dan tashqari)
  const soldByProduct: Record<string, number> = {};
  orders
    .filter(o => o.status !== 'cancelled')
    .forEach(o => o.items.forEach(it => {
      soldByProduct[it.productId] = (soldByProduct[it.productId] || 0) + (it.quantity || 0);
    }));

  // Ombor ro'yxati: backenddagi stock + sotilgan (taxminiy totalIn)
  const items: WarehouseItem[] = products.map(p => {
    const totalSold = soldByProduct[p.id] || 0;
    const remaining = p.stock || 0;
    return {
      id: p.id,
      productName: p.name,
      totalSold,
      totalIn: remaining + totalSold,
      costPrice: p.cost,
      salePrice: p.price,
    };
  });

  const filtered = items.filter(i =>
    i.productName.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = items.reduce((s, i) => s + i.costPrice * (i.totalIn - i.totalSold), 0);
  const totalRemaining = items.reduce((s, i) => s + (i.totalIn - i.totalSold), 0);

  const getStockLevel = (item: WarehouseItem) => {
    const remaining = item.totalIn - item.totalSold;
    const ratio = item.totalIn > 0 ? remaining / item.totalIn : 0;
    if (ratio > 0.5) return { labelKey: 'common.stockLevel.sufficient' as const, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (ratio > 0.2) return { labelKey: 'common.stockLevel.medium' as const, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { labelKey: 'common.stockLevel.low' as const, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const handleDelete = async (item: WarehouseItem) => {
    const confirmed = window.confirm(`${item.productName} mahsulotini o'chirasizmi?`);
    if (!confirmed) return;

    setActionError('');
    setDeletingId(item.id);
    const ok = await deleteProduct(item.id);
    if (!ok) {
      setActionError("Mahsulotni o'chirib bo'lmadi. U boshqa ma'lumotlarga bog'langan bo'lishi mumkin.");
    }
    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('admin.warehouse')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{items.length} {t('common.pcs')}</p>
        </div>

        {actionError && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {actionError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.warehouse.totalIn')}</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{formatSum(totalValue)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.warehouse.remaining')}</span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Warehouse size={14} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{totalRemaining} {t('common.pcs')}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${t('admin.warehouse.productName')} — ${t('common.search')}`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  {[t('admin.warehouse.productName'), t('admin.warehouse.totalIn'), t('admin.warehouse.totalSold'), t('admin.warehouse.remaining'), t('admin.warehouse.costPrice'), t('admin.warehouse.salePrice'), t('admin.warehouse.profit'), t('common.status'), t('common.delete')].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
                      <Warehouse size={36} className="mx-auto mb-3 opacity-30" />
                      {t('admin.warehouse.noProducts')}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, i) => {
                    const remaining = item.totalIn - item.totalSold;
                    const profit = item.salePrice - item.costPrice;
                    const status = getStockLevel(item);
                    return (
                      <tr key={item.id} className={`${i !== 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <Package size={13} className="text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{item.totalIn} {t('common.pcs')}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{item.totalSold} {t('common.pcs')}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{remaining} {t('common.pcs')}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{formatSum(item.costPrice)}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{formatSum(item.salePrice)}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <ArrowUpRight size={13} />
                            {formatSum(profit)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            title={t('common.delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};