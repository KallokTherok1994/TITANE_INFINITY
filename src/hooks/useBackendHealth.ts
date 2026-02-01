// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — BACKEND HEALTH MONITOR HOOK
// UI vΩ Phase F: Mode Dégradé Local-First
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { tauriChatProvider } from '@/services/ai/providers/tauriChat';
import { ollamaProvider } from '@/services/ai/providers/ollama';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Status d'un backend service
 */
export type BackendServiceStatus = 'available' | 'unavailable' | 'checking' | 'unknown';

/**
 * Raison de l'indisponibilité
 */
export type BackendUnavailableReason =
  | 'tauri-backend-down'
  | 'ollama-offline'
  | 'network-error'
  | 'unknown-error';

/**
 * État complet du backend
 */
export interface BackendHealthState {
  /** Status du backend Tauri (Rust) */
  tauriStatus: BackendServiceStatus;

  /** Status du backend Ollama (local) */
  ollamaStatus: BackendServiceStatus;

  /** Au moins un backend disponible? */
  anyBackendAvailable: boolean;

  /** Tous les backends down? */
  allBackendsDown: boolean;

  /** Raison principale de l'indisponibilité */
  unavailableReason?: BackendUnavailableReason;

  /** Timestamp du dernier check (ms) */
  lastCheck: number;

  /** Fonction pour forcer un recheck */
  recheckHealth: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

/** Intervalle de vérification santé (30s) */
const HEALTH_CHECK_INTERVAL = 30000;

/** Timeout pour chaque check individuel (5s) */
const CHECK_TIMEOUT = 5000;

// ─────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────

/**
 * Hook pour surveiller la santé des backends (Tauri + Ollama)
 *
 * @usage
 * ```tsx
 * const { tauriStatus, ollamaStatus, allBackendsDown, recheckHealth } = useBackendHealth();
 *
 * if (allBackendsDown) {
 *   return <ChatFallback reason="backend-down" />;
 * }
 * ```
 */
export function useBackendHealth(): BackendHealthState {
  const [tauriStatus, setTauriStatus] = useState<BackendServiceStatus>('unknown');
  const [ollamaStatus, setOllamaStatus] = useState<BackendServiceStatus>('unknown');
  const [lastCheck, setLastCheck] = useState<number>(0);

  /**
   * Vérifie la santé du backend Tauri
   */
  const checkTauriHealth = useCallback(async (): Promise<boolean> => {
    try {
      const available = await Promise.race([
        tauriChatProvider.isAvailable(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), CHECK_TIMEOUT)
        ),
      ]);

      return available;
    } catch (error) {
      logger.warn('[BackendHealth] Tauri check failed', { error });
      return false;
    }
  }, []);

  /**
   * Vérifie la santé du backend Ollama
   */
  const checkOllamaHealth = useCallback(async (): Promise<boolean> => {
    try {
      const available = await Promise.race([
        ollamaProvider.isAvailable(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), CHECK_TIMEOUT)
        ),
      ]);

      return available;
    } catch (error) {
      logger.warn('[BackendHealth] Ollama check failed', { error });
      return false;
    }
  }, []);

  /**
   * Vérifie tous les backends en parallèle
   */
  const checkAllBackends = useCallback(async (): Promise<void> => {
    setTauriStatus('checking');
    setOllamaStatus('checking');

    logger.debug('[BackendHealth] 🔍 Checking all backends...');

    const [tauriAvailable, ollamaAvailable] = await Promise.all([
      checkTauriHealth(),
      checkOllamaHealth(),
    ]);

    setTauriStatus(tauriAvailable ? 'available' : 'unavailable');
    setOllamaStatus(ollamaAvailable ? 'available' : 'unavailable');
    setLastCheck(Date.now());

    logger.info('[BackendHealth] ✅ Health check complete', {
      tauri: tauriAvailable,
      ollama: ollamaAvailable,
    });
  }, [checkTauriHealth, checkOllamaHealth]);

  /**
   * Force un recheck immédiat
   */
  const recheckHealth = useCallback(async (): Promise<void> => {
    logger.info('[BackendHealth] 🔄 Manual recheck triggered');
    await checkAllBackends();
  }, [checkAllBackends]);

  // ─────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Check initial
    void checkAllBackends();

    // Polling périodique
    const interval = setInterval(() => {
      void checkAllBackends();
    }, HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAllBackends]);

  // ─────────────────────────────────────────────────────────────────
  // COMPUTED STATE
  // ─────────────────────────────────────────────────────────────────

  const anyBackendAvailable = tauriStatus === 'available' || ollamaStatus === 'available';
  const allBackendsDown = tauriStatus === 'unavailable' && ollamaStatus === 'unavailable';

  let unavailableReason: BackendUnavailableReason | undefined;

  if (allBackendsDown) {
    if (tauriStatus === 'unavailable' && ollamaStatus === 'unavailable') {
      unavailableReason = 'ollama-offline';
    } else if (tauriStatus === 'unavailable') {
      unavailableReason = 'tauri-backend-down';
    } else {
      unavailableReason = 'unknown-error';
    }
  }

  return {
    tauriStatus,
    ollamaStatus,
    anyBackendAvailable,
    allBackendsDown,
    unavailableReason,
    lastCheck,
    recheckHealth,
  };
}
