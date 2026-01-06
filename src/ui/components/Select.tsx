/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Select Component with Performance Optimizations
import { useState, useRef, useEffect, useCallback, useMemo, useId, memo } from 'react';
import { clsx } from 'clsx';
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

/**
 * Select component for dropdown selection.
 * Memoized for optimal re-render performance.
 */
export const Select = memo(function Select({
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
  className,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectId = useId();
  const errorId = useId();
  const helperId = useId();

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const selectedOption = useMemo(
    () => options.find(opt => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(
    () =>
      searchable && searchQuery
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : options,
    [searchable, searchQuery, options]
  );

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (disabled) return;

      if (!isControlled) {
        setInternalValue(optionValue);
      }

      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
      setFocusedIndex(-1);
    },
    [disabled, isControlled, onChange]
  );

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    if (!isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [disabled, isOpen, searchable]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

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
    },
    [disabled, isOpen, focusedIndex, filteredOptions, handleSelect]
  );

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
      const optionElement = document.getElementById(`${selectId}-option-${focusedIndex}`);
      optionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, selectId]);

  const classes = useMemo(
    () =>
      clsx(
        'select',
        `select--${size}`,
        disabled && 'select--disabled',
        error && 'select--error',
        isOpen && 'select--open',
        className
      ),
    [size, disabled, error, isOpen, className]
  );

  return (
    <div className={classes} ref={selectRef}>
      {label && (
        <label className="select__label" htmlFor={selectId}>
          {label}
        </label>
      )}

      <div
        id={selectId}
        className="select__trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
      >
        <span
          className={clsx('select__value', !selectedOption && 'select__value--placeholder')}
        >
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className="select__arrow"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                aria-label="Rechercher dans la liste"
              />
            </div>
          )}

          <div className="select__options" role="listbox" aria-labelledby={selectId}>
            {filteredOptions.length === 0 ? (
              <div className="select__empty">Aucun résultat</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  id={`${selectId}-option-${index}`}
                  className={clsx(
                    'select__option',
                    option.value === value && 'select__option--selected',
                    index === focusedIndex && 'select__option--focused',
                    option.disabled && 'select__option--disabled'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                >
                  {option.label}
                  {option.value === value && (
                    <svg
                      className="select__check"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="select__error" id={errorId} role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="select__helper" id={helperId}>
          {helperText}
        </span>
      )}
    </div>
  );
});
