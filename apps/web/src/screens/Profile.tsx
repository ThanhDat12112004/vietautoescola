import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getLeaderboard,
  getMyDashboard,
  resolveMediaUrl,
  updateMyAvatar,
  updateMyProfile,
  uploadAvatarImage,
  type DashboardResponse,
  type LeaderboardUser,
} from '@/lib/api';
import { getStoredAuth, updateStoredAuthUser } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Camera,
  CheckCircle2,
  Clock,
  Medal,
  Target,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function toStoredMediaPath(uploaded: { key?: string; cdn_url?: string } | null | undefined) {
  if (!uploaded) return '';

  const key = String(uploaded.key || '').trim();
  if (key) {
    return `/media/static/${key}`;
  }

  const raw = String(uploaded.cdn_url || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }
}

const Profile = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
        updateStoredAuthUser({ full_name: dashboardData?.stats?.full_name || null });
        setDisplayName(dashboardData?.stats?.full_name || '');
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
      <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_86%_8%,rgba(255,224,160,0.48),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]">
        <Navbar />
        <div className="px-2 md:px-4 py-4 flex-1">
          <div className="container section-panel py-5 md:py-6">
            <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_86%_8%,rgba(255,224,160,0.48),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]">
        <Navbar />
        <div className="px-2 md:px-4 py-4 flex-1">
          <div className="container section-panel py-5 md:py-6">
            <p className="text-sm text-destructive">
              {error || t('Không có dữ liệu', 'Sin datos')}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = dashboard.stats;
  const attempts = dashboard.history || [];
  const storedEmail = getStoredAuth()?.user?.email || '-';

  const handleToggleEditProfile = () => {
    if (isEditingProfile) {
      setDisplayName(stats.full_name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setIsEditingProfile(false);
      return;
    }

    setIsEditingProfile(true);
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error(t('Vui lòng chọn file ảnh', 'Selecciona un archivo de imagen'));
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(t('Ảnh tối đa 5MB', 'La imagen no debe superar 5MB'));
      }

      setAvatarUploading(true);
      setError('');

      const uploaded = await uploadAvatarImage(file);
      const storedAvatarPath = toStoredMediaPath(uploaded);
      const updated = await updateMyAvatar(storedAvatarPath);
      const nextAvatarUrl = updated.user?.avatar_url || storedAvatarPath;

      setDashboard((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          stats: {
            ...prev.stats,
            avatar_url: nextAvatarUrl,
          },
        };
      });

      updateStoredAuthUser({ avatar_url: nextAvatarUrl });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Cập nhật ảnh thất bại', 'No se pudo actualizar avatar')
      );
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleNameUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditingProfile || nameSaving) {
      return;
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError(t('Tên hiển thị không được để trống', 'El nombre no puede estar vacío'));
      return;
    }

    try {
      setNameSaving(true);
      setError('');

      const result = await updateMyProfile({ full_name: trimmedName });

      const nextFullName = result.user?.full_name || trimmedName;

      setDashboard((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          stats: {
            ...prev.stats,
            full_name: nextFullName,
          },
        };
      });

      updateStoredAuthUser({ full_name: nextFullName });
      setDisplayName(nextFullName);

      toast({
        title: t('Đã cập nhật hồ sơ', 'Perfil actualizado'),
        description: t('Tên hiển thị đã được cập nhật', 'Nombre actualizado'),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('Cập nhật thất bại', 'Error al actualizar');
      setError(message);
      toast({
        title: t('Không thể cập nhật', 'No se pudo actualizar'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditingProfile || passwordSaving) {
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(
        t(
          'Vui lòng nhập đủ mật khẩu hiện tại, mật khẩu mới và xác nhận',
          'Completa contraseña actual, nueva contraseña y confirmación'
        )
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        t('Mật khẩu mới tối thiểu 6 ký tự', 'La nueva contraseña debe tener al menos 6 caracteres')
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('Xác nhận mật khẩu không khớp', 'La confirmación no coincide'));
      return;
    }

    try {
      setPasswordSaving(true);
      setError('');

      await updateMyProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: t('Đã cập nhật hồ sơ', 'Perfil actualizado'),
        description: t('Mật khẩu đã được thay đổi', 'La contraseña ha sido actualizada'),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('Cập nhật thất bại', 'Error al actualizar');
      setError(message);
      toast({
        title: t('Không thể cập nhật', 'No se pudo actualizar'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_18%_12%,rgba(224,231,255,0.35),transparent_38%),radial-gradient(circle_at_84%_6%,rgba(226,232,240,0.45),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_55%,#f5f7fb_100%)]">
      <Navbar />

      <div className="px-2 md:px-4 pt-3 md:pt-4">
        <div className="container rounded-2xl border border-slate-300/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.94)_0%,rgba(51,65,85,0.9)_62%,rgba(71,85,105,0.86)_100%)] py-6 shadow-[0_16px_32px_rgba(15,23,42,0.2)] backdrop-blur-sm md:py-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-3 border-primary-foreground/30">
                {stats.avatar_url ? (
                  <img
                    src={resolveMediaUrl(stats.avatar_url)}
                    alt={stats.full_name || stats.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground/70" />
                )}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="font-display text-lg md:text-xl font-extrabold text-primary-foreground truncate">
                {stats.full_name || stats.username}
              </h1>
              <p className="text-primary-foreground/60 text-xs">@{stats.username}</p>
              <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                <Medal className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-primary-foreground/80 text-xs font-medium">
                  {rank ? `${t('Hạng', 'Puesto')} #${rank}` : t('Chưa xếp hạng', 'Sin ranking')}
                </span>
              </div>
              <div className="mt-2 flex justify-center sm:justify-start">
                <label htmlFor="profile-avatar-upload">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 gap-1.5 text-xs"
                    disabled={avatarUploading}
                    asChild
                  >
                    <span>
                      <Camera className="h-3.5 w-3.5" />
                      {avatarUploading
                        ? t('Đang tải ảnh...', 'Subiendo...')
                        : t('Đổi ảnh đại diện', 'Cambiar avatar')}
                    </span>
                  </Button>
                </label>
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                  disabled={avatarUploading}
                />
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
                  <s.icon className="h-4 w-4 text-amber-300 mx-auto mb-0.5" />
                  <div className="font-display text-lg font-black text-primary-foreground">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-primary-foreground/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 md:px-4 pb-4 pt-3 flex-1">
        <div className="container section-panel py-5 md:py-6">
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4 w-full grid grid-cols-3 rounded-xl border border-slate-300/70 bg-slate-100/90 p-1 shadow-sm sm:w-auto sm:inline-flex">
              <TabsTrigger value="info" className="gap-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('Thông tin', 'Info')}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('Lịch sử', 'Historial')}</span>
              </TabsTrigger>
              <TabsTrigger value="ranking" className="gap-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <Trophy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('Xếp hạng', 'Ranking')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-slate-300/70 bg-white shadow-sm">
                    <CardHeader className="pb-2 px-4 pt-4 flex items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-sm">
                        {t('Chỉnh sửa tài khoản', 'Editar cuenta')}
                      </h3>
                      <Button
                        type="button"
                        size="sm"
                        variant={isEditingProfile ? 'outline' : 'default'}
                        onClick={handleToggleEditProfile}
                        disabled={nameSaving || passwordSaving}
                      >
                        {isEditingProfile ? t('Hủy', 'Cancelar') : t('Sửa', 'Editar')}
                      </Button>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {!isEditingProfile && (
                          <p className="text-xs text-muted-foreground">
                            {t(
                              'Nhấn Sửa để cập nhật thông tin',
                              'Pulsa Editar para actualizar la información'
                            )}
                          </p>
                        )}

                        <form className="space-y-3" onSubmit={handleNameUpdate}>
                          <div className="space-y-1.5">
                            <Label htmlFor="display-name">
                              {t('Tên hiển thị', 'Nombre visible')}
                            </Label>
                            <Input
                              id="display-name"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder={t('Nhập tên của bạn', 'Ingresa tu nombre')}
                              maxLength={100}
                              disabled={!isEditingProfile || nameSaving || passwordSaving}
                              required
                            />
                          </div>

                          {isEditingProfile && (
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={nameSaving || passwordSaving}
                            >
                              {nameSaving
                                ? t('Đang cập nhật tên...', 'Actualizando nombre...')
                                : t('Lưu tên', 'Guardar nombre')}
                            </Button>
                          )}
                        </form>

                        <div className="rounded-xl border border-slate-300/70 bg-slate-50 px-3 py-2 text-sm shadow-sm">
                          <p>
                            <span className="text-muted-foreground">Username: </span>
                            <span className="font-medium">{stats.username}</span>
                          </p>
                          <p className="mt-1">
                            <span className="text-muted-foreground">Email: </span>
                            <span className="font-medium">{storedEmail}</span>
                          </p>
                        </div>

                        {isEditingProfile && (
                          <form className="space-y-3" onSubmit={handlePasswordUpdate}>
                            <div className="space-y-1.5">
                              <Label htmlFor="current-password">
                                {t('Mật khẩu hiện tại', 'Contraseña actual')}
                              </Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={nameSaving || passwordSaving}
                              />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="new-password">
                                  {t('Mật khẩu mới', 'Nueva contraseña')}
                                </Label>
                                <Input
                                  id="new-password"
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="••••••••"
                                  disabled={nameSaving || passwordSaving}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="confirm-password">
                                  {t('Xác nhận mật khẩu', 'Confirmar contraseña')}
                                </Label>
                                <Input
                                  id="confirm-password"
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                  disabled={nameSaving || passwordSaving}
                                />
                              </div>
                            </div>

                            <Button
                              type="submit"
                              className="w-full"
                              disabled={nameSaving || passwordSaving}
                            >
                              {passwordSaving
                                ? t('Đang cập nhật mật khẩu...', 'Actualizando contraseña...')
                                : t('Đổi mật khẩu', 'Cambiar contraseña')}
                            </Button>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-300/70 bg-white shadow-sm">
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
                          <div key={i} className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 shadow-sm flex items-center gap-2">
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
                <Card className="border-slate-300/70 bg-white shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/60 bg-slate-100/80">
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
                              className="border-b border-border/40 transition-colors hover:bg-slate-100/65"
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
                <Card className="border-slate-300/70 bg-white shadow-sm">
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
                            i !== leaderboard.length - 1 ? 'border-b border-border/40' : ''
                          } ${isMe ? 'bg-slate-100 border-l-[3px] border-l-slate-700' : ''}`}
                        >
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full font-display font-bold text-xs ${
                              i === 0
                                ? 'bg-accent text-accent-foreground'
                                : i === 1
                                  ? 'bg-muted text-foreground'
                                  : i === 2
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {i < 3 ? <Medal className="h-3.5 w-3.5" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">
                              {user.full_name}
                              {isMe && (
                                <span className="ml-1.5 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-white">
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
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
