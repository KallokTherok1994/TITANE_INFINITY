/**
 * TITANE∞ v24.3.0 — TAILWIND CSS CONFIGURATION
 *
 * Design System: Titane Métallique + Violet Énergie + Sage Subtil
 * Mobile-first, responsive, type-safe
 *
 * v22Ω AI Performance Optimizations Compatible
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/ui/**/*.{js,ts,jsx,tsx}',
    './src/apps/**/*.{js,ts,jsx,tsx}',
  ],

  // Dark mode par défaut (TITANE∞ est dark-first)
  darkMode: 'class',

  theme: {
    /* ═══════════════════════════════════════════════════════════════ */
    /* BREAKPOINTS (mobile-first)                                       */
    /* ═══════════════════════════════════════════════════════════════ */
    screens: {
      sm: '640px', // Phones landscape
      md: '768px', // Tablets
      lg: '1024px', // Laptops
      xl: '1280px', // Desktops
      '2xl': '1536px', // Large screens
    },

    extend: {
      /* ═══════════════════════════════════════════════════════════════ */
      /* COLORS — TITANE∞ SIGNATURE PALETTE                              */
      /* ═══════════════════════════════════════════════════════════════ */
      colors: {
        // Titane Métallique (base gris/charbon/argent)
        titane: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#727b81', // BASE
          600: '#5a6267',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },

        // Violet Énergie (accents, CTA, interactions)
        violet: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed', // BASE
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },

        // Sage Subtil (respirations visuelles, accents doux)
        sage: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16', // BASE
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },

        // Sémantiques (override Tailwind defaults)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          700: '#047857',
          900: '#064e3b',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
          900: '#7f1d1d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          700: '#b45309',
          900: '#78350f',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },

        // Backgrounds (dark mode defaults)
        bg: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
          elevated: '#475569',
          overlay: '#64748b',
        },

        // Text colors
        text: {
          primary: '#f1f5f9',
          secondary: '#cbd5e1',
          muted: '#94a3b8',
          disabled: '#64748b',
          inverse: '#0f172a',
        },

        // Borders
        border: {
          default: '#334155',
          subtle: '#1e293b',
          strong: '#475569',
          accent: '#7c3aed',
        },
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* SPACING (extend defaults with additional values)                 */
      /* ═══════════════════════════════════════════════════════════════ */
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem', // 352px
        '100': '25rem', // 400px
        '112': '28rem', // 448px
        '128': '32rem', // 512px
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* TYPOGRAPHY                                                        */
      /* ═══════════════════════════════════════════════════════════════ */
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },

      fontSize: {
        // Add extra sizes beyond Tailwind defaults
        '2xs': '0.625rem', // 10px
        '3xs': '0.5rem', // 8px
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* BORDER RADIUS                                                     */
      /* ═══════════════════════════════════════════════════════════════ */
      borderRadius: {
        '4xl': '2rem', // 32px
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* BOX SHADOWS (avec glow effects)                                  */
      /* ═══════════════════════════════════════════════════════════════ */
      boxShadow: {
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-sage': '0 0 20px rgba(132, 204, 22, 0.4)',
        'glow-titane': '0 0 20px rgba(114, 123, 129, 0.4)',
        'glow-violet-lg': '0 0 40px rgba(124, 58, 237, 0.5)',
        'glow-sage-lg': '0 0 40px rgba(132, 204, 22, 0.5)',
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* ANIMATIONS & KEYFRAMES                                            */
      /* ═══════════════════════════════════════════════════════════════ */
      keyframes: {
        // Fade in
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Fade out
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // Slide in from top
        'slide-in-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Slide in from bottom
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Slide in from left
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Slide in from right
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Scale in
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Pulse glow (pour états actifs)
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.6)' },
        },
        // Spin slow (pour loaders)
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Bounce subtle
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Shimmer (pour skeletons)
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-top': 'slide-in-top 0.3s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* Z-INDEX                                                           */
      /* ═══════════════════════════════════════════════════════════════ */
      zIndex: {
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        'modal-backdrop': '1300',
        modal: '1400',
        popover: '1500',
        tooltip: '1600',
        toast: '1700',
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* TRANSITIONS                                                       */
      /* ═══════════════════════════════════════════════════════════════ */
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* LAYOUT-SPECIFIC DIMENSIONS                                        */
      /* ═══════════════════════════════════════════════════════════════ */
      width: {
        sidebar: '260px',
        'sidebar-collapsed': '64px',
      },
      minWidth: {
        sidebar: '260px',
        'sidebar-collapsed': '64px',
      },
      maxWidth: {
        content: '1280px',
      },
      height: {
        header: '64px',
        footer: '48px',
      },
    },
  },

  /* ═══════════════════════════════════════════════════════════════ */
  /* PLUGINS                                                            */
  /* ═══════════════════════════════════════════════════════════════ */
  plugins: [
    // Add custom utilities if needed
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      });
    },
  ],
};

export default config;
