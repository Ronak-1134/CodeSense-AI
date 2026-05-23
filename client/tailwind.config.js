/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#E91E8C',
          hover: '#C2185B',
          muted: 'rgba(233,30,140,0.12)',
          border: 'rgba(233,30,140,0.3)',
        },
        dark: {
          page: '#0A0A0A',
          surface: '#111111',
          card: '#161616',
          elevated: '#1A1A1A',
          border: '#1F1F1F',
          borderHover: '#2A2A2A',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        code: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'md': ['15px', { lineHeight: '24px' }],
        'lg': ['16px', { lineHeight: '26px' }],
        'xl': ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      borderColor: {
        DEFAULT: '#1F1F1F',
      },
      borderWidth: {
        DEFAULT: '1px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.5)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.6)',
        md: '0 4px 16px rgba(0,0,0,0.6)',
        lg: '0 8px 32px rgba(0,0,0,0.7)',
        pink: '0 0 0 3px rgba(233,30,140,0.15)',
        'pink-sm': '0 0 0 2px rgba(233,30,140,0.2)',
        'inset-border': 'inset 0 0 0 1px rgba(255,255,255,0.05)',
      },
      width: {
        sidebar: '220px',
      },
      maxWidth: {
        content: '960px',
        wide: '1280px',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-up': 'slideUp 200ms cubic-bezier(0.4,0,0.2,1) forwards',
        'pulse-pink': 'pulsePink 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulsePink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.white / 80%'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-code': theme('colors.pink.DEFAULT'),
            '--tw-prose-pre-bg': theme('colors.dark.card'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};