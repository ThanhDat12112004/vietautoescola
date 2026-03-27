import BrandLogo from '@/components/BrandLogo';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { login } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { Lock, Mail } from 'lucide-react';
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
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_18%_12%,rgba(224,231,255,0.35),transparent_38%),radial-gradient(circle_at_84%_6%,rgba(226,232,240,0.45),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_55%,#f5f7fb_100%)]">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-slate-300/70 bg-white/95 shadow-[0_18px_38px_rgba(15,23,42,0.12)] backdrop-blur-[2px]">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <BrandLogo imageClassName="h-16" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-slate-800">{t('Đăng nhập', 'Iniciar sesión')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Đăng nhập để tiếp tục luyện thi', 'Inicia sesión para seguir practicando')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('Mật khẩu', 'Contraseña')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full border border-slate-800 bg-slate-900 font-semibold text-white shadow-sm hover:bg-slate-800" size="lg">
                {isSubmitting
                  ? t('Đang xử lý...', 'Procesando...')
                  : t('Đăng nhập', 'Iniciar sesión')}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('Chưa có tài khoản?', '¿No tienes cuenta?')}{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                {t('Đăng ký ngay', 'Regístrate')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
