/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 7: Toast Container Component
 * Affichage toast notifications
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { Notification } from '../../lib/notificationSystem';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from '../icons';

interface Toast extends Notification {
  exiting?: boolean;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>;
      const notification = customEvent.detail;

      const toast: Toast = { ...notification };
      setToasts(prev => [...prev, toast]);

      // Auto-dismiss après 5s (8s si critique)
      const duration = notification.priority === 'critical' ? 8000 : 5000;
      setTimeout(() => {
        dismissToast(toast.id);
      }, duration);
    };

    window.addEventListener('notification-toast', handleToast);
    return () => window.removeEventListener('notification-toast', handleToast);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true } : t)));

    // Supprimer après animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColor = (
    type: Notification['type'],
    priority: Notification['priority']
  ): string => {
    if (priority === 'critical') {
      return 'bg-red-600 text-white border-red-700';
    }

    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            rounded-lg border-2 p-4 shadow-lg transition-all duration-300
            ${getTypeColor(toast.type, toast.priority)}
            ${toast.exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
          `}
        >
          <div className="flex items-start gap-3">
            {getTypeIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1">{toast.title}</div>
              <div className="text-xs opacity-90">{toast.message}</div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';
