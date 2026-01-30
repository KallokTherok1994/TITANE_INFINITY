/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TOAST NOTIFICATIONS HOOK
 *   Hook pour afficher des notifications toast via Sonner
 * ═══════════════════════════════════════════════════════════════════
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions {
  duration?: number; // en ms, défaut 4000
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Hook pour afficher des notifications toast élégantes
 * Remplace les alert() par des notifications moins intrusives
 *
 * @example
 * const { showToast, success, error, info, warning } = useToast();
 *
 * // Utiliser les raccourcis
 * success('Fichier importé avec succès');
 * error('Erreur lors de la transcription');
 * info('Microphone détecté');
 * warning('Limite d\'enregistrement atteinte');
 *
 * // Ou utiliser showToast avec options
 * showToast({
 *   type: 'loading',
 *   message: 'Transcription en cours...',
 *   duration: Infinity
 * });
 */
export function useToast() {
  const showToast = useCallback(
    ({
      type,
      message,
      options = {},
    }: {
      type: ToastType;
      message: string;
      options?: ToastOptions;
    }) => {
      const { duration = 4000, description, action } = options;

      const toastId = toast[type](message, {
        description,
        duration,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      });

      return toastId;
    },
    []
  );

  // Raccourcis pratiques
  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast({ type: 'success', message, options }),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast({ type: 'error', message, options }),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast({ type: 'info', message, options }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast({ type: 'warning', message, options }),
    [showToast]
  );

  const loading = useCallback(
    (message: string, options?: ToastOptions) => {
      const toastId = showToast({ type: 'loading', message, options });

      // Retourner une fonction pour resolver/dismiss
      return {
        id: toastId,
        resolve: (resultMessage: string) => {
          toast.success(resultMessage, { id: toastId as any });
        },
        reject: (errorMessage: string) => {
          toast.error(errorMessage, { id: toastId as any });
        },
        dismiss: () => {
          toast.dismiss(toastId);
        },
      };
    },
    [showToast]
  );

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  return {
    showToast,
    success,
    error,
    info,
    warning,
    loading,
    dismissAll,
  };
}

export default useToast;
