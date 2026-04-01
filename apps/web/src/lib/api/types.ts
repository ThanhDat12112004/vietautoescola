import type { AuthUser } from '@/lib/auth';

export type Language = 'vi' | 'es';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type QuizListItem = {
  id: number;
  code: string;
  quiz_type?: string | null;
  quiz_topic_group_name?: string | null;
  quiz_topic_group_description?: string | null;
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
  rank?: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  total_score: number;
  total_quizzes: number;
  total_correct: number;
  total_questions: number;
  average_percentage: number;
};

export type LeaderboardPeriod = 'all' | 'week' | 'month';

export type MyLeaderboardRank = {
  rank: number;
  total_score: number;
  total_quizzes: number;
  average_percentage: number;
};

export type HomeSummary = {
  total_questions: number;
  total_students: number;
  pass_rate: number;
  total_attempts: number;
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
  material_topic_group_id?: number;
  material_topic_group_code?: string | null;
  material_topic_group_name?: string | null;
  material_topic_group_description?: string | null;
  name: string;
  description: string | null;
  created_at: string;
};

export type AdminSubject = {
  id: number;
  code: string;
  material_topic_group_id?: number;
  material_topic_group_code?: string | null;
  material_topic_group_name_vi?: string | null;
  material_topic_group_name_es?: string | null;
  material_topic_group_description_vi?: string | null;
  material_topic_group_description_es?: string | null;
  name_vi: string;
  name_es: string;
  description_vi: string | null;
  description_es: string | null;
  created_at: string;
};

export type AdminQuizCategory = {
  id: number;
  quiz_topic_group_id?: number;
  quiz_topic_group_code?: string | null;
  quiz_topic_group_name_vi?: string | null;
  quiz_topic_group_name_es?: string | null;
  name_vi: string;
  name_es: string;
  slug: string | null;
  description_vi: string | null;
  description_es: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminTopicGroup = {
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

export type QuizType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type AdminQuizType = {
  id: number;
  code: string;
  quiz_topic_group_id?: number;
  quiz_topic_group_code?: string | null;
  quiz_topic_group_name_vi?: string | null;
  quiz_topic_group_name_es?: string | null;
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
  page_count?: number | null;
  title_vi: string;
  title_es: string;
  description_vi: string | null;
  description_es: string | null;
  file_path_vi: string;
  file_path_es: string;
  file_size_mb_vi: number | null;
  file_size_mb_es: number | null;
  page_count_vi?: number | null;
  page_count_es?: number | null;
  uploaded_at: string;
};

export type UploadedFileMeta = {
  key: string;
  cdn_url: string;
  size: number;
  page_count?: number;
};
