type CheckedDetail = { is_correct?: boolean } | undefined;

export function getCandidateDisplayName(user?: { full_name?: string | null; username?: string | null }) {
  return (user?.full_name && user.full_name.trim()) || user?.username || '-';
}

export function hasUnsavedQuizProgress(
  submitResult: unknown,
  selectedAnswersCount: number,
  timer: number
) {
  return !submitResult && (selectedAnswersCount > 0 || timer > 0);
}

export function getQuestionBadgeClassName(params: {
  mode: 'practice' | 'exam';
  questionId: number;
  index: number;
  currentIndex: number;
  selectedAnswers: Record<number, number>;
  detailsMap: Record<number, CheckedDetail>;
}) {
  const { mode, questionId, index, currentIndex, selectedAnswers, detailsMap } = params;
  const isCurrent = index === currentIndex;
  const currentMark = 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-300/70 shadow-sm';

  if (mode === 'exam') {
    const hasAnswered = Boolean(selectedAnswers[questionId]);
    if (hasAnswered) return 'border-emerald-600 bg-emerald-50 text-emerald-900';
    return isCurrent
      ? currentMark
      : 'border-border bg-background text-muted-foreground hover:bg-muted';
  }

  const detail = detailsMap[questionId];
  const hasJudged = Boolean(detail);
  const isCorrect = Boolean(detail?.is_correct);

  if (hasJudged) {
    return isCorrect
      ? 'border-green-600 bg-green-50 text-green-800'
      : 'border-red-600 bg-red-50 text-red-800 ring-1 ring-red-300/60';
  }

  return isCurrent ? currentMark : 'border-border bg-background text-muted-foreground hover:bg-muted';
}
