import { apiGet, apiPatch, apiPost } from './client';

export interface ReturnItem {
  id: string;
  returnId: string;
  productId: string;
  productName: string;
  quantity: number;
}

export interface ReturnCreator {
  id: string;
  name: string;
  phone: string;
  role: string;
}
export interface ReturnAcceptedBy {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface ReturnOrder {
  id: string;
  orderNumber?: number;
  date: string;
  clientName: string;
  clientPhone: string;
  agentName?: string;
}

export interface Return {
  id: string;
  clientId: string;
  orderId: string;
  date: string;
  createdByUserId: string;
  createdAt: string;
  status?: 'pending' | 'accepted';
  acceptedByUserId?: string | null;
  acceptedAt?: string | null;
  comment?: string | null;
  items: ReturnItem[];
  createdBy?: ReturnCreator;
  acceptedBy?: ReturnAcceptedBy | null;
  order?: ReturnOrder;
}

export async function apiCreateReturn(payload: {
  clientId: string;
  orderId: string;
  date: string;
  createdByUserId: string;
  status?: 'pending' | 'accepted';
  items: Array<{ productId: string; productName?: string; quantity: number }>;
}): Promise<Return> {
  return apiPost<Return>('/returns', payload);
}

export async function apiGetReturns(query?: { clientId?: string; orderId?: string; status?: 'pending' | 'accepted' }): Promise<Return[]> {
  const qs = new URLSearchParams();
  if (query?.clientId) qs.set('clientId', query.clientId);
  if (query?.orderId) qs.set('orderId', query.orderId);
  if (query?.status) qs.set('status', query.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<Return[]>(`/returns${suffix}`);
}

export async function apiAcceptReturn(id: string, body?: { comment?: string; acceptedByUserId?: string }): Promise<Return> {
  return apiPatch<Return>(`/returns/${id}/accept`, body ?? {});
}

