/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Collapse Component with Performance Optimizations
import { ReactNode, useState, useCallback, useMemo, useId, memo } from 'react';
import { clsx } from 'clsx';
import { Icons } from '../Icons';
import './Collapse.css';

interface CollapseProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Collapse component for expandable/collapsible sections.
 * Memoized for optimal re-render performance.
 */
export const Collapse = memo(function Collapse({
  title,
  children,
  defaultOpen = false,
  disabled = false,
  className,
}: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const collapseId = useId();
  const contentId = useId();

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    },
    [disabled]
  );

  const classes = useMemo(
    () =>
      clsx(
        'collapse',
        isOpen && 'collapse--open',
        disabled && 'collapse--disabled',
        className
      ),
    [isOpen, disabled, className]
  );

  const iconClasses = useMemo(
    () => clsx('collapse__icon', isOpen && 'collapse__icon--open'),
    [isOpen]
  );

  return (
    <div className={classes}>
      <button
        id={collapseId}
        className="collapse__trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-disabled={disabled}
        disabled={disabled}
        type="button"
      >
        <span className="collapse__title">{title}</span>
        <span className={iconClasses} aria-hidden="true">
          <Icons.ChevronDown />
        </span>
      </button>
      {isOpen && (
        <div
          id={contentId}
          className="collapse__content"
          role="region"
          aria-labelledby={collapseId}
        >
          {children}
        </div>
      )}
    </div>
  );
});
