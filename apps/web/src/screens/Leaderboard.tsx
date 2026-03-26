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

  const topScore = useMemo(
    () => Number(ranked[0]?.total_score || 0),
    [ranked]
  );

  const totalCompleted = useMemo(
    () => ranked.reduce((sum, user) => sum + Number(user.total_quizzes || 0), 0),
    [ranked]
  );

  const desktopPodiumIndexes = [1, 0, 2].filter((idx) => idx < ranked.length);
  const mobilePodium = ranked.slice(0, 3);
  const mobileRemainingRows = ranked.slice(3);

  return (
    <div className="app-page relative flex min-h-screen flex-col overflow-x-clip bg-[radial-gradient(circle_at_14%_14%,rgba(255,220,228,0.42),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(255,232,182,0.32),transparent_30%),linear-gradient(180deg,#fbf7f9_0%,#f8f9fe_56%,#f9f3f7_100%)]">
      <Navbar />

      <section className="relative z-10 px-3 pb-3 pt-5 sm:px-5 md:px-7 md:pt-7 lg:px-10">
        <div className="mx-auto w-full max-w-[1500px] overflow-hidden rounded-[2rem] border border-[#7a2038]/12 bg-[linear-gradient(140deg,rgba(255,255,255,0.88)_0%,rgba(255,245,249,0.82)_52%,rgba(255,248,235,0.76)_100%)] p-4 shadow-[0_16px_36px_rgba(95,20,40,0.12)] backdrop-blur-[2px] sm:p-5 md:p-7 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#7a2038]/18 bg-white/65 px-3 py-1 text-sm font-semibold text-[#7a2038]">
                <Trophy className="h-4 w-4" />
                {t('Bảng xếp hạng trực tuyến', 'Ranking en tiempo real')}
              </div>
              <h1 className="font-display text-[1.55rem] font-black leading-tight text-[#4a1930] sm:text-[2.1rem] md:text-[2.7rem] lg:text-[3.05rem]">
                {t('Top học viên xuất sắc', 'Top estudiantes destacados')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#666278] sm:text-base md:text-lg">
                {t(
                  'Theo dõi thành tích mới nhất của học viên và bứt phá trên bảng xếp hạng.',
                  'Sigue el rendimiento más reciente y avanza en la clasificación.'
                )}
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:w-auto lg:min-w-[340px]">
              <Card className="rounded-2xl border border-[#7a2038]/15 bg-white/82 shadow-[0_8px_20px_rgba(95,20,40,0.08)]">
                <CardContent className="px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
                    {t('Thành viên', 'Participantes')}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-display text-2xl font-black text-[#4a1930]">
                    <Users className="h-5 w-5 text-[#7a2038]" />
                    {ranked.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border border-[#7a2038]/15 bg-white/82 shadow-[0_8px_20px_rgba(95,20,40,0.08)]">
                <CardContent className="px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
                    {t('Điểm cao nhất', 'Puntuación máxima')}
                  </div>
                  <div className="mt-1 font-display text-2xl font-black text-[#4a1930]">
                    {topScore.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border border-[#7a2038]/15 bg-white/82 shadow-[0_8px_20px_rgba(95,20,40,0.08)] sm:col-span-2">
                <CardContent className="px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7f6f79]">
                    {t('Tổng bài đã hoàn thành', 'Total de exámenes completados')}
                  </div>
                  <div className="mt-1 font-display text-2xl font-black text-[#4a1930]">
                    {totalCompleted}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-3 pb-8 pt-3 sm:px-5 md:px-7 md:pb-10 md:pt-5 lg:px-10">
        {loading && (
          <Card className="rounded-2xl border border-[#7a2038]/15 bg-white/80">
            <CardContent className="px-4 py-6 text-sm text-[#666278]">
              {t('Đang tải...', 'Cargando...')}
            </CardContent>
          </Card>
        )}
        {!loading && error && (
          <Card className="rounded-2xl border border-red-200 bg-red-50/85">
            <CardContent className="px-4 py-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && ranked.length > 0 && (
          <>
            <div className="mb-4 space-y-2.5 md:hidden">
              {mobilePodium.map((user, idx) => {
                const isFirst = idx === 0;
                const isSecondOrThird = idx > 0;
                return (
                  <motion.div
                    key={`mobile-podium-${user.id}`}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className={`rounded-2xl border border-[#7a2038]/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.9)_0%,rgba(249,237,242,0.78)_100%)] text-center shadow-[0_10px_24px_rgba(95,20,40,0.09)] ${
                      isFirst ? 'px-4 pb-4 pt-4' : 'px-4 pb-3 pt-3'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex items-center justify-center rounded-full border-2 shadow-[0_8px_20px_rgba(95,20,40,0.12)] ${
                        isFirst
                          ? 'h-20 w-20 border-amber-300'
                          : 'h-16 w-16 border-[#d8a8b7]'
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
                        <span className="font-display text-xl font-bold text-[#7a2038]">
                          {getInitial(user)}
                        </span>
                      )}
                    </div>
                    <Medal
                      className={`mx-auto mb-1 h-5 w-5 ${isFirst ? 'text-amber-500' : 'text-[#7a2038]'}`}
                    />
                    <p className="truncate font-display text-base font-semibold text-[#402631]">
                      {getDisplayName(user)}
                    </p>
                    <p className="font-display text-2xl font-black leading-tight text-[#7a2038]">
                      {Number(user.total_score || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-[#7f6f79]">#{user.rank}</p>
                    {isSecondOrThird && (
                      <p className="mt-1 text-xs text-[#7f6f79]">
                        {user.total_quizzes} {t('bài thi đã hoàn thành', 'exámenes completados')}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mb-8 hidden max-w-4xl grid-cols-1 gap-3 self-center sm:grid-cols-3 sm:gap-4 md:mb-10 md:grid">
              {desktopPodiumIndexes.map((idx) => {
                const user = ranked[idx];
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={user.id}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className={`rounded-2xl border border-[#7a2038]/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.9)_0%,rgba(249,237,242,0.78)_100%)] px-4 pb-4 pt-5 text-center shadow-[0_10px_24px_rgba(95,20,40,0.09)] ${
                      isFirst ? 'sm:-mt-3 sm:scale-[1.03]' : 'sm:mt-5'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-2 flex items-center justify-center rounded-full border-2 shadow-[0_8px_20px_rgba(95,20,40,0.12)] ${
                        isFirst
                          ? 'h-20 w-20 border-amber-300'
                          : 'h-14 w-14 border-[#d8a8b7] sm:h-16 sm:w-16'
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
                          className="font-display text-xl font-bold text-[#7a2038]"
                        >
                          {getInitial(user)}
                        </span>
                      )}
                    </div>
                    <Medal
                      className={`mx-auto mb-1 h-5 w-5 ${isFirst ? 'text-amber-500' : 'text-[#7a2038]'}`}
                    />
                    <p className="truncate font-display text-sm font-semibold text-[#402631]">
                      {getDisplayName(user)}
                    </p>
                    <p className="font-display text-lg font-black text-[#7a2038] sm:text-xl">
                      {Number(user.total_score || 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-[#7f6f79]">#{user.rank}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-2.5 md:hidden">
              {mobileRemainingRows.map((user, i) => (
                <motion.div
                  key={`mobile-${user.id}`}
                  custom={i + 3}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl border border-[#7a2038]/12 bg-white/80 px-3.5 py-3 shadow-[0_8px_20px_rgba(95,20,40,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                        user.rank === 1
                          ? 'border-amber-300 bg-amber-100 text-amber-700'
                          : user.rank === 2
                            ? 'border-slate-300 bg-slate-100 text-slate-700'
                            : user.rank === 3
                              ? 'border-orange-300 bg-orange-100 text-orange-700'
                              : 'border-[#d8a8b7] bg-white text-[#7a2038]'
                      }`}
                    >
                      {user.rank <= 3 ? <Medal className="h-4 w-4" /> : user.rank}
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#7a2038]/20 bg-white/75">
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
                        <span className="font-display text-sm font-bold text-[#7a2038]">
                          {getInitial(user)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[#3b2a33]">{getDisplayName(user)}</div>
                      <div className="text-xs text-[#7f6f79]">
                        {user.total_quizzes} {t('bài thi đã hoàn thành', 'exámenes completados')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-xl font-black leading-none text-[#7a2038]">
                        {Number(user.total_score || 0).toFixed(1)}
                      </div>
                      <div className="mt-1 text-xs text-[#7f6f79]">{t('điểm', 'puntos')}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Card className="mx-auto hidden w-full max-w-5xl overflow-hidden rounded-2xl border border-[#7a2038]/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(251,241,246,0.88)_56%,rgba(247,234,241,0.84)_100%)] shadow-[0_16px_36px_rgba(95,20,40,0.13)] md:block">
              <div className="grid grid-cols-[84px_1fr_auto] items-center border-b border-[#7a2038]/12 bg-white/52 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#7f6f79] md:grid-cols-[92px_1fr_170px]">
                <div>{t('Hạng', 'Puesto')}</div>
                <div>{t('Học viên', 'Estudiante')}</div>
                <div className="text-right">{t('Điểm số', 'Puntos')}</div>
              </div>
              <CardContent className="p-0">
                {ranked.map((user, i) => (
                  <motion.div
                    key={user.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className={`grid grid-cols-[84px_1fr_auto] items-center gap-2 px-5 py-3.5 transition-colors md:grid-cols-[92px_1fr_170px] ${
                      i !== ranked.length - 1 ? 'border-b border-[#7a2038]/10' : ''
                    } ${i < 3 ? 'bg-amber-50/48' : 'hover:bg-[#7a2038]/[0.04]'}`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm font-bold ${
                        i === 0
                          ? 'border-amber-300 bg-amber-100 text-amber-700'
                          : i === 1
                            ? 'border-slate-300 bg-slate-100 text-slate-700'
                            : i === 2
                              ? 'border-orange-300 bg-orange-100 text-orange-700'
                              : 'border-[#d8a8b7] bg-white text-[#7a2038]'
                      }`}
                    >
                      {i < 3 ? <Medal className="h-4 w-4" /> : user.rank}
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#7a2038]/20 bg-white/75">
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
                          <span className="font-display text-sm font-bold text-[#7a2038]">
                            {getInitial(user)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#3b2a33]">{getDisplayName(user)}</div>
                        <div className="text-xs text-[#7f6f79]">
                          {user.total_quizzes} {t('bài thi đã hoàn thành', 'exámenes completados')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-lg font-black text-[#7a2038]">
                        {Number(user.total_score || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-[#7f6f79]">{t('điểm', 'puntos')}</div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {!loading && !error && ranked.length === 0 && (
          <Card className="rounded-2xl border border-dashed border-[#7a2038]/25 bg-white/72">
            <CardContent className="px-5 py-8 text-sm text-[#666278]">
              {t('Chưa có dữ liệu bảng xếp hạng.', 'Aún no hay datos de clasificación.')}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
