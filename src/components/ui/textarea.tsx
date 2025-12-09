/**
 * TITANE∞ v20.0 — Textarea Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React, { forwardRef, useEffect, useRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
  autoResize?: boolean;
  maxHeight?: number;
}

/**
 * Textarea - Multi-line text input avec auto-resize optionnel
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Prompt"
 *   helper="Posez votre question à TITANE∞"
 *   autoResize
 *   maxHeight={300}
 *   placeholder="Écrivez ici..."
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helper, error, autoResize = false, maxHeight, className = '', disabled, ...props }, ref) => {
    const hasError = !!error;
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

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

        <textarea
          ref={textareaRef}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${props.id}-error` : helper ? `${props.id}-helper` : undefined}
          className={`
            w-full px-3 py-2.5 rounded-md
            text-sm font-normal leading-relaxed
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50
            resize-${autoResize ? 'none' : 'vertical'}
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
            minHeight: autoResize ? '60px' : undefined,
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          }}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
