import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
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
import { Camera, Pencil, User as UserIcon } from '@/components/BrandIcons';
import { getStoredAuth, updateStoredAuthUser } from '@/lib/auth';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const [dashboardData, leaderboardData] = await Promise.all([
          getMyDashboard(lang),
          getLeaderboard(10),
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

  const rankMotivation = useMemo(() => {
    if (!rank) {
      return lang === 'vi'
        ? 'Làm bài thi để tích điểm và xuất hiện trên bảng xếp hạng — mỗi bài đều đếm!'
        : 'Haz exámenes para sumar puntos y entrar en el ranking: ¡cada intento cuenta!';
    }
    if (rank === 1) {
      return lang === 'vi'
        ? 'Bạn đang dẫn đầu bảng — duy trì nhịp luyện để giữ ngôi vương!'
        : 'Lideras la clasificación: ¡mantén el ritmo para seguir arriba!';
    }
    if (rank <= 3) {
      return lang === 'vi'
        ? `Bạn đang top #${rank} — thêm vài bài nữa để tranh hạng cao hơn!`
        : `¡Estás en el top #${rank}! Unos exámenes más y subes posiciones.`;
    }
    if (rank <= 10) {
      return lang === 'vi'
        ? `Bạn đã lọt top 10 (#${rank}) — cố một nhịp nữa để tiến xa hơn!`
        : `¡Entre los 10 primeros (#${rank})! Sigue practicando para subir.`;
    }
    return lang === 'vi'
      ? `Hạng #${rank} — mỗi lần làm bài đều giúp bạn tiến lên.`
      : `Puesto #${rank}: cada examen te acerca a los primeros puestos.`;
  }, [rank, lang]);

  if (loading) {
    return (
      <div className="app-page page-auth-bg flex min-h-screen flex-col">
        <Navbar />
        <div className="flex w-full flex-1 flex-col py-0">
          <div className="w-full flex-1 px-0">
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
              <div className="h-32 animate-pulse bg-primary/10" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-14 animate-pulse bg-muted/80" />
                <div className="h-14 animate-pulse bg-muted/80" />
                <div className="h-14 animate-pulse bg-muted/80" />
              </div>
              <div className="h-40 animate-pulse bg-muted/60" />
            </div>
          </div>
        </div>
        <Footer className="mt-0" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="app-page page-auth-bg flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="section-panel max-w-md text-center">
            <p className="text-sm font-medium text-destructive">
              {error || t('Không có dữ liệu', 'Sin datos')}
            </p>
          </div>
        </div>
        <Footer className="mt-0" />
      </div>
    );
  }

  const stats = dashboard.stats;
  const attempts = dashboard.history || [];
  const storedEmail = getStoredAuth()?.user?.email || '-';
  const totalQuizzes = Number(stats.total_quizzes || 0);
  const totalQuestions = Number(stats.total_questions || 0);
  const hasLearningActivity = totalQuizzes > 0 || Number(stats.total_score || 0) > 0;
  const noAccuracyDataYet = totalQuizzes === 0 && totalQuestions === 0;

  const startEditName = () => {
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setDisplayName(stats.full_name || '');
    setError('');
    setIsEditingName(false);
  };

  const startEditPassword = () => {
    setIsEditingName(false);
    setDisplayName(stats.full_name || '');
    setError('');
    setIsEditingPassword(true);
  };

  const cancelEditPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsEditingPassword(false);
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

    if (!isEditingName || nameSaving) {
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
      setIsEditingName(false);

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

    if (!isEditingPassword || passwordSaving) {
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
      setIsEditingPassword(false);

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
    <div className="app-page page-auth-bg flex min-h-screen flex-col">
      <Navbar />

      <div className="relative w-full overflow-hidden border-b-2 border-primary/15 bg-[linear-gradient(165deg,rgba(255,250,251,0.98)_0%,rgba(255,255,255,0.94)_42%,rgba(245,228,234,0.42)_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 18%, hsl(var(--primary)) 0%, transparent 42%), radial-gradient(circle at 88% 8%, #E3C565 0%, transparent 38%)',
          }}
        />
        <div className="relative px-4 pb-8 pt-6 sm:px-6 md:px-10 md:pb-10 md:pt-8 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div
                className={`mx-auto h-[7.25rem] w-[7.25rem] shrink-0 rounded-full bg-gradient-to-br from-[#E3C565]/85 to-[#E3C565]/35 p-[3px] shadow-sm sm:mx-0 md:h-[8rem] md:w-[8rem] ${
                  rank != null && rank <= 3
                    ? 'ring-2 ring-[#E3C565]/80 shadow-[0_0_32px_rgba(227,197,101,0.38)]'
                    : ''
                }`}
              >
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-muted/50">
                  {stats.avatar_url ? (
                    <img
                      src={resolveMediaUrl(stats.avatar_url)}
                      alt={stats.full_name || stats.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-primary/40 md:h-14 md:w-14" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/55">
                  {t('Hồ sơ học viên', 'Perfil del alumno')}
                </p>

                {isEditingName ? (
                  <form
                    className="mt-2 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
                    onSubmit={handleNameUpdate}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5 text-left">
                      <Label htmlFor="hero-display-name" className="sr-only">
                        {t('Tên hiển thị', 'Nombre')}
                      </Label>
                      <Input
                        id="hero-display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('Nhập tên của bạn', 'Ingresa tu nombre')}
                        maxLength={100}
                        disabled={nameSaving || passwordSaving}
                        required
                        className="max-w-md"
                      />
                    </div>
                    <div className="flex shrink-0 justify-center gap-2 sm:justify-start">
                      <Button
                        type="submit"
                        size="sm"
                        className="brand-cta-primary"
                        disabled={nameSaving || passwordSaving}
                      >
                        {nameSaving ? t('Đang lưu...', 'Guardando...') : t('Lưu', 'Guardar')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={cancelEditName}
                        disabled={nameSaving}
                      >
                        {t('Hủy', 'Cancelar')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                    <h1 className="font-display min-w-0 max-w-[min(100%,28rem)] truncate text-2xl font-extrabold tracking-tight text-primary md:text-3xl">
                      {displayName || stats.full_name || stats.username}
                    </h1>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-primary hover:bg-primary/[0.08]"
                      onClick={startEditName}
                      disabled={nameSaving || passwordSaving || avatarUploading}
                      aria-label={t('Sửa tên', 'Editar nombre')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <p className="mt-0.5 text-sm text-muted-foreground">@{stats.username}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold tabular-nums text-primary">
                    {rank
                      ? `${t('Hạng', 'Puesto')} #${rank}`
                      : t('Chưa xếp hạng', 'Sin ranking')}
                  </span>
                  <label htmlFor="profile-avatar-upload">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 border-primary/20 text-xs text-primary hover:bg-primary/[0.04]"
                      disabled={avatarUploading}
                      asChild
                    >
                      <span>
                        <Camera className="h-3.5 w-3.5 shrink-0 opacity-80" />
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
            </div>

            <div className="grid w-full grid-cols-3 gap-4 border-t border-dashed border-primary/20 pt-6 sm:gap-6 lg:ml-auto lg:max-w-md lg:border-l-2 lg:border-t-0 lg:border-solid lg:border-primary/15 lg:pl-8 lg:pt-0">
              {[
                {
                  value: Number(stats.total_score || 0).toFixed(1),
                  label: t('Điểm', 'Puntos'),
                },
                {
                  value: String(stats.total_quizzes || 0),
                  label: t('Bài thi', 'Tests'),
                },
                {
                  value: `${Number(stats.average_percentage || 0).toFixed(1)}%`,
                  label: t('Đúng', 'Aciertos'),
                },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-lg font-black tabular-nums text-primary sm:text-xl">{s.value}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary/25 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 gap-3">
                <p className="text-sm leading-snug text-foreground/90">{rankMotivation}</p>
              </div>
              {!hasLearningActivity && (
                <Button
                  asChild
                  className="w-full shrink-0 brand-cta-primary sm:w-auto"
                >
                  <Link to="/quizzes">{t('Làm bài ngay', 'Hacer un examen')}</Link>
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary/22 bg-white/75 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-primary/80">
                  {t('Gợi ý hôm nay', 'Objetivo de hoy')}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {hasLearningActivity
                    ? t(
                        'Thử làm thêm 1–2 bài để duy trì tiến độ và cải thiện tỷ lệ đúng.',
                        'Haz 1–2 exámenes más para mantener el ritmo y mejorar tu porcentaje.'
                      )
                    : t(
                        'Bắt đầu với 1–2 bài thi bất kỳ — thống kê và hạng sẽ cập nhật ngay sau khi nộp bài.',
                        'Empieza con 1–2 tests: tus estadísticas y ranking se actualizan al enviar.'
                      )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col pb-0 pt-0">
        <div className="w-full max-w-none">
          {error && (
            <div className="mb-4 px-4 sm:px-6 lg:px-8">
              <div className="border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            </div>
          )}

          <div className="w-full px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-5 lg:px-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:inline-flex sm:w-auto">
                <TabsTrigger
                  value="info"
                  className="rounded-xl border border-transparent bg-transparent py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors transition-shadow data-[state=active]:border-primary/25 data-[state=active]:bg-white/95 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-card/95 sm:px-5 sm:text-xs"
                >
                  {t('Thông tin', 'Info')}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl border border-transparent bg-transparent py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors transition-shadow data-[state=active]:border-primary/25 data-[state=active]:bg-white/95 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-card/95 sm:px-5 sm:text-xs"
                >
                  {t('Lịch sử', 'Historial')}
                </TabsTrigger>
                <TabsTrigger
                  value="ranking"
                  className="rounded-xl border border-transparent bg-transparent py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors transition-shadow data-[state=active]:border-primary/25 data-[state=active]:bg-white/95 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-card/95 sm:px-5 sm:text-xs"
                >
                  {t('Xếp hạng', 'Ranking')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-0 outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid gap-10 rounded-2xl border-2 border-primary/18 bg-white/70 p-4 sm:p-5 lg:grid-cols-2 lg:gap-12 lg:p-6">
                    <div className="space-y-8">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Username</span>{' '}
                          <span className="font-medium text-foreground">{stats.username}</span>
                        </p>
                        <p className="break-all">
                          <span className="text-muted-foreground">Email</span>{' '}
                          <span className="font-medium text-foreground">{storedEmail}</span>
                        </p>
                      </div>

                      <section className="border-t-2 border-primary/12 pt-8">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <h3 className="font-display text-sm font-bold text-primary md:text-base">
                            {t('Mật khẩu đăng nhập', 'Contraseña')}
                          </h3>
                          {!isEditingPassword ? (
                            <Button
                              type="button"
                              size="sm"
                              className="brand-cta-primary h-9 shrink-0 px-4 font-semibold text-white"
                              onClick={startEditPassword}
                              disabled={nameSaving || passwordSaving}
                            >
                              {t('Đổi mật khẩu', 'Cambiar contraseña')}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={cancelEditPassword}
                              disabled={passwordSaving}
                            >
                              {t('Hủy', 'Cancelar')}
                            </Button>
                          )}
                        </div>
                        {!isEditingPassword ? (
                          <p className="text-sm text-muted-foreground">
                            {t(
                              'Mật khẩu được lưu mã hóa. Chỉ bạn biết mật khẩu hiện tại.',
                              'Tu contraseña está cifrada. Solo tú conoces la actual.'
                            )}
                          </p>
                        ) : (
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
                                disabled={passwordSaving}
                                autoComplete="current-password"
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
                                  disabled={passwordSaving}
                                  autoComplete="new-password"
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
                                  disabled={passwordSaving}
                                  autoComplete="new-password"
                                />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="brand-cta-primary max-w-md rounded-xl font-semibold"
                              disabled={nameSaving || passwordSaving}
                            >
                              {passwordSaving
                                ? t('Đang lưu...', 'Guardando...')
                                : t('Lưu mật khẩu mới', 'Guardar contraseña')}
                            </Button>
                          </form>
                        )}
                      </section>
                    </div>

                    <section className="border-t border-dashed border-primary/18 pt-8 lg:border-l-2 lg:border-t-0 lg:border-solid lg:border-primary/12 lg:pl-8 lg:pt-0">
                      <h3 className="mb-4 font-display text-sm font-bold text-primary md:text-base">
                        {t('Thống kê học tập', 'Estadísticas')}
                      </h3>
                      {!hasLearningActivity && (
                        <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground/90">
                            {t(
                              'Bạn chưa có lượt làm bài nào',
                              'Aún no has completado exámenes'
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed">
                            {t(
                              'Làm bài ngay để xem điểm, tỷ lệ đúng và tiến độ trên hồ sơ.',
                              'Haz un examen para ver puntos, porcentaje y progreso en tu perfil.'
                            )}
                          </p>
                          <Button asChild className="mt-3 brand-cta-primary" size="sm">
                            <Link to="/quizzes">
                              {t('Làm bài ngay', 'Hacer un examen')}
                            </Link>
                          </Button>
                        </div>
                      )}
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        {[
                          {
                            label: t('Tổng điểm', 'Puntuación'),
                            value: Number(stats.total_score || 0).toFixed(1),
                          },
                          {
                            label: t('Bài thi', 'Exámenes'),
                            value: stats.total_quizzes,
                          },
                          {
                            label: t('Câu đúng', 'Aciertos'),
                            value: `${stats.total_correct}/${stats.total_questions}`,
                          },
                          {
                            label: t('Xếp hạng', 'Ranking'),
                            value: rank ? `#${rank}` : '—',
                          },
                        ].map((item, i) => (
                          <div key={i} className="min-w-0">
                            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {item.label}
                            </div>
                            <div className="font-display text-lg font-bold tabular-nums text-primary">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-primary/15 pt-4">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">
                            {t('Tỷ lệ đúng', '% Aciertos')}
                          </span>
                          <span className="font-display font-bold text-primary">
                            {Number(stats.average_percentage || 0).toFixed(1)}%
                          </span>
                        </div>
                        {noAccuracyDataYet ? (
                          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
                            {t(
                              'Chưa có dữ liệu — thanh tiến độ sẽ hiển thị sau khi bạn làm ít nhất một bài.',
                              'Sin datos: la barra mostrará tu progreso tras el primer examen.'
                            )}
                          </p>
                        ) : null}
                        <Progress
                          value={Number(stats.average_percentage || 0)}
                          className="h-2.5 bg-primary/10"
                        />
                      </div>
                    </section>
                  </div>
                </motion.div>
              </TabsContent>

            <TabsContent value="history" className="mt-0 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="overflow-x-auto border-t border-primary/15 pt-6">
                  <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/15 bg-gradient-to-r from-primary/12 via-primary/8 to-primary/5">
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-primary">
                              {t('Bài thi', 'Examen')}
                            </th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-primary">
                              {t('Điểm', 'Nota')}
                            </th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-primary">
                              {t('Đúng', 'Aciertos')}
                            </th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-primary">
                              {t('Ngày', 'Fecha')}
                            </th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-primary">
                              {t('Kết quả', 'Resultado')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {attempts.map((attempt) => (
                            <tr
                              key={attempt.id}
                              className="border-b border-primary/[0.07] transition-colors hover:bg-primary/[0.04]"
                            >
                              <td className="px-4 py-2.5">
                                <span className="block max-w-[220px] truncate text-xs font-medium">
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
                              <td colSpan={5} className="px-4 py-10">
                                <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                  <p className="text-sm font-semibold text-foreground">
                                    {t(
                                      'Chưa có lịch sử làm bài',
                                      'Sin historial de exámenes'
                                    )}
                                  </p>
                                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    {t(
                                      'Mỗi lần làm bài sẽ hiện ở đây kèm điểm và ngày — bắt đầu ngay nhé!',
                                      'Cada intento aparecerá aquí con nota y fecha: ¡empieza cuando quieras!'
                                    )}
                                  </p>
                                  <Button asChild className="mt-5 brand-cta-primary" size="sm">
                                    <Link to="/quizzes">
                                      {t('Làm bài ngay', 'Hacer un examen')}
                                    </Link>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="ranking" className="mt-0 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="border-t border-primary/15 pt-6">
                  <h3 className="font-display text-sm font-bold text-primary md:text-base">
                    {t('Vị trí của bạn', 'Tu posición')}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rank
                      ? `${t('Xếp hạng', 'Posición')} #${rank}`
                      : t('Chưa có thứ hạng', 'Sin posición')}
                  </p>
                  <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
                    {t(
                      'Danh sách bên dưới là top 10 theo tổng điểm — làm thêm bài để so kèo với học viên khác.',
                      'La lista muestra el top 10 por puntos totales: practica para compararte con otros.'
                    )}
                  </p>
                  {!hasLearningActivity && leaderboard.length > 0 && (
                    <Button asChild variant="outline" size="sm" className="mt-3 border-primary/25">
                      <Link to="/quizzes">{t('Làm bài để vào bảng', 'Haz un examen para entrar')}</Link>
                    </Button>
                  )}
                  <div className="mt-4 divide-y divide-primary/10">
                    {leaderboard.map((user, i) => {
                      const isMe = user.id === stats.id;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 py-3.5 transition-colors first:pt-0 ${
                            isMe ? 'border-l-[3px] border-l-primary bg-primary/[0.04] pl-3' : ''
                          } ${i < 3 ? 'bg-primary/[0.02]' : ''}`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold tabular-nums ${
                              i === 0
                                ? 'border-2 border-[#E3C565]/80 bg-[#fff9e6] text-[#6b4a00]'
                                : i === 1
                                  ? 'border-2 border-primary/25 bg-primary/[0.08] text-primary'
                                  : i === 2
                                    ? 'border-2 border-amber-700/25 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100'
                                    : 'border border-primary/15 bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">
                              {user.full_name}
                              {isMe && (
                                <span className="ml-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
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
                      <div className="py-5 text-xs text-muted-foreground">
                        {t('Chưa có bảng xếp hạng', 'Sin ranking')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer className="mt-0" />
    </div>
  );
};

export default Profile;
