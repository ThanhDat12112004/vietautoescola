export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export const indexViewAllButtonClass =
  'brand-cta-primary h-11 gap-2 rounded-full border-transparent px-6 text-sm font-semibold text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] focus-visible:ring-2 focus-visible:ring-primary/45 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-brand-onCta [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5';

export const indexCardOpenChipClass =
  'inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/[0.09] px-3 py-0.5 leading-none text-[13px] font-semibold text-primary shadow-sm ring-1 ring-primary/10 transition-all group-hover:border-primary/55 group-hover:bg-primary/[0.16] group-hover:shadow group-hover:ring-primary/20 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform group-hover:[&_svg]:translate-x-1';

export const ctaPrimaryGlowButtonClass =
  'h-12 w-full rounded-xl border border-[#ffd6de]/55 bg-[linear-gradient(135deg,#a50f38_0%,#c81f55_45%,#e23567_100%)] text-base font-bold text-[#fff4f7] shadow-[0_14px_34px_rgba(167,17,57,0.34)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_18px_42px_rgba(167,17,57,0.42)] [&_svg]:h-5 [&_svg]:w-5';

export const ctaSecondaryGlowButtonClass =
  'h-12 w-full rounded-xl border-2 border-[#d77a93]/55 bg-[linear-gradient(180deg,rgba(255,244,248,0.96)_0%,rgba(255,236,242,0.88)_100%)] text-base font-semibold text-[#851738] shadow-[0_8px_22px_rgba(142,28,58,0.14)] transition-all duration-200 hover:border-[#c95877]/70 hover:bg-[linear-gradient(180deg,rgba(255,246,249,1)_0%,rgba(255,229,237,0.96)_100%)] hover:text-[#73112d] hover:shadow-[0_12px_26px_rgba(142,28,58,0.22)] [&_svg]:h-5 [&_svg]:w-5';
