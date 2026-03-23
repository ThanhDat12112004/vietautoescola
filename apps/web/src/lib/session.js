export function getStoredAuth() {
  if (typeof window === 'undefined') {
    return { token: '', user: null };
  }

  const token = window.localStorage.getItem('token') || '';
  const userText = window.localStorage.getItem('user');
  const user = userText ? JSON.parse(userText) : null;
  return { token, user };
}

export function saveAuth(token, user) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('token', token);
  window.localStorage.setItem('user', JSON.stringify(user));
}

export function getOrCreateDeviceId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const key = 'device_id';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const generated = window.crypto?.randomUUID
    ? window.crypto.randomUUID().replace(/-/g, '')
    : `${Date.now()}${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(key, generated);
  return generated;
}

export function clearAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
}

export function getStoredLang() {
  if (typeof window === 'undefined') {
    return 'es';
  }

  return window.localStorage.getItem('lang') || 'es';
}

export function saveLang(lang) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('lang', lang);
}
