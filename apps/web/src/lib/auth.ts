export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role?: string;
};

const AUTH_STORAGE_KEY = 'viet-acosla-auth';
const DEVICE_STORAGE_KEY = 'viet-acosla-device-id';

type StoredAuth = {
  token: string;
  user: AuthUser;
};

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

export function saveAuth(token: string, user: AuthUser) {
  if (!isBrowser()) {
    return;
  }

  const payload: StoredAuth = { token, user };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearAuth() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getOrCreateDeviceId() {
  if (!isBrowser()) {
    return 'server-device';
  }

  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing && existing.length >= 8) {
    return existing;
  }

  const random = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  const deviceId = `${random}${timestamp}`.slice(0, 48);

  window.localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  return deviceId;
}
