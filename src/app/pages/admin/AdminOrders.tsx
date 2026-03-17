import React, { useState, useEffect } from 'react';
import { Search, CalendarDays, RefreshCw, Eye, Package, ChevronDown, ChevronUp, Truck, MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderStatus } from '../../data/mockData';
import { useAdminVisibleOrders } from '../../components/AdminDateFilter';
import { apiGetUsers } from '../../api/users';
import type { User } from '../../data/mockData';

const formatOrderId = (order: { id: string; orderNumber?: number }) =>
  order.orderNumber != null ? `#${order.orderNumber}` : `#${order.id.slice(-6).toUpperCase()}`;

const DEFAULT_VEHICLES = ['01 A 123 AB', '02 B 456 CD', 'Gazel', 'Labo', 'Isuzu'];
const loadVehicles = (): string[] => {
  try {
    const s = localStorage.getItem('crm_vehicles');
    if (s) return JSON.parse(s);
  } catch {}
  return DEFAULT_VEHICLES;
};

export const AdminOrders = () => {
  const { t, updateOrderStatus, updateOrder, adminDateFrom, adminDateTo, refetchData, clients } = useApp();
  const adminVisibleOrders = useAdminVisibleOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [yuklashOrder, setYuklashOrder] = useState<{ id: string } | null>(null);
  const [deliveryUsers, setDeliveryUsers] = useState<User[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehiclesList, setVehiclesList] = useState<string[]>(loadVehicles);

  useEffect(() => {
    refetchData?.();
  }, [refetchData]);

  useEffect(() => {
    if (yuklashOrder) {
      apiGetUsers('delivery').then(setDeliveryUsers).catch(() => setDeliveryUsers([]));
      setSelectedDeliveryId('');
      setVehicleName('');
      setVehiclesList(loadVehicles());
    }
  }, [yuklashOrder]);

  const handleYuklashConfirm = async () => {
    if (!yuklashOrder || !selectedDeliveryId) return;
    const delivery = deliveryUsers.find(u => u.id === selectedDeliveryId);
    if (!delivery) return;
    await updateOrder(yuklashOrder.id, {
      status: 'yuborilgan',
      deliveryId: delivery.id,
      deliveryName: delivery.name,
      vehicleName: vehicleName || undefined,
    });
    setYuklashOrder(null);
    refetchData?.();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchData?.();
    setRefreshing(false);
  };

  const filtered = adminVisibleOrders.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.orderNumber != null && String(o.orderNumber).includes(search)) ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.agentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all'
      || o.status === statusFilter
      || (statusFilter === 'tayyorlanmagan' && o.status === 'sent');
    return matchSearch && matchStatus;
  });

  const statuses: Array<OrderStatus | 'all'> = ['all', 'tayyorlanmagan', 'yuborilgan', 'delivered', 'cancelled'];

  const statusLabels: Record<string, string> = {
    all: t('common.all'),
    tayyorlanmagan: t('status.tayyorlanmagan'),
    yuborilgan: t('status.yuborilgan'),
    sent: t('status.sent'),
    accepted: t('status.accepted'),
    delivering: t('status.delivering'),
    delivered: t('status.delivered'),
    cancelled: t('status.cancelled'),
  };

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    // sent, accepted, delivering — eski zakazlar uchun
    accepted: 'delivering',
    delivering: 'delivered',
  };

  const needsYuklash = (status: OrderStatus) => status === 'tayyorlanmagan' || status === 'sent';
  const getClientLoc = (clientId: string) => clients.find(c => c.id === clientId);

  const hasFilter = adminDateFrom || adminDateTo;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.ordersPage')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} {t('common.pcs')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </button>
            {hasFilter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <CalendarDays size={13} className="text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`}
              </span>
            </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.orders.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                  statusFilter === s
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.id')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.client')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.agent')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.total')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.status')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.date')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <td className="px-5 py-4 text-sm font-mono text-gray-600 dark:text-gray-300 font-medium">{formatOrderId(order)}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.clientName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.clientPhone}</p>
                        {(() => {
                          const c = getClientLoc(order.clientId);
                          if (!c?.lat || !c?.lng) return null;
                          const href = `https://maps.google.com/?q=${c.lat},${c.lng}`;
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#2563EB] dark:text-blue-400 hover:underline"
                              title={t('admin.orders.mapTitle')}
                            >
                              <MapPin size={12} />
                              {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                              <ExternalLink size={11} className="opacity-70" />
                            </a>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{order.agentName}</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{order.total.toLocaleString()} so'm</td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <StatusBadge status={order.status} />
                          {(order.deliveryName || order.vehicleName) && (
                            <div className="text-[11px] leading-4 text-gray-500 dark:text-gray-400">
                              {order.deliveryName && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-300">{t('orders.delivery')}:</span>{' '}
                                  {order.deliveryName}
                                </div>
                              )}
                              {order.vehicleName && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-300">{t('orders.vehicle')}:</span>{' '}
                                  {order.vehicleName}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{order.date}</td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#2563EB] dark:hover:text-blue-400 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={t('admin.orders.viewItems')}
                          >
                            <Eye size={14} />
                            {expandedOrderId === order.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          {needsYuklash(order.status) && (
                            <button
                              onClick={() => setYuklashOrder({ id: order.id })}
                              className="flex items-center gap-1 text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Truck size={12} />
                              Yuklash
                            </button>
                          )}
                          {nextStatus[order.status] && !needsYuklash(order.status) && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextStatus[order.status]!)}
                              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              → {statusLabels[nextStatus[order.status]!]}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr key={`${order.id}-expand`} className="bg-gray-50/80 dark:bg-gray-800/80">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-[#2563EB] dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('orders.items')}</span>
                          </div>
                          <div className="overflow-x-auto rounded border-2 border-gray-300 dark:border-gray-500 shadow-sm bg-gray-50 dark:bg-gray-800/80">
                            <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed', minWidth: 380 }}>
                              <thead>
                                <tr className="bg-[#217346] text-white">
                                  <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-10">#</th>
                                  <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500">{t('admin.suppliers.productName')}</th>
                                  <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-20">{t('admin.suppliers.quantity')}</th>
                                  <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-24">{t('admin.suppliers.salePrice')}</th>
                                  <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-24">{t('admin.suppliers.totalSum')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className={`border border-gray-300 dark:border-gray-500 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/80 dark:bg-gray-700/50'}`}
                                  >
                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500">{idx + 1}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-500">{item.productName}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500">{item.quantity} {t('common.pcs')}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500">{(item.price || 0).toLocaleString('ru-RU')} {t('common.sum')}</td>
                                    <td className="px-3 py-2 text-right font-semibold text-[#217346] dark:text-green-400 border border-gray-300 dark:border-gray-500">
                                      {((item.quantity || 0) * (item.price || 0)).toLocaleString('ru-RU')} {t('common.sum')}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-100 dark:bg-gray-700/40">
                                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                  <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500">{t('common.total')}</td>
                                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                  <td className="px-3 py-2 text-right font-bold text-[#217346] dark:text-green-400 border border-gray-300 dark:border-gray-500">
                                    {(order.total || 0).toLocaleString('ru-RU')} {t('common.sum')}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  {hasFilter ? 'Bu sana uchun zakaz topilmadi' : t('orders.empty')}
                </p>
              </div>
            )}
          </div>
        </div>

        {yuklashOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60" onClick={() => setYuklashOrder(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Zakazni yuklash</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Qaysi mashinaga va qaysi dostavkachiga yuklansin?</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mashina {t('common.optional')}</label>
                  <select
                    value={vehicleName}
                    onChange={e => setVehicleName(e.target.value)}
                    className="crm-select w-full"
                  >
                    <option value="">Mashina tanlang</option>
                    {vehiclesList.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dostavkachi *</label>
                  <select
                    value={selectedDeliveryId}
                    onChange={e => setSelectedDeliveryId(e.target.value)}
                    className="crm-select w-full"
                  >
                    <option value="">Tanlang</option>
                    {deliveryUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setYuklashOrder(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleYuklashConfirm}
                  disabled={!selectedDeliveryId}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yuklash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
