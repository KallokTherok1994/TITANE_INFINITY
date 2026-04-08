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
  | 'all-backends-down'
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

interface SharedBackendSnapshot {
  tauriStatus: BackendServiceStatus;
  ollamaStatus: BackendServiceStatus;
  lastCheck: number;
}

const INITIAL_SHARED_SNAPSHOT: SharedBackendSnapshot = {
  tauriStatus: 'unknown',
  ollamaStatus: 'unknown',
  lastCheck: 0,
};

let sharedSnapshot: SharedBackendSnapshot = INITIAL_SHARED_SNAPSHOT;
let sharedInterval: ReturnType<typeof setInterval> | null = null;
let sharedCheckPromise: Promise<void> | null = null;
let sharedSubscriberCount = 0;
let sharedSessionId = 0;
const snapshotListeners = new Set<(snapshot: SharedBackendSnapshot) => void>();

function emitSharedSnapshot(): void {
  snapshotListeners.forEach(listener => listener(sharedSnapshot));
}

async function runSharedHealthCheck(
  checkTauriHealth: () => Promise<boolean>,
  checkOllamaHealth: () => Promise<boolean>
): Promise<void> {
  if (sharedCheckPromise) {
    return sharedCheckPromise;
  }

  const sessionAtStart = sharedSessionId;

  sharedSnapshot = {
    ...sharedSnapshot,
    tauriStatus: 'checking',
    ollamaStatus: 'checking',
  };
  emitSharedSnapshot();

  logger.debug('[BackendHealth] 🔍 Checking all backends...');

  sharedCheckPromise = (async () => {
    const [tauriAvailable, ollamaAvailable] = await Promise.all([
      checkTauriHealth(),
      checkOllamaHealth(),
    ]);

    if (sessionAtStart !== sharedSessionId) {
      return;
    }

    sharedSnapshot = {
      tauriStatus: tauriAvailable ? 'available' : 'unavailable',
      ollamaStatus: ollamaAvailable ? 'available' : 'unavailable',
      lastCheck: Date.now(),
    };

    logger.info('[BackendHealth] ✅ Health check complete', {
      tauri: tauriAvailable,
      ollama: ollamaAvailable,
    });

    emitSharedSnapshot();
  })().finally(() => {
    sharedCheckPromise = null;
  });

  return sharedCheckPromise;
}

function startSharedPolling(
  checkTauriHealth: () => Promise<boolean>,
  checkOllamaHealth: () => Promise<boolean>
): void {
  if (!sharedInterval) {
    void runSharedHealthCheck(checkTauriHealth, checkOllamaHealth);
    sharedInterval = setInterval(() => {
      void runSharedHealthCheck(checkTauriHealth, checkOllamaHealth);
    }, HEALTH_CHECK_INTERVAL);
  }
}

function stopSharedPolling(): void {
  if (sharedInterval) {
    clearInterval(sharedInterval);
    sharedInterval = null;
  }

  sharedSessionId += 1;
  sharedCheckPromise = null;
  sharedSnapshot = INITIAL_SHARED_SNAPSHOT;
}

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
  const [tauriStatus, setTauriStatus] = useState<BackendServiceStatus>(
    sharedSnapshot.tauriStatus
  );
  const [ollamaStatus, setOllamaStatus] = useState<BackendServiceStatus>(
    sharedSnapshot.ollamaStatus
  );
  const [lastCheck, setLastCheck] = useState<number>(sharedSnapshot.lastCheck);

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
    await runSharedHealthCheck(checkTauriHealth, checkOllamaHealth);
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
    const handleSnapshot = (snapshot: SharedBackendSnapshot) => {
      setTauriStatus(snapshot.tauriStatus);
      setOllamaStatus(snapshot.ollamaStatus);
      setLastCheck(snapshot.lastCheck);
    };

    snapshotListeners.add(handleSnapshot);
    sharedSubscriberCount += 1;
    handleSnapshot(sharedSnapshot);
    startSharedPolling(checkTauriHealth, checkOllamaHealth);

    return () => {
      snapshotListeners.delete(handleSnapshot);
      sharedSubscriberCount = Math.max(0, sharedSubscriberCount - 1);

      if (sharedSubscriberCount === 0) {
        stopSharedPolling();
      }
    };
  }, [checkOllamaHealth, checkTauriHealth]);

  // ─────────────────────────────────────────────────────────────────
  // COMPUTED STATE
  // ─────────────────────────────────────────────────────────────────

  const anyBackendAvailable = tauriStatus === 'available' || ollamaStatus === 'available';
  const allBackendsDown = tauriStatus === 'unavailable' && ollamaStatus === 'unavailable';

  let unavailableReason: BackendUnavailableReason | undefined;

  if (allBackendsDown) {
    unavailableReason = 'all-backends-down';
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
