import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Check, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { formatDisplay } from './AdminDateFilter';
import { useApp } from '../context/AppContext';
import {
  apiAcceptPaymentByAdmin,
  apiAcceptPaymentsByAdmin,
  apiAcceptPaymentsBySklad,
  apiAcceptPaymentBySklad,
  apiGetAdminHandoverQueue,
  apiGetCashboxSummary,
  apiGetCollectorHandoverSummary,
  apiGetSkladHandoverQueue,
  CashboxSummary,
  CollectorHandoverSummaryRow,
  Payment,
} from '../api/payments';

type Mode = 'sklad' | 'admin';

function formatOrderLabel(payment: Payment) {
  if (payment.order?.orderNumber != null) return `#${payment.order.orderNumber}`;
  if (payment.order?.id) return `#${payment.order.id.slice(-6).toUpperCase()}`;
  return '—';
}

export function CashHandoverBoard({ mode }: { mode: Mode }) {
  const { t, currentUser, adminDateFrom, adminDateTo, refetchData } = useApp();
  const [rows, setRows] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<CashboxSummary>({
    pendingSkladTotal: 0,
    skladCashTotal: 0,
    adminCashTotal: 0,
  });
  const [collectorSummary, setCollectorSummary] = useState<CollectorHandoverSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptingAll, setAcceptingAll] = useState(false);
  const [acceptAllModalOpen, setAcceptAllModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        dateFrom: adminDateFrom || undefined,
        dateTo: adminDateTo || undefined,
      };
      const [queue, nextSummary, nextCollectorSummary] = await Promise.all([
        mode === 'sklad' ? apiGetSkladHandoverQueue(params) : apiGetAdminHandoverQueue(params),
        apiGetCashboxSummary(),
        apiGetCollectorHandoverSummary({ mode, ...params }),
      ]);
      setRows(queue);
      setSummary(nextSummary);
      setCollectorSummary(nextCollectorSummary);
    } finally {
      setLoading(false);
    }
  }, [adminDateFrom, adminDateTo, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const queueTotal = useMemo(
    () => rows.reduce((sum, row) => sum + (row.amount || 0), 0),
    [rows],
  );

  const handleAccept = async (paymentId: string) => {
    if (!currentUser?.id) return;
    setAcceptingId(paymentId);
    try {
      if (mode === 'sklad') {
        await apiAcceptPaymentBySklad(paymentId, currentUser.id);
      } else {
        await apiAcceptPaymentByAdmin(paymentId, currentUser.id);
      }
      await Promise.all([load(), refetchData?.() ?? Promise.resolve()]);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleAcceptAll = async () => {
    if (!currentUser?.id || rows.length === 0) return;
    setAcceptingAll(true);
    try {
      const ids = rows.map(row => row.id);
      if (mode === 'sklad') {
        await apiAcceptPaymentsBySklad(ids, currentUser.id);
      } else {
        await apiAcceptPaymentsByAdmin(ids, currentUser.id);
      }
      await Promise.all([load(), refetchData?.() ?? Promise.resolve()]);
    } finally {
      setAcceptingAll(false);
    }
  };

  const openAcceptAllModal = () => {
    if (loading || acceptingAll || rows.length === 0) return;
    setAcceptAllModalOpen(true);
  };

  const closeAcceptAllModal = () => {
    if (acceptingAll) return;
    setAcceptAllModalOpen(false);
  };

  const confirmAcceptAll = async () => {
    await handleAcceptAll();
    setAcceptAllModalOpen(false);
  };

  const title = mode === 'sklad' ? t('admin.skladCashPage') : t('admin.adminCashPage');
  const subtitle = mode === 'sklad'
    ? t('cashHandover.sklad.subtitle')
    : t('cashHandover.admin.subtitle');
  const acceptLabel = mode === 'sklad' ? t('cashHandover.accept.sklad') : t('cashHandover.accept.admin');
  const emptyLabel = mode === 'sklad'
    ? t('cashHandover.empty.sklad')
    : t('cashHandover.empty.admin');
  const acceptAllLabel = mode === 'sklad' ? t('cashHandover.acceptAll.sklad') : t('cashHandover.acceptAll.admin');
  const acceptAllModalTitle = mode === 'sklad'
    ? t('cashHandover.confirmAll.title.sklad')
    : t('cashHandover.confirmAll.title.admin');
  const acceptAllModalText = mode === 'sklad'
    ? t('cashHandover.confirmAll.text.sklad')
    : t('cashHandover.confirmAll.text.admin');

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed break-words">{subtitle}</p>
          </div>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
            <button
              onClick={openAcceptAllModal}
              disabled={loading || acceptingAll || rows.length === 0}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Check size={15} />
              {acceptingAll ? '...' : acceptAllLabel}
            </button>
            <button
              onClick={() => void load()}
              disabled={loading || acceptingAll}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${mode === 'sklad' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="pr-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide break-words">{t('cashHandover.summary.queue')}</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{queueTotal.toLocaleString()} {t('common.sum')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{rows.length} {t('cashHandover.summary.transfers')}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="pr-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide break-words">{t('cashHandover.summary.skladCash')}</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{summary.skladCashTotal.toLocaleString()} {t('common.sum')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{t('cashHandover.summary.skladCashHint')}</p>
          </div>

          {mode === 'admin' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <span className="pr-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide break-words">{t('cashHandover.summary.adminCash')}</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{summary.adminCashTotal.toLocaleString()} {t('common.sum')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{t('cashHandover.summary.adminCashHint')}</p>
            </div>
          )}
        </div>

        {collectorSummary.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 py-4 sm:px-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('cashHandover.collectors.title')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {t('cashHandover.collectors.subtitle')}
              </p>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {collectorSummary.map((c) => (
                  <div
                    key={c.collectedByUserId}
                    className="min-w-[260px] sm:min-w-[300px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                          {c.collectedBy?.name || '—'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {c.collectedBy?.role ? t(`login.role.${c.collectedBy.role}` as never) : '—'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {c.clientsCount} {t('cashHandover.collectors.clients')} · {c.paymentsCount} {t('cashHandover.collectors.payments')}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t('cashHandover.collectors.cashTotal')}
                        </p>
                        <p className="text-sm font-bold text-green-700 dark:text-green-300">
                          {c.cashTotal.toLocaleString()} {t('common.sum')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('payments.method.cash')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {c.cashMethodTotal.toLocaleString()} {t('common.sum')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('payments.method.terminal')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {c.terminalTotal.toLocaleString()} {t('common.sum')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('payments.method.transfer')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {c.transferTotal.toLocaleString()} {t('common.sum')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {t('cashHandover.collectors.debtTotal')}
                      </p>
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        {c.debtTotal.toLocaleString()} {t('common.sum')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-4 py-4 sm:px-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {mode === 'sklad' ? t('cashHandover.table.title.sklad') : t('cashHandover.table.title.admin')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {t('cashHandover.table.subtitle')}
            </p>
          </div>

          {rows.length === 0 && !loading ? (
            <div className="px-4 py-12 sm:py-16 text-center text-gray-500 dark:text-gray-400">
              <Wallet size={34} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">{emptyLabel}</p>
            </div>
          ) : (
            <>
              <div className="p-3 sm:p-4 space-y-3 lg:hidden">
                {rows.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-green-700 dark:text-green-300 break-words">
                          {row.amount.toLocaleString()} {t('common.sum')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatDisplay(row.date)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {formatOrderLabel(row)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t('orders.client')}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white break-words">{row.client?.name || '—'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 break-all">{row.client?.phone || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">{row.client?.address || '—'}</p>
                      </div>

                      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t('payments.collectedBy')}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white break-words">{row.collectedBy?.name || '—'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {row.collectedBy?.role ? t(`login.role.${row.collectedBy.role}` as never) : '—'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(`payments.method.${row.method}` as never)}</p>
                      </div>

                      {mode === 'admin' && (
                        <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {t('cashHandover.table.acceptedBySklad')}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white break-words">{row.receivedBySklad?.name || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {row.receivedBySkladAt ? formatDisplay(row.receivedBySkladAt.slice(0, 10)) : '—'}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => void handleAccept(row.id)}
                      disabled={acceptingAll || acceptingId === row.id}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Check size={15} />
                      {acceptingId === row.id ? '...' : acceptLabel}
                    </button>
                  </article>
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.date')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.client')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('payments.collectedBy')}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.id')}</th>
                    {mode === 'admin' && (
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('cashHandover.table.acceptedBySklad')}</th>
                    )}
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('payments.amount')}</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 dark:border-gray-700/60 last:border-0 hover:bg-gray-50/60 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDisplay(row.date)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-[180px]">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.client?.name || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{row.client?.phone || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.client?.address || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-[180px]">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.collectedBy?.name || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {row.collectedBy?.role ? t(`login.role.${row.collectedBy.role}` as never) : '—'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t(`payments.method.${row.method}` as never)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatOrderLabel(row)}
                      </td>
                      {mode === 'admin' && (
                        <td className="px-5 py-4">
                          <div className="min-w-[180px]">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.receivedBySklad?.name || '—'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {row.receivedBySkladAt ? formatDisplay(row.receivedBySkladAt.slice(0, 10)) : '—'}
                            </p>
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-4 text-right text-sm font-bold text-green-700 dark:text-green-300 whitespace-nowrap">
                        {row.amount.toLocaleString()} {t('common.sum')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => void handleAccept(row.id)}
                          disabled={acceptingAll || acceptingId === row.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Check size={13} />
                          {acceptingId === row.id ? '...' : acceptLabel}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {acceptAllModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeAcceptAllModal(); }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAcceptAllModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {acceptAllModalTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {acceptAllModalText
                .replace('{count}', rows.length.toLocaleString())
                .replace('{amount}', `${queueTotal.toLocaleString()} ${t('common.sum')}`)}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeAcceptAllModal}
                disabled={acceptingAll}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void confirmAcceptAll()}
                disabled={acceptingAll}
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {acceptingAll ? '...' : acceptAllLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
