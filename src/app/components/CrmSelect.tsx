import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

export type CrmSelectOption = { value: string; label: string; disabled?: boolean };

interface CrmSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: CrmSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}

export const CrmSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  searchable,
  searchPlaceholder = 'Qidiruv...',
  emptyText = 'Topilmadi',
}: CrmSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    if (!searchable) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, searchable]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled} open={open} onOpenChange={setOpen}>
      <Select.Trigger
        className={clsx(
          'w-full inline-flex items-center justify-between gap-2',
          'px-4 py-2.5 rounded-2xl text-sm font-medium',
          'border border-slate-200 bg-white text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.03)]',
          'hover:border-slate-400 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-[0.5px]',
          'focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0',
          'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_1px_0_rgba(0,0,0,0.18)]',
          'dark:hover:border-slate-300 dark:hover:shadow-[0_14px_34px_rgba(0,0,0,0.32)]',
          className,
        )}
        aria-label={placeholder}
      >
        <Select.Value placeholder={<span className="text-slate-400">{placeholder}</span>} />
        <Select.Icon className="text-slate-500 dark:text-slate-300">
          <ChevronDown size={18} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className={clsx(
            'z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl',
            'dark:border-slate-700 dark:bg-slate-900',
          )}
        >
          {searchable && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // prevent Radix typeahead from stealing input
                  e.stopPropagation();
                }}
                placeholder={searchPlaceholder}
                className={clsx(
                  'w-full px-3 py-2 rounded-xl text-sm',
                  'border border-slate-200 bg-white text-slate-900',
                  'focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600',
                  'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100',
                )}
              />
            </div>
          )}
          <Select.ScrollUpButton className="flex items-center justify-center h-8 bg-white dark:bg-slate-900 text-slate-500">
            <ChevronUp size={16} />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-2 max-h-[280px]">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{emptyText}</div>
            ) : (
              filtered.map(opt => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={clsx(
                    'relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                    'text-slate-700 dark:text-slate-200',
                    'select-none outline-none',
                    'data-[highlighted]:bg-blue-600 data-[highlighted]:text-white',
                    'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
                  )}
                >
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center justify-center text-current">
                    <Check size={14} />
                  </Select.ItemIndicator>
                  <Select.ItemText>
                    <span className="pl-5">{opt.label}</span>
                  </Select.ItemText>
                </Select.Item>
              ))
            )}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-8 bg-white dark:bg-slate-900 text-slate-500">
            <ChevronDown size={16} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

