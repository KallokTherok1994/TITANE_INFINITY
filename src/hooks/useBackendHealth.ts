// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — BACKEND HEALTH MONITOR HOOK
// UI vΩ Phase F: Mode Dégradé Local-First
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { tauriClient } from '@/lib/tauriClient';
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
  | 'ollama-remote-unavailable'
  | 'network-error'
  | 'unknown-error';

export type OllamaEndpointKind =
  | 'local_loopback'
  | 'remote_cloudflare'
  | 'custom_remote'
  | 'not_checked';

export type OllamaConfigSource = 'runtime_persisted' | 'env' | 'default' | 'not_checked';

export type OllamaHealth = 'healthy' | 'degraded' | 'offline' | 'not_checked';

export interface OllamaHealthDetails {
  url: string;
  model: string;
  endpointKind: OllamaEndpointKind;
  endpointSource: OllamaConfigSource;
  modelSource: OllamaConfigSource;
  networkUsed: boolean;
  health: OllamaHealth;
}

/**
 * État complet du backend
 */
export interface BackendHealthState {
  /** Status du backend Tauri (Rust) */
  tauriStatus: BackendServiceStatus;

  /** Status du backend Ollama (local) */
  ollamaStatus: BackendServiceStatus;

  /** Détails runtime d'Ollama */
  ollamaDetails: OllamaHealthDetails;

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
  ollamaDetails: OllamaHealthDetails;
  lastCheck: number;
}

const DEFAULT_OLLAMA_HEALTH_DETAILS: OllamaHealthDetails = {
  url: 'not_checked',
  model: 'not_checked',
  endpointKind: 'not_checked',
  endpointSource: 'not_checked',
  modelSource: 'not_checked',
  networkUsed: false,
  health: 'not_checked',
};

const INITIAL_SHARED_SNAPSHOT: SharedBackendSnapshot = {
  tauriStatus: 'unknown',
  ollamaStatus: 'unknown',
  ollamaDetails: DEFAULT_OLLAMA_HEALTH_DETAILS,
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
  checkOllamaHealth: () => Promise<{ available: boolean; details: OllamaHealthDetails }>
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
    const [tauriAvailable, ollamaResult] = await Promise.all([
      checkTauriHealth(),
      checkOllamaHealth(),
    ]);

    if (sessionAtStart !== sharedSessionId) {
      return;
    }

    sharedSnapshot = {
      tauriStatus: tauriAvailable ? 'available' : 'unavailable',
      ollamaStatus: ollamaResult.available ? 'available' : 'unavailable',
      ollamaDetails: ollamaResult.details,
      lastCheck: Date.now(),
    };

    logger.info('[BackendHealth] ✅ Health check complete', {
      tauri: tauriAvailable,
      ollama: ollamaResult.available,
      ollamaEndpointKind: ollamaResult.details.endpointKind,
    });

    emitSharedSnapshot();
  })().finally(() => {
    sharedCheckPromise = null;
  });

  return sharedCheckPromise;
}

function startSharedPolling(
  checkTauriHealth: () => Promise<boolean>,
  checkOllamaHealth: () => Promise<{ available: boolean; details: OllamaHealthDetails }>
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
  const [ollamaDetails, setOllamaDetails] = useState<OllamaHealthDetails>(
    sharedSnapshot.ollamaDetails
  );
  const [lastCheck, setLastCheck] = useState<number>(sharedSnapshot.lastCheck);

  const normalizeOllamaDetails = useCallback((raw: unknown): OllamaHealthDetails => {
    if (!raw || typeof raw !== 'object') {
      return DEFAULT_OLLAMA_HEALTH_DETAILS;
    }

    const payload = raw as Record<string, unknown>;
    const content =
      typeof payload.ok === 'boolean' && payload.content && typeof payload.content === 'object'
        ? (payload.content as Record<string, unknown>)
        : payload;

    const endpointKind =
      content.endpoint_kind === 'local_loopback' ||
      content.endpoint_kind === 'remote_cloudflare' ||
      content.endpoint_kind === 'custom_remote'
        ? (content.endpoint_kind as OllamaEndpointKind)
        : 'not_checked';

    const endpointSource =
      content.endpoint_source === 'runtime_persisted' ||
      content.endpoint_source === 'env' ||
      content.endpoint_source === 'default'
        ? (content.endpoint_source as OllamaConfigSource)
        : 'not_checked';

    const modelSource =
      content.model_source === 'runtime_persisted' ||
      content.model_source === 'env' ||
      content.model_source === 'default'
        ? (content.model_source as OllamaConfigSource)
        : 'not_checked';

    const health =
      content.health === 'healthy' ||
      content.health === 'degraded' ||
      content.health === 'offline'
        ? (content.health as OllamaHealth)
        : 'not_checked';

    return {
      url: typeof content.url === 'string' ? content.url : 'not_checked',
      model: typeof content.model === 'string' ? content.model : 'not_checked',
      endpointKind,
      endpointSource,
      modelSource,
      networkUsed: Boolean(content.network_used),
      health,
    };
  }, []);

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
  const checkOllamaHealth = useCallback(async (): Promise<{
    available: boolean;
    details: OllamaHealthDetails;
  }> => {
    try {
      const rawStatus = await Promise.race([
        tauriClient.aiCheckOllamaStatus(),
        new Promise<unknown>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), CHECK_TIMEOUT)
        ),
      ]);

      const details = normalizeOllamaDetails(rawStatus);
      const available = details.health !== 'not_checked'
        ? details.health !== 'offline'
        : Boolean((rawStatus as { available?: unknown })?.available);

      return { available, details };
    } catch (tauriError) {
      logger.warn('[BackendHealth] Ollama tauri status check failed, using provider fallback', {
        error: tauriError,
      });

      try {
        const available = await Promise.race([
          ollamaProvider.isAvailable(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), CHECK_TIMEOUT)
          ),
        ]);

        return {
          available,
          details: {
            ...DEFAULT_OLLAMA_HEALTH_DETAILS,
            health: available ? 'healthy' : 'offline',
          },
        };
      } catch (error) {
        logger.warn('[BackendHealth] Ollama check failed', { error });
        return {
          available: false,
          details: {
            ...DEFAULT_OLLAMA_HEALTH_DETAILS,
            health: 'offline',
          },
        };
      }
    }
  }, [normalizeOllamaDetails]);

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
      setOllamaDetails(snapshot.ollamaDetails);
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
  } else if (tauriStatus === 'available' && ollamaStatus === 'unavailable') {
    unavailableReason = ollamaDetails.networkUsed
      ? 'ollama-remote-unavailable'
      : 'ollama-offline';
  }

  return {
    tauriStatus,
    ollamaStatus,
    ollamaDetails,
    anyBackendAvailable,
    allBackendsDown,
    unavailableReason,
    lastCheck,
    recheckHealth,
  };
}
