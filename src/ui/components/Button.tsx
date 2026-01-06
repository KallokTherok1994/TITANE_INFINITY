/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Button Component with Design System + Performance Optimizations
import { ReactNode, ButtonHTMLAttributes, memo, useMemo } from 'react';
import { clsx } from 'clsx';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

/**
 * Button component with memoization for optimal re-render performance.
 * Supports multiple variants, sizes, and loading states.
 */
export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = useMemo(
    () =>
      clsx(
        'button',
        `button--${variant}`,
        `button--${size}`,
        fullWidth && 'button--full-width',
        loading && 'button--loading',
        disabled && 'button--disabled',
        className
      ),
    [variant, size, fullWidth, loading, disabled, className]
  );

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="button__spinner" aria-hidden="true" />}
      {!loading && leftIcon && (
        <span className="button__icon button__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="button__content">{children}</span>
      {!loading && rightIcon && (
        <span className="button__icon button__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
