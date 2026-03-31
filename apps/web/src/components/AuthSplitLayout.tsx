import BrandLogo from '@/components/BrandLogo';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { BookOpen, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const ILLUSTRATION_SRC = '/brand/quiz-illustration.png';

type AuthSplitLayoutProps = {
  children: React.ReactNode;
};

export default function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  const { t } = useLanguage();

  const highlights = [
    {
      icon: BookOpen,
      label: t('Ngân hàng câu hỏi', 'Banco de preguntas'),
    },
    {
      icon: Target,
      label: t('Thi thử giống thật', 'Exámenes de práctica'),
    },
    {
      icon: Trophy,
      label: t('Theo dõi tiến độ', 'Seguimiento'),
    },
  ];

  return (
    <div className="app-page flex min-h-screen flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Cột trái: chỉ desktop (lg+). Mobile & tablet chỉ thấy form full width */}
        <aside className="auth-split-brand relative hidden min-h-0 overflow-hidden px-5 pb-8 pt-7 sm:px-7 lg:flex lg:w-1/2 lg:flex-1 lg:flex-col lg:px-9 lg:pb-12 lg:pt-11 xl:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(155,28,49,0.14),transparent_50%)]" />
          <div className="auth-split-brand-pattern pointer-events-none absolute inset-0 opacity-[0.65]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgba(155,28,49,0.06)] to-transparent" />

          <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
            <Link
              to="/"
              className="mb-3 inline-flex w-fit text-sm font-medium text-primary/90 underline-offset-4 transition hover:text-primary hover:underline"
            >
              ← {t('Về trang chủ', 'Inicio')}
            </Link>

            <div className="rounded-2xl border border-primary/18 bg-white/45 p-4 shadow-[0_8px_32px_rgba(107,15,26,0.08)] backdrop-blur-[6px] sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/55 sm:text-[11px]">
                {t('Luyện thi bằng lái Tây Ban Nha', 'Examen teórico España')}
              </p>
              <div className="mt-4">
                <BrandLogo
                  imageClassName="h-11 sm:h-12 lg:h-[3.75rem]"
                  withText
                  textClassName="text-lg sm:text-xl lg:text-2xl"
                />
              </div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t(
                  'Ôn tập câu hỏi, làm bài thi thử và theo dõi tiến độ mỗi ngày.',
                  'Practica preguntas, exámenes de prueba y sigue tu progreso cada día.'
                )}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {highlights.map((item) => (
                  <li
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/12 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-medium text-primary/90"
                  >
                    <item.icon className="h-3 w-3 shrink-0 text-[#B8860B]" aria-hidden />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex min-h-0 flex-1 flex-col lg:mt-6">
              <div
                className={cn(
                  'auth-illustration-frame relative flex min-h-[180px] flex-1 flex-col items-center justify-center overflow-hidden',
                  'rounded-2xl border-2 border-[#c9a227]/35 bg-gradient-to-b from-white/55 to-primary/[0.07]',
                  'p-3 sm:min-h-[200px] sm:p-4 lg:min-h-0 lg:max-h-[min(52vh,440px)] lg:flex-none'
                )}
              >
                <img
                  src={ILLUSTRATION_SRC}
                  alt=""
                  width={800}
                  height={600}
                  decoding="async"
                  className="mx-auto h-auto max-h-[min(42vh,360px)] w-auto max-w-full object-contain object-center drop-shadow-[0_12px_32px_rgba(58,10,20,0.12)] sm:max-h-[min(44vh,400px)] lg:max-h-[min(48vh,420px)]"
                />
              </div>
              <p className="mt-3 text-center text-[11px] text-primary/45">
                {t('Ôn luyện mọi lúc, mọi nơi', 'Practica cuando quieras')}
              </p>
            </div>
          </div>
        </aside>

        <main className="auth-split-right flex min-h-0 w-full flex-1 flex-col lg:w-1/2 lg:flex-1">
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 py-8 sm:px-6 lg:justify-start lg:px-8 lg:py-10 xl:px-10">
            <Link
              to="/"
              className="mb-4 inline-flex w-fit shrink-0 text-sm font-medium text-primary/90 underline-offset-4 transition hover:text-primary hover:underline lg:hidden"
            >
              ← {t('Về trang chủ', 'Inicio')}
            </Link>
            {/* Full width trong cột phải — tránh khối form nhỏ giữa khoảng trống */}
            <div className="auth-form-card w-full max-w-none rounded-2xl p-6 sm:p-8 lg:p-10 xl:p-12">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
