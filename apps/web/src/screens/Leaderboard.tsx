import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { getLeaderboard, type LeaderboardUser } from '@/lib/api';
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
    <div className="app-page min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-hero-pattern py-12 md:py-16">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-gold" />
            <h1 className="font-display text-3xl md:text-4xl font-800">
              {t('Bảng xếp hạng', 'Clasificación')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('Top học viên có điểm số cao nhất', 'Los estudiantes con mejor puntuación')}
          </p>
        </div>
      </div>

      <div className="container py-10 flex-1">
        {loading && (
          <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && ranked.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
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
                    className={`text-center ${isFirst ? '-mt-4' : 'mt-4'}`}
                  >
                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-2 ${
                        idx === 0
                          ? 'bg-gold/20 ring-4 ring-gold'
                          : idx === 1
                            ? 'bg-muted ring-4 ring-muted-foreground/20'
                            : 'bg-secondary/20 ring-4 ring-secondary/30'
                      }`}
                    >
                      <Users
                        className={`h-7 w-7 ${
                          idx === 0
                            ? 'text-gold'
                            : idx === 1
                              ? 'text-muted-foreground'
                              : 'text-secondary'
                        }`}
                      />
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
                    <p className="font-display font-bold text-sm truncate">{user.full_name}</p>
                    <p className="font-display font-900 text-primary text-lg">
                      {Number(user.total_score || 0).toFixed(1)}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <Card className="border-border/50 max-w-2xl mx-auto">
              <CardContent className="p-0">
                {ranked.map((user, i) => (
                  <motion.div
                    key={user.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      i !== ranked.length - 1 ? 'border-b border-border/50' : ''
                    } ${i < 3 ? 'bg-gold/5' : ''}`}
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.full_name}</div>
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
