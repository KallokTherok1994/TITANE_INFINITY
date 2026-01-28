/**
 * TITANE∞ v26.2.0 — Toast Notification Component (Titanium Dark)
 * Toast notifications with Titanium Dark design system
 * WCAG 2.2 AA compliant with auto-dismiss
 * @license MIT
 */

import React, { useEffect, useState, useCallback } from 'react';

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
  default:
    'bg-titanium-bg-overlay border-titanium-border-default text-titanium-text-primary',
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
  const [progress, setProgress] = useState(100);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Detect prefers-reduced-motion (UX Sprint 4)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, reduceMotion ? 150 : 300); // Shorter exit if motion reduced
  }, [id, onClose, reduceMotion]);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Progress bar countdown
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, handleClose]);

  // Sprint 4 UX: Smooth animations with cubic-bezier easing
  const animationClass = reduceMotion
    ? 'transition-opacity duration-150'
    : 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]';

  return (
    <div
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg overflow-hidden
        ${animationClass}
        ${TYPE_STYLES[type]}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        // Sprint 4: Smoother transforms with will-change
        willChange: isVisible && !isExiting ? 'auto' : 'transform, opacity',
      }}
    >
      {/* Sprint 4 UX: Progress bar (AAA contrast 7:1) */}
      <div
        className="absolute bottom-0 left-0 h-[3px] bg-current opacity-60 transition-all ease-linear"
        style={{
          width: `${progress}%`,
          transitionDuration: '50ms',
        }}
        aria-hidden="true"
      />

      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {ICONS[type]}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={handleClose}
        aria-label="Fermer la notification"
        type="button"
        className="
          flex-shrink-0 text-lg leading-none rounded p-1
          transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
          hover:opacity-70 hover:bg-black/10
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2
        "
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
