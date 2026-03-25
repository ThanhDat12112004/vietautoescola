import BrandLogo from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import {
  checkQuestion,
  getQuizDetail,
  resolveMediaUrl,
  startAttempt,
  submitAttempt,
  type CheckQuestionResult,
  type QuizDetail,
  type SubmitAttemptResult,
} from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

type QuizMode = 'practice' | 'exam';

type CheckedMap = Record<number, CheckQuestionResult>;

function shuffleArray(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

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
  const candidateName = getStoredAuth()?.user?.username || '-';

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

  const questions = quiz?.questions || [];
  const question = questions[currentIndex];
  const selectedId = question ? selectedAnswers[question.id] : undefined;
  const checkedForCurrent = question ? checkedMap[question.id] : undefined;

  const detailsMap = useMemo(() => {
    const map: Record<number, CheckQuestionResult> = { ...checkedMap };
    submitResult?.details.forEach((item) => {
      map[item.question_id] = item;
    });
    return map;
  }, [checkedMap, submitResult]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${sec
        .toString()
        .padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '00')}`;
  };

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

  return (
    <div
      className="min-h-screen md:h-screen flex flex-col overflow-y-auto md:overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_88%_8%,rgba(255,226,165,0.5),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]
                   p-0"
    >
      <div
        className="flex-1 flex flex-col overflow-visible md:overflow-hidden w-full rounded-[1.1rem] border border-primary/15 bg-card/90 shadow-[0_16px_34px_rgba(95,20,40,0.12)]
                     p-1
                     sm:p-2
                     md:p-3
                     lg:p-4"
      >
        <div className="mb-3 grid gap-2 md:gap-3 grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[260px_1fr_160px]">
          <div className="col-span-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-white/75 px-2 py-2 text-sm md:px-3 lg:col-span-1 lg:row-span-2">
            <BrandLogo imageClassName="h-9 md:h-10 lg:h-11" withText />
          </div>

          <div className="rounded-lg border border-primary/20 bg-white/75 px-3 py-2 text-sm lg:text-base lg:col-start-2 lg:row-start-1">
            <span className="font-bold">{t('Đề thi', 'Examen')}:</span>
            <span className="ml-1 break-words">{quiz.title}</span>
          </div>

          <div className="flex items-center justify-center rounded-lg border border-primary/20 bg-white/75 px-2 py-2 lg:col-start-3 lg:row-start-1">
            <div className="flex items-center gap-1 text-sm lg:text-base">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span
                className={`font-mono text-sm font-bold lg:text-base ${timer < 60 ? 'text-destructive' : 'text-foreground'}`}
              >
                {formatTime(timer)}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-white/75 px-3 py-2 text-sm lg:text-base lg:col-start-2 lg:row-start-2">
            <span className="font-bold">{t('Thí sinh', 'Aspirante')}:</span>
            <span className="ml-1 break-words uppercase">{candidateName}</span>
          </div>

          <div className="rounded-lg border border-primary/20 bg-white/75 px-1 py-1 lg:col-start-3 lg:row-start-2">
            <button
              onClick={() => setLang(lang === 'vi' ? 'es' : 'vi')}
              className="mx-auto flex h-8 w-full items-center justify-center rounded-md border border-primary/20 bg-white text-lg font-semibold text-primary transition-colors hover:bg-primary/5"
              aria-label={t('Đổi ngôn ngữ', 'Cambiar idioma')}
            >
              {lang === 'vi' ? '🇻🇳' : '🇪🇸'}
            </button>
          </div>
        </div>

        <div
          className="flex-1 min-h-0 grid gap-2 md:gap-3 rounded-xl border border-primary/15 bg-background/75 p-2 md:p-3
                        grid-cols-1
                        md:grid-cols-2"
        >
          <div
            className="rounded-xl border border-primary/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,249,252,0.9)_100%)] p-3 flex flex-col overflow-visible md:overflow-hidden gap-3
                          min-h-0
                          md:min-h-[300px]
                          lg:min-h-[360px]
                          h-auto md:h-full"
          >
            <div className="w-full rounded-lg border border-primary/15 bg-white flex items-center justify-center overflow-hidden aspect-[16/10] md:aspect-auto md:flex-1">
              {question.image_url ? (
                <img
                  src={resolveMediaUrl(question.image_url)}
                  alt="question"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  {t('Không có hình minh họa', 'Sin imagen')}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-lg border border-primary/70 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_10px_20px_rgba(95,20,40,0.2)]"
              disabled={mode !== 'practice' || !checkedForCurrent || !question.explanation}
              onClick={() => setShowExplanationPanel((prev) => !prev)}
            >
              {showExplanationPanel
                ? t('Ẩn giải thích', 'Ocultar explicación')
                : t('Giải thích', 'Explicación')}
            </Button>

            {mode === 'practice' &&
              checkedForCurrent &&
              showExplanationPanel &&
              question.explanation && (
                <div className="rounded-lg border border-primary/20 bg-white p-3 shadow-sm">
                  <p className="mb-1 font-semibold text-sm">{t('Giải thích', 'Explicación')}</p>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {question.explanation}
                  </p>
                </div>
              )}
          </div>

          {/* RIGHT: Question + answers - responsive typography */}
          <div
            className="min-w-0 rounded-xl border border-primary/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,250,252,0.92)_100%)] px-2 py-2
                          md:px-3 md:py-2
                          lg:px-4 lg:py-3
                          flex flex-col"
          >
            {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

            <div className="flex-1 min-h-0 flex flex-col justify-start">
              {/* Question number and text */}
              <div
                className="mb-3 flex items-start gap-2
                              md:gap-3
                              lg:gap-4"
              >
                <span
                  className="font-black text-[#5a1428] leading-none drop-shadow-[0_1px_1px_rgba(95,20,40,0.14)]
                                text-2xl
                                md:text-3xl
                                lg:text-4xl
                                xl:text-5xl"
                >
                  {String(question.order_number).padStart(2, '0')}.
                </span>
                <h3
                  className="font-bold leading-tight pt-1
                              text-base
                              md:text-lg
                              lg:text-xl
                              xl:text-2xl"
                >
                  {question.question_text}
                </h3>
              </div>

              {/* Answer options */}
              <div className="mt-1 flex-1 min-h-0 space-y-2.5 w-full overflow-y-auto overflow-x-hidden pr-1">
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
                      className={`group flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left transition-all duration-200
                                 md:gap-3 md:px-3
                                 lg:gap-4 lg:px-4 lg:py-3
                                 ${
                                   isCorrect
                                     ? 'border-green-500 bg-green-50 shadow-[0_8px_18px_rgba(34,197,94,0.14)]'
                                     : isWrong
                                       ? 'border-destructive bg-destructive/10 shadow-[0_8px_18px_rgba(239,68,68,0.12)]'
                                       : isSelected
                                         ? 'border-primary bg-primary/10 shadow-[0_10px_20px_rgba(95,20,40,0.14)]'
                                         : 'border-primary/20 bg-white hover:-translate-y-[1px] hover:bg-primary/5 hover:shadow-[0_10px_18px_rgba(95,20,40,0.08)]'
                                 }`}
                    >
                      {badgeSrc ? (
                        <img
                          src={badgeSrc}
                          alt={`option-${idx + 1}`}
                          className="shrink-0 mt-0.5 h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 object-contain"
                        />
                      ) : (
                        <span
                          className="shrink-0 flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-bold text-[#5b5b5b] mt-0.5
                                      h-7 w-7 text-sm
                                      md:h-8 md:w-8 md:text-base
                                      lg:h-9 lg:w-9 lg:text-lg"
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                      )}
                      <span
                        className={`flex-1 break-words leading-tight pt-0.5 text-sm md:text-base lg:text-lg ${answerTextClass}`}
                      >
                        {answer.answer_text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons - 2 cột ở mobile, 3 cột ở desktop */}
            <div className="mt-3 grid gap-2 w-full grid-cols-3">
              <Button
                variant="outline"
                className="rounded-xl border-primary/25 bg-white/80 font-bold hover:bg-white transition-colors
                          h-10 text-sm
                          md:h-11 md:text-base
                          lg:h-12 lg:text-lg"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <ArrowLeft
                  className="mr-1 text-[#f1b900]
                                    h-3.5 w-3.5
                                    md:h-4 md:w-4
                                    lg:h-5 lg:w-5"
                />
                {t('Trước', 'ANTERIOR')}
              </Button>

              <Button
                className="rounded-xl border border-primary/20 bg-white/80 text-foreground font-bold hover:bg-white transition-colors
                          h-10 text-sm
                          md:h-11 md:text-base
                          lg:h-12 lg:text-lg"
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex === questions.length - 1}
              >
                {t('Tiếp', 'SIGUIENTE')}
                <ArrowRight
                  className="ml-1 text-[#f1b900]
                                     h-3.5 w-3.5
                                     md:h-4 md:w-4
                                     lg:h-5 lg:w-5"
                />
              </Button>

              <Button
                className="rounded-xl border border-primary/80 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-[0_10px_20px_rgba(95,20,40,0.22)]
                          h-10 text-sm
                          md:h-11 md:text-base
                          lg:h-12 lg:text-lg"
                onClick={() => void handleFinish()}
                disabled={isSubmitting || Boolean(submitResult)}
              >
                {isSubmitting
                  ? t('Đang nộp...', 'Enviando...')
                  : t('Nộp bài', 'FINALIZAR TEST')}
              </Button>
            </div>
          </div>
        </div>

        <div
          className="mt-3 rounded-xl border border-primary/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,249,252,0.9)_100%)] p-2
                       md:p-3 lg:p-4"
        >
          {shouldUseTwoRowsOnMobile ? (
            <>
              <div
                className="grid gap-1 md:hidden"
                style={{ gridTemplateColumns: `repeat(${mobileTopCount}, minmax(0, 1fr))` }}
              >
                {questions.slice(0, mobileTopCount).map((item, index) => {
                  const isCurrent = index === currentIndex;
                  const detail = detailsMap[item.id];
                  const hasJudged = Boolean(detail);
                  const isCorrect = Boolean(detail?.is_correct);

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-lg border font-bold transition-all h-8 text-sm ${
                        hasJudged
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : isCurrent
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                      aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <div
                className="mt-1 grid gap-1 md:hidden"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(questions.length - mobileTopCount, 1)}, minmax(0, 1fr))`,
                }}
              >
                {questions.slice(mobileTopCount).map((item, idx) => {
                  const index = mobileTopCount + idx;
                  const isCurrent = index === currentIndex;
                  const detail = detailsMap[item.id];
                  const hasJudged = Boolean(detail);
                  const isCorrect = Boolean(detail?.is_correct);

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-lg border font-bold transition-all h-8 text-sm ${
                        hasJudged
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : isCurrent
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                      aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <div
                className="hidden gap-1 md:grid md:grid-cols-18 lg:grid-cols-20 xl:grid-cols-25"
              >
                {questions.map((item, index) => {
                  const isCurrent = index === currentIndex;
                  const detail = detailsMap[item.id];
                  const hasJudged = Boolean(detail);
                  const isCorrect = Boolean(detail?.is_correct);

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                       className={`rounded-lg border font-bold transition-all
                             h-9 text-base
                             lg:h-10 lg:text-lg
                             xl:h-11 xl:text-xl
                             ${
                               hasJudged
                                 ? isCorrect
                                   ? 'border-green-500 bg-green-50 text-green-700'
                                   : 'border-red-500 bg-red-50 text-red-700'
                                 : isCurrent
                                   ? 'border-primary bg-primary/10 text-primary'
                                   : 'border-border bg-background text-muted-foreground hover:bg-muted'
                             }`}
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
              className="grid gap-1
                         grid-cols-10
                         sm:grid-cols-15
                         md:grid-cols-18
                         lg:grid-cols-20
                         xl:grid-cols-25"
            >
              {questions.map((item, index) => {
                const isCurrent = index === currentIndex;
                const detail = detailsMap[item.id];
                const hasJudged = Boolean(detail);
                const isCorrect = Boolean(detail?.is_correct);

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-lg border font-bold transition-all
                             h-8 text-sm
                             md:h-9 md:text-base
                             lg:h-10 lg:text-lg
                             xl:h-11 xl:text-xl
                             ${
                               hasJudged
                                 ? isCorrect
                                   ? 'border-green-500 bg-green-50 text-green-700'
                                   : 'border-red-500 bg-red-50 text-red-700'
                                 : isCurrent
                                   ? 'border-primary bg-primary/10 text-primary'
                                   : 'border-border bg-background text-muted-foreground hover:bg-muted'
                             }`}
                    aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend and counter - responsive layout */}
          <div
            className="mt-3 pt-3 border-t border-border
                         flex flex-wrap items-center justify-between gap-2
                         text-xs md:text-sm lg:text-base"
          >
            {/* Legend items */}
            <div
              className="flex flex-wrap items-center gap-3
                           md:gap-4 lg:gap-6"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs md:text-sm lg:text-base">
                  {t('Chú thích', 'LEYENDA')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block rounded-full border border-[#bcbcbc] bg-white
                               h-2.5 w-6
                               md:h-3 md:w-7
                               lg:h-3.5 lg:w-8"
                />
                <span className="text-xs md:text-sm lg:text-base">
                  {t('chưa trả lời', 'no contestada')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block rounded-full border border-green-500 bg-green-100
                               h-2.5 w-6
                               md:h-3 md:w-7
                               lg:h-3.5 lg:w-8"
                />
                <span className="text-xs md:text-sm lg:text-base">{t('đúng', 'correcta')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block rounded-full border border-red-500 bg-red-100
                               h-2.5 w-6
                               md:h-3 md:w-7
                               lg:h-3.5 lg:w-8"
                />
                <span className="text-xs md:text-sm lg:text-base">{t('sai', 'incorrecta')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
