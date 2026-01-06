/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Textarea Component with Performance Optimizations
import { useState, useRef, useEffect, useCallback, useMemo, useId, memo } from 'react';
import { clsx } from 'clsx';
import './Textarea.css';

interface TextareaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  rows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Textarea component for multiline text input.
 * Memoized for optimal re-render performance.
 */
export const Textarea = memo(function Textarea({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onFocus,
  onBlur,
  placeholder,
  disabled = false,
  error,
  label,
  helperText,
  rows = 4,
  autoResize = false,
  maxLength,
  showCount = false,
  size = 'md',
  className,
}: TextareaProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const errorId = useId();
  const helperId = useId();

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (maxLength && newValue.length > maxLength) {
        return;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    },
    [maxLength, isControlled, onChange]
  );

  // Auto-resize
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const classes = useMemo(
    () =>
      clsx(
        'textarea',
        `textarea--${size}`,
        disabled && 'textarea--disabled',
        error && 'textarea--error',
        className
      ),
    [size, disabled, error, className]
  );

  const characterCount = useMemo(
    () => (maxLength ? `${value.length}/${maxLength}` : `${value.length}`),
    [value.length, maxLength]
  );

  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (error) ids.push(errorId);
    else if (helperText) ids.push(helperId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [error, helperText, errorId, helperId]);

  return (
    <div className={classes}>
      {label && (
        <label className="textarea__label" htmlFor={textareaId}>
          {label}
        </label>
      )}

      <div className="textarea__wrapper">
        <textarea
          ref={textareaRef}
          id={textareaId}
          className="textarea__input"
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={autoResize ? 1 : rows}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      </div>

      <div className="textarea__footer">
        <div className="textarea__footer-left">
          {error && (
            <span className="textarea__error" id={errorId} role="alert">
              {error}
            </span>
          )}
          {!error && helperText && (
            <span className="textarea__helper" id={helperId}>
              {helperText}
            </span>
          )}
        </div>
        {(showCount || maxLength) && (
          <span className="textarea__count" aria-live="polite">
            {characterCount}
          </span>
        )}
      </div>
    </div>
  );
});
