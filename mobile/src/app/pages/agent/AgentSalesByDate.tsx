import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, ShoppingBag, X, Calendar, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';

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
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const AgentSalesByDate = () => {
  const { t, lang, currentUser, orders } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set([todayStr]));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const cells = buildCalendar(viewYear, viewMonth);

  const myOrders = orders.filter(o => o.agentId === currentUser?.id);
  const orderDates = new Set(myOrders.map(o => o.date));

  const toggleDate = (dateStr: string) => {
    if (dateStr > todayStr) return;
    if (!rangeStart) {
      setRangeStart(dateStr);
      setSelectedDates(new Set([dateStr]));
    } else if (rangeStart === dateStr) {
      setRangeStart(null);
      setSelectedDates(prev => {
        const next = new Set(prev);
        if (next.size > 1) next.delete(dateStr);
        return next;
      });
    } else {
      const start = rangeStart < dateStr ? rangeStart : dateStr;
      const end = rangeStart < dateStr ? dateStr : rangeStart;
      const range = new Set<string>();
      const startDate = new Date(start);
      const endDate = new Date(end);
      let current = new Date(startDate);
      while (current <= endDate) {
        range.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(range);
      setRangeStart(null);
      setCalendarOpen(false);
    }
  };

  const filtered = myOrders.filter(o => selectedDates.has(o.date));
  const sortedFiltered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const totalSum = sortedFiltered.reduce((s, o) => s + o.total, 0);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
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

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('ru-RU') + ` ${t('common.sum')}`;
  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };

  const selectedSorted = [...selectedDates].sort();
  const headerLabel = selectedSorted.length === 1
    ? formatDisplayDate(selectedSorted[0])
    : `${formatDisplayDate(selectedSorted[0])} — ${formatDisplayDate(selectedSorted[selectedSorted.length - 1])} (${selectedSorted.length} ${t('agent.sales.daysSuffix')})`;

  return (
    <MobileShell>
      <MobileHeader title={t('agent.sales.title')} showBack showLang showLogout />
      <MobileContent className="pb-20">
        {/* Calendar toggle bar — same as OrderHistory */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCalendarOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#2563EB] bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <Calendar size={14} className="text-[#2563EB]" />
              <span className="text-sm font-medium text-[#2563EB]">{headerLabel}</span>
              {selectedDates.size > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                  className="w-4 h-4 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                >
                  <X size={12} className="text-[#2563EB]" />
                </button>
              )}
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">{sortedFiltered.length} {t('orders.ordersCountSuffix')}</span>
          </div>

          {calendarOpen && (
            <>
              <div className="flex items-center justify-between px-4 pb-2 border-t border-gray-50 dark:border-gray-700 pt-2">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:bg-gray-200"
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
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:bg-gray-200"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 px-2 mb-1">
                {dayShortKeys.map(k => (
                  <div key={k} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {t(k)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 px-2 pb-3 gap-1">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const dateStr = toDateStr(viewYear, viewMonth, day);
                  const isSelected = selectedDates.has(dateStr);
                  const isToday = dateStr === todayStr;
                  const isFuture = dateStr > todayStr;
                  const hasOrders = orderDates.has(dateStr);
                  const isPast = dateStr < todayStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleDate(dateStr)}
                      disabled={isFuture}
                      className={`relative flex items-center justify-center h-10 rounded-lg transition-all ${
                        isFuture
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : isPast
                          ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium'
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {!isSelected && !isToday && hasOrders && !isFuture && (
                        <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isPast ? 'bg-gray-400' : 'bg-[#2563EB]'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

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

        {/* Total for period */}
        {sortedFiltered.length > 0 && (
          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('agent.sales.totalForPeriod')}</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSum)}</span>
            </div>
          </div>
        )}

        {/* Orders list */}
        <div
          className="p-4 space-y-3"
          onClick={() => { if (calendarOpen) setCalendarOpen(false); }}
        >
          {sortedFiltered.length > 0 ? (
            sortedFiltered.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="flex items-start justify-between px-4 pt-4 pb-2">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/agent/orders/${order.id}`)}
                      className="flex items-center gap-1 group"
                    >
                      <span className="font-bold text-[#2563EB] dark:text-blue-400 text-base group-active:underline">
                        {order.clientName}
                      </span>
                      <ChevronRight size={15} className="text-[#2563EB] dark:text-blue-400 flex-shrink-0" />
                    </button>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                        {formatOrderId(order)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{order.date}</span>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="px-4 py-2 space-y-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{t('orders.items')}</p>
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Package size={11} className="text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{item.productName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{item.quantity} {t('common.pcs')}</span>
                        <span className="text-gray-300 dark:text-gray-600">×</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {item.price.toLocaleString('ru-RU')} {t('common.sum')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 mt-1">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('orders.totalAmount')}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={24} className="text-gray-300 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('agent.sales.noSalesForPeriod')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{headerLabel}</p>
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="agent" />
    </MobileShell>
  );
};
