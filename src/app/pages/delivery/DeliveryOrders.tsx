import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  MapPin, Phone, ChevronRight, Package, Calendar,
  X, ChevronLeft, ChevronDown, Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';

/* ─── Kalendar yordamchi funksiyalar ─── */
const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];
const DAY_NAMES = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

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
  const { t, currentUser, orders } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  /* Kalendar holatlari */
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set([todayStr]));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const cells = buildCalendar(viewYear, viewMonth);

  /* Mening zakazlarim — barcha statuslar */
  const myOrders = orders.filter(o => o.deliveryId === currentUser?.id);
  const orderDates = new Set(myOrders.map(o => o.date));

  /* Tanlangan kunlar bo'yicha filtrlash */
  const filtered = myOrders.filter(o => selectedDates.has(o.date));
  const sortedFiltered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

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
    ? 'Kun tanlang'
    : selectedSorted.length === 1
    ? formatDisplay(selectedSorted[0])
    : `${formatDisplay(selectedSorted[0])} — ${formatDisplay(selectedSorted[selectedSorted.length - 1])}`;

  const formatCurrency = (n: number) => n.toLocaleString('ru-RU') + " so'm";

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
              <p className="text-purple-200 text-xs">Faol</p>
            </div>
            <div className="w-px h-8 bg-purple-400/50" />
            <div className="text-center">
              <p className="text-2xl font-bold">{todayDelivered}</p>
              <p className="text-purple-200 text-xs">Yetkazildi</p>
            </div>
            <div className="w-px h-8 bg-purple-400/50" />
            <div className="text-center">
              <p className="text-2xl font-bold">{todayAll.length}</p>
              <p className="text-purple-200 text-xs">Jami bugun</p>
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
            <span className="text-xs text-gray-400 dark:text-gray-500">{sortedFiltered.length} ta zakaz</span>
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
                  {MONTH_NAMES[viewMonth]} {viewYear}
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
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {d}
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
                  Bugun
                </button>
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white active:scale-95 transition-all"
                >
                  <X size={14} />
                  Tozalash
                </button>
              </div>
            </>
          )}
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
                    <button
                      onClick={() => navigate(`/delivery/${order.id}`)}
                      className="flex items-center gap-1 group"
                    >
                      <span className="font-bold text-purple-600 dark:text-purple-400 text-base group-active:underline">
                        {order.clientName}
                      </span>
                      <ChevronRight size={15} className="text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    </button>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-lg">
                        {order.id}
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
                    Mahsulotlar
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
                        <span className="text-xs text-gray-400 dark:text-gray-500">{item.quantity} ta</span>
                        <span className="text-gray-300 dark:text-gray-600">×</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {item.price.toLocaleString('ru-RU')} so'm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Jami + Xarita tugmasi */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Jami summa</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/delivery/${order.id}/map`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-sm shadow-purple-200 active:scale-[0.97] transition-all"
                  >
                    <MapPin size={12} />
                    Xarita
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
                Bu kun uchun zakazlar yo'q
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{headerLabel}</p>
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="delivery" />
    </MobileShell>
  );
};