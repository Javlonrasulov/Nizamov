import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Package, Phone, MapPin, Edit2, Check, X, Plus, Minus, Warehouse, Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderItem } from '../../data/mockData';
import { apiGetClientBalance, type ClientBalance } from '../../api/payments';
import { apiGetReturns, type ReturnRecord } from '../../api/returns';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang, orders, products, updateOrder, updateOrderStatus } = useApp();

  const order = orders.find(o => o.id === id);
  const [stockWarn, setStockWarn] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [editItems, setEditItems] = useState<OrderItem[]>(order?.items || []);
  const [productSearch, setProductSearch] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  const [orderReturns, setOrderReturns] = useState<ReturnRecord[]>([]);
  const [orderReturnsLoading, setOrderReturnsLoading] = useState(false);
  const [clientBalance, setClientBalance] = useState<ClientBalance | null>(null);
  const [clientBalanceLoading, setClientBalanceLoading] = useState(false);

  if (!order) {
    return (
      <MobileShell>
        <MobileHeader title={t('orders.notFoundTitle')} showBack />
        <MobileContent className="flex items-center justify-center">
          <p className="text-gray-500 text-sm">{t('orders.notFoundText')}</p>
        </MobileContent>
      </MobileShell>
    );
  }

  const canEdit = order.status === 'new';

  const reloadReturnsAndBalance = async () => {
    setOrderReturnsLoading(true);
    setClientBalanceLoading(true);
    try {
      const [rets, bal] = await Promise.all([
        apiGetReturns({ orderId: order.id }),
        apiGetClientBalance(order.clientId),
      ]);
      setOrderReturns(rets);
      setClientBalance(bal);
    } catch {
      // ignore
    } finally {
      setOrderReturnsLoading(false);
      setClientBalanceLoading(false);
    }
  };

  useEffect(() => {
    reloadReturnsAndBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id, order.clientId]);

  const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU') + ` ${t('common.sum')}`;
  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const totalAmount = editMode
    ? editItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    : order.total;

  const priceByProductId = useMemo(
    () => new Map(order.items.map(it => [it.productId, it.price ?? 0] as const)),
    [order.items],
  );

  const pendingReturns = orderReturns.filter(r => r.status === 'pending');
  const acceptedReturns = orderReturns.filter(r => r.status === 'accepted');

  const returnedAmountAllFromReturns = useMemo(() => {
    return acceptedReturns.reduce((sum, r) => {
      return sum + (r.items || []).reduce((s, it) => {
        const price = priceByProductId.get(it.productId) ?? 0;
        return s + (it.quantity || 0) * price;
      }, 0);
    }, 0);
  }, [acceptedReturns, priceByProductId]);

  const remainingMoneyFromReturns = Math.max(0, (order.total ?? 0) - returnedAmountAllFromReturns);

  const perOrderRow = clientBalance?.perOrder?.find(r => r.orderId === order.id) ?? null;
  const paidForOrder = perOrderRow?.paid ?? 0;
  const receivedForOrder = Math.min(paidForOrder, remainingMoneyFromReturns);
  const debtForOrder = perOrderRow?.debt ?? Math.max(0, remainingMoneyFromReturns - paidForOrder);
  const isAllReturned = remainingMoneyFromReturns <= 0.00001 && returnedAmountAllFromReturns > 0;
  const isPartialReturned = returnedAmountAllFromReturns > 0 && !isAllReturned;

  const returnStatusLabel = (s: 'pending' | 'accepted') => {
    if (lang === 'ru') return s === 'pending' ? 'Ожидает' : 'Принят';
    return s === 'pending' ? 'Kutilayotgan' : 'Qabul qilingan';
  };

  const getEditQty = (productId: string) =>
    editItems.find(i => i.productId === productId)?.quantity || 0;

  const setEditQty = (productId: string, productName: string, price: number, delta: number) => {
    setEditItems(prev => {
      const prod = products.find(p => p.id === productId);
      const max = Math.max(0, prod?.stock ?? 0);
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        const newQty = Math.min(max || existing.quantity + delta, existing.quantity + delta);
        if (newQty <= 0) return prev.filter(i => i.productId !== productId);
        return prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) {
        if (max <= 0) return prev;
        return [...prev, { productId, productName, quantity: 1, price }];
      }
      return prev;
    });
  };

  const setEditQtyManual = (productId: string, productName: string, price: number, val: string) => {
    const qty = parseInt(val);
    if (isNaN(qty) || qty < 0) return;
    const prod = products.find(p => p.id === productId);
    const max = Math.max(0, prod?.stock ?? 0);
    if (qty > max) {
      setStockWarn(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => setStockWarn(prev => ({ ...prev, [productId]: false })), 5000);
    }
    const clamped = Math.min(max, qty);
    setEditItems(prev => {
      if (clamped === 0) return prev.filter(i => i.productId !== productId);
      const existing = prev.find(i => i.productId === productId);
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity: clamped } : i);
      return [...prev, { productId, productName, quantity: clamped, price }];
    });
  };

  const handleSaveEdit = () => {
    const newTotal = editItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    updateOrder(order.id, { items: editItems, total: newTotal });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditItems(order.items);
    setEditMode(false);
    setProductSearch('');
  };

  const handleSendToWarehouse = () => {
    updateOrderStatus(order.id, 'sent');
    setConfirmSend(false);
    navigate('/agent/orders');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <MobileShell>
      <MobileHeader
        title={t('orders.orderDetail')}
        showBack
        showLang
        rightElement={
          canEdit && !editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
            >
              <Edit2 size={13} />
              {t('common.edit')}
            </button>
          ) : undefined
        }
      />
      <MobileContent className="pb-6">
        <div className="p-4 space-y-4">

          {/* Order info card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{order.clientName}</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{formatOrderId(order)}</p>
              </div>
              {isAllReturned ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {t('returns.summary.allReturned')}
                </span>
              ) : (
                <StatusBadge status={order.status} />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Phone size={12} className="text-gray-400 dark:text-gray-500" />
                <span>{order.clientPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={12} className="text-gray-400 dark:text-gray-500" />
                <span>{order.clientAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-gray-400 dark:text-gray-500">📅</span>
                <span>{order.date}</span>
              </div>
            </div>
          </div>

          {/* Products section */}
          {editMode ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('orders.selectProducts')}</h3>
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder={t('orders.searchProduct')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/30"
                />
              </div>
              <div className="space-y-2">
                {filteredProducts.map(product => {
                  const qty = getEditQty(product.id);
                  const stock = product.stock ?? 0;
                  const canPlus = stock > 0 && qty < stock;
                  const warn = !!stockWarn[product.id];
                  return (
                    <div key={product.id} className={`rounded-xl p-3 border-2 transition-all ${qty > 0 ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Package size={15} className="text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white leading-tight">{product.name}</p>
                          <p className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold mt-0.5">{formatCurrency(product.price)}</p>
                          <p className={`text-[11px] mt-0.5 ${warn ? 'text-red-600 dark:text-red-400 animate-pulse font-semibold' : stock > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                            {t('orders.stockLabel')}: {stock} {t('common.pcs')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditQty(product.id, product.name, product.price, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center disabled:opacity-30 active:bg-gray-100 dark:active:bg-gray-700"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={stock}
                            value={qty || ''}
                            onChange={e => setEditQtyManual(product.id, product.name, product.price, e.target.value)}
                            onBlur={() => setEditQtyManual(product.id, product.name, product.price, String(qty))}
                            placeholder="0"
                            className="w-10 h-7 text-center text-sm font-bold border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => setEditQty(product.id, product.name, product.price, 1)}
                            disabled={!canPlus}
                            className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center active:bg-blue-700 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              {editItems.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <p className="text-sm font-semibold text-[#2563EB] dark:text-blue-400">
                    {t('orders.totalLabel')}: {formatCurrency(totalAmount)} ({editItems.length} {t('orders.productsCount')})
                  </p>
                </div>
              )}

              {/* Edit actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-1.5"
                >
                  <X size={15} />
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editItems.length === 0}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Check size={15} />
                  {t('common.save')}
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('orders.items')}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-[#2563EB]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.quantity} {t('common.pcs')} × {item.price.toLocaleString('ru-RU')} {t('common.sum')}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{t('orders.totalAmount')}</p>
                <p className="text-base font-bold text-[#2563EB]">{formatCurrency(order.total)}</p>
              </div>
            </div>
          )}

          {/* Vozvratlar summary (agent ham ko'rishi uchun) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {lang === 'ru' ? 'Возврат' : 'Vozvrat'}
              </p>
              {orderReturns.length > 0 ? (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isAllReturned
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isAllReturned
                    ? (lang === 'ru' ? 'Все возвращено' : 'Hammasi qaytarildi')
                    : (isPartialReturned ? (lang === 'ru' ? 'Частичный возврат' : 'Qisman qaytarildi') : '—')}
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">—</span>
              )}
            </div>

            {orderReturnsLoading || clientBalanceLoading ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...'}</p>
            ) : orderReturns.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'ru' ? 'Нет возвратов' : "Hozircha vozvrat yo‘q"}</p>
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'ru' ? 'Возвращено' : 'Qaytarildi'}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {returnedAmountAllFromReturns.toLocaleString('ru-RU')} {t('common.sum')}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'ru' ? 'Получено' : 'Pul oldim'}</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {receivedForOrder.toLocaleString('ru-RU')} {t('common.sum')}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'ru' ? 'Осталось' : 'Qolgan'}</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-300">
                      {debtForOrder.toLocaleString('ru-RU')} {t('common.sum')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      {lang === 'ru' ? 'Ожидает' : 'Kutilayotgan'}
                    </p>
                    {pendingReturns.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 py-1">—</p>
                    ) : (
                      pendingReturns.map(r => (
                        <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-3 mb-2 last:mb-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{r.date}</p>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold">
                              {returnStatusLabel('pending')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {r.items.map(it => {
                              const price = priceByProductId.get(it.productId) ?? 0;
                              const lineAmount = (it.quantity || 0) * price;
                              return (
                                <div key={it.productId} className="flex items-center justify-between gap-3 text-xs text-gray-700 dark:text-gray-200">
                                  <span className="truncate">{it.productName ?? it.productId}</span>
                                  <span className="shrink-0 font-medium">
                                    {it.quantity} {t('common.pcs')} · {lineAmount.toLocaleString('ru-RU')} {t('common.sum')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      {t('returns.status.acceptedByAdmin')}
                    </p>
                    {acceptedReturns.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 py-1">—</p>
                    ) : (
                      acceptedReturns.map(r => (
                        <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-3 mb-2 last:mb-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{r.date}</p>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold">
                              {t('returns.status.acceptedByAdmin')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {r.items.map(it => {
                              const price = priceByProductId.get(it.productId) ?? 0;
                              const lineAmount = (it.quantity || 0) * price;
                              return (
                                <div key={it.productId} className="flex items-center justify-between gap-3 text-xs text-gray-700 dark:text-gray-200">
                                  <span className="truncate">{it.productName ?? it.productId}</span>
                                  <span className="shrink-0 font-medium">
                                    {it.quantity} {t('common.pcs')} · {lineAmount.toLocaleString('ru-RU')} {t('common.sum')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Warehouse action */}
          {!editMode && (
            <div className="pt-1">
              {canEdit ? (
                confirmSend ? (
                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                    <p className="text-sm font-semibold text-orange-800 mb-1">Omborga yuborishni tasdiqlaysizmi?</p>
                    <p className="text-xs text-orange-600 mb-3">Yuborilgandan keyin zakazni o'zgartirib bo'lmaydi.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmSend(false)}
                        className="flex-1 py-2.5 rounded-xl border border-orange-300 text-orange-700 font-medium text-sm"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={handleSendToWarehouse}
                        className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5"
                      >
                        <Warehouse size={15} />
                        Ha, yuborish
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmSend(true)}
                    className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
                  >
                    <Warehouse size={16} />
                    {t('orders.sendToWarehouse')}
                  </button>
                )
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-500">
                  <Lock size={15} />
                  <span className="text-sm">{t('orders.cannotEdit')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="agent" />
    </MobileShell>
  );
};