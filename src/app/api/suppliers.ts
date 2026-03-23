import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type SupplierPaymentType = 'cash' | 'card' | 'bank';

export interface SupplierListItem {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  totalReceived: number;
  totalPaid: number;
  remainingDebt: number;
  lastDeliveryAt: string | null;
  lastPaymentAt: string | null;
}

export interface SupplierStockInItem {
  id: string;
  stockInId: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  salePrice?: number | null;
  total: number;
}

export interface SupplierStockIn {
  id: string;
  supplierId: string;
  date: string;
  total: number;
  comment?: string | null;
  createdAt: string;
  items: SupplierStockInItem[];
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  type: SupplierPaymentType;
  comment?: string | null;
  createdAt: string;
}

export interface SupplierDetail {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  stockIns: SupplierStockIn[];
  payments: SupplierPayment[];
  totals: {
    totalReceived: number;
    totalPaid: number;
    remainingDebt: number;
  };
}

export async function apiGetSuppliers(): Promise<SupplierListItem[]> {
  return apiGet<SupplierListItem[]>('/suppliers');
}

export async function apiCreateSupplier(data: { name: string; phone?: string; address?: string; comment?: string }) {
  return apiPost<SupplierDetail>('/suppliers', data);
}

export async function apiUpdateSupplier(id: string, data: { name?: string; phone?: string; address?: string; comment?: string }) {
  return apiPatch<SupplierDetail>(`/suppliers/${id}`, data);
}

export async function apiDeleteSupplier(id: string) {
  return apiDelete<{ id: string }>(`/suppliers/${id}`);
}

export async function apiGetSupplier(id: string): Promise<SupplierDetail> {
  return apiGet<SupplierDetail>(`/suppliers/${id}`);
}

export async function apiAddSupplierPayment(
  supplierId: string,
  data: { date: string; amount: number; type: SupplierPaymentType; comment?: string },
) {
  return apiPost<SupplierPayment>(`/suppliers/${supplierId}/payments`, data);
}

export async function apiAddSupplierStockIn(
  supplierId: string,
  data: { date: string; comment?: string; items: { productId: string; quantity: number; costPrice: number; salePrice?: number }[] },
) {
  return apiPost<SupplierStockIn>(`/suppliers/${supplierId}/stock-ins`, data);
}

