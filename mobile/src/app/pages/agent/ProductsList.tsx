import { useState, useEffect } from 'react';
import { Search, Package, Plus, Minus, RefreshCw, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';

export const ProductsList = () => {
  const { t, products, refetchData, apiConnected } = useApp();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refetchData?.();
  }, [refetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchData?.();
    setRefreshing(false);
  };

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const setQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const stockColor = (stock: number) => {
    if (stock > 100) return 'text-green-600 bg-green-50';
    if (stock > 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <MobileShell>
      <MobileHeader title={t('products.title')} showLang />
      <MobileContent className="pb-20">
        <div className="p-4 space-y-3">
          {!apiConnected && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
              <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                <WifiOff size={18} /> Backend ulanmadi — faqat lokal ro‘yxat
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Qayta yuklash
              </button>
            </div>
          )}
          {apiConnected && (
            <p className="text-xs text-green-600 dark:text-green-400">Backend ulanadi — mahsulotlar yangilandi</p>
          )}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('products.search')}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} ta mahsulot</p>

          <div className="space-y-2">
            {filtered.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-[#2563EB] dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-[#2563EB] dark:text-blue-400">
                        {product.price.toLocaleString()} {t('common.sum')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockColor(product.stock)}`}>
                        {product.stock} {t('common.pcs')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('orders.quantity')}:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(product.id, -1)}
                      disabled={!quantities[product.id]}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-6 text-center">
                      {quantities[product.id] || 0}
                    </span>
                    <button
                      onClick={() => setQty(product.id, 1)}
                      className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {quantities[product.id] > 0 && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-xs text-[#2563EB] dark:text-blue-400 font-medium">
                      Jami: {(quantities[product.id] * product.price).toLocaleString()} {t('common.sum')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </MobileContent>
      <MobileNav role="agent" />
    </MobileShell>
  );
};