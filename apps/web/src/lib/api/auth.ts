import type { AuthUser } from '@/lib/auth';
import { apiRequest } from './client';
import type { LoginResponse } from './types';

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  full_name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateMyProfilePayload = {
  full_name?: string;
  current_password?: string;
  new_password?: string;
};

type MessageWithUser = {
  message: string;
  user: AuthUser;
};

export async function register(payload: RegisterPayload) {
  return apiRequest<{ id: number; username: string; email: string }>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function logout() {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    auth: true,
  });
}

export async function pingSession() {
  return apiRequest<{ ok: boolean }>('/auth/session', {
    method: 'GET',
    auth: true,
  });
}

export async function updateMyAvatar(avatarUrl: string) {
  return apiRequest<MessageWithUser>('/auth/me/avatar', {
    method: 'PATCH',
    auth: true,
    body: { avatar_url: avatarUrl },
  });
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return apiRequest<MessageWithUser>('/auth/me', {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}

export type { LoginResponse };
