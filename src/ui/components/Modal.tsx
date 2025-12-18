/**
 * TITANE∞ v19 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v19 - Modal Component with Focus Trap (WCAG 2.1 compliant)
import { ReactNode, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../Icons';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Element to return focus to when modal closes */
  returnFocusRef?: React.RefObject<HTMLElement>;
  /** Auto-focus first focusable element (default: true) */
  autoFocus?: boolean;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  returnFocusRef,
  autoFocus = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Store previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
    }
  }, [isOpen]);

  // Focus trap handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !modalRef.current) return;

      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Handle Tab key for focus trap
      if (e.key === 'Tab') {
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) {
          e.preventDefault();
          return;
        }

        // Shift+Tab from first element -> focus last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // Tab from last element -> focus first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  // Setup event listeners and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Auto-focus first focusable element or close button
      if (autoFocus) {
        requestAnimationFrame(() => {
          const focusableElements =
            modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            if (firstElement) {
              firstElement.focus();
            }
          }
        });
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, autoFocus]);

  // Return focus when modal closes
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      // Prefer returnFocusRef if provided
      const elementToFocus = returnFocusRef?.current || previousActiveElement.current;
      if (elementToFocus instanceof HTMLElement) {
        elementToFocus.focus();
      }
      previousActiveElement.current = null;
    }
  }, [isOpen, returnFocusRef]);

  if (!isOpen) {
    return null;
  }

  const classes = ['modal__content', `modal__content--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="modal__overlay" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={classes}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="modal__header">
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Fermer"
              type="button"
            >
              <Icons.Close />
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};
