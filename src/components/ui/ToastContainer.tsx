/**
 * TITANE∞ v26.2.0 — Toast Container & Manager (Titanium Dark)
 * Toast notification system with Titanium Dark design system
 * @license MIT
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Toast, type ToastType, type ToastProps as _ToastProps } from './Toast';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  maxToasts?: number;
}

const POSITION_CLASSES = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 3,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastData = { id, type, message, duration };

      setToasts(prev => {
        const updated = [...prev, newToast];
        // Keep only maxToasts, remove oldest
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      return id;
    },
    [maxToasts]
  );

  // Expose addToast globally for easy access
  useMemo(() => {
    if (typeof window !== 'undefined') {
      (
        window as Window & {
          __titaneToast?: Record<string, (msg: string, dur?: number) => void>;
        }
      ).__titaneToast = {
        default: (message: string, duration?: number) =>
          addToast('default', message, duration),
        info: (message: string, duration?: number) => addToast('info', message, duration),
        success: (message: string, duration?: number) =>
          addToast('success', message, duration),
        warning: (message: string, duration?: number) =>
          addToast('warning', message, duration),
        error: (message: string, duration?: number) =>
          addToast('error', message, duration),
      };
    }
  }, [addToast]);

  return (
    <div
      className={`
        fixed z-toast flex flex-col gap-2 
        pointer-events-none
        ${POSITION_CLASSES[position]}
      `}
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="pointer-events-auto flex flex-col gap-2 min-w-75 max-w-md">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

// Helper hook for easy toast usage
export const useToast = () => {
  return useMemo(() => {
    const w = window as Window & {
      __titaneToast?: Record<string, (msg: string, dur?: number) => void>;
    };
    if (typeof window !== 'undefined' && w.__titaneToast) {
      return w.__titaneToast;
    }
    // Fallback if container not mounted
    return {
      default: (message: string) => console.info('[Toast]', message),
      info: (message: string) => console.info('[Toast]', message),
      success: (message: string) => console.info('[Toast]', message),
      warning: (message: string) => console.warn('[Toast]', message),
      error: (message: string) => console.error('[Toast]', message),
    };
  }, []);
};

export default ToastContainer;
