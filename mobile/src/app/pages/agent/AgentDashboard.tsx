import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, TrendingUp, Plus, UserPlus, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';

export const AgentDashboard = () => {
  const { t, lang, currentUser, orders, refetchData, apiConnected } = useApp();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedOk, setRefreshedOk] = useState(false);

  useEffect(() => {
    refetchData?.();
  }, [refetchData]);

  const handleRefresh = async () => {
    const startedAt = Date.now();
    const minSpinMs = 700;
    setRefreshing(true);
    try {
      await refetchData?.();
      const elapsed = Date.now() - startedAt;
      const waitMore = Math.max(0, minSpinMs - elapsed);
      window.setTimeout(() => {
        setRefreshing(false);
        setRefreshedOk(true);
        window.setTimeout(() => setRefreshedOk(false), 1500);
      }, waitMore);
    } finally {
      // refreshing state is turned off after minimum spin time
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const myOrders = orders.filter(o => o.agentId === currentUser?.id);
  const todayOrders = myOrders.filter(o => o.date === today);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = myOrders.slice(0, 3);

  const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU') + ` ${t('common.sum')}`;
  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;
  const locale = lang === 'ru' ? 'ru-RU' : (lang === 'uz_kir' ? 'uz-Cyrl-UZ' : 'uz-Latn-UZ');

  return (
    <MobileShell>
      <MobileHeader
        title={t('agent.dashboard.title')}
        showLogout
        showLang
        rightElement={(
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-60"
            title={t('common.refresh')}
          >
            {refreshedOk && !refreshing
              ? <Check size={16} className="text-green-600 dark:text-green-400" />
              : <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
          </button>
        )}
      />
      <MobileContent className="pb-20">
        <div className="p-4 space-y-4">
          {/* Greeting */}
          <div className="bg-gradient-to-br from-[#2563EB] to-blue-700 rounded-2xl p-4 text-white">
            <h2 className="font-bold text-lg">{currentUser?.name}</h2>
            <p className="text-blue-200 text-xs mt-1">
              {new Date().toLocaleDateString(locale, { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}
            </p>
            <p className="text-sm mt-2 font-medium text-white/90">
              {apiConnected ? `✓ ${t('common.serverConnected')}` : `✗ ${t('common.serverDisconnected')}`}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <ShoppingBag size={18} className="text-[#2563EB] dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayOrders.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('agent.dashboard.todayOrders')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{formatCurrency(todaySales)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('agent.dashboard.todaySales')}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('agent.dashboard.quickActions')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/agent/orders/create')}
                className="bg-[#2563EB] text-white rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-blue-700 active:scale-[0.97] transition-all shadow-lg shadow-blue-200"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <span className="text-sm font-semibold">{t('agent.dashboard.newOrder')}</span>
              </button>
              <button
                onClick={() => navigate('/agent/clients/add')}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.97] transition-all shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserPlus size={18} className="text-[#2563EB] dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold">{t('agent.dashboard.addClient')}</span>
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('orders.history')}</h3>
              <button
                onClick={() => navigate('/agent/orders')}
                className="text-xs text-[#2563EB] dark:text-blue-400 font-medium flex items-center gap-1"
              >
                {t('common.all')} <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentOrders.map(order => (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.clientName}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatOrderId(order)}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">{t('orders.empty')}</div>
              )}
            </div>
          </div>
        </div>
      </MobileContent>
      <MobileNav role="agent" />
    </MobileShell>
  );
};