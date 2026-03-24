import { BookOpen, Clock, FileText, Target, Zap } from '@/components/BrandIcons';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getQuizzes, type QuizListItem } from '@/lib/api';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [activeType, setActiveType] = useState<string>('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'done' | 'todo'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatQuizType = (value: string) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

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

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_20%,rgba(255,214,224,0.45),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(255,228,171,0.45),transparent_35%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_55%,#f7eef5_100%)]">
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
        </div>
      </div>

      <div className="flex-1 px-2 pb-5 md:px-4 md:pb-8">
        <div className="container section-panel">
          <div className="mb-6 flex flex-wrap gap-2 md:gap-2.5">
            <Button
              variant={progressFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => setProgressFilter('all')}
            >
              {t('Tất cả trạng thái', 'Todos los estados')}
            </Button>
            <Button
              variant={progressFilter === 'done' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => setProgressFilter('done')}
            >
              {t('Đã làm', 'Completados')}
            </Button>
            <Button
              variant={progressFilter === 'todo' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => setProgressFilter('todo')}
            >
              {t('Chưa làm', 'No realizados')}
            </Button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 md:gap-2.5">
            <Button
              variant={activeType === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
              onClick={() => setActiveType('all')}
            >
              {t('Tất cả', 'Todos')}
            </Button>
            {quizTypes.map((type) => (
              <Button
                key={type}
                variant={activeType === type ? 'default' : 'outline'}
                size="sm"
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => setActiveType(type)}
              >
                {formatQuizType(type)}
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
                  <Card className="card-hover glassmorph-card h-full border-border/50">
                    <CardContent className="flex h-full flex-col p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Target className="h-4 w-4 text-primary md:h-5 md:w-5" />
                        </div>
                        {quiz.quiz_type && (
                          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary md:text-xs">
                            {formatQuizType(quiz.quiz_type)}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${quiz.has_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
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
                          {quiz.total_questions} {t('câu', 'preg.')}
                        </span>
                        {quiz.duration_minutes > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {quiz.duration_minutes} {t('phút', 'min')}
                          </span>
                        )}
                        {quiz.has_completed && typeof quiz.best_percentage === 'number' && (
                          <span className="flex items-center gap-1 text-emerald-700">
                            {t('Điểm cao nhất', 'Mejor resultado')}: {quiz.best_percentage}%
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/quiz/${quiz.id}?mode=practice`} className="flex-1">
                          <Button
                            variant="outline"
                            className="h-8 w-full gap-1.5 text-xs md:h-9 md:text-sm"
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
