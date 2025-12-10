/**
 * TITANE∞ v20.0 — Switch Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/**
 * Switch - Toggle on/off avec animation glissement
 *
 * @example
 * ```tsx
 * <Switch
 *   checked={autoSave}
 *   onCheckedChange={setAutoSave}
 *   label="Sauvegarde automatique"
 * />
 * ```
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  id,
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
    <div className="flex items-center gap-2">
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200
          focus:outline-none focus:ring-[3px] focus:ring-offset-2
          focus:ring-[rgba(114,123,129,0.6)]
          disabled:cursor-not-allowed disabled:opacity-50
        `}
        style={{
          background: checked
            ? 'var(--bg-success, #93b399)'
            : 'var(--bg-surface, #181c21)',
        }}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full
            shadow-lg ring-0 transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
          style={{
            background: checked
              ? 'var(--text-inverse, #ffffff)'
              : 'var(--text-muted, rgba(255,255,255,0.60))',
          }}
        />
      </button>

      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium cursor-pointer select-none"
          style={{
            color: disabled
              ? 'var(--text-disabled, rgba(255,255,255,0.38))'
              : 'var(--text-primary, #e0e0e0)',
          }}
          onClick={handleClick}
        >
          {label}
        </label>
      )}
    </div>
  );
}
