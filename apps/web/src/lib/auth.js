import { apiFetch } from './api';
import { clearAuth } from './session';

export async function logoutWithToken(token) {
  if (!token) {
    clearAuth();
    return;
  }

  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (_error) {
    // Ignore logout error when token expired.
  } finally {
    clearAuth();
  }
}
