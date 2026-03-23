import BrandLogo from '@/components/BrandLogo';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getHomeSummary,
  getLeaderboard,
  getQuizzes,
  getSubjects,
  type HomeSummary,
  type LeaderboardUser,
  type QuizListItem,
  type Subject,
} from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Medal,
  Shield,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const DEFAULT_QUIZ_TYPES = ['general', 'bien_bao', 'cao_toc', 'ly_thuyet', 'an_toan', 'sa_hinh'];

const Index = () => {
  const { t, lang } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homeSummary, setHomeSummary] = useState<HomeSummary | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: t('Đề thi mô phỏng DGT', 'Simulador examen DGT'),
      desc: t(
        'Làm bài thi sát hạch mô phỏng với hàng trăm câu hỏi thực tế',
        'Practica con cientos de preguntas reales del examen DGT'
      ),
    },
    {
      icon: Globe2,
      title: t('Song ngữ Việt - Tây Ban Nha', 'Bilingüe vietnamita-español'),
      desc: t(
        'Học bằng tiếng Việt hoặc tiếng Tây Ban Nha, chuyển đổi linh hoạt',
        'Estudia en vietnamita o español, cambia de idioma fácilmente'
      ),
    },
    {
      icon: Trophy,
      title: t('Bảng xếp hạng & Thành tích', 'Ranking y logros'),
      desc: t(
        'Theo dõi tiến độ, so sánh với bạn bè trên bảng xếp hạng',
        'Sigue tu progreso y compárate con otros en el ranking'
      ),
    },
    {
      icon: Shield,
      title: t('Giải thích chi tiết', 'Explicaciones detalladas'),
      desc: t(
        'Mỗi câu hỏi đều có giải thích rõ ràng giúp bạn hiểu sâu',
        'Cada pregunta incluye explicaciones claras para entender mejor'
      ),
    },
  ];

  const stats = useMemo(
    () => [
      {
        value: String(
          homeSummary?.total_questions ||
            quizzes.reduce((sum, item) => sum + Number(item.total_questions || 0), 0)
        ),
        label: t('Câu hỏi', 'Preguntas'),
      },
      { value: '2', label: t('Ngôn ngữ', 'Idiomas') },
      {
        value: String(homeSummary?.total_students || leaderboard.length),
        label: t('Học viên', 'Estudiantes'),
      },
      {
        value: `${homeSummary?.pass_rate ?? 0}%`,
        label: t('Tỷ lệ đậu', 'Tasa de aprobados'),
      },
    ],
    [homeSummary, quizzes, leaderboard.length, t]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [leaderboardRows, quizRows, subjectRows, summary] = await Promise.all([
          getLeaderboard(8),
          getQuizzes(lang),
          getSubjects(lang),
          getHomeSummary(),
        ]);

        if (!active) return;
        setLeaderboard(leaderboardRows);
        setQuizzes(quizRows);
        setSubjects(subjectRows);
        setHomeSummary(summary);
      } catch {
        // Keep homepage usable even if data loading fails.
      }
    })();

    return () => {
      active = false;
    };
  }, [lang]);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAuthenticated(Boolean(auth?.token));
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  const quizTypes = useMemo(() => {
    const values = quizzes
      .map((quiz) => quiz.quiz_type)
      .filter((item): item is string => Boolean(item));
    const unique = Array.from(new Set(values));
    if (unique.length) return unique.slice(0, 6);
    return DEFAULT_QUIZ_TYPES;
  }, [quizzes]);

  const formatQuizType = (value: string) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-8 md:py-10">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-8 left-[8%] h-24 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-16 right-[12%] h-20 w-36 rounded-full bg-accent/20 blur-2xl" />
        </div>

        <div className="container relative glassmorph-pane rounded-3xl p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-1.5 text-base font-semibold text-primary">
                <GraduationCap className="h-4 w-4" />
                {t('Hệ thống thi trực tuyến #1', 'Sistema de exámenes online #1')}
              </div>
              <h1 className="font-display text-4xl font-900 leading-tight md:text-5xl lg:text-6xl mb-5">
                {t('Chinh phục bằng lái xe ', 'Domina tu examen de conducir ')}
                <span className="text-gradient-primary">{t('song ngữ', 'bilingüe')}</span>
                {t(' Việt - Tây Ban Nha', ' vietnamita-español')}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-lg">
                {t(
                  'Bộ đề bám sát thực tế DGT, chấm điểm tức thì, giải thích rõ ràng và lộ trình học thông minh để bạn đậu nhanh hơn.',
                  'Exámenes estilo DGT, corrección instantánea, explicaciones claras y una ruta de estudio inteligente para aprobar más rápido.'
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/quizzes">
                  <Button size="lg" className="gap-2 font-semibold text-base px-6">
                    {t('Học thử ngay', 'Empieza ahora')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="font-semibold text-base px-6">
                      {t('Đăng ký miễn phí', 'Regístrate gratis')}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full bg-primary/14 animate-pulse-soft" />
                <div className="absolute inset-4 rounded-full bg-primary/24 flex items-center justify-center glassmorph-card">
                  <BrandLogo imageClassName="h-24 md:h-28 animate-float" />
                </div>
                <div className="absolute -top-2 -right-2 rounded-xl glassmorph-card p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold">DGT</span>
                </div>
                <div className="absolute -bottom-2 -left-2 rounded-xl glassmorph-card p-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold">4.9★</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-4">
        <div className="container py-6">
          <div className="glassmorph-pane rounded-2xl p-5 md:p-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="font-display text-3xl font-900 text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 md:py-14">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-8"
          >
            <h2 className="font-display text-3xl font-800 mb-3">
              {t('Tại sao chọn Viet Auto Escola?', '¿Por qué elegir Viet Auto Escola?')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                'Nền tảng được thiết kế đặc biệt cho cộng đồng người Việt tại Tây Ban Nha',
                'Plataforma diseñada especialmente para la comunidad vietnamita en España'
              )}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="card-hover glassmorph-card h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-bold">{f.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Types */}
      <section className="py-10 md:py-14">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-8"
          >
            <h2 className="font-display text-3xl font-800 mb-3">
              {t('Loại đề luyện thi', 'Tipos de examen')}
            </h2>
            <p className="text-muted-foreground">
              {t('Chọn loại đề bạn muốn tập trung', 'Elige el tipo de examen que quieres dominar')}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizTypes.map((type, i) => (
              <motion.div
                key={type}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link to="/quizzes">
                  <Card className="card-hover glassmorph-card group cursor-pointer border-border/50 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Target className="h-7 w-7 text-accent" />
                      </div>
                      <h3 className="mb-1 font-display text-xl font-bold">
                        {formatQuizType(type)}
                      </h3>
                      <p className="mb-4 text-base text-muted-foreground">
                        {t(
                          'Bộ đề được nhóm theo loại để bạn luyện đúng trọng tâm',
                          'Exámenes agrupados por tipo para practicar con enfoque'
                        )}
                      </p>
                      <span className="inline-flex items-center gap-1 text-base font-medium text-primary group-hover:gap-2 transition-all">
                        {t('Khám phá ngay', 'Explorar')} <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Material Subjects */}
      <section className="py-10 md:py-12">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-8"
          >
            <h2 className="font-display text-3xl font-800 mb-3">
              {t('Chủ đề tài liệu', 'Temas de materiales')}
            </h2>
            <p className="text-muted-foreground">
              {t(
                'Ôn tập theo từng chủ đề tài liệu chính',
                'Repasa por temas principales de materiales'
              )}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 6).map((subject, i) => (
              <motion.div
                key={subject.id}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link to="/materials">
                  <Card className="card-hover glassmorph-card h-full border-border/50">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 font-display text-xl font-bold">{subject.name}</h3>
                      <p className="mb-4 text-base text-muted-foreground leading-relaxed">
                        {subject.description ||
                          t('Xem tài liệu chi tiết cho chủ đề này', 'Ver materiales de este tema')}
                      </p>
                      <span className="inline-flex items-center gap-1 text-base font-medium text-primary">
                        {t('Xem tài liệu', 'Ver materiales')} <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-8 md:py-10">
        <div className="container">
          <div className="grid items-start gap-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="mb-2 font-display text-3xl font-800">
                {t('Bảng xếp hạng', 'Clasificación')}
              </h2>
              <p className="mb-4 text-base text-muted-foreground">
                {t('Top học viên xuất sắc nhất', 'Los mejores estudiantes')}
              </p>

              <Card className="glassmorph-card border-border/50">
                <CardContent className="p-0">
                  {leaderboard.slice(0, 5).map((user, i) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 px-5 py-3 ${
                        i !== 4 ? 'border-b border-border/50' : ''
                      } ${i < 3 ? 'bg-accent/5' : ''}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-display font-bold text-base ${
                          i === 0
                            ? 'bg-accent text-accent-foreground'
                            : i === 1
                              ? 'bg-muted text-foreground'
                              : i === 2
                                ? 'bg-primary/15 text-primary'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i < 3 ? <Medal className="h-4 w-4" /> : i + 1}
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base truncate">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.total_quizzes} {t('bài thi', 'exámenes')}
                        </div>
                      </div>
                      <div className="font-display font-bold text-primary">
                        {Number(user.total_score || 0).toFixed(1)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Link to="/leaderboard" className="mt-3 inline-block">
                <Button variant="outline" className="gap-2">
                  {t('Xem đầy đủ', 'Ver todo')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="glassmorph-pane rounded-3xl px-6 py-8 md:px-10"
          >
            <h2 className="font-display text-3xl font-800 text-primary mb-4">
              {t('Sẵn sàng bắt đầu luyện thi?', '¿Listo para empezar a practicar?')}
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
              {t(
                'Đăng ký ngay để truy cập hàng trăm câu hỏi mô phỏng thi DGT miễn phí',
                'Regístrate para acceder a cientos de preguntas del examen DGT gratis'
              )}
            </p>
            <Link to={isAuthenticated ? '/quizzes' : '/register'}>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold text-base px-6 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isAuthenticated
                  ? t('Làm bài thi ngay', 'Haz el examen ahora')
                  : t('Đăng ký miễn phí', 'Regístrate gratis')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
