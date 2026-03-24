import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const ArrowRight = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const BookOpen = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h5.5v16H6a2.5 2.5 0 0 0-2.5 2" />
    <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-5.5v16H18a2.5 2.5 0 0 1 2.5 2" />
  </svg>
);

export const CheckCircle2 = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.8 12.4 2.2 2.2 4.4-5" />
  </svg>
);

export const Globe2 = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 12h17" />
    <path d="M12 3a13 13 0 0 1 0 18" />
    <path d="M12 3a13 13 0 0 0 0 18" />
  </svg>
);

export const Globe = Globe2;

export const GraduationCap = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="m2.5 9.2 9.5-4.7 9.5 4.7-9.5 4.7-9.5-4.7Z" />
    <path d="M6 11.2V15c0 1.7 2.6 3 6 3s6-1.3 6-3v-3.8" />
    <path d="M21.5 10.2V15" />
  </svg>
);

export const Medal = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="m8 3 4 5 4-5" />
    <circle cx="12" cy="15" r="5" />
    <path d="m10.3 15 1.3 1.3 2.1-2.6" />
  </svg>
);

export const Shield = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M12 3.3 5 6v5.8c0 4.6 2.9 7.8 7 9.9 4.1-2.1 7-5.3 7-9.9V6l-7-2.7Z" />
  </svg>
);

export const ShieldCheck = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M12 3.3 5 6v5.8c0 4.6 2.9 7.8 7 9.9 4.1-2.1 7-5.3 7-9.9V6l-7-2.7Z" />
    <path d="m9.4 12.4 1.9 1.9 3.5-4" />
  </svg>
);

export const Star = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="m12 3.7 2.5 5.1 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.7Z" />
  </svg>
);

export const Target = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1.8" />
  </svg>
);

export const Trophy = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M8 4h8v2a4 4 0 0 1-8 0V4Z" />
    <path d="M6 6H4a2 2 0 0 0 2 2" />
    <path d="M18 6h2a2 2 0 0 1-2 2" />
    <path d="M12 10v4" />
    <path d="M9 20h6" />
    <path d="M10 14h4l1 4H9l1-4Z" />
  </svg>
);

export const Users = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="16.5" cy="10" r="2.5" />
    <path d="M4 18a5 5 0 0 1 10 0" />
    <path d="M14 18a4 4 0 0 1 6 0" />
  </svg>
);

export const Clock = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 7.5v5l3.2 2" />
  </svg>
);

export const FileText = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
    <path d="M14 3.5V8h4" />
    <path d="M9 12h6" />
    <path d="M9 15h6" />
  </svg>
);

export const Zap = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M13.5 3 6.8 12h4.5L10.5 21 17.2 12h-4.5L13.5 3Z" />
  </svg>
);

export const Download = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M12 4v10" />
    <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
    <path d="M5 19h14" />
  </svg>
);

export const Eye = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M2.8 12s3.2-5.8 9.2-5.8 9.2 5.8 9.2 5.8-3.2 5.8-9.2 5.8-9.2-5.8-9.2-5.8Z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const Home = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="m3.5 10 8.5-6.5 8.5 6.5" />
    <path d="M6 9.5V20h12V9.5" />
  </svg>
);

export const LogOut = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M14 12H5" />
    <path d="m12 9 3 3-3 3" />
  </svg>
);

export const Menu = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export const User = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.8 19a7.2 7.2 0 0 1 14.4 0" />
  </svg>
);

export const X = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...baseProps} {...props}>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </svg>
);
