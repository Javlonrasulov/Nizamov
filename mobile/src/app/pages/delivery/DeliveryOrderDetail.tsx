import { useParams, useNavigate } from 'react-router';
import { Phone, MapPin, Package, Map, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';

export const DeliveryOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();

  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <MobileShell>
        <MobileHeader title="Zakaz" showBack />
        <MobileContent className="flex items-center justify-center">
          <p className="text-gray-500">Zakaz topilmadi</p>
        </MobileContent>
      </MobileShell>
    );
  }

  const canChangeStatus = order.status === 'yuborilgan' || order.status === 'delivering' || order.status === 'accepted';

  return (
    <MobileShell>
      <MobileHeader title={t('delivery.orderDetail')} showBack showLang />
      <MobileContent className="pb-20">
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('orders.id')}</p>
                <p className="font-bold text-gray-900 dark:text-white">{formatOrderId(order)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{order.date}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('orders.client')}</p>
            <p className="font-semibold text-gray-900 dark:text-white text-base mb-2">{order.clientName}</p>
            <a href={`tel:${order.clientPhone}`} className="flex items-center gap-2 text-sm text-[#2563EB] dark:text-blue-400 mb-2 hover:underline">
              <Phone size={14} />
              {order.clientPhone}
            </a>
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{order.clientAddress}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Package size={14} className="text-gray-500 dark:text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('orders.items')}</p>
            </div>
            {order.items.map(item => (
              <div key={item.productId} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} × {item.price.toLocaleString()} {t('common.sum')}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {(item.quantity * item.price).toLocaleString()} so'm
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('orders.totalAmount')}</p>
              <p className="text-base font-bold text-[#2563EB] dark:text-blue-400">{order.total.toLocaleString()} {t('common.sum')}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/delivery/${order.id}/map`)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#2563EB] text-[#2563EB] dark:text-blue-400 dark:border-blue-500 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Map size={18} />
            {t('delivery.mapView')}
          </button>

          {canChangeStatus && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Status o'zgartirish:</p>
              <button
                onClick={() => { updateOrderStatus(order.id, 'delivered'); navigate('/delivery'); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200"
              >
                <CheckCircle size={18} />
                {t('delivery.delivered')}
              </button>
              <button
                onClick={() => { updateOrderStatus(order.id, 'cancelled'); navigate('/delivery'); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-semibold text-sm border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <XCircle size={18} />
                {t('delivery.notDelivered')}
              </button>
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="delivery" />
    </MobileShell>
  );
};