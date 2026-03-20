import { apiGet, apiPost } from './client';

export type ReturnStatus = 'pending' | 'accepted';

export interface ReturnItem {
  productId: string;
  productName?: string;
  quantity: number;
}

export interface ReturnRecord {
  id: string;
  clientId: string;
  orderId: string;
  date: string;
  status: ReturnStatus;
  comment?: string | null;
  createdBy?: { id: string; name: string; phone?: string; role?: string } | null;
  acceptedBy?: { id: string; name: string; phone?: string; role?: string } | null;
  items: ReturnItem[];
}

export async function apiCreateReturn(payload: {
  clientId: string;
  orderId: string;
  date: string;
  createdByUserId: string;
  status?: ReturnStatus;
  items: Array<{ productId: string; productName?: string; quantity: number }>;
}) {
  return apiPost<{ id: string }>('/returns', payload);
}

export async function apiGetReturns(payload: {
  clientId?: string;
  orderId?: string;
  status?: ReturnStatus;
}): Promise<ReturnRecord[]> {
  const qs = new URLSearchParams();
  if (payload.clientId) qs.set('clientId', payload.clientId);
  if (payload.orderId) qs.set('orderId', payload.orderId);
  if (payload.status) qs.set('status', payload.status);

  const query = qs.toString();
  const path = `/returns${query ? `?${query}` : ''}`;
  return apiGet<ReturnRecord[]>(path);
}
