import { apiRequest } from './client';
import type {
  AdminQuizCategory,
  AdminQuizDetail,
  AdminQuizType,
  AdminSubject,
  AdminTopicGroup,
  DashboardResponse,
  Language,
} from './types';

export type AdminUserRecord = Record<string, unknown>;
export type AdminQuizRecord = Record<string, unknown>;

export type QuizDetailUpdatePayload = {
  category_id?: number | null;
  quiz_type: string | number;
  title_vi: string;
  title_es: string;
  description_vi?: string | null;
  description_es?: string | null;
  instructions_vi?: string | null;
  instructions_es?: string | null;
  passing_score: number;
  is_active: boolean;
  questions: Array<{
    id: number;
    question_text_vi: string;
    question_text_es: string;
    explanation_vi?: string | null;
    explanation_es?: string | null;
    image_url?: string | null;
    answers: Array<{
      id: number;
      answer_text_vi: string;
      answer_text_es: string;
      is_correct: boolean;
    }>;
  }>;
};

export async function getAdminUserDashboard(userId: number, lang: Language) {
  return apiRequest<DashboardResponse>(`/stats/users/${userId}/dashboard?lang=${lang}`, {
    auth: true,
  });
}

export async function getAdminSubjects() {
  return apiRequest<AdminSubject[]>('/materials-api/admin/subjects', { auth: true });
}

export async function getAdminMaterialTopicGroups() {
  return apiRequest<AdminTopicGroup[]>('/materials-api/admin/topic-groups', { auth: true });
}

export async function createAdminMaterialTopicGroup(payload: {
  code?: string;
  name_vi: string;
  name_es: string;
  description_vi?: string;
  description_es?: string;
  is_active?: boolean;
}) {
  return apiRequest<{ id: number }>('/materials-api/admin/topic-groups', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminMaterialTopicGroup(
  id: number,
  payload: {
    code: string;
    name_vi: string;
    name_es: string;
    description_vi?: string;
    description_es?: string;
    is_active?: boolean;
  }
) {
  return apiRequest<{ id: number }>(`/materials-api/admin/topic-groups/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminMaterialTopicGroup(id: number) {
  return apiRequest<{ id: number }>(`/materials-api/admin/topic-groups/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminSubject(payload: {
  material_topic_group_id?: number;
  name_vi: string;
  name_es: string;
  description_vi?: string;
  description_es?: string;
}) {
  return apiRequest<{ id: number; code: string }>('/materials-api/admin/subjects', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminSubject(
  id: number,
  payload: {
    material_topic_group_id?: number;
    name_vi: string;
    name_es: string;
    description_vi?: string;
    description_es?: string;
  }
) {
  return apiRequest<{ id: number }>(`/materials-api/admin/subjects/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminSubject(id: number) {
  return apiRequest<{ id: number }>(`/materials-api/admin/subjects/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function getAdminUsers() {
  return apiRequest<AdminUserRecord[]>('/auth/admin/users', { auth: true });
}

export async function createAdminUser(payload: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role: string;
}) {
  return apiRequest<{ id: number }>('/auth/admin/users', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminUser(
  id: number,
  payload: {
    username?: string;
    email?: string;
    full_name?: string;
    role?: string;
    is_active?: boolean;
    password?: string;
  }
) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function lockAdminUser(id: number) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}/lock`, {
    method: 'POST',
    auth: true,
  });
}

export async function unlockAdminUser(id: number) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}/unlock`, {
    method: 'POST',
    auth: true,
  });
}

export async function deleteAdminUser(id: number) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function getAdminQuizzes() {
  return apiRequest<AdminQuizRecord[]>('/api/admin/quizzes', { auth: true });
}

export async function getAdminQuizCategories() {
  return apiRequest<AdminQuizCategory[]>('/api/admin/categories', { auth: true });
}

export async function getAdminQuizTypes() {
  return apiRequest<AdminQuizType[]>('/api/admin/types', { auth: true });
}

export async function getAdminQuizTopicGroups() {
  return apiRequest<AdminTopicGroup[]>('/api/admin/topic-groups', { auth: true });
}

export async function createAdminQuizTopicGroup(payload: {
  code?: string;
  name_vi: string;
  name_es: string;
  description_vi?: string;
  description_es?: string;
  is_active?: boolean;
}) {
  return apiRequest<{ id: number }>('/api/admin/topic-groups', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuizTopicGroup(
  id: number,
  payload: {
    code: string;
    name_vi: string;
    name_es: string;
    description_vi?: string;
    description_es?: string;
    is_active?: boolean;
  }
) {
  return apiRequest<{ id: number }>(`/api/admin/topic-groups/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuizTopicGroup(id: number) {
  return apiRequest<{ id: number }>(`/api/admin/topic-groups/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminQuizType(payload: {
  code?: string;
  quiz_topic_group_id?: number;
  name_vi: string;
  name_es: string;
  description_vi?: string;
  description_es?: string;
  is_active?: boolean;
}) {
  return apiRequest<{ id: number; code: string }>('/api/admin/types', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuizType(
  id: number,
  payload: {
    code?: string;
    quiz_topic_group_id?: number;
    name_vi: string;
    name_es: string;
    description_vi?: string;
    description_es?: string;
    is_active?: boolean;
  }
) {
  return apiRequest<{ id: number; code: string }>(`/api/admin/types/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuizType(id: number) {
  return apiRequest<{ id: number }>(`/api/admin/types/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminQuizCategory(payload: {
  quiz_topic_group_id?: number;
  name_vi: string;
  name_es: string;
  slug?: string;
  description_vi?: string;
  description_es?: string;
  is_active?: boolean;
}) {
  return apiRequest<{ id: number }>('/api/admin/categories', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuizCategory(
  id: number,
  payload: {
    quiz_topic_group_id?: number;
    name_vi: string;
    name_es: string;
    slug?: string;
    description_vi?: string;
    description_es?: string;
    is_active?: boolean;
  }
) {
  return apiRequest<{ id: number }>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuizCategory(id: number) {
  return apiRequest<{ id: number }>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createManualQuiz(payload: Record<string, unknown>, _lang: Language) {
  return apiRequest<{ id: number }>('/api/quizzes', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuiz(id: number, payload: Record<string, unknown>) {
  return apiRequest<{ message: string }>(`/api/admin/quizzes/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function getAdminQuizDetail(id: number) {
  return apiRequest<AdminQuizDetail>(`/api/admin/quizzes/${id}/detail`, {
    auth: true,
  });
}

export async function updateAdminQuizDetail(id: number, payload: QuizDetailUpdatePayload) {
  return apiRequest<{ id: number }>(`/api/admin/quizzes/${id}/detail`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuiz(id: number) {
  return apiRequest<{ message: string }>(`/api/admin/quizzes/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function updateAdminMaterial(id: number, payload: Record<string, unknown>) {
  return apiRequest<{ message: string }>(`/materials-api/materials/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminMaterial(id: number) {
  return apiRequest<{ message: string }>(`/materials-api/materials/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createBilingualMaterial(subjectId: number, payload: Record<string, unknown>) {
  return apiRequest<{ id: number }>(`/materials-api/subjects/${subjectId}/materials/bilingual`, {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export type {
  AdminQuizCategory,
  AdminQuizDetail,
  AdminQuizType,
  AdminSubject,
  AdminTopicGroup,
  DashboardResponse,
};
