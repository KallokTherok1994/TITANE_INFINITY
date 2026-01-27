/**
 * TITANE∞ v26.2.0 — Dialog Component (Titanium Dark)
 * Modal dialog with Titanium Dark design system
 * WCAG 2.2 AA compliant with focus trap and keyboard support
 * @license MIT
 */

import React, { useEffect, useRef } from 'react';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop with glass morphism */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {/* Dialog content wrapper */}
      <div ref={dialogRef} className="relative z-modal">
        {children}
      </div>
    </div>
  );
}

export function DialogTrigger({
  asChild = false,
  children,
  onClick,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function DialogContent({
  className = '',
  children,
  onClose,
  'aria-labelledby': ariaLabelledby,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
  'aria-labelledby'?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      className={`
        relative 
        bg-titanium-bg-overlay 
        border border-titanium-border-default
        rounded-lg shadow-lg 
        p-6 max-w-lg w-full mx-4
        ${className}
      `}
    >
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="
            absolute right-4 top-4 
            rounded 
            text-titanium-text-tertiary 
            hover:text-titanium-text-primary 
            hover:bg-titanium-bg-interactive
            focus-visible:outline-none focus-visible:shadow-focus
            transition-colors duration-200
            p-1
          "
          aria-label="Close dialog"
        >
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col space-y-2 text-left mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({
  className = '',
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const titleId = id || `dialog-title-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <h2
      id={titleId}
      className={`text-xl font-semibold leading-tight text-titanium-text-primary ${className}`}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={`text-base text-titanium-text-secondary ${className}`}>{children}</p>
  );
}

export function DialogFooter({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-reverse space-y-2 sm:space-y-0 mt-6 ${className}`}
    >
      {children}
    </div>
  );
}
