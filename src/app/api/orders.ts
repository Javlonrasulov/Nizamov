import { apiGet, apiPost, apiPut } from './client';
import type { Order } from '../data/mockData';

export async function apiGetOrders(params?: { agentId?: string; deliveryId?: string; dateFrom?: string; dateTo?: string }): Promise<Order[]> {
  const sp = new URLSearchParams();
  if (params?.agentId) sp.set('agentId', params.agentId);
  if (params?.deliveryId) sp.set('deliveryId', params.deliveryId);
  if (params?.dateFrom) sp.set('dateFrom', params.dateFrom);
  if (params?.dateTo) sp.set('dateTo', params.dateTo);
  const q = sp.toString() ? `?${sp}` : '';
  return apiGet<Order[]>(`/orders${q}`);
}

export async function apiCreateOrder(data: Omit<Order, 'id'>): Promise<Order> {
  return apiPost<Order>('/orders', data);
}

export async function apiUpdateOrder(id: string, data: Partial<Pick<Order, 'status' | 'deliveryId' | 'deliveryName' | 'vehicleName'>>): Promise<Order> {
  return apiPut<Order>(`/orders/${id}`, data);
}

export async function apiApplyOrderPromoPrices(
  orderId: string,
  items: { id: string; promoPrice: number | null }[],
): Promise<Order> {
  return apiPut<Order>(`/orders/${orderId}/promo-prices`, { items });
}
