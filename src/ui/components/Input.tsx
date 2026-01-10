/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Input Component with Performance Optimizations
import { InputHTMLAttributes, forwardRef, useMemo, useId } from 'react';
import { clsx } from 'clsx';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * Input component with forwardRef for form integration.
 * Includes proper label association and error handling for accessibility.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, fullWidth = false, className, ...props },
  ref
) {
  const inputId = useId();
  const errorId = useId();

  const classes = useMemo(
    () =>
      clsx(
        'input-wrapper',
        fullWidth && 'input-wrapper--full-width',
        error && 'input-wrapper--error',
        className
      ),
    [fullWidth, error, className]
  );

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className="input"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
