import { apiDelete, apiGet, apiPost, apiPatch } from './client';
import type { User } from '../data/mockData';

export async function apiGetUsers(role?: string): Promise<Omit<User, 'password'>[]> {
  const q = role ? `?role=${encodeURIComponent(role)}` : '';
  const rows = await apiGet<Array<User & { password?: string }>>(`/users${q}`);
  return rows.map(({ password, ...u }) => u);
}

export async function apiCreateUser(data: { name: string; phone: string; password: string; role: 'agent' | 'delivery' | 'sklad'; vehicleName?: string; comment?: string }): Promise<Omit<User, 'password'>> {
  return apiPost<Omit<User, 'password'>>('/users', data);
}

export async function apiUpdateUser(id: string, data: Partial<{ name: string; phone: string; password: string; role: string; vehicleName: string; comment: string }>): Promise<Omit<User, 'password'>> {
  return apiPatch<Omit<User, 'password'>>(`/users/${id}`, data);
}

export async function apiDeleteUser(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/users/${id}`);
}
