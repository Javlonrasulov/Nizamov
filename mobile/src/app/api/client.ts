// Web brauzerda localhost bo'lsa backend ham lokal bo'ladi.
// Lekin Capacitor (APK) ichida app URL ko'pincha "http://localhost" (yoki "capacitor://localhost") bo'ladi,
// u holda ham API alohida serverda bo'ladi — shuning uchun VITE_API_URL ishlatamiz.
const isCapacitor = typeof window !== 'undefined'
  && (window.location.protocol === 'capacitor:' || !!(window as any).Capacitor);
const isBrowserLocalhost = !isCapacitor
  && typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = isBrowserLocalhost ? 'http://localhost:3000' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'API xatosi');
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}
