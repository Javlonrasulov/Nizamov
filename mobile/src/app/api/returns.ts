import { apiPost } from './client';

export async function apiCreateReturn(payload: {
  clientId: string;
  orderId: string;
  date: string;
  createdByUserId: string;
  status?: 'pending' | 'accepted';
  items: Array<{ productId: string; productName?: string; quantity: number }>;
}) {
  return apiPost<{ id: string }>('/returns', payload);
}
