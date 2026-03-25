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

const toBilingual = (vi: string, es: string) => `${vi} / ${es}`;

const getRegisterErrorMessage = (error: unknown) => {
  if (!(error instanceof Error) || !error.message) {
    return toBilingual('Có lỗi xảy ra, vui lòng thử lại.', 'Ha ocurrido un error, inténtalo de nuevo.');
  }

  const raw = error.message;
  const message = raw.toLowerCase();

  if (message.includes('email') && (message.includes('exist') || message.includes('duplicate'))) {
    return toBilingual('Email đã được sử dụng.', 'El correo ya está en uso.');
  }

  if (
    (message.includes('username') || message.includes('user name')) &&
    (message.includes('exist') || message.includes('duplicate'))
  ) {
    return toBilingual('Tên đăng nhập đã tồn tại.', 'El nombre de usuario ya existe.');
  }

  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return toBilingual('Mật khẩu còn yếu hoặc quá ngắn.', 'La contraseña es débil o demasiado corta.');
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return toBilingual('Không kết nối được máy chủ.', 'No se pudo conectar con el servidor.');
  }

  return toBilingual(`Lỗi: ${raw}`, `Error: ${raw}`);
};

const Register = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!fullName || !username || !email || !password) {
      toast({
        title: toBilingual('Thiếu thông tin đăng ký', 'Faltan datos de registro'),
        description: toBilingual(
          'Vui lòng nhập đầy đủ họ tên, tên đăng nhập, email và mật khẩu.',
          'Introduce nombre, usuario, correo y contraseña completos.'
        ),
        variant: 'destructive',
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
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

    if (password.length < 6) {
      toast({
        title: toBilingual('Mật khẩu quá ngắn', 'Contraseña demasiado corta'),
        description: toBilingual('Mật khẩu cần ít nhất 6 ký tự.', 'La contraseña debe tener al menos 6 caracteres.'),
        variant: 'destructive',
      });
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
        title: toBilingual('Đăng ký thành công', 'Registro exitoso'),
        description: toBilingual(
          'Tài khoản đã được tạo. Vui lòng đăng nhập để bắt đầu luyện thi.',
          'La cuenta se creó correctamente. Inicia sesión para empezar a practicar.'
        ),
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: toBilingual('Đăng ký thất bại', 'Error de registro'),
        description: getRegisterErrorMessage(error),
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
            <h1 className="font-display text-2xl font-800 text-[#64172f]">
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
              <Button type="submit" className="w-full bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_65%,#ca8a04_100%)] font-semibold text-white shadow-[0_10px_22px_rgba(95,20,40,0.2)] hover:opacity-95" size="lg">
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
