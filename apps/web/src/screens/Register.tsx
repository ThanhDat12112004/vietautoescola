import BrandLogo from '@/components/BrandLogo';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { register } from '@/lib/api';
import { Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getRegisterErrorMessage = (
  error: unknown,
  t: (vi: string, es: string) => string
) => {
  if (!(error instanceof Error) || !error.message) {
    return t('Có lỗi xảy ra, vui lòng thử lại.', 'Ha ocurrido un error, inténtalo de nuevo.');
  }

  const raw = error.message;
  const message = raw.toLowerCase();

  if (message.includes('email') && (message.includes('exist') || message.includes('duplicate'))) {
    return t('Email đã được sử dụng.', 'El correo ya está en uso.');
  }

  if (
    (message.includes('username') || message.includes('user name')) &&
    (message.includes('exist') || message.includes('duplicate'))
  ) {
    return t('Tên đăng nhập đã tồn tại.', 'El nombre de usuario ya existe.');
  }

  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return t('Mật khẩu còn yếu hoặc quá ngắn.', 'La contraseña es debil o demasiado corta.');
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return t('Không kết nối được máy chủ.', 'No se pudo conectar con el servidor.');
  }

  return t(`Lỗi: ${raw}`, `Error: ${raw}`);
};

const Register = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    setFormError('');

    if (!fullName || !username || !email || !password) {
      setFormError(
        t(
          'Vui lòng nhập đầy đủ họ tên, tên đăng nhập, email và mật khẩu.',
          'Introduce nombre, usuario, correo y contrasena completos.'
        )
      );
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError(t('Email chưa đúng định dạng.', 'Formato de correo no valido.'));
      return;
    }

    if (password.length < 6) {
      setFormError(
        t('Mật khẩu cần ít nhất 6 ký tự.', 'La contrasena debe tener al menos 6 caracteres.')
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
        full_name: fullName || undefined,
      });

      toast({
        title: t('Đăng ký thành công', 'Registro exitoso'),
        description: t(
          'Tài khoản đã được tạo. Vui lòng đăng nhập để bắt đầu luyện thi.',
          'La cuenta se creó correctamente. Inicia sesión para empezar a practicar.'
        ),
      });
      navigate('/login');
    } catch (error) {
      setFormError(getRegisterErrorMessage(error, t));
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
            <h1 className="font-display text-2xl font-800 text-slate-800">
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
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}
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
              <Button type="submit" className="w-full border border-slate-800 bg-slate-900 font-semibold text-white shadow-sm hover:bg-slate-800" size="lg">
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
