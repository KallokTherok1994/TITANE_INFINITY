/**
 * TITANE∞ v26.2.0 — Toast Notification Component (Titanium Dark)
 * Toast notifications with Titanium Dark design system
 * WCAG 2.2 AA compliant with auto-dismiss
 * @license MIT
 */

import React, { useEffect, useState } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  default: 'ℹ️',
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const TYPE_STYLES: Record<ToastType, string> = {
  default: 'bg-titanium-bg-overlay border-titanium-border-default text-titanium-text-primary',
  info: 'bg-info-100 border-info-500/30 text-info-700',
  success: 'bg-success-100 border-success-500/30 text-success-700',
  warning: 'bg-warning-100 border-warning-500/30 text-warning-700',
  error: 'bg-error-100 border-error-500/30 text-error-700',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match exit animation duration
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        transition-all duration-300
        ${TYPE_STYLES[type]}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {ICONS[type]}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={handleClose}
        aria-label="Close notification"
        type="button"
        className="
          flex-shrink-0 text-lg leading-none
          hover:opacity-70 transition-opacity
          focus-visible:outline-none focus-visible:shadow-focus rounded
          p-1
        "
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
