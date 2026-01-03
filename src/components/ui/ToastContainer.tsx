/**
 * TITANE∞ v26.2.3 — Toast Container & Manager
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Toast, type ToastType, type ToastProps } from './Toast';
import './ToastContainer.css';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

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
      (window as any).__titaneToast = {
        info: (message: string, duration?: number) => addToast('info', message, duration),
        success: (message: string, duration?: number) => addToast('success', message, duration),
        warning: (message: string, duration?: number) => addToast('warning', message, duration),
        error: (message: string, duration?: number) => addToast('error', message, duration),
      };
    }
  }, [addToast]);

  return (
    <div 
      className={`toast-container toast-container--${position}`}
      aria-live="polite"
      aria-atomic="false"
    >
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
  );
};

// Helper hook for easy toast usage
export const useToast = () => {
  return useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).__titaneToast) {
      return (window as any).__titaneToast;
    }
    // Fallback if container not mounted
    return {
      info: (message: string) => console.info('[Toast]', message),
      success: (message: string) => console.info('[Toast]', message),
      warning: (message: string) => console.warn('[Toast]', message),
      error: (message: string) => console.error('[Toast]', message),
    };
  }, []);
};

export default ToastContainer;
