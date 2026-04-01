import { apiRequest } from './client';
import type { Language, MaterialItem, Subject } from './types';

export type SubjectMaterialCount = {
  subject_id: number;
  total: number;
};

export async function getSubjects(lang: Language) {
  return apiRequest<Subject[]>(`/cache-api/public?resource=subjects&lang=${lang}`);
}

export async function getMaterialsBySubject(subjectId: number, lang: Language) {
  return apiRequest<MaterialItem[]>(
    `/cache-api/public?resource=materials&subjectId=${subjectId}&lang=${lang}`
  );
}

export async function getMaterialCountsBySubject() {
  return apiRequest<SubjectMaterialCount[]>('/materials-api/subjects/material-counts');
}

export type { MaterialItem, Subject };
