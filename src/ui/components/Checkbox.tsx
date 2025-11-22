// TITANE∞ v17.1 - Checkbox Component - Design System
import { useState } from 'react';
import './Checkbox.css';

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  className?: string;
}

export const Checkbox = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  size = 'md',
  label,
  error,
  className = '',
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {return;}
    
    const newChecked = e.target.checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);
  };

  const classes = [
    'checkbox',
    `checkbox--${size}`,
    checked && 'checkbox--checked',
    indeterminate && 'checkbox--indeterminate',
    disabled && 'checkbox--disabled',
    error && 'checkbox--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label className="checkbox__wrapper">
        <input
          type="checkbox"
          className="checkbox__input"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'checkbox-error' : undefined}
        />
        <span className="checkbox__box">
          {indeterminate ? (
            <svg className="checkbox__icon" viewBox="0 0 16 16" fill="none">
              <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : checked ? (
            <svg className="checkbox__icon" viewBox="0 0 16 16" fill="none">
              <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </span>
        {label && <span className="checkbox__label">{label}</span>}
      </label>
      {error && <span className="checkbox__error" id="checkbox-error">{error}</span>}
    </div>
  );
};
