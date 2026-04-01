import { apiRequest } from './client';
import type {
  CheckQuestionResult,
  DashboardResponse,
  HomeSummary,
  Language,
  LeaderboardPeriod,
  LeaderboardUser,
  MyLeaderboardRank,
  QuizCategory,
  QuizDetail,
  QuizListItem,
  QuizType,
  SubmitAttemptResult,
} from './types';

type QuizListQueryOptions = {
  limit?: number;
  page?: number;
};

export async function getQuizzes(lang: Language, options: QuizListQueryOptions = {}) {
  const params = new URLSearchParams({
    resource: 'quizzes',
    lang,
  });
  if (Number.isFinite(options.limit) && Number(options.limit) > 0) {
    params.set('limit', String(Math.min(100, Math.floor(Number(options.limit)))));
    params.set(
      'page',
      String(Number.isFinite(options.page) && Number(options.page) > 0 ? Math.floor(Number(options.page)) : 1)
    );
  }

  return apiRequest<QuizListItem[]>(`/cache-api/public?${params.toString()}`, {
    auth: 'optional',
  });
}

export async function getQuizCategories(lang: Language) {
  return apiRequest<QuizCategory[]>(`/cache-api/public?resource=categories&lang=${lang}`);
}

export async function getQuizTypes(lang: Language) {
  return apiRequest<QuizType[]>(`/cache-api/public?resource=types&lang=${lang}`);
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

export async function getLeaderboard(limit = 10, period: LeaderboardPeriod = 'all') {
  return apiRequest<LeaderboardUser[]>(
    `/cache-api/public?resource=leaderboard&limit=${limit}&period=${period}`
  );
}

export async function getMyLeaderboardRank(period: LeaderboardPeriod = 'all') {
  return apiRequest<MyLeaderboardRank>(`/stats/leaderboard/me?period=${period}`, {
    auth: true,
  });
}

export async function getMyLeaderboardAround(period: LeaderboardPeriod = 'all', radius = 3) {
  return apiRequest<LeaderboardUser[]>(
    `/stats/leaderboard/me/around?period=${period}&radius=${radius}`,
    { auth: true }
  );
}

export async function getHomeSummary() {
  return apiRequest<HomeSummary>('/cache-api/public?resource=summary');
}

export async function getMyDashboard(lang: Language) {
  return apiRequest<DashboardResponse>(`/stats/me/dashboard?lang=${lang}`, {
    auth: true,
  });
}

export type {
  CheckQuestionResult,
  DashboardResponse,
  HomeSummary,
  LeaderboardPeriod,
  LeaderboardUser,
  MyLeaderboardRank,
  QuizCategory,
  QuizDetail,
  QuizListItem,
  QuizType,
  SubmitAttemptResult,
};
