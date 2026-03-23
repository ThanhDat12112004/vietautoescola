import { apiFetch } from "./client";
import { getOrCreateDeviceId } from "../session";

export function login({ email, password, lang }) {
  return apiFetch("/auth/login", {
    method: "POST",
    lang,
    body: JSON.stringify({ email, password, device_id: getOrCreateDeviceId() })
  });
}

export function register(payload, lang) {
  return apiFetch("/auth/register", {
    method: "POST",
    lang,
    body: JSON.stringify(payload)
  });
}

export function logout(token) {
  return apiFetch("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}
