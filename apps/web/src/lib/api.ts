import { clearAuth, getOrCreateDeviceId, getStoredAuth, type AuthUser } from '@/lib/auth';
import type { Language } from '@/lib/data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

function shouldBypassNgrokWarning() {
  return API_BASE_URL.includes('ngrok-free.app');
}

function withNgrokHeaders(headers: Record<string, string>) {
  if (shouldBypassNgrokWarning()) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;

async function parseUploadError(response: Response, fallbackMessage: string) {
  const rawText = await response.text();
  let message = fallbackMessage;

  if (rawText) {
    try {
      const payload = JSON.parse(rawText);
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      message = rawText;
    }
  }

  throw new Error(`${message} (${response.status})`);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean | 'optional';
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = withNgrokHeaders({
    'Content-Type': 'application/json',
  });

  if (options.auth === true) {
    const stored = getStoredAuth();
    if (!stored?.token) {
      throw new Error('Vui long dang nhap');
    }
    headers.Authorization = `Bearer ${stored.token}`;
  }

  if (options.auth === 'optional') {
    const stored = getStoredAuth();
    if (stored?.token) {
      headers.Authorization = `Bearer ${stored.token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await response.text();
  let payload: any = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = { message: rawText };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && (options.auth === true || options.auth === 'optional')) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-updated'));
      }
    }
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload as T;
}

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type QuizListItem = {
  id: number;
  code: string;
  quiz_type?: string | null;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  title: string;
  description: string | null;
  category_name: string | null;
  has_completed?: boolean;
  best_percentage?: number | null;
  best_score?: number | null;
};

export type QuizAnswer = {
  id: number;
  order_number: number;
  answer_text: string;
};

export type QuizQuestion = {
  id: number;
  order_number: number;
  points: number;
  image_url: string | null;
  question_text: string;
  explanation: string | null;
  answers: QuizAnswer[];
};

export type QuizDetail = {
  id: number;
  code: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  title: string;
  description: string | null;
  instructions: string | null;
  questions: QuizQuestion[];
};

export type CheckQuestionResult = {
  attempt_id: number;
  question_id: number;
  selected_answer_id: number;
  correct_answer_id: number | null;
  is_correct: boolean;
  points_earned: number;
};

export type SubmitAttemptResult = {
  attempt_id: number;
  score: number;
  total_points: number;
  correct_count: number;
  total_questions: number;
  percentage: number;
  details: CheckQuestionResult[];
};

export type LeaderboardUser = {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  total_score: number;
  total_quizzes: number;
  total_correct: number;
  total_questions: number;
  average_percentage: number;
};

export type HomeSummary = {
  total_questions: number;
  total_students: number;
  pass_rate: number;
};

export type QuizCategory = {
  id: number;
  slug: string | null;
  name: string;
  description: string | null;
};

export type DashboardResponse = {
  stats: LeaderboardUser;
  history: Array<{
    id: number;
    quiz_id: number;
    quiz_code: string;
    quiz_title: string;
    score: number;
    percentage: number;
    correct_count: number;
    total_questions: number;
    status: string;
    started_at: string;
    completed_at: string | null;
  }>;
};

export type Subject = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type AdminSubject = {
  id: number;
  code: string;
  name_vi: string;
  name_es: string;
  description_vi: string | null;
  description_es: string | null;
  created_at: string;
};

export type AdminQuizCategory = {
  id: number;
  name_vi: string;
  name_es: string;
  slug: string | null;
  description_vi: string | null;
  description_es: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type AdminQuizType = {
  id: number;
  code: string;
  name_vi: string;
  name_es: string;
  description_vi: string | null;
  description_es: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminQuizDetailAnswer = {
  id: number;
  question_id: number;
  order_number: number;
  is_correct: boolean;
  answer_text_vi: string;
  answer_text_es: string;
};

export type AdminQuizDetailQuestion = {
  id: number;
  order_number: number;
  points: number;
  question_text_vi: string;
  question_text_es: string;
  explanation_vi: string | null;
  explanation_es: string | null;
  image_url: string | null;
  answers: AdminQuizDetailAnswer[];
};

export type AdminQuizDetail = {
  id: number;
  category_id: number | null;
  quiz_type: string;
  title_vi: string;
  title_es: string;
  description_vi: string | null;
  description_es: string | null;
  instructions_vi: string | null;
  instructions_es: string | null;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  questions: AdminQuizDetailQuestion[];
};

export type MaterialItem = {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  file_size_mb: number | null;
  title_vi: string;
  title_es: string;
  description_vi: string | null;
  description_es: string | null;
  file_path_vi: string;
  file_path_es: string;
  file_size_mb_vi: number | null;
  file_size_mb_es: number | null;
  uploaded_at: string;
};

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}) {
  return apiRequest<{ id: number; username: string; email: string }>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: {
      ...payload,
      device_id: getOrCreateDeviceId(),
    },
  });
}

export async function logout() {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    auth: true,
  });
}

export async function getQuizzes(lang: Language) {
  return apiRequest<QuizListItem[]>(`/api/quizzes?lang=${lang}`, { auth: 'optional' });
}

export async function getQuizCategories(lang: Language) {
  return apiRequest<QuizCategory[]>(`/api/categories?lang=${lang}`);
}

export async function getQuizTypes(lang: Language) {
  return apiRequest<QuizType[]>(`/api/types?lang=${lang}`);
}

export async function getQuizDetail(id: number, lang: Language) {
  return apiRequest<QuizDetail>(`/api/quizzes/${id}?lang=${lang}`);
}

export async function startAttempt(quizId: number) {
  return apiRequest<{ attempt_id: number }>('/api/attempts/start', {
    method: 'POST',
    auth: true,
    body: { quiz_id: quizId },
  });
}

export async function checkQuestion(attemptId: number, questionId: number, answerId: number) {
  return apiRequest<CheckQuestionResult>(`/api/attempts/${attemptId}/check-question`, {
    method: 'POST',
    auth: true,
    body: {
      question_id: questionId,
      answer_id: answerId,
    },
  });
}

export async function submitAttempt(attemptId: number, answers: Record<string, number>) {
  return apiRequest<SubmitAttemptResult>(`/api/attempts/${attemptId}/submit`, {
    method: 'POST',
    auth: true,
    body: { answers },
  });
}

export async function getLeaderboard(limit = 20) {
  return apiRequest<LeaderboardUser[]>(`/stats/leaderboard?limit=${limit}`);
}

export async function getHomeSummary() {
  return apiRequest<HomeSummary>('/stats/summary');
}

export async function getMyDashboard(lang: Language) {
  return apiRequest<DashboardResponse>(`/stats/me/dashboard?lang=${lang}`, {
    auth: true,
  });
}

export async function getAdminUserDashboard(userId: number, lang: Language) {
  return apiRequest<DashboardResponse>(`/stats/users/${userId}/dashboard?lang=${lang}`, {
    auth: true,
  });
}

export async function getSubjects(lang: Language) {
  return apiRequest<Subject[]>(`/materials/subjects?lang=${lang}`);
}

export async function getAdminSubjects() {
  return apiRequest<AdminSubject[]>('/materials/admin/subjects', { auth: true });
}

export async function createAdminSubject(payload: {
  name_vi: string;
  name_es: string;
  description_vi?: string;
  description_es?: string;
}) {
  return apiRequest<{ id: number; code: string }>('/materials/admin/subjects', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminSubject(
  id: number,
  payload: {
    name_vi: string;
    name_es: string;
    description_vi?: string;
    description_es?: string;
  }
) {
  return apiRequest<{ id: number }>(`/materials/admin/subjects/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminSubject(id: number) {
  return apiRequest<{ id: number }>(`/materials/admin/subjects/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function getMaterialsBySubject(subjectId: number, lang: Language) {
  return apiRequest<MaterialItem[]>(`/materials/subjects/${subjectId}/materials?lang=${lang}`);
}

function joinApiBase(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${API_BASE_URL.replace(/\/+$/, '')}${normalized}`;
}

export function resolveMediaUrl(filePath: string) {
  if (!filePath) {
    return filePath;
  }

  const trimmedPath = String(filePath).trim();
  if (!trimmedPath) {
    return '';
  }

  // Tolerate accidental missing leading protocol character in stored URLs.
  if (/^ttps?:\/\//i.test(trimmedPath)) {
    return `h${trimmedPath}`;
  }

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const sourceUrl = new URL(trimmedPath);

      if (sourceUrl.pathname.startsWith('/media/static/')) {
        return joinApiBase(`${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`);
      }
    } catch {
      return trimmedPath;
    }

    return trimmedPath;
  }

  // Normalize known legacy relative formats before resolving.
  if (trimmedPath.startsWith('media/static/')) {
    return joinApiBase(`/${trimmedPath}`);
  }

  if (/^(questions|materials)\//i.test(trimmedPath)) {
    return joinApiBase(`/media/static/${trimmedPath}`);
  }

  if (trimmedPath.startsWith('/media/static/')) {
    return joinApiBase(trimmedPath);
  }

  const normalized = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
  return joinApiBase(normalized);
}

// Admin API functions
export async function getAdminUsers() {
  return apiRequest<any[]>('/auth/admin/users', { auth: true });
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
  return apiRequest<any[]>('/api/admin/quizzes', { auth: true });
}

export async function getAdminQuizCategories() {
  return apiRequest<AdminQuizCategory[]>('/api/admin/categories', { auth: true });
}

export async function getAdminQuizTypes() {
  return apiRequest<AdminQuizType[]>('/api/admin/types', { auth: true });
}

export async function createAdminQuizType(payload: {
  code?: string;
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

export async function createManualQuiz(payload: any, lang: Language) {
  return apiRequest<{ id: number }>('/api/quizzes', { method: 'POST', body: payload, auth: true });
}

export async function updateAdminQuiz(id: number, payload: any) {
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

export async function updateAdminQuizDetail(id: number, payload: {
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
}) {
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

export async function updateAdminMaterial(id: number, payload: any) {
  return apiRequest<{ message: string }>(`/materials/materials/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminMaterial(id: number) {
  return apiRequest<{ message: string }>(`/materials/materials/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createBilingualMaterial(subjectId: number, payload: any) {
  return apiRequest<{ id: number }>(
    `/materials/subjects/${subjectId}/materials/bilingual`,
    { method: 'POST', body: payload, auth: true }
  );
}

export async function uploadMaterialFile(file: File, langCode: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lang_code', langCode);
  const stored = getStoredAuth();
  const headers: Record<string, string> = withNgrokHeaders({});
  if (stored?.token) {
    headers.Authorization = `Bearer ${stored.token}`;
  }
  const response = await fetch(`${API_BASE_URL}/media/upload-material`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    await parseUploadError(response, 'Upload material failed');
  }
  return response.json();
}

export async function uploadQuestionImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tep khong phai anh hop le');
  }

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error('Anh vuot qua gioi han 20MB');
  }

  const formData = new FormData();
  formData.append('image', file);
  const stored = getStoredAuth();
  const headers: Record<string, string> = withNgrokHeaders({});
  if (stored?.token) {
    headers.Authorization = `Bearer ${stored.token}`;
  }
  const response = await fetch(`${API_BASE_URL}/media/upload-image`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    await parseUploadError(response, 'Upload image failed');
  }
  return response.json();
}

export async function uploadAvatarImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tep khong phai anh hop le');
  }

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error('Anh vuot qua gioi han 20MB');
  }

  const formData = new FormData();
  formData.append('image', file);
  const stored = getStoredAuth();
  const headers: Record<string, string> = withNgrokHeaders({});
  if (stored?.token) {
    headers.Authorization = `Bearer ${stored.token}`;
  }
  const response = await fetch(`${API_BASE_URL}/media/upload-avatar`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    await parseUploadError(response, 'Upload avatar failed');
  }
  return response.json() as Promise<{ key: string; cdn_url: string; size: number }>;
}

export async function updateMyAvatar(avatarUrl: string) {
  return apiRequest<{ message: string; user: AuthUser }>('/auth/me/avatar', {
    method: 'PATCH',
    auth: true,
    body: { avatar_url: avatarUrl },
  });
}

export async function updateMyProfile(payload: {
  full_name?: string;
  current_password?: string;
  new_password?: string;
}) {
  return apiRequest<{ message: string; user: AuthUser }>('/auth/me', {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}
