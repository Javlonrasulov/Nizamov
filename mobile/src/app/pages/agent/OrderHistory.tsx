import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Package, Warehouse, ChevronLeft, ChevronRight, ShoppingBag, X, Calendar, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { StatusBadge } from '../../components/StatusBadge';

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
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const OrderHistory = () => {
  const { t, currentUser, orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set([todayStr]));
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const cells = buildCalendar(viewYear, viewMonth);

  const myOrders = orders.filter(o => o.agentId === currentUser?.id);
  const orderDates = new Set(myOrders.map(o => o.date));

  const toggleDate = (dateStr: string) => {
    // Kelajak kunlarni tanlab bo'lmaydi
    if (dateStr > todayStr) return;
    
    if (!rangeStart) {
      // Birinchi bosish - range boshlanishi
      setRangeStart(dateStr);
      setSelectedDates(new Set([dateStr]));
    } else if (rangeStart === dateStr) {
      // Bir xil sanani yana bosganda - bekor qilish
      setRangeStart(null);
      setSelectedDates(prev => {
        const next = new Set(prev);
        if (next.size > 1) next.delete(dateStr);
        return next;
      });
    } else {
      // Ikkinchi bosish - range yaratish
      const start = rangeStart < dateStr ? rangeStart : dateStr;
      const end = rangeStart < dateStr ? dateStr : rangeStart;
      
      // Barcha kunlarni start dan end gacha tanlash
      const range = new Set<string>();
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      let current = new Date(startDate);
      while (current <= endDate) {
        const currentStr = current.toISOString().split('T')[0];
        range.add(currentStr);
        current.setDate(current.getDate() + 1);
      }
      
      setSelectedDates(range);
      setRangeStart(null); // Range yaratilgandan keyin reset
      setCalendarOpen(false); // Kalendar avtomatik yopilsin
    }
  };

  const isPastDay = (dateStr: string) => dateStr < todayStr;

  const filtered = myOrders.filter(o => {
    if (!selectedDates.has(o.date)) return false;
    if (isPastDay(o.date)) return o.status === 'delivered' || o.status === 'sent';
    return true;
  });

  // Sort by date desc
  const sortedFiltered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const handleSendToWarehouse = (orderId: string) => {
    updateOrderStatus(orderId, 'sent');
    setConfirmSendId(null);
  };

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
    amount.toLocaleString('ru-RU') + " so'm";
  const formatOrderId = (o: { id: string; orderNumber?: number }) =>
    o.orderNumber != null ? `#${o.orderNumber}` : `#${o.id.slice(-6).toUpperCase()}`;

  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };

  const selectedSorted = [...selectedDates].sort();
  const headerLabel = selectedSorted.length === 1
    ? formatDisplayDate(selectedSorted[0])
    : `${formatDisplayDate(selectedSorted[0])} — ${formatDisplayDate(selectedSorted[selectedSorted.length - 1])}`;

  // Chips uchun faqat birinchi 5 ta sanani ko'rsatish
  const visibleChips = selectedSorted.slice(0, 5);
  const hasMoreChips = selectedSorted.length > 5;

  return (
    <MobileShell>
      <MobileHeader
        title={t('orders.history')}
        showLang
        showLogout
        rightElement={
          <button
            onClick={() => navigate('/agent/orders/create')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2563EB] text-white shadow-sm"
          >
            <Plus size={16} />
          </button>
        }
      />
      <MobileContent className="pb-20">

        {/* Calendar toggle bar */}
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
            <span className="text-xs text-gray-400 dark:text-gray-500">{sortedFiltered.length} ta zakaz</span>
          </div>

          {/* Calendar panel */}
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
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:bg-gray-200"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 px-2 mb-1">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

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
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Mahsulotlar</p>
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Package size={11} className="text-[#2563EB] dark:text-blue-400" />
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

                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 mt-1">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Jami summa</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'new' && (
                      <button
                        onClick={() => navigate(`/agent/orders/${order.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2563EB] bg-blue-50 dark:bg-blue-900/20 text-[#2563EB] dark:text-blue-400 text-xs font-semibold active:scale-[0.97] transition-all"
                      >
                        <Edit2 size={13} />
                        Tahrirlash
                      </button>
                    )}
                    {order.status === 'new' && (
                    confirmSendId === order.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmSendId(null)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 font-medium"
                        >
                          Yo'q
                        </button>
                        <button
                          onClick={() => handleSendToWarehouse(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium shadow-sm"
                        >
                          Ha, yuborish
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmSendId(order.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-sm shadow-orange-200 active:scale-[0.97] transition-all"
                      >
                        <Warehouse size={13} />
                        {t('orders.sendToWarehouse')}
                      </button>
                    )
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={24} className="text-gray-300 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orders.noOrdersForDay')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{headerLabel.replace('📅 ', '')}</p>
              <button
                onClick={() => navigate('/agent/orders/create')}
                className="mt-4 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium mx-auto shadow-md shadow-blue-100"
              >
                <Plus size={15} />
                Yangi zakaz yaratish
              </button>
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="agent" />
    </MobileShell>
  );
};