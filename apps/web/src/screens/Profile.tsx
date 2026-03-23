import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getLeaderboard,
  getMyDashboard,
  type DashboardResponse,
  type LeaderboardUser,
} from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Medal,
  Target,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const Profile = () => {
  const { t, lang } = useLanguage();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const [dashboardData, leaderboardData] = await Promise.all([
          getMyDashboard(lang),
          getLeaderboard(20),
        ]);
        if (!active) return;
        setDashboard(dashboardData);
        setLeaderboard(leaderboardData);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được dữ liệu hồ sơ', 'No se pudo cargar el perfil')
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
  }, [lang, t]);

  const rank = useMemo(() => {
    if (!dashboard?.stats?.id) return null;
    const idx = leaderboard.findIndex((row) => row.id === dashboard.stats.id);
    return idx >= 0 ? idx + 1 : null;
  }, [dashboard, leaderboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-8 flex-1">
          <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-8 flex-1">
          <p className="text-sm text-destructive">{error || t('Không có dữ liệu', 'Sin datos')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = dashboard.stats;
  const attempts = dashboard.history || [];
  const storedEmail = getStoredAuth()?.user?.email || '-';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="bg-primary">
        <div className="container py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-3 border-primary-foreground/30">
                <User className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground/70" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="font-display text-lg md:text-xl font-800 text-primary-foreground truncate">
                {stats.full_name || stats.username}
              </h1>
              <p className="text-primary-foreground/60 text-xs">@{stats.username}</p>
              <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                <Medal className="h-3.5 w-3.5 text-accent" />
                <span className="text-primary-foreground/80 text-xs font-medium">
                  {rank ? `${t('Hạng', 'Puesto')} #${rank}` : t('Chưa xếp hạng', 'Sin ranking')}
                </span>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6">
              {[
                {
                  icon: Trophy,
                  value: Number(stats.total_score || 0).toFixed(1),
                  label: t('Điểm', 'Puntos'),
                },
                {
                  icon: Target,
                  value: String(stats.total_quizzes || 0),
                  label: t('Bài thi', 'Tests'),
                },
                {
                  icon: TrendingUp,
                  value: `${Number(stats.average_percentage || 0).toFixed(1)}%`,
                  label: t('Đúng', 'Aciertos'),
                },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <s.icon className="h-4 w-4 text-accent mx-auto mb-0.5" />
                  <div className="font-display text-lg font-900 text-primary-foreground">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-primary-foreground/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 flex-1">
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4 bg-card border border-border w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="info" className="gap-1 text-xs">
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('Thông tin', 'Info')}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('Lịch sử', 'Historial')}</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1 text-xs">
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('Xếp hạng', 'Ranking')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/50">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <h3 className="font-display font-bold text-sm">
                      {t('Thông tin tài khoản', 'Información de cuenta')}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-2 px-4 pb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('Tên', 'Nombre')}: </span>
                      {stats.full_name || '-'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Username: </span>
                      {stats.username}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      {storedEmail}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <h3 className="font-display font-bold text-sm">
                      {t('Thống kê học tập', 'Estadísticas')}
                    </h3>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        {
                          label: t('Tổng điểm', 'Puntuación'),
                          value: Number(stats.total_score || 0).toFixed(1),
                          icon: Trophy,
                        },
                        {
                          label: t('Bài thi', 'Exámenes'),
                          value: stats.total_quizzes,
                          icon: Target,
                        },
                        {
                          label: t('Câu đúng', 'Aciertos'),
                          value: `${stats.total_correct}/${stats.total_questions}`,
                          icon: CheckCircle2,
                        },
                        {
                          label: t('Xếp hạng', 'Ranking'),
                          value: rank ? `#${rank}` : '-',
                          icon: Medal,
                        },
                      ].map((item, i) => (
                        <div key={i} className="bg-muted rounded-lg p-3 flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <div className="text-[10px] text-muted-foreground">{item.label}</div>
                            <div className="font-display font-bold text-sm text-primary">
                              {item.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {t('Tỷ lệ đúng', '% Aciertos')}
                        </span>
                        <span className="font-bold text-primary">
                          {Number(stats.average_percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Number(stats.average_percentage || 0)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-2.5 text-left font-semibold text-xs">
                            {t('Bài thi', 'Examen')}
                          </th>
                          <th className="px-4 py-2.5 text-center font-semibold text-xs">
                            {t('Điểm', 'Nota')}
                          </th>
                          <th className="px-4 py-2.5 text-center font-semibold text-xs">
                            {t('Đúng', 'Aciertos')}
                          </th>
                          <th className="px-4 py-2.5 text-center font-semibold text-xs">
                            {t('Ngày', 'Fecha')}
                          </th>
                          <th className="px-4 py-2.5 text-center font-semibold text-xs">
                            {t('Kết quả', 'Resultado')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((attempt) => (
                          <tr
                            key={attempt.id}
                            className="border-b border-border/50 hover:bg-muted/30"
                          >
                            <td className="px-4 py-2.5 flex items-center gap-2">
                              <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate max-w-[200px] text-xs">
                                {attempt.quiz_title}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="font-display font-bold text-primary text-xs">
                                {Number(attempt.score || 0).toFixed(1)}
                              </span>
                              <span className="text-muted-foreground text-xs">/10</span>
                            </td>
                            <td className="px-4 py-2.5 text-center text-xs">
                              {attempt.correct_count}/{attempt.total_questions}
                            </td>
                            <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                              {(attempt.completed_at || attempt.started_at || '').slice(0, 10)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  Number(attempt.score || 0) >= 5
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                {Number(attempt.score || 0) >= 5
                                  ? t('Đậu', 'Aprobado')
                                  : t('Trượt', 'Suspenso')}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {attempts.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-5 text-center text-xs text-muted-foreground"
                            >
                              {t('Chưa có lịch sử làm bài', 'Sin historial')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ranking">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2 px-4 pt-4">
                  <h3 className="font-display font-bold text-sm">
                    {t('Vị trí của bạn', 'Tu posición')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {rank
                      ? `${t('Xếp hạng', 'Posición')} #${rank}`
                      : t('Chưa có thứ hạng', 'Sin posición')}
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  {leaderboard.map((user, i) => {
                    const isMe = user.id === stats.id;
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i !== leaderboard.length - 1 ? 'border-b border-border/50' : ''
                        } ${isMe ? 'bg-primary/5 border-l-3 border-l-primary' : ''}`}
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full font-display font-bold text-xs ${
                            i === 0
                              ? 'bg-accent text-accent-foreground'
                              : i === 1
                                ? 'bg-muted text-foreground'
                                : i === 2
                                  ? 'bg-primary/15 text-primary'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {i < 3 ? <Medal className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">
                            {user.full_name}
                            {isMe && (
                              <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground px-1 py-0.5 rounded">
                                {t('Bạn', 'Tú')}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {user.total_quizzes} {t('bài', 'tests')}
                          </div>
                        </div>
                        <div className="font-display font-bold text-sm text-primary">
                          {Number(user.total_score || 0).toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <div className="px-4 py-5 text-xs text-muted-foreground">
                      {t('Chưa có bảng xếp hạng', 'Sin ranking')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
