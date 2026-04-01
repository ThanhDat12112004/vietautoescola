import { clearAuth, getStoredAuth } from '@/lib/auth';

export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiCacheOptions = {
  ttlMs?: number;
  skip?: boolean;
};

export type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  auth?: boolean | 'optional';
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: ApiCacheOptions;
};

type ApiErrorPayload = {
  message?: string;
};

export const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const MAX_API_CACHE_ENTRIES = 300;

type CachedApiResponse = {
  data: unknown;
  expiresAt: number;
};

const apiGetResponseCache = new Map<string, CachedApiResponse>();
const apiInFlightGetRequests = new Map<string, Promise<unknown>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const value = payload.message;
  return typeof value === 'string' && value.trim() ? value : null;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

function shouldBypassNgrokWarning() {
  if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok-free.app')) {
    return true;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return baseUrl.includes('ngrok-free.app');
}

export function withNgrokHeaders(headers: Record<string, string>) {
  if (shouldBypassNgrokWarning()) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

function normalizePayload(rawText: string): unknown {
  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch {
    return { message: rawText } as ApiErrorPayload;
  }
}

function inferDefaultCacheTtlMs(path: string): number {
  if (!path) return 0;

  if (path.includes('/cache-api/public')) {
    if (path.includes('resource=leaderboard')) return 15_000;
    if (path.includes('resource=summary')) return 30_000;
    return 60_000;
  }

  if (path.includes('/stats/leaderboard')) return 15_000;
  if (path.includes('/stats/summary')) return 30_000;

  if (
    path.includes('/api/quizzes') ||
    path.includes('/api/categories') ||
    path.includes('/api/types') ||
    path.includes('/materials-api/subjects')
  ) {
    return 60_000;
  }

  return 0;
}

function buildCacheScope(authMode: ApiRequestOptions['auth'], token: string | null): string {
  if (!authMode) return 'anon';
  if (!token) return authMode === true ? 'required-no-token' : 'optional-anon';
  return `token:${token.slice(0, 24)}`;
}

function setCachedResponse(cacheKey: string, data: unknown, ttlMs: number) {
  if (ttlMs <= 0) return;

  if (apiGetResponseCache.size >= MAX_API_CACHE_ENTRIES) {
    const firstKey = apiGetResponseCache.keys().next().value;
    if (firstKey) apiGetResponseCache.delete(firstKey);
  }

  apiGetResponseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function readCachedResponse(cacheKey: string): unknown | null {
  const entry = apiGetResponseCache.get(cacheKey);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    apiGetResponseCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

function invalidateApiGetCache() {
  apiGetResponseCache.clear();
}

export async function parseUploadError(response: Response, fallbackMessage: string): Promise<never> {
  const rawText = await response.text();
  const payload = normalizePayload(rawText);
  const message = readMessage(payload) || fallbackMessage;
  throw new Error(`${message} (${response.status})`);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase() as ApiMethod;
  const storedAuth = getStoredAuth();
  const authToken = storedAuth?.token || null;

  const headers = withNgrokHeaders({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  if (options.auth === true) {
    if (!authToken) {
      throw new Error('Vui long dang nhap');
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (options.auth === 'optional') {
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }

  const cacheTtlMs = options.cache?.skip
    ? 0
    : (options.cache?.ttlMs ?? inferDefaultCacheTtlMs(path));
  const shouldCacheGet = method === 'GET' && !options.signal && cacheTtlMs > 0;
  const cacheKey = shouldCacheGet
    ? `${method}:${path}|scope=${buildCacheScope(options.auth, authToken)}`
    : '';

  if (shouldCacheGet) {
    const cached = readCachedResponse(cacheKey);
    if (cached != null) {
      return cached as T;
    }

    const inFlight = apiInFlightGetRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const execute = async (): Promise<T> => {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: options.body == null ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });

    const rawText = await response.text();
    const payload = normalizePayload(rawText);

    if (!response.ok) {
      if (response.status === 401 && (options.auth === true || options.auth === 'optional')) {
        const reason = readMessage(payload) || '';
        clearAuth();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-updated'));
          window.dispatchEvent(
            new CustomEvent('auth-session-ended', {
              detail: { reason },
            })
          );
        }
      }

      throw new Error(readMessage(payload) || `Request failed (${response.status})`);
    }

    if (method !== 'GET') {
      invalidateApiGetCache();
    }

    if (shouldCacheGet) {
      setCachedResponse(cacheKey, payload, cacheTtlMs);
    }

    return payload as T;
  };

  if (!shouldCacheGet) {
    return execute();
  }

  const requestPromise = execute();
  apiInFlightGetRequests.set(cacheKey, requestPromise as Promise<unknown>);

  try {
    return await requestPromise;
  } finally {
    apiInFlightGetRequests.delete(cacheKey);
  }
}
