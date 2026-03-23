import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { register } from '@/lib/api';
import { Car, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        full_name: form.fullName || undefined,
      });

      toast({
        title: t('Đăng ký thành công', 'Registro exitoso'),
        description: t('Hãy đăng nhập để bắt đầu', 'Inicia sesión para comenzar'),
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: t('Đăng ký thất bại', 'Error de registro'),
        description:
          error instanceof Error ? error.message : t('Có lỗi xảy ra', 'Ha ocurrido un error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-hero-pattern py-12 px-4">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                <Car className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-800">
              {t('Đăng ký tài khoản', 'Crear cuenta')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                'Tạo tài khoản miễn phí để bắt đầu luyện thi',
                'Crea tu cuenta gratis para empezar'
              )}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('Họ và tên', 'Nombre completo')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder={t('Nguyễn Văn A', 'María García')}
                    className="pl-10"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">{t('Tên đăng nhập', 'Nombre de usuario')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="username123"
                    className="pl-10"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    placeholder="••••••••"
                    className="pl-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full font-semibold" size="lg">
                {isSubmitting ? t('Đang xử lý...', 'Procesando...') : t('Đăng ký', 'Registrarse')}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('Đã có tài khoản?', '¿Ya tienes cuenta?')}{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t('Đăng nhập', 'Iniciar sesión')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
