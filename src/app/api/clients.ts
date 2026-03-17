import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Client } from '../data/mockData';

export async function apiGetClients(agentId?: string): Promise<Client[]> {
  const q = agentId ? `?agentId=${encodeURIComponent(agentId)}` : '';
  return apiGet<Client[]>(`/clients${q}`);
}

export async function apiCreateClient(data: Omit<Client, 'id'>): Promise<Client> {
  const body = { ...data, visitDays: data.visitDays ?? [] };
  return apiPost<Client>('/clients', body);
}

export async function apiUpdateClient(id: string, data: Partial<Omit<Client, 'id'>>): Promise<Client> {
  return apiPut<Client>(`/clients/${id}`, data);
}

export async function apiDeleteClient(id: string): Promise<void> {
  return apiDelete<void>(`/clients/${id}`);
}
