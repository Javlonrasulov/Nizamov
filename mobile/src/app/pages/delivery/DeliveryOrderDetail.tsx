import { useParams, useNavigate } from 'react-router';
import { useMemo, useState } from 'react';
import { Phone, MapPin, Package, Map, CheckCircle, XCircle, CreditCard, X, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';
import { apiCreatePayment, PaymentMethod } from '../../api/payments';
import { apiCreateReturn } from '../../api/returns';

export const DeliveryOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, orders, updateOrderStatus, currentUser } = useApp();
  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  const [paidToggle, setPaidToggle] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnQtyByProduct, setReturnQtyByProduct] = useState<Record<string, number>>({});
  const [returnSaving, setReturnSaving] = useState(false);
  const [returnError, setReturnError] = useState('');

  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const order = orders.find(o => o.id === id);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  if (!order) {
    return (
      <MobileShell>
        <MobileHeader title={t('delivery.orderDetail')} showBack showLang />
        <MobileContent className="flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-gray-700 dark:text-gray-200 font-semibold">{t('orders.notFoundTitle')}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('orders.notFoundText')}</p>
          </div>
        </MobileContent>
      </MobileShell>
    );
  }

  const canChangeStatus = order.status === 'yuborilgan' || order.status === 'delivering' || order.status === 'accepted';

  const openPayModal = () => {
    setPaidToggle(true);
    setMethod('cash');
    setAmount(String(order.total || ''));
    setPayOpen(true);
  };

  const handleDeliveredConfirm = async () => {
    if (!order) return;
    setSaving(true);
    try {
      if (paidToggle && currentUser?.id) {
        const amt = parseInt(amount || '0', 10);
        if (amt > 0) {
          await apiCreatePayment({
            clientId: order.clientId,
            orderId: order.id,
            amount: amt,
            method,
            date: todayStr,
            collectedByUserId: currentUser.id,
          });
        }
      }
      await updateOrderStatus(order.id, 'delivered');
      setPayOpen(false);
      navigate('/delivery');
    } finally {
      setSaving(false);
    }
  };

  const amountOk = !paidToggle || parseInt(amount || '0', 10) > 0;
  const formattedAmount = amount ? parseInt(amount, 10).toLocaleString('ru-RU') : '';

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
                  {(item.quantity * item.price).toLocaleString()} {t('common.sum')}
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
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('delivery.changeStatus')}:</p>
              <button
                onClick={openPayModal}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200"
              >
                <CheckCircle size={18} />
                {t('delivery.delivered')}
              </button>
              <button
                onClick={() => {
                  setReturnOpen(true);
                  setReturnQtyByProduct({});
                  setReturnError('');
                }}
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

      {payOpen && (
        <div className="fixed inset-0 z-[9000] bg-black/50 flex items-end justify-center" onClick={() => !saving && setPayOpen(false)}>
          <div
            className="w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-3xl p-4 border-t border-gray-100 dark:border-gray-800"
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), var(--vv-bottom, 0px)) + 16px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{t('payments.delivery.title')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.clientName}</p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setPayOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              <input
                type="checkbox"
                checked={paidToggle}
                onChange={e => setPaidToggle(e.target.checked)}
                className="accent-[#2563EB]"
              />
              {t('payments.delivery.paidToggle')}
            </label>

            {paidToggle && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{t('payments.method')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'terminal', 'transfer'] as PaymentMethod[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                          method === m
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t(`payments.method.${m}` as any)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{t('payments.amount')}</p>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      inputMode="numeric"
                      value={formattedAmount}
                      onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    {t('payments.delivery.orderTotal')}: {order.total.toLocaleString()} {t('common.sum')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => !saving && setPayOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeliveredConfirm}
                disabled={saving || !amountOk}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? '...' : t('delivery.delivered')}
              </button>
            </div>
          </div>
        </div>
      )}

      {returnOpen && order && (
        <div className="fixed inset-0 z-[9000] bg-black/50 flex items-end justify-center" onClick={() => !returnSaving && setReturnOpen(false)}>
          <div
            className="w-full max-w-[430px] max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-3xl overflow-hidden border-t border-gray-100 dark:border-gray-800 flex flex-col"
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), var(--vv-bottom, 0px)) + 16px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t('returns.title')}</p>
              </div>
              <button
                type="button"
                onClick={() => !returnSaving && setReturnOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{t('returns.selectItems')}</p>

            <button
              type="button"
              onClick={() => {
                const all: Record<string, number> = {};
                order.items.forEach(it => { all[it.productId] = it.quantity; });
                setReturnQtyByProduct(all);
              }}
              className="mx-4 mb-2 py-2.5 rounded-xl border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              {t('returns.returnAll')}
            </button>

            <div className="flex-1 overflow-y-auto px-4 pb-2">
              {order.items.map(item => {
                const qty = returnQtyByProduct[item.productId] ?? 0;
                const maxQty = item.quantity;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={qty > 0}
                        onChange={e => {
                          setReturnQtyByProduct(prev => ({
                            ...prev,
                            [item.productId]: e.target.checked ? maxQty : 0,
                          }));
                        }}
                        className="accent-[#2563EB] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{maxQty} {t('common.pcs')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={maxQty}
                        value={qty || ''}
                        onChange={e => {
                          const v = Math.max(0, Math.min(maxQty, parseInt(e.target.value, 10) || 0));
                          setReturnQtyByProduct(prev => ({ ...prev, [item.productId]: v }));
                        }}
                        className="w-14 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-center text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {returnError && (
              <p className="px-4 py-2 text-xs text-red-600 dark:text-red-400">{returnError}</p>
            )}

            <div className="flex gap-2 px-4 pt-3">
              <button
                type="button"
                onClick={() => !returnSaving && setReturnOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!order.clientId || !currentUser?.id) {
                    setReturnError('Xatolik');
                    return;
                  }
                  const items = order.items
                    .map(it => ({ ...it, qty: returnQtyByProduct[it.productId] ?? 0 }))
                    .filter(it => it.qty > 0)
                    .map(it => ({ productId: it.productId, productName: it.productName, quantity: it.qty }));
                  if (items.length === 0) {
                    setReturnError(t('returns.error.noItems'));
                    return;
                  }
                  setReturnSaving(true);
                  setReturnError('');
                  try {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    await apiCreateReturn({
                      clientId: order.clientId,
                      orderId: order.id,
                      date: todayStr,
                      createdByUserId: currentUser.id,
                      status: 'pending',
                      items,
                    });
                    setReturnOpen(false);
                    navigate('/delivery');
                  } catch (e: any) {
                    setReturnError(e?.message || 'Xatolik');
                  } finally {
                    setReturnSaving(false);
                  }
                }}
                disabled={returnSaving}
                className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60"
              >
                {returnSaving ? '...' : t('returns.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
};