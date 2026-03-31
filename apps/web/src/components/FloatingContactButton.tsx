import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { ChevronUp, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Mặc định — ghi đè bằng NEXT_PUBLIC_WHATSAPP_URL / NEXT_PUBLIC_ZALO_URL trong .env */
const DEFAULT_WHATSAPP_URL = 'https://wa.me/34900000000';
const DEFAULT_ZALO_URL = 'https://zalo.me/84901234567';

function getWhatsAppUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_URL) {
    return process.env.NEXT_PUBLIC_WHATSAPP_URL;
  }
  return DEFAULT_WHATSAPP_URL;
}

function getZaloUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ZALO_URL) {
    return process.env.NEXT_PUBLIC_ZALO_URL;
  }
  return DEFAULT_ZALO_URL;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const FloatingContactButton = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const whatsappUrl = getWhatsAppUrl();
  const zaloUrl = getZaloUrl();

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
            'w-[min(300px,calc(100vw-2rem))] overflow-hidden rounded-xl lg:w-[min(380px,calc(100vw-2rem))] lg:rounded-2xl',
            'border border-slate-200 bg-white shadow-xl',
            'dark:border-slate-600 dark:bg-slate-900'
          )}
          role="menu"
          aria-label={t('Menu liên hệ', 'Menú de contacto')}
        >
          <div className="brand-cta-primary border-b border-white/20 px-4 py-3 lg:px-5 lg:py-4">
            <p className="text-sm font-semibold tracking-tight text-brand-onCta lg:text-base">
              {t('Liên hệ', 'Contacto')}
            </p>
            <p className="mt-1 text-xs font-normal leading-snug text-white/85 lg:mt-1.5 lg:text-sm">
              {t('WhatsApp & Zalo — phản hồi nhanh', 'WhatsApp y Zalo — respuesta rápida')}
            </p>
          </div>

          <nav className="divide-y divide-slate-100 bg-white p-1.5 dark:divide-slate-700 dark:bg-slate-900 lg:p-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 lg:gap-3.5 lg:px-4 lg:py-3.5 dark:hover:bg-slate-800/80"
              title="WhatsApp"
              aria-label="WhatsApp"
              role="menuitem"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white lg:h-11 lg:w-11 lg:rounded-[14px]"
                aria-hidden
              >
                <WhatsAppIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight text-foreground lg:text-base">
                  WhatsApp
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground lg:text-sm">
                  {t('Nhắn tin trực tiếp', 'Mensaje directo')}
                </span>
              </span>
            </a>

            <a
              href={zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 lg:gap-3.5 lg:px-4 lg:py-3.5 dark:hover:bg-slate-800/80"
              title="Zalo"
              aria-label="Zalo"
              role="menuitem"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0068FF] text-base font-black leading-none text-white lg:h-11 lg:w-11 lg:rounded-[14px] lg:text-xl"
                aria-hidden
              >
                Z
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight text-foreground lg:text-base">
                  Zalo
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground lg:text-sm">
                  {t('Chat qua Zalo', 'Chat por Zalo')}
                </span>
              </span>
            </a>
          </nav>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'brand-cta-primary inline-flex items-center justify-center rounded-full border border-white/25',
          'h-11 w-11 shrink-0 p-0 text-brand-onCta',
          'shadow-md ring-1 ring-white/30',
          'transition-colors duration-200 hover:opacity-[0.97]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'lg:h-12 lg:min-h-12 lg:w-auto lg:gap-2.5 lg:px-5 lg:py-0 lg:text-[15px]'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('Mở menu liên hệ', 'Abrir menú de contacto')}
        title={t('Liên hệ', 'Contacto')}
      >
        <MessageCircle
          className="h-5 w-5 shrink-0 opacity-95 lg:h-4 lg:w-4"
          strokeWidth={2}
          aria-hidden
        />
        <span className="hidden font-medium lg:inline">{t('Liên hệ', 'Contacto')}</span>
        <ChevronUp
          className={cn(
            'hidden shrink-0 opacity-90 transition-transform duration-200 lg:inline-block lg:h-4 lg:w-4',
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
