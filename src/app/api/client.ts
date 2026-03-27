// Brauzerda localhost bo'lsa backend ham lokal bo'ladi.
// Productionda esa VITE_API_URL bo'lmasa api.sainur.uz ga fallback qilamiz.
const isBrowserLocalhost =
  typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function resolveApiBase(): string {
  if (isBrowserLocalhost) return 'http://localhost:3000';
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env) return env.replace(/\/+$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host === 'dev.sainur.uz' || host.endsWith('.dev.sainur.uz')) {
      // Backend dev.sainur.uz ostida /api (api.dev.sainur.uz alohida yo'q).
      return 'https://dev.sainur.uz/api';
    }
    if (host.endsWith('sainur.uz')) return 'https://api.sainur.uz';
  }

  // Last resort (avoids breaking builds), but should be overridden via VITE_API_URL.
  return 'http://localhost:3000';
}

const API_BASE = resolveApiBase();

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

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export { API_BASE };
