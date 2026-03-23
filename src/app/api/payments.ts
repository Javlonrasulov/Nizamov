import { apiGet, apiPost } from './client';

export type PaymentMethod = 'cash' | 'terminal' | 'transfer';

export interface PaymentCollector {
  id: string;
  name: string;
  phone: string;
  role: string;
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
  collectedBy?: PaymentCollector;
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

