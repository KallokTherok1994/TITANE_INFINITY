/**
 * TITANE∞ v26.2.0 — TAILWIND CSS CONFIGURATION
 *
 * Design System: Titanium Dark (Monochrome Premium)
 * Mobile-first, responsive, type-safe, WCAG 2.2 compliant
 *
 * @see src/styles/titanium-dark-tokens.css
 * @see docs/ui/DESIGN_SYSTEM.md
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/index.css',
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
      /* COLORS — TITANIUM DARK MONOCHROME SYSTEM                        */
      /* ═══════════════════════════════════════════════════════════════ */
      colors: {
        // Titanium Dark - Monochrome premium palette
        titanium: {
          // Backgrounds (layered depth)
          'bg-base': '#0f0f0f',
          'bg-elevated': '#1a1a1a',
          'bg-interactive': '#242424',
          'bg-overlay': '#2e2e2e',
          
          // Text (high contrast)
          'text-primary': '#f5f5f5',
          'text-secondary': '#b8b8b8',
          'text-tertiary': '#8a8a8a',
          'text-disabled': '#5a5a5a',
          'text-inverse': '#0f0f0f',
          
          // Borders
          'border-subtle': 'rgba(255, 255, 255, 0.06)',
          'border-default': 'rgba(255, 255, 255, 0.12)',
          'border-strong': 'rgba(255, 255, 255, 0.18)',
          
          // Accent (minimal cool gray)
          'accent-cool': '#9ca3af',
          'accent-bright': '#d1d5db',
          'accent-bg-subtle': 'rgba(156, 163, 175, 0.1)',
          'accent-bg-default': 'rgba(156, 163, 175, 0.2)',
          'accent-bg-strong': 'rgba(156, 163, 175, 0.3)',
        },

        // Legacy color support (will be deprecated)
        // Keep for gradual migration, remove in v27.0.0
        titane: {
          500: '#727b81',
          600: '#5a6267',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        
        violet: {
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
        },

        // Semantic colors (preserved for status/feedback)
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

        // Legacy aliases (deprecated - use titanium.* instead)
        bg: {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
          tertiary: '#242424',
          elevated: '#2e2e2e',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#b8b8b8',
          muted: '#8a8a8a',
          disabled: '#5a5a5a',
        },
        border: {
          default: 'rgba(255, 255, 255, 0.12)',
          subtle: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(255, 255, 255, 0.18)',
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
      /* BORDER RADIUS — 16px Base (Premium Feel)                         */
      /* ═══════════════════════════════════════════════════════════════ */
      borderRadius: {
        none: '0',
        sm: '8px',
        DEFAULT: '16px',   // Base radius for premium feel
        md: '16px',        // Alias for DEFAULT
        lg: '24px',
        xl: '32px',
        '2xl': '32px',     // Alias for xl
        '4xl': '2rem',     // Legacy support
        full: '9999px',    // Circles
      },

      /* ═══════════════════════════════════════════════════════════════ */
      /* BOX SHADOWS — Subtle Elevation (Titanium Dark)                   */
      /* ═══════════════════════════════════════════════════════════════ */
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.4)',
        md: '0 4px 8px rgba(0, 0, 0, 0.5)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.6)',
        xl: '0 12px 24px rgba(0, 0, 0, 0.7)',
        '2xl': '0 16px 32px rgba(0, 0, 0, 0.8)',
        
        // Focus shadow (WCAG 2.2: 3px solid, 3:1 contrast)
        focus: '0 0 0 3px rgba(209, 213, 219, 0.5)',
        
        // Metallic effects (rare usage)
        metal: '0 0 20px rgba(255, 255, 255, 0.1)',
        'metal-strong': '0 0 40px rgba(255, 255, 255, 0.15)',
        
        // Legacy glow effects (deprecated - use metal instead)
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-sage': '0 0 20px rgba(132, 204, 22, 0.4)',
        'glow-titane': '0 0 20px rgba(114, 123, 129, 0.4)',
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
