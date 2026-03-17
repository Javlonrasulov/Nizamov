import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { TrendingUp, ShoppingBag, Package, CalendarDays } from 'lucide-react';
import { SimpleVBarChart } from '../../components/SimpleCharts';
import { useFilteredOrders } from '../../components/AdminDateFilter';

export const AgentStats = () => {
  const { t, adminDateFrom, adminDateTo } = useApp();
  const filteredOrders = useFilteredOrders();
  const hasFilter = adminDateFrom || adminDateTo;

  // Build stats from live orders (includes "new" too)
  const byAgent = new Map<string, {
    id: string;
    name: string;
    todaySales: number;
    monthlySales: number;
    ordersCount: number;
    itemsSold: number;
    dailySales: any[];
    weeklySales: any[];
  }>();

  filteredOrders.forEach(o => {
    const current = byAgent.get(o.agentId) || {
      id: o.agentId,
      name: o.agentName || o.agentId,
      todaySales: 0,
      monthlySales: 0,
      ordersCount: 0,
      itemsSold: 0,
      dailySales: [],
      weeklySales: [],
    };
    current.todaySales += o.total || 0;
    current.monthlySales += o.total || 0;
    current.ordersCount += 1;
    current.itemsSold += (o.items || []).reduce((s, i) => s + i.quantity, 0);
    byAgent.set(o.agentId, current);
  });

  const agentStatsList = Array.from(byAgent.values()).sort((a, b) => b.todaySales - a.todaySales);

  const todayData = agentStatsList.map(a => ({ label: a.name.split(' ')[0], value: a.todaySales }));
  const monthlyData = agentStatsList.map(a => ({ label: a.name.split(' ')[0], value: a.monthlySales }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.agentStats')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('admin.agentStats.subtitle')}</p>
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

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agentStatsList.length === 0 ? (
            <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Statistika yo&apos;q
            </div>
          ) : agentStatsList.map((agent, idx) => {
            const colors = [
              { bg: 'from-blue-500 to-blue-600' },
              { bg: 'from-purple-500 to-purple-600' },
              { bg: 'from-green-500 to-green-600' },
            ];
            const color = colors[idx % colors.length];
            return (
              <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-r ${color.bg} p-4 text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="font-bold">{agent.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <p className="text-white/70 text-xs">Agent</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-1.5">
                      <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{agent.todaySales.toLocaleString()} so'm</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{hasFilter ? 'Davr' : t('admin.todaySales')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-1.5">
                      <ShoppingBag size={14} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{agent.ordersCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.ordersCount')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-1.5">
                      <Package size={14} className="text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{agent.itemsSold}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.itemsSold')}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{hasFilter ? 'Jami savdo' : t('admin.monthlySales')}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{agent.monthlySales.toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {hasFilter ? t('admin.agentStats.periodSalesByAgent') : t('admin.agentStats.todaySalesChart')}
            </h3>
            <SimpleVBarChart
              data={todayData}
              color="#2563EB"
              height={240}
              formatY={v => `${v.toLocaleString()}`}
              formatTooltip={v => `${v.toLocaleString()} so'm`}
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {hasFilter ? t('admin.agentStats.totalCompare') : t('admin.agentStats.monthlySalesChart')}
            </h3>
            <SimpleVBarChart
              data={monthlyData}
              color="#93c5fd"
              height={240}
              formatY={v => `${v.toLocaleString()}`}
              formatTooltip={v => `${v.toLocaleString()} so'm`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('admin.agentStats.tableTitle')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('admin.agentName')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                    {hasFilter ? 'Davr savdosi' : t('admin.todaySales')}
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">
                    {hasFilter ? 'Jami savdo' : t('admin.monthlySales')}
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('admin.ordersCount')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 py-3">{t('admin.itemsSold')}</th>
                </tr>
              </thead>
              <tbody>
                {agentStatsList.map(agent => (
                  <tr key={agent.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                          <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">{agent.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{agent.todaySales.toLocaleString()} so'm</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#2563EB] dark:text-blue-400">{agent.monthlySales.toLocaleString()} so'm</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">{agent.ordersCount}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">{agent.itemsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
