import { useNavigate } from 'react-router';
import {
  Truck, CheckCircle2, Clock, Package,
  MapPin, Phone, ChevronRight, ShoppingBag, User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';

export const DeliveryDashboard = () => {
  const { t, currentUser, orders } = useApp();
  const navigate = useNavigate();

  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const today = new Date().toISOString().split('T')[0];

  /* Faqat bu dostavchiga tegishli zakazlar */
  const myOrders = orders.filter(o => o.deliveryId === currentUser?.id);
  const todayOrders = myOrders.filter(o => o.date === today);

  const active = todayOrders.filter(
    o => o.status === 'yuborilgan' || o.status === 'delivering' || o.status === 'accepted'
  );
  const delivered = todayOrders.filter(o => o.status === 'delivered');
  // agent yuborgan (tayyorlanmagan/sent) dostavkachiga berilmagan; dostavkachining pending'i yuborilgan
  const pending = todayOrders.filter(o => o.status === 'yuborilgan');

  const totalToday = todayOrders.reduce((s, o) => s + o.total, 0);
  const deliveredSum = delivered.reduce((s, o) => s + o.total, 0);

  const formatSum = (n: number) => `${n.toLocaleString('ru-RU')} ${t('common.sum')}`;

  return (
    <MobileShell>
      <MobileHeader title={t('common.dashboard')} showLang showLogout />
      <MobileContent className="pb-20">

        {/* ── Salomlash banner ── */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 px-4 pt-5 pb-6 relative overflow-hidden">
          {/* Fon bezak doiralari */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative z-10">
            <h2 className="font-bold text-xl text-white">{currentUser?.name}</h2>

            {/* Statistika qatorlari */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { icon: Truck, label: t('delivery.stat.active'), value: active.length, color: 'bg-white/20' },
                { icon: CheckCircle2, label: t('delivery.delivered'), value: delivered.length, color: 'bg-white/20' },
                { icon: Clock, label: t('delivery.stat.pending'), value: pending.length, color: 'bg-white/20' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.color} rounded-2xl px-3 py-3 flex flex-col items-center gap-1`}>
                  <stat.icon size={18} className="text-purple-200" />
                  <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                  <span className="text-purple-200 text-[10px] text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bugungi summa ── */}
        <div className="mx-4 -mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('delivery.stat.todayTotal')}</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">{formatSum(totalToday)}</p>
          </div>
          <div className="w-px h-8 bg-gray-100 dark:bg-gray-700 mx-2" />
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('delivery.delivered')}</p>
            <p className="text-base font-bold text-green-600 dark:text-green-400">{formatSum(deliveredSum)}</p>
          </div>
        </div>

        <div className="p-4 space-y-4 mt-1">

          {/* ── Tezkor harakatlar ── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/delivery/orders')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.97] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{t('common.orders')}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{t('orders.history')}</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/delivery/profile')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.97] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{t('common.profile')}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{t('delivery.stat.info')}</p>
              </div>
            </button>
          </div>

          {/* ── Faol zakazlar ── */}
          {active.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <Truck size={14} className="text-purple-500" />
                  {t('delivery.stat.active')}
                </h3>
                <span className="text-xs text-purple-500 dark:text-purple-400 font-medium">{active.length} {t('common.pcs')}</span>
              </div>
              <div className="space-y-2">
                {active.map(order => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/delivery/${order.id}`)}
                    className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/40 shadow-sm text-left active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{order.clientName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{formatOrderId(order)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={order.status} />
                        <ChevronRight size={14} className="text-gray-300 dark:text-gray-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <MapPin size={11} className="text-purple-400 flex-shrink-0" />
                      <span className="truncate">{order.clientAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Phone size={11} className="text-purple-400 flex-shrink-0" />
                      <span>{order.clientPhone}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Package size={11} />
                        {order.items.length} {t('common.pcs')} {t('orders.items')}
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {formatSum(order.total)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Yetkazilgan ── */}
          {delivered.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-500" />
                  {t('delivery.delivered')}
                </h3>
                <span className="text-xs text-green-500 font-medium">{delivered.length} {t('common.pcs')}</span>
              </div>
              <div className="space-y-2">
                {delivered.map(order => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/delivery/${order.id}`)}
                    className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm text-left flex items-center justify-between active:scale-[0.98] transition-all opacity-80"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{order.clientName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {order.items.length} {t('orders.productsCount')} · {formatSum(order.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Bo'sh holat ── */}
          {todayOrders.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                <Truck size={28} className="text-purple-300 dark:text-purple-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('delivery.stat.noOrders')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('delivery.stat.waitOrders')}</p>
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="delivery" />
    </MobileShell>
  );
};