import { ArrowRight, BookOpen, FileText, Target, Users } from '@/components/BrandIcons';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getQuizTypes,
  getQuizzes,
  type QuizListItem,
  type QuizType,
} from '@/lib/api/quiz';
import {
  getMaterialCountsBySubject,
  getSubjects,
  type Subject,
} from '@/lib/api/materials';
import { getHomeSummary } from '@/lib/api/quiz';
import type { HomeSummary } from '@/lib/api/types';
import { getStoredAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  ctaPrimaryGlowButtonClass,
  ctaSecondaryGlowButtonClass,
  fadeUp,
  indexCardOpenChipClass,
  indexViewAllButtonClass,
} from '@/features/index/index.constants';
import {
  formatQuizTypeName,
  getQuizTopicDescription,
} from '@/features/index/index.quiz-type.helpers';
import {
  formatCountByLocale,
  getPrimaryTypeQuestionTotal,
  getPrimaryTypeQuizzes,
  getTotalMaterialsCount,
  getUniqueQuizTypes,
} from '@/features/index/index.selectors';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { t, lang } = useLanguage();
  const quizzesQuery = useQuery<QuizListItem[]>({
    queryKey: ['home', 'quizzes', lang],
    queryFn: () => getQuizzes(lang, { limit: 24, page: 1 }),
    staleTime: 60_000,
  });
  const quizTypesQuery = useQuery<QuizType[]>({
    queryKey: ['home', 'quiz-types', lang],
    queryFn: () => getQuizTypes(lang),
    staleTime: 60_000,
  });
  const subjectsQuery = useQuery<Subject[]>({
    queryKey: ['home', 'subjects', lang],
    queryFn: () => getSubjects(lang),
    staleTime: 60_000,
  });
  const homeSummaryQuery = useQuery<HomeSummary>({
    queryKey: ['home', 'summary'],
    queryFn: getHomeSummary,
    staleTime: 30_000,
  });
  const materialCountsQuery = useQuery({
    queryKey: ['home', 'material-counts'],
    queryFn: getMaterialCountsBySubject,
    staleTime: 60_000,
  });

  const quizzes = quizzesQuery.data ?? [];
  const quizTypeCatalog = quizTypesQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const homeSummary = homeSummaryQuery.data ?? null;
  const materialsCountBySubject = useMemo(
    () =>
      Object.fromEntries(
        (materialCountsQuery.data ?? []).map((row) => [Number(row.subject_id), Number(row.total || 0)])
      ),
    [materialCountsQuery.data]
  );
  const isLoadingHome =
    quizzesQuery.isLoading ||
    quizTypesQuery.isLoading ||
    subjectsQuery.isLoading ||
    homeSummaryQuery.isLoading ||
    materialCountsQuery.isLoading;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const benefitsScrollRef = useRef<HTMLDivElement | null>(null);
  const benefitsTabletScrollRef = useRef<HTMLDivElement | null>(null);
  const statsScrollRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scrollToHeroCenter = () => {
      const hero = heroSectionRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const heroTop = window.scrollY + rect.top;
      const targetY = Math.max(0, heroTop + rect.height / 2 - window.innerHeight / 2);
      window.scrollTo({ top: targetY, left: 0, behavior: 'auto' });
    };

    const raf = window.requestAnimationFrame(scrollToHeroCenter);
    const timer = window.setTimeout(scrollToHeroCenter, 120);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const container = statsScrollRef.current;
    if (!container) return;

    const enabledQuery = window.matchMedia('(max-width: 1023px)');
    if (!enabledQuery.matches) return;

    let rafId = 0;
    let lastTs = 0;
    let paused = false;
    let resumeTimer: number | null = null;

    const stopTemporarily = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
      }
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 1800);
    };

    const onPointerDown = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const onPointerUp = () => stopTemporarily();
    const onTouchMove = () => stopTemporarily();
    const onWheel = () => stopTemporarily();

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!paused) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft > 0) {
          container.scrollLeft += (34 * dt) / 1000;
          if (container.scrollLeft >= maxScrollLeft - 1) {
            container.scrollLeft = 0;
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('wheel', onWheel);
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
      }
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
    window.addEventListener('auth-updated', syncAuth as EventListener);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('auth-updated', syncAuth as EventListener);
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 639px)');
    const tabletQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)');

    const containers = [benefitsScrollRef.current, benefitsTabletScrollRef.current].filter(
      (el): el is HTMLDivElement => Boolean(el)
    );
    if (!containers.length) return;

    const getActiveContainer = () => {
      if (mobileQuery.matches) return benefitsScrollRef.current;
      if (tabletQuery.matches) return benefitsTabletScrollRef.current;
      return null;
    };

    let rafId = 0;
    let lastTs = 0;
    let paused = false;
    let resumeTimer: number | null = null;

    const stopTemporarily = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
      }
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 2200);
    };

    const onPointerDown = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const onPointerUp = () => stopTemporarily();
    const onTouchMove = () => stopTemporarily();
    const onWheel = () => stopTemporarily();

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      const container = getActiveContainer();

      if (container && !paused) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft > 0) {
          container.scrollLeft += (36 * dt) / 1000;
          if (container.scrollLeft >= maxScrollLeft - 1) {
            container.scrollLeft = 0;
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    containers.forEach((container) => {
      container.addEventListener('pointerdown', onPointerDown, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: true });
      container.addEventListener('wheel', onWheel, { passive: true });
    });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      containers.forEach((container) => {
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('wheel', onWheel);
      });
      window.removeEventListener('pointerup', onPointerUp);
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
      }
    };
  }, [lang]);

  const quizTypes = useMemo(() => getUniqueQuizTypes(quizzes, 6), [quizzes]);

  const formatQuizType = (value: string) => {
    return formatQuizTypeName(value, quizTypeCatalog);
  };

  const getTopicDescriptionByType = (type: string) => {
    return getQuizTopicDescription(
      type,
      quizTypeCatalog,
      t('Chủ đề này chưa có mô tả chi tiết.', 'Este tema aun no tiene descripcion detallada.')
    );
  };

  const primaryQuizType = quizTypes[0] || null;
  const numberLocale = lang === 'vi' ? 'vi-VN' : 'es-ES';

  const formatCount = (value: number) => formatCountByLocale(value, numberLocale);

  const primaryTypeQuizzes = useMemo(
    () => getPrimaryTypeQuizzes(quizzes, primaryQuizType),
    [primaryQuizType, quizzes]
  );

  const primaryTypeDescription = useMemo(
    () => (primaryQuizType ? getTopicDescriptionByType(primaryQuizType) : ''),
    [primaryQuizType, quizTypeCatalog, t]
  );

  const primaryTypeQuestionTotal = useMemo(
    () => getPrimaryTypeQuestionTotal(primaryTypeQuizzes),
    [primaryTypeQuizzes]
  );

  const totalMaterialsForStats = useMemo(
    () => getTotalMaterialsCount(materialsCountBySubject),
    [materialsCountBySubject]
  );

  const quickStats = useMemo(
    () => [
      {
        label: t('Số đề trắc nghiệm', 'Total de examenes'),
        value: isLoadingHome ? '...' : formatCount(quizzes.length),
        hint: t('Đề ôn luyện theo chuẩn DGT', 'Examenes de practica tipo DGT'),
        icon: BookOpen,
      },
      {
        label: t('Số tài liệu học', 'Total del temario'),
        value: isLoadingHome ? '...' : formatCount(totalMaterialsForStats),
        hint: t('Chủ đề, biển báo, mẹo làm đề', 'Temas, senales y guias de estudio'),
        icon: FileText,
      },
      {
        label: t('Số học viên', 'Total de estudiantes'),
        value: isLoadingHome ? '...' : formatCount(Number(homeSummary?.total_students || 0)),
        hint: t('Đang học và luyện thi hằng ngày', 'Aprendiendo y practicando cada dia'),
        icon: Users,
      },
      {
        label: t('Tổng lượt làm bài', 'Total de examenes realizados'),
        value: isLoadingHome ? '...' : formatCount(Number(homeSummary?.total_attempts || 0)),
        hint: t('Số bài đã hoàn thành trên hệ thống', 'Intentos completados en la plataforma'),
        icon: Target,
      },
    ],
    [
      formatCount,
      homeSummary?.total_attempts,
      homeSummary?.total_students,
      isLoadingHome,
      totalMaterialsForStats,
      quizzes.length,
      subjects.length,
      t,
    ]
  );

  const featuredSubjects = useMemo(() => {
    if (!subjects.length) return [];
    return [...subjects]
      .sort((a, b) => {
        const countA = Number(materialsCountBySubject[a.id] || 0);
        const countB = Number(materialsCountBySubject[b.id] || 0);
        return countB - countA;
      })
      .slice(0, 8);
  }, [materialsCountBySubject, subjects]);

  const totalMaterialsCount = totalMaterialsForStats;

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
      <section
        ref={heroSectionRef}
        className="relative overflow-visible pt-12 sm:pt-16 md:pt-20 lg:min-h-[700px] lg:pt-32 pb-20 sm:pb-24 md:pb-24 lg:pb-28 xl:min-h-[760px] xl:pb-32"
        style={{
          backgroundImage: "url('/brand/hero.png')",
          backgroundColor: '#2f050b',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.26)_58%,rgba(0,0,0,0.3)_100%)]"
        />

        <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="mb-4 inline-flex items-center justify-center rounded-full border border-amber-400/45 bg-black/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:mb-5 sm:px-5 sm:text-xs sm:tracking-[0.16em]">
                {t(
                  'Hệ thống luyện thi DGT dành cho người Việt',
                  'Sistema de preparación DGT para la comunidad vietnamita'
                )}
              </p>
              {/* Main heading — gradient trắng→vàng + nhấn vàng Tây Ban Nha */}
              <h1 className="mx-auto mb-5 max-w-[21ch] py-1 font-display text-[1.32rem] font-black leading-[1.18] tracking-tight sm:mb-6 sm:max-w-[18ch] sm:py-1.5 sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl">
                <span
                  className="inline bg-gradient-to-r from-white via-[#fffef8] to-[#ffe082] bg-clip-text text-transparent [filter:drop-shadow(0_3px_18px_rgba(0,0,0,0.42))]"
                  style={{ WebkitBackgroundClip: 'text' }}
                >
                  {t(
                    'Hệ thống học và luyện thi bằng lái xe Tây Ban Nha',
                    'Sistema de aprendizaje y preparación para el permiso de conducir en España'
                  )}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle-readable mx-auto mb-8 max-w-2xl text-[12px] leading-relaxed sm:mb-9 sm:text-base md:max-w-3xl md:text-lg lg:text-2xl">
                {t(
                  'Luyện đề sát DGT, chấm điểm ngay, giải thích song ngữ dễ hiểu để bạn đậu nhanh hơn',
                  'Practica con exámenes tipo DGT, corrección al instante y explicaciones bilingües fáciles para que apruebes más rápido'
                )}
              </p>

              {/* CTA — primary gradient + glass secondary (hero đỏ đậm) */}
              <div className="mx-auto flex max-w-xl flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link to="/quizzes" className="inline-flex sm:min-w-0">
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      'h-12 w-full rounded-[12px] border-0 px-6 py-3 text-base font-semibold !text-white sm:h-11 sm:w-auto',
                      '!bg-[linear-gradient(135deg,#ff4d4f_0%,#ff7a18_100%)]',
                      'shadow-[0_8px_22px_rgba(255,77,79,0.38)]',
                      'transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[linear-gradient(135deg,#ff5a5c_0%,#ff851e_100%)] hover:shadow-[0_12px_28px_rgba(255,77,79,0.45)]',
                      'focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      'active:translate-y-0 [&_svg]:h-5 [&_svg]:w-5'
                    )}
                  >
                    <Play className="shrink-0" strokeWidth={2.25} aria-hidden />
                    {t('Bắt đầu luyện thi', 'Empezar a practicar')}
                  </Button>
                </Link>
                <Link to="/materials" className="inline-flex sm:min-w-0">
                  <Button
                    size="lg"
                    variant="secondary"
                    className={cn(
                      'h-12 w-full rounded-[12px] border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold !text-white backdrop-blur-[10px]',
                      'shadow-none ring-0 ring-offset-0',
                      'transition-all duration-200 hover:!bg-white/20 hover:!text-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]',
                      'focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      'sm:h-11 sm:w-auto [&_svg]:h-5 [&_svg]:w-5'
                    )}
                  >
                    <BookOpen className="shrink-0 opacity-95" aria-hidden />
                    {t('Xem tài liệu học', 'Ver temario')}
                  </Button>
                </Link>
              </div>
              <p className="mx-auto mt-5 max-w-2xl px-4 py-2 text-center text-[12px] font-semibold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_0_12px_rgba(0,0,0,0.35)] sm:mt-6 sm:px-5 sm:text-sm sm:leading-relaxed">
                {t('Miễn phí bắt đầu · Chuẩn DGT · Song ngữ Việt – Tây Ban Nha', 'Gratis para empezar · Tipo DGT · Bilingüe vietnamita–español')}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Benefits crossing Hero bottom border */}
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="w-full"
          >
            <div
              ref={benefitsScrollRef}
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-1 sm:hidden scrollbar-hide"
              style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={`hero-benefit-mobile-${feature.title}`}
                  custom={i + 2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="group min-w-[calc(50%-0.25rem)] snap-start text-center"
                >
                  <div className="h-full rounded-2xl border border-[#c9cfd6] bg-[linear-gradient(180deg,#f6f7f9_0%,#e9edf2_100%)] p-2.5 shadow-[0_14px_30px_rgba(18,22,32,0.12)] transition-all duration-300 group-hover:border-[#aeb6c0] group-hover:bg-[linear-gradient(180deg,#eef1f5_0%,#dde2ea_100%)] group-hover:shadow-[0_18px_34px_rgba(30,38,55,0.16)]">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="mx-auto mb-2 h-8 w-auto object-contain transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <h3 className="mb-1.5 font-display text-[12px] font-bold text-[#7a2038]">
                      {feature.title}
                    </h3>
                    <p className="text-[10px] leading-relaxed text-[#5f3a43]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div
              ref={benefitsTabletScrollRef}
              className="hidden snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide sm:flex lg:hidden"
              style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={`hero-benefit-tablet-${feature.title}`}
                  custom={i + 2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="group min-w-[calc(50%-0.375rem)] md:min-w-[calc(33.333333%-0.5rem)] snap-start text-center"
                >
                  <div className="h-full rounded-2xl border border-[#c9cfd6] bg-[linear-gradient(180deg,#f6f7f9_0%,#e9edf2_100%)] p-4 shadow-[0_14px_30px_rgba(18,22,32,0.12)] transition-all duration-300 group-hover:border-[#aeb6c0] group-hover:bg-[linear-gradient(180deg,#eef1f5_0%,#dde2ea_100%)] group-hover:shadow-[0_18px_34px_rgba(30,38,55,0.16)]">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="mx-auto mb-2.5 h-10 w-auto object-contain transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <h3 className="mb-1.5 font-display text-sm font-bold text-[#7a2038]">
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#5f3a43]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hidden gap-4 lg:grid lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div
                  key={`hero-benefit-desktop-${feature.title}`}
                  custom={i + 2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="group text-center"
                >
                  <div className="h-full rounded-2xl border border-[#c9cfd6] bg-[linear-gradient(180deg,#f6f7f9_0%,#e9edf2_100%)] p-4 shadow-[0_14px_30px_rgba(18,22,32,0.12)] transition-all duration-300 group-hover:border-[#aeb6c0] group-hover:bg-[linear-gradient(180deg,#eef1f5_0%,#dde2ea_100%)] group-hover:shadow-[0_18px_34px_rgba(30,38,55,0.16)] sm:p-5">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="mx-auto mb-3 h-12 w-auto object-contain transition-transform group-hover:scale-110 sm:h-16"
                      loading="lazy"
                    />
                    <h3 className="mb-1.5 font-display text-sm font-bold text-[#7a2038] sm:text-base">
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#5f3a43] sm:text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Professional */}
      <section className="relative w-full border-t border-primary/20 bg-[#f2f4f7] pt-20 pb-2 sm:pt-20 sm:pb-3 md:pt-24 lg:pt-28 lg:pb-6 xl:pt-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="w-full"
        >
          <div className="w-full border border-[#d6dce3] bg-[#eceff3] py-1.5 shadow-[0_10px_24px_rgba(18,22,32,0.08)] sm:py-2 lg:py-3">
            <div
              ref={statsScrollRef}
              className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
              style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
            >
              {quickStats.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className={`relative min-w-[50%] snap-start bg-[#f7f8fa] px-2.5 pt-0.5 pb-1.5 text-center first:rounded-none last:rounded-none md:min-w-[33.333333%] lg:min-w-0 lg:px-6 lg:py-3 xl:px-7 ${
                    i < quickStats.length - 1 ? 'border-r border-[#d2d8df]' : ''
                  }`}
                >
                  <item.icon className="mx-auto mb-1.5 h-4 w-4 text-black/80 sm:h-6 sm:w-6 lg:mb-2 lg:h-7 lg:w-7" />
                  <p className="mb-1 text-[1.75rem] font-black text-black sm:text-4xl lg:text-[2.75rem] xl:text-[3rem]">
                    {item.value}
                  </p>
                  <p className="text-[13px] font-semibold text-black/90 sm:text-sm lg:text-[1.06rem]">
                    {item.label}
                  </p>
                  <p className="mt-0 text-[11px] leading-snug text-black/70 sm:text-xs lg:mt-0.5 lg:text-[0.93rem]">
                    {item.hint}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quiz Types Section - Professional Grid */}
      <section className="relative bg-muted/50 pt-5 pb-14 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
          >
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {t('Hệ thống ôn thi DGT', 'Sistema de preparación DGT')}
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {t('Đề thi theo mục tiêu', 'Exámenes por objetivo')}
              </h2>
              <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-[#4a3038] sm:text-lg">
                {t(
                  'Chọn dạng đề phù hợp để học hiệu quả và nâng điểm nhanh chóng.',
                  'Elige el tipo de examen adecuado para mejorar rápidamente.'
                )}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <Link to="/quizzes" className="inline-flex">
                <Button className={cn(indexViewAllButtonClass)}>
                  {t('Xem tất cả', 'Ver todos')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="inline-flex max-w-full flex-wrap items-center gap-x-1 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-center text-[13px] font-bold leading-snug text-primary shadow-sm sm:text-sm lg:text-right">
                {lang === 'vi'
                  ? `${quizTypes.length} chủ đề trọng tâm • ${primaryTypeQuizzes.length} đề thi thực hành`
                  : `${quizTypes.length} temas clave • ${primaryTypeQuizzes.length} exámenes prácticos`}
              </p>
            </div>
          </motion.div>

          {quizTypes.length ? (
            <div className="grid gap-6 lg:min-h-[200px] lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
              {/* Featured Quiz Type - Large Card */}
              <motion.div
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="h-full"
              >
                <Link to={`/quizzes?type=${encodeURIComponent(primaryQuizType || '')}`}>
                  <Card className="group h-full overflow-hidden border border-brand-cta-end/25 bg-[linear-gradient(180deg,rgba(255,252,253,0.99)_0%,rgba(255,242,246,0.95)_100%)] shadow-[0_14px_34px_rgba(29,8,15,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(29,8,15,0.3)]">
                    <div className="grid h-full min-h-[340px] grid-rows-[1fr_1fr_auto] sm:min-h-[370px] lg:min-h-[400px]">
                      <div className="relative row-span-2 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0)_62%),linear-gradient(180deg,rgba(255,245,248,0.88)_0%,rgba(255,228,236,0.62)_100%)] p-4 sm:p-5">
                          <img
                            src="/brand/quiz-illustration.png"
                            alt={formatQuizType(primaryQuizType || '')}
                            className="h-full w-full object-contain object-center drop-shadow-[0_22px_24px_rgba(65,10,24,0.34)] saturate-[1.08] transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(111,21,39,0.36)_0%,rgba(151,38,63,0.18)_50%,rgba(173,62,80,0.08)_100%)]" />
                        <div className="absolute left-4 top-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/36 px-4 py-2 text-sm font-semibold text-[#7a2038] backdrop-blur-sm sm:left-5 sm:top-5">
                          <Target className="h-4 w-4" />
                          {t('Đề nổi bật', 'Destacado')}
                        </div>
                      </div>
                      <CardContent className="row-span-1 border-t border-brand-cta-end/25 bg-[linear-gradient(135deg,rgba(104,22,40,0.94)_0%,rgba(140,33,55,0.92)_100%)] p-4 text-white sm:p-5">
                        <div className="grid gap-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h3 className="font-display text-2xl font-bold text-white sm:text-[1.65rem]">
                              {formatQuizType(primaryQuizType || '')}
                            </h3>
                            <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 border-white/90 bg-white px-4 text-sm font-semibold text-brand-cta-end shadow-md transition-all group-hover:-translate-y-0.5 group-hover:bg-white group-hover:shadow-lg [&_svg]:size-4 [&_svg]:transition-transform group-hover:[&_svg]:translate-x-1">
                              {t('Xem tiếp', 'Ver más')}
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="line-clamp-2 min-w-[220px] flex-1 text-sm text-white/92 sm:text-base">
                              {primaryTypeDescription}
                            </p>
                            <span className="text-sm font-semibold text-white/95 sm:text-base">
                              {lang === 'vi'
                                ? `${primaryTypeQuizzes.length} bài thi • ${primaryTypeQuestionTotal.toLocaleString('vi-VN')} câu hỏi`
                                : `${primaryTypeQuizzes.length} exámenes • ${primaryTypeQuestionTotal.toLocaleString('es-ES')} preguntas`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Other Quiz Types - Smaller Cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {quizTypes.slice(1, 5).length ? (
                  quizTypes.slice(1, 5).map((type, i) => {
                    const typeQuizzes = quizzes.filter(
                      (quiz) => String(quiz.quiz_type || '') === String(type)
                    );
                    const typeQuestionTotal = typeQuizzes.reduce(
                      (sum, quiz) => sum + Number(quiz.total_questions || 0),
                      0
                    );
                    const typeDescription = getTopicDescriptionByType(type);
                    const completedCount = typeQuizzes.filter((quiz) =>
                      Boolean(quiz.has_completed)
                    ).length;
                    const completionRate = typeQuizzes.length
                      ? Math.round((completedCount / typeQuizzes.length) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={type}
                        custom={i + 2}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                      >
                        <Link to={`/quizzes?type=${encodeURIComponent(type)}`} className="block">
                          <Card className="group overflow-hidden border border-border/80 bg-[linear-gradient(170deg,rgba(255,255,255,0.98)_0%,rgba(252,247,248,0.93)_100%)] shadow-[0_6px_18px_rgba(20,27,45,0.05)] transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_26px_rgba(20,27,45,0.12)]">
                            <CardContent className="p-0">
                              <div className="flex min-h-[124px]">
                                <div className="flex w-[5rem] shrink-0 flex-col items-center justify-center gap-2 self-stretch rounded-l-xl border-r border-primary/15 bg-[linear-gradient(180deg,rgba(122,32,56,0.2)_0%,rgba(122,32,56,0.08)_100%)] px-2 py-3 sm:w-[5.25rem]">
                                  <img
                                    src="/brand/test.png"
                                    alt=""
                                    className="h-12 w-12 object-contain object-center drop-shadow-[0_4px_10px_rgba(122,32,56,0.22)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-14 sm:w-14"
                                    loading="lazy"
                                    aria-hidden
                                  />
                                  <span className="font-display text-base font-bold tabular-nums leading-none text-primary sm:text-lg">
                                    {typeQuizzes.length}+
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col p-3.5">
                                  <div className="mb-1 flex items-start justify-between gap-2">
                                    <h4 className="min-w-0 flex-1 font-display text-base font-bold leading-snug text-foreground">
                                      {formatQuizType(type)}
                                    </h4>
                                    <span className={cn(indexCardOpenChipClass, 'shrink-0')}>
                                      {t('Mở', 'Abrir')}
                                      <ArrowRight className="h-4 w-4" />
                                    </span>
                                  </div>
                                  <p className="mb-1.5 text-[12px] font-semibold tabular-nums text-primary/90 sm:text-[13px]">
                                    {lang === 'vi'
                                      ? `${typeQuizzes.length} bài • ${typeQuestionTotal.toLocaleString('vi-VN')} câu hỏi`
                                      : `${typeQuizzes.length} exámenes • ${typeQuestionTotal.toLocaleString('es-ES')} preguntas`}
                                  </p>
                                  <p className="mb-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
                                    {typeDescription}
                                  </p>
                                  {completedCount > 0 && (
                                    <p className="mt-1 text-[11px] font-medium text-primary/85">
                                      {lang === 'vi'
                                        ? `Đã hoàn thành: ${completionRate}%`
                                        : `Completado: ${completionRate}%`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  <Card className="border border-dashed border-primary/25 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <p className="font-semibold text-foreground">
                        {t('Đang bổ sung thêm nhóm đề.', 'Estamos agregando más categorías.')}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t(
                          'Bạn có thể bắt đầu với đề nổi bật ở bên trái.',
                          'Puedes empezar con el examen destacado de la izquierda.'
                        )}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="border border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,247,248,0.95)_100%)] shadow-sm">
              <CardContent className="px-6 py-12 text-center sm:px-10">
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
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/quizzes" className="inline-flex">
                    <Button
                      className={cn(
                        'gap-2 rounded-full border-2 border-primary/30 bg-primary px-6 text-primary-foreground shadow-md hover:bg-secondary hover:shadow-lg [&_svg]:size-4 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5'
                      )}
                    >
                      {t('Xem bộ đề mẫu', 'Ver exámenes de muestra')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  {!isAuthenticated && (
                    <Link to="/register" className="inline-flex">
                      <Button
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/5"
                      >
                        {t('Tạo tài khoản để bắt đầu', 'Crear cuenta para empezar')}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Materials Section - Clean Carousel */}
      <section className="relative bg-background pt-10 pb-14 sm:pt-12 sm:pb-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
          >
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {t('Hệ thống ôn thi DGT', 'Sistema de preparación DGT')}
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                {t('Tài liệu học trọng tâm', 'Temario de estudio clave')}
              </h2>
              <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-[#4a3038] sm:text-lg">
                {t(
                  'Nội dung thiết yếu theo chủ đề để học đúng trọng tâm và tiết kiệm thời gian.',
                  'Contenido esencial por temas para estudiar con enfoque y ahorrar tiempo.'
                )}
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 lg:items-end">
              <Link to="/materials" className="inline-flex">
                <Button className={cn(indexViewAllButtonClass)}>
                  {t('Xem tất cả', 'Ver todos')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!!subjects.length && !isLoadingHome && (
                <p className="inline-flex max-w-full flex-wrap items-center gap-x-1 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-center text-[13px] font-bold leading-snug text-primary shadow-sm sm:text-sm lg:text-right">
                  {lang === 'vi' ? (
                    `${subjects.length} chủ đề tài liệu • ${formatCount(totalMaterialsCount)} tài liệu`
                  ) : (
                    <>
                      <span className="sm:hidden">
                        {featuredSubjects.length} destacados · desliza para más
                      </span>
                      <span className="hidden sm:inline">
                        {`${subjects.length} temas del temario • Total ${formatCount(totalMaterialsCount)} documentos. Mostrando ${featuredSubjects.length} temas destacados; desliza horizontalmente para ver más.`}
                      </span>
                    </>
                  )}
                </p>
              )}
              {isLoadingHome && (
                <p className="text-sm text-muted-foreground lg:text-right">
                  {t('Đang cập nhật danh sách tài liệu...', 'Actualizando el temario...')}
                </p>
              )}
            </div>
          </motion.div>

          {subjects.length ? (
            <div className="relative">
              <div
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-4 pl-0.5 pr-1 scrollbar-hide sm:gap-5 sm:pr-0"
                style={{ touchAction: 'auto', overscrollBehaviorX: 'contain' }}
              >
                {featuredSubjects.map((subject, i) => (
                  // Material count comes from live API per subject.
                  // If it fails, fallback to 0 so the card still renders safely.
                  <motion.div
                    key={subject.id}
                    custom={i + 1}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="w-[72vw] max-w-[240px] flex-shrink-0 snap-start sm:min-w-[280px] sm:max-w-none sm:w-[300px] lg:min-w-[340px] lg:w-[360px]"
                  >
                    <Link to={`/materials?subject=${subject.id}`}>
                      <Card className="group h-full border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
                        <CardContent className="p-0">
                          {/* Image Section — thấp hơn trên mobile để thẻ gọn */}
                          <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/5 to-accent/5 px-2 pt-2 sm:h-44 md:h-52">
                            <img
                              src="/brand/materials-illustration.png"
                              alt={subject.name}
                              className="h-full max-h-[7.5rem] w-full object-contain object-center sm:max-h-none"
                              loading="lazy"
                            />
                          </div>
                          {/* Content Section */}
                          <div className="flex min-h-[8.5rem] flex-col p-4 sm:min-h-[11rem] sm:p-5">
                            <h3 className="mb-1.5 line-clamp-2 font-display text-base font-bold leading-snug text-foreground sm:mb-2 sm:text-lg">
                              {subject.name}
                            </h3>
                            <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:mb-4 sm:text-sm">
                              {subject.description ||
                                t(
                                  'Xem tài liệu chi tiết cho chủ đề này',
                                  'Ver el temario de este tema'
                                )}
                            </p>
                            <div className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-border/50 pt-3 sm:gap-3 sm:pt-4">
                              <span className="min-w-0 truncate rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-semibold text-primary sm:px-2.5 sm:py-1 sm:text-xs">
                                {lang === 'vi'
                                  ? `${materialsCountBySubject[subject.id] || 0} tài liệu`
                                  : `${materialsCountBySubject[subject.id] || 0} documentos`}
                              </span>
                              <span
                                className={cn(
                                  indexCardOpenChipClass,
                                  'shrink-0 px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-[13px] [&_svg]:!size-3.5 sm:[&_svg]:!size-4'
                                )}
                              >
                                {t('Mở', 'Abrir')}
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-background to-transparent lg:block"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-l from-background to-transparent lg:block"
              />
            </div>
          ) : (
            <Card className="border border-primary/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,255,0.94)_100%)] shadow-sm">
              <CardContent className="px-6 py-10 text-center sm:px-10">
                <p className="text-lg font-semibold text-foreground">
                  {t(
                    'Tài liệu sẽ hiển thị tại đây khi hệ thống có dữ liệu.',
                    'El temario aparecerá aquí cuando el sistema tenga datos.'
                  )}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {t(
                    'Bạn vẫn có thể vào trang tài liệu để xem cấu trúc học tập.',
                    'Aun puedes ir al temario para ver la estructura de estudio.'
                  )}
                </p>
                <div className="mt-6 flex justify-center">
                  <Link to="/materials" className="inline-flex">
                    <Button className="gap-2 bg-primary px-6 text-primary-foreground hover:bg-secondary">
                      {t('Mở trang tài liệu', 'Abrir temario')}{' '}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA — nền đơn giản; scroll-mt tránh chồng lên thanh nav khi cuộn */}
      <section
        id="cta-dang-ky"
        className="relative w-full scroll-mt-24 overflow-x-hidden border-t border-primary/10 bg-[#2a0a12]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(52,10,20,0.76) 0%, rgba(82,12,29,0.62) 40%, rgba(18,4,9,0.74) 100%), url('/brand/bg_cta.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="relative z-[1] mx-auto flex w-full max-w-none flex-col items-center overflow-visible px-3 py-12 text-center sm:px-4 sm:py-14 md:px-5 lg:px-6 lg:py-16"
        >
          <div className="flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-5">
            <span className="inline-flex rounded-full border border-[#e8c88a]/55 bg-[rgba(12,4,8,0.45)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#fff4e6] shadow-sm backdrop-blur-[2px] sm:text-[11px]">
              {t('Hệ thống ôn thi DGT', 'Sistema de preparación DGT')}
            </span>
            <h2 className="cta-headline-luxe max-w-3xl px-1 pb-0.5 text-[1.35rem] sm:text-3xl md:text-4xl lg:text-[2.65rem]">
              {t(
                'Chinh phục kỳ thi bằng lái — lộ trình gọn, chuẩn DGT',
                'Prepárate para el teórico con un plan claro, alineado a la DGT'
              )}
            </h2>
            <p
              className={cn(
                'cta-subline-luxe w-full px-2 text-base leading-snug text-pretty sm:text-lg sm:leading-relaxed md:text-xl',
                lang === 'es' ? 'max-w-4xl' : 'max-w-2xl'
              )}
            >
              {t(
                'Đề mô phỏng thật • Chấm điểm tức thì • Song ngữ Việt – Español',
                'Simulacros reales • Puntuación al instante • Bilingüe viet–español'
              )}
            </p>
          </div>

          <div className="mt-10 flex w-full max-w-[min(100%,520px)] flex-col items-center gap-4 bg-transparent sm:mt-12">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="group block w-full bg-transparent p-0 shadow-none ring-0 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  <img
                    key={lang}
                    src={lang === 'vi' ? '/brand/dangky.png' : '/brand/dangky_es.png'}
                    alt={t('Bắt đầu học miễn phí', 'Empezar a estudiar gratis')}
                    className="h-auto w-full bg-transparent object-contain object-center brightness-[1.07] saturate-[1.08] transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    width={640}
                    height={200}
                  />
                </Link>
                <p className="max-w-sm text-center text-xs italic leading-relaxed text-[#f0e8dc] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:text-sm">
                  {t(
                    'Không cần đăng ký trước • Trải nghiệm ngay',
                    'Sin registro previo • Pruébalo ya'
                  )}
                </p>
              </>
            ) : (
              <>
                <Link to="/quizzes" className="block w-full">
                  <Button size="lg" className={ctaPrimaryGlowButtonClass}>
                    {t('Vào luyện thi', 'Ir a practicar')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/materials" className="block w-full">
                  <Button
                    size="lg"
                    variant="outline"
                    className={ctaSecondaryGlowButtonClass}
                  >
                    <BookOpen />
                    {t('Tài liệu học', 'Temario')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
