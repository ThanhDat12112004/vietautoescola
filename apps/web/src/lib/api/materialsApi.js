import { apiFetch } from "./client";

export function getSubjects(lang) {
  return apiFetch(`/materials/subjects?lang=${lang}`, { lang });
}

export function getMaterialsBySubject(subjectId, lang) {
  return apiFetch(`/materials/subjects/${subjectId}/materials?lang=${lang}`, { lang });
}

export function createMaterial(subjectId, payload, token, lang) {
  return apiFetch(`/materials/subjects/${subjectId}/materials`, {
    method: "POST",
    lang,
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function createBilingualMaterial(subjectId, payload, token, lang) {
  return apiFetch(`/materials/subjects/${subjectId}/materials/bilingual`, {
    method: "POST",
    lang,
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}
