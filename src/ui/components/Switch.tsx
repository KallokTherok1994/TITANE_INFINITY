/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Switch Component with Performance Optimizations
import { useState, useCallback, useMemo, useId, memo } from 'react';
import { clsx } from 'clsx';
import './Switch.css';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

/**
 * Switch component for boolean toggles.
 * Memoized for optimal re-render performance.
 */
export const Switch = memo(function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const switchId = useId();

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newChecked = !checked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  }, [disabled, checked, isControlled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  const classes = useMemo(
    () =>
      clsx(
        'switch',
        `switch--${size}`,
        checked && 'switch--checked',
        disabled && 'switch--disabled',
        className
      ),
    [size, checked, disabled, className]
  );

  return (
    <label className={classes} htmlFor={switchId}>
      <input
        id={switchId}
        type="checkbox"
        className="switch__input"
        checked={checked}
        onChange={handleToggle}
        disabled={disabled}
        aria-checked={checked}
        role="switch"
      />
      <span
        className="switch__track"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={label || 'Toggle switch'}
      >
        <span className="switch__thumb" />
      </span>
      {label && <span className="switch__label">{label}</span>}
    </label>
  );
});
