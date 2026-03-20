import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  MapPin, Phone, ChevronRight, Package, Calendar,
  X, ChevronLeft, ChevronDown, Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';
import { apiGetClientBalance, type ClientBalance } from '../../api/payments';
import { apiGetReturns, type ReturnRecord } from '../../api/returns';

/* ─── Kalendar yordamchi funksiyalar ─── */
const dayShortKeys = [
  'days.monday.short',
  'days.tuesday.short',
  'days.wednesday.short',
  'days.thursday.short',
  'days.friday.short',
  'days.saturday.short',
  'days.sunday.short',
] as const;

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7; // Du dan boshlash
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

/* ─── Asosiy komponent ─── */
export const DeliveryOrders = () => {
  const { t, lang, currentUser, orders } = useApp();
  const navigate = useNavigate();

  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  /* Kalendar holatlari */
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set([todayStr]));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [debtorsOnly, setDebtorsOnly] = useState(false);

  const cells = buildCalendar(viewYear, viewMonth);

  /* Mening zakazlarim — barcha statuslar */
  const myOrders = orders.filter(o => o.deliveryId === currentUser?.id);
  const orderDates = new Set(myOrders.map(o => o.date));

  /* Tanlangan kunlar bo'yicha filtrlash */
  const filtered = myOrders.filter(o => selectedDates.has(o.date));

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, ClientBalance>>({});
  const [balancesLoading, setBalancesLoading] = useState<Record<string, boolean>>({});
  const balancesRef = useRef(balances);
  const balancesLoadingRef = useRef(balancesLoading);

  const [returnsByOrderId, setReturnsByOrderId] = useState<Record<string, ReturnRecord[]>>({});
  const [returnsLoadingByOrderId, setReturnsLoadingByOrderId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    balancesRef.current = balances;
  }, [balances]);

  useEffect(() => {
    balancesLoadingRef.current = balancesLoading;
  }, [balancesLoading]);

  const sortedFiltered = [...filtered]
    .filter(o => {
      if (!debtorsOnly) return true;
      // balances hali yuklanmagan bo'lsa — filter qarz yo'q deb noto'g'ri chiqarib yubormasligi uchun ko'rsatib turamiz
      if (balances[o.clientId] == null || balancesLoading[o.clientId]) return true;
      return (balances[o.clientId]?.debt ?? 0) > 0;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const visibleClientIds = useMemo(
    () => Array.from(new Set(sortedFiltered.map(o => o.clientId).filter(Boolean))),
    [sortedFiltered],
  );
  const visibleClientIdsKey = useMemo(() => {
    const ids = Array.from(new Set(visibleClientIds)).filter(Boolean).sort();
    return ids.join('|');
  }, [visibleClientIds]);

  useEffect(() => {
    const ids = new Set<string>(visibleClientIds);
    if (selectedClientId) ids.add(selectedClientId);

    const toLoad = Array.from(ids).filter(
      id => !balancesRef.current[id] && !balancesLoadingRef.current[id],
    );
    if (toLoad.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const id of toLoad) {
        if (cancelled) return;
        setBalancesLoading(prev => ({ ...prev, [id]: true }));
        try {
          const bal = await apiGetClientBalance(id);
          if (!cancelled) setBalances(prev => ({ ...prev, [id]: bal }));
        } catch {
          // ignore
        } finally {
          if (!cancelled) setBalancesLoading(prev => ({ ...prev, [id]: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visibleClientIdsKey, selectedClientId]);

  const modalDeliveredOrders = useMemo(() => {
    if (!clientModalOpen || !selectedClientId || !currentUser?.id) return [];
    return orders
      .filter(o => o.clientId === selectedClientId && o.deliveryId === currentUser.id && o.status === 'delivered')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [clientModalOpen, selectedClientId, currentUser?.id, orders]);

  const modalDeliveredOrderIdsKey = useMemo(
    () => modalDeliveredOrders.map(o => o.id).sort().join('|'),
    [modalDeliveredOrders],
  );

  useEffect(() => {
    if (!clientModalOpen || !selectedClientId || !currentUser?.id) return;

    const ids = modalDeliveredOrders.map(o => o.id);
    setReturnsByOrderId({});
    setReturnsLoadingByOrderId({});
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      setReturnsLoadingByOrderId(Object.fromEntries(ids.map(id => [id, true])));
      try {
        const results = await Promise.all(
          ids.map(async orderId => {
            const rets = await apiGetReturns({ orderId });
            return [orderId, rets] as const;
          }),
        );
        if (cancelled) return;
        setReturnsByOrderId(() => {
          const next: Record<string, ReturnRecord[]> = {};
          results.forEach(([orderId, rets]) => { next[orderId] = rets; });
          return next;
        });
      } catch {
        // ignore
      } finally {
        if (!cancelled) setReturnsLoadingByOrderId({});
      }
    })();

    return () => { cancelled = true; };
  }, [clientModalOpen, selectedClientId, currentUser?.id, modalDeliveredOrderIdsKey]);

  /* Statistika */
  const todayAll = myOrders.filter(o => o.date === todayStr);
  const todayDelivered = todayAll.filter(o => o.status === 'delivered').length;
  const todayActive = todayAll.filter(
    o => o.status === 'yuborilgan' || o.status === 'delivering' || o.status === 'accepted'
  ).length;

  /* ── Range kalendar logikasi ── */
  const toggleDate = (dateStr: string) => {
    if (dateStr > todayStr) return;

    if (!rangeStart) {
      setRangeStart(dateStr);
      setSelectedDates(new Set([dateStr]));
    } else if (rangeStart === dateStr) {
      setRangeStart(null);
    } else {
      const start = rangeStart < dateStr ? rangeStart : dateStr;
      const end = rangeStart < dateStr ? dateStr : rangeStart;
      const range = new Set<string>();
      const cur = new Date(start);
      const endDate = new Date(end);
      while (cur <= endDate) {
        range.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(range);
      setRangeStart(null);
      setCalendarOpen(false);
    }
  };

  const selectToday = () => {
    setSelectedDates(new Set([todayStr]));
    setRangeStart(null);
  };
  const clearSelection = () => {
    setSelectedDates(new Set([todayStr]));
    setRangeStart(null);
    setCalendarOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  /* Header label */
  const selectedSorted = [...selectedDates].sort();
  const headerLabel = selectedSorted.length === 0
    ? t('orders.pickDay')
    : selectedSorted.length === 1
    ? formatDisplay(selectedSorted[0])
    : `${formatDisplay(selectedSorted[0])} — ${formatDisplay(selectedSorted[selectedSorted.length - 1])}`;

  const formatCurrency = (n: number) => `${n.toLocaleString('ru-RU')} ${t('common.sum')}`;
  const formatAmount = (n: number) => n.toLocaleString('ru-RU');

  const openClientModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientModalOpen(true);
  };

  return (
    <MobileShell>
      <MobileHeader title={t('delivery.myOrders')} showLang showLogout />
      <MobileContent className="pb-20">

        {/* ── Sarhad banner ── */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-4 py-4 text-white">
          <p className="text-purple-200 text-sm">{t('agent.dashboard.greeting')},</p>
          <p className="font-bold text-base mt-0.5">{currentUser?.name}</p>
          <div className="flex items-center gap-5 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{todayActive}</p>
              <p className="text-purple-200 text-xs">{t('delivery.stat.active')}</p>
            </div>
            <div className="w-px h-8 bg-purple-400/50" />
            <div className="text-center">
              <p className="text-2xl font-bold">{todayDelivered}</p>
              <p className="text-purple-200 text-xs">{t('delivery.delivered')}</p>
            </div>
            <div className="w-px h-8 bg-purple-400/50" />
            <div className="text-center">
              <p className="text-2xl font-bold">{todayAll.length}</p>
              <p className="text-purple-200 text-xs">{t('delivery.stat.todayTotal')}</p>
            </div>
          </div>
        </div>

        {/* ── Kalendar accordion ── */}
        <div
          className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm"
          onClick={e => e.stopPropagation()}
        >
          {/* Toggle bar */}
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCalendarOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-purple-500 bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <Calendar size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{headerLabel}</span>
              {selectedDates.size > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); clearSelection(); }}
                  onKeyDown={e => e.key === 'Enter' && clearSelection()}
                  className="w-4 h-4 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full cursor-pointer"
                >
                  <X size={12} className="text-purple-600 dark:text-purple-400" />
                </span>
              )}
              <ChevronDown
                size={14}
                className={`text-purple-500 transition-transform ${calendarOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">{sortedFiltered.length} {t('orders.ordersCountSuffix')}</span>
          </div>

          {/* Kalendar paneli */}
          {calendarOpen && (
            <>
              {/* Oy navigatsiyasi */}
              <div className="flex items-center justify-between px-4 pb-2 border-t border-gray-50 dark:border-gray-700 pt-2">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {(() => {
                    const locale = lang === 'ru' ? 'ru-RU' : (lang === 'uz_kir' ? 'uz-Cyrl-UZ' : 'uz-Latn-UZ');
                    const m = new Date(viewYear, viewMonth, 1).toLocaleString(locale, { month: 'long' });
                    const monthName = m ? m.charAt(0).toUpperCase() + m.slice(1) : '';
                    return `${monthName} ${viewYear}`;
                  })()}
                </span>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Kun nomlari */}
              <div className="grid grid-cols-7 px-2 mb-1">
                {dayShortKeys.map(k => (
                  <div key={k} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {t(k)}
                  </div>
                ))}
              </div>

              {/* Kalendar katakchalar */}
              <div className="grid grid-cols-7 px-2 pb-3 gap-1">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const dateStr = toDateStr(viewYear, viewMonth, day);
                  const isSelected = selectedDates.has(dateStr);
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;
                  const isFuture = dateStr > todayStr;
                  const hasOrders = orderDates.has(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleDate(dateStr)}
                      disabled={isFuture}
                      className={`relative flex items-center justify-center h-10 rounded-lg transition-all ${
                        isFuture
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold'
                          : isToday
                          ? 'bg-purple-600 text-white font-bold'
                          : isPast
                          ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium'
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {!isSelected && !isToday && hasOrders && !isFuture && (
                        <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                          isPast ? 'bg-gray-400' : 'bg-purple-500'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bugun / Tozalash */}
              <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                <button
                  onClick={selectToday}
                  className="text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white active:scale-95 transition-all"
                >
                  {t('orders.today')}
                </button>
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white active:scale-95 transition-all"
                >
                  <X size={14} />
                  {t('orders.clear')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Qarzdorlar filtri ─────────────────────────────── */}
        <div className="px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={() => setDebtorsOnly(v => !v)}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border transition-colors ${
              debtorsOnly
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
              <span className="flex items-center gap-2 text-sm font-medium">
              <span className={`w-2 h-2 rounded-full ${debtorsOnly ? 'bg-red-500' : 'bg-gray-300'}`} />
              {t('delivery.debtorsOnlyFilter')}
            </span>
            <span className={`text-xs font-semibold ${debtorsOnly ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {debtorsOnly ? t('delivery.debtorsOnlyFilter.on') : t('delivery.debtorsOnlyFilter.off')}
            </span>
          </button>
        </div>

        {/* ── Zakazlar ro'yxati ── */}
        <div
          className="p-4 space-y-3"
          onClick={() => { if (calendarOpen) setCalendarOpen(false); }}
        >
          {sortedFiltered.length > 0 ? (
            sortedFiltered.map(order => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-start justify-between px-4 pt-4 pb-2">
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 group">
                        <button
                          type="button"
                          onClick={() => openClientModal(order.clientId)}
                          className="flex items-center gap-1 min-w-0"
                        >
                          <span className="font-bold text-purple-600 dark:text-purple-400 text-base truncate group-active:underline">
                            {order.clientName}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/delivery/${order.id}`)}
                          className="p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          title={t('orders.history')}
                        >
                          <ChevronRight size={15} className="text-purple-500 dark:text-purple-400 flex-shrink-0" />
                        </button>
                      </div>
                      {/* Client qarzi badge */}
                      <div className="mt-1">
                        {balancesLoading[order.clientId] ? (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg">
                            ...
                          </span>
                        ) : ((balances[order.clientId]?.debt ?? 0) > 0) ? (
                          <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 px-2 py-0.5 rounded-lg font-semibold">
                            {t('payments.badge.debt')}: {formatAmount(balances[order.clientId]?.debt ?? 0)} {t('common.sum')}
                          </span>
                        ) : null}
                      </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                        {formatOrderId(order)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{order.date}</span>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Manzil va telefon */}
                <div className="px-4 pb-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={11} className="text-purple-400 flex-shrink-0" />
                    <span className="truncate">{order.clientAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={11} className="text-purple-400 flex-shrink-0" />
                    <span>{order.clientPhone}</span>
                  </div>
                </div>

                {/* Mahsulotlar */}
                <div className="px-4 py-2 space-y-1.5 border-t border-gray-50 dark:border-gray-700">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                    {t('orders.items')}
                  </p>
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Package size={11} className="text-purple-500 dark:text-purple-400" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{item.productName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{item.quantity} {t('common.pcs')}</span>
                        <span className="text-gray-300 dark:text-gray-600">×</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Jami + Xarita tugmasi */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('orders.totalAmount')}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/delivery/${order.id}/map`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-sm shadow-purple-200 active:scale-[0.97] transition-all"
                  >
                    <MapPin size={12} />
                    {t('common.map')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Bo'sh holat */
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                <Truck size={28} className="text-purple-300 dark:text-purple-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {t('orders.noOrdersForDay')}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{headerLabel}</p>
            </div>
          )}
        </div>

        {/* ── Client modal (debt + history) ───────────────────────── */}
        {clientModalOpen && selectedClientId && (
          <div
            className="fixed inset-0 z-[9000] bg-black/50 flex items-end justify-center"
            onClick={() => setClientModalOpen(false)}
          >
            <div
              className="w-full max-w-[430px] bg-white rounded-t-3xl flex flex-col overflow-hidden"
              style={{ height: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {orders.find(o => o.clientId === selectedClientId)?.clientName || '...'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {orders.find(o => o.clientId === selectedClientId)?.clientPhone || ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setClientModalOpen(false)}
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{t('payments.clientDebt')}</p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      (balances[selectedClientId]?.debt ?? 0) > 0
                        ? 'text-red-600 dark:text-red-300'
                        : 'text-green-600 dark:text-green-300'
                    }`}
                  >
                    {balancesLoading[selectedClientId] ? '...' : `${formatAmount(balances[selectedClientId]?.debt ?? 0)} ${t('common.sum')}`}
                  </p>
                </div>

                {/* Delivered orders + items */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {t('orders.items')}
                  </p>
                  <div className="space-y-2">
                    {orders
                      .filter(o => o.clientId === selectedClientId && o.deliveryId === currentUser?.id && o.status === 'delivered')
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(o => (
                        <div key={o.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                {formatOrderId(o)}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">{o.date}</p>
                            </div>
                            {(() => {
                              const perOrder = balances[selectedClientId]?.perOrder?.find(r => r.orderId === o.id);
                              const adjustedTotal = perOrder?.total ?? o.total;
                              const paid = perOrder?.paid ?? 0;
                              const debt = perOrder?.debt ?? 0;
                              return (
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    {adjustedTotal.toLocaleString('ru-RU')} {t('common.sum')}
                                  </p>
                                  {o.total !== adjustedTotal && (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-through">
                                      {o.total.toLocaleString('ru-RU')} {t('common.sum')}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {lang === 'ru' ? 'Оплачено' : 'To\'landi'}: {paid.toLocaleString('ru-RU')} {t('common.sum')}
                                  </p>
                                  <p className={`text-[10px] mt-0.5 ${debt > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}>
                                    {lang === 'ru' ? 'Долг' : 'Qarz'}: {debt.toLocaleString('ru-RU')} {t('common.sum')}
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                          {(() => {
                            const rets = returnsByOrderId[o.id] ?? [];
                            const pendingByProduct = new Map<string, number>();
                            const acceptedByProduct = new Map<string, number>();
                            for (const r of rets) {
                              for (const it of r.items || []) {
                                if (r.status === 'pending') {
                                  pendingByProduct.set(it.productId, (pendingByProduct.get(it.productId) || 0) + (it.quantity || 0));
                                } else {
                                  acceptedByProduct.set(it.productId, (acceptedByProduct.get(it.productId) || 0) + (it.quantity || 0));
                                }
                              }
                            }

                            const returnedAmountTotal = rets.reduce((sum, r) => (
                              sum + (r.items || []).reduce((s, it) => {
                                const price = o.items.find(x => x.productId === it.productId)?.price ?? 0;
                                return s + (it.quantity || 0) * price;
                              }, 0)
                            ), 0);

                            const returnedQtyTotal = rets.reduce((sum, r) => (
                              sum + (r.items || []).reduce((s, it) => s + (it.quantity || 0), 0)
                            ), 0);

                            const adjustedTotal = balances[selectedClientId]?.perOrder?.find(r => r.orderId === o.id)?.total ?? o.total;

                            return (
                              <>
                                {returnsLoadingByOrderId[o.id] ? (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{lang === 'ru' ? 'Загрузка возвратов...' : 'Vozvratlar yuklanmoqda...'}</p>
                                ) : returnedQtyTotal > 0 ? (
                                  <div className="mb-2 text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                                    <p>
                                      {lang === 'ru' ? 'Возврат' : 'Qaytarildi'}: <span className="font-semibold text-amber-700 dark:text-amber-300">{returnedAmountTotal.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                      {' · '}
                                      <span className="font-semibold">{returnedQtyTotal} {t('common.pcs')}</span>
                                    </p>
                                    <p>
                                      {lang === 'ru' ? 'К получению' : 'Qolgan'}: <span className="font-semibold text-red-600 dark:text-red-300">{adjustedTotal.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                    </p>
                                  </div>
                                ) : null}

                                <div className="space-y-1.5">
                                  {o.items.map(it => {
                                    const pendingQty = pendingByProduct.get(it.productId) || 0;
                                    const acceptedQty = acceptedByProduct.get(it.productId) || 0;
                                    const returnedQty = pendingQty + acceptedQty;
                                    const leftQty = Math.max(0, it.quantity - returnedQty);
                                    return (
                                      <div key={it.productId} className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-gray-700 dark:text-gray-200 truncate">{it.productName}</span>
                                        <div className="text-right">
                                          <div className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
                                            {it.quantity} {t('common.pcs')}
                                          </div>
                                          {returnedQty > 0 && (
                                            <div className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">
                                              {lang === 'ru' ? 'Верн.' : 'Qayt.'}: {returnedQty} {t('common.pcs')}
                                            </div>
                                          )}
                                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            {lang === 'ru' ? 'Ост.' : 'Qold.'}: {leftQty} {t('common.pcs')}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Payments */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {t('payments.history')}
                  </p>
                  <div className="space-y-2">
                    {(balances[selectedClientId]?.payments ?? []).map(p => (
                      <div key={p.id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                              {p.date}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {t(`payments.method.${p.method}` as any)}
                              {p.collectedBy?.name ? ` · ${p.collectedBy.name}` : ''}
                            </p>
                          </div>
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            {formatAmount(p.amount)} {t('common.sum')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!balancesLoading[selectedClientId] && (balances[selectedClientId]?.payments ?? []).length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                        {t('clients.calendar.noOrdersHint')}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </MobileContent>
      <MobileNav role="delivery" />
    </MobileShell>
  );
};