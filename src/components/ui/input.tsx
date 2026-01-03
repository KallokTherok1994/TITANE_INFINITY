/**
 * TITANE∞ v26.2.0 — Input Component (Titanium Dark)
 * Text input with Titanium Dark design system
 * WCAG 2.2 AA compliant with proper label association
 * @license MIT
 */

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input - Accessible text input with label, helper text, and error states
 *
 * @example
 * ```tsx
 * <Input
 *   id="email"
 *   label="Email"
 *   helper="Your email address"
 *   error={errors.email}
 *   type="email"
 *   placeholder="you@example.com"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { 
      label, 
      helper, 
      error, 
      success,
      leftIcon, 
      rightIcon, 
      className = '', 
      disabled,
      id,
      ...props 
    },
    ref
  ) => {
    const hasError = !!error;
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className={`
              text-sm font-medium
              ${hasError ? 'text-error-500' : disabled ? 'text-titanium-text-disabled' : 'text-titanium-text-primary'}
            `}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-titanium-text-tertiary"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined
            }
            className={`
              w-full h-10 px-4 rounded
              text-base font-normal
              bg-titanium-bg-interactive
              border
              ${hasError ? 'border-error-500' : success ? 'border-success-500' : 'border-titanium-border-default'}
              text-titanium-text-primary
              placeholder:text-titanium-text-tertiary
              transition-colors duration-200
              focus:outline-none focus:shadow-focus focus:border-titanium-accent-bright
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-titanium-bg-elevated
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-titanium-text-tertiary"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(helper || error) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className={`
              text-xs
              ${hasError ? 'text-error-500' : 'text-titanium-text-tertiary'}
            `}
            role={hasError ? 'alert' : undefined}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
