import { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function isoToDate(iso: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplay(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0=Sun ... adjust to Mon=0
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

interface CalendarPopupProps {
  selecting: 'from' | 'to';
  dateFrom: string;
  dateTo: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
}

function CalendarPopup({ selecting, dateFrom, dateTo, onSelect, onClose }: CalendarPopupProps) {
  const { theme, t } = useApp();
  const today = dateToIso(new Date());

  const initDate = selecting === 'from'
    ? (dateFrom ? isoToDate(dateFrom)! : new Date())
    : (dateTo ? isoToDate(dateTo)! : new Date());

  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [hovered, setHovered] = useState('');

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const getIso = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isFrom = (iso: string) => iso === dateFrom;
  const isTo = (iso: string) => iso === dateTo;
  const isToday = (iso: string) => iso === today;

  const inRange = (iso: string) => {
    if (!dateFrom || !dateTo) return false;
    return iso > dateFrom && iso < dateTo;
  };

  const inHoverRange = (iso: string) => {
    if (!hovered) return false;
    if (selecting === 'from' && dateTo) return iso > hovered && iso < dateTo;
    if (selecting === 'to' && dateFrom) return iso > dateFrom && iso < hovered;
    return false;
  };

  const isRangeStart = (iso: string) => isFrom(iso) && !!dateTo;
  const isRangeEnd = (iso: string) => isTo(iso) && !!dateFrom;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-72">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {MONTHS_UZ[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const iso = getIso(day);
          const isStart = isFrom(iso);
          const isEnd = isTo(iso);
          const inR = inRange(iso) || inHoverRange(iso);
          const isTod = isToday(iso);
          const isSelected = isStart || isEnd;

          return (
            <button
              key={idx}
              onClick={() => onSelect(iso)}
              onMouseEnter={() => setHovered(iso)}
              onMouseLeave={() => setHovered('')}
              className={`
                relative h-8 text-xs font-medium transition-all
                ${inR ? 'bg-blue-50 dark:bg-blue-900/25' : ''}
                ${isRangeStart(iso) ? 'rounded-l-full' : ''}
                ${isRangeEnd(iso) ? 'rounded-r-full' : ''}
                ${!isRangeStart(iso) && !isRangeEnd(iso) && !inR ? 'rounded-full' : ''}
              `}
            >
              <span className={`
                w-7 h-7 flex items-center justify-center mx-auto rounded-full text-xs
                ${isSelected ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-200' : ''}
                ${!isSelected && isTod ? 'border-2 border-[#2563EB] text-[#2563EB]' : ''}
                ${!isSelected && !isTod ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
              `}>
                {day}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
        {selecting === 'from'
          ? `📅 ${t('admin.dateFilter.pickStart')}`
          : `📅 ${t('admin.dateFilter.pickEnd')}`}
      </div>
    </div>
  );
}

export const AdminDateFilter = () => {
  const { adminDateFrom, adminDateTo, setAdminDateRange, theme, t } = useApp();
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [tempFrom, setTempFrom] = useState(adminDateFrom);
  const [tempTo, setTempTo] = useState(adminDateTo);
  const ref = useRef<HTMLDivElement>(null);

  // Sync with context
  useEffect(() => {
    setTempFrom(adminDateFrom);
    setTempTo(adminDateTo);
  }, [adminDateFrom, adminDateTo]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const today = dateToIso(new Date());

  const handleSelect = (iso: string) => {
    if (selecting === 'from') {
      setTempFrom(iso);
      if (tempTo && iso > tempTo) setTempTo('');
      setSelecting('to');
    } else {
      if (iso < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(iso);
      } else {
        setTempTo(iso);
      }
      setAdminDateRange(tempFrom, iso < tempFrom ? tempFrom : iso);
      setOpen(false);
    }
  };

  const handleApply = () => {
    setAdminDateRange(tempFrom, tempTo || tempFrom);
    setOpen(false);
  };

  const handleQuick = (from: string, to: string) => {
    setTempFrom(from);
    setTempTo(to);
    setAdminDateRange(from, to);
    setOpen(false);
  };

  const handleClear = () => {
    setTempFrom('');
    setTempTo('');
    setAdminDateRange('', '');
    setOpen(false);
  };

  const getThisWeekRange = () => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    const from = new Date(now);
    from.setDate(now.getDate() - day);
    return { from: dateToIso(from), to: today };
  };

  const getThisMonthRange = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: dateToIso(from), to: today };
  };

  const hasFilter = adminDateFrom || adminDateTo;
  const displayLabel = hasFilter
    ? adminDateFrom === adminDateTo
      ? formatDisplay(adminDateFrom)
      : `${formatDisplay(adminDateFrom)} — ${formatDisplay(adminDateTo)}`
    : null;

  const week = getThisWeekRange();
  const month = getThisMonthRange();

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {/* Trigger button */}
      <button
        onClick={() => { setSelecting('from'); setOpen(o => !o); }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
          hasFilter
            ? 'bg-blue-50 dark:bg-blue-900/30 border-[#2563EB] dark:border-blue-500 text-[#2563EB] dark:text-blue-400'
            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
      >
        <CalendarDays size={15} />
        <span>{displayLabel || t('admin.dateFilter.label')}</span>
      </button>

      {/* Clear button */}
      {hasFilter && (
        <button
          onClick={handleClear}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          title={t('admin.dateFilter.clear')}
        >
          <X size={13} />
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-10 left-0 z-[9999] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-[340px]">
          {/* Quick filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => handleQuick(today, today)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                adminDateFrom === today && adminDateTo === today
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {t('admin.dateFilter.today')}
            </button>
            <button
              onClick={() => handleQuick(week.from, week.to)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                adminDateFrom === week.from && adminDateTo === week.to
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {t('admin.dateFilter.thisWeek')}
            </button>
            <button
              onClick={() => handleQuick(month.from, month.to)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                adminDateFrom === month.from && adminDateTo === month.to
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {t('admin.dateFilter.thisMonth')}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 transition-colors"
            >
              {t('admin.dateFilter.all')}
            </button>
          </div>

          {/* From / To inputs clickable */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setSelecting('from')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selecting === 'from'
                  ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-[#2563EB]'
              }`}
            >
              <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5">{t('admin.dateFilter.from')}</div>
              <div className={`text-sm font-semibold ${tempFrom ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                {tempFrom ? formatDisplay(tempFrom) : 'dd.mm.yyyy'}
              </div>
            </button>
            <button
              onClick={() => setSelecting('to')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selecting === 'to'
                  ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-[#2563EB]'
              }`}
            >
              <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5">{t('admin.dateFilter.to')}</div>
              <div className={`text-sm font-semibold ${tempTo ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                {tempTo ? formatDisplay(tempTo) : 'dd.mm.yyyy'}
              </div>
            </button>
          </div>

          {/* Calendar */}
          <CalendarPopup
            selecting={selecting}
            dateFrom={tempFrom}
            dateTo={tempTo}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
          />

          {/* Apply button */}
          {tempFrom && (
            <button
              onClick={handleApply}
              className="w-full mt-3 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              {t('admin.dateFilter.apply')} {tempFrom && tempTo && tempFrom !== tempTo
                ? `(${formatDisplay(tempFrom)} — ${formatDisplay(tempTo)})`
                : tempFrom ? `(${formatDisplay(tempFrom)})` : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Hook: filter orders by admin date range (memoized to avoid infinite loops in effects that depend on result)
export function useFilteredOrders() {
  const { orders, adminDateFrom, adminDateTo } = useApp();
  return useMemo(() => {
    if (!adminDateFrom && !adminDateTo) return orders;
    const from = adminDateFrom || '0000-00-00';
    const to = adminDateTo || '9999-99-99';
    return orders.filter(o => o.date >= from && o.date <= to);
  }, [orders, adminDateFrom, adminDateTo]);
}

// Admin faqat omborga yuborilgan zakazlarni ko'radi (status !== 'new' - ya'ni tayyorlanmagan, sent, accepted, ...)
export function useAdminVisibleOrders() {
  const filtered = useFilteredOrders();
  return useMemo(() => filtered.filter(o => o.status !== 'new'), [filtered]);
}
