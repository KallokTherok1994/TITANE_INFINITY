/**
 * TITANE∞ v26.2.0 — Auto-Timeout Hook
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 *
 * Hook pour arrêter automatiquement les opérations longues
 * (enregistrement audio, dictation, mode audio conversation, etc.)
 */

import { useEffect, useRef } from 'react';

interface UseAutoTimeoutOptions {
  /** ID pour logging */
  id: string;
  /** Timeouts en millisecondes */
  timeoutMs: number;
  /** Si true, le timeout est actif */
  isActive: boolean;
  /** Callback appelé quand le timeout expire */
  onTimeout: () => void;
  /** Niveau de développement */
  isDev?: boolean;
}

/**
 * Hook pour auto-arrêter une opération après un délai
 *
 * @example
 * const [isRecording, setIsRecording] = useState(false);
 *
 * useAutoTimeout({
 *   id: 'audio-record',
 *   timeoutMs: 5 * 60 * 1000, // 5 minutes
 *   isActive: isRecording,
 *   onTimeout: () => {
 *     console.log('Enregistrement arrêté automatiquement');
 *     setIsRecording(false);
 *   },
 * });
 */
export function useAutoTimeout({
  id,
  timeoutMs,
  isActive,
  onTimeout,
  isDev = false,
}: UseAutoTimeoutOptions): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Arrêter le timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Si pas actif, rien à faire
    if (!isActive) {
      startTimeRef.current = null;
      return;
    }

    // Enregistrer le temps de démarrage
    startTimeRef.current = Date.now();

    // Créer le timeout
    timeoutRef.current = setTimeout(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const elapsedSec = Math.round(elapsed / 1000);

      if (isDev) {
        console.warn(
          `[useAutoTimeout] Auto-stop "${id}" après ${elapsedSec}s (max: ${Math.round(timeoutMs / 1000)}s)`
        );
      }

      onTimeout();
      timeoutRef.current = null;
    }, timeoutMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, timeoutMs, onTimeout, id, isDev]);
}

/**
 * Hook pour obtenir le temps écoulé d'une opération active
 * Útile pour afficher une barre de progression ou un compteur
 *
 * @example
 * const [isRecording, setIsRecording] = useState(false);
 * const elapsed = useElapsedTime(isRecording);
 *
 * // Afficher: 1:23 (1 minute 23 secondes)
 * const minutes = Math.floor(elapsed / 60);
 * const seconds = elapsed % 60;
 */
export function useElapsedTime(
  isActive: boolean,
  updateIntervalMs: number = 1000
): number {
  const [elapsed, setElapsed] = React.useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsedMs = now - startTimeRef.current;
        setElapsed(Math.round(elapsedMs / 1000));
      }
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [isActive, updateIntervalMs]);

  return elapsed;
}

// Fonction utilitaire pour formater le temps
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// Import React pour le hook
import React from 'react';
