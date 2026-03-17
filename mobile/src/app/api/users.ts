import { apiGet } from './client';
import type { User } from '../data/mockData';

export async function apiGetUsers(role?: string): Promise<Omit<User, 'password'>[]> {
  const q = role ? `?role=${encodeURIComponent(role)}` : '';
  const rows = await apiGet<Array<User & { password?: string }>>(`/users${q}`);
  return rows.map(({ password, ...u }) => u);
}
