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
  // ✅ FIX: Minimize SafeList (Rule 16 compliance)
  // Most utilities are covered by content paths; keep only truly dynamic cases
  safelist: [
    // Dynamic spacing (rarely generated at runtime, but kept for edge cases)
    // If content scanner picks these up, remove entirely
  ],
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
      /* COLORS — TITANIUM DARK MONOCHROME SYSTEM                        */
      /* ═══════════════════════════════════════════════════════════════ */
      colors: {
        // shadcn/Radix bridge — maps shadcn CSS variable semantics to titanium design tokens
        // Required by: src/components/shadcn/*.tsx (badge, button, dialog, input, select, tabs, etc.)
        primary: {
          DEFAULT: 'var(--color-violet-600)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-tertiary)',
          foreground: 'var(--color-text-primary)',
        },
        destructive: {
          DEFAULT: 'var(--color-error-500)',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'var(--color-bg-secondary)',
          foreground: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-bg-tertiary)',
          foreground: 'var(--color-text-primary)',
        },
        background: 'var(--color-bg-primary)',
        foreground: 'var(--color-text-primary)',
        card: {
          DEFAULT: 'var(--color-bg-secondary)',
          foreground: 'var(--color-text-primary)',
        },
        popover: {
          DEFAULT: 'var(--color-bg-elevated)',
          foreground: 'var(--color-text-primary)',
        },
        border: 'var(--color-border-default)',
        input: 'var(--color-border-default)',
        ring: 'var(--color-violet-600)',

        // Titanium — wired to CSS custom properties so dark/light mode works automatically
        titanium: {
          // Backgrounds — respond to html.light / html.dark via CSS vars
          'bg-base': 'var(--color-bg-primary)',
          'bg-elevated': 'var(--color-bg-secondary)',
          'bg-interactive': 'var(--color-bg-tertiary)',
          'bg-overlay': 'var(--color-bg-elevated)',

          // Text
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary': 'var(--color-text-muted)',
          'text-disabled': 'var(--color-text-disabled)',
          'text-inverse': 'var(--color-text-inverse)',

          // Borders
          'border-subtle': 'var(--color-border-subtle)',
          'border-default': 'var(--color-border-default)',
          'border-strong': 'var(--color-border-strong)',

          // Accent — violet primary, works on both dark and light
          'accent-cool': 'var(--color-violet-600)',
          'accent-bright': 'var(--color-violet-400)',
          'accent-bg-subtle': 'var(--bg-active)',
          'accent-bg-default': 'var(--bg-hover)',
          'accent-bg-strong': 'var(--bg-active)',
        },

        violet: {
          300: 'var(--color-violet-300)',
          400: 'var(--color-violet-400)',
          500: 'var(--color-violet-500)',
          600: 'var(--color-violet-600)',
        },

        // Semantic colors (preserved for status/feedback)
        success: {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          500: 'var(--color-success-500)',
          700: 'var(--color-success-700)',
          900: 'var(--color-success-900)',
        },
        error: {
          50: 'var(--color-error-50)',
          100: 'var(--color-error-100)',
          500: 'var(--color-error-500)',
          700: 'var(--color-error-700)',
          900: 'var(--color-error-900)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          500: 'var(--color-warning-500)',
          700: 'var(--color-warning-700)',
          900: 'var(--color-warning-900)',
        },
        info: {
          50: 'var(--color-info-50)',
          100: 'var(--color-info-100)',
          500: 'var(--color-info-500)',
          700: 'var(--color-info-700)',
          900: 'var(--color-info-900)',
        },

        // Legacy aliases — also wired to CSS vars for light mode
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          disabled: 'var(--color-text-disabled)',
        },
        border: {
          default: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
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
        DEFAULT: '16px', // Base radius for premium feel
        md: '16px', // Alias for DEFAULT
        lg: '24px',
        xl: '32px',
        '2xl': '32px', // Alias for xl
        '4xl': '2rem', // Legacy support
        full: '9999px', // Circles
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
