/**
 * TITANE∞ v20.0 — Input Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input - Text input générique avec label, helper, erreur
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   helper="Votre adresse email"
 *   error={errors.email}
 *   type="email"
 *   placeholder="vous@exemple.com"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, error, leftIcon, rightIcon, className = '', disabled, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium mb-1.5"
            style={{
              color: hasError
                ? 'var(--text-danger, #8b5f5f)'
                : disabled
                  ? 'var(--text-disabled, rgba(255,255,255,0.38))'
                  : 'var(--text-primary, #e0e0e0)',
            }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : helper ? `${props.id}-helper` : undefined}
            className={`
              w-full h-10 px-3 rounded-md
              text-sm font-normal
              transition-all duration-150
              focus:outline-none focus:ring-[3px] focus:ring-[rgba(114,123,129,0.6)] focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            style={{
              background: hasError
                ? 'var(--bg-danger-subtle, rgba(139,95,95,0.10))'
                : disabled
                  ? 'var(--bg-surface, #181c21)'
                  : 'var(--bg-panel, #101216)',
              border: `1px solid ${
                hasError
                  ? 'var(--border-danger, #8b5f5f)'
                  : disabled
                    ? 'var(--border, rgba(196,196,196,0.12))'
                    : 'var(--border, rgba(196,196,196,0.12))'
              }`,
              color: disabled ? 'var(--text-disabled, rgba(255,255,255,0.38))' : 'var(--text-primary, #e0e0e0)',
            }}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(helper || error) && (
          <p
            id={error ? `${props.id}-error` : `${props.id}-helper`}
            className="mt-1.5 text-xs"
            style={{
              color: hasError
                ? 'var(--text-danger, #8b5f5f)'
                : 'var(--text-muted, rgba(255,255,255,0.60))',
            }}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
