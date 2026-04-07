import { apiGet, apiPost } from './client';

export type PaymentMethod = 'cash' | 'terminal' | 'transfer';

export interface PaymentCollector {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface PaymentClientInfo {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface PaymentOrderInfo {
  id: string;
  orderNumber?: number | null;
  date?: string;
  clientName?: string;
}

export interface Payment {
  id: string;
  clientId: string;
  orderId?: string | null;
  amount: number;
  method: PaymentMethod;
  date: string;
  collectedByUserId: string;
  comment?: string | null;
  createdAt: string;
  receivedBySkladUserId?: string | null;
  receivedBySkladAt?: string | null;
  receivedByAdminUserId?: string | null;
  receivedByAdminAt?: string | null;
  client?: PaymentClientInfo;
  order?: PaymentOrderInfo | null;
  collectedBy?: PaymentCollector;
  receivedBySklad?: PaymentCollector | null;
  receivedByAdmin?: PaymentCollector | null;
}

export interface ClientBalanceOrderRow {
  orderId: string;
  orderNumber: number | null;
  date: string;
  total: number;
  paid: number;
  debt: number;
  deliveryId?: string | null;
  deliveryName?: string | null;
}

export interface ClientBalance {
  clientId: string;
  deliveredTotal: number;
  paidTotal: number;
  debt: number;
  perOrder: ClientBalanceOrderRow[];
  payments: Payment[];
}

export interface CashboxSummary {
  pendingSkladTotal: number;
  skladCashTotal: number;
  adminCashTotal: number;
}

export interface CollectorHandoverSummaryRow {
  collectedByUserId: string;
  collectedBy: PaymentCollector | null;
  paymentsCount: number;
  clientsCount: number;
  cashTotal: number;
  cashMethodTotal: number;
  terminalTotal: number;
  transferTotal: number;
  debtTotal: number;
}

export interface AcceptPaymentsResult {
  count: number;
}

export async function apiCreatePayment(payload: {
  clientId: string;
  orderId?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  collectedByUserId: string;
  comment?: string;
}): Promise<Payment> {
  return apiPost<Payment>('/payments', payload);
}

export async function apiGetClientBalance(clientId: string): Promise<ClientBalance> {
  return apiGet<ClientBalance>(`/clients/${clientId}/balance`);
}

export async function apiGetPayments(params?: { clientId?: string; dateFrom?: string; dateTo?: string }): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params?.clientId) query.set('clientId', params.clientId);
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGet<Payment[]>(`/payments${suffix}`);
}

export async function apiGetSkladHandoverQueue(params?: { dateFrom?: string; dateTo?: string }): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGet<Payment[]>(`/payments/handover/sklad${suffix}`);
}

export async function apiGetAdminHandoverQueue(params?: { dateFrom?: string; dateTo?: string }): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params?.dateTo) query.set('dateTo', params.dateTo);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGet<Payment[]>(`/payments/handover/admin${suffix}`);
}

export async function apiGetCashboxSummary(): Promise<CashboxSummary> {
  return apiGet<CashboxSummary>('/payments/cashbox-summary');
}

export async function apiGetCollectorHandoverSummary(params: { mode: 'sklad' | 'admin'; dateFrom?: string; dateTo?: string }): Promise<CollectorHandoverSummaryRow[]> {
  const query = new URLSearchParams();
  query.set('mode', params.mode);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  return apiGet<CollectorHandoverSummaryRow[]>(`/payments/handover/collector-summary?${query.toString()}`);
}

export async function apiAcceptPaymentBySklad(id: string, userId: string): Promise<Payment> {
  return apiPost<Payment>(`/payments/${id}/accept-sklad`, { userId });
}

export async function apiAcceptPaymentByAdmin(id: string, userId: string): Promise<Payment> {
  return apiPost<Payment>(`/payments/${id}/accept-admin`, { userId });
}

export async function apiAcceptPaymentsBySklad(ids: string[], userId: string): Promise<AcceptPaymentsResult> {
  return apiPost<AcceptPaymentsResult>('/payments/accept-sklad/bulk', { ids, userId });
}

export async function apiAcceptPaymentsByAdmin(ids: string[], userId: string): Promise<AcceptPaymentsResult> {
  return apiPost<AcceptPaymentsResult>('/payments/accept-admin/bulk', { ids, userId });
}

