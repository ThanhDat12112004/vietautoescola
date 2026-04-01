import BrandLogo from '@/components/BrandLogo';
import { LanguageDropdown } from '@/components/LanguageDropdown';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import {
  checkQuestion,
  getQuizDetail,
  startAttempt,
  submitAttempt,
  type CheckQuestionResult,
  type QuizDetail,
  type SubmitAttemptResult,
} from '@/lib/api/quiz';
import {
  resolveMediaUrl,
} from '@/lib/api/upload';
import { getStoredAuth } from '@/lib/auth';
import { formatTimer, shuffleArray } from '@/features/quiz-take/quizTake.helpers';
import {
  getCandidateDisplayName,
  getQuestionBadgeClassName as getQuestionBadgeClassNameHelper,
  hasUnsavedQuizProgress,
} from '@/features/quiz-take/quizTake.ui.helpers';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Lightbulb,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

type QuizMode = 'practice' | 'exam';

type CheckedMap = Record<number, CheckQuestionResult>;

const ANSWER_BADGES = ['/brand/a.png', '/brand/b.png', '/brand/c.png'];

const QuizTake = () => {
  const { lang, setLang, t } = useLanguage();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quizId = Number(id || 1);
  const mode: QuizMode = (searchParams.get('mode') as QuizMode) || 'practice';

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [checkedMap, setCheckedMap] = useState<CheckedMap>({});
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitResult, setSubmitResult] = useState<SubmitAttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authUser = getStoredAuth()?.user;
  const candidateName = getCandidateDisplayName(authUser);

  useEffect(() => {
    if (!getStoredAuth()?.token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const detail = await getQuizDetail(quizId, lang);
        const attempt = await startAttempt(quizId);
        if (!active) return;

        setQuiz({
          ...detail,
          questions: detail.questions.map((q) => ({
            ...q,
            answers: shuffleArray(q.answers),
          })),
        });
        setAttemptId(attempt.attempt_id);
        setTimer(0);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được đề thi', 'No se pudo cargar el examen')
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [quizId, lang, t]);

  useEffect(() => {
    if (loading || showResult || showReview) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, showResult, showReview]);

  useEffect(() => {
    if (loading || showResult || showReview) return;

    const blockEvent = (event: Event) => {
      event.preventDefault();
    };

    const blockKeyboardShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'a' || key === 'p') {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', blockEvent);
    document.addEventListener('cut', blockEvent);
    document.addEventListener('contextmenu', blockEvent);
    document.addEventListener('selectstart', blockEvent);
    document.addEventListener('dragstart', blockEvent);
    document.addEventListener('keydown', blockKeyboardShortcut);

    return () => {
      document.removeEventListener('copy', blockEvent);
      document.removeEventListener('cut', blockEvent);
      document.removeEventListener('contextmenu', blockEvent);
      document.removeEventListener('selectstart', blockEvent);
      document.removeEventListener('dragstart', blockEvent);
      document.removeEventListener('keydown', blockKeyboardShortcut);
    };
  }, [loading, showResult, showReview]);

  useEffect(() => {
    if (!showExplanationPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowExplanationPanel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showExplanationPanel]);

  const questions = quiz?.questions || [];
  const question = questions[currentIndex];
  const selectedId = question ? selectedAnswers[question.id] : undefined;
  const checkedForCurrent = question ? checkedMap[question.id] : undefined;

  useEffect(() => {
    if (!showExplanationPanel || mode !== 'practice' || !question?.explanation) return;
    if (!checkedForCurrent) return;

    const mq = window.matchMedia('(orientation: portrait)');
    const sync = () => {
      document.body.style.overflow = mq.matches ? 'hidden' : '';
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      document.body.style.overflow = '';
    };
  }, [showExplanationPanel, mode, question?.id, question?.explanation, checkedForCurrent]);

  const allQuestionsAnswered = useMemo(
    () =>
      questions.length > 0 &&
      questions.every(
        (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null
      ),
    [questions, selectedAnswers]
  );

  const isLastQuestion = questions.length > 0 && currentIndex >= questions.length - 1;

  const detailsMap = useMemo(() => {
    const map: Record<number, CheckQuestionResult> = { ...checkedMap };
    submitResult?.details.forEach((item) => {
      map[item.question_id] = item;
    });
    return map;
  }, [checkedMap, submitResult]);

  // Auto-check when answer is selected in practice mode
  const handleSelect = async (answerId: number) => {
    if (!question) return;
    if (mode === 'practice' && checkedForCurrent) return;

    setShowExplanationPanel(false);

    setSelectedAnswers((prev) => ({ ...prev, [question.id]: answerId }));

    // In practice mode, auto-check immediately after selection
    if (mode === 'practice' && attemptId) {
      try {
        const result = await checkQuestion(attemptId, question.id, answerId);
        setCheckedMap((prev) => ({ ...prev, [question.id]: result }));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('Không kiểm tra được câu hỏi', 'No se pudo verificar la pregunta')
        );
      }
    }
  };

  const handleFinish = async () => {
    if (!attemptId || isSubmitting || submitResult) return;
    if (!allQuestionsAnswered) {
      setError(
        t(
          'Vui lòng trả lời hết tất cả các câu trước khi nộp bài.',
          'Responde todas las preguntas antes de finalizar.'
        )
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = Object.fromEntries(
        Object.entries(selectedAnswers).map(([key, value]) => [String(key), value])
      );
      const result = await submitAttempt(attemptId, payload);
      setSubmitResult(result);
      setShowResult(true);
      setShowReview(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Nộp bài thất bại', 'Error al enviar'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveQuiz = (targetPath: string) => {
    if (isSubmitting) return;
    const hasUnsavedProgress = hasUnsavedQuizProgress(
      submitResult,
      Object.keys(selectedAnswers).length,
      timer
    );
    if (hasUnsavedProgress) {
      const accepted = window.confirm(
        t(
          'Bạn muốn thoát bài thi? Bài này sẽ được tính là chưa làm cho đến khi bạn bấm Nộp bài.',
          'Quieres salir del examen? Este intento se considerara no realizado hasta que pulses Entregar.'
        )
      );
      if (!accepted) return;
    }

    navigate(targetPath);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('Đang tải đề...', 'Cargando examen...')}</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {error || t('Không tìm thấy bài thi', 'Examen no encontrado')}
          </p>
          <Link to="/quizzes">
            <Button>{t('Quay lại', 'Volver')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (showReview) {
    const reviewQuestion = questions[reviewIndex];
    const detail = detailsMap[reviewQuestion.id];

    return (
      <div className="app-page h-screen flex flex-col bg-background">
        <div className="border-b border-border bg-card px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{t('Xem lại', 'Revisión')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowReview(false)}
          >
            {t('Quay lại kết quả', 'Volver')}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 w-full">
          <h3 className="font-display font-bold text-base mb-4">
            {reviewQuestion.order_number}. {reviewQuestion.question_text}
          </h3>
          <div className="space-y-2">
            {reviewQuestion.answers.map((answer) => {
              const isSelected = detail?.selected_answer_id === answer.id;
              const isCorrect = detail?.correct_answer_id === answer.id;

              return (
                <div
                  key={answer.id}
                  className={`border rounded-lg px-3 py-2 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                      : isSelected
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isSelected ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    {answer.answer_text}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold mb-1">{t('Giải thích', 'Explicación')}</p>
            <p className="text-muted-foreground">
              {reviewQuestion.explanation || t('Không có giải thích', 'Sin explicación')}
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-card p-3 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
            disabled={reviewIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {t('Trước', 'Anterior')}
          </Button>
          <Button
            size="sm"
            onClick={() => setReviewIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={reviewIndex === questions.length - 1}
          >
            {t('Tiếp', 'Siguiente')} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (showResult && submitResult) {
    const passed = Number(submitResult.score || 0) >= 5;

    return (
      <div className="app-page h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
                passed ? 'bg-accent/20' : 'bg-destructive/10'
              }`}
            >
              {passed ? (
                <CheckCircle2 className="h-10 w-10 text-accent" />
              ) : (
                <XCircle className="h-10 w-10 text-destructive" />
              )}
            </div>
            <h2 className="font-display text-xl font-800 mb-1">
              {passed
                ? t('Chúc mừng! Bạn đã đậu!', 'Felicidades, aprobado')
                : t('Chưa đạt. Hãy thử lại!', 'No aprobado, intenta de nuevo')}
            </h2>
            <p className="text-xs text-muted-foreground mb-1">
              {mode === 'exam'
                ? t('Chế độ thi thật', 'Modo examen')
                : t('Chế độ luyện tập', 'Modo práctica')}
            </p>
            <div className="font-display text-5xl font-900 text-primary my-3">
              {Number(submitResult.score || 0).toFixed(1)}
              <span className="text-2xl text-muted-foreground">/10</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {t(
                `Đúng ${submitResult.correct_count}/${submitResult.total_questions} câu`,
                `Aciertos: ${submitResult.correct_count}/${submitResult.total_questions}`
              )}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => {
                  setShowResult(true);
                  setShowReview(true);
                  setReviewIndex(0);
                }}
              >
                <Eye className="h-4 w-4" />
                {t('Xem lại bài', 'Revisar respuestas')}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('Làm lại', 'Repetir')}
                </Button>
                <Button className="flex-1 gap-1.5" onClick={() => navigate('/quizzes')}>
                  <Home className="h-4 w-4" />
                  {t('Danh sách', 'Lista')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shouldUseTwoRowsOnMobile = questions.length > 20;
  const mobileTopCount = Math.ceil(questions.length / 2);

  /** Ô số câu đang xem: sky (dễ tách khỏi đỏ “sai”). Đã làm / đúng: lá; sai: đỏ đậm hơn. */
  const getQuestionBadgeClassName = (questionId: number, index: number) =>
    getQuestionBadgeClassNameHelper({
      mode,
      questionId,
      index,
      currentIndex,
      selectedAnswers,
      detailsMap,
    });

  const explanationDisabled =
    mode !== 'practice' || !checkedForCurrent || !question.explanation;

  const renderImageArea = () => (
    <>
      <div
        className="relative flex w-full h-[clamp(120px,24dvh,180px)] items-center justify-center overflow-hidden rounded-lg border border-slate-300/60 bg-slate-50/40
          sm:h-[clamp(130px,22dvh,190px)] md:h-[clamp(140px,20dvh,210px)]
          landscape:h-[clamp(150px,22dvh,220px)] landscape:min-h-[150px]
          lg:landscape:h-full lg:landscape:min-h-[240px] lg:landscape:flex-1 lg:landscape:rounded-md lg:landscape:border-0 lg:landscape:bg-transparent"
      >
        {question.image_url ? (
          <img
            src={resolveMediaUrl(question.image_url)}
            alt="question"
            className="mx-auto block h-auto w-auto max-h-full max-w-full object-contain object-center
              lg:landscape:h-full lg:landscape:w-full"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center px-2 pb-12 pt-3 text-center text-[clamp(0.625rem,2.2vmin,0.875rem)] text-muted-foreground landscape:pb-3 landscape:pt-2"
          >
            {t('Không có hình minh họa', 'Sin imagen')}
          </div>
        )}
        {/* Overlay khi portrait; desktop: nút giải thích nằm dưới đáp án (cột phải) */}
        {mode === 'practice' && (
          <button
            type="button"
            className="absolute bottom-1.5 right-1.5 z-10 inline-flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-full border border-amber-600/55 bg-amber-100/95 px-2 py-1 text-[clamp(0.5625rem,2vmin,0.75rem)] font-semibold leading-none text-amber-950 shadow-md backdrop-blur-[1px] transition hover:bg-amber-200/95 disabled:cursor-not-allowed disabled:opacity-35 sm:bottom-2 sm:right-2 md:bottom-2.5 md:right-2.5 landscape:hidden"
            disabled={explanationDisabled}
            onClick={() => setShowExplanationPanel((prev) => !prev)}
            aria-label={
              showExplanationPanel
                ? t('Ẩn giải thích', 'Ocultar explicación')
                : t('Giải thích', 'Explicación')
            }
          >
            <Lightbulb className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
            <span className="truncate sm:max-w-none">
              {showExplanationPanel
                ? t('Ẩn', 'Ocultar')
                : t('Giải thích', 'Explicación')}
            </span>
          </button>
        )}
      </div>
    </>
  );

  const renderQuestionHeader = () => (
    <div className="mb-1.5 flex items-start gap-1 landscape:mb-2 landscape:gap-2 xl:mb-3 xl:gap-3 2xl:gap-4">
      <span className="font-black leading-none text-slate-700 text-[clamp(1rem,4.2vmin,2.75rem)]">
        {String(question.order_number).padStart(2, '0')}.
      </span>
      <h3 className="pt-0.5 font-bold leading-snug text-[clamp(1rem,2.35vmin,1.375rem)] landscape:pt-1 landscape:text-[clamp(1.0625rem,2.15vmin,1.4375rem)]">
        {question.question_text}
      </h3>
    </div>
  );

  const renderAnswerList = () => (
    <div className="mt-0.5 w-full space-y-1 pb-0.5 landscape:mt-1 landscape:space-y-1.5 landscape:pb-1">
      {question.answers.map((answer, idx) => {
        const detail = detailsMap[question.id];
        const isSelected = selectedId === answer.id;
        const isCorrect = detail?.correct_answer_id === answer.id;
        const isWrong = Boolean(detail && isSelected && !detail.is_correct);
        const badgeSrc = ANSWER_BADGES[idx] || null;
        const answerTextClass = isCorrect
          ? 'text-green-700'
          : isWrong
            ? 'text-destructive'
            : 'text-foreground';
        return (
          <button
            key={answer.id}
            onClick={() => void handleSelect(answer.id)}
            className={`group flex w-full items-center gap-1.5 rounded-lg border px-[clamp(0.375rem,1.5vmin,0.75rem)] py-[clamp(0.25rem,1.35vmin,0.5rem)] text-left leading-snug transition-all duration-200
              landscape:gap-2.5 landscape:rounded-lg landscape:px-[clamp(0.4rem,1.25vmin,0.65rem)] landscape:py-[clamp(0.28rem,1.1vmin,0.5rem)] ${
              isCorrect
                ? 'border-green-500 bg-green-50 shadow-sm'
                : isWrong
                  ? 'border-destructive bg-destructive/10 shadow-sm'
                  : isSelected
                    ? 'border-slate-500 bg-slate-100 shadow-sm'
                    : 'border-slate-300 bg-white hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm'
            }`}
          >
            {badgeSrc ? (
              <img
                src={badgeSrc}
                alt={`option-${idx + 1}`}
                className="mt-0.5 h-[clamp(1.125rem,3.2vmin,1.5rem)] w-[clamp(1.125rem,3.2vmin,1.5rem)] shrink-0 object-contain landscape:h-[clamp(1.35rem,2.95vmin,1.75rem)] landscape:w-[clamp(1.35rem,2.95vmin,1.75rem)]"
              />
            ) : (
              <span className="mt-0.5 flex h-[clamp(1.125rem,3.2vmin,1.5rem)] w-[clamp(1.125rem,3.2vmin,1.5rem)] shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-bold text-[#5b5b5b] text-[clamp(0.5625rem,2vmin,0.75rem)] landscape:h-[clamp(1.35rem,2.95vmin,1.75rem)] landscape:w-[clamp(1.35rem,2.95vmin,1.75rem)] landscape:text-[clamp(0.6875rem,1.65vmin,0.8125rem)]">
                {String.fromCharCode(65 + idx)}
              </span>
            )}
            <span
              className={`flex-1 break-words pt-0.5 text-[clamp(0.9375rem,2.05vmin,1.3125rem)] leading-snug landscape:leading-snug ${answerTextClass}`}
            >
              {answer.answer_text}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderNavButtons = () => (
    <div className="grid w-full grid-cols-2 gap-1 landscape:gap-1.5 xl:gap-2">
      <Button
        type="button"
        variant="outline"
        className="min-h-0 rounded-md border-2 border-brand-burgundy/35 bg-white px-[clamp(0.375rem,1.4vmin,0.625rem)] py-0 font-semibold leading-none text-brand-heading shadow-sm transition-colors hover:bg-brand-burgundy/[0.06] disabled:opacity-40 h-[clamp(1.5rem,4.4vmin,2.4rem)] text-[clamp(0.5625rem,1.85vmin,0.8125rem)] landscape:rounded-lg landscape:text-[clamp(0.625rem,1.65vmin,0.875rem)] [&_svg]:!h-[clamp(0.625rem,2vmin,0.875rem)] [&_svg]:!w-[clamp(0.625rem,2vmin,0.875rem)] xl:h-9 xl:text-xs xl:[&_svg]:!h-4 xl:[&_svg]:!w-4"
        onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        disabled={currentIndex === 0}
      >
        <ArrowLeft className="mr-0.5 shrink-0 text-brand-cta" />
        {t('Trước', 'ANTERIOR')}
      </Button>

      {isLastQuestion ? (
        <Button
          type="button"
          className="brand-cta-primary min-h-0 rounded-md border-transparent px-[clamp(0.375rem,1.4vmin,0.625rem)] py-0 font-semibold leading-none text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] disabled:pointer-events-none disabled:opacity-45 h-[clamp(1.5rem,4.4vmin,2.4rem)] text-[clamp(0.5625rem,1.85vmin,0.8125rem)] landscape:text-[clamp(0.625rem,1.65vmin,0.875rem)] xl:h-9 xl:text-xs"
          onClick={() => void handleFinish()}
          disabled={!allQuestionsAnswered || isSubmitting || Boolean(submitResult)}
          title={
            !allQuestionsAnswered
              ? t('Trả lời hết các câu để nộp bài', 'Responde todas las preguntas para finalizar')
              : undefined
          }
        >
          {isSubmitting
            ? t('Đang nộp...', 'Enviando...')
            : t('Nộp bài', 'FINALIZAR TEST')}
        </Button>
      ) : (
        <Button
          type="button"
          className="brand-cta-primary min-h-0 rounded-md border-transparent px-[clamp(0.375rem,1.4vmin,0.625rem)] py-0 font-semibold leading-none text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] h-[clamp(1.5rem,4.4vmin,2.4rem)] text-[clamp(0.5625rem,1.85vmin,0.8125rem)] landscape:text-[clamp(0.625rem,1.65vmin,0.875rem)] xl:h-9 xl:text-xs [&_svg]:text-brand-onCta [&_svg]:!h-[clamp(0.625rem,2vmin,0.875rem)] [&_svg]:!w-[clamp(0.625rem,2vmin,0.875rem)] xl:[&_svg]:!h-4 xl:[&_svg]:!w-4"
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
        >
          {t('Tiếp', 'SIGUIENTE')}
          <ArrowRight className="ml-0.5 shrink-0" />
        </Button>
      )}
    </div>
  );

  return (
    <div
      className="app-page font-sans flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden print:hidden select-none bg-[radial-gradient(circle_at_18%_12%,rgba(224,231,255,0.35),transparent_38%),radial-gradient(circle_at_84%_6%,rgba(226,232,240,0.45),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_55%,#f5f7fb_100%)] p-0 md:h-screen md:max-h-screen"
    >
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden w-full rounded-[1rem] border border-slate-300/70 bg-white/90 shadow-[0_18px_36px_rgba(15,23,42,0.12)] p-1 sm:p-1.5 md:p-1.5 lg:p-2"
      >
        <div className="mb-0 shrink-0 grid grid-cols-[minmax(0,1fr)_auto] gap-1 md:gap-1.5 landscape:grid-cols-[auto_minmax(0,1fr)_auto] landscape:gap-x-2 landscape:gap-y-1">
          <div className="col-span-2 flex w-full min-w-0 items-center justify-between gap-1.5 rounded-md border border-slate-300/70 bg-slate-50/90 px-1.5 py-1 text-[clamp(0.625rem,2.2vmin,0.875rem)] sm:px-2 landscape:col-span-1 landscape:row-span-2 landscape:w-auto landscape:max-w-full landscape:justify-start landscape:gap-2 landscape:px-2 landscape:py-1.5 landscape:text-sm">
            <button
              type="button"
              onClick={() => handleLeaveQuiz('/')}
              className="flex min-w-0 max-w-[calc(100%-4.5rem)] items-center text-left sm:max-w-none landscape:max-w-none"
              aria-label={t('Về trang chủ', 'Ir a inicio')}
            >
              <BrandLogo
                imageClassName="h-7 shrink-0 sm:h-8 md:h-8 lg:h-8"
                withText
                textClassName="text-[13px] leading-tight sm:text-sm sm:leading-tight md:text-[0.9375rem] lg:whitespace-nowrap"
              />
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 shrink-0 rounded-md border-slate-300 bg-white px-1.5 text-[10px] font-semibold sm:h-7 sm:px-2 sm:text-[11px] md:text-xs landscape:hidden"
              onClick={() => handleLeaveQuiz('/quizzes')}
            >
              <ArrowLeft className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
              {t('Quay lại', 'Volver')}
            </Button>
          </div>

          <div className="rounded-md border border-slate-300/70 bg-slate-50/80 px-1.5 py-1 text-[clamp(0.625rem,2.2vmin,0.875rem)] leading-tight sm:px-2 landscape:col-start-2 landscape:row-start-1 landscape:flex landscape:items-center landscape:justify-between landscape:gap-2 landscape:py-1.5 landscape:text-sm landscape:leading-snug">
            <div className="min-w-0">
              <span className="font-bold">{t('Đề thi', 'Examen')}:</span>
              <span className="ml-1 break-words">{quiz.title}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-6 shrink-0 rounded-md border-slate-300 bg-white px-1.5 text-[11px] font-semibold landscape:inline-flex landscape:h-7 landscape:px-2 landscape:text-xs"
              onClick={() => handleLeaveQuiz('/quizzes')}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              {t('Quay lại', 'Volver')}
            </Button>
          </div>

          <div className="flex items-center justify-center rounded-md border border-slate-300/70 bg-slate-50/80 px-1 py-0.5 landscape:col-start-3 landscape:row-start-1 landscape:px-1.5 landscape:py-1">
            <div className="flex items-center gap-0.5 text-[clamp(0.625rem,2.2vmin,0.875rem)] landscape:text-sm">
              <Clock className="h-2.5 w-2.5 shrink-0 text-muted-foreground sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
              <span
                className={`font-sans tabular-nums text-[clamp(0.625rem,2.2vmin,0.875rem)] font-bold landscape:text-sm ${timer < 60 ? 'text-destructive' : 'text-foreground'}`}
              >
                {formatTimer(timer)}
              </span>
            </div>
          </div>

          <div className="rounded-md border border-slate-300/70 bg-slate-50/80 px-1.5 py-1 text-[clamp(0.625rem,2.2vmin,0.875rem)] leading-tight sm:px-2 landscape:col-start-2 landscape:row-start-2 landscape:py-1.5 landscape:text-sm landscape:leading-snug">
            <span className="font-bold">{t('Thí sinh', 'Aspirante')}:</span>
            <span className="ml-1 break-words">{candidateName}</span>
          </div>

          <div className="flex min-w-0 items-center justify-end px-0.5 py-1 sm:px-1 landscape:col-start-3 landscape:row-start-2 landscape:items-center landscape:py-1.5 landscape:pl-1 landscape:pr-0">
            <LanguageDropdown
              lang={lang}
              setLang={setLang}
              t={t}
              align="end"
              compact
              bareTrigger
            />
          </div>
        </div>

        {/* Portrait: một cột như điện thoại — ảnh + đề + đáp án cuộn; nút cố định dưới */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-300/70 bg-slate-100/65 p-1 sm:p-1.5 landscape:hidden">
          <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain rounded-lg border border-slate-300/60 bg-white px-2 py-[clamp(0.375rem,1.75dvh,0.625rem)]">
            <div className="space-y-1.5">
              {renderImageArea()}
              {error && <p className="text-xs text-destructive">{error}</p>}
              {renderQuestionHeader()}
              {renderAnswerList()}
            </div>
          </div>
          <div className="shrink-0 border-t border-slate-200/90 bg-white px-2 pb-[max(0.15rem,env(safe-area-inset-bottom))] pt-1">
            {renderNavButtons()}
          </div>
        </div>

        {/* Landscape: hai cột như máy tính */}
        <div
          className="hidden min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-2 rounded-xl border border-slate-300/70 bg-slate-100/65 p-2 landscape:grid landscape:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] landscape:grid-rows-1 landscape:gap-0 landscape:items-stretch"
        >
          <div
            className="flex min-h-0 shrink-0 flex-col gap-2 rounded-xl border border-slate-300/70 bg-white p-2 sm:p-3
              landscape:h-full landscape:min-h-[260px] landscape:gap-3 landscape:overflow-hidden landscape:rounded-r-none landscape:border-r-2 landscape:border-r-slate-300/80
              xl:min-h-[290px] xl:gap-3
              2xl:min-h-[320px]"
          >
            {renderImageArea()}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-300/70 bg-white landscape:h-full landscape:rounded-l-none landscape:border-l-0">
            {error && (
              <p className="shrink-0 px-2 pt-1.5 text-xs text-destructive landscape:px-2.5 xl:px-4 xl:pt-2">{error}</p>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-[clamp(0.375rem,1.5dvh,0.75rem)] pb-1 landscape:px-2.5 landscape:pb-1.5 xl:px-4 xl:pb-3 xl:pt-3">
              <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
                {renderQuestionHeader()}
                {renderAnswerList()}
                {mode === 'practice' && question.explanation && (
                  <button
                    type="button"
                    className="mt-2 inline-flex w-auto max-w-[min(100%,18rem)] shrink-0 items-center gap-1 self-start rounded-full border border-amber-600/55 bg-amber-100/95 px-2.5 py-1 text-[clamp(0.625rem,1.5vmin,0.75rem)] font-semibold leading-none text-amber-950 shadow-sm backdrop-blur-[1px] transition hover:bg-amber-200/95 disabled:cursor-not-allowed disabled:opacity-35"
                    disabled={explanationDisabled}
                    onClick={() => setShowExplanationPanel((prev) => !prev)}
                    aria-label={
                      showExplanationPanel
                        ? t('Ẩn giải thích', 'Ocultar explicación')
                        : t('Giải thích', 'Explicación')
                    }
                  >
                    <Lightbulb className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="truncate">
                      {showExplanationPanel
                        ? t('Ẩn', 'Ocultar')
                        : t('Giải thích', 'Explicación')}
                    </span>
                  </button>
                )}
                {mode === 'practice' &&
                  checkedForCurrent &&
                  showExplanationPanel &&
                  question.explanation && (
                    <div className="mt-2 rounded-lg border border-amber-600/25 bg-amber-50/80 p-2 shadow-sm landscape:mt-2 landscape:p-2.5">
                      <p className="mb-1 font-semibold text-[clamp(0.75rem,1.5vmin,0.875rem)] text-amber-950">
                        {t('Giải thích', 'Explicación')}
                      </p>
                      <p className="text-[clamp(0.75rem,1.45vmin,0.9375rem)] leading-relaxed text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  )}
              </div>

              <div className="shrink-0 border-t border-slate-200/90 bg-white pt-1 pb-0.5 xl:pt-1.5 xl:pb-1">
                {renderNavButtons()}
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-0 shrink-0 rounded-md border border-slate-300/70 bg-white p-1 md:p-1.5 xl:p-2"
        >
          {shouldUseTwoRowsOnMobile ? (
            <>
              <div
                className="grid gap-px landscape:hidden"
                style={{ gridTemplateColumns: `repeat(${mobileTopCount}, minmax(0, 1fr))` }}
              >
                {questions.slice(0, mobileTopCount).map((item, index) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded border font-semibold transition-all h-[clamp(1.375rem,3.8vmin,1.75rem)] text-[clamp(0.5625rem,1.85vmin,0.75rem)] leading-none ${getQuestionBadgeClassName(item.id, index)}`}
                      aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <div
                className="mt-px grid gap-px landscape:hidden"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(questions.length - mobileTopCount, 1)}, minmax(0, 1fr))`,
                }}
              >
                {questions.slice(mobileTopCount).map((item, idx) => {
                  const index = mobileTopCount + idx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded border font-semibold transition-all h-[clamp(1.375rem,3.8vmin,1.75rem)] text-[clamp(0.5625rem,1.85vmin,0.75rem)] leading-none ${getQuestionBadgeClassName(item.id, index)}`}
                      aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <div
                className="hidden gap-px landscape:grid landscape:grid-cols-18 xl:grid-cols-20 2xl:grid-cols-25"
              >
                {questions.map((item, index) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                       className={`rounded border font-semibold transition-all
                             h-[clamp(1.375rem,3.5vmin,1.75rem)] text-[clamp(0.625rem,1.9vmin,0.8125rem)] leading-none
                             xl:h-8 xl:text-sm
                             2xl:h-9 2xl:text-base
                             ${getQuestionBadgeClassName(item.id, index)}`}
                      aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div
              className="grid gap-px
                         grid-cols-10
                         sm:grid-cols-15
                         landscape:grid-cols-18
                         xl:grid-cols-20
                         2xl:grid-cols-25"
            >
              {questions.map((item, index) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded border font-semibold transition-all
                             h-[clamp(1.375rem,3.8vmin,1.75rem)] text-[clamp(0.5625rem,1.85vmin,0.75rem)] leading-none
                             landscape:h-7 landscape:text-xs
                             xl:h-8 xl:text-sm
                             2xl:h-9 2xl:text-base
                             ${getQuestionBadgeClassName(item.id, index)}`}
                    aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend — nhỏ gọn; màu khớp ô số câu */}
          <div
            className="mt-1.5 border-t border-border pt-1.5
                         flex flex-wrap items-center gap-x-1.5 gap-y-0.5
                         text-[9px] leading-tight sm:text-[10px] md:text-[11px] lg:text-xs"
          >
            <div
              className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 md:gap-x-2.5"
            >
              <span className="shrink-0 font-bold">
                {t('Chú thích', 'LEYENDA')}
              </span>

              <div className="flex items-center gap-0.5">
                <span
                  className="inline-block rounded-full border border-[#bcbcbc] bg-white h-1.5 w-3 sm:h-2 sm:w-3.5 md:h-2 md:w-4"
                />
                <span>
                  {mode === 'exam' ? t('chưa làm', 'no realizado') : t('chưa trả lời', 'no contestada')}
                </span>
              </div>

              {mode === 'exam' ? (
                <>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block rounded-full border border-sky-600 bg-sky-50 h-1.5 w-3 sm:h-2 sm:w-3.5 md:h-2 md:w-4"
                    />
                    <span>{t('đang xem', 'Actual')}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block rounded-full border border-emerald-600 bg-emerald-50 h-1.5 w-3 sm:h-2 sm:w-3.5 md:h-2 md:w-4"
                    />
                    <span>{t('đã làm', 'realizado')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block rounded-full border border-sky-600 bg-sky-50 h-1.5 w-3 sm:h-2 sm:w-3.5 md:h-2 md:w-4"
                    />
                    <span>{t('đang xem', 'Actual')}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block rounded-full border border-green-600 bg-green-50 h-1.5 w-3 sm:h-2 sm:w-3.5 md:h-2 md:w-4"
                    />
                    <span>{t('đúng', 'correcta')}</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block rounded-full border border-red-600 bg-red-50 h-1.5 w-3 sm:h-2 sm:w-3.5 md:h-2 md:w-4"
                    />
                    <span>{t('sai', 'incorrecta')}</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {mode === 'practice' &&
        checkedForCurrent &&
        showExplanationPanel &&
        question.explanation && (
          <div
            className="fixed inset-0 z-[120] hidden flex-col bg-background portrait:flex landscape:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-explanation-title"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-[clamp(0.5rem,2vmin,0.75rem)] shadow-sm">
              <p id="quiz-explanation-title" className="text-[clamp(0.875rem,2.5vmin,1.125rem)] font-semibold text-foreground">
                {t('Giải thích', 'Explicación')}
              </p>
              <button
                type="button"
                onClick={() => setShowExplanationPanel(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-burgundy/25 bg-white text-brand-heading shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t('Đóng', 'Cerrar')}
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-[clamp(0.75rem,2.5vmin,1.25rem)]">
              <p className="text-[clamp(0.8125rem,2.6vmin,1.0625rem)] leading-relaxed text-muted-foreground">
                {question.explanation}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default QuizTake;
