import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getLeaderboard, getQuizzes, type LeaderboardUser, type QuizListItem } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Car,
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

const Index = () => {
  const { t, lang } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);

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

  const stats = [
    { value: '500+', label: t('Câu hỏi', 'Preguntas') },
    { value: '2', label: t('Ngôn ngữ', 'Idiomas') },
    { value: '1000+', label: t('Học viên', 'Estudiantes') },
    { value: '95%', label: t('Tỷ lệ đậu', 'Tasa de aprobados') },
  ];

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [leaderboardRows, quizRows] = await Promise.all([
          getLeaderboard(8),
          getQuizzes(lang),
        ]);

        if (!active) return;
        setLeaderboard(leaderboardRows);
        setQuizzes(quizRows);
      } catch {
        // Keep homepage usable even if data loading fails.
      }
    })();

    return () => {
      active = false;
    };
  }, [lang]);

  const categoryNames = useMemo(() => {
    const values = quizzes
      .map((quiz) => quiz.category_name)
      .filter((item): item is string => Boolean(item));
    return Array.from(new Set(values)).slice(0, 6);
  }, [quizzes]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero-pattern relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-[10%] h-20 w-40 rounded-full bg-card blur-3xl" />
          <div className="absolute top-20 right-[15%] h-16 w-32 rounded-full bg-card blur-2xl" />
        </div>

        <div className="container relative py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <GraduationCap className="h-4 w-4" />
                {t('Hệ thống thi trực tuyến #1', 'Sistema de exámenes online #1')}
              </div>
              <h1 className="font-display text-4xl font-900 leading-tight md:text-5xl lg:text-6xl mb-6">
                {t('Mô phỏng bài thi lái xe ', 'Simulador de examen ')}
                <span className="text-gradient-primary">{t('song ngữ', 'bilingüe')}</span>
                {t(' Việt - Tây Ban Nha', ' vietnamita-español')}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                {t(
                  'Luyện thi bằng lái xe tại Tây Ban Nha với hệ thống câu hỏi song ngữ, giải thích chi tiết và bảng xếp hạng.',
                  'Practica para el examen de conducir en España con preguntas bilingües, explicaciones detalladas y ranking.'
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/quizzes">
                  <Button size="lg" className="gap-2 font-semibold text-base px-6">
                    {t('Học thử ngay', 'Empieza ahora')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="font-semibold text-base px-6">
                    {t('Đăng ký miễn phí', 'Regístrate gratis')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-72 h-72 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-soft" />
                <div className="absolute inset-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Car className="h-24 w-24 text-primary animate-float" />
                </div>
                <div className="absolute -top-2 -right-2 rounded-xl bg-card shadow-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold">DGT</span>
                </div>
                <div className="absolute -bottom-2 -left-2 rounded-xl bg-card shadow-lg p-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold">4.9★</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
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
                <Card className="card-hover h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Categories */}
      <section className="bg-sky-clouds py-16 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-800 mb-3">
              {t('Chủ đề luyện thi', 'Temas de práctica')}
            </h2>
            <p className="text-muted-foreground">
              {t('Chọn chủ đề bạn muốn ôn tập', 'Elige el tema que quieres repasar')}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryNames.map((cat, i) => (
              <motion.div
                key={cat}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link to="/quizzes">
                  <Card className="card-hover group cursor-pointer border-border/50 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Target className="h-7 w-7 text-accent" />
                      </div>
                      <h3 className="font-display font-bold text-lg mb-1">{cat}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t(
                          'Khám phá các đề liên quan trong danh mục này',
                          'Explora exámenes relacionados con esta categoría'
                        )}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
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

      {/* Leaderboard Preview */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="font-display text-3xl font-800 mb-3">
                {t('Bảng xếp hạng', 'Clasificación')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('Top học viên xuất sắc nhất', 'Los mejores estudiantes')}
              </p>

              <Card className="border-border/50">
                <CardContent className="p-0">
                  {leaderboard.slice(0, 5).map((user, i) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 px-5 py-3.5 ${
                        i !== 4 ? 'border-b border-border/50' : ''
                      } ${i < 3 ? 'bg-accent/5' : ''}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-display font-bold text-sm ${
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
                        <div className="font-medium text-sm truncate">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground">
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

              <Link to="/leaderboard" className="mt-4 inline-block">
                <Button variant="outline" className="gap-2">
                  {t('Xem đầy đủ', 'Ver todo')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Learning path */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <h2 className="font-display text-3xl font-800 mb-3">
                {t('Lộ trình học tập', 'Ruta de aprendizaje')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('3 bước đơn giản để sẵn sàng thi DGT', '3 pasos sencillos para el examen DGT')}
              </p>

              <div className="flex flex-col gap-4">
                {[
                  {
                    step: '01',
                    icon: BookOpen,
                    title: t('Học lý thuyết', 'Estudiar teoría'),
                    desc: t(
                      'Đọc tài liệu song ngữ, xem biển báo giao thông',
                      'Lee materiales bilingües, aprende las señales'
                    ),
                  },
                  {
                    step: '02',
                    icon: Target,
                    title: t('Luyện thi mô phỏng', 'Practicar simuladores'),
                    desc: t(
                      'Làm bài thi thử với câu hỏi thực tế từ DGT',
                      'Haz exámenes simulados con preguntas reales DGT'
                    ),
                  },
                  {
                    step: '03',
                    icon: Trophy,
                    title: t('Thi và đậu!', '¡Aprobar!'),
                    desc: t(
                      'Tự tin bước vào phòng thi với kiến thức vững chắc',
                      'Entra al examen con confianza y conocimiento sólido'
                    ),
                  },
                ].map((s, i) => (
                  <Card key={i} className="card-hover border-border/50">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <s.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-primary/60 mb-1">
                          {t('BƯỚC', 'PASO')} {s.step}
                        </div>
                        <h3 className="font-display font-bold mb-1">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-display text-3xl font-800 text-primary-foreground mb-4">
              {t('Sẵn sàng bắt đầu luyện thi?', '¿Listo para empezar a practicar?')}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              {t(
                'Đăng ký ngay để truy cập hàng trăm câu hỏi mô phỏng thi DGT miễn phí',
                'Regístrate para acceder a cientos de preguntas del examen DGT gratis'
              )}
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold text-base px-6 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t('Đăng ký miễn phí', 'Regístrate gratis')}
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
