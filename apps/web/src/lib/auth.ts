export type AuthUser = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  role?: string;
  avatar_url?: string | null;
};

const AUTH_STORAGE_KEY = 'viet-acosla-auth';

type StoredAuth = {
  token: string;
  user: AuthUser;
};

function decodeJwtPayload(token: string): Record<string, any> | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredAuth(): StoredAuth | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getTokenRemainingDays(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const expSeconds = Number(payload?.exp || 0);
  if (!Number.isFinite(expSeconds) || expSeconds <= 0) return null;

  const remainingMs = expSeconds * 1000 - Date.now();
  if (remainingMs <= 0) return 0;

  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}

export function saveAuth(token: string, user: AuthUser) {
  if (!isBrowser()) {
    return;
  }

  const payload: StoredAuth = { token, user };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function updateStoredAuthUser(nextUserFields: Partial<AuthUser>) {
  if (!isBrowser()) {
    return;
  }

  const current = getStoredAuth();
  if (!current?.token || !current.user) {
    return;
  }

  const payload: StoredAuth = {
    token: current.token,
    user: {
      ...current.user,
      ...nextUserFields,
    },
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('auth-updated'));
}

export function clearAuth() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
