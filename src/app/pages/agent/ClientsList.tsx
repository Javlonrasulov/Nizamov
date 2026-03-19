import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Plus, Phone, MapPin, ChevronRight,
  X, ChevronLeft, Package, ShoppingBag, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { formatCurrency } from '../../data/mockData';

const DAYS_SHORT: Record<string, string> = {
  du: 'Du', se: 'Se', ch: 'Ch', pa: 'Pa', ju: 'Ju', sh: 'Sh'
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  tayyorlanmagan: 'bg-amber-100 text-amber-700',
  yuborilgan: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'Yangi',
  tayyorlanmagan: 'Tayyorlanmagan',
  yuborilgan: 'Yuborilgan',
  accepted: 'Qabul qilindi',
  sent: 'Omborga yuborildi',
  delivering: 'Yetkazilmoqda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];
const WEEK_DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(ymd: string) {
  const [, m, d] = ymd.split('-');
  return `${d}-${MONTH_NAMES[parseInt(m) - 1]}`;
}

// Ikkita sanani tartiblaydi: [kichik, katta]
function sortRange(a: string | null, b: string | null): [string | null, string | null] {
  if (!a || !b) return [a, b];
  return a <= b ? [a, b] : [b, a];
}

// Sana oralig'idagi barcha YMD larni qaytaradi
function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ── Range Calendar ─────────────────────────────────────────────────
function RangeCalendar({
  rangeStart,
  rangeEnd,
  hoverDate,
  onDateClick,
  onDateHover,
  onMouseLeave,
  onToday,
  onClear,
  highlightedDates,
}: {
  rangeStart: string | null;
  rangeEnd: string | null;
  hoverDate: string | null;
  onDateClick: (d: string) => void;
  onDateHover: (d: string | null) => void;
  onMouseLeave: () => void;
  onToday: () => void;
  onClear: () => void;
  highlightedDates: Set<string>;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1);
  // Mon=0 ... Sun=6
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const todayYmd = toYMD(today);

  // Preview range (hover)
  const previewEnd = rangeStart && !rangeEnd ? (hoverDate || null) : null;
  const [displayStart, displayEnd] = sortRange(
    rangeStart,
    rangeEnd ?? previewEnd
  );

  return (
    <div
      className="select-none"
      onClick={e => e.stopPropagation()}
      onMouseLeave={onMouseLeave}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells before first day */}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          // column in the week row (0=Mon, 6=Sun)
          const col = (startDow + day - 1) % 7;

          const isStart = ymd === displayStart;
          const isEnd = ymd === displayEnd;
          const isSelected = isStart || isEnd;
          const isInRange = !!(displayStart && displayEnd && ymd > displayStart && ymd < displayEnd);
          const isToday = ymd === todayYmd;
          const hasOrder = highlightedDates.has(ymd);
          const isSingleDay = displayStart === displayEnd && isSelected;

          // Band left/right halves
          const showLeftBand = (isInRange || isEnd) && col !== 0 && !isSingleDay;
          const showRightBand = (isInRange || isStart) && col !== 6 && !isSingleDay && displayEnd !== null;

          return (
            <div key={ymd} className="relative h-10 flex items-center justify-center">
              {/* Left band half */}
              {showLeftBand && (
                <div className="absolute left-0 right-1/2 top-1 bottom-1 bg-indigo-100" />
              )}
              {/* Right band half */}
              {showRightBand && (
                <div className="absolute left-1/2 right-0 top-1 bottom-1 bg-indigo-100" />
              )}
              {/* Middle band (for in-range days) */}
              {isInRange && (
                <div className="absolute inset-x-0 top-1 bottom-1 bg-indigo-100" />
              )}

              {/* Day button */}
              <button
                onClick={() => onDateClick(ymd)}
                onMouseEnter={() => onDateHover(ymd)}
                className={`
                  relative z-10 w-9 h-9 rounded-full flex flex-col items-center justify-center text-[13px] font-medium transition-all
                  ${isSelected
                    ? 'bg-indigo-500 text-white shadow-md'
                    : isInRange
                    ? 'text-indigo-700 hover:bg-indigo-200'
                    : isToday
                    ? 'border-2 border-indigo-400 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {day}
                {hasOrder && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                )}
                {hasOrder && isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={onToday}
          className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium px-1"
        >
          Bugun
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-full px-3 py-1 hover:border-red-200"
        >
          <X size={12} />
          Tozalash
        </button>
      </div>
    </div>
  );
}

// ── Client Orders Modal ────────────────────────────────────────────
function ClientOrdersModal({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const { clients, orders } = useApp();
  const client = clients.find(c => c.id === clientId);
  const today = toYMD(new Date());

  useEffect(() => {
    if (clientId && !client) onClose();
  }, [clientId, client, onClose]);

  if (!client) return null;

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(today);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const clientOrders = orders.filter(o => o.clientId === clientId);
  const orderDates = useMemo(() => new Set(clientOrders.map(o => o.date)), [clientOrders]);

  const handleDateClick = (ymd: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Yangi tanlash boshlash
      setRangeStart(ymd);
      setRangeEnd(null);
    } else {
      // Ikkinchi kun tanlash → oraliq yakunlash
      if (ymd === rangeStart) {
        // Bir xil kunga bosish — bitta kun
        setRangeEnd(null);
      } else {
        setRangeEnd(ymd);
      }
      setHoverDate(null);
    }
  };

  const handleToday = () => {
    setRangeStart(today);
    setRangeEnd(null);
    setHoverDate(null);
  };

  const handleClear = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setHoverDate(null);
  };

  // Filtrlash uchun sana oraliqni hisoblash
  const [sortedStart, sortedEnd] = sortRange(rangeStart, rangeEnd);

  const filteredOrders = useMemo(() => {
    if (!sortedStart) return [];
    return clientOrders
      .filter(o => {
        if (!sortedEnd) return o.date === sortedStart;
        return o.date >= sortedStart && o.date <= sortedEnd;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [clientOrders, sortedStart, sortedEnd]);

  const totalSelected = filteredOrders.reduce((s, o) => s + o.total, 0);
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Range label
  const rangeLabel = useMemo(() => {
    if (!sortedStart) return 'Kun tanlang';
    if (!sortedEnd || sortedStart === sortedEnd) return formatDateLabel(sortedStart);
    const days = getDatesInRange(sortedStart, sortedEnd).length;
    return `${formatDateLabel(sortedStart)} — ${formatDateLabel(sortedEnd)} (${days} kun)`;
  }, [sortedStart, sortedEnd]);

  return (
    <div className="fixed inset-0 z-[9000] bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl flex flex-col overflow-hidden"
        style={{ height: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
              {getInitials(client.name)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
              <p className="text-xs text-gray-500">{client.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          onClick={() => setCalendarOpen(false)}
        >
          {/* ── Calendar toggle ── */}
          <div className="px-4 pt-3 pb-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setCalendarOpen(v => !v)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">
                  {rangeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{orderDates.size} kun</span>
                {calendarOpen
                  ? <ChevronUp size={15} className="text-gray-400" />
                  : <ChevronDown size={15} className="text-gray-400" />}
              </div>
            </button>
          </div>

          {/* ── Calendar panel ── */}
          {calendarOpen && (
            <div className="px-4 pt-3 pb-2" onClick={e => e.stopPropagation()}>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                {!rangeStart || !rangeEnd ? (
                  <p className="text-xs text-center text-gray-400 mb-2">
                    {!rangeStart ? 'Birinchi kunni tanlang' : 'Oxirgi kunni tanlang'}
                  </p>
                ) : null}
                <RangeCalendar
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={d => { if (rangeStart && !rangeEnd) setHoverDate(d); }}
                  onMouseLeave={() => setHoverDate(null)}
                  onToday={handleToday}
                  onClear={handleClear}
                  highlightedDates={orderDates}
                />
              </div>
            </div>
          )}

          <div className="h-px bg-gray-100 mx-4 mt-3" />

          {/* ── Orders list ── */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Zakazlar</span>
                {filteredOrders.length > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {filteredOrders.length} ta
                  </span>
                )}
              </div>
              {filteredOrders.length > 0 && (
                <span className="text-xs font-semibold text-green-600">{formatCurrency(totalSelected)}</span>
              )}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Package size={22} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  {!sortedStart ? 'Kunni tanlang' : 'Tanlangan oraliqda zakaz yo\'q'}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {orderDates.size > 0 ? 'Nuqtali kunlarni tanlang' : 'Hali hech qanday zakaz yaratilmagan'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">{order.id}</span>
                        <span className="text-[10px] text-gray-400">{formatDateLabel(order.date)}</span>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate max-w-[170px]">{item.productName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-gray-400">×{item.quantity}</span>
                            <span className="text-xs font-medium text-gray-700">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Jami</span>
                      <span className="text-sm font-semibold text-indigo-600">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ClientsList ───────────────────────────────────────────────
export const ClientsList = () => {
  const { t, currentUser, clients } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const myClients = clients.filter(c => c.agentId === currentUser?.id);
  const filtered = myClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700'];

  return (
    <MobileShell>
      <MobileHeader title={t('clients.title')} showLang />
      <MobileContent className="pb-20">
        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('clients.search')}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Count + Add */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{filtered.length} ta klient</p>
            <button
              onClick={() => navigate('/agent/clients/add')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors"
            >
              <Plus size={13} />
              {t('clients.add')}
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.map((client, idx) => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 active:bg-gray-50 transition-colors"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${colors[idx % colors.length]}`}>
                  {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{client.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{client.phone}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{client.address}</p>
                  </div>
                  {client.visitDays && client.visitDays.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {client.visitDays.map(d => (
                        <span key={d} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                          {DAYS_SHORT[d]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">{t('clients.empty')}</p>
              </div>
            )}
          </div>
        </div>
      </MobileContent>

      <MobileNav role="agent" />

      {selectedClientId && (
        <ClientOrdersModal
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </MobileShell>
  );
};
