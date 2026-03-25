import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getLeaderboard, resolveMediaUrl, type LeaderboardUser } from '@/lib/api';
import { motion } from 'framer-motion';
import { Medal, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const Leaderboard = () => {
  const { t } = useLanguage();
  const [rows, setRows] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [failedAvatarIds, setFailedAvatarIds] = useState<Record<number, true>>({});

  const getDisplayName = (user: LeaderboardUser) => user.full_name || user.username || 'User';
  const getInitial = (user: LeaderboardUser) => getDisplayName(user).charAt(0).toUpperCase();
  const getAvatarSrc = (user: LeaderboardUser) => {
    if (!user.avatar_url || failedAvatarIds[user.id]) return null;
    return resolveMediaUrl(user.avatar_url);
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(20);
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

  const podiumIndexes = [1, 0, 2].filter((idx) => idx < ranked.length);

  return (
    <div className="app-page relative min-h-screen overflow-x-clip flex flex-col bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_86%_8%,rgba(255,224,160,0.48),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]">
      <Navbar />

      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden xl:block w-[86px] border-r border-white/35 bg-[linear-gradient(180deg,rgba(82,96,113,0.22)_0%,rgba(102,119,138,0.18)_45%,rgba(82,96,113,0.20)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden xl:block w-[86px] border-l border-white/35 bg-[linear-gradient(180deg,rgba(82,96,113,0.22)_0%,rgba(102,119,138,0.18)_45%,rgba(82,96,113,0.20)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[42px] hidden xl:block border-l-2 border-dashed border-white/65" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[42px] hidden xl:block border-l-2 border-dashed border-white/65" />

      <div className="relative z-10 px-2 py-4 md:px-4 md:py-6">
        <div className="mx-auto w-full max-w-[1500px] section-panel">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-gold" />
              <h1 className="font-display text-3xl md:text-4xl font-800 text-[#64172f]">
                {t('Bảng xếp hạng', 'Clasificación')}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {t('Top học viên có điểm số cao nhất', 'Los estudiantes con mejor puntuación')}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1500px] py-8 md:py-10 px-2 md:px-4 flex-1">
        {loading && (
          <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && ranked.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
              {podiumIndexes.map((idx) => {
                const user = ranked[idx];
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={user.id}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className={`text-center ${isFirst ? '-mt-5' : 'mt-4'}`}
                  >
                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-2 shadow-[0_8px_20px_rgba(95,20,40,0.12)] ${
                        idx === 0
                          ? 'bg-gold/20 ring-4 ring-gold'
                          : idx === 1
                            ? 'bg-muted ring-4 ring-muted-foreground/20'
                            : 'bg-secondary/20 ring-4 ring-secondary/30'
                      }`}
                    >
                      {getAvatarSrc(user) ? (
                        <img
                          src={getAvatarSrc(user) || ''}
                          alt={getDisplayName(user)}
                          className="h-full w-full rounded-full object-cover"
                          onError={() => {
                            setFailedAvatarIds((prev) => ({ ...prev, [user.id]: true }));
                          }}
                        />
                      ) : (
                        <span
                          className={`font-display text-xl font-bold ${
                            idx === 0
                              ? 'text-gold'
                              : idx === 1
                                ? 'text-muted-foreground'
                                : 'text-secondary'
                          }`}
                        >
                          {getInitial(user)}
                        </span>
                      )}
                    </div>
                    <Medal
                      className={`h-5 w-5 mx-auto mb-1 ${
                        idx === 0
                          ? 'text-gold'
                          : idx === 1
                            ? 'text-muted-foreground'
                            : 'text-secondary'
                      }`}
                    />
                    <p className="font-display font-semibold text-sm truncate">{getDisplayName(user)}</p>
                    <p className="font-display font-bold text-primary text-xl">
                      {Number(user.total_score || 0).toFixed(1)}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <Card className="mx-auto max-w-5xl border border-primary/20 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,247,250,0.88)_55%,rgba(255,249,235,0.78)_100%)] shadow-[0_16px_36px_rgba(95,20,40,0.16)]">
              <CardContent className="p-0">
                {ranked.map((user, i) => (
                  <motion.div
                    key={user.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                      i !== ranked.length - 1 ? 'border-b border-border/40' : ''
                    } ${i < 3 ? 'bg-gold/10' : 'hover:bg-primary/6'}`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full font-display font-bold text-sm ${
                        i === 0
                          ? 'bg-gold text-gold-foreground'
                          : i === 1
                            ? 'bg-muted text-foreground'
                            : i === 2
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i < 3 ? <Medal className="h-4 w-4" /> : user.rank}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary/10 bg-primary/10">
                      {getAvatarSrc(user) ? (
                        <img
                          src={getAvatarSrc(user) || ''}
                          alt={getDisplayName(user)}
                          className="h-full w-full object-cover"
                          onError={() => {
                            setFailedAvatarIds((prev) => ({ ...prev, [user.id]: true }));
                          }}
                        />
                      ) : (
                        <span className="font-display text-sm font-bold text-primary">
                          {getInitial(user)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{getDisplayName(user)}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.total_quizzes} {t('bài thi đã hoàn thành', 'exámenes completados')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-lg text-primary">
                        {Number(user.total_score || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('điểm', 'puntos')}</div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
