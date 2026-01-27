/**
 * TITANE∞ v26.2.0 — Switch Component (Titanium Dark)
 * Toggle switch with Titanium Dark design system
 * WCAG 2.2 AA compliant with keyboard support
 * @license MIT
 */

import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
}

/**
 * Switch - Toggle on/off with slide animation
 *
 * @example
 * ```tsx
 * <Switch
 *   checked={autoSave}
 *   onCheckedChange={setAutoSave}
 *   label="Auto-save"
 * />
 * ```
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  id,
  className,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      onCheckedChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={ariaLabel || label || 'Toggle switch'}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-testid={dataTestId}
        data-state={checked ? 'checked' : 'unchecked'}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200
          focus:outline-none focus-visible:shadow-focus
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-titanium-accent-cool' : 'bg-titanium-bg-interactive'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full
            shadow-lg ring-0 transition-transform duration-200
            ${checked ? 'translate-x-5 bg-titanium-bg-base' : 'translate-x-0 bg-titanium-text-tertiary'}
          `}
        />
      </button>

      {label && (
        <label
          htmlFor={id}
          className={`
            text-sm font-medium cursor-pointer select-none
            ${disabled ? 'text-titanium-text-disabled' : 'text-titanium-text-primary'}
          `}
          onClick={handleClick}
        >
          {label}
        </label>
      )}
    </div>
  );
}
