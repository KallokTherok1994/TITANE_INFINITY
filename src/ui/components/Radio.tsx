/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Radio Component with Performance Optimizations
import React, { useState, useCallback, useMemo, useId, memo } from 'react';
import { clsx } from 'clsx';
import './Radio.css';

interface RadioProps {
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  name?: string;
  className?: string;
}

/**
 * Radio component for single selection.
 * Memoized for optimal re-render performance.
 */
export const Radio = memo(function Radio({
  value,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  name,
  className,
}: RadioProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const radioId = useId();

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback(() => {
    if (disabled) return;

    if (!isControlled) {
      setInternalChecked(true);
    }

    onChange?.(value);
  }, [disabled, isControlled, onChange, value]);

  const classes = useMemo(
    () =>
      clsx(
        'radio',
        `radio--${size}`,
        checked && 'radio--checked',
        disabled && 'radio--disabled',
        className
      ),
    [size, checked, disabled, className]
  );

  return (
    <label className={classes} htmlFor={radioId}>
      <input
        id={radioId}
        type="radio"
        className="radio__input"
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        name={name}
      />
      <span className="radio__circle">
        <span className="radio__dot" />
      </span>
      {label && <span className="radio__label">{label}</span>}
    </label>
  );
});

// RadioGroup pour gérer plusieurs radios
interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/**
 * RadioGroup component for managing multiple radio buttons.
 * Memoized for optimal re-render performance.
 */
export const RadioGroup = memo(function RadioGroup({
  value: controlledValue,
  defaultValue = '',
  onChange,
  name,
  disabled = false,
  size = 'md',
  children,
  className,
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const classes = useMemo(() => clsx('radio-group', className), [className]);

  return (
    <div className={classes} role="radiogroup">
      {React.Children.map(children, child => {
        if (React.isValidElement<RadioProps>(child) && child.type === Radio) {
          return React.cloneElement(child, {
            checked: child.props.value === currentValue,
            onChange: handleChange,
            name,
            disabled: disabled || child.props.disabled,
            size: child.props.size || size,
          });
        }
        return child;
      })}
    </div>
  );
});
