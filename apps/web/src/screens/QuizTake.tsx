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
  Volume2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

type QuizMode = 'practice' | 'exam';

type CheckedMap = Record<number, CheckQuestionResult>;

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
  const [showExplanation, setShowExplanation] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [submitResult, setSubmitResult] = useState<SubmitAttemptResult | null>(null);

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

        setQuiz(detail);
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
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSelect = (answerId: number) => {
    if (!question) return;
    if (mode === 'practice' && checkedForCurrent) return;
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: answerId }));
  };

  useEffect(() => {
    setShowExplanation(false);
  }, [currentIndex]);

  const handleCheck = async () => {
    if (!attemptId || !question || !selectedId) return;

    try {
      const result = await checkQuestion(attemptId, question.id, selectedId);
      setCheckedMap((prev) => ({ ...prev, [question.id]: result }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Không kiểm tra được câu hỏi', 'No se pudo verificar la pregunta')
      );
    }
  };

  const handleFinish = async () => {
    if (!attemptId) return;

    try {
      const payload = Object.fromEntries(
        Object.entries(selectedAnswers).map(([key, value]) => [String(key), value])
      );
      const result = await submitAttempt(attemptId, payload);
      setSubmitResult(result);
      setShowResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Nộp bài thất bại', 'Error al enviar'));
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
      <div className="h-screen flex flex-col bg-background">
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
      <div className="h-screen flex flex-col bg-background">
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
                  setShowResult(false);
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[linear-gradient(135deg,#e9edf3_0%,#dae6f1_100%)] p-2 md:p-4">
      <div className="flex-1 flex flex-col overflow-hidden mx-auto w-full border bg-[#efefef] p-2 md:p-3">
        <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr_180px]">
          <div className="flex items-center gap-2 border border-black/30 bg-white px-3 py-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="font-bold">Viet Auto</p>
              <p className="text-xs text-muted-foreground">Escola</p>
            </div>
          </div>
          <div className="border border-black/30 bg-white px-3 py-2 text-sm">
            <span className="font-bold">Examen:</span> {quiz.title}
          </div>
          <div className="flex items-center justify-center border border-black/30 bg-white px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span
                className={`font-mono text-base font-bold ${timer < 60 ? 'text-destructive' : 'text-foreground'}`}
              >
                {formatTime(timer)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr_180px]">
          <div className="hidden border border-black/30 bg-white md:block" />
          <div className="border border-black/30 bg-white px-3 py-2 text-sm">
            <span className="font-bold">Aspirante:</span>{' '}
            {getStoredAuth()?.user?.username || 'Usuario'}
          </div>
          <div className="flex items-center justify-center border border-black/30 bg-white px-3 py-2">
            <button
              onClick={() => setLang(lang === 'vi' ? 'es' : 'vi')}
              className="w-full rounded-sm border border-black/20 bg-black px-2 py-1 text-sm font-semibold text-white"
            >
              {lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇪🇸 Español'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto grid grid-cols-1 gap-2 border border-black/20 bg-white p-2 md:grid-cols-[44%_56%]">
          <div className="border border-black/15 bg-[#f4f4f4] p-1.5">
            {question.image_url ? (
              <img
                src={question.image_url}
                alt="question"
                className="h-[240px] w-full object-cover md:h-[300px]"
              />
            ) : (
              <div className="flex h-[240px] items-center justify-center bg-[#ddd] text-sm text-muted-foreground md:h-[300px]">
                {t('Không có hình minh họa', 'Sin imagen')}
              </div>
            )}
          </div>

          <div className="min-w-0 px-1 md:px-2">
            {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

            <div className="mb-3 flex items-start gap-3">
              <span className="text-4xl font-black text-[#1f3f66] md:text-5xl">
                {String(question.order_number).padStart(2, '0')}.
              </span>
              <h3 className="pt-1 text-lg font-bold leading-6 md:text-2xl md:leading-8">
                {question.question_text}
              </h3>
            </div>

            <div className="space-y-2">
              {question.answers.map((answer, idx) => {
                const detail = detailsMap[question.id];
                const isSelected = selectedId === answer.id;
                const isCorrect = detail?.correct_answer_id === answer.id;
                const isWrong = Boolean(detail && isSelected && !detail.is_correct);
                const optionLetter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={answer.id}
                    onClick={() => handleSelect(answer.id)}
                    className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-base transition-colors md:text-lg ${
                      isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isWrong
                          ? 'border-destructive bg-destructive/10'
                          : isSelected
                            ? 'border-[#2b628f] bg-[#dcedfb]'
                            : 'border-[#d2d2d2] bg-white hover:bg-[#f5f9fd]'
                    }`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b8b8b8] bg-[#f3f3f3] text-xl font-bold text-[#5b5b5b]">
                      {optionLetter}
                    </span>
                    <span className="pt-1 leading-6">{answer.answer_text}</span>
                    <Volume2 className="ml-auto mt-1 h-4 w-4 shrink-0 text-[#4b86b3]" />
                  </button>
                );
              })}
            </div>

            {mode === 'practice' && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCheck}
                  disabled={!selectedId || Boolean(checkedForCurrent)}
                >
                  {t('Kiểm tra', 'Verificar')}
                </Button>
                {checkedForCurrent && (
                  <span
                    className={`text-xs font-semibold ${checkedForCurrent.is_correct ? 'text-green-600' : 'text-destructive'}`}
                  >
                    {checkedForCurrent.is_correct
                      ? t('Chính xác', 'Correcto')
                      : t('Sai', 'Incorrecto')}
                  </span>
                )}
              </div>
            )}

            {detailsMap[question.id]?.correct_answer_id && question.explanation && (
              <div className="mt-3 rounded-md border border-black/10 bg-[#f7f7f7] p-3 text-sm">
                <p className="mb-1 font-semibold">{t('Giải thích', 'Explicación')}</p>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <Button
                variant="outline"
                className="h-11 border-[#d0d0d0] bg-white text-base font-bold hover:bg-[#f6f6f6]"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="mr-1 h-4 w-4 text-[#f1b900]" /> {t('Trước', 'ANTERIOR')}
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  className="h-11 border border-[#d0d0d0] bg-white text-base font-bold text-black hover:bg-[#f6f6f6]"
                  onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                >
                  {t('Tiếp', 'SIGUIENTE')} <ArrowRight className="ml-1 h-4 w-4 text-[#f1b900]" />
                </Button>
              ) : (
                <Button
                  className="h-11 border border-[#d0d0d0] bg-white text-base font-bold text-black hover:bg-[#f6f6f6]"
                  onClick={() => void handleFinish()}
                >
                  {t('Nộp bài', 'FINALIZAR TEST')}
                </Button>
              )}

              <Button
                variant="outline"
                className="h-11 border-[#d0d0d0] bg-white text-base font-bold hover:bg-[#f6f6f6]"
                onClick={() => setShowExplanation((prev) => !prev)}
              >
                {showExplanation ? t('Ẩn giải thích', 'Ocultar ayuda') : t('Giải thích', 'Ayuda')}
              </Button>

              <Button
                variant="outline"
                className="h-11 border-[#d0d0d0] bg-white text-base font-bold hover:bg-[#f6f6f6]"
                onClick={() => void handleFinish()}
              >
                {t('Nộp bài', 'FINALIZAR TEST')}
              </Button>
            </div>

            {showExplanation && question.explanation && (
              <div className="mt-3 rounded-md border border-black/10 bg-[#f7f7f7] p-3 text-sm">
                <p className="mb-1 font-semibold">{t('Giải thích', 'Explicación')}</p>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 border border-black/20 bg-[#f7f7f7] p-2">
          <div className="grid grid-cols-8 gap-1.5 md:grid-cols-15">
            {questions.map((item, index) => {
              const isCurrent = index === currentIndex;
              const hasSelected = Boolean(selectedAnswers[item.id]);

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-10 rounded-sm border text-xl font-bold transition-colors md:h-11 ${
                    isCurrent
                      ? 'border-[#2b628f] bg-[#cbe6f9] text-[#234b6d]'
                      : hasSelected
                        ? 'border-[#8fb7d3] bg-[#eaf4fb] text-[#365f81]'
                        : 'border-[#bcbcbc] bg-white text-[#5f5f5f]'
                  }`}
                  aria-label={`${t('Câu', 'Pregunta')} ${index + 1}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-black/10 pt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold">LEYENDA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-8 rounded-full border border-[#8fb7d3] bg-[#eaf4fb]" />
              <span>contestada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-8 rounded-full border border-[#bcbcbc] bg-white" />
              <span>no contestada</span>
            </div>
            <div className="ml-auto text-sm font-semibold">
              {t('Câu', 'Pregunta')} {currentIndex + 1}/{questions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
