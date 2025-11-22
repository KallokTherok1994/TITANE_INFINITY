// TITANE∞ v17.1 - Switch Component - Design System
import { useState } from 'react';
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

export const Switch = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = '',
}: SwitchProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleToggle = () => {
    if (disabled) {return;}
    
    const newChecked = !checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const classes = [
    'switch',
    `switch--${size}`,
    checked && 'switch--checked',
    disabled && 'switch--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input
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
};
