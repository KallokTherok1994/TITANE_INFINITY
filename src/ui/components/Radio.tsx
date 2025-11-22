// TITANE∞ v17.1 - Radio Component - Design System
import React, { useState } from 'react';
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

export const Radio = ({
  value,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  name,
  className = '',
}: RadioProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = () => {
    if (disabled) {return;}
    
    if (!isControlled) {
      setInternalChecked(true);
    }
    
    onChange?.(value);
  };

  const classes = [
    'radio',
    `radio--${size}`,
    checked && 'radio--checked',
    disabled && 'radio--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input
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
};

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

export const RadioGroup = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  name,
  disabled = false,
  size = 'md',
  children,
  className = '',
}: RadioGroupProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className={`radio-group ${className}`} role="radiogroup">
      {React.Children.map(children, (child) => {
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
};
