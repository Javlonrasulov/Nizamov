import { apiPost } from './client';
import type { User } from '../data/mockData';

export interface LoginBody {
  phone: string;
  password: string;
}

export async function apiLogin(body: LoginBody): Promise<Omit<User, 'password'>> {
  return apiPost<Omit<User, 'password'>>('/auth/login', body);
}
