import AuthSplitLayout from '@/components/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { login } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getLoginErrorMessage = (
  error: unknown,
  t: (vi: string, es: string) => string
) => {
  if (!(error instanceof Error) || !error.message) {
    return t('Có lỗi xảy ra, vui lòng thử lại.', 'Ha ocurrido un error, inténtalo de nuevo.');
  }

  const raw = error.message;
  const message = raw.toLowerCase();

  if (
    message.includes('invalid') ||
    message.includes('unauthorized') ||
    message.includes('incorrect') ||
    message.includes('password')
  ) {
    return t(
      'Email hoặc mật khẩu không đúng.',
      'El correo o la contraseña no son correctos.'
    );
  }

  if (message.includes('already logged in on another device')) {
    return t(
      'Tài khoản đang đăng nhập trên thiết bị khác. Hãy đăng xuất ở thiết bị đó trước.',
      'La cuenta está activa en otro dispositivo. Cierra sesión allí primero.'
    );
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return t('Không kết nối được máy chủ.', 'No se pudo conectar con el servidor.');
  }

  return t(`Lỗi: ${raw}`, `Error: ${raw}`);
};

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = email.trim();
    const passwordValue = password.trim();
    setFormError('');

    if (!emailValue || !passwordValue) {
      setFormError(
        t(
          'Vui lòng nhập đầy đủ email và mật khẩu.',
          'Introduce el correo y la contraseña completos.'
        )
      );
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      setFormError(t('Email chưa đúng định dạng.', 'Formato de correo no valido.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email: emailValue, password: passwordValue });
      saveAuth(result.token, result.user);
      toast({
        title: t('Đăng nhập thành công', 'Inicio de sesion exitoso'),
        description: t(
          'Chào mừng quay lại, đang chuyển đến trang bài thi.',
          'Bienvenido de nuevo, redirigiendo a la página de exámenes.'
        ),
      });
      navigate((result.user?.role || '').toLowerCase() === 'admin' ? '/admin' : '/quizzes');
    } catch (error) {
      setFormError(getLoginErrorMessage(error, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            {t('Đăng nhập', 'Iniciar sesión')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Đăng nhập để tiếp tục luyện thi', 'Inicia sesión para seguir practicando')}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="name@example.com"
                className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              {t('Mật khẩu', 'Contraseña')}
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="border-primary/20 pl-10 pr-11 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-primary/55 transition hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('Ẩn mật khẩu', 'Ocultar contraseña') : t('Hiện mật khẩu', 'Mostrar contraseña')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="brand-cta-primary h-12 w-full rounded-xl font-semibold shadow-md transition hover:opacity-[0.96]"
          >
            {isSubmitting
              ? t('Đang xử lý...', 'Procesando...')
              : t('Đăng nhập', 'Iniciar sesión')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('Chưa có tài khoản?', '¿No tienes cuenta?')}{' '}
          <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t('Đăng ký ngay', 'Regístrate')}
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default Login;
