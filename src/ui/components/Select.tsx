// TITANE∞ v17.1 - Select Component - Design System
import { useState, useRef, useEffect } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  className?: string;
}

export const Select = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  options,
  placeholder = 'Sélectionner...',
  disabled = false,
  error,
  label,
  helperText,
  size = 'md',
  searchable = false,
  className = '',
}: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const handleSelect = (optionValue: string) => {
    if (disabled) {return;}

    if (!isControlled) {
      setInternalValue(optionValue);
    }

    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) {return;}
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {return;}

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0) {
      const optionElement = document.getElementById(`select-option-${focusedIndex}`);
      optionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  const classes = [
    'select',
    `select--${size}`,
    disabled && 'select--disabled',
    error && 'select--error',
    isOpen && 'select--open',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={selectRef}>
      {label && <label className="select__label">{label}</label>}

      <div
        className="select__trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span className={`select__value ${!selectedOption ? 'select__value--placeholder' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className="select__arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {isOpen && (
        <div className="select__dropdown">
          {searchable && (
            <div className="select__search">
              <input
                ref={searchInputRef}
                type="text"
                className="select__search-input"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="select__options" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="select__empty">Aucun résultat</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  id={`select-option-${index}`}
                  className={`select__option ${option.value === value ? 'select__option--selected' : ''} ${index === focusedIndex ? 'select__option--focused' : ''} ${option.disabled ? 'select__option--disabled' : ''}`}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                >
                  {option.label}
                  {option.value === value && (
                    <svg className="select__check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <span className="select__error">{error}</span>}
      {!error && helperText && <span className="select__helper">{helperText}</span>}
    </div>
  );
};
