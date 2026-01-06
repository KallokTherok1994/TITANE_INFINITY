/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Toggle Component with Performance Optimizations
import { useState, useCallback, useMemo, memo } from 'react';
import { clsx } from 'clsx';
import './Toggle.css';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ToggleProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: ToggleOption[];
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Toggle component for option switching.
 * Memoized for optimal re-render performance.
 */
export const Toggle = memo(function Toggle({
  value: controlledValue,
  defaultValue = '',
  onChange,
  options,
  disabled = false,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  className,
}: ToggleProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleSelect = useCallback(
    (optionValue: string, optionDisabled?: boolean) => {
      if (disabled || optionDisabled) return;

      if (!isControlled) {
        setInternalValue(optionValue);
      }

      onChange?.(optionValue);
    },
    [disabled, isControlled, onChange]
  );

  const classes = useMemo(
    () =>
      clsx(
        'toggle',
        `toggle--${size}`,
        `toggle--${variant}`,
        fullWidth && 'toggle--full-width',
        disabled && 'toggle--disabled',
        className
      ),
    [size, variant, fullWidth, disabled, className]
  );

  return (
    <div className={classes} role="tablist">
      {options.map(option => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={option.value}
            type="button"
            className={clsx(
              'toggle__option',
              isSelected && 'toggle__option--selected',
              isDisabled && 'toggle__option--disabled'
            )}
            onClick={() => handleSelect(option.value, option.disabled)}
            disabled={isDisabled}
            role="tab"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
          >
            {option.icon && (
              <span className="toggle__icon" aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span className="toggle__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
});
