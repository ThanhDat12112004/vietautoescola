import BrandLogo from '@/components/BrandLogo';
import { useLanguage } from '@/hooks/useLanguage';
import { getStoredAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type FooterProps = {
  className?: string;
};

const Footer = ({ className }: FooterProps) => {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAdmin((auth?.user?.role || '').toLowerCase() === 'admin');
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  const socialClass =
    'flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-[#fff5f6] transition-colors hover:border-[#E3C565]/55 hover:bg-white/15';

  return (
    <footer
      className={cn(
        'mt-auto w-full border-t border-black/20 bg-gradient-to-b from-[#8B1E2D] to-[#6B0F1A] text-[#fff5f6] shadow-[0_-4px_24px_rgba(58,10,20,0.12)]',
        className
      )}
    >
      <div className="w-full max-w-none px-3 py-8 sm:px-4 sm:py-10 md:px-5 lg:px-6">
        {/* Lưới 10 phần (lg+): logo 4 | mỗi nhóm link 2 (chia đều 6 phần còn lại) */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start lg:grid-cols-10 lg:gap-x-6 lg:gap-y-0 xl:gap-x-8">
          <div className="flex w-full min-w-0 flex-col gap-3 border-b border-white/10 pb-8 md:border-b-0 md:pb-0 lg:col-span-4 lg:pr-2">
            <Link
              to="/"
              className="group flex w-fit max-w-full flex-col gap-3 no-underline sm:flex-row sm:items-center sm:gap-3"
              aria-label={t('Về trang chủ Viet Autoescuela', 'Ir al inicio Viet Autoescuela')}
            >
              <BrandLogo className="shrink-0" imageClassName="h-24 w-auto sm:h-28" />
              <div className="min-w-0 text-left">
                <div className="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                  Việt <span className="text-[#E3C565]">Autoescuela</span>
                </div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65 sm:text-[11px]">
                  {t('Ôn thi DGT · Chuẩn Tây Ban Nha', 'DGT · España')}
                </p>
              </div>
            </Link>
            <p className="w-full min-w-0 text-xs leading-relaxed text-white/75 sm:text-sm">
              {t(
                'Hệ thống học và luyện thi bằng lái xe Tây Ban Nha.',
                'Preparación para el permiso de conducir en España.'
              )}
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="Facebook"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://zalo.me/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="Zalo"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="YouTube"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">
              {t('Học tập', 'Aprendizaje')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to="/quizzes"
                  className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                >
                  {t('Làm bài thi', 'Examenes')}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  to="/materials"
                  className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                >
                  {t('Tài liệu', 'Materiales')}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                >
                  {t('Bảng xếp hạng', 'Ranking')}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">
              {t('Tài khoản', 'Cuenta')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                >
                  {t('Đăng nhập', 'Iniciar sesion')}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                >
                  {t('Đăng ký', 'Registrarse')}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                >
                  {t('Hồ sơ', 'Perfil')}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {t('Quản trị', 'Administracion')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">
              {t('Liên hệ', 'Contacto')}
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-[#E3C565]">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <a
                  className="hover:text-[#E3C565] hover:underline"
                  href="mailto:support@vietautoescola.com"
                >
                  support@vietautoescola.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-[#E3C565]">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <a className="hover:text-[#E3C565] hover:underline" href="tel:+34900000000">
                  +34 900 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-[#E3C565]">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <a
                  className="hover:text-[#E3C565] hover:underline"
                  href="https://maps.google.com/?q=Madrid,España"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Madrid, España
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/65 sm:text-sm">
            © 2026 <span className="font-medium text-[#E3C565]">Viet Autoescuela</span>.{' '}
            {t('Bảo lưu mọi quyền.', 'Todos los derechos reservados.')}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm">
            <a
              href="mailto:support@vietautoescola.com?subject=Chinh%20sach%20bao%20mat"
              className="text-white/65 transition-colors hover:text-[#E3C565]"
            >
              {t('Chính sách bảo mật', 'Privacidad')}
            </a>
            <a
              href="mailto:support@vietautoescola.com?subject=Dieu%20khoan%20su%20dung"
              className="text-white/65 transition-colors hover:text-[#E3C565]"
            >
              {t('Điều khoản sử dụng', 'Terminos')}
            </a>
            <a
              href="mailto:support@vietautoescola.com"
              className="text-white/65 transition-colors hover:text-[#E3C565]"
            >
              {t('Hỗ trợ', 'Soporte')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
