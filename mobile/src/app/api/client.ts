// Web brauzerda localhost bo'lsa backend ham lokal bo'ladi.
// Lekin Capacitor (APK) ichida app URL ko'pincha "http://localhost" (yoki "capacitor://localhost") bo'ladi,
// u holda ham API alohida serverda bo'ladi — shuning uchun VITE_API_URL ishlatamiz.
const isCapacitor = typeof window !== 'undefined'
  && (window.location.protocol === 'capacitor:' || !!(window as any).Capacitor);
const isBrowserLocalhost = !isCapacitor
  && typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const ENV_API_BASE = import.meta.env.VITE_API_URL || '';
const DEFAULT_LOCAL_API = 'http://localhost:3000';

function normalizeBase(base: string): string {
  return base.replace(/\/+$/, '');
}

function getApiCandidates(): string[] {
  if (isBrowserLocalhost) return [DEFAULT_LOCAL_API];

  const candidates: string[] = [];
  if (ENV_API_BASE) candidates.push(normalizeBase(ENV_API_BASE));

  // Fallbacks for mobile networks where direct IPv4 IP may fail (IPv6-only).
  // Prefer domain if it exists; keep original env first.
  if (!candidates.some(c => c.includes('api.sainur.uz'))) {
    candidates.push('https://api.sainur.uz');
    candidates.push('http://api.sainur.uz');
  }

  if (candidates.length === 0) candidates.push(DEFAULT_LOCAL_API);
  return Array.from(new Set(candidates));
}

let resolvedApiBase: string | null = null;
let resolvingApiBase: Promise<string> | null = null;

async function resolveApiBase(): Promise<string> {
  if (resolvedApiBase) return resolvedApiBase;
  if (resolvingApiBase) return resolvingApiBase;

  const candidates = getApiCandidates();
  resolvingApiBase = (async () => {
    for (const base of candidates) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(`${base}/health`, { method: 'GET', signal: controller.signal });
        if (res.ok) {
          resolvedApiBase = base;
          return base;
        }
      } catch {
        // ignore, try next candidate
      } finally {
        clearTimeout(timeout);
      }
    }

    resolvedApiBase = candidates[0] ?? DEFAULT_LOCAL_API;
    return resolvedApiBase;
  })();

  return resolvingApiBase;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const base = await resolveApiBase();
  const res = await fetch(`${base}${path}`, {
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
