// TITANE∞ v17.1 - Toggle Component - Design System
import { useState } from 'react';
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

export const Toggle = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  options,
  disabled = false,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  className = '',
}: ToggleProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
    if (disabled || optionDisabled) {return;}

    if (!isControlled) {
      setInternalValue(optionValue);
    }

    onChange?.(optionValue);
  };

  const classes = [
    'toggle',
    `toggle--${size}`,
    `toggle--${variant}`,
    fullWidth && 'toggle--full-width',
    disabled && 'toggle--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tablist">
      {options.map((option) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;

        const buttonClasses = [
          'toggle__option',
          isSelected && 'toggle__option--selected',
          isDisabled && 'toggle__option--disabled',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={option.value}
            type="button"
            className={buttonClasses}
            onClick={() => handleSelect(option.value, option.disabled)}
            disabled={isDisabled}
            role="tab"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
          >
            {option.icon && <span className="toggle__icon">{option.icon}</span>}
            <span className="toggle__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
