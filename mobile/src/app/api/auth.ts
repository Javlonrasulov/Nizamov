import { apiPost } from './client';
import type { User } from '../data/mockData';

export async function apiLogin(phone: string, password: string, role: string): Promise<Omit<User, 'password'>> {
  return apiPost<Omit<User, 'password'>>('/auth/login', { phone, password, role });
}
