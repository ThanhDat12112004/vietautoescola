import { apiFetch } from './client';

export function getAdminUsers(token) {
  return apiFetch('/auth/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAdminUser(payload, token) {
  return apiFetch('/auth/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function updateAdminUser(userId, payload, token) {
  return apiFetch(`/auth/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminUser(userId, token) {
  return apiFetch(`/auth/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function lockAdminUser(userId, token) {
  return apiFetch(`/auth/admin/users/${userId}/lock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function unlockAdminUser(userId, token) {
  return apiFetch(`/auth/admin/users/${userId}/unlock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAdminQuizzes(token) {
  return apiFetch('/api/admin/quizzes', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateAdminQuiz(quizId, payload, token) {
  return apiFetch(`/api/admin/quizzes/${quizId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminQuiz(quizId, token) {
  return apiFetch(`/api/admin/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateAdminMaterial(materialId, payload, token, lang) {
  return apiFetch(`/materials/materials/${materialId}`, {
    method: 'PATCH',
    lang,
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminMaterial(materialId, token, lang) {
  return apiFetch(`/materials/materials/${materialId}`, {
    method: 'DELETE',
    lang,
    headers: { Authorization: `Bearer ${token}` },
  });
}
