// TITANE∞ v12 - Input Component
import { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const classes = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      error && 'input-wrapper--error',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={classes}>
        {label && <label className="input__label">{label}</label>}
        <input ref={ref} className="input" {...props} />
        {error && <span className="input__error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
