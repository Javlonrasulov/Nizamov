import { apiGet, apiPost, apiPut } from './client';
import type { Order } from '../data/mockData';

export async function apiGetOrders(params?: { agentId?: string; deliveryId?: string }): Promise<Order[]> {
  const sp = new URLSearchParams();
  if (params?.agentId) sp.set('agentId', params.agentId);
  if (params?.deliveryId) sp.set('deliveryId', params.deliveryId);
  const q = sp.toString() ? `?${sp}` : '';
  return apiGet<Order[]>(`/orders${q}`);
}

export async function apiCreateOrder(data: Omit<Order, 'id'>): Promise<Order> {
  return apiPost<Order>('/orders', data);
}

export async function apiUpdateOrder(
  id: string,
  data: {
    status?: Order['status'];
    deliveryId?: string;
    deliveryName?: string;
    vehicleName?: string;
    total?: number;
    items?: Order['items'];
    comment?: string;
  }
): Promise<Order> {
  return apiPut<Order>(`/orders/${id}`, data);
}
