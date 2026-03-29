import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { ChevronUp, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const CONTACT_PHONE = '+34 900 000 000';
const CONTACT_TEL_LINK = 'tel:+34900000000';
const CONTACT_EMAIL = 'support@vietautoescola.com';
const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`;
const CONTACT_MAP_LINK = 'https://maps.google.com/?q=Madrid,Espana';
const CONTACT_LINKEDIN = '#';

const iconSm = 'h-3.5 w-3.5 shrink-0';

const FloatingContactButton = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed z-[90] flex flex-col items-end gap-2"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        right: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {isOpen && (
        <div
          className={cn(
            'origin-bottom-right animate-in fade-in slide-in-from-bottom-2 duration-200',
            'w-[min(260px,calc(100vw-2rem))] overflow-hidden rounded-xl',
            'border border-slate-200 bg-white shadow-xl',
            'dark:border-slate-600 dark:bg-slate-900'
          )}
          role="menu"
          aria-label={t('Menu liên hệ', 'Menú de contacto')}
        >
          <div className="brand-cta-primary border-b border-white/20 px-3 py-2">
            <p className="text-sm font-semibold tracking-tight text-brand-onCta">
              {t('Liên hệ', 'Contacto')}
            </p>
            <p className="mt-0.5 text-[11px] font-normal leading-snug text-white/85">
              {t('Chúng tôi sẵn sàng hỗ trợ bạn', 'Estamos aquí para ayudarte')}
            </p>
          </div>

          <nav className="divide-y divide-slate-100 bg-white p-1 dark:divide-slate-700 dark:bg-slate-900">
            <a
              href={CONTACT_LINKEDIN}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80"
              title="LinkedIn"
              aria-label="LinkedIn"
              role="menuitem"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0a66c2] text-[11px] font-bold text-white"
                aria-hidden
              >
                in
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-tight text-foreground">
                  LinkedIn
                </span>
                <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                  {t('Kết nối chuyên nghiệp', 'Perfil profesional')}
                </span>
              </span>
            </a>

            <a
              href={CONTACT_TEL_LINK}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80"
              title={CONTACT_PHONE}
              aria-label={t('Gọi điện', 'Llamar')}
              role="menuitem"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
                aria-hidden
              >
                <Phone className={iconSm} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-tight text-foreground">
                  {t('Gọi điện', 'Llamar')}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">{CONTACT_PHONE}</span>
              </span>
            </a>

            <a
              href={CONTACT_EMAIL_LINK}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80"
              title={CONTACT_EMAIL}
              aria-label={t('Gửi Gmail', 'Enviar correo')}
              role="menuitem"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#c76a17] text-white"
                aria-hidden
              >
                <Mail className={iconSm} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-tight text-foreground">
                  {t('Email', 'Email')}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">{CONTACT_EMAIL}</span>
              </span>
            </a>

            <a
              href={CONTACT_MAP_LINK}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80"
              aria-label={t('Xem địa chỉ', 'Ver dirección')}
              role="menuitem"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0c7d86] text-white"
                aria-hidden
              >
                <MapPin className={iconSm} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-tight text-foreground">
                  {t('Địa chỉ', 'Dirección')}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">Madrid, España</span>
              </span>
            </a>
          </nav>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'brand-cta-primary inline-flex h-10 items-center gap-2 rounded-full border border-white/25',
          'px-3.5 text-[13px] font-medium text-brand-onCta',
          'shadow-md ring-1 ring-white/30',
          'transition-colors duration-200 hover:opacity-[0.97]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('Mở menu liên hệ', 'Abrir menú de contacto')}
        title={t('Liên hệ', 'Contacto')}
      >
        <Mail className="h-3.5 w-3.5 opacity-95" strokeWidth={2} aria-hidden />
        <span>{t('Liên hệ', 'Contacto')}</span>
        <ChevronUp
          className={cn(
            'h-3.5 w-3.5 shrink-0 opacity-90 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </div>
  );
};

export default FloatingContactButton;
