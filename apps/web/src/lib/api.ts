import { getOrCreateDeviceId, getStoredAuth, type AuthUser } from '@/lib/auth';
import type { Language } from '@/lib/data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth) {
    const stored = getStoredAuth();
    if (!stored?.token) {
      throw new Error('Vui long dang nhap');
    }
    headers.Authorization = `Bearer ${stored.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await response.text();
  const payload = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
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
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  title: string;
  description: string | null;
  category_name: string | null;
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

export type MaterialItem = {
  id: number;
  lang_code: string;
  title: string;
  description: string | null;
  file_path: string;
  file_size_mb: number | null;
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
  return apiRequest<QuizListItem[]>(`/api/quizzes?lang=${lang}`);
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

export async function getMyDashboard(lang: Language) {
  return apiRequest<DashboardResponse>(`/stats/me/dashboard?lang=${lang}`, {
    auth: true,
  });
}

export async function getSubjects(lang: Language) {
  return apiRequest<Subject[]>(`/materials/subjects?lang=${lang}`);
}

export async function getMaterialsBySubject(subjectId: number, lang: Language) {
  return apiRequest<MaterialItem[]>(`/materials/subjects/${subjectId}/materials?lang=${lang}`);
}

export function resolveMediaUrl(filePath: string) {
  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${API_BASE_URL}${normalized}`;
}
