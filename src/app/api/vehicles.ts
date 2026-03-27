import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type Vehicle = { id: string; name: string; sortOrder: number };

export async function apiGetVehicles(): Promise<Vehicle[]> {
  return apiGet<Vehicle[]>('/vehicles');
}

export async function apiCreateVehicle(name: string): Promise<Vehicle> {
  return apiPost<Vehicle>('/vehicles', { name: name.trim() });
}

export async function apiUpdateVehicle(id: string, name: string): Promise<Vehicle> {
  return apiPatch<Vehicle>(`/vehicles/${id}`, { name: name.trim() });
}

export async function apiDeleteVehicle(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/vehicles/${id}`);
}
