import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, TrendingUp, DollarSign, BarChart2, CalendarDays } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { SimpleLineChart, SimpleHBarChart } from '../../components/SimpleCharts';
import { getMonthKey, normalizeDateValue, useAdminVisibleOrders } from '../../components/AdminDateFilter';
import { apiGetClientBalance } from '../../api/payments';
import { apiGetReturns } from '../../api/returns';

export const AdminDashboard = () => {
  const { t, adminDateFrom, adminDateTo, lang, orders, products, expenses } = useApp();
  const filteredOrders = useAdminVisibleOrders();
  const visibleOrders = orders.filter(o => o.status !== 'new');
  const hasFilter = Boolean(adminDateFrom || adminDateTo);
  const today = normalizeDateValue(new Date().toISOString());
  const referenceMonth = getMonthKey(adminDateTo || adminDateFrom || today, today);
  const todayOrders = visibleOrders.filter(o => normalizeDateValue(o.date) === today);
  const monthOrders = visibleOrders.filter(o => getMonthKey(o.date, today) === referenceMonth);
  const deliveredOrders = useMemo(
    () => filteredOrders.filter(o => o.status === 'delivered'),
    [filteredOrders],
  );
  const [paidByOrderId, setPaidByOrderId] = useState<Record<string, number>>({});
  const [returnsDetailByOrderId, setReturnsDetailByOrderId] = useState<Record<string, {
    deliveredAmount: number;
    returnedQtyByProductId: Record<string, number>;
  }>>({});

  const productCostById: Record<string, number> = {};
  products.forEach(product => {
    productCostById[product.id] = product.cost ?? 0;
  });

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
          deliveredAmount: number;
          returnedQtyByProductId: Record<string, number>;
        }> = {};

        for (const [orderId, order] of orderMap.entries()) {
          const returnedQtyByProductId = returnedQtyByOrder.get(orderId) || {};
          let deliveredAmount = 0;

          for (const item of order.items || []) {
            const orderedQty = Number(item.quantity || 0);
            const returnedQty = Math.min(orderedQty, returnedQtyByProductId[item.productId] || 0);
            const deliveredQty = Math.max(0, orderedQty - returnedQty);
            const price = Number(item.price || 0);
            deliveredAmount += deliveredQty * price;
          }

          nextDetail[orderId] = {
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

  const financialOrders = useMemo(() => {
    return deliveredOrders.map(order => {
      const returnDetail = returnsDetailByOrderId[order.id];
      const paid = Math.max(0, paidByOrderId[order.id] ?? 0);
      const adjustedRevenue = returnDetail?.deliveredAmount ?? order.total;
      const collected = Math.min(adjustedRevenue, paid);

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

      return {
        ...order,
        collected,
        realizedGrossProfit: adjustedGrossProfit * collectionRatio,
      };
    });
  }, [deliveredOrders, paidByOrderId, productCostById, returnsDetailByOrderId]);

  const filteredExpenses = expenses.filter(e => {
    if (!adminDateFrom && !adminDateTo) return true;
    const from = adminDateFrom || '0000-00-00';
    const to = adminDateTo || '9999-99-99';
    return e.date >= from && e.date <= to;
  });

  const totalSales = financialOrders.reduce((sum, order) => sum + order.collected, 0);
  const profit = financialOrders.reduce((sum, order) => sum + order.realizedGrossProfit, 0) - filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const stats = [
    { label: hasFilter ? t('admin.dashboard.filteredOrders') : t('admin.todayOrders'), value: hasFilter ? filteredOrders.length : todayOrders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400', trend: '+12%' },
    { label: t('admin.monthOrders'), value: monthOrders.length, icon: BarChart2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400', trend: '+8%' },
    { label: t('admin.totalSales'), value: `${totalSales.toLocaleString()} so'm`, icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400', trend: '+15%' },
    { label: t('admin.profit'), value: `${Math.round(profit).toLocaleString()} so'm`, icon: DollarSign, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400', trend: '+10%' },
  ];

  const recentOrders = filteredOrders.slice(0, 8);

  // Build daily data from filtered orders
  const dateMap: Record<string, number> = {};
  filteredOrders.forEach(o => {
    const orderDate = normalizeDateValue(o.date);
    dateMap[orderDate] = (dateMap[orderDate] || 0) + o.total;
  });
  const lineData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ label: date.slice(5), value }));

  // Product sales from filtered orders
  const productMap: Record<string, number> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      productMap[item.productName] = (productMap[item.productName] || 0) + item.quantity * item.price;
    });
  });
  const barData = Object.entries(productMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([label, value]) => ({ label: label.split(' ')[0], value }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' })}
            </p>
          </div>
          {hasFilter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <CalendarDays size={13} className="text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`}
              </span>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white break-all">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        {lineData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('admin.dailyOrders')}</h3>
              <SimpleLineChart
                data={lineData}
                color="#2563EB"
                height={220}
                formatY={v => `${v.toLocaleString()}`}
                formatTooltip={v => `${v.toLocaleString()} so'm`}
              />
            </div>
            {barData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('admin.salesByProduct')}</h3>
                <SimpleHBarChart
                  data={barData}
                  color="#2563EB"
                  formatX={v => `${v.toLocaleString()}`}
                  formatTooltip={v => `${v.toLocaleString()} so'm`}
                />
              </div>
            )}
          </div>
        ) : hasFilter ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <CalendarDays size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">{t('admin.dashboard.noChartForDate')}</p>
          </div>
        ) : null}

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {hasFilter ? t('admin.dashboard.filteredOrders') : t('admin.dashboard.latestOrders')}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">{recentOrders.length} {t('common.pcs')}</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('admin.dashboard.noOrdersForDate')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('orders.id')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('orders.client')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('orders.agent')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('common.total')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">{order.orderNumber != null ? `#${order.orderNumber}` : `#${order.id.slice(-6).toUpperCase()}`}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.clientName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.agentName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{order.total.toLocaleString()} so'm</td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};