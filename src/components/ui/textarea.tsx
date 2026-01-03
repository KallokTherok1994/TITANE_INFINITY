/**
 * TITANE∞ v26.2.0 — Textarea Component (Titanium Dark)
 * Multi-line text input with Titanium Dark design system
 * WCAG 2.2 AA compliant with auto-resize support
 * @license MIT
 */

import React, { forwardRef, useEffect, useRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
  success?: boolean;
  autoResize?: boolean;
  maxHeight?: number;
}

/**
 * Textarea - Multi-line text input with auto-resize
 *
 * @example
 * ```tsx
 * <Textarea
 *   id="prompt"
 *   label="Prompt"
 *   helper="Ask your question to TITANE∞"
 *   autoResize
 *   maxHeight={300}
 *   placeholder="Type here..."
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helper,
      error,
      success,
      autoResize = false,
      maxHeight,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    // Auto-resize logic
    useEffect(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        const newHeight = Math.min(
          textarea.scrollHeight,
          maxHeight || Number.MAX_SAFE_INTEGER
        );
        textarea.style.height = `${newHeight}px`;
      };

      adjustHeight();
      textarea.addEventListener('input', adjustHeight);
      return () => textarea.removeEventListener('input', adjustHeight);
    }, [autoResize, maxHeight, textareaRef, props.value]);

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label
            htmlFor={textareaId}
            className={`
              text-sm font-medium
              ${hasError ? 'text-error-500' : disabled ? 'text-titanium-text-disabled' : 'text-titanium-text-primary'}
            `}
          >
            {label}
          </label>
        )}

        <textarea
          ref={textareaRef}
          id={textareaId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : helper ? `${textareaId}-helper` : undefined
          }
          className={`
            w-full px-4 py-3 rounded
            text-base font-normal leading-relaxed
            bg-titanium-bg-interactive
            border
            ${hasError ? 'border-error-500' : success ? 'border-success-500' : 'border-titanium-border-default'}
            text-titanium-text-primary
            placeholder:text-titanium-text-tertiary
            transition-colors duration-200
            focus:outline-none focus:shadow-focus focus:border-titanium-accent-bright
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-titanium-bg-elevated
            resize-${autoResize ? 'none' : 'vertical'}
            ${className}
          `}
          style={{
            minHeight: autoResize ? '80px' : undefined,
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          }}
          {...props}
        />

        {(helper || error) && (
          <p
            id={error ? `${textareaId}-error` : `${textareaId}-helper`}
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

Textarea.displayName = 'Textarea';
