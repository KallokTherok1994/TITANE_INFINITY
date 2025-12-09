/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — useAudioError Hook
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @file        useAudioError.ts
 * @version     v19.5.2+
 * @phase       Phase 3 — P1-8: Hook pour gestion des erreurs audio
 *
 * OBJECTIF:
 * - Hook React pour gérer l'état des erreurs audio
 * - Intégration avec AudioErrorModal
 * - Classification des erreurs natives (DOMException, MediaStreamError)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import type { AudioError, AudioErrorType } from '../components/audio/AudioErrorModal';

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

/**
 * Classifie une erreur native en AudioErrorType
 */
function classifyError(error: unknown): AudioErrorType {
  if (error instanceof DOMException) {
    // Permissions
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'PermissionDenied';
    }

    // Device not found
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'MicrophoneNotFound';
    }

    // Device busy
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'DeviceBusy';
    }

    // Audio context error
    if (error.name === 'InvalidStateError' || error.name === 'NotSupportedError') {
      return 'AudioContextFailed';
    }

    // Stream error
    if (error.name === 'AbortError' || error.name === 'OverconstrainedError') {
      return 'StreamError';
    }
  }

  // MediaStreamError (older browsers)
  if (error && typeof error === 'object' && 'name' in error) {
    const errorName = (error as { name: string }).name;
    if (errorName.includes('Permission')) return 'PermissionDenied';
    if (errorName.includes('NotFound')) return 'MicrophoneNotFound';
    if (errorName.includes('NotReadable')) return 'DeviceBusy';
  }

  return 'Unknown';
}

/**
 * Extrait le message d'erreur
 */
function extractErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return undefined;
}

// =============================================================================
// HOOK
// =============================================================================

export interface UseAudioErrorReturn {
  error: AudioError | null;
  isModalOpen: boolean;
  showError: (error: unknown, deviceLabel?: string) => void;
  clearError: () => void;
  closeModal: () => void;
}

export function useAudioError(): UseAudioErrorReturn {
  const [error, setError] = useState<AudioError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Affiche une erreur audio avec classification automatique
   */
  const showError = useCallback((rawError: unknown, deviceLabel?: string) => {
    const type = classifyError(rawError);
    const message = extractErrorMessage(rawError);

    const audioError: AudioError = {
      type,
      message,
      timestamp: Date.now(),
      deviceLabel,
    };

    setError(audioError);
    setIsModalOpen(true);

    console.error('[useAudioError] Audio error:', {
      type,
      message,
      deviceLabel,
      originalError: rawError,
    });
  }, []);

  /**
   * Efface l'erreur (garde la modal ouverte)
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Ferme la modal (et efface l'erreur)
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
  }, []);

  return {
    error,
    isModalOpen,
    showError,
    clearError,
    closeModal,
  };
}

export default useAudioError;
