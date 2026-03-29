/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
        14: 'repeat(14, minmax(0, 1fr))',
        15: 'repeat(15, minmax(0, 1fr))',
        16: 'repeat(16, minmax(0, 1fr))',
        17: 'repeat(17, minmax(0, 1fr))',
        18: 'repeat(18, minmax(0, 1fr))',
        19: 'repeat(19, minmax(0, 1fr))',
        20: 'repeat(20, minmax(0, 1fr))',
        21: 'repeat(21, minmax(0, 1fr))',
        22: 'repeat(22, minmax(0, 1fr))',
        23: 'repeat(23, minmax(0, 1fr))',
        24: 'repeat(24, minmax(0, 1fr))',
        25: 'repeat(25, minmax(0, 1fr))',
      },
      /** Một phông duy nhất: Be Vietnam Pro (`font-sans` = mặc định toàn app) */
      fontFamily: {
        sans: ["'Be Vietnam Pro'", 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ["'Be Vietnam Pro'", 'sans-serif'],
        body: ["'Be Vietnam Pro'", 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sky: {
          light: 'hsl(var(--sky-light))',
          mid: 'hsl(var(--sky-mid))',
        },
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          foreground: 'hsl(var(--gold-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        overlay: 'hsl(var(--overlay-bg))',
        'hover-surface': 'hsl(var(--hover-surface))',
        'text-muted-dark': 'hsl(var(--text-muted-dark))',
        'card-overlay': 'hsl(var(--card-overlay))',
        /** Design system — đồng bộ với :root trong index.css */
        brand: {
          heading: 'var(--brand-heading)',
          subtitle: 'var(--brand-subtitle)',
          ink: 'var(--brand-ink)',
          subline: 'var(--brand-subline)',
          onCta: 'var(--brand-cta-on)',
          cta: {
            DEFAULT: 'var(--brand-cta-from)',
            end: 'var(--brand-cta-end)',
          },
          burgundy: 'rgb(var(--rgb-brand-border) / <alpha-value>)',
        },
      },
      boxShadow: {
        'brand-sm': '0 10px 22px rgb(var(--rgb-brand-shadow) / 0.1)',
        'brand-md': '0 12px 30px rgb(var(--rgb-brand-shadow) / 0.14)',
        'brand-lg': '0 16px 42px rgb(var(--rgb-brand-shadow) / 0.12)',
        'brand-cta': '0 10px 22px rgb(var(--rgb-brand-shadow) / 0.2)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
