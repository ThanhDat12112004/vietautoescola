import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getQuizzes, type QuizListItem } from '@/lib/api';
import { motion } from 'framer-motion';
import { BookOpen, Clock, FileText, Target, Zap } from 'lucide-react';
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
    if (activeType === 'all') {
      return quizzes;
    }
    return quizzes.filter((quiz) => quiz.quiz_type === activeType);
  }, [activeType, quizzes]);

  return (
    <div className="app-page min-h-screen flex flex-col">
      <Navbar />
      <div className="py-3 md:py-4 px-2 md:px-4">
        <div className="container border border-[#dbe3ee] bg-white/88 backdrop-blur-sm rounded-2xl shadow-sm py-5 md:py-6">
          <h1 className="font-display text-2xl md:text-3xl font-800 mb-1">
            {t('Làm bài thi mô phỏng', 'Exámenes simulados')}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            {t(
              'Chọn bài thi và chế độ làm bài. Luyện tập để kiểm tra từng câu hoặc thi thật để xem kết quả cuối cùng.',
              'Elige un examen y modo. Práctica para verificar cada pregunta o examen real para ver resultados al final.'
            )}
          </p>
        </div>
      </div>

      <div className="px-2 md:px-4 pb-4 flex-1">
        <div className="container border border-[#dbe3ee] bg-white/88 backdrop-blur-sm rounded-2xl shadow-sm py-5 md:py-6">
          <div className="flex flex-wrap gap-1.5 mb-6">
            <Button
              variant={activeType === 'all' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full h-7 text-xs"
              onClick={() => setActiveType('all')}
            >
              {t('Tất cả', 'Todos')}
            </Button>
            {quizTypes.map((type) => (
              <Button
                key={type}
                variant={activeType === type ? 'default' : 'outline'}
                size="sm"
                className="rounded-full h-7 text-xs"
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((quiz, i) => (
                <motion.div
                  key={quiz.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <Card className="card-hover h-full border-border/50">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        {quiz.quiz_type && (
                          <span className="text-[10px] font-medium text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">
                            {formatQuizType(quiz.quiz_type)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-sm mb-0.5">{quiz.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 flex-1 line-clamp-2">
                        {quiz.description || t('Không có mô tả', 'Sin descripción')}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {quiz.total_questions} {t('câu', 'preg.')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quiz.duration_minutes} {t('phút', 'min')}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/quiz/${quiz.id}?mode=practice`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full gap-1.5 h-8 text-xs"
                            size="sm"
                          >
                            <BookOpen className="h-3 w-3" />
                            {t('Luyện tập', 'Práctica')}
                          </Button>
                        </Link>
                        <Link to={`/quiz/${quiz.id}?mode=exam`} className="flex-1">
                          <Button className="w-full gap-1.5 h-8 text-xs" size="sm">
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
