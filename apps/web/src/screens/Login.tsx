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

const toBilingual = (vi: string, es: string) => `${vi} / ${es}`;

const getLoginErrorMessage = (error: unknown) => {
  if (!(error instanceof Error) || !error.message) {
    return toBilingual('Có lỗi xảy ra, vui lòng thử lại.', 'Ha ocurrido un error, inténtalo de nuevo.');
  }

  const raw = error.message;
  const message = raw.toLowerCase();

  if (
    message.includes('invalid') ||
    message.includes('unauthorized') ||
    message.includes('incorrect') ||
    message.includes('password')
  ) {
    return toBilingual(
      'Email hoặc mật khẩu không đúng.',
      'El correo o la contraseña no son correctos.'
    );
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return toBilingual('Không kết nối được máy chủ.', 'No se pudo conectar con el servidor.');
  }

  return toBilingual(`Lỗi: ${raw}`, `Error: ${raw}`);
};

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = email.trim();
    const passwordValue = password.trim();

    if (!emailValue || !passwordValue) {
      toast({
        title: toBilingual('Thiếu thông tin đăng nhập', 'Faltan datos de acceso'),
        description: toBilingual(
          'Vui lòng nhập đầy đủ email và mật khẩu.',
          'Introduce el correo y la contraseña completos.'
        ),
        variant: 'destructive',
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      toast({
        title: toBilingual('Email chưa đúng định dạng', 'Formato de correo no válido'),
        description: toBilingual(
          'Ví dụ đúng: name@example.com',
          'Ejemplo correcto: name@example.com'
        ),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email: emailValue, password: passwordValue });
      saveAuth(result.token, result.user);
      toast({
        title: toBilingual('Đăng nhập thành công', 'Inicio de sesión exitoso'),
        description: toBilingual(
          'Chào mừng quay lại, đang chuyển đến trang bài thi.',
          'Bienvenido de nuevo, redirigiendo a la página de exámenes.'
        ),
      });
      navigate((result.user?.role || '').toLowerCase() === 'admin' ? '/admin' : '/quizzes');
    } catch (error) {
      toast({
        title: toBilingual('Đăng nhập thất bại', 'Error de inicio de sesión'),
        description: getLoginErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_18%,rgba(255,206,220,0.52),transparent_40%),radial-gradient(circle_at_86%_8%,rgba(255,224,160,0.48),transparent_32%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_58%,#f8eff6_100%)]">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-primary/20 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,247,250,0.88)_50%,rgba(255,249,235,0.8)_100%)] shadow-[0_20px_46px_rgba(95,20,40,0.16)] backdrop-blur-[2px]">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <BrandLogo imageClassName="h-16" />
            </div>
            <h1 className="font-display text-2xl font-800 text-[#64172f]">{t('Đăng nhập', 'Iniciar sesión')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Đăng nhập để tiếp tục luyện thi', 'Inicia sesión para seguir practicando')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_65%,#ca8a04_100%)] font-semibold text-white shadow-[0_10px_22px_rgba(95,20,40,0.2)] hover:opacity-95" size="lg">
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
