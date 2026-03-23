import { apiFetch } from "./client";

export function getLeaderboard(lang, limit = 20) {
  return apiFetch(`/stats/leaderboard?limit=${limit}&lang=${lang}`, { lang });
}

export function getDashboard(lang, token) {
  return apiFetch(`/stats/me/dashboard?lang=${lang}`, {
    lang,
    headers: { Authorization: `Bearer ${token}` }
  });
}
