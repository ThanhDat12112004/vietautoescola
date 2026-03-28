import { ArrowRight, CheckCircle2, GraduationCap, Medal, Target, Trophy, Zap } from '@/components/BrandIcons';
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
  resolveMediaUrl,
  type HomeSummary,
  type LeaderboardUser,
  type QuizListItem,
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homeSummary, setHomeSummary] = useState<HomeSummary | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const materialsRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [leaderboardRows, quizRows, subjectRows, summary] = await Promise.all([
          getLeaderboard(10),
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

  const quizTypeNameMap: Record<string, string> = {
    road_signs: 'Biển báo giao thông',
    safety: 'An toàn lái xe',
    highway: 'Đường cao tốc',
    mixed: 'Đề tổng hợp',
    theory: 'Lý thuyết',
  };

  const formatQuizType = (value: string) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (quizTypeNameMap[normalized]) {
      return quizTypeNameMap[normalized];
    }
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getQuizCountForType = (type: string) =>
    quizzes.filter((quiz) => String(quiz.quiz_type || '') === String(type || '')).length;

  const getLevelByIndex = (index: number) => {
    if (index === 0) return t('Cơ bản', 'Básico');
    if (index === 1 || index === 2) return t('Trung bình', 'Intermedio');
    return t('Nâng cao', 'Avanzado');
  };

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

  const leftProfileUser = useMemo(() => {
    if (!currentUser) return champion;

    const myLeaderboardRow = leaderboard.find((item) => Number(item.id) === Number(currentUser.id));

    if (myLeaderboardRow) {
      const myRankIndex = topLeaderboard.findIndex(
        (item) => Number(item.id) === Number(currentUser.id)
      );
      return {
        ...myLeaderboardRow,
        full_name: myLeaderboardRow.full_name || currentUser.full_name || currentUser.username,
        username: myLeaderboardRow.username || currentUser.username,
        avatar_url: myLeaderboardRow.avatar_url || currentUser.avatar_url,
        rank: myRankIndex >= 0 ? myRankIndex + 1 : null,
        best_score: Number(myLeaderboardRow.total_score || 0),
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
      rank: null,
      best_score: 0,
    };
  }, [champion, currentUser, leaderboard, topLeaderboard]);

  const rankedLeaderboard = useMemo(
    () => topLeaderboard.map((user, index) => ({ ...user, rank: index + 1 })),
    [topLeaderboard]
  );

  const raceTopFive = useMemo(() => rankedLeaderboard.slice(0, 5), [rankedLeaderboard]);

  const profileRank =
    leftProfileUser && 'rank' in leftProfileUser
      ? Number((leftProfileUser as { rank?: number | null }).rank || 0)
      : 0;

  const profileBestScore =
    leftProfileUser && 'best_score' in leftProfileUser
      ? Number((leftProfileUser as { best_score?: number | null }).best_score || 0)
      : Number(leftProfileUser?.total_score || 0);

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
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_14%_14%,rgba(255,220,228,0.42),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(255,232,182,0.32),transparent_30%),linear-gradient(180deg,#fbf7f9_0%,#f8f9fe_56%,#f9f3f7_100%)]">
      <Navbar />

      <section className="relative overflow-hidden py-6 sm:py-8 md:py-12 lg:py-14">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hero-bg-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff5f7" />
              <stop offset="46%" stopColor="#f8e8ee" />
              <stop offset="100%" stopColor="#efdee7" />
            </linearGradient>
            <radialGradient
              id="hero-bg-glow-left"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(220 170) rotate(20) scale(360 240)"
            >
              <stop offset="0%" stopColor="#b23d58" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#b23d58" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="hero-bg-glow-right"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(1360 180) rotate(-16) scale(330 230)"
            >
              <stop offset="0%" stopColor="#7a2038" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#7a2038" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="hero-bg-warm"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(1280 150) rotate(-20) scale(280 190)"
            >
              <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
            </radialGradient>
            <pattern
              id="hero-bg-road-lines"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(28)"
            >
              <rect width="32" height="32" fill="transparent" />
              <rect x="0" y="0" width="2" height="32" fill="#7a2038" fillOpacity="0.06" />
            </pattern>
          </defs>

          <rect width="1600" height="900" fill="url(#hero-bg-base)" />
          <rect width="1600" height="900" fill="url(#hero-bg-road-lines)" />
          <rect width="1600" height="900" fill="url(#hero-bg-glow-left)" />
          <rect width="1600" height="900" fill="url(#hero-bg-glow-right)" />
          <rect width="1600" height="900" fill="url(#hero-bg-warm)" />
          <path
            d="M0 760 C320 710 620 790 930 760 C1220 734 1390 700 1600 736 L1600 900 L0 900 Z"
            fill="#ecdae3"
            fillOpacity="0.72"
          />
        </svg>
        <div className="relative w-full px-3 sm:px-5 md:px-7 lg:px-10">
          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-1.5 text-sm font-semibold text-primary md:text-base">
                <GraduationCap className="h-4 w-4" />
                {t('Hệ thống thi trực tuyến #1', 'Sistema de exámenes online #1')}
              </div>
              <h1
                className="mb-5 text-[2.05rem] font-black leading-[1.02] tracking-[-0.02em] text-[#1f2430] sm:text-[2.45rem] md:text-[2.95rem] lg:text-[3.45rem] xl:text-[3.85rem]"
                style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              >
                {t(
                  'Hệ thống học và luyện thi bằng lái xe Tây Ban Nha',
                  'Sistema para estudiar y practicar el examen de conducir en España'
                )}
              </h1>
              <p className="mb-7 max-w-xl text-base leading-relaxed text-[#5c5f70] sm:text-lg md:text-xl">
                {t(
                  'Luyện đề sát DGT, chấm điểm ngay, giải thích song ngữ dễ hiểu để bạn đậu nhanh hơn.',
                  'Practica con exámenes DGT, corrige al instante y recibe explicación bilingüe fácil de entender para aprobar más rápido.'
                )}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
<Link to="/quizzes">
                  <motion.div
                    initial={{ scale: 1, boxShadow: "0 12px 24px rgba(122,32,56,0.3)" }}
                    animate={{
                      scale: [1, 1.02, 1],
                      boxShadow: [
                        "0 12px 24px rgba(122,32,56,0.3)",
                        "0 20px 40px rgba(122,32,56,0.45)",
                        "0 12px 24px rgba(122,32,56,0.3)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="w-full justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_65%,#ca8a04_100%)] px-8 text-lg font-black text-white shadow-2xl hover:brightness-[1.05] hover:shadow-[0_25px_50px_rgba(122,32,56,0.5)] active:scale-[0.98] border-2 border-white/20 backdrop-blur-sm"
                    >
                      <Zap className="h-5 w-5" />
                      {t('Làm thử đề ngay', 'Haz una prueba ahora')}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                {!isAuthenticated && (
                  <Link to="/register">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-white/90 to-primary/5 px-8 text-lg font-black text-primary hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/60 active:scale-[0.98] backdrop-blur-md"
                      >
                        {t('Đăng ký miễn phí', 'Regístrate gratis')}
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden justify-center md:flex md:justify-end"
            >
              <div className="relative h-56 w-56 md:h-72 md:w-72 lg:h-[20rem] lg:w-[20rem] xl:h-[22rem] xl:w-[22rem]">
                <div className="absolute inset-3 rounded-full overflow-hidden border border-primary/30 bg-white/30 shadow-[0_18px_46px_rgba(95,20,40,0.18)] backdrop-blur-sm">
                  <BrandLogo
                    className="h-full w-full items-center justify-center"
                    imageClassName="h-full w-full object-contain animate-float scale-[0.95] md:scale-[1.0] lg:scale-[1.05]"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="mt-8 rounded-2xl border border-[#7a2038]/12 bg-white/72 p-4 shadow-[0_10px_24px_rgba(95,20,40,0.08)] md:mt-10 md:p-5"
          >
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  custom={i + 2}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ y: -4, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="rounded-xl border border-[#7a2038]/10 bg-white/92 px-2 py-3 text-center shadow-[0_8px_16px_rgba(95,20,40,0.06)] sm:px-3 sm:py-4"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="mx-auto mb-1.5 h-10 w-auto object-contain sm:mb-2 sm:h-14 md:h-16"
                    loading="lazy"
                  />
                  <h3 className="mb-0.5 line-clamp-2 font-display text-[13px] font-black leading-snug text-[#4a1930] sm:text-base md:text-lg">
                    {feature.title}
                  </h3>
                  <p className="hidden text-xs font-medium leading-relaxed text-[#646173] md:block md:text-sm">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-3 pb-2 sm:px-5 md:px-7 lg:px-10">
        <div className="grid gap-2 rounded-2xl border border-[#7a2038]/15 bg-white/82 p-3 shadow-[0_10px_22px_rgba(95,20,40,0.08)] sm:grid-cols-2 sm:gap-3 md:grid-cols-4 md:p-4">
          <div className="rounded-xl border border-[#7a2038]/10 bg-white/86 px-3 py-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
              {t('Tổng câu hỏi', 'Preguntas totales')}
            </div>
            <div className="mt-1 font-display text-2xl font-black text-[#4a1930]">
              {Math.max(Number(homeSummary?.total_questions || 0), 300)}+
            </div>
          </div>
          <div className="rounded-xl border border-[#7a2038]/10 bg-white/86 px-3 py-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
              {t('Đề luyện tập', 'Exámenes de práctica')}
            </div>
            <div className="mt-1 font-display text-2xl font-black text-[#4a1930]">20+</div>
          </div>
          <div className="rounded-xl border border-[#7a2038]/10 bg-white/86 px-3 py-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
              {t('Tài liệu theo chủ đề', 'Temario por tema')}
            </div>
            <div className="mt-1 font-display text-2xl font-black text-[#4a1930]">
              {Math.max(subjects.length, 8)}+
            </div>
          </div>
          <div className="rounded-xl border border-[#7a2038]/10 bg-white/86 px-3 py-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
              {t('Thi thử như thật', 'Simulacro real')}
            </div>
            <div className="mt-1 font-display text-2xl font-black text-[#4a1930]">30 {t('câu', 'preguntas')}</div>
          </div>
        </div>
      </section>

      <div className="h-5 px-3 sm:px-5 md:px-7 lg:px-10" aria-hidden="true">
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(36,50,79,0.18)_20%,rgba(36,50,79,0.26)_50%,rgba(36,50,79,0.18)_80%,transparent_100%)]" />
      </div>

      <section className="relative py-8 sm:py-10 md:py-14 lg:py-16">
        <div className="relative z-10 px-4 md:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-primary/20 pb-4"
          >
            <div className="max-w-3xl">
              <h2 className="font-display text-[1.85rem] font-black leading-[1.08] tracking-tight text-[#402631] sm:text-[2.1rem] md:text-[2.5rem] lg:text-[2.85rem]">
                {t('Loại đề luyện thi', 'Tipos de examen')}
              </h2>
              <p className="mt-1 text-base font-medium text-[#5f6272] sm:text-lg md:text-xl">
                {t(
                  'Chọn loại đề bạn muốn tập trung',
                  'Elige el tipo de examen que quieres dominar'
                )}
              </p>
            </div>
            <Link to="/quizzes" className="inline-flex">
              <Button
                variant="outline"
                className="gap-1.5 rounded-full border-primary/25 bg-white/70 px-4 py-2 text-sm text-primary hover:bg-white md:text-base"
              >
                {t('Xem thêm', 'Ver más')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {quizTypes.length ? (
            <div className="grid gap-3 lg:grid-cols-[1.55fr_1fr] lg:gap-4">
              <motion.div
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link to={`/quizzes?type=${encodeURIComponent(quizTypes[0])}`}>
                  <Card className="card-hover relative overflow-hidden rounded-2xl border border-primary/20 bg-white/88 shadow-[0_10px_24px_rgba(95,20,40,0.08)]">
                    <div className="relative aspect-[5/3] w-full min-h-[220px] sm:min-h-[250px] md:min-h-[310px]">
                      <img
                        src="/brand/quiz-illustration.png"
                        alt={t('Minh họa đề luyện thi', 'Ilustración de examen de práctica')}
                        className="absolute inset-0 h-full w-full object-contain object-center"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(122,32,56,0.05)_0%,rgba(122,32,56,0.22)_52%,rgba(74,25,48,0.70)_100%)]" />
                      <CardContent className="absolute inset-x-0 bottom-0 z-10 p-5 text-white md:p-6">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-3 py-1 text-base font-semibold text-white backdrop-blur-sm">
                          <Target className="h-5 w-5" />
                          {formatQuizType(quizTypes[0])}
                        </div>
                        <h3 className="mb-2 font-display text-[1.5rem] font-black leading-tight text-white sm:text-[1.75rem] md:text-[2.25rem]">
                          {formatQuizType(quizTypes[0])}
                        </h3>
                        <p className="mb-3 max-w-xl text-sm text-white/90 sm:text-base md:text-lg">
                          {Math.max(getQuizCountForType(quizTypes[0]), 120)} {t('câu hỏi', 'preguntas')} •{' '}
                          {t('Cơ bản', 'Básico')}
                        </p>
                        <Button className="rounded-xl bg-white/92 px-4 text-sm font-bold text-primary hover:bg-white">
                          {t('Làm đề', 'Hacer test')}
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>

              <div className="grid self-stretch gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-4 lg:gap-2">
                {quizTypes.slice(1, 5).map((type, i) => (
                  <motion.div
                    key={type}
                    custom={i + 2}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="h-full"
                  >
                    <Link to={`/quizzes?type=${encodeURIComponent(type)}`}>
                      <Card className="card-hover h-full overflow-hidden rounded-2xl border border-primary/20 bg-white/88 shadow-[0_8px_20px_rgba(95,20,40,0.08)]">
                        <CardContent className="flex h-full items-stretch gap-3 px-4 py-3.5">
                          <img
                            src="/brand/quiz-illustration.png"
                            alt={t('Minh họa đề luyện thi', 'Ilustración de examen de práctica')}
                            className="h-full w-24 shrink-0 object-contain object-center md:w-28"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display text-lg font-black leading-tight text-[#482735] sm:text-xl md:text-2xl">
                              {formatQuizType(type)}
                            </h4>
                            <p className="mt-1 text-sm font-semibold text-[#616477] sm:text-base md:text-lg">
                              {Math.max(getQuizCountForType(type), 30)} {t('câu hỏi', 'preguntas')} •{' '}
                              {getLevelByIndex(i)}
                            </p>
                            <span className="mt-2 inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary md:text-sm">
                              {t('Làm đề', 'Hacer test')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <Card className="rounded-2xl border border-primary/20 bg-white/88 shadow-[0_10px_24px_rgba(95,20,40,0.08)]">
              <CardContent className="px-5 py-8 text-center sm:px-8 sm:py-10">
                <p className="text-base font-semibold text-[#482735] sm:text-lg">
                  {t(
                    'Chưa có dữ liệu loại đề từ hệ thống.',
                    'Aun no hay tipos de examen desde el sistema.'
                  )}
                </p>
                <p className="mt-2 text-sm text-[#616477] sm:text-base">
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

      <section className="relative py-8 sm:py-10 md:py-14">
        <div className="relative z-10 w-full px-3 sm:px-5 md:px-7 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-8"
          >
            <h2 className="mb-3 font-display text-[1.55rem] font-black leading-[1.08] tracking-tight text-[#402631] sm:text-[1.9rem] md:text-[2.65rem] lg:text-[2.95rem]">
              {t('Chủ đề tài liệu', 'Temas de materiales')}
            </h2>
            <p className="mx-auto max-w-2xl text-xs font-medium text-[#5f6272] sm:text-base md:text-xl">
              {t(
                'Ôn tập theo từng chủ đề tài liệu chính',
                'Repasa por temas principales de materiales'
              )}
            </p>
            <div className="mt-4">
              <Link to="/materials" className="inline-flex">
                <Button
                  variant="outline"
                  className="gap-1.5 rounded-xl border-primary/25 bg-white/85 text-primary hover:bg-white"
                >
                  {t('Xem tất cả', 'Ver todo')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="relative">
            <div
              ref={materialsRailRef}
              className="flex gap-4 overflow-x-auto overflow-y-hidden px-1 pb-3 pr-4 md:gap-5 md:px-2 md:pr-6"
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
                  className="min-w-[240px] md:min-w-[340px] lg:min-w-[380px]"
                >
                  <Link to={`/materials?subject=${subject.id}`}>
                    <Card className="card-hover h-full border border-primary/20 bg-white/92 shadow-[0_10px_24px_rgba(95,20,40,0.08)] transition-all duration-300">
                      <CardContent className="p-4 sm:p-5 md:p-6">
                        <div className="mb-3 h-40 w-full overflow-hidden rounded-2xl border border-primary/15 bg-white/55 sm:h-48 md:mb-4 md:h-56">
                          <img
                            src="/brand/materials-illustration.png"
                            alt={t(
                              'Minh họa tài liệu học tập',
                              'Ilustración de materiales de estudio'
                            )}
                            className="h-full w-full object-contain object-left"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="mb-1.5 font-display text-lg font-bold text-[#402631] sm:text-xl">
                          {subject.name}
                        </h3>
                        <p className="mb-3 text-sm leading-relaxed text-[#5f6272] sm:mb-4 sm:text-base">
                          {subject.description ||
                            t(
                              'Xem tài liệu chi tiết cho chủ đề này',
                              'Ver materiales de este tema'
                            )}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary sm:text-base">
                          {t('Xem tài liệu', 'Ver materiales')} <ArrowRight className="h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative pt-8 pb-28 sm:py-10 md:py-12">
        <div className="relative z-10 w-full px-3 sm:px-5 md:px-7 lg:px-10">
          <div className="relative grid items-start gap-5 overflow-visible md:overflow-hidden">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <img
                    src="/brand/cup.png"
                    alt={t('Cúp bảng xếp hạng', 'Copa del ranking')}
                    className="h-12 w-auto object-contain md:h-16 lg:h-20"
                    loading="lazy"
                  />
                  <h2 className="font-display text-[1.85rem] font-black leading-tight tracking-tight text-[#64172f] sm:text-[2.1rem] md:text-[2.65rem] lg:text-[2.95rem]">
                    {t('Bảng xếp hạng', 'Ranking de alto rendimiento')}
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.45fr]">
                <div className="relative flex h-full flex-col overflow-hidden p-5 md:p-6">
                  {leftProfileUser ? (
                    <>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50/70 px-3 py-1 text-xs font-bold text-amber-800">
                        <Medal className="h-4 w-4" />
                        {t('Thông tin của bạn', 'Tu perfil')}
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-[rgba(236,224,231,0.86)] p-3">
                        {leftProfileUser.avatar_url ? (
                          <img
                            src={resolveMediaUrl(leftProfileUser.avatar_url)}
                            alt={leftProfileUser.full_name || leftProfileUser.username || 'User'}
                            className="h-14 w-14 rounded-full border-2 border-amber-400 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400 bg-white text-lg font-black text-primary">
                            {(leftProfileUser.full_name || leftProfileUser.username || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-display text-xl font-black text-primary">
                            {leftProfileUser.full_name || leftProfileUser.username || 'User'}
                          </div>
                          <div className="text-sm font-semibold text-slate-600">
                            {Number(leftProfileUser.total_quizzes || 0)}{' '}
                            {t('bài hoàn thành', 'pruebas completadas')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-primary/15 bg-[rgba(236,224,231,0.86)] px-2.5 py-2 text-center">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {t('Đã làm', 'Hechos')}
                          </div>
                          <div className="font-display text-lg font-black text-primary">
                            {Number(leftProfileUser.total_quizzes || 0)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-primary/15 bg-[rgba(236,224,231,0.86)] px-2.5 py-2 text-center">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {t('Điểm cao nhất', 'Mejor puntaje')}
                          </div>
                          <div className="font-display text-lg font-black text-primary">
                            {profileBestScore.toFixed(1)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-primary/15 bg-[rgba(236,224,231,0.86)] px-2.5 py-2 text-center">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {t('Thứ hạng', 'Ranking')}
                          </div>
                          <div className="font-display text-lg font-black text-primary">
                            {profileRank > 0 ? `#${profileRank}` : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto flex justify-center pt-4">
                        <Link to="/leaderboard" className="inline-flex">
                          <Button className="gap-2 rounded-xl bg-primary px-4 text-white hover:bg-primary/90">
                            {t('Xem bảng đầy đủ', 'Ver ranking completo')}{' '}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-primary/25 bg-[rgba(229,214,223,0.78)] p-5 text-sm text-slate-600">
                      {t('Chưa có dữ liệu bảng xếp hạng.', 'Aún no hay datos del ranking.')}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 xl:-mt-8">
                  <Card className="overflow-visible border-0 bg-transparent shadow-none">
                    <CardContent className="p-0">
                      {raceTopFive.length ? (
                        <div className="space-y-2 rounded-2xl bg-transparent p-2 md:space-y-2.5 md:p-3">
                          {raceTopFive.map((user, i) => {
                            const displayName = user.full_name || user.username || 'User';
                            const percentage = Math.max(
                              0,
                              Math.min(100, Number(user.average_percentage || 0))
                            );
                            const isChampion = i === 0;

                            return (
                              <motion.div
                                key={user.id}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 backdrop-blur-[1px] ${
                                  isChampion
                                    ? 'border-amber-300/55 bg-[linear-gradient(90deg,rgba(255,246,215,0.78)_0%,rgba(255,255,255,0.92)_70%)]'
                                    : 'border-primary/12 bg-[rgba(233,220,228,0.84)]'
                                }`}
                              >
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                    user.rank === 1
                                      ? 'bg-amber-100 text-amber-800'
                                      : user.rank === 2
                                        ? 'bg-slate-100 text-slate-700'
                                        : user.rank === 3
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {user.rank === 1 ? 'G' : user.rank === 2 ? 'S' : user.rank === 3 ? 'B' : user.rank}
                                </div>

                                {user.avatar_url ? (
                                  <img
                                    src={resolveMediaUrl(user.avatar_url)}
                                    alt={displayName}
                                    className="h-9 w-9 shrink-0 rounded-full border border-white object-cover"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white text-sm font-black text-primary">
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-display text-sm font-black text-[#3b2a33]">
                                    {displayName}
                                  </div>
                                  <div className="text-xs text-[#667085]">
                                    {Number(user.total_quizzes || 0)} {t('bài thi', 'exámenes')}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-display text-base font-black text-primary">
                                    {Number(user.total_score || 0).toFixed(1)}
                                  </div>
                                  <div className="text-[11px] text-[#667085]">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-primary/25 bg-[rgba(229,214,223,0.78)] p-5 text-sm text-slate-600">
                          {t(
                            'Chưa có dữ liệu để hiển thị biểu đồ.',
                            'Aún no hay datos para mostrar el gráfico.'
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-10 sm:py-12 md:py-14">
        <div className="relative z-10 w-full px-3 sm:px-5 md:px-7 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="relative overflow-hidden rounded-[2rem] border border-[#24324f]/15 bg-[linear-gradient(140deg,rgba(255,255,255,0.9)_0%,rgba(255,247,250,0.82)_52%,rgba(255,249,235,0.76)_100%)] px-6 py-7 shadow-[0_18px_42px_rgba(36,50,79,0.14)] backdrop-blur-[2px] md:px-8 md:py-9 lg:px-10"
          >
            <div className="pointer-events-none absolute -left-12 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.35fr_auto] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-3 py-1 text-sm font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('Sẵn sàng bứt tốc', 'Listo para acelerar')}
                </div>
                <h2 className="mb-3 font-display text-[1.85rem] font-black leading-tight tracking-tight text-[#24324f] sm:text-[2.15rem] md:text-[2.5rem]">
                  {t('Sẵn sàng bắt đầu luyện thi?', '¿Listo para empezar a practicar?')}
                </h2>
                <p className="max-w-2xl text-base font-medium leading-relaxed text-[#4b5b7a] md:text-lg">
                  {t(
                    'Đăng ký ngay để truy cập hàng trăm câu hỏi mô phỏng thi DGT miễn phí',
                    'Regístrate para acceder a cientos de preguntas del examen DGT gratis'
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-white/55 px-3 py-1 text-sm font-semibold text-[#24324f]">
                    {t('Miễn phí bắt đầu', 'Inicio gratis')}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-white/55 px-3 py-1 text-sm font-semibold text-[#24324f]">
                    {t('Chấm điểm tức thì', 'Corrección instantánea')}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-white/55 px-3 py-1 text-sm font-semibold text-[#24324f]">
                    {t('Song ngữ Việt - TBN', 'Bilingüe vietnamita-español')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
<Link to={isAuthenticated ? '/quizzes' : '/register'}>
                  <motion.div
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{
                      rotate: [0, 1, -1, 0],
                      scale: [1, 1.01, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-full lg:w-auto"
                  >
                    <Button
                      size="lg"
                      className="gap-3 rounded-2xl bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_70%,#ca8a04_100%)] px-10 text-xl font-black text-white shadow-2xl hover:brightness-[1.08] hover:shadow-[0_30px_60px_rgba(122,32,56,0.55)] active:scale-[0.97] border-2 border-white/30 backdrop-blur-sm relative overflow-hidden"
                    >
                      <span className="relative z-10">{isAuthenticated
                        ? t('Làm bài thi ngay', 'Haz el examen ahora')
                        : t('Đăng ký miễn phí', 'Regístrate gratis')}</span>
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,white,transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 animate-shimmer" />
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  </motion.div>
                </Link>
                {!isAuthenticated && (
                  <Link to="/quizzes">
                    <motion.div
                      whileHover={{ scale: 1.08, y: -6, boxShadow: "0 20px 40px rgba(122,32,56,0.3)" }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full lg:w-auto"
                    >
                      <Button
                        variant="outline"
                        className="rounded-2xl border-4 border-primary/50 bg-gradient-to-br from-white/95 via-primary/5 to-amber-50/50 px-10 py-7 text-xl font-black text-primary shadow-xl hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary/10 hover:border-primary/70 active:scale-[0.97] backdrop-blur-lg relative group"
                      >
                        <span>{t('Xem bộ đề trước', 'Ver exámenes primero')}</span>
                        <Trophy className="h-6 w-6 ml-2" />
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Miễn phí
                        </div>
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="w-full px-3 sm:px-5 md:px-7 lg:px-10">
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(36,50,79,0.18)_20%,rgba(36,50,79,0.26)_50%,rgba(36,50,79,0.18)_80%,transparent_100%)]" />
      </div>

      <div className="h-5 md:h-7" aria-hidden="true" />

      <button
        type="button"
        onClick={() => setShowContactPopup(true)}
        className="fixed bottom-5 left-4 z-40 rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-bold text-primary shadow-[0_10px_24px_rgba(95,20,40,0.16)] transition hover:-translate-y-0.5 hover:bg-primary hover:text-white"
      >
        {t('Liên hệ nhanh', 'Contacto rápido')}
      </button>

      {showContactPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.22)]">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-xl font-black text-[#4a1930]">
                {t('Trung tâm hỗ trợ', 'Centro de ayuda')}
              </h3>
              <button
                type="button"
                onClick={() => setShowContactPopup(false)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t('Đóng', 'Cerrar')}
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              {t(
                'Nếu bạn có câu hỏi về gói học, đăng ký hoặc tài liệu, liên hệ nhanh với đội hỗ trợ:',
                'Si tienes dudas sobre planes, registro o temario, contacta con soporte:'
              )}
            </p>
            <div className="space-y-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                WhatsApp: <span className="font-semibold">+34 677 64 10 04</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                Email: <span className="font-semibold">info@practicatest.com</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/register" className="flex-1">
                <Button className="w-full rounded-xl bg-primary text-white hover:bg-primary/90">
                  {t('Đăng ký', 'Registrarse')}
                </Button>
              </Link>
              <Link to="/materials" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl border-primary/30 text-primary">
                  {t('Gói học & tài liệu', 'Planes y temario')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Index;
