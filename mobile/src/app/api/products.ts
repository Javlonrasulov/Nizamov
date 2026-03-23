import { apiGet, apiPost } from './client';
import type { Product } from '../data/mockData';

export async function apiGetProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products');
}

export async function apiCreateProduct(data: Omit<Product, 'id'>): Promise<Product> {
  return apiPost<Product>('/products', data);
}
