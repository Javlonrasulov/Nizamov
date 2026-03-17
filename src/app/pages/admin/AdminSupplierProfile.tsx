import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CreditCard, PackagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { CrmSelect } from '../../components/CrmSelect';
import { useApp } from '../../context/AppContext';
import {
  apiAddSupplierPayment,
  apiAddSupplierStockIn,
  apiDeleteSupplier,
  apiGetSupplier,
  apiUpdateSupplier,
  SupplierDetail,
  SupplierPaymentType,
} from '../../api/suppliers';

const todayStr = () => new Date().toISOString().slice(0, 10);
const formatMoney = (n: number) => (n || 0).toLocaleString('ru-RU');

export const AdminSupplierProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, products, refetchData } = useApp();
  const [data, setData] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stockInForm, setStockInForm] = useState({
    date: todayStr(),
    comment: '',
    items: [{ productId: '', quantity: '1', costPrice: '', salePrice: '' }],
  });
  const [paymentForm, setPaymentForm] = useState({
    date: todayStr(),
    amount: '',
    type: 'cash' as SupplierPaymentType,
    comment: '',
  });
  const [savingStockIn, setSavingStockIn] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', comment: '' });

  const groupedStockIns = useMemo(() => {
    if (!data?.stockIns?.length) return [];

    const order: string[] = [];
    const byDate = new Map<string, {
      date: string;
      total: number;
      comments: Set<string>;
      items: Map<string, { productId: string; productName: string; quantity: number; costPrice: number; total: number }>;
    }>();

    for (const si of data.stockIns) {
      const date = si.date;
      if (!byDate.has(date)) {
        byDate.set(date, { date, total: 0, comments: new Set(), items: new Map() });
        order.push(date);
      }
      const g = byDate.get(date)!;
      g.total += si.total || 0;
      if (si.comment) g.comments.add(si.comment);

      for (const it of si.items || []) {
        const key = `${it.productId}::${it.costPrice}`;
        const prev = g.items.get(key);
        if (!prev) {
          g.items.set(key, {
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            costPrice: it.costPrice,
            total: it.total,
          });
        } else {
          prev.quantity += it.quantity;
          prev.total += it.total;
        }
      }
    }

    return order.map(d => {
      const g = byDate.get(d)!;
      return {
        date: g.date,
        total: g.total,
        comments: Array.from(g.comments),
        items: Array.from(g.items.values()).sort((a, b) => a.productName.localeCompare(b.productName)),
      };
    });
  }, [data]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiGetSupplier(id);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!data) return;
    setEditForm({
      name: data.name || '',
      phone: (data.phone || '') as any,
      address: (data.address || '') as any,
      comment: (data.comment || '') as any,
    });
  }, [data]);

  const stockInTotal = useMemo(() => {
    return stockInForm.items.reduce((sum, it) => {
      const qty = Number(it.quantity || 0);
      const cost = Number(it.costPrice || 0);
      return sum + (qty * cost);
    }, 0);
  }, [stockInForm.items]);

  const handleAddStockIn = async () => {
    if (!id) return;
    // Validate rows: if user typed something but didn't select product -> show error
    const hasInvalidRow = stockInForm.items.some(i => {
      const touched = (i.quantity || '').trim() !== '' || (i.costPrice || '').trim() !== '' || (i.salePrice || '').trim() !== '';
      return touched && !i.productId;
    });
    if (hasInvalidRow) {
      setError('Mahsulot tanlang (Название товара).');
      return;
    }
    const items = stockInForm.items
      .filter(i => i.productId && Number(i.quantity) > 0)
      .map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity || 0),
        costPrice: Number(i.costPrice || 0),
        salePrice: i.salePrice === '' ? undefined : Number(i.salePrice),
      }));
    if (items.length === 0) {
      setError('Kirim uchun kamida bitta mahsulot tanlab, miqdor kiriting.');
      return;
    }

    setSavingStockIn(true);
    setError('');
    try {
      await apiAddSupplierStockIn(id, {
        date: stockInForm.date,
        comment: stockInForm.comment.trim() || undefined,
        items,
      });
      setStockInForm({ date: todayStr(), comment: '', items: [{ productId: '', quantity: '1', costPrice: '', salePrice: '' }] });
      await load();
      await refetchData(); // products stock updated
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    } finally {
      setSavingStockIn(false);
    }
  };

  const handleAddPayment = async () => {
    if (!id) return;
    const amount = Number(paymentForm.amount || 0);
    if (amount <= 0) return;
    setSavingPayment(true);
    setError('');
    try {
      await apiAddSupplierPayment(id, {
        date: paymentForm.date,
        amount,
        type: paymentForm.type,
        comment: paymentForm.comment.trim() || undefined,
      });
      setPaymentForm({ date: todayStr(), amount: '', type: 'cash', comment: '' });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveSupplier = async () => {
    if (!id) return;
    if (!editForm.name.trim()) return;
    setError('');
    try {
      await apiUpdateSupplier(id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        comment: editForm.comment.trim() || undefined,
      });
      setShowEdit(false);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!id) return;
    setError('');
    try {
      await apiDeleteSupplier(id);
      navigate('/admin/suppliers');
    } catch (e: any) {
      setError(e?.message || 'Xatolik');
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/admin/suppliers')}
              className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('common.back')}
            >
              <ArrowLeft size={18} className="text-gray-600 dark:text-gray-200" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : (data?.name || t('admin.suppliers.profile'))}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {data?.phone || data?.address || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('admin.suppliers.edit')}
            >
              <Pencil size={18} className="text-gray-600 dark:text-gray-200" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-10 h-10 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title={t('admin.suppliers.delete')}
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-300" />
            </button>
            <button
              onClick={load}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('admin.suppliers.totalReceived')}</div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatMoney(data.totals.totalReceived)} so&apos;m
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('admin.suppliers.totalPaid')}</div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatMoney(data.totals.totalPaid)} so&apos;m
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('admin.suppliers.remainingDebt')}</div>
                <div className={`mt-1 text-lg font-bold tabular-nums ${data.totals.remainingDebt > 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'}`}>
                  {formatMoney(data.totals.remainingDebt)} so&apos;m
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Stock-in */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <PackagePlus size={18} className="text-[#2563EB]" />
                    {t('admin.suppliers.addProduct')}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                    {t('admin.suppliers.totalSum')}: {formatMoney(stockInTotal)} so&apos;m
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('common.date')}</div>
                    <input
                      type="date"
                      value={stockInForm.date}
                      onChange={e => setStockInForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.comment')}</div>
                    <input
                      value={stockInForm.comment}
                      onChange={e => setStockInForm(f => ({ ...f, comment: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {stockInForm.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                      <div className="sm:col-span-5">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('admin.suppliers.productName')}</div>
                        <CrmSelect
                          value={it.productId}
                          onValueChange={(v) => setStockInForm(f => ({
                            ...f,
                            items: f.items.map((x, i) => i === idx ? { ...x, productId: v } : x),
                          }))}
                          placeholder={t('orders.selectProducts')}
                          searchable
                          searchPlaceholder={t('common.search')}
                          emptyText={t('admin.suppliers.noProducts')}
                          options={products.map(p => ({ value: p.id, label: p.name }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('admin.suppliers.quantity')}</div>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={e => setStockInForm(f => ({
                            ...f,
                            items: f.items.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x),
                          }))}
                          onBlur={() => {
                            setStockInForm(f => ({
                              ...f,
                              items: f.items.map((x, i) => {
                                if (i !== idx) return x;
                                const v = x.quantity.trim();
                                if (v === '') return { ...x, quantity: '1' };
                                const n = Number(v);
                                if (!Number.isFinite(n) || n <= 0) return { ...x, quantity: '1' };
                                return { ...x, quantity: String(Math.floor(n)) };
                              }),
                            }));
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('admin.suppliers.costPrice')}</div>
                        <input
                          type="number"
                          min={0}
                          value={it.costPrice}
                          onChange={e => setStockInForm(f => ({
                            ...f,
                            items: f.items.map((x, i) => i === idx ? { ...x, costPrice: e.target.value } : x),
                          }))}
                          onBlur={() => {
                            setStockInForm(f => ({
                              ...f,
                              items: f.items.map((x, i) => {
                                if (i !== idx) return x;
                                const v = x.costPrice.trim();
                                if (v === '') return x;
                                const n = Number(v);
                                if (!Number.isFinite(n) || n < 0) return { ...x, costPrice: '' };
                                return { ...x, costPrice: String(Math.floor(n)) };
                              }),
                            }));
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-end justify-between gap-2 mb-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('admin.suppliers.salePrice')}</div>
                          {it.productId ? (() => {
                            const p = products.find(pp => pp.id === it.productId);
                            if (!p) return null;
                            return (
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                {t('admin.suppliers.currentSalePrice')}: <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-200">{formatMoney(p.price)} so&apos;m</span>
                              </div>
                            );
                          })() : null}
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={it.salePrice}
                          onChange={e => setStockInForm(f => ({
                            ...f,
                            items: f.items.map((x, i) => i === idx ? { ...x, salePrice: e.target.value } : x),
                          }))}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
                          placeholder={t('common.optional')}
                        />
                      </div>
                      <div className="sm:col-span-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setStockInForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: '1', costPrice: '', salePrice: '' }] }))}
                          className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#2563EB] flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Qator qo'shish"
                        >
                          <Plus size={18} />
                        </button>
                        {stockInForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setStockInForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}
                            className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={handleAddStockIn}
                    disabled={savingStockIn}
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {savingStockIn ? '...' : t('common.save')}
                  </button>
                </div>
              </div>

              {/* Payment */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-[#2563EB]" />
                  {t('admin.suppliers.addPayment')}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('common.date')}</div>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.paymentType')}</div>
                    <CrmSelect
                      value={paymentForm.type}
                      onValueChange={(v) => setPaymentForm(f => ({ ...f, type: v as SupplierPaymentType }))}
                      placeholder={t('admin.suppliers.paymentType')}
                      options={[
                        { value: 'cash', label: t('admin.suppliers.cash') },
                        { value: 'card', label: t('admin.suppliers.card') },
                        { value: 'bank', label: t('admin.suppliers.bank') },
                      ]}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.totalSum')}</div>
                    <input
                      type="number"
                      min={0}
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.comment')}</div>
                    <input
                      value={paymentForm.comment}
                      onChange={e => setPaymentForm(f => ({ ...f, comment: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={handleAddPayment}
                    disabled={savingPayment}
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {savingPayment ? '...' : t('common.save')}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{t('admin.suppliers.products')}</div>
                <div className="mt-3 space-y-3">
                  {data.stockIns.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('admin.suppliers.noProducts')}</div>
                  ) : (
                    groupedStockIns.map(g => (
                      <div key={g.date} className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/40 flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {g.date}
                            {g.comments.length ? (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                ({g.comments.join(', ')})
                              </span>
                            ) : null}
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                            {formatMoney(g.total)} so&apos;m
                          </div>
                        </div>
                        <div className="p-3 overflow-x-auto">
                          <table className="w-full text-sm border-collapse" style={{ minWidth: 520 }}>
                            <thead>
                              <tr className="text-xs text-gray-500 dark:text-gray-400">
                                <th className="text-left py-1.5 pr-2">{t('admin.suppliers.productName')}</th>
                                <th className="text-right py-1.5 px-2">{t('admin.suppliers.quantity')}</th>
                                <th className="text-right py-1.5 px-2">{t('admin.suppliers.costPrice')}</th>
                                <th className="text-right py-1.5 pl-2">{t('admin.suppliers.totalSum')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.items.map(it => (
                                <tr key={`${it.productId}::${it.costPrice}`} className="border-t border-gray-100 dark:border-gray-700">
                                  <td className="py-2 pr-2 text-gray-800 dark:text-gray-100">{it.productName}</td>
                                  <td className="py-2 px-2 text-right tabular-nums text-gray-700 dark:text-gray-200">{it.quantity}</td>
                                  <td className="py-2 px-2 text-right tabular-nums text-gray-700 dark:text-gray-200">{formatMoney(it.costPrice)}</td>
                                  <td className="py-2 pl-2 text-right tabular-nums font-semibold text-gray-900 dark:text-white">{formatMoney(it.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{t('admin.suppliers.payments')}</div>
                <div className="mt-3 space-y-2">
                  {data.payments.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('admin.suppliers.noPayments')}</div>
                  ) : (
                    data.payments.map(p => (
                      <div key={p.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {p.date}{' '}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({t(`admin.suppliers.${p.type}` as any)})
                            </span>
                          </div>
                          {p.comment ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.comment}</div>
                          ) : null}
                        </div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                          {formatMoney(p.amount)} so&apos;m
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {showEdit && data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowEdit(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{t('admin.suppliers.edit')}</div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.name')}</div>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.phone')}</div>
                    <input
                      value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.address')}</div>
                    <input
                      value={editForm.address}
                      onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('admin.suppliers.comment')}</div>
                  <input
                    value={editForm.comment}
                    onChange={e => setEditForm(f => ({ ...f, comment: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSaveSupplier}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete && data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmDelete(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{t('admin.suppliers.deleteTitle')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{data.name}</span>
                </div>
              </div>
              <div className="p-4 text-sm text-gray-700 dark:text-gray-200">
                {t('admin.suppliers.deleteConfirm')}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteSupplier}
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  {t('admin.suppliers.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

