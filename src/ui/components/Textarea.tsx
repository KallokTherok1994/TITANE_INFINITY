// TITANE∞ v17.1 - Textarea Component - Design System
import { useState, useRef, useEffect } from 'react';
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

export const Textarea = ({
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
  className = '',
}: TextareaProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (maxLength && newValue.length > maxLength) {return;}
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  // Auto-resize
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const classes = [
    'textarea',
    `textarea--${size}`,
    disabled && 'textarea--disabled',
    error && 'textarea--error',
    className,
  ].filter(Boolean).join(' ');

  const characterCount = maxLength ? `${value.length}/${maxLength}` : `${value.length}`;

  return (
    <div className={classes}>
      {label && <label className="textarea__label">{label}</label>}
      
      <div className="textarea__wrapper">
        <textarea
          ref={textareaRef}
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
          aria-describedby={error ? 'textarea-error' : helperText ? 'textarea-helper' : undefined}
        />
      </div>

      <div className="textarea__footer">
        <div className="textarea__footer-left">
          {error && <span className="textarea__error" id="textarea-error">{error}</span>}
          {!error && helperText && <span className="textarea__helper" id="textarea-helper">{helperText}</span>}
        </div>
        {(showCount || maxLength) && (
          <span className="textarea__count">{characterCount}</span>
        )}
      </div>
    </div>
  );
};
