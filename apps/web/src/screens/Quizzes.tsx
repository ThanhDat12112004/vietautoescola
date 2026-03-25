import { BookOpen, FileText, Target, Zap } from '@/components/BrandIcons';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getQuizzes, type QuizListItem } from '@/lib/api';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const Quizzes = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [activeType, setActiveType] = useState<string>('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'done' | 'todo'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatQuizType = (value: string) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizeToken = (value: string) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const rows = await getQuizzes(lang);
        if (!active) return;
        setQuizzes(rows);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được danh sách đề', 'No se pudo cargar la lista')
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
  }, [lang, t]);

  const quizTypes = useMemo(() => {
    const names = quizzes
      .map((quiz) => quiz.quiz_type)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(names));
  }, [quizzes]);

  const requestedType = useMemo(() => String(searchParams.get('type') || '').trim(), [searchParams]);

  const requestedProgress = useMemo(() => {
    const raw = String(searchParams.get('progress') || '').trim().toLowerCase();
    return raw === 'done' || raw === 'todo' || raw === 'all' ? raw : '';
  }, [searchParams]);

  useEffect(() => {
    if (!requestedProgress) return;
    setProgressFilter(requestedProgress);
  }, [requestedProgress]);

  useEffect(() => {
    if (!requestedType) return;
    if (requestedType.toLowerCase() === 'all') {
      setActiveType('all');
      return;
    }

    const normalizedRequested = normalizeToken(requestedType);
    const matchedType = quizTypes.find((type) => {
      return (
        normalizeToken(type) === normalizedRequested ||
        normalizeToken(formatQuizType(type)) === normalizedRequested
      );
    });

    if (matchedType) {
      setActiveType(matchedType);

      if (requestedType !== matchedType) {
        const next = new URLSearchParams(searchParams);
        next.set('type', matchedType);
        setSearchParams(next, { replace: true });
      }
    }
  }, [formatQuizType, normalizeToken, quizTypes, requestedType, searchParams, setSearchParams]);

  const applyTypeFilter = (type: string) => {
    setActiveType(type);
    const next = new URLSearchParams(searchParams);
    if (type === 'all') {
      next.delete('type');
    } else {
      next.set('type', type);
    }
    setSearchParams(next, { replace: true });
  };

  const applyProgressFilter = (value: 'all' | 'done' | 'todo') => {
    setProgressFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('progress');
    } else {
      next.set('progress', value);
    }
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    return quizzes.filter((quiz) => {
      const byType = activeType === 'all' ? true : quiz.quiz_type === activeType;
      const byProgress =
        progressFilter === 'all'
          ? true
          : progressFilter === 'done'
            ? Boolean(quiz.has_completed)
            : !quiz.has_completed;
      return byType && byProgress;
    });
  }, [activeType, quizzes, progressFilter]);

  const progressCounts = useMemo(() => {
    const scoped =
      activeType === 'all' ? quizzes : quizzes.filter((quiz) => quiz.quiz_type === activeType);

    return {
      all: scoped.length,
      done: scoped.filter((quiz) => Boolean(quiz.has_completed)).length,
      todo: scoped.filter((quiz) => !quiz.has_completed).length,
    };
  }, [activeType, quizzes]);

  const typeCounts = useMemo(() => {
    const scoped =
      progressFilter === 'all'
        ? quizzes
        : quizzes.filter((quiz) =>
            progressFilter === 'done' ? Boolean(quiz.has_completed) : !quiz.has_completed
          );

    return scoped.reduce<Record<string, number>>((acc, quiz) => {
      const key = quiz.quiz_type || '';
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [progressFilter, quizzes]);

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_86%_8%,rgba(255,224,160,0.48),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]">
      <Navbar />
      <div className="px-2 py-4 md:px-4 md:py-6">
        <div className="container section-panel">
          <div className="mb-1 flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl md:text-3xl font-800">
              {t('Làm bài thi mô phỏng', 'Exámenes simulados')}
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {t(
              'Chọn bài thi và chế độ làm bài. Luyện tập để kiểm tra từng câu hoặc thi thật để xem kết quả cuối cùng.',
              'Elige un examen y modo. Práctica para verificar cada pregunta o examen real para ver resultados al final.'
            )}
          </p>
          {activeType !== 'all' && (
            <p className="mt-2 text-sm font-semibold text-primary">
              {t('Loại đang chọn', 'Tipo seleccionado')}: {formatQuizType(activeType)}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-2 pb-5 md:px-4 md:pb-8">
        <div className="container section-panel">
          <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[#7a2038]/12 bg-white/55 p-2 md:gap-2.5">
            <Button
              variant={progressFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => applyProgressFilter('all')}
            >
              {t('Tất cả trạng thái', 'Todos los estados')} ({progressCounts.all})
            </Button>
            <Button
              variant={progressFilter === 'done' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => applyProgressFilter('done')}
            >
              {t('Đã làm', 'Completados')} ({progressCounts.done})
            </Button>
            <Button
              variant={progressFilter === 'todo' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => applyProgressFilter('todo')}
            >
              {t('Chưa làm', 'No realizados')} ({progressCounts.todo})
            </Button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[#7a2038]/12 bg-white/55 p-2 md:gap-2.5">
            <Button
              variant={activeType === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => applyTypeFilter('all')}
            >
              {t('Tất cả', 'Todos')} ({
                progressFilter === 'all'
                  ? quizzes.length
                  : progressFilter === 'done'
                    ? quizzes.filter((quiz) => Boolean(quiz.has_completed)).length
                    : quizzes.filter((quiz) => !quiz.has_completed).length
              })
            </Button>
            {quizTypes.map((type) => (
              <Button
                key={type}
                variant={activeType === type ? 'default' : 'outline'}
                size="sm"
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => applyTypeFilter(type)}
              >
                {formatQuizType(type)} ({typeCounts[type] || 0})
              </Button>
            ))}
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
          )}
          {!loading && error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((quiz, i) => (
                <motion.div
                  key={quiz.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <Card className="card-hover glassmorph-card h-full border-primary/20 bg-white/78 shadow-[0_12px_26px_rgba(95,20,40,0.10)]">
                    <CardContent className="flex h-full flex-col p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Target className="h-4 w-4 text-primary md:h-5 md:w-5" />
                        </div>
                        {quiz.quiz_type && (
                          <span className="rounded-full border border-secondary/20 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary md:text-xs">
                            {formatQuizType(quiz.quiz_type)}
                          </span>
                        )}
                        <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium md:text-xs ${quiz.has_completed ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}
                        >
                          {quiz.has_completed
                            ? t('Đã làm', 'Completado')
                            : t('Chưa làm', 'No realizado')}
                        </span>
                      </div>

                      <h3 className="mb-1 font-display text-sm font-bold md:text-base">{quiz.title}</h3>
                      <p className="mb-4 flex-1 text-xs text-muted-foreground line-clamp-2 md:text-sm">
                        {quiz.description || t('Không có mô tả', 'Sin descripción')}
                      </p>

                      <div className="mb-4 flex items-center gap-3 text-[10px] text-muted-foreground md:text-xs">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {`${quiz.total_questions} ${t('câu', 'preg.')}`}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/quiz/${quiz.id}?mode=practice`} className="flex-1">
                          <Button
                            variant="outline"
                            className="h-8 w-full gap-1.5 border-primary/25 bg-white/75 text-xs text-primary hover:bg-white md:h-9 md:text-sm"
                            size="sm"
                          >
                            <BookOpen className="h-3 w-3" />
                            {t('Luyện tập', 'Práctica')}
                          </Button>
                        </Link>
                        <Link to={`/quiz/${quiz.id}?mode=exam`} className="flex-1">
                          <Button className="h-8 w-full gap-1.5 text-xs md:h-9 md:text-sm" size="sm">
                            <Zap className="h-3 w-3" />
                            {t('Thi thật', 'Examen')}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Quizzes;
