type QuizLike = { quiz_type?: string | null; total_questions?: number | null };

export function getUniqueQuizTypes(quizzes: QuizLike[], limit = 6) {
  const values = quizzes
    .map((quiz) => quiz.quiz_type)
    .filter((item): item is string => Boolean(item));
  return Array.from(new Set(values)).slice(0, limit);
}

export function getPrimaryTypeQuizzes(quizzes: QuizLike[], primaryQuizType: string | null) {
  if (!primaryQuizType) return [];
  return quizzes.filter((quiz) => String(quiz.quiz_type || '') === String(primaryQuizType));
}

export function getPrimaryTypeQuestionTotal(quizzes: QuizLike[]) {
  return quizzes.reduce((sum, quiz) => sum + Number(quiz.total_questions || 0), 0);
}

export function getTotalMaterialsCount(materialsCountBySubject: Record<number, number>) {
  return Object.values(materialsCountBySubject).reduce((sum, count) => sum + Number(count || 0), 0);
}

export function formatCountByLocale(value: number, locale: string) {
  return Number(value || 0).toLocaleString(locale);
}
