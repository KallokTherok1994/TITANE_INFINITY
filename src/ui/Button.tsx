/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Button Component
 * Primitive UI avec variants, sizes, states
 * ═══════════════════════════════════════════════════════════════
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, radius, shadows, transitions } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const baseStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 500,
  transition: transitions.preset.all,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  fontFamily: 'inherit',
  userSelect: 'none' as const,
  position: 'relative' as const,
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: `linear-gradient(135deg, ${colors.rubis.primary[500]}, ${colors.rubis.primary[600]})`,
    color: colors.neutral[50],
    boxShadow: shadows.md,
  },
  secondary: {
    background: colors.rubis.surface.translucent,
    color: colors.rubis.primary[400],
    border: `1px solid ${colors.rubis.primary[700]}`,
    backdropFilter: 'blur(10px)',
  },
  ghost: {
    background: 'transparent',
    color: colors.neutral[300],
    border: '1px solid transparent',
  },
  danger: {
    background: `linear-gradient(135deg, ${colors.semantic.error[500]}, ${colors.semantic.error[600]})`,
    color: colors.neutral[50],
    boxShadow: shadows.md,
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    height: '32px',
    padding: `0 ${spacing[4]}`,
    fontSize: '0.875rem',
    borderRadius: radius.md,
  },
  md: {
    height: '40px',
    padding: `0 ${spacing[6]}`,
    fontSize: '1rem',
    borderRadius: radius.md,
  },
  lg: {
    height: '48px',
    padding: `0 ${spacing[8]}`,
    fontSize: '1.125rem',
    borderRadius: radius.lg,
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    boxShadow: shadows.glowRubis,
    transform: 'translateY(-2px)',
  },
  secondary: {
    background: colors.rubis.surface.glass,
    borderColor: colors.rubis.primary[500],
  },
  ghost: {
    background: colors.neutral[900],
    borderColor: colors.neutral[700],
  },
  danger: {
    boxShadow: `0 0 20px rgba(239, 68, 68, 0.5)`,
    transform: 'translateY(-2px)',
  },
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const buttonStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && disabledStyles),
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx('titane-button', className)}
        style={buttonStyles}
        onMouseEnter={e => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, hoverStyles[variant]);
          }
        }}
        onMouseLeave={e => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, variantStyles[variant]);
          }
        }}
        {...props}
      >
        {loading && (
          <span
            style={{
              marginRight: spacing[2],
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: `2px solid ${colors.neutral[300]}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        )}
        {!loading && leftIcon && (
          <span style={{ marginRight: spacing[2], display: 'flex' }}>
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span style={{ marginLeft: spacing[2], display: 'flex' }}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Ajouter l'animation spin au document
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  const keyframes = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  if (styleSheet) {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
}
