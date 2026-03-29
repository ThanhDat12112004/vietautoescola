import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getLeaderboard, resolveMediaUrl, type LeaderboardUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Medal, Sparkles, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
  const [rows, setRows] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [failedAvatarIds, setFailedAvatarIds] = useState<Record<number, true>>({});

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
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(10);
        if (!active) return;
        setRows(data);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được bảng xếp hạng', 'No se pudo cargar el ranking')
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
  }, [t]);

  const ranked = useMemo(() => rows.map((item, index) => ({ ...item, rank: index + 1 })), [rows]);

  const topScore = useMemo(() => Number(ranked[0]?.total_score || 0), [ranked]);
  const totalCompleted = useMemo(
    () => ranked.reduce((sum, user) => sum + Number(user.total_quizzes || 0), 0),
    [ranked]
  );

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
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                    <Sparkles className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                    {t('Cộng đồng', 'Comunidad')}
                  </p>
                  <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                    {t('Bảng xếp hạng', 'Clasificación')}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                    {t('10 hàng xếp hạng theo điểm.', '10 filas de ranking por puntuación.')}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3 sm:justify-end sm:gap-4">
                  {[
                    { icon: Users, v: ranked.length, l: t('BXH', 'Lista') },
                    { icon: Trophy, v: topScore.toFixed(1), l: t('Max', 'Máx') },
                    { icon: Medal, v: totalCompleted, l: t('Bài', 'Ex.') },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3.5 py-2 text-xs shadow-sm sm:px-4"
                    >
                      <s.icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
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
                      <span className="w-[6rem] shrink-0 text-right text-xs font-bold uppercase tracking-wide text-primary sm:w-32 sm:text-[13px]">
                        {t('Điểm', 'Pts')}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-3 px-0 pb-2 pt-4 sm:gap-4 md:gap-5 sm:pb-3 sm:pt-5">
                      {ranked.map((user) => {
                        const rowBg = RANK_ROW_BG_SVG[user.rank];
                        const isTop5 = user.rank >= 1 && user.rank <= 5;
                        const restStripeEven = !isTop5 && user.rank % 2 === 0;
                        const restStripeOdd = !isTop5 && user.rank % 2 === 1;
                        return (
                          <li
                            key={user.id}
                            className={cn(
                              'relative overflow-hidden rounded-2xl border shadow-sm transition-all',
                              restStripeEven &&
                                'border-slate-200/75 bg-slate-50/95 hover:border-primary/30 hover:shadow-md dark:border-border dark:bg-muted/45 dark:hover:border-primary/35',
                              restStripeOdd &&
                                'border-slate-200/70 bg-white hover:border-primary/25 hover:shadow-md dark:border-border dark:bg-card/85 dark:hover:border-primary/30',
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
                                  className="pointer-events-none absolute inset-0 bg-white/45 dark:bg-card/55"
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
                                  className="line-clamp-2 break-words text-base font-semibold leading-snug text-foreground sm:text-lg"
                                  title={getPrimaryName(user)}
                                >
                                  {getPrimaryName(user)}
                                </p>
                                {Number(user.average_percentage) > 0 && (
                                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                    {t('TB', 'Prom.')}{' '}
                                    <span className="font-medium tabular-nums text-foreground/80">
                                      {Math.round(Number(user.average_percentage))}%
                                    </span>
                                  </p>
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
                                  'flex w-[6rem] shrink-0 flex-col items-center justify-center rounded-xl border px-2 py-2.5 sm:w-32 sm:py-3',
                                  'border-primary/35 bg-gradient-to-b from-primary/18 to-primary/[0.1] shadow-sm backdrop-blur-[1px]',
                                  'dark:from-primary/24 dark:to-primary/14'
                                )}
                              >
                                <span className="text-[11px] font-bold uppercase leading-tight tracking-wide text-primary sm:text-[13px]">
                                  {t('Điểm', 'Pts')}
                                </span>
                                <span className="mt-1 font-display text-xl font-bold tabular-nums leading-none text-primary sm:text-2xl">
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
