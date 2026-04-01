import AuthSplitLayout from '@/components/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { register } from '@/lib/api/auth';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthSplitLayout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            {t('Đăng ký tài khoản', 'Crear cuenta')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              'Tạo tài khoản miễn phí để bắt đầu luyện thi',
              'Crea tu cuenta gratis para empezar'
            )}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">
              {t('Họ và tên', 'Nombre completo')}
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="fullName"
                placeholder={t('Nguyễn Văn A', 'María García')}
                className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              {t('Tên đăng nhập', 'Nombre de usuario')}
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="username"
                placeholder="username123"
                className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                placeholder="••••••••"
                className="border-primary/20 pl-10 pr-11 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            className="brand-cta-primary mt-2 h-12 w-full rounded-xl font-semibold shadow-md transition hover:opacity-[0.96]"
          >
            {isSubmitting ? t('Đang xử lý...', 'Procesando...') : t('Đăng ký', 'Registrarse')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('Đã có tài khoản?', '¿Ya tienes cuenta?')}{' '}
          <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t('Đăng nhập', 'Iniciar sesión')}
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default Register;
