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

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      saveAuth(result.token, result.user);
      toast({
        title: t('Đăng nhập thành công', 'Inicio de sesión correcto'),
        description: t('Chào mừng quay lại', 'Bienvenido de nuevo'),
      });
      navigate((result.user?.role || '').toLowerCase() === 'admin' ? '/admin' : '/quizzes');
    } catch (error) {
      toast({
        title: t('Đăng nhập thất bại', 'Error de inicio de sesión'),
        description:
          error instanceof Error ? error.message : t('Có lỗi xảy ra', 'Ha ocurrido un error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_20%,rgba(255,214,224,0.45),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(255,228,171,0.45),transparent_35%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_55%,#f7eef5_100%)]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-primary/20 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,247,250,0.88)_50%,rgba(255,249,235,0.8)_100%)] shadow-[0_18px_42px_rgba(95,20,40,0.14)]">
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
              <Button type="submit" className="w-full bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_65%,#ca8a04_100%)] font-semibold text-white hover:opacity-95" size="lg">
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
