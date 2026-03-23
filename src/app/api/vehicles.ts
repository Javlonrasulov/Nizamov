import { apiGet, apiPost } from './client';

export type Vehicle = { id: string; name: string; sortOrder: number };

export async function apiGetVehicles(): Promise<Vehicle[]> {
  return apiGet<Vehicle[]>('/vehicles');
}

export async function apiCreateVehicle(name: string): Promise<Vehicle> {
  return apiPost<Vehicle>('/vehicles', { name: name.trim() });
}
