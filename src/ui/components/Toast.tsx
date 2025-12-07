/**
 * TITANE∞ v19 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v19 - Toast Notification Component
import { useEffect, useCallback, ReactNode } from 'react';
import './Toast.css';

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastProps {
  id: string;
  variant?: ToastVariant;
  title?: string;
  message: string | ReactNode;
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
  icon?: ReactNode;
  onClose?: (id: string) => void;
  className?: string;
}

export const Toast = ({
  id,
  variant = 'default',
  title,
  message,
  duration = 5000,
  closable = true,
  icon,
  onClose,
  className = '',
}: ToastProps) => {
  const handleClose = useCallback(() => {
    onClose?.(id);
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      handleClose();
    }
  };

  const classes = ['toast', `toast--${variant}`, className].filter(Boolean).join(' ');

  const defaultIcons: Record<ToastVariant, string> = {
    success: '✓',
    warning: '⚠',
    danger: '✕',
    info: 'ℹ',
    default: '●',
  };

  return (
    <div className={classes} role="alert" aria-live="polite" aria-atomic="true">
      <div className="toast__icon">{icon || defaultIcons[variant]}</div>
      <div className="toast__content">
        {title && <div className="toast__title">{title}</div>}
        <div className="toast__message">{message}</div>
      </div>
      {closable && (
        <button
          className="toast__close"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          aria-label="Fermer la notification"
          tabIndex={0}
        >
          ×
        </button>
      )}
      {duration > 0 && (
        <div className="toast__progress" style={{ animationDuration: `${duration}ms` }} />
      )}
    </div>
  );
};

// Toast Container for managing multiple toasts
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
  onRemove: (id: string) => void;
}

export const ToastContainer = ({
  toasts,
  position = 'top-right',
  onRemove,
}: ToastContainerProps) => {
  const classes = ['toast-container', `toast-container--${position}`].join(' ');

  return (
    <div className={classes} aria-label="Notifications">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
};

// Hook for toast management
export interface ToastState {
  id: string;
  variant?: ToastVariant;
  title?: string;
  message: string | ReactNode;
  duration?: number;
}

let toastCounter = 0;

export const createToastId = (): string => {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
};
