/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Input Component
 * Champ de saisie avec validation states
 * ═══════════════════════════════════════════════════════════════
 */

import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, radius, fontSizes, shadows } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const baseInputStyles: React.CSSProperties = {
  width: '100%',
  background: colors.rubis.surface.translucent,
  border: `1px solid ${colors.neutral[700]}`,
  color: colors.neutral[100],
  outline: 'none',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: 'inherit',
};

const sizeStyles: Record<InputSize, React.CSSProperties> = {
  sm: {
    height: '32px',
    padding: `0 ${spacing[3]}`,
    fontSize: fontSizes.sm,
    borderRadius: radius.base,
  },
  md: {
    height: '40px',
    padding: `0 ${spacing[4]}`,
    fontSize: fontSizes.base,
    borderRadius: radius.md,
  },
  lg: {
    height: '48px',
    padding: `0 ${spacing[5]}`,
    fontSize: fontSizes.lg,
    borderRadius: radius.lg,
  },
};

const stateStyles: Record<InputState, React.CSSProperties> = {
  default: {
    borderColor: colors.neutral[700],
  },
  error: {
    borderColor: colors.semantic.error[500],
    boxShadow: `0 0 0 3px ${colors.semantic.error[500]}33`,
  },
  success: {
    borderColor: colors.semantic.success[500],
    boxShadow: `0 0 0 3px ${colors.semantic.success[500]}33`,
  },
  warning: {
    borderColor: colors.semantic.warning[500],
    boxShadow: `0 0 0 3px ${colors.semantic.warning[500]}33`,
  },
};

const focusStyles: React.CSSProperties = {
  borderColor: colors.rubis.primary[500],
  boxShadow: shadows.focusRubis,
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none',
};

const labelStyles: React.CSSProperties = {
  display: 'block',
  marginBottom: spacing[2],
  fontSize: fontSizes.sm,
  fontWeight: 500,
  color: colors.neutral[300],
};

const helperTextStyles: React.CSSProperties = {
  marginTop: spacing[1],
  fontSize: fontSizes.xs,
  color: colors.neutral[400],
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      state = 'default',
      label,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const inputStyles: React.CSSProperties = {
      ...baseInputStyles,
      ...sizeStyles[size],
      ...stateStyles[state],
      ...(leftIcon && { paddingLeft: spacing[10] }),
      ...(rightIcon && { paddingRight: spacing[10] }),
      ...(disabled && disabledStyles),
      ...style,
    };

    const containerStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      position: 'relative',
    };

    const iconContainerStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      color: colors.neutral[400],
      pointerEvents: 'none',
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div style={{ ...iconContainerStyles, left: spacing[3] }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={clsx('titane-input', className)}
            style={inputStyles}
            onFocus={e => {
              if (!disabled) {
                Object.assign(e.currentTarget.style, focusStyles);
              }
            }}
            onBlur={e => {
              if (!disabled) {
                Object.assign(e.currentTarget.style, stateStyles[state]);
              }
            }}
            {...props}
          />
          {rightIcon && (
            <div style={{ ...iconContainerStyles, right: spacing[3] }}>
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && (
          <div
            style={{
              ...helperTextStyles,
              ...(state === 'error' && { color: colors.semantic.error[400] }),
              ...(state === 'success' && { color: colors.semantic.success[400] }),
              ...(state === 'warning' && { color: colors.semantic.warning[400] }),
            }}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
