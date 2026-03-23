import React, { useMemo, useState, useEffect } from 'react';
import { Search, CalendarDays, RefreshCw, Eye, Package, ChevronDown, ChevronUp, Truck, MapPin, ExternalLink, Printer, RotateCcw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderStatus } from '../../data/mockData';
import { useAdminVisibleOrders } from '../../components/AdminDateFilter';
import { apiGetUsers } from '../../api/users';
import { apiGetVehicles } from '../../api/vehicles';
import { apiGetClientBalance, type Payment } from '../../api/payments';
import { apiAcceptReturn, apiCreateReturn, apiGetReturns } from '../../api/returns';
import type { User } from '../../data/mockData';
import { translations } from '../../i18n/translations';

const formatOrderId = (order: { id: string; orderNumber?: number }) =>
  order.orderNumber != null ? `#${order.orderNumber}` : `#${order.id.slice(-6).toUpperCase()}`;

export const AdminOrders = () => {
  const { t, updateOrderStatus, updateOrder, adminDateFrom, adminDateTo, refetchData, clients, currentUser, orders: appOrders } = useApp();
  const adminVisibleOrders = useAdminVisibleOrders();
  const ordersForCancelled = useMemo(() => (appOrders || []).filter(o => o.status !== 'new'), [appOrders]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all' | 'delivered_debt'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [yuklashOrder, setYuklashOrder] = useState<{ id: string } | null>(null);
  const [bulkYuklashOrderIds, setBulkYuklashOrderIds] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const selectionEnabled = statusFilter === 'tayyorlanmagan';
  useEffect(() => {
    if (!selectionEnabled) setSelectedOrderIds([]);
  }, [selectionEnabled]);
  const [deliveryUsers, setDeliveryUsers] = useState<User[]>([]);
  const [deliveryFilterId, setDeliveryFilterId] = useState<string>('');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehiclesList, setVehiclesList] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiGetVehicles()
      .then(data => { if (!cancelled) setVehiclesList((data || []).map(v => v.name)); })
      .catch(() => { if (!cancelled) setVehiclesList([]); });
    return () => { cancelled = true; };
  }, []);
  const [debtByOrderId, setDebtByOrderId] = useState<Record<string, number>>({});
  const [paidByOrderId, setPaidByOrderId] = useState<Record<string, number>>({});
  const [paymentsByOrderId, setPaymentsByOrderId] = useState<Record<string, Payment[]>>({});
  const [debtLoading, setDebtLoading] = useState(false);
  const [returnedByOrderId, setReturnedByOrderId] = useState<Record<string, boolean>>({});
  const [returnsDetailByOrderId, setReturnsDetailByOrderId] = useState<Record<string, {
    items: { productName: string; quantity: number }[];
    productBreakdown: { productName: string; orderedQty: number; cancelledQty: number; deliveredQty: number; price: number }[];
    isFull: boolean;
    cancelledAmount: number;
    deliveredAmount: number;
    acceptedBy?: string;
    comment?: string;
  }>>({});
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [pendingReturns, setPendingReturns] = useState<Awaited<ReturnType<typeof apiGetReturns>>>([]);
  const [pendingReturnsLoading, setPendingReturnsLoading] = useState(false);
  const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);
  const [acceptModal, setAcceptModal] = useState<{ open: boolean; returnId: string | null; comment: string }>({ open: false, returnId: null, comment: '' });
  const [acceptModalSaving, setAcceptModalSaving] = useState(false);
  const [refreshReturnsDetailTrigger, setRefreshReturnsDetailTrigger] = useState(0);

  // Returns (vozvrat)
  const [retOpen, setRetOpen] = useState(false);
  const [retClientSearch, setRetClientSearch] = useState('');
  const [retClientId, setRetClientId] = useState<string>('');
  const [retOrderId, setRetOrderId] = useState<string>('');
  const [retLoading, setRetLoading] = useState(false);
  const [retError, setRetError] = useState('');
  const [retSaved, setRetSaved] = useState(false);
  const [retRemainingByProduct, setRetRemainingByProduct] = useState<Record<string, number>>({});
  const [retSelectByProduct, setRetSelectByProduct] = useState<Record<string, boolean>>({});
  const [retQtyByProduct, setRetQtyByProduct] = useState<Record<string, string>>({});

  const orderedClients = useMemo(() => {
    const map = new Map<string, { clientId: string; name: string; phone: string }>();
    for (const o of adminVisibleOrders) {
      if (!o.clientId) continue;
      if (!map.has(o.clientId)) map.set(o.clientId, { clientId: o.clientId, name: o.clientName, phone: o.clientPhone });
    }
    return Array.from(map.values());
  }, [adminVisibleOrders]);

  const retClientOptions = useMemo(() => {
    const q = retClientSearch.trim().toLowerCase();
    if (!q) return orderedClients;
    return orderedClients.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
    );
  }, [orderedClients, retClientSearch]);

  const retOrdersForClient = useMemo(() => {
    if (!retClientId) return [];
    return adminVisibleOrders
      .filter(o => o.clientId === retClientId)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [adminVisibleOrders, retClientId]);

  const selectedRetOrder = useMemo(() => {
    if (!retOrderId) return null;
    return adminVisibleOrders.find(o => o.id === retOrderId) || null;
  }, [adminVisibleOrders, retOrderId]);

  const loadReturnRemaining = async (orderId: string) => {
    const order = adminVisibleOrders.find(o => o.id === orderId);
    if (!order) return;
    setRetLoading(true);
    setRetError('');
    try {
      const existing = await apiGetReturns({ orderId });
      const returned = new Map<string, number>();
      for (const r of existing) {
        for (const it of (r.items || [])) {
          returned.set(it.productId, (returned.get(it.productId) || 0) + (it.quantity || 0));
        }
      }
      const remainingNext: Record<string, number> = {};
      for (const it of order.items || []) {
        const ordQty = Number(it.quantity || 0);
        const retQty = returned.get(it.productId) || 0;
        remainingNext[it.productId] = Math.max(0, ordQty - retQty);
      }
      setRetRemainingByProduct(remainingNext);
      setRetSelectByProduct({});
      setRetQtyByProduct({});
    } catch (e: any) {
      setRetError(e?.message || 'Xatolik');
    } finally {
      setRetLoading(false);
    }
  };

  const openReturn = () => {
    setRetOpen(true);
    setRetClientSearch('');
    setRetClientId('');
    setRetOrderId('');
    setRetError('');
    setRetSaved(false);
    setRetRemainingByProduct({});
    setRetSelectByProduct({});
    setRetQtyByProduct({});
  };

  const closeReturn = () => {
    setRetOpen(false);
  };

  useEffect(() => {
    refetchData?.();
  }, [refetchData]);

  // Delivery users list for dropdown filter (Zakazlar sahifasi)
  useEffect(() => {
    let cancelled = false;
    apiGetUsers('delivery')
      .then((data) => {
        if (cancelled) return;
        setDeliveryUsers(data || []);
      })
      .catch(() => {
        if (cancelled) return;
        setDeliveryUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (yuklashOrder) {
      apiGetUsers('delivery').then(setDeliveryUsers).catch(() => setDeliveryUsers([]));
      apiGetVehicles()
        .then(data => setVehiclesList((data || []).map(v => v.name)))
        .catch(() => setVehiclesList([]));
      setSelectedDeliveryId('');
      setVehicleName('');
    }
  }, [yuklashOrder]);

  // Delivered zakazlar uchun qarz (debt) ni client balance orqali olib kelamiz
  useEffect(() => {
    const q = (search || '').toLowerCase();
    const delivered = adminVisibleOrders.filter(o => {
      if (o.status !== 'delivered') return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q)
        || (o.orderNumber != null && String(o.orderNumber).includes(search))
        || o.clientName.toLowerCase().includes(q)
        || o.agentName.toLowerCase().includes(q)
      );
    });
    const clientIds = Array.from(new Set(delivered.map(o => o.clientId).filter(Boolean)));
    if (clientIds.length === 0) return;

    const deliveredOrderIds = new Set(delivered.map(o => o.id));

    let cancelled = false;
    setDebtLoading(true);
    (async () => {
      const next: Record<string, number> = {};
      const nextPaid: Record<string, number> = {};
      const nextPayments: Record<string, Payment[]> = {};
      for (const clientId of clientIds) {
        try {
          const bal = await apiGetClientBalance(clientId);
          for (const row of bal.perOrder) {
            next[row.orderId] = row.debt;
            nextPaid[row.orderId] = row.paid;
          }

          for (const p of bal.payments || []) {
            if (!p.orderId) continue;
            if (!deliveredOrderIds.has(p.orderId)) continue;
            const arr = nextPayments[p.orderId] || [];
            arr.push(p);
            nextPayments[p.orderId] = arr;
          }
        } catch {
          // ignore
        }
      }
      if (!cancelled) setDebtByOrderId(prev => ({ ...prev, ...next }));
      if (!cancelled) setPaidByOrderId(prev => ({ ...prev, ...nextPaid }));
      if (!cancelled) setPaymentsByOrderId(prev => ({ ...prev, ...nextPayments }));
      if (!cancelled) setDebtLoading(false);
    })();

    return () => { cancelled = true; };
  }, [adminVisibleOrders, search]);

  // Admin uchun vozvratlar tafsiloti faqat accepted (admin tasdiqlagan) return'lar asosida bo'lsin.
  // Aks holda delivery pending return'lar ham "qaytarildi" pill'larini chiqarib yuboradi.
  useEffect(() => {
    let cancelled = false;
    setReturnsLoading(true);
    (async () => {
      try {
        const allReturns = await apiGetReturns({ status: 'accepted' });
        const next: Record<string, boolean> = {};
        const nextDetail: Record<string, {
          items: { productName: string; quantity: number }[];
          productBreakdown: { productName: string; orderedQty: number; cancelledQty: number; deliveredQty: number; price: number }[];
          isFull: boolean;
          cancelledAmount: number;
          deliveredAmount: number;
          acceptedBy?: string;
          comment?: string;
        }> = {};
        const returnsByOrderId = new Map<string, typeof allReturns>();
        for (const r of allReturns || []) {
          next[r.orderId] = true;
          const list = returnsByOrderId.get(r.orderId) || [];
          list.push(r);
          returnsByOrderId.set(r.orderId, list);
        }
        for (const [orderId, rows] of returnsByOrderId) {
          const byProduct = new Map<string, { productName: string; quantity: number }>();
          for (const r of rows) {
            for (const it of r.items || []) {
              const cur = byProduct.get(it.productId);
              const q = (it.quantity || 0) + (cur?.quantity ?? 0);
              byProduct.set(it.productId, { productName: it.productName || '', quantity: q });
            }
          }
          const items = Array.from(byProduct.values());
          const order = adminVisibleOrders.find(o => o.id === orderId);
          const orderItems = order?.items || [];
          let isFull = orderItems.length > 0;
          const productBreakdown: { productName: string; orderedQty: number; cancelledQty: number; deliveredQty: number; price: number }[] = [];
          for (const ord of orderItems) {
            const ret = byProduct.get(ord.productId);
            if (!ret || ret.quantity < Number(ord.quantity || 0)) {
              isFull = false;
            }
            const orderedQty = Number(ord.quantity || 0);
            const cancelledQty = Math.min(orderedQty, ret?.quantity || 0);
            const deliveredQty = Math.max(0, orderedQty - cancelledQty);
            const price = Number(ord.price || 0);
            productBreakdown.push({
              productName: ord.productName || '',
              orderedQty,
              cancelledQty,
              deliveredQty,
              price,
            });
          }
          let cancelledAmount = 0;
          let deliveredAmount = 0;
          for (const ord of orderItems) {
            const ordQty = Number(ord.quantity || 0);
            const unitPrice = Number(ord.price || 0);
            const retQty = Math.min(ordQty, byProduct.get(ord.productId)?.quantity || 0);
            const delQty = Math.max(0, ordQty - retQty);
            cancelledAmount += retQty * unitPrice;
            deliveredAmount += delQty * unitPrice;
          }
          const acceptedReturn = rows.find((r: any) => r.status === 'accepted');
          nextDetail[orderId] = {
            items,
            productBreakdown,
            isFull,
            cancelledAmount,
            deliveredAmount,
            acceptedBy: acceptedReturn?.acceptedBy?.name,
            comment: acceptedReturn?.comment || undefined,
          };
        }
        if (!cancelled) {
          setReturnedByOrderId(prev => ({ ...prev, ...next }));
          setReturnsDetailByOrderId(prev => ({ ...prev, ...nextDetail }));
        }
      } catch {
        // ignore
      }
      if (!cancelled) setReturnsLoading(false);
    })();

    return () => { cancelled = true; };
  }, [adminVisibleOrders, refreshReturnsDetailTrigger]);

  const getEffectiveDebt = (orderId: string) => {
    const detail = returnsDetailByOrderId[orderId];
    if (detail) {
      const paid = paidByOrderId[orderId] ?? 0;
      return Math.max(0, detail.deliveredAmount - paid);
    }
    return debtByOrderId[orderId] ?? 0;
  };
  const isFullyReturnedOrder = (orderId: string) => !!returnsDetailByOrderId[orderId]?.isFull;

  // Kutilayotgan vozvratlarni yuklash (Qabul qilindi uchun)
  useEffect(() => {
    let cancelled = false;
    setPendingReturnsLoading(true);
    apiGetReturns({ status: 'pending' })
      .then((data) => { if (!cancelled) setPendingReturns(data || []); })
      .catch(() => { if (!cancelled) setPendingReturns([]); })
      .finally(() => { if (!cancelled) setPendingReturnsLoading(false); });
    return () => { cancelled = true; };
  }, [statusFilter, retSaved, refetchData]);

  const handleYuklashConfirm = async () => {
    if (!yuklashOrder || !selectedDeliveryId) return;
    const delivery = deliveryUsers.find(u => u.id === selectedDeliveryId);
    if (!delivery) return;
    await updateOrder(yuklashOrder.id, {
      status: 'yuborilgan',
      deliveryId: delivery.id,
      deliveryName: delivery.name,
      vehicleName: vehicleName || undefined,
    });
    setYuklashOrder(null);
    refetchData?.();
  };

  const handleBulkYuklashConfirm = async () => {
    if (bulkYuklashOrderIds.length === 0 || !selectedDeliveryId) return;
    const delivery = deliveryUsers.find(u => u.id === selectedDeliveryId);
    if (!delivery) return;

    // Bir nechta zakazni bir xil dostavkachi + mashina bilan yuboramiz.
    for (const id of bulkYuklashOrderIds) {
      await updateOrder(id, {
        status: 'yuborilgan',
        deliveryId: delivery.id,
        deliveryName: delivery.name,
        vehicleName: vehicleName || undefined,
      });
    }

    setBulkYuklashOrderIds([]);
    setSelectedOrderIds([]);
    setYuklashOrder(null);
    refetchData?.();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchData?.();
    setRefreshing(false);
  };

  const baseOrders = statusFilter === 'cancelled' ? ordersForCancelled : adminVisibleOrders;
  const filtered = baseOrders.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.orderNumber != null && String(o.orderNumber).includes(search)) ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.agentName.toLowerCase().includes(search.toLowerCase());
    const isFullyReturned = isFullyReturnedOrder(o.id);
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'cancelled' && (o.status === 'cancelled' || returnedByOrderId[o.id]))
      || (!isFullyReturned && o.status === statusFilter)
      || (!isFullyReturned && statusFilter === 'tayyorlanmagan' && o.status === 'sent')
      || (!isFullyReturned && statusFilter === 'delivered_debt' && o.status === 'delivered' && getEffectiveDebt(o.id) > 0);
    const orderDeliveryId = (o as any).deliveryId as string | undefined;
    const matchDelivery = !deliveryFilterId || orderDeliveryId === deliveryFilterId;
    return matchSearch && matchStatus && matchDelivery;
  });

  const selectedOrders = filtered.filter(o => selectedOrderIds.includes(o.id));
  const selectableOrderIds = filtered
    // needsYuklash() keyinroq e'lon qilingani uchun (const) undan oldin ishlatib bo'lmaydi.
    // Shu joyda inline tekshiramiz.
    .filter(o =>
      (o.status === 'tayyorlanmagan' || o.status === 'sent')
      && !isFullyReturnedOrder(o.id)
      && !(statusFilter === 'cancelled' && returnedByOrderId[o.id])
    )
    .map(o => o.id);

  const deliveryFilterUser = useMemo(
    () => deliveryUsers.find(u => u.id === deliveryFilterId) || null,
    [deliveryUsers, deliveryFilterId],
  );

  const deliveryClientStats = useMemo(() => {
    if (!deliveryFilterId) return [];
    const map = new Map<string, { clientId?: string; clientName: string; clientPhone?: string; ordersCount: number; totalSum: number }>();

    for (const o of filtered) {
      const cId = (o as any).clientId as string | undefined;
      const key = cId || `${o.clientName}__${o.clientPhone || ''}`;
      const cur = map.get(key);
      const detail = returnsDetailByOrderId[o.id];
      // "Jami" summada vozvratlar (bekor qilingan/return qilingan qism) hisobga olinishi kerak.
      // Shuning uchun biz orderning "qolgan" (deliveredAmount) qiymatini olamiz.
      const totalSum = detail ? detail.deliveredAmount : (Number(o.total || 0) as number);
      if (!cur) {
        map.set(key, {
          clientId: cId,
          clientName: o.clientName || '-',
          clientPhone: o.clientPhone || undefined,
          ordersCount: 1,
          totalSum,
        });
      } else {
        cur.ordersCount += 1;
        cur.totalSum += totalSum;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalSum - a.totalSum);
  }, [deliveryFilterId, filtered, returnsDetailByOrderId]);

  const deliveryTotals = useMemo(() => {
    if (!deliveryFilterId) return { grossTotal: 0, returnedTotal: 0, netTotal: 0 };
    let grossTotal = 0;
    let returnedTotal = 0;
    let netTotal = 0;

    for (const o of filtered) {
      const orderTotal = Number(o.total || 0);
      grossTotal += orderTotal;

      const detail = returnsDetailByOrderId[o.id];
      if (detail) {
        returnedTotal += Number(detail.cancelledAmount || 0);
        netTotal += Number(detail.deliveredAmount || 0);
      } else {
        netTotal += orderTotal;
      }
    }

    return { grossTotal, returnedTotal, netTotal };
  }, [deliveryFilterId, filtered, returnsDetailByOrderId]);

  const statuses: Array<OrderStatus | 'all' | 'delivered_debt'> = ['all', 'tayyorlanmagan', 'yuborilgan', 'delivered', 'delivered_debt', 'cancelled'];

  const statusLabels: Record<string, string> = {
    all: t('common.all'),
    tayyorlanmagan: t('status.tayyorlanmagan'),
    yuborilgan: t('status.yuborilgan'),
    sent: t('status.sent'),
    accepted: t('status.accepted'),
    delivering: t('status.delivering'),
    delivered: t('status.delivered'),
    delivered_debt: t('admin.orders.deliveredDebt'),
    cancelled: t('status.cancelled'),
  };

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    // sent, accepted, delivering — eski zakazlar uchun
    accepted: 'delivering',
    delivering: 'delivered',
  };

  const needsYuklash = (status: OrderStatus) => status === 'tayyorlanmagan' || status === 'sent';
  const getClientLoc = (clientId: string) => clients.find(c => c.id === clientId);

  const hasFilter = adminDateFrom || adminDateTo;

  const handlePrint = (order: any) => {
    const debt = debtByOrderId[order.id] ?? 0;
    // Chop etish tili har doim o'zbek (kirill) bo'lishi uchun alohida tarjima funksiyasi ishlatamiz.
    const tPrint = (key: keyof typeof translations['uz_lat']) => translations.uz_kir[key] || String(key);

    const title = `${tPrint('admin.ordersPage')} ${formatOrderId(order)}`;
    const debtLabel = `${tPrint('payments.badge.debt')}: ${debt.toLocaleString('ru-RU')} ${tPrint('common.sum')}`;

    const rows = (order.items ?? []).map((it: any, idx: number) => `
      <tr>
        <td style="width:38px;text-align:center;">${idx + 1}</td>
        <td>${escapeHtml(String(it.productName ?? ''))}</td>
        <td style="width:80px;text-align:right;">${Number(it.quantity || 0)} ${escapeHtml(tPrint('common.pcs'))}</td>
        <td style="width:110px;text-align:right;">${Number(it.price || 0).toLocaleString('ru-RU')} ${escapeHtml(tPrint('common.sum'))}</td>
        <td style="width:120px;text-align:right;font-weight:700;">${Number((it.quantity || 0) * (it.price || 0)).toLocaleString('ru-RU')} ${escapeHtml(tPrint('common.sum'))}</td>
      </tr>
    `).join('');

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Inter, Arial, sans-serif; color: #0f172a; margin: 24px; }
      .muted { color: #475569; }
      .top { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
      h1 { font-size: 18px; margin: 0 0 6px; }
      .badge { display:inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid #e2e8f0; }
      .badge.debt { background: #fef2f2; color: #b91c1c; border-color:#fee2e2; }
      .badge.paid { background: #f0fdf4; color: #166534; border-color:#dcfce7; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin-top: 14px; }
      .kv { font-size: 12px; }
      .k { font-weight: 700; color:#334155; display:inline-block; min-width: 140px; }
      table { width:100%; border-collapse: collapse; margin-top: 18px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; vertical-align: top; }
      th { background:#f1f5f9; text-align:left; }
      tfoot td { font-weight: 800; background:#f8fafc; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <div class="top">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <div class="muted" style="font-size:12px;">${escapeHtml(order.date ?? '')}</div>
      </div>
      <div class="badge ${debt > 0 ? 'debt' : ''}">${escapeHtml(debtLabel)}</div>
    </div>

    <div class="grid">
      <div class="kv"><span class="k">${escapeHtml(tPrint('orders.client'))}</span> ${escapeHtml(order.clientName ?? '')}</div>
      <div class="kv"><span class="k">${escapeHtml(tPrint('common.phone'))}</span> ${escapeHtml(order.clientPhone ?? '')}</div>
      <div class="kv"><span class="k">${escapeHtml(tPrint('orders.agent'))}</span> ${escapeHtml(order.agentName ?? '')}</div>
      <div class="kv"><span class="k">${escapeHtml(tPrint('common.address'))}</span> ${escapeHtml(order.clientAddress ?? '')}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:38px;">#</th>
          <th>${escapeHtml(tPrint('admin.suppliers.productName'))}</th>
          <th style="width:80px; text-align:right;">${escapeHtml(tPrint('admin.suppliers.quantity'))}</th>
          <th style="width:110px; text-align:right;">${escapeHtml(tPrint('admin.suppliers.salePrice'))}</th>
          <th style="width:120px; text-align:right;">${escapeHtml(tPrint('common.total'))}</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="5" class="muted">${escapeHtml(tPrint('orders.items'))}: 0</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align:right;">${escapeHtml(tPrint('common.total'))}</td>
          <td style="text-align:right;">${Number(order.total || 0).toLocaleString('ru-RU')} ${escapeHtml(tPrint('common.sum'))}</td>
        </tr>
      </tfoot>
    </table>

  </body>
</html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch {}
    };

    let printed = false;
    const doPrintOnce = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(cleanup, 1200);
      }
    };

    iframe.onload = () => doPrintOnce();

    // Fallback in case onload doesn't fire in some browsers
    setTimeout(() => {
      doPrintOnce();
    }, 250);
  };

  const handlePrintMany = (orders: any[]) => {
    if (!orders || orders.length === 0) return;

    // Chop etish tili har doim o'zbek (kirill) bo'lishi uchun alohida tarjima funksiyasi ishlatamiz.
    const tPrint = (key: keyof typeof translations['uz_lat']) => translations.uz_kir[key] || String(key);

    let rowIndex = 0;
    const rowsHtml = orders.map((order: any) => {
      const itemRows = (order.items ?? []).map((it: any) => {
        rowIndex += 1;
        const qty = Number(it.quantity || 0);
        const price = Number(it.price || 0);
        return `
          <tr>
            <td style="text-align:center;">${rowIndex}</td>
            <td>${escapeHtml(formatOrderId(order))}</td>
            <td>${escapeHtml(order.clientName ?? '')}</td>
            <td>${escapeHtml(order.agentName ?? '')}</td>
            <td>${escapeHtml(String(it.productName ?? ''))}</td>
            <td style="text-align:right;">${qty} ${escapeHtml(tPrint('common.pcs'))}</td>
            <td style="text-align:right;">${price.toLocaleString('ru-RU')} ${escapeHtml(tPrint('common.sum'))}</td>
            <td style="text-align:right; font-weight:700;">${(qty * price).toLocaleString('ru-RU')} ${escapeHtml(tPrint('common.sum'))}</td>
            <td>${escapeHtml(order.date ?? '')}</td>
          </tr>
        `;
      }).join('');
      if (itemRows) return itemRows;
      rowIndex += 1;
      return `
        <tr>
          <td style="text-align:center;">${rowIndex}</td>
          <td>${escapeHtml(formatOrderId(order))}</td>
          <td>${escapeHtml(order.clientName ?? '')}</td>
          <td>${escapeHtml(order.agentName ?? '')}</td>
          <td class="muted">${escapeHtml(tPrint('orders.items'))}: 0</td>
          <td style="text-align:right;">0</td>
          <td style="text-align:right;">0</td>
          <td style="text-align:right; font-weight:700;">0</td>
          <td>${escapeHtml(order.date ?? '')}</td>
        </tr>
      `;
    }).join('');

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(tPrint('admin.ordersPage'))} (${orders.length})</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Inter, Arial, sans-serif; color: #0f172a; margin: 24px; }
      .muted { color: #475569; }
      h1 { font-size: 18px; margin: 0 0 6px; }
      table { width:100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; vertical-align: top; }
      th { background:#f1f5f9; text-align:left; }
      .meta { font-size: 12px; color: #475569; }
      .summary { margin-top: 8px; font-size: 12px; color: #334155; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(tPrint('admin.ordersPage'))}</h1>
    <div class="meta">${escapeHtml(new Date().toLocaleString('ru-RU'))}</div>
    <div class="summary">${escapeHtml(tPrint('common.total'))}: ${orders.length} ${escapeHtml(tPrint('common.orders'))}</div>
    <table>
      <thead>
        <tr>
          <th style="width:38px;">#</th>
          <th>${escapeHtml(tPrint('orders.id'))}</th>
          <th>${escapeHtml(tPrint('orders.client'))}</th>
          <th>${escapeHtml(tPrint('orders.agent'))}</th>
          <th>${escapeHtml(tPrint('admin.suppliers.productName'))}</th>
          <th style="width:90px; text-align:right;">${escapeHtml(tPrint('admin.suppliers.quantity'))}</th>
          <th style="width:130px; text-align:right;">${escapeHtml(tPrint('admin.suppliers.salePrice'))}</th>
          <th style="width:140px; text-align:right;">${escapeHtml(tPrint('common.total'))}</th>
          <th style="width:110px;">${escapeHtml(tPrint('common.date'))}</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </body>
</html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch {}
    };

    let printed = false;
    const doPrintOnce = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(cleanup, 1200);
      }
    };

    iframe.onload = () => doPrintOnce();
    setTimeout(() => {
      doPrintOnce();
    }, 250);
  };

  function escapeHtml(s: string) {
    return s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.ordersPage')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} {t('common.pcs')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openReturn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={t('returns.title')}
            >
              <RotateCcw size={14} className="text-gray-500 dark:text-gray-300" />
              {t('returns.title')}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </button>
            <div className="flex items-center gap-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('orders.delivery')}
              </label>
              <select
                value={deliveryFilterId}
                onChange={e => {
                  setDeliveryFilterId(e.target.value);
                  setExpandedOrderId(null);
                }}
                className="crm-select px-3 py-2.5 min-w-[220px]"
              >
                <option value="">{t('common.all')}</option>
                {deliveryUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.phone})
                  </option>
                ))}
              </select>
            </div>
            {hasFilter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <CalendarDays size={13} className="text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`}
              </span>
            </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.orders.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                  statusFilter === s
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {pendingReturns.length > 0 && (
          <div className="bg-amber-50/80 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 overflow-hidden mb-4">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 dark:border-amber-800">
              <RotateCcw size={18} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">{t('returns.pendingReturns')}</span>
              {pendingReturnsLoading && <span className="text-xs text-amber-600 dark:text-amber-400">...</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100">
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-amber-200 dark:border-amber-700">{t('orders.client')}</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-amber-200 dark:border-amber-700">{t('returns.sentDate')}</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-amber-200 dark:border-amber-700">{t('returns.deliveryPerson')}</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-amber-200 dark:border-amber-700">{t('orders.agent')}</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-amber-200 dark:border-amber-700">{t('returns.returnedProducts')}</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-amber-200 dark:border-amber-700 w-28">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReturns.map((r) => (
                    <tr key={r.id} className="border-b border-amber-200/80 dark:border-amber-800/80 bg-white dark:bg-gray-800 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                      <td className="px-3 py-2.5 align-top">
                        <p className="font-medium text-gray-900 dark:text-white">{r.order?.clientName ?? '-'}</p>
                        {r.order?.clientPhone && <p className="text-xs text-gray-500 dark:text-gray-400">{r.order.clientPhone}</p>}
                      </td>
                      <td className="px-3 py-2.5 align-top text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.date || (r as any).createdAt?.slice(0, 10) || '-'}</td>
                      <td className="px-3 py-2.5 align-top text-gray-700 dark:text-gray-300">{r.createdBy?.name ?? '-'}</td>
                      <td className="px-3 py-2.5 align-top text-gray-700 dark:text-gray-300">{r.order?.agentName ?? adminVisibleOrders.find(o => o.id === r.orderId)?.agentName ?? '-'}</td>
                      <td className="px-3 py-2.5 align-top">
                        <button
                          type="button"
                          onClick={() => setExpandedReturnId(expandedReturnId === r.id ? null : r.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline"
                        >
                          {t('returns.returnedProducts')} ({(r.items || []).length})
                          {expandedReturnId === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {expandedReturnId === r.id && (
                          <div className="mt-2 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                            <table className="w-full text-xs border-collapse" style={{ minWidth: 200 }}>
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                  <th className="text-left px-2 py-1.5 font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">#</th>
                                  <th className="text-left px-2 py-1.5 font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">{t('admin.suppliers.productName')}</th>
                                  <th className="text-right px-2 py-1.5 font-semibold text-gray-600 dark:text-gray-300">{t('admin.suppliers.quantity')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(r.items || []).map((it, i) => (
                                  <tr key={it.id || i} className="border-t border-gray-100 dark:border-gray-700">
                                    <td className="px-2 py-1.5 text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">{i + 1}</td>
                                    <td className="px-2 py-1.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">{it.productName || '-'}</td>
                                    <td className="px-2 py-1.5 text-right font-medium text-gray-800 dark:text-gray-200">{it.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <button
                          type="button"
                          onClick={() => setAcceptModal({ open: true, returnId: r.id, comment: '' })}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-medium hover:bg-blue-600"
                        >
                          {t('returns.accept')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {deliveryFilterId && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('orders.delivery')}: {deliveryFilterUser?.name || '-'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {filtered.length} {t('common.orders')} • {deliveryClientStats.length} {t('common.clients')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('common.total')}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {deliveryTotals.grossTotal.toLocaleString('ru-RU')} {t('common.sum')}
                </div>

                <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  {t('returns.title')}: {deliveryTotals.returnedTotal.toLocaleString('ru-RU')} {t('common.sum')}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{t('admin.orders.netTotal')}</div>
                <div className="text-lg font-bold text-[#217346] dark:text-green-400">
                  {deliveryTotals.netTotal.toLocaleString('ru-RU')} {t('common.sum')}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">
                      {t('common.clients')}
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">
                      {t('common.orders')}
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">
                      {t('admin.orders.netTotal')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryClientStats.length > 0 ? (
                    deliveryClientStats.slice(0, 20).map(s => (
                      <tr
                        key={s.clientId || `${s.clientName}__${s.clientPhone || ''}`}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                      >
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{s.clientName}</div>
                          {s.clientPhone && <div className="text-xs text-gray-500 dark:text-gray-400">{s.clientPhone}</div>}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{s.ordersCount}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-[#217346] dark:text-green-400">
                          {s.totalSum.toLocaleString('ru-RU')} {t('common.sum')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={3}>
                        {t('orders.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {selectionEnabled && (
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Tanlangan: <span className="font-semibold text-gray-900 dark:text-white">{selectedOrderIds.length}</span> {t('common.pcs')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintMany(selectedOrders)}
                  disabled={selectedOrderIds.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('common.print')}
                >
                  <Printer size={14} />
                  {t('common.print')}
                </button>
                <button
                  onClick={() => {
                    setYuklashOrder(null);
                    setBulkYuklashOrderIds(selectedOrderIds.slice());
                    setSelectedDeliveryId('');
                    setVehicleName('');
                  }}
                  disabled={selectedOrderIds.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Yuklash"
                >
                  <Truck size={14} />
                  Yuklash
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">
                    {selectionEnabled ? (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectableOrderIds.length > 0 && selectableOrderIds.every(id => selectedOrderIds.includes(id))}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setSelectedOrderIds([]);
                              return;
                            }
                            setSelectedOrderIds(selectableOrderIds.slice());
                          }}
                          onClick={(ev) => ev.stopPropagation()}
                        />
                        {t('orders.id')}
                      </label>
                    ) : (
                      t('orders.id')
                    )}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.client')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.agent')}</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.total')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.status')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.date')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('common.actions')}</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{t('orders.comment')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <td className="px-5 py-4 text-sm font-mono text-gray-600 dark:text-gray-300 font-medium">
                        {selectionEnabled && (
                          <label
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              disabled={!selectableOrderIds.includes(order.id)}
                              onClick={(ev) => ev.stopPropagation()}
                              onChange={() => {
                                if (!selectableOrderIds.includes(order.id)) return;
                                setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]);
                              }}
                            />
                            <span>{formatOrderId(order)}</span>
                          </label>
                        )}
                        {!selectionEnabled && <span>{formatOrderId(order)}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.clientName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.clientPhone}</p>
                        {(() => {
                          const c = getClientLoc(order.clientId);
                          if (!c?.lat || !c?.lng) return null;
                          const href = `https://maps.google.com/?q=${c.lat},${c.lng}`;
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#2563EB] dark:text-blue-400 hover:underline"
                              title={t('admin.orders.mapTitle')}
                            >
                              <MapPin size={12} />
                              {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                              <ExternalLink size={11} className="opacity-70" />
                            </a>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{order.agentName}</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{order.total.toLocaleString()} so'm</td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {!isFullyReturnedOrder(order.id) && !(returnedByOrderId[order.id] && order.status === 'delivered') && (
                            <StatusBadge status={order.status} />
                          )}
                          {returnedByOrderId[order.id] && (
                            <div className="text-[11px] leading-4 space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                                isFullyReturnedOrder(order.id)
                                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 border-red-100 dark:border-red-800'
                                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200 border-amber-100 dark:border-amber-800'
                              }`}>
                                {t('returns.title')}
                              </span>
                              {returnsLoading && (
                                <span className="ml-2 text-gray-400 dark:text-gray-500">...</span>
                              )}
                              {!returnsLoading && returnsDetailByOrderId[order.id] && (
                                <>
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {returnsDetailByOrderId[order.id].isFull ? t('returns.allCancelledLabel') : t('returns.partialCancelled')}
                                  </div>
                                  {(returnsDetailByOrderId[order.id].acceptedBy || returnsDetailByOrderId[order.id].comment) && (
                                    <div className="text-[10px] text-green-600 dark:text-green-400 mt-1 space-y-0.5">
                                      {returnsDetailByOrderId[order.id].acceptedBy && (
                                        <div>{t('returns.acceptedBy')}: {returnsDetailByOrderId[order.id].acceptedBy}</div>
                                      )}
                                      {returnsDetailByOrderId[order.id].comment && (
                                        <div>{t('returns.comment')}: {returnsDetailByOrderId[order.id].comment}</div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          {order.status === 'delivered' && (
                            <div className="text-[11px] leading-4">
                              {getEffectiveDebt(order.id) > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-800">
                                  {t('payments.badge.debt')}: {getEffectiveDebt(order.id).toLocaleString('ru-RU')} {t('common.sum')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800">
                                  {t('payments.badge.paid')}
                                </span>
                              )}
                              {debtLoading && debtByOrderId[order.id] == null ? (
                                <span className="ml-2 text-gray-400 dark:text-gray-500">...</span>
                              ) : null}
                            </div>
                          )}
                          {(order.deliveryName || order.vehicleName) && (
                            <div className="text-[11px] leading-4 text-gray-500 dark:text-gray-400">
                              {order.deliveryName && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-300">{t('orders.delivery')}:</span>{' '}
                                  {order.deliveryName}
                                </div>
                              )}
                              {order.vehicleName && (
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-300">{t('orders.vehicle')}:</span>{' '}
                                  {order.vehicleName}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{order.date}</td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {needsYuklash(order.status) && !isFullyReturnedOrder(order.id) && !(statusFilter === 'cancelled' && returnedByOrderId[order.id]) && (
                            <button
                              onClick={() => handlePrint(order)}
                              className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#2563EB] dark:hover:text-blue-400 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title={t('common.print')}
                            >
                              <Printer size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#2563EB] dark:hover:text-blue-400 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={t('admin.orders.viewItems')}
                          >
                            <Eye size={14} />
                            {expandedOrderId === order.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          {needsYuklash(order.status) && !isFullyReturnedOrder(order.id) && (
                            <button
                              onClick={() => setYuklashOrder({ id: order.id })}
                              className="flex items-center gap-1 text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Truck size={12} />
                              Yuklash
                            </button>
                          )}
                          {nextStatus[order.status] && !needsYuklash(order.status) && !isFullyReturnedOrder(order.id) && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextStatus[order.status]!)}
                              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              → {statusLabels[nextStatus[order.status]!]}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                        <div className="whitespace-pre-wrap break-words">
                          {order.comment?.trim() || '-'}
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr key={`${order.id}-expand`} className="bg-gray-50/80 dark:bg-gray-800/80">
                        <td colSpan={9} className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-[#2563EB] dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('orders.items')}</span>
                          </div>
                          <div className="overflow-x-auto rounded border-2 border-gray-300 dark:border-gray-500 shadow-sm bg-gray-50 dark:bg-gray-800/80">
                            {returnedByOrderId[order.id] && returnsDetailByOrderId[order.id] ? (
                              <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed', minWidth: 520 }}>
                                <thead>
                                  <tr className="bg-[#217346] text-white">
                                    <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-10 whitespace-normal break-words leading-tight">#</th>
                                    <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 whitespace-normal break-words leading-tight">{t('admin.suppliers.productName')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-16 whitespace-normal break-words leading-tight">{t('returns.orderedQty')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-16 whitespace-normal break-words leading-tight">{t('returns.cancelledQty')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-16 whitespace-normal break-words leading-tight">{t('returns.deliveredQty')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-28 whitespace-normal break-words leading-tight">{t('admin.suppliers.salePrice')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-28 whitespace-normal break-words leading-tight">{t('returns.deliveredAmount')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-28 whitespace-normal break-words leading-tight">{t('returns.cancelledAmount')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {returnsDetailByOrderId[order.id].productBreakdown.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className={`border border-gray-300 dark:border-gray-500 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/80 dark:bg-gray-700/50'}`}
                                    >
                                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500">{idx + 1}</td>
                                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-500">{row.productName}</td>
                                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500">{row.orderedQty} {t('common.pcs')}</td>
                                      <td className="px-3 py-2 text-right text-red-700 dark:text-red-400 border border-gray-300 dark:border-gray-500">{row.cancelledQty} {t('common.pcs')}</td>
                                      <td className="px-3 py-2 text-right text-green-700 dark:text-green-400 border border-gray-300 dark:border-gray-500">{row.deliveredQty} {t('common.pcs')}</td>
                                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500">{(row.price || 0).toLocaleString('ru-RU')} {t('common.sum')}</td>
                                      <td className="px-3 py-2 text-right font-semibold text-green-700 dark:text-green-400 border border-gray-300 dark:border-gray-500">
                                        {(row.deliveredQty * (row.price || 0)).toLocaleString('ru-RU')} {t('common.sum')}
                                      </td>
                                      <td className="px-3 py-2 text-right font-semibold text-red-700 dark:text-red-400 border border-gray-300 dark:border-gray-500">
                                        {(row.cancelledQty * (row.price || 0)).toLocaleString('ru-RU')} {t('common.sum')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-gray-100 dark:bg-gray-700/40">
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500">{t('common.total')}</td>
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 text-right font-bold text-green-700 dark:text-green-400 border border-gray-300 dark:border-gray-500">
                                      {returnsDetailByOrderId[order.id].deliveredAmount.toLocaleString('ru-RU')} {t('common.sum')}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-red-700 dark:text-red-400 border border-gray-300 dark:border-gray-500">
                                      {returnsDetailByOrderId[order.id].cancelledAmount.toLocaleString('ru-RU')} {t('common.sum')}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            ) : (
                              <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed', minWidth: 380 }}>
                                <thead>
                                  <tr className="bg-[#217346] text-white">
                                    <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-10">#</th>
                                    <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500">{t('admin.suppliers.productName')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-20">{t('admin.suppliers.quantity')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-24">{t('admin.suppliers.salePrice')}</th>
                                    <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-24">{t('admin.suppliers.totalSum')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items?.map((item, idx) => (
                                    <tr
                                      key={idx}
                                      className={`border border-gray-300 dark:border-gray-500 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/80 dark:bg-gray-700/50'}`}
                                    >
                                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500">{idx + 1}</td>
                                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-500">{item.productName}</td>
                                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500">{item.quantity} {t('common.pcs')}</td>
                                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500">{(item.price || 0).toLocaleString('ru-RU')} {t('common.sum')}</td>
                                      <td className="px-3 py-2 text-right font-semibold text-[#217346] dark:text-green-400 border border-gray-300 dark:border-gray-500">
                                        {((item.quantity || 0) * (item.price || 0)).toLocaleString('ru-RU')} {t('common.sum')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-gray-100 dark:bg-gray-700/40">
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500">{t('common.total')}</td>
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-500" />
                                    <td className="px-3 py-2 text-right font-bold text-[#217346] dark:text-green-400 border border-gray-300 dark:border-gray-500">
                                      {(order.total || 0).toLocaleString('ru-RU')} {t('common.sum')}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            )}
                          </div>

                          {order.status === 'delivered' && (
                            <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    {t('payments.history')}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {t('orders.id')}: {formatOrderId(order)}
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  {getEffectiveDebt(order.id) > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-800">
                                      {t('payments.badge.debt')}: {getEffectiveDebt(order.id).toLocaleString('ru-RU')} {t('common.sum')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800">
                                      {t('payments.badge.paid')}:{' '}
                                      {(paidByOrderId[order.id] ?? 0).toLocaleString('ru-RU')} {t('common.sum')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="overflow-x-auto rounded border-2 border-gray-300 dark:border-gray-500 shadow-sm bg-gray-50 dark:bg-gray-800/80">
                                <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed', minWidth: 520 }}>
                                  <thead>
                                    <tr className="bg-[#217346] text-white">
                                      <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-28">
                                        {t('common.date')}
                                      </th>
                                      <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-28">
                                        {t('payments.method')}
                                      </th>
                                      <th className="text-left px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500">
                                        {t('payments.collectedBy')}
                                      </th>
                                      <th className="text-right px-3 py-2 font-semibold text-xs border border-gray-400 dark:border-gray-500 w-28">
                                        {t('common.sum')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {debtLoading && paymentsByOrderId[order.id] == null ? (
                                      <tr>
                                        <td className="px-3 py-2 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-500" colSpan={4}>
                                          ...
                                        </td>
                                      </tr>
                                    ) : (paymentsByOrderId[order.id] || []).length > 0 ? (
                                      paymentsByOrderId[order.id]
                                        .slice()
                                        .sort((a, b) => {
                                          const aDate = (a as any)?.date ?? (a as any)?.createdAt ?? '';
                                          const bDate = (b as any)?.date ?? (b as any)?.createdAt ?? '';
                                          return String(bDate).localeCompare(String(aDate));
                                        })
                                        .map((p, idx) => (
                                          <tr
                                            key={p.id}
                                            className={`border border-gray-300 dark:border-gray-500 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/80 dark:bg-gray-700/50'}`}
                                          >
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 whitespace-normal break-words leading-tight">
                                              {p.date
                                                || (p as any)?.createdAt
                                                || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 truncate">
                                              {t(`payments.method.${p.method}` as any)}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 truncate">
                                              {p.collectedBy?.name || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-indigo-600 dark:text-indigo-400 border border-gray-300 dark:border-gray-500">
                                              {p.amount.toLocaleString('ru-RU')}
                                            </td>
                                          </tr>
                                        ))
                                    ) : (
                                      <tr>
                                        <td className="px-3 py-2 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-500" colSpan={4}>
                                          {t('admin.suppliers.noPayments')}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  {hasFilter ? 'Bu sana uchun zakaz topilmadi' : t('orders.empty')}
                </p>
              </div>
            )}
          </div>
        </div>

        {(yuklashOrder || bulkYuklashOrderIds.length > 0) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60"
            onClick={() => {
              setYuklashOrder(null);
              setBulkYuklashOrderIds([]);
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {bulkYuklashOrderIds.length > 0 ? 'Zakazlarni yuklash' : 'Zakazni yuklash'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Qaysi mashinaga va qaysi dostavkachiga yuklansin?</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mashina {t('common.optional')}</label>
                  <select
                    value={vehicleName}
                    onChange={e => setVehicleName(e.target.value)}
                    className="crm-select w-full"
                  >
                    <option value="">Mashina tanlang</option>
                    {vehiclesList.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dostavkachi *</label>
                  <select
                    value={selectedDeliveryId}
                    onChange={e => setSelectedDeliveryId(e.target.value)}
                    className="crm-select w-full"
                  >
                    <option value="">Tanlang</option>
                    {deliveryUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => {
                    setYuklashOrder(null);
                    setBulkYuklashOrderIds([]);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={bulkYuklashOrderIds.length > 0 ? handleBulkYuklashConfirm : handleYuklashConfirm}
                  disabled={!selectedDeliveryId}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yuklash
                </button>
              </div>
            </div>
          </div>
        )}

        {acceptModal.open && acceptModal.returnId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 p-4" onClick={() => !acceptModalSaving && setAcceptModal({ open: false, returnId: null, comment: '' })}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-5" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('returns.acceptConfirmTitle')}</h3>
              <p className="text-sm text-amber-700 dark:text-amber-200 mb-4">{t('returns.acceptConfirmMessage')}</p>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('returns.comment')}</label>
                <textarea
                  value={acceptModal.comment}
                  onChange={e => setAcceptModal(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder={t('returns.commentPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => !acceptModalSaving && setAcceptModal({ open: false, returnId: null, comment: '' })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('returns.acceptConfirmNo')}
                </button>
                <button
                  type="button"
                  disabled={acceptModalSaving}
                  onClick={async () => {
                    if (!acceptModal.returnId) return;
                    setAcceptModalSaving(true);
                    try {
                      await apiAcceptReturn(acceptModal.returnId, {
                        comment: acceptModal.comment.trim() || undefined,
                        acceptedByUserId: currentUser?.id,
                      });
                      setAcceptModal({ open: false, returnId: null, comment: '' });
                      const list = await apiGetReturns({ status: 'pending' });
                      setPendingReturns(list || []);
                      setRefreshReturnsDetailTrigger(prev => prev + 1);
                      refetchData?.();
                    } catch (e) {
                      // ignore
                    } finally {
                      setAcceptModalSaving(false);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptModalSaving ? '...' : t('returns.acceptConfirmYes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Returns modal */}
        {retOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 p-4" onClick={closeReturn}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{t('returns.title')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('returns.onlyOrderedClients')}</div>
                </div>
                <button onClick={closeReturn} className="w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                  <X size={18} className="text-gray-500 dark:text-gray-300" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {(retError || retSaved) && (
                  <div className={`rounded-2xl border p-4 text-sm ${
                    retError
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300'
                  }`}>
                    {retError || t('returns.saved')}
                  </div>
                )}

                {/* Client select */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('returns.selectClient')}
                  </div>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={retClientSearch}
                      onChange={e => setRetClientSearch(e.target.value)}
                      placeholder={t('returns.searchClient')}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="mt-2 max-h-44 overflow-auto rounded-2xl border border-gray-100 dark:border-gray-700">
                    {retClientOptions.map(c => (
                      <button
                        key={c.clientId}
                        onClick={() => { setRetClientId(c.clientId); setRetOrderId(''); setRetError(''); setRetSaved(false); }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                          retClientId === c.clientId ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</div>
                      </button>
                    ))}
                    {retClientOptions.length === 0 && (
                      <div className="px-4 py-4 text-sm text-gray-400 dark:text-gray-500">
                        {t('admin.clients.notFound')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order select */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('returns.selectOrder')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {retOrdersForClient.map(o => (
                      <button
                        key={o.id}
                        onClick={() => { setRetOrderId(o.id); setRetSaved(false); setRetError(''); loadReturnRemaining(o.id); }}
                        className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                          retOrderId === o.id
                            ? 'border-blue-200 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/10'
                            : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                        }`}
                      >
                        <div className="text-xs text-gray-500 dark:text-gray-400">{o.date}</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatOrderId(o)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{(o.items?.length || 0)} {t('common.pcs')}</div>
                      </button>
                    ))}
                    {retClientId && retOrdersForClient.length === 0 && (
                      <div className="text-sm text-gray-400 dark:text-gray-500">{t('orders.empty')}</div>
                    )}
                  </div>
                </div>

                {/* Items */}
                {selectedRetOrder && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {t('returns.selectItems')}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSel: Record<string, boolean> = {};
                          const nextQty: Record<string, string> = {};
                          for (const it of selectedRetOrder.items || []) {
                            const rem = retRemainingByProduct[it.productId] ?? Number(it.quantity || 0);
                            if (rem > 0) {
                              nextSel[it.productId] = true;
                              nextQty[it.productId] = String(rem);
                            }
                          }
                          setRetSelectByProduct(nextSel);
                          setRetQtyByProduct(nextQty);
                        }}
                        className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline"
                      >
                        {t('returns.returnAll')}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                      {(selectedRetOrder.items || []).map((it, idx) => {
                        const rem = retRemainingByProduct[it.productId] ?? Number(it.quantity || 0);
                        const checked = !!retSelectByProduct[it.productId];
                        const qtyStr = retQtyByProduct[it.productId] ?? '';
                        return (
                          <div key={`${it.productId}-${idx}`} className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={retLoading || rem <= 0}
                              onChange={() => {
                                setRetSelectByProduct(prev => ({ ...prev, [it.productId]: !prev[it.productId] }));
                                setRetQtyByProduct(prev => ({ ...prev, [it.productId]: prev[it.productId] ?? (rem > 0 ? '1' : '') }));
                              }}
                              className="w-4 h-4 accent-[#2563EB]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{it.productName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {t('returns.remaining')}: {rem}
                              </div>
                            </div>
                            <div className="w-28">
                              <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{t('returns.quantity')}</div>
                              <input
                                type="number"
                                min={1}
                                max={rem}
                                value={qtyStr}
                                disabled={!checked || retLoading || rem <= 0}
                                onChange={e => setRetQtyByProduct(prev => ({ ...prev, [it.productId]: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={closeReturn}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={async () => {
                    setRetError('');
                    setRetSaved(false);
                    if (!retOrderId) { setRetError(t('returns.error.noOrder')); return; }
                    const order = adminVisibleOrders.find(o => o.id === retOrderId);
                    if (!order) { setRetError(t('returns.error.noOrder')); return; }
                    const items = (order.items || [])
                      .filter(it => retSelectByProduct[it.productId])
                      .map(it => {
                        const rem = retRemainingByProduct[it.productId] ?? Number(it.quantity || 0);
                        const raw = Number(String(retQtyByProduct[it.productId] ?? '').replace(/\D/g, ''));
                        const qty = Math.max(0, Math.min(rem, raw));
                        return qty > 0 ? { productId: it.productId, productName: it.productName, quantity: qty } : null;
                      })
                      .filter(Boolean) as Array<{ productId: string; productName?: string; quantity: number }>;

                    if (!items.length) { setRetError(t('returns.error.noItems')); return; }
                    if (!currentUser?.id) { setRetError('User not found'); return; }

                    setRetLoading(true);
                    try {
                      const today = new Date().toISOString().slice(0, 10);
                      await apiCreateReturn({
                        clientId: retClientId,
                        orderId: retOrderId,
                        date: today,
                        createdByUserId: currentUser.id,
                        status: 'accepted',
                        items,
                      });
                      setReturnedByOrderId(prev => ({ ...prev, [retOrderId]: true }));
                      setRetSaved(true);
                      await refetchData?.();
                      await loadReturnRemaining(retOrderId);
                      setTimeout(() => setRetSaved(false), 1800);
                    } catch (e: any) {
                      setRetError(e?.message || 'Xatolik');
                    } finally {
                      setRetLoading(false);
                    }
                  }}
                  disabled={retLoading || !retClientId}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {retLoading ? '...' : t('returns.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
