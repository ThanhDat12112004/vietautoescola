import { Check, ChevronDown } from '@/components/BrandIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/api/types';

type TFn = (vi: string, es: string) => string;

export function LanguageDropdown({
  lang,
  setLang,
  t,
  align,
  compact,
  bareTrigger,
  triggerClassName,
}: {
  lang: Language;
  setLang: (next: Language) => void;
  t: TFn;
  align: 'end' | 'start';
  compact?: boolean;
  /** Gọn cho header thi: viền slate nhẹ, không gradient như menu chính */
  bareTrigger?: boolean;
  /** Thêm class cho nút trigger (ví dụ full width trong ô lưới) */
  triggerClassName?: string;
}) {
  const tight = Boolean(compact || bareTrigger);

  const options: { code: Language; flag: string; title: string; hint: string }[] = [
    {
      code: 'vi',
      flag: '🇻🇳',
      title: t('Tiếng Việt', 'Tiếng Việt'),
      hint: t('Giao diện & bài thi/tài liệu bằng tiếng Việt', 'Interfaz y contenidos en vietnamita'),
    },
    {
      code: 'es',
      flag: '🇪🇸',
      title: t('Español', 'Español'),
      hint: t('Giao diện & bài thi/tài liệu bằng tiếng Tây Ban Nha', 'Interfaz y contenidos en español'),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('Chọn ngôn ngữ', 'Seleccionar idioma')}
          aria-haspopup="menu"
          className={cn(
            'lang-menu-trigger inline-flex items-center rounded-full font-semibold text-[#2f171b] focus-visible:outline-none',
            bareTrigger
              ? 'gap-[clamp(0.15rem,0.75vmin,0.35rem)] border border-slate-300/70 bg-white/95 px-[clamp(0.25rem,1.05vmin,0.5rem)] py-[clamp(0.12rem,0.55vmin,0.28rem)] text-[clamp(0.5625rem,1.55vmin,0.8125rem)] shadow-sm transition-[border-color,background-color] hover:border-slate-400/65 hover:bg-slate-50/95 hover:shadow-sm focus-visible:ring-1 focus-visible:ring-primary/25 focus-visible:ring-offset-0'
              : 'border border-primary/20 bg-gradient-to-b from-white to-[#fff8f9] shadow-sm transition-[border-color,box-shadow,background-color] hover:border-primary/32 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
            !bareTrigger &&
              (compact
                ? 'gap-[clamp(0.15rem,0.75vmin,0.35rem)] px-[clamp(0.25rem,1.1vmin,0.55rem)] py-[clamp(0.12rem,0.65vmin,0.32rem)] text-[clamp(0.5625rem,1.55vmin,0.8125rem)]'
                : 'gap-2 px-3 py-2 text-sm'),
            triggerClassName,
          )}
        >
          <span
            className={cn(
              'select-none leading-none',
              tight ? 'text-[clamp(0.8125rem,2.2vmin,1.0625rem)]' : 'text-lg',
            )}
            aria-hidden
          >
            {lang === 'vi' ? '🇻🇳' : '🇪🇸'}
          </span>
          <span
            className={cn(
              'tabular-nums tracking-tight text-primary',
              tight ? 'min-w-[1.2rem] text-[clamp(0.5625rem,1.5vmin,0.75rem)]' : 'min-w-[1.75rem]',
            )}
          >
            {lang === 'vi' ? 'VI' : 'ES'}
          </span>
          <ChevronDown
            className={cn(
              'lang-menu-chevron shrink-0 text-primary/75 transition-transform duration-200',
              tight
                ? 'h-[clamp(0.65rem,1.75vmin,0.875rem)] w-[clamp(0.65rem,1.75vmin,0.875rem)]'
                : 'h-4 w-4',
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={tight ? 6 : 8}
        className={cn(
          'max-h-[min(70dvh,22rem)] overflow-y-auto overscroll-contain border-primary/18 shadow-[0_16px_40px_rgba(58,10,20,0.12)]',
          tight
            ? 'min-w-[min(calc(100vw-1.25rem),13.5rem)] max-w-[min(calc(100vw-1rem),16rem)] p-1.5 sm:min-w-[14.5rem] sm:p-2'
            : 'min-w-[14.5rem] p-2',
        )}
      >
        <DropdownMenuLabel
          className={cn(
            'px-2 pb-0.5 pt-0.5 font-bold uppercase tracking-[0.14em] text-primary/65',
            tight ? 'text-[clamp(0.5625rem,1.45vmin,0.625rem)]' : 'px-2.5 pb-1 pt-1 text-[10px]',
          )}
        >
          {t('Ngôn ngữ', 'Idioma')}
        </DropdownMenuLabel>
        <div className={cn('flex flex-col pt-0.5', tight ? 'gap-0.5' : 'gap-1')}>
          {options.map((opt) => {
            const active = lang === opt.code;
            return (
              <DropdownMenuItem
                key={opt.code}
                className={cn(
                  'dd-item flex cursor-pointer items-center rounded-xl focus:bg-primary/[0.08]',
                  tight
                    ? 'gap-2 px-2 py-2 sm:gap-3 sm:px-2.5 sm:py-2.5'
                    : 'gap-3 px-2.5 py-2.5',
                  active && 'bg-primary/[0.1]',
                )}
                onClick={() => setLang(opt.code)}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-full bg-primary/[0.08] leading-none',
                    tight
                      ? 'h-[clamp(1.75rem,4.5vmin,2rem)] w-[clamp(1.75rem,4.5vmin,2rem)] text-[clamp(0.875rem,2.2vmin,1.125rem)]'
                      : 'h-9 w-9 text-lg',
                  )}
                >
                  {opt.flag}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div
                    className={cn(
                      'font-bold text-[#2f171b]',
                      tight ? 'text-[clamp(0.6875rem,1.65vmin,0.875rem)]' : 'text-sm',
                    )}
                  >
                    {opt.title}
                  </div>
                  <div
                    className={cn(
                      'font-medium leading-tight text-muted-foreground',
                      tight ? 'text-[clamp(0.5625rem,1.45vmin,0.6875rem)]' : 'text-[11px]',
                    )}
                  >
                    {opt.hint}
                  </div>
                </div>
                {active ? (
                  <Check
                    className={cn(
                      'shrink-0 text-primary',
                      tight ? 'h-[clamp(0.75rem,2vmin,1rem)] w-[clamp(0.75rem,2vmin,1rem)]' : 'h-4 w-4',
                    )}
                    aria-hidden
                  />
                ) : (
                  <span
                    className={cn('shrink-0', tight ? 'h-3.5 w-3.5 sm:h-4 sm:w-4' : 'h-4 w-4')}
                    aria-hidden
                  />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
