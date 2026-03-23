import { apiGet, apiPost, apiPut } from './client';
import type { Product } from '../data/mockData';

export async function apiGetProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products');
}

export async function apiCreateProduct(data: Omit<Product, 'id'>): Promise<Product> {
  return apiPost<Product>('/products', data);
}

export async function apiUpdateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<Product> {
  return apiPut<Product>(`/products/${id}`, data);
}
