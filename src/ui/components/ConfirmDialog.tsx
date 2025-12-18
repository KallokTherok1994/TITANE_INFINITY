/**
 * TITANE∞ v19 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v19 - ConfirmDialog Component
import { ReactNode, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../Icons';
import './ConfirmDialog.css';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'default';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string | ReactNode;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  variant = 'default',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmLoading = false,
  icon,
  className = '',
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, onCancel]
  );

  // Setup event listeners and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the cancel button by default (safer action)
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const overlayClasses = [
    'confirm-dialog__overlay',
    `confirm-dialog__overlay--${variant}`,
  ].join(' ');

  const contentClasses = [
    'confirm-dialog__content',
    `confirm-dialog__content--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const defaultIcons: Record<ConfirmVariant, ReactNode> = {
    danger: <span className="confirm-dialog__default-icon">⚠</span>,
    warning: <span className="confirm-dialog__default-icon">⚡</span>,
    info: <span className="confirm-dialog__default-icon">ℹ</span>,
    default: <span className="confirm-dialog__default-icon">?</span>,
  };

  const defaultIcon = defaultIcons[variant] ?? defaultIcons.default;

  return (
    <div className={overlayClasses} onClick={onCancel} role="presentation">
      <div
        ref={dialogRef}
        className={contentClasses}
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="confirm-dialog__header">
          <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}>
            {icon || defaultIcon}
          </div>
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>
          <button
            className="confirm-dialog__close"
            onClick={onCancel}
            aria-label="Fermer"
            tabIndex={0}
          >
            <Icons.Close />
          </button>
        </div>

        <div id="confirm-dialog-message" className="confirm-dialog__message">
          {message}
        </div>

        <div className="confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={onCancel}
            disabled={confirmLoading}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            className={`confirm-dialog__btn confirm-dialog__btn--confirm confirm-dialog__btn--${variant}`}
            onClick={onConfirm}
            disabled={confirmLoading}
          >
            {confirmLoading ? (
              <span className="confirm-dialog__loading">
                <span className="confirm-dialog__spinner" />
                Chargement...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
