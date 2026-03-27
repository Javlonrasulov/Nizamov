// Web brauzerda localhost bo'lsa backend ham lokal bo'ladi.
// Lekin Capacitor (APK) ichida app URL ko'pincha "http://localhost" (yoki "capacitor://localhost") bo'ladi,
// u holda ham API alohida serverda bo'ladi — shuning uchun VITE_API_URL ishlatamiz.
const isCapacitor = typeof window !== 'undefined'
  && (window.location.protocol === 'capacitor:' || !!(window as any).Capacitor);
const isProdBuild = import.meta.env.PROD;
const isBrowserLocalhost = !isCapacitor
  && typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const ENV_API_BASE = import.meta.env.VITE_API_URL || '';
const STRICT_API_BASE = import.meta.env.VITE_STRICT_API === 'true';
const ENV_API_FALLBACKS = import.meta.env.VITE_API_FALLBACKS || '';
const DEFAULT_LOCAL_API = 'http://localhost:3000';
const DEFAULT_PROD_API = 'https://api.sainur.uz';

function normalizeBase(base: string): string {
  return base.replace(/\/+$/, '');
}

function getApiCandidates(): string[] {
  if (isBrowserLocalhost) return [DEFAULT_LOCAL_API];

  const candidates: string[] = [];
  if (ENV_API_BASE) candidates.push(normalizeBase(ENV_API_BASE));

  if (ENV_API_FALLBACKS) {
    for (const item of ENV_API_FALLBACKS.split(',')) {
      const trimmed = item.trim();
      if (trimmed) candidates.push(normalizeBase(trimmed));
    }
  }

  if (candidates.length === 0) {
    candidates.push(isProdBuild ? DEFAULT_PROD_API : DEFAULT_LOCAL_API);
  } else if (!STRICT_API_BASE && isProdBuild) {
    // Prod buildda env noto'g'ri bo'lsa ham ishonchli prod API ga qaytish imkonini qoldiramiz.
    candidates.push(DEFAULT_PROD_API);
  }

  if (STRICT_API_BASE && candidates.length > 0) {
    return Array.from(new Set(candidates));
  }

  return Array.from(new Set(candidates));
}

export function getApiHealthcheckUrls(): string[] {
  return getApiCandidates().map(base => `${base}/health`);
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
