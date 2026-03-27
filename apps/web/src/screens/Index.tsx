import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Medal,
  Target,
  Users,
} from '@/components/BrandIcons';
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
  getQuizTypes,
  getSubjects,
  resolveMediaUrl,
  type HomeSummary,
  type LeaderboardUser,
  type QuizListItem,
  type QuizType,
  type Subject,
} from '@/lib/api';
import { getStoredAuth, type AuthUser } from '@/lib/auth';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [quizTypeCatalog, setQuizTypeCatalog] = useState<QuizType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homeSummary, setHomeSummary] = useState<HomeSummary | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const materialsRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [leaderboardRows, quizRows, quizTypeRows, subjectRows, summary] = await Promise.all([
          getLeaderboard(10),
          getQuizzes(lang),
          getQuizTypes(lang),
          getSubjects(lang),
          getHomeSummary(),
        ]);

        if (!active) return;
        setLeaderboard(leaderboardRows);
        setQuizzes(quizRows);
        setQuizTypeCatalog(quizTypeRows);
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
      setCurrentUser(auth?.user || null);
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    window.addEventListener('auth-updated', syncAuth as EventListener);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('auth-updated', syncAuth as EventListener);
    };
  }, []);

  const quizTypes = useMemo(() => {
    const values = quizzes
      .map((quiz) => quiz.quiz_type)
      .filter((item): item is string => Boolean(item));
    return Array.from(new Set(values)).slice(0, 6);
  }, [quizzes]);

  const formatQuizType = (value: string) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizeText = (value: string) => value.toLowerCase().trim();

  const getTopicDescriptionByType = (type: string) => {
    const formattedType = formatQuizType(type);
    const matchedType = quizTypeCatalog.find(
      (quizType) =>
        normalizeText(quizType.code) === normalizeText(type) ||
        normalizeText(quizType.name) === normalizeText(formattedType)
    );

    if (matchedType?.description?.trim()) {
      return matchedType.description.trim();
    }

    return t('Chủ đề này chưa có mô tả chi tiết.', 'Este tema aun no tiene descripcion detallada.');
  };

  const primaryQuizType = quizTypes[0] || null;

  const primaryTypeQuizzes = useMemo(
    () =>
      primaryQuizType
        ? quizzes.filter((quiz) => String(quiz.quiz_type || '') === String(primaryQuizType))
        : [],
    [primaryQuizType, quizzes]
  );

  const primaryTypeDescription = useMemo(
    () => (primaryQuizType ? getTopicDescriptionByType(primaryQuizType) : ''),
    [primaryQuizType, quizTypeCatalog, t]
  );

  const topLeaderboard = useMemo(
    () =>
      [...leaderboard]
        .sort(
          (a, b) =>
            Number(b.average_percentage || 0) - Number(a.average_percentage || 0) ||
            Number(b.total_score || 0) - Number(a.total_score || 0)
        )
        .slice(0, 10),
    [leaderboard]
  );

  const champion = topLeaderboard[0] || null;

  const quickStats = useMemo(
    () => [
      {
        label: t('Số đề trắc nghiệm', 'Total de examenes'),
        value: Number(quizzes.length || 0).toLocaleString('vi-VN'),
        hint: t('Đề ôn luyện theo chuẩn DGT', 'Examenes de practica tipo DGT'),
        icon: BookOpen,
      },
      {
        label: t('Số tài liệu học', 'Total de materiales'),
        value: Number(subjects.length || 0).toLocaleString('vi-VN'),
        hint: t('Chủ đề, biển báo, mẹo làm đề', 'Temas, senales y guias de estudio'),
        icon: FileText,
      },
      {
        label: t('Số học viên', 'Total de estudiantes'),
        value: Number(homeSummary?.total_students || 0).toLocaleString('vi-VN'),
        hint: t('Đang học và luyện thi hằng ngày', 'Aprendiendo y practicando cada dia'),
        icon: Users,
      },
      {
        label: t('Tỷ lệ đậu trung bình', 'Tasa media de aprobacion'),
        value: `${Number(homeSummary?.pass_rate || 0).toFixed(1)}%`,
        hint: t('Theo thống kê kết quả gần đây', 'Segun resultados recientes'),
        icon: CheckCircle2,
      },
    ],
    [homeSummary?.pass_rate, homeSummary?.total_students, quizzes.length, subjects.length, t]
  );

  const leftProfileUser = useMemo(() => {
    if (!currentUser) return champion;

    const myLeaderboardRow = leaderboard.find((item) => Number(item.id) === Number(currentUser.id));

    if (myLeaderboardRow) {
      return {
        ...myLeaderboardRow,
        full_name: myLeaderboardRow.full_name || currentUser.full_name || currentUser.username,
        username: myLeaderboardRow.username || currentUser.username,
        avatar_url: myLeaderboardRow.avatar_url || currentUser.avatar_url,
      };
    }

    return {
      id: currentUser.id,
      full_name: currentUser.full_name || currentUser.username,
      username: currentUser.username,
      avatar_url: currentUser.avatar_url || null,
      total_quizzes: 0,
      average_percentage: 0,
      total_score: 0,
    };
  }, [champion, currentUser, leaderboard]);

  const rankedLeaderboard = useMemo(
    () => topLeaderboard.map((user, index) => ({ ...user, rank: index + 1 })),
    [topLeaderboard]
  );

  const raceTopFive = useMemo(() => rankedLeaderboard.slice(0, 5), [rankedLeaderboard]);

  const loopingSubjects = useMemo(
    () => (subjects.length > 1 ? [...subjects, ...subjects] : subjects),
    [subjects]
  );

  useEffect(() => {
    const rail = materialsRailRef.current;
    if (!rail || subjects.length <= 1) return;

    let rafId = 0;
    let paused = false;
    const speed = 0.45;

    const tick = () => {
      if (!paused) {
        rail.scrollLeft += speed;
        const loopPoint = rail.scrollWidth / 2;
        if (rail.scrollLeft >= loopPoint) {
          rail.scrollLeft = 0;
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const pause = () => {
      paused = true;
    };

    const resume = () => {
      paused = false;
    };

    rail.addEventListener('mouseenter', pause);
    rail.addEventListener('mouseleave', resume);
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('touchend', resume, { passive: true });

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      rail.removeEventListener('mouseenter', pause);
      rail.removeEventListener('mouseleave', resume);
      rail.removeEventListener('touchstart', pause);
      rail.removeEventListener('touchend', resume);
    };
  }, [subjects.length]);

  const handleMaterialsRailWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const rail = materialsRailRef.current;
    if (!rail) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      rail.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  };

  const features = [
    {
      title: t('Đề thi mô phỏng DGT', 'Simulador examen DGT'),
      image: '/brand/benefit_1.png',
      desc: t(
        'Làm bài thi sát hạch mô phỏng với hàng trăm câu hỏi thực tế',
        'Practica con cientos de preguntas reales del examen DGT'
      ),
    },
    {
      title: t('Song ngữ Việt - Tây Ban Nha', 'Bilingüe vietnamita-español'),
      image: '/brand/benefit_2.png',
      desc: t(
        'Học bằng tiếng Việt hoặc tiếng Tây Ban Nha, chuyển đổi linh hoạt',
        'Estudia en vietnamita o español, cambia de idioma fácilmente'
      ),
    },
    {
      title: t('Bảng xếp hạng & Thành tích', 'Ranking y logros'),
      image: '/brand/benefit_3.png',
      desc: t(
        'Theo dõi tiến độ, so sánh với bạn bè trên bảng xếp hạng',
        'Sigue tu progreso y compárate con otros en el ranking'
      ),
    },
    {
      title: t('Giải thích chi tiết', 'Explicaciones detalladas'),
      image: '/brand/benefit_4.png',
      desc: t(
        'Mỗi câu hỏi đều có giải thích rõ ràng giúp bạn hiểu sâu',
        'Cada pregunta incluye explicaciones claras para entender mejor'
      ),
    },
  ];

  return (
    <div className="app-page min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section - Professional & Trustworthy */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-sky-light to-background py-16 sm:py-20 md:py-24 lg:py-28">
        {/* Subtle background pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url('/brand/hero.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Gradient overlay for professional look */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95"
        />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Trust badge */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-white px-5 py-2.5 shadow-sm">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {t('Chuẩn DGT - Đã giúp hơn 10,000+ học viên', 'Estándar DGT - Más de 10,000+ estudiantes')}
                </span>
              </div>

              {/* Main heading */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {t(
                  'Bằng lái xe Tây Ban Nha',
                  'Permiso de conducir en España'
                )}
                <span className="mt-2 block text-primary">
                  {t('Học thông minh, Đậu nhanh', 'Aprende inteligente, Aprueba rápido')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                {t(
                  'Hệ thống luyện thi DGT song ngữ với hàng ngàn câu hỏi thực tế, chấm điểm tức thì và giải thích chi tiết',
                  'Sistema de práctica DGT bilingüe con miles de preguntas reales, corrección instantánea y explicaciones detalladas'
                )}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link to="/quizzes" className="inline-flex">
                  <Button
                    size="lg"
                    className="w-full gap-2.5 rounded-xl bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-secondary hover:shadow-xl sm:w-auto"
                  >
                    {t('Bắt đầu luyện thi', 'Empezar a practicar')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="inline-flex">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full rounded-xl border-2 border-primary/30 bg-transparent px-8 py-6 text-base font-semibold text-primary transition-all hover:bg-primary/5 sm:w-auto"
                    >
                      {t('Đăng ký miễn phí', 'Registro gratuito')}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8 lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                  <span className="font-medium">{t('100% miễn phí', '100% gratis')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                  <span className="font-medium">{t('Song ngữ Việt-Tây', 'Bilingüe Viet-Esp')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                  <span className="font-medium">{t('Cập nhật 2024', 'Actualizado 2024')}</span>
                </div>
              </div>
            </motion.div>

            {/* Right column - Visual/Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Profile/Stats Card */}
              {leftProfileUser && (
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="section-panel relative overflow-hidden p-6 sm:p-8">
                    {/* User info if logged in */}
                    <div className="mb-6 flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
                        {leftProfileUser.avatar_url ? (
                          <img
                            src={resolveMediaUrl(leftProfileUser.avatar_url)}
                            alt={leftProfileUser.full_name || leftProfileUser.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
                            {(leftProfileUser.full_name || leftProfileUser.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {isAuthenticated ? t('Tiến độ của bạn', 'Tu progreso') : t('Học viên xuất sắc', 'Estudiante destacado')}
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {leftProfileUser.full_name || leftProfileUser.username}
                        </p>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-primary/5 p-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Number(leftProfileUser.total_quizzes || 0)}
                        </div>
                        <div className="mt-1 text-xs font-medium text-muted-foreground">
                          {t('Bài thi', 'Exámenes')}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gold/10 p-4 text-center">
                        <div className="text-2xl font-bold text-gold">
                          {Number(leftProfileUser.average_percentage || 0).toFixed(0)}%
                        </div>
                        <div className="mt-1 text-xs font-medium text-muted-foreground">
                          {t('Điểm TB', 'Promedio')}
                        </div>
                      </div>
                      <div className="rounded-lg bg-accent/10 p-4 text-center">
                        <div className="text-2xl font-bold text-accent-foreground">
                          {Number(leftProfileUser.total_score || 0)}
                        </div>
                        <div className="mt-1 text-xs font-medium text-muted-foreground">
                          {t('Điểm số', 'Puntos')}
                        </div>
                      </div>
                    </div>

                    {/* CTA inside card */}
                    {!isAuthenticated && (
                      <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="text-center text-sm font-medium text-foreground">
                          {t('Bắt đầu hành trình của bạn ngay hôm nay', 'Comienza tu viaje hoy')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/20 blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Features - Below Hero */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={1}
        className="container mx-auto max-w-7xl -mt-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="section-panel">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="group text-center transition-all"
              >
                <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md sm:p-5">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="mx-auto mb-3 h-12 w-auto object-contain transition-transform group-hover:scale-110 sm:h-16"
                    loading="lazy"
                  />
                  <h3 className="mb-1.5 font-display text-sm font-bold text-foreground sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Section - Professional */}
      <section className="relative w-full bg-primary py-12 sm:py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {quickStats.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <item.icon className="mx-auto mb-3 h-8 w-8 text-primary-foreground/80" />
                <p className="mb-1 text-4xl font-black text-primary-foreground">
                  {item.value}
                </p>
                <p className="text-sm font-semibold text-primary-foreground/90">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  {item.hint}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Quiz Types Section - Professional Grid */}
      <section className="relative bg-muted/50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {t('Đề thi theo mục tiêu', 'Exámenes por objetivo')}
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                {t(
                  'Chọn dạng đề phù hợp để học hiệu quả và nâng điểm nhanh chóng.',
                  'Elige el tipo de examen adecuado para mejorar rápidamente.'
                )}
              </p>
            </div>
            <Link to="/quizzes" className="inline-flex">
              <Button className="gap-2 bg-primary px-6 text-primary-foreground hover:bg-secondary">
                {t('Xem tất cả', 'Ver todos')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {quizTypes.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Featured Quiz Type - Large Card */}
              <motion.div
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="lg:col-span-2 lg:row-span-2"
              >
                <Link to={`/quizzes?type=${encodeURIComponent(quizTypes[0])}`}>
                  <Card className="group h-full overflow-hidden border-0 bg-gradient-to-br from-primary to-secondary shadow-lg transition-all hover:shadow-xl">
                    <CardContent className="flex h-full min-h-[320px] flex-col justify-end p-6 sm:p-8">
                      <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                        <Target className="h-4 w-4" />
                        {t('Đề nổi bật', 'Destacado')}
                      </div>
                      <h3 className="mb-3 font-display text-2xl font-bold text-white sm:text-3xl">
                        {formatQuizType(quizTypes[0])}
                      </h3>
                      <p className="mb-4 max-w-lg text-base text-white/90">
                        {primaryTypeDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white">
                          {lang === 'vi'
                            ? `${primaryTypeQuizzes.length} bài thi`
                            : `${primaryTypeQuizzes.length} exámenes`}
                        </span>
                        <span className="inline-flex items-center gap-2 font-semibold text-white transition-transform group-hover:translate-x-1">
                          {t('Bắt đầu', 'Empezar')} <ArrowRight className="h-5 w-5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              {/* Other Quiz Types - Smaller Cards */}
              {quizTypes.slice(1, 5).map((type, i) => {
                const typeQuizzes = quizzes.filter(
                  (quiz) => String(quiz.quiz_type || '') === String(type)
                );
                const typeDescription = getTopicDescriptionByType(type);

                return (
                  <motion.div
                    key={type}
                    custom={i + 2}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <Link to={`/quizzes?type=${encodeURIComponent(type)}`}>
                      <Card className="group h-full border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
                        <CardContent className="p-5">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="mb-2 font-display text-lg font-bold text-foreground">
                            {formatQuizType(type)}
                          </h4>
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {typeDescription}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              {lang === 'vi'
                                ? `${typeQuizzes.length} bài thi`
                                : `${typeQuizzes.length} exámenes`}
                            </span>
                            <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border border-border bg-card">
              <CardContent className="px-6 py-12 text-center">
                <p className="text-lg font-semibold text-foreground">
                  {t(
                    'Chưa có dữ liệu loại đề từ hệ thống.',
                    'Aún no hay tipos de examen desde el sistema.'
                  )}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {t(
                    'Hãy khởi động API + MySQL để tải dữ liệu thật từ DB.',
                    'Inicia la API y MySQL para cargar los datos reales desde la base de datos.'
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Materials Section - Clean Carousel */}
      <section className="relative bg-background py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {t('Tài liệu học trọng tâm', 'Materiales de estudio clave')}
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                {t(
                  'Nội dung thiết yếu theo chủ đề để học đúng trọng tâm và tiết kiệm thời gian.',
                  'Contenido esencial por temas para estudiar con enfoque y ahorrar tiempo.'
                )}
              </p>
            </div>
            <Link to="/materials" className="inline-flex">
              <Button className="gap-2 bg-primary px-6 text-primary-foreground hover:bg-secondary">
                {t('Xem tất cả', 'Ver todos')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="relative">
            <div
              ref={materialsRailRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
              style={{ touchAction: 'pan-y' }}
              onWheel={handleMaterialsRailWheel}
            >
              {loopingSubjects.map((subject, i) => (
                <motion.div
                  key={`${subject.id}-${i}`}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="min-w-[280px] sm:min-w-[320px] lg:min-w-[360px]"
                >
                  <Link to={`/materials?subject=${subject.id}`}>
                    <Card className="group h-full border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
                      <CardContent className="p-0">
                        {/* Image Section */}
                        <div className="h-40 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/5 to-accent/5">
                          <img
                            src="/brand/materials-illustration.png"
                            alt={subject.name}
                            className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        {/* Content Section */}
                        <div className="p-5">
                          <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                            {subject.name}
                          </h3>
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                            {subject.description ||
                              t(
                                'Xem tài liệu chi tiết cho chủ đề này',
                                'Ver materiales de este tema'
                              )}
                          </p>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                            {t('Xem tài liệu', 'Ver materiales')} <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section - Professional & Clean */}
      <section className="relative bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  {t('Bảng xếp hạng', 'Tabla de clasificación')}
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  {t(
                    'Theo dõi thứ hạng và so sánh kết quả với các học viên khác.',
                    'Sigue tu posición y compara resultados con otros estudiantes.'
                  )}
                </p>
              </div>
              <Link to="/leaderboard" className="inline-flex">
                <Button className="gap-2 bg-primary px-6 text-primary-foreground hover:bg-secondary">
                  {t('Xem đầy đủ', 'Ver completo')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* User Profile Card */}
              <div className="lg:col-span-1">
                {leftProfileUser ? (
                  <Card className="h-full border border-border bg-card">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold">
                        <Medal className="h-4 w-4" />
                        {isAuthenticated ? t('Hồ sơ của bạn', 'Tu perfil') : t('Học viên xuất sắc', 'Estudiante destacado')}
                      </div>
                      
                      <div className="mb-6 flex items-center gap-4">
                        {leftProfileUser.avatar_url ? (
                          <img
                            src={resolveMediaUrl(leftProfileUser.avatar_url)}
                            alt={leftProfileUser.full_name || leftProfileUser.username || 'User'}
                            className="h-16 w-16 rounded-full border-2 border-gold object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-primary/10 text-xl font-bold text-primary">
                            {(leftProfileUser.full_name || leftProfileUser.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-bold text-foreground">
                            {leftProfileUser.full_name || leftProfileUser.username || 'User'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {Number(leftProfileUser.total_quizzes || 0)} {t('bài hoàn thành', 'pruebas completadas')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-primary/5 p-4 text-center">
                          <p className="text-2xl font-bold text-primary">
                            {Number(leftProfileUser.average_percentage || 0).toFixed(0)}%
                          </p>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {t('Điểm TB', 'Promedio')}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gold/10 p-4 text-center">
                          <p className="text-2xl font-bold text-gold">
                            {Number(leftProfileUser.total_score || 0)}
                          </p>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {t('Tổng điểm', 'Puntos')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-border bg-card">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      {t('Chưa có dữ liệu.', 'Sin datos.')}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Top 5 Rankings */}
              <div className="lg:col-span-2">
                <Card className="h-full border border-border bg-card">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-lg font-bold text-foreground">
                      {t('Top 5 học viên xuất sắc', 'Top 5 estudiantes destacados')}
                    </h3>
                    
                    {raceTopFive.length ? (
                      <div className="space-y-3">
                        {raceTopFive.map((user, i) => {
                          const displayName = user.full_name || user.username || 'User';
                          const percentage = Math.max(0, Math.min(100, Number(user.average_percentage || 0)));
                          const isTopThree = i < 3;
                          
                          return (
                            <div
                              key={`top5-${user.id}`}
                              className={`flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-sm ${
                                i === 0
                                  ? 'border-gold/30 bg-gold/5'
                                  : i === 1
                                  ? 'border-gray-300 bg-gray-50'
                                  : i === 2
                                  ? 'border-amber-200 bg-amber-50/50'
                                  : 'border-border bg-card'
                              }`}
                            >
                              {/* Rank */}
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                                i === 0
                                  ? 'bg-gold text-white'
                                  : i === 1
                                  ? 'bg-gray-400 text-white'
                                  : i === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {i + 1}
                              </div>

                              {/* Avatar */}
                              {user.avatar_url ? (
                                <img
                                  src={resolveMediaUrl(user.avatar_url)}
                                  alt={displayName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}

                              {/* Name & Progress */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-foreground">{displayName}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </div>

                              {/* Score */}
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {Number(user.total_score || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">{t('điểm', 'pts')}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        {t('Chưa có dữ liệu xếp hạng.', 'Sin datos de clasificación.')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Professional & Clean */}
      <section className="relative bg-primary py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="flex flex-col items-center text-center lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
                  {t('Sẵn sàng bắt đầu luyện thi?', '¿Listo para empezar a practicar?')}
                </h2>
                <p className="mt-4 text-lg text-primary-foreground/80">
                  {t(
                    'Đăng ký ngay để truy cập hàng trăm câu hỏi mô phỏng thi DGT miễn phí',
                    'Regístrate para acceder a cientos de preguntas del examen DGT gratis'
                  )}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-primary-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('Miễn phí', 'Gratis')}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-primary-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('Chấm điểm tức thì', 'Corrección instantánea')}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-primary-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('Song ngữ', 'Bilingüe')}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 lg:mt-0">
                <Link to={isAuthenticated ? '/quizzes' : '/register'}>
                  <Button
                    size="lg"
                    className="gap-2 bg-white px-8 text-base font-semibold text-primary hover:bg-white/90"
                  >
                    {isAuthenticated
                      ? t('Làm bài thi ngay', 'Haz el examen ahora')
                      : t('Đăng ký miễn phí', 'Regístrate gratis')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/quizzes" className="text-center">
                    <span className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:underline">
                      {t('Hoặc xem bộ đề trước', 'O ver exámenes primero')}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
