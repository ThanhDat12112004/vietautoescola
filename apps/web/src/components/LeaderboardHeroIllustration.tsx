import { useId } from 'react';

/** Đồng bộ phông hệ thống (Be Vietnam Pro) — SVG text không kế thừa font từ CSS */
const FONT_SANS = "'Be Vietnam Pro', ui-sans-serif, sans-serif";

/**
 * Minh họa có “chữ”: BXH + TOP 20, khối danh sách, cúp, bục 1-2-3.
 * `meet` giữ tỉ lệ — chữ không méo (khác preserveAspectRatio none).
 */
export default function LeaderboardHeroIllustration() {
  const uid = useId().replace(/:/g, '');
  const g = {
    bg: `lhs-bg-${uid}`,
    gold: `lhs-g-${uid}`,
    silver: `lhs-sv-${uid}`,
    bronze: `lhs-br-${uid}`,
    wine: `lhs-w-${uid}`,
    shine: `lhs-sh-${uid}`,
    edge: `lhs-e-${uid}`,
    panel: `lhs-p-${uid}`,
  };
  const u = (id: string) => `url(#${id})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 960"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      className="block h-full min-h-0 min-w-0 w-full max-w-none shrink-0"
    >
      <defs>
        <linearGradient id={g.bg} x1={60} y1={0} x2={60} y2={960} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8FA" />
          <stop offset="0.5" stopColor="#F5E6EC" />
          <stop offset="1" stopColor="#E8D4DC" />
        </linearGradient>
        <linearGradient id={g.panel} x1={60} y1={0} x2={60} y2={140} gradientUnits="userSpaceOnUse">
          <stop stopColor="#9E3348" stopOpacity={0.14} />
          <stop offset="1" stopColor="#9E3348" stopOpacity={0.04} />
        </linearGradient>
        <linearGradient id={g.gold} x1={36} y1={260} x2={84} y2={460} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE566" />
          <stop offset="0.55" stopColor="#E8B923" />
          <stop offset="1" stopColor="#A67C00" />
        </linearGradient>
        <linearGradient id={g.silver} x1={0} y1={0} x2={0} y2={1}>
          <stop stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id={g.bronze} x1={0} y1={0} x2={0} y2={1}>
          <stop stopColor="#E8C4A8" />
          <stop offset="1" stopColor="#9A5C2E" />
        </linearGradient>
        <linearGradient id={g.wine} x1={60} y1={0} x2={60} y2={400} gradientUnits="userSpaceOnUse">
          <stop stopColor="#C45D72" />
          <stop offset="1" stopColor="#5C1F2A" />
        </linearGradient>
        <linearGradient id={g.shine} x1={40} y1={320} x2={80} y2={400} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity={0.5} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={g.edge} x1={0} y1={0} x2={120} y2={0} gradientUnits="userSpaceOnUse">
          <stop stopColor="#9E3348" stopOpacity={0.3} />
          <stop offset="0.1" stopColor="#9E3348" stopOpacity={0} />
          <stop offset="0.9" stopColor="#9E3348" stopOpacity={0} />
          <stop offset="1" stopColor="#9E3348" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      <rect width={120} height={960} fill={u(g.bg)} />
      <rect width={120} height={960} fill={u(g.edge)} />

      {/* --- Tiêu đề: BXH = Bảng xếp hạng + TOP 20 --- */}
      <rect x={8} y={12} width={104} height={88} rx={10} fill={u(g.panel)} stroke="#9E3348" strokeOpacity={0.25} strokeWidth={1} />
      <text
        x={60}
        y={52}
        textAnchor="middle"
        fill="#7A2038"
        style={{ fontFamily: FONT_SANS, fontSize: '22px', fontWeight: 800 }}
      >
        BXH
      </text>
      <text
        x={60}
        y={78}
        textAnchor="middle"
        fill="#9E3348"
        fillOpacity={0.75}
        style={{ fontFamily: FONT_SANS, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}
      >
        TOP 20
      </text>

      {/* --- Khối “danh sách xếp hạng” (UI bảng) --- */}
      <rect x={14} y={118} width={92} height={118} rx={8} fill="#FFFFFF" fillOpacity={0.65} stroke="#9E3348" strokeOpacity={0.28} strokeWidth={1.2} />
      <text
        x={22}
        y={138}
        fill="#9E3348"
        fillOpacity={0.55}
        style={{ fontFamily: FONT_SANS, fontSize: '8px', fontWeight: 700 }}
      >
        #
      </text>
      <line x1={32} y1={132} x2={98} y2={132} stroke="#9E3348" strokeOpacity={0.2} strokeWidth={1} />
      {[152, 172, 192, 212].map((y, i) => (
        <g key={y}>
          <circle cx={22} cy={y - 4} r={5} fill={i === 0 ? '#E8B923' : '#CBD5E1'} fillOpacity={i === 0 ? 0.95 : 0.7} />
          <text
            x={22}
            y={y - 1}
            textAnchor="middle"
            fill={i === 0 ? '#422006' : '#64748B'}
            style={{ fontFamily: FONT_SANS, fontSize: '7px', fontWeight: 800 }}
          >
            {i + 1}
          </text>
          <line x1={32} y1={y} x2={98} y2={y} stroke="#9E3348" strokeOpacity={0.12} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}

      {/* --- Cúp vinh danh (trọng tâm) --- */}
      <g transform="translate(0, 8)">
        <path
          fill={u(g.gold)}
          stroke="#B8890F"
          strokeWidth={0.9}
          d="M60 268c-24 0-44 17-46 42h92c-2-25-22-42-46-42z"
        />
        <ellipse cx={60} cy={318} rx={42} ry={7} fill="#5C4510" fillOpacity={0.5} />
        <path
          fill={u(g.gold)}
          d="M20 324h80v9c0 14-13 25-28 25H48c-15 0-28-11-28-25v-9z"
        />
        <path fill={u(g.shine)} d="M34 328h52c2 0 4 2 4 5v22c-10 8-22 12-30 12s-20-4-30-12v-22c0-3 2-5 4-5z" />
        <path
          fill="none"
          stroke={u(g.gold)}
          strokeWidth={5.5}
          strokeLinecap="round"
          d="M20 312c-16 0-28 14-28 31s12 31 28 31M100 312c16 0 28 14 28 31s-12 31-28 31"
        />
        <rect x={50} y={362} width={20} height={48} rx={4} fill={u(g.wine)} />
        <path fill={u(g.wine)} d="M28 414h64a7 7 0 017 7v12H21v-12a7 7 0 017-7z" />
      </g>

      {/* --- Bục 1 – 2 – 3 + số --- */}
      <g transform="translate(0, 20)">
        <rect x={10} y={458} width={26} height={34} rx={4} fill={u(g.bronze)} stroke="#6B3A1A" strokeWidth={0.7} />
        <text x={23} y={480} textAnchor="middle" fill="#FFF8F0" style={{ fontFamily: FONT_SANS, fontSize: '14px', fontWeight: 900 }}>
          3
        </text>
        <rect x={47} y={438} width={26} height={54} rx={4} fill={u(g.gold)} stroke="#A67C00" strokeWidth={0.7} />
        <text x={60} y={474} textAnchor="middle" fill="#422006" style={{ fontFamily: FONT_SANS, fontSize: '16px', fontWeight: 900 }}>
          1
        </text>
        <rect x={84} y={448} width={26} height={44} rx={4} fill={u(g.silver)} stroke="#64748B" strokeWidth={0.7} />
        <text x={97} y={476} textAnchor="middle" fill="#1E293B" style={{ fontFamily: FONT_SANS, fontSize: '14px', fontWeight: 900 }}>
          2
        </text>
      </g>

      {/* --- Điểm / thứ hạng tăng --- */}
      <text
        x={60}
        y={548}
        textAnchor="middle"
        fill="#9E3348"
        fillOpacity={0.65}
        style={{ fontFamily: FONT_SANS, fontSize: '9px', fontWeight: 700 }}
      >
        Điểm · Thứ hạng
      </text>
      <g transform="translate(0, 10)">
        <rect x={18} y={568} width={18} height={40} rx={3} fill="#9E3348" fillOpacity={0.25} />
        <rect x={42} y={552} width={18} height={56} rx={3} fill="#9E3348" fillOpacity={0.38} />
        <rect x={66} y={538} width={18} height={70} rx={3} fill="#E8B923" fillOpacity={0.55} />
        <rect x={90} y={524} width={18} height={84} rx={3} fill="#9E3348" fillOpacity={0.42} />
        <path
          stroke="#9E3348"
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M27 612 L45 592 L63 578 L81 562 L99 548"
        />
        <path fill="#9E3348" d="M99 542l8 6-8 6v-12z" />
      </g>

      {/* --- Huy chương + ngôi sao “nhất” --- */}
      <circle cx={60} cy={668} r={22} fill={u(g.gold)} stroke="#B8890F" strokeWidth={1.2} />
      <path
        fill="#FFF8E0"
        fillOpacity={0.9}
        d="M60 652l5 10 11 1.6-8 7.8 1.9 11.3-9.9-5.2-9.9 5.2 1.9-11.3-8-7.8 11-1.6z"
      />
      <text
        x={60}
        y={722}
        textAnchor="middle"
        fill="#7A2038"
        fillOpacity={0.7}
        style={{ fontFamily: FONT_SANS, fontSize: '8px', fontWeight: 700 }}
      >
        Vinh danh
      </text>

      {/* --- Đáy: nhắc 20 học viên --- */}
      <rect x={10} y={760} width={100} height={44} rx={8} fill="#9E3348" fillOpacity={0.1} stroke="#9E3348" strokeOpacity={0.2} />
      <text
        x={60}
        y={782}
        textAnchor="middle"
        fill="#5C1F2A"
        style={{ fontFamily: FONT_SANS, fontSize: '9px', fontWeight: 800 }}
      >
        20 vị trí
      </text>
      <text
        x={60}
        y={796}
        textAnchor="middle"
        fill="#7A2038"
        fillOpacity={0.65}
        style={{ fontFamily: FONT_SANS, fontSize: '7px', fontWeight: 600 }}
      >
        trên bảng
      </text>

      <path
        stroke="#E8B923"
        strokeOpacity={0.4}
        strokeWidth={1.5}
        fill="none"
        d="M14 900c18 8 74 8 92 0"
      />
    </svg>
  );
}
