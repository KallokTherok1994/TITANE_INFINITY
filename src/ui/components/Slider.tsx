// TITANE∞ v17.1 - Slider Component - Design System
import React, { useState, useRef, useEffect } from 'react';
import './Slider.css';

export interface SliderMark {
  value: number;
  label?: string;
}

interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  showMarks?: boolean;
  marks?: SliderMark[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Slider = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeCommitted,
  disabled = false,
  label,
  showValue = true,
  showMarks = false,
  marks = [],
  size = 'md',
  className = '',
}: SliderProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!sliderRef.current || disabled) {return;}

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percent * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (!isControlled) {
      setInternalValue(clampedValue);
    }

    onChange?.(clampedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) {return;}
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onChangeCommitted?.(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {return;}

    let newValue = value;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(min, value - step);
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // Event listeners for mouse drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, value]);

  const classes = [
    'slider',
    `slider--${size}`,
    isDragging && 'slider--dragging',
    disabled && 'slider--disabled',
    className,
  ].filter(Boolean).join(' ');

  const displayMarks: SliderMark[] = showMarks ? (marks.length > 0 ? marks : generateAutoMarks(min, max, step)) : [];

  return (
    <div className={classes}>
      {label && (
        <div className="slider__header">
          <label className="slider__label">{label}</label>
          {showValue && <span className="slider__value">{value}</span>}
        </div>
      )}

      <div
        ref={sliderRef}
        className="slider__track-wrapper"
        onMouseDown={handleMouseDown}
      >
        <div className="slider__track">
          <div className="slider__fill" style={{ width: `${percentage}%` }} />
        </div>

        <div
          className="slider__thumb"
          style={{ left: `${percentage}%` }}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
        />

        {displayMarks.length > 0 && (
          <div className="slider__marks">
            {displayMarks.map((mark) => {
              const markPercent = ((mark.value - min) / (max - min)) * 100;
              return (
                <div
                  key={mark.value}
                  className="slider__mark"
                  style={{ left: `${markPercent}%` }}
                >
                  <div className="slider__mark-dot" />
                  {mark.label && <span className="slider__mark-label">{mark.label}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function generateAutoMarks(min: number, max: number, step: number): SliderMark[] {
  const marks: SliderMark[] = [];
  for (let i = min; i <= max; i += step * 10) {
    marks.push({ value: i });
  }
  if (marks[marks.length - 1]?.value !== max) {
    marks.push({ value: max });
  }
  return marks;
}
