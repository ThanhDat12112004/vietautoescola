import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { getLeaderboard as getLeaderboardStats, getMyLeaderboardRank as getMyLeaderboardRankStats } from '@/lib/api/quiz';
import { resolveMediaUrl } from '@/lib/api/upload';
import type { LeaderboardPeriod, LeaderboardUser, MyLeaderboardRank } from '@/lib/api/types';
import { useLanguage } from '@/hooks/useLanguage';
import { getStoredAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const RANK_BADGE_SVG: Record<number, string> = {
  1: '/brand/rank-top-1.svg',
  2: '/brand/rank-top-2.svg',
  3: '/brand/rank-top-3.svg',
  4: '/brand/rank-top-4.svg',
  5: '/brand/rank-top-5.svg',
};

/** Nền SVG full-width cho từng hàng top 1–5 */
const RANK_ROW_BG_SVG: Record<number, string> = {
  1: '/brand/rank-row-bg-1.svg',
  2: '/brand/rank-row-bg-2.svg',
  3: '/brand/rank-row-bg-3.svg',
  4: '/brand/rank-row-bg-4.svg',
  5: '/brand/rank-row-bg-5.svg',
};

const topRowBorderClass: Record<number, string> = {
  1: 'border-amber-400/55 ring-1 ring-amber-300/30',
  2: 'border-slate-400/55 ring-1 ring-slate-300/35',
  3: 'border-orange-400/50 ring-1 ring-orange-300/28',
  4: 'border-primary/40 ring-1 ring-primary/20',
  5: 'border-slate-500/45 ring-1 ring-slate-400/30',
};

const DEFAULT_PERIOD_AVAILABILITY: Record<LeaderboardPeriod, boolean> = {
  all: true,
  week: true,
  month: true,
};

/** Huy chương SVG (top 1–5) hoặc số thứ hạng */
function RankBadge({ rank, compact }: { rank: number; compact?: boolean }) {
  const svgSrc = RANK_BADGE_SVG[rank];

  if (svgSrc) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent shadow-sm ring-2 ring-white/90 dark:ring-border/50',
          compact ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10'
        )}
        aria-label={`#${rank}`}
      >
        <img src={svgSrc} alt="" width={40} height={40} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-bold tabular-nums text-foreground',
        compact ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm sm:h-10 sm:w-10'
      )}
      aria-label={`#${rank}`}
    >
      {rank}
    </div>
  );
}

const Leaderboard = () => {
  const { t } = useLanguage();
  const [failedAvatarIds, setFailedAvatarIds] = useState<Record<number, true>>({});
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const selfRowRef = useRef<HTMLLIElement | null>(null);

  const myUserId = getStoredAuth()?.user?.id ?? null;

  const {
    data: rows = [],
    isLoading: loading,
    error: leaderboardError,
  } = useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard', period],
    queryFn: () => getLeaderboardStats(10, period),
    staleTime: 15_000,
  });

  const error = useMemo(
    () =>
      leaderboardError
        ? leaderboardError instanceof Error
          ? leaderboardError.message
          : t('Không tải được bảng xếp hạng', 'No se pudo cargar el ranking')
        : '',
    [leaderboardError, t]
  );

  const { data: periodAvailability = DEFAULT_PERIOD_AVAILABILITY } = useQuery<
    Record<LeaderboardPeriod, boolean>
  >({
    queryKey: ['leaderboard-availability'],
    queryFn: async () => {
      const [weekRows, monthRows] = await Promise.all([
        getLeaderboardStats(1, 'week').catch(() => [] as LeaderboardUser[]),
        getLeaderboardStats(1, 'month').catch(() => [] as LeaderboardUser[]),
      ]);
      return {
        all: true,
        week: weekRows.length > 0,
        month: monthRows.length > 0,
      };
    },
    staleTime: 30_000,
  });

  const {
    data: myRank = null,
    isLoading: myRankLoading,
  } = useQuery<MyLeaderboardRank | null>({
    queryKey: ['leaderboard-me-rank', myUserId, period],
    queryFn: async () => {
      if (!myUserId) return null;
      return getMyLeaderboardRankStats(period);
    },
    enabled: Boolean(myUserId),
    staleTime: 15_000,
  });

  /** Ưu tiên họ tên đầy đủ; không có thì username */
  const getPrimaryName = (user: LeaderboardUser) => {
    const fn = user.full_name?.trim();
    if (fn) return fn;
    return user.username?.trim() || 'User';
  };
  const getInitial = (user: LeaderboardUser) => getPrimaryName(user).charAt(0).toUpperCase();
  const getAvatarSrc = (user: LeaderboardUser) => {
    if (!user.avatar_url || failedAvatarIds[user.id]) return null;
    return resolveMediaUrl(user.avatar_url);
  };

  const markAvatarFailed = (id: number) => {
    setFailedAvatarIds((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    if (period !== 'all' && !periodAvailability[period]) {
      setPeriod('all');
    }
  }, [period, periodAvailability]);

  const ranked = useMemo(() => rows.map((item, index) => ({ ...item, rank: index + 1 })), [rows]);

  const topScore = useMemo(() => Number(ranked[0]?.total_score || 0), [ranked]);
  const totalCompleted = useMemo(
    () => ranked.reduce((sum, user) => sum + Number(user.total_quizzes || 0), 0),
    [ranked]
  );

  const periodTabs = useMemo(
    () => [
      { key: 'all' as const, label: t('Tổng', 'Global') },
      { key: 'week' as const, label: t('Tuần', 'Semanal') },
      { key: 'month' as const, label: t('Tháng', 'Mensual') },
    ],
    [t]
  );

  useEffect(() => {
    if (loading || !myUserId || ranked.length === 0) return;
    const inList = ranked.some((u) => u.id === myUserId);
    if (!inList) return;
    const tid = window.setTimeout(() => {
      selfRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
    return () => window.clearTimeout(tid);
  }, [loading, myUserId, ranked]);

  const rankMotivation = useMemo(() => {
    if (!myRank || ranked.length === 0 || !myUserId) return null;
    const idx = ranked.findIndex((u) => u.id === myUserId);
    let gapAbove: number | null = null;
    if (idx > 0) {
      gapAbove = Number(ranked[idx - 1].total_score) - myRank.total_score;
    }
    const top10Cut = ranked.length >= 10 ? Number(ranked[9].total_score) : null;
    const gapTop10 =
      myRank.rank > 10 && top10Cut !== null
        ? Math.max(0, Number((top10Cut - myRank.total_score + 0.05).toFixed(2)))
        : null;
    const leaderScore = ranked.length > 0 ? Number(ranked[0].total_score) : null;
    const gapToFirst =
      myRank.rank > 1 && leaderScore !== null
        ? Math.max(0, Number((leaderScore - myRank.total_score + 0.05).toFixed(2)))
        : null;
    return { gapAbove, gapTop10, gapToFirst, inTop10: myRank.rank <= 10, idx };
  }, [myRank, myUserId, ranked]);

  return (
    <div className="app-page relative flex min-h-screen flex-col overflow-x-hidden bg-muted/25">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Cùng pattern tiêu đề với Quizzes / Materials */}
          <div className="border-b-2 border-primary/25 bg-card">
            <div className="w-full px-4 py-5 sm:px-6 md:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="min-w-0 max-w-3xl border-l-[3px] border-primary/60 pl-3 sm:pl-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                    {t('Cộng đồng', 'Comunidad')}
                  </p>
                  <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                    {t('Bảng xếp hạng', 'Clasificación')}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                    {t(
                      'Top 10 theo điểm tích lũy và độ chính xác. Chọn chu kỳ để xem tổng/tuần/tháng.',
                      'Top 10 por puntos y precisión. Cambia el periodo para ver global/semanal/mensual.'
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {periodTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setPeriod(tab.key)}
                        disabled={!periodAvailability[tab.key]}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors',
                          !periodAvailability[tab.key] && 'cursor-not-allowed opacity-45',
                          period === tab.key
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border bg-background text-foreground/70 hover:bg-muted'
                        )}
                      >
                        {tab.label}
                        {!periodAvailability[tab.key] ? ` (${t('Khóa', 'Bloq')})` : ''}
                      </button>
                    ))}
                  </div>
                  {!periodAvailability.week || !periodAvailability.month ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t(
                        'Dữ liệu Tuần/Tháng đang được cập nhật, tab sẽ mở khi có lượt làm bài.',
                        'Los datos semanal/mensual se están actualizando; se abrirán cuando haya intentos.'
                      )}
                    </p>
                  ) : null}

                  {/* Luôn thấy “tôi ở đâu” — tách biệt bảng, không lẫn với hàng user */}
                  {myUserId && (
                    <div
                      className={cn(
                        'mt-4 rounded-2xl border-2 border-primary/35 bg-gradient-to-br from-primary/10 via-white to-amber-400/[0.08]',
                        'px-4 py-3 shadow-md dark:from-primary/15 dark:via-card dark:to-card sm:px-5 sm:py-4'
                      )}
                    >
                      {myRankLoading && (
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('Đang tải vị trí của bạn…', 'Cargando tu posición…')}
                        </p>
                      )}
                      {!myRankLoading && myRank && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-base font-bold text-foreground sm:text-lg">
                            <span className="inline-flex items-center gap-1.5 tabular-nums" title="Rank">
                              {t('Hạng', 'Puesto')}{' '}
                              <span className="text-primary">#{myRank.rank}</span>
                            </span>
                            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
                            <span className="inline-flex items-center gap-1.5 tabular-nums" title="Score">
                              {t('Điểm:', 'Pts:')}{' '}
                              <span className="text-foreground">{Number(myRank.total_score).toFixed(1)}</span>
                            </span>
                            {rankMotivation?.gapToFirst != null && rankMotivation.gapToFirst > 0 && (
                              <>
                                <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
                                <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-amber-800 dark:text-amber-400">
                                  {t(
                                    `Còn ~${rankMotivation.gapToFirst} để vượt #1`,
                                    `~${rankMotivation.gapToFirst} pts para el #1`
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          {rankMotivation?.gapTop10 != null && rankMotivation.gapTop10 > 0 && (
                            <p className="text-sm font-medium text-foreground/85">
                              {t(
                                `Còn ~${rankMotivation.gapTop10} điểm để lọt Top 10 trên bảng này.`,
                                `~${rankMotivation.gapTop10} pts para entrar en el top 10.`
                              )}
                            </p>
                          )}
                        </div>
                      )}
                      {!myRankLoading && !myRank && (
                        <p className="text-sm text-muted-foreground">
                          {t(
                            'Không lấy được hạng — thử đăng nhập lại hoặc làm mới trang.',
                            'No se pudo cargar el puesto. Recarga o vuelve a iniciar sesión.'
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-3 sm:justify-end sm:gap-4">
                  {[
                    { v: ranked.length, l: t('BXH', 'Lista') },
                    { v: topScore.toFixed(1), l: t('Max', 'Máx') },
                    { v: totalCompleted, l: t('Bài', 'Ex.') },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3.5 py-2 text-xs shadow-sm sm:px-4"
                    >
                      <span className="font-display font-bold tabular-nums text-foreground">{s.v}</span>
                      <span className="text-muted-foreground">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex-1 pb-0">
            {loading && (
              <p className="px-4 py-4 text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
            )}
            {!loading && error && (
              <div className="px-4 py-4">
                <Card className="border-destructive/40 bg-card">
                  <CardContent className="px-4 py-4 text-sm text-destructive">{error}</CardContent>
                </Card>
              </div>
            )}

            {!loading && !error && ranked.length === 0 && (
              <div className="px-4 py-4">
                <Card className="border-dashed border-border">
                  <CardContent className="px-5 py-10 text-center text-sm text-muted-foreground">
                    {t('Chưa có dữ liệu bảng xếp hạng.', 'Aún no hay datos de clasificación.')}
                  </CardContent>
                </Card>
              </div>
            )}

            {!loading && !error && ranked.length > 0 && (
              <div className="w-full px-0 pb-4 pt-0">
                <div
                  className={cn(
                    'mx-auto w-full max-w-full overflow-hidden rounded-none border-x-0 border-y border-slate-200/90 bg-white',
                    'shadow-[0_2px_16px_rgba(45,25,35,0.05)]',
                    'dark:border-border dark:bg-card',
                    'lg:min-h-[min(92vh,calc(100dvh-8.5rem))]'
                  )}
                >
                    <div
                    className={cn(
                      'min-w-0 bg-gradient-to-b from-slate-100/95 via-white to-white',
                      'px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 md:px-8',
                      'dark:from-muted/45 dark:via-card dark:to-card'
                    )}
                  >
                    {/* Vị trí của bạn — retention / động lực */}
                    <div className="mb-4 space-y-3 border-b border-slate-200/70 pb-4 dark:border-border">
                      {!myUserId && (
                        <p className="text-[13px] leading-relaxed text-foreground/80 sm:text-sm">
                          <Link to="/login" className="font-semibold text-primary underline-offset-2 hover:underline">
                            {t('Đăng nhập', 'Inicia sesión')}
                          </Link>
                          {t(' để xem thứ hạng và điểm của bạn.', ' para ver tu posición y puntos.')}
                        </p>
                      )}
                      {myUserId && myRank && (
                        <div
                          className={cn(
                            'rounded-2xl border-2 px-4 py-3 shadow-sm sm:px-5 sm:py-4',
                            'border-primary/40 bg-gradient-to-br from-primary/[0.08] via-white to-amber-400/[0.07]',
                            'dark:from-primary/15 dark:via-card dark:to-card'
                          )}
                        >
                          <p className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                            {t('Bạn đang xếp hạng', 'Tu posición')}{' '}
                            <span className="tabular-nums text-primary">#{myRank.rank}</span>
                            {t(' · Điểm:', ' · Puntos:')}{' '}
                            <span className="tabular-nums text-foreground">
                              {Number(myRank.total_score).toFixed(1)}
                            </span>
                          </p>
                          {myRank.rank === 1 && (
                            <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                              {t('Bạn đang dẫn đầu bảng xếp hạng!', '¡Líder del ranking!')}
                            </p>
                          )}
                          {myRank.rank > 1 && myRank.rank <= 10 && (
                            <p className="mt-2 text-sm font-medium text-foreground/85">
                              {t('Cố lên để vào Top 3!', '¡Sigue así para el top 3!')}
                            </p>
                          )}
                          {rankMotivation?.gapAbove != null &&
                            rankMotivation.gapAbove > 0.05 &&
                            rankMotivation.idx > 0 && (
                              <p className="mt-1.5 text-sm text-foreground/80">
                                {t(
                                  `Còn khoảng ${rankMotivation.gapAbove.toFixed(1)} điểm để vượt người ngay phía trên.`,
                                  `Faltan unos ${rankMotivation.gapAbove.toFixed(1)} pts para superar al de arriba.`
                                )}
                              </p>
                            )}
                          {rankMotivation?.gapToFirst != null &&
                            rankMotivation.gapToFirst > 0 &&
                            myRank.rank > 1 && (
                              <p className="mt-1.5 text-sm font-medium text-foreground/85">
                                {t(
                                  `Bạn gần vượt hạng #1 — còn khoảng ${rankMotivation.gapToFirst} điểm (theo điểm hiện có trên bảng).`,
                                  `Cerca del #1: faltan unos ${rankMotivation.gapToFirst} pts (según esta tabla).`
                                )}
                              </p>
                            )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              to="/quizzes"
                              className={cn(
                                'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white',
                                'bg-[linear-gradient(135deg,#ff4d4f_0%,#ff7a18_100%)] shadow-md transition hover:brightness-[1.03]'
                              )}
                            >
                              {t('Làm thêm bài để tăng rank', 'Practica más para subir')}
                            </Link>
                            {myRank.rank > 10 && (
                              <span className="self-center text-xs text-muted-foreground">
                                {t('BXH hiển thị top 10 — hãy leo rank để lọt vào danh sách.', 'Solo se muestran 10 — sigue sumando.')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tiêu đề cột */}
                    <div className="flex items-center gap-3 border-b border-slate-200/80 bg-slate-100/90 px-0 py-4 sm:gap-5 sm:py-5 dark:border-border dark:bg-muted/50">
                      <span className="w-8 shrink-0 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:w-9">
                        #
                      </span>
                      <span className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" aria-hidden />
                      <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:text-xs">
                        {t('Họ và tên', 'Nombre completo')}
                      </span>
                      <span className="w-[5.75rem] shrink-0 text-center text-xs font-bold uppercase tracking-wide text-foreground sm:w-28 sm:text-[13px]">
                        {t('Bài làm', 'Exámenes')}
                      </span>
                      <span className="w-[6.75rem] shrink-0 text-right text-xs font-bold uppercase tracking-wide text-primary sm:w-[8.5rem] sm:text-[13px]">
                        {t('Điểm', 'Pts')}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-3 px-0 pb-2 pt-4 sm:gap-4 md:gap-5 sm:pb-3 sm:pt-5">
                      {ranked.map((user) => {
                        const rowBg = RANK_ROW_BG_SVG[user.rank];
                        const isTop5 = user.rank >= 1 && user.rank <= 5;
                        const restStripeEven = !isTop5 && user.rank % 2 === 0;
                        const restStripeOdd = !isTop5 && user.rank % 2 === 1;
                        const isMe = myUserId !== null && user.id === myUserId;
                        return (
                          <li
                            key={user.id}
                            ref={isMe ? selfRowRef : undefined}
                            className={cn(
                              'group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300',
                              isMe &&
                                'z-[2] border-primary/55 ring-2 ring-primary/35 ring-offset-2 ring-offset-white dark:ring-offset-card',
                              user.rank === 1 &&
                                'z-[3] shadow-[0_14px_44px_rgba(251,191,36,0.38)] ring-2 ring-amber-400/60 sm:scale-[1.015] sm:shadow-[0_18px_50px_rgba(251,191,36,0.42)]',
                              restStripeEven &&
                                'border-slate-300/90 bg-slate-100/95 font-medium text-foreground hover:border-primary/35 hover:shadow-md dark:border-border dark:bg-muted/55 dark:hover:border-primary/35',
                              restStripeOdd &&
                                'border-slate-300/90 bg-white hover:border-primary/30 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-primary/30',
                              isTop5 &&
                                cn(
                                  'shadow-md hover:shadow-lg dark:border-border',
                                  topRowBorderClass[user.rank]
                                )
                            )}
                          >
                            {rowBg && (
                              <>
                                <div
                                  className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat dark:opacity-[0.88]"
                                  style={{ backgroundImage: `url(${rowBg})` }}
                                  aria-hidden
                                />
                                <div
                                  className={cn(
                                    'pointer-events-none absolute inset-0 dark:bg-card/55',
                                    user.rank <= 3 ? 'bg-white/32' : 'bg-white/38'
                                  )}
                                  aria-hidden
                                />
                              </>
                            )}
                            <div className="relative z-[1] flex min-h-[5rem] items-center gap-3 px-3 py-4 sm:min-h-[5.5rem] sm:gap-5 sm:px-5 sm:py-5">
                              <RankBadge rank={user.rank} compact />
                              <div
                                className={cn(
                                  'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md ring-2 ring-slate-200/80',
                                  'sm:h-14 sm:w-14 sm:ring-4',
                                  'dark:border-border dark:bg-muted dark:ring-border/60'
                                )}
                              >
                                {getAvatarSrc(user) ? (
                                  <img
                                    src={getAvatarSrc(user) || ''}
                                    alt={getPrimaryName(user)}
                                    width={112}
                                    height={112}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                    onError={() => markAvatarFailed(user.id)}
                                  />
                                ) : (
                                  <span className="font-display text-lg font-bold text-primary sm:text-xl">
                                    {getInitial(user)}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 py-1">
                                <p
                                  className="line-clamp-2 break-words text-base font-bold leading-snug text-foreground sm:text-lg"
                                  title={getPrimaryName(user)}
                                >
                                  <span className="inline-flex items-center gap-1.5 align-middle">
                                    <span>{getPrimaryName(user)}</span>
                                    {isMe && (
                                      <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:text-[11px]">
                                        {t('Bạn', 'Tú')}
                                      </span>
                                    )}
                                  </span>
                                </p>
                                {Number(user.average_percentage) > 0 && (
                                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                    {t('TB', 'Prom.')}{' '}
                                    <span className="font-medium tabular-nums text-foreground/80">
                                      {Math.round(Number(user.average_percentage))}%
                                    </span>
                                  </p>
                                )}
                                {isMe && (
                                  <Link
                                    to="/quizzes"
                                    className="mt-2 inline-flex items-center text-sm font-bold text-primary underline-offset-2 hover:underline"
                                  >
                                    {t('Luyện thi ngay', 'Practicar ya')}
                                  </Link>
                                )}
                                {!isMe && (
                                  <Link
                                    to="/quizzes"
                                    className="mt-2 hidden items-center gap-1 text-xs font-semibold text-primary/90 underline-offset-2 hover:underline group-hover:inline-flex sm:text-sm"
                                  >
                                    {t('Luyện để cạnh tranh hạng này', 'Practica para competir')}
                                  </Link>
                                )}
                              </div>
                              <div className="flex w-[5.25rem] shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-white/75 px-1 py-2 backdrop-blur-[2px] sm:w-24 sm:py-2.5 dark:border-border dark:bg-muted/60">
                                <span className="text-[11px] font-bold uppercase leading-tight tracking-wide text-muted-foreground sm:text-[13px]">
                                  {t('Bài', 'Ex.')}
                                </span>
                                <span className="mt-1 font-display text-lg font-bold tabular-nums leading-none text-foreground sm:text-xl">
                                  {user.total_quizzes}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'flex w-[6.75rem] shrink-0 flex-col items-center justify-center rounded-xl border px-2 py-2.5 sm:w-[8.5rem] sm:py-3.5',
                                  'border-primary/40 bg-gradient-to-b from-primary/22 to-primary/[0.12] shadow-md backdrop-blur-[1px]',
                                  'dark:from-primary/28 dark:to-primary/16'
                                )}
                              >
                                <span className="text-[11px] font-bold uppercase leading-tight tracking-wide text-primary sm:text-[13px]">
                                  {t('Điểm', 'Pts')}
                                </span>
                                <span className="mt-1.5 inline-flex items-baseline gap-0.5 font-display text-3xl font-extrabold tabular-nums leading-none text-primary sm:text-4xl">
                                  {Number(user.total_score || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Leaderboard;
