/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — USE CONNECTION HOOK (REFACTORED)
 * Hook React pour monitoring status providers IA temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { tauriClient, type ProviderStatus } from '../services/tauriClient';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import { logger } from '@/lib/logger';

export type ConnectionState =
  | 'CHECKING' // active probe in progress
  | 'ONLINE' // at least one non-local provider reachable
  | 'PARTIAL' // some non-local providers unreachable, others OK
  | 'LOCAL_ONLY' // no non-local providers reachable; local fallback active
  | 'OFFLINE'; // no providers available at all

export interface ConnectionStatus {
  online: boolean;
  lastCheck: number;
  provider: string; // gemini | ollama | local | none
  availableProviders: ProviderStatus[];
  latency: number;
}

export interface UseConnectionReturn {
  status: ConnectionStatus;
  isChecking: boolean;
  /** Granular connection state — replaces reasoning over `online: boolean` */
  connectionState: ConnectionState;
  checkConnection: () => Promise<boolean>;
  getProvidersStatus: () => Promise<ProviderStatus[]>;
}

export function deriveConnectionState(
  isChecking: boolean,
  providers: ProviderStatus[]
): ConnectionState {
  if (isChecking) return 'CHECKING';
  const nonLocal = providers.filter(p => p.provider !== 'local');
  const nonLocalUp = nonLocal.filter(p => p.available);
  if (nonLocalUp.length > 0) {
    return nonLocalUp.length === nonLocal.length ? 'ONLINE' : 'PARTIAL';
  }
  if (providers.some(p => p.available)) return 'LOCAL_ONLY';
  return 'OFFLINE';
}

export function useConnection(): UseConnectionReturn {
  const [status, setStatus] = useState<ConnectionStatus>({
    online: false,
    lastCheck: 0,
    provider: 'local',
    availableProviders: [],
    latency: 0,
  });

  const [isChecking, setIsChecking] = useState(false);
  const mountedRef = useRef(true);
  const checkInFlightRef = useRef<Promise<boolean> | null>(null);

  /**
   * Vérifie le statut de tous les providers
   */
  const checkConnection = useCallback(async () => {
    if (checkInFlightRef.current) {
      return checkInFlightRef.current;
    }

    const startTime = Date.now();

    const request = (async () => {
      if (mountedRef.current) {
        setIsChecking(true);
      }

      try {
        // Récupère le statut de tous les providers via Tauri
        const providers = await tauriClient.chatCheckProviders();
        const latency = Date.now() - startTime;

        // Trouve le premier provider disponible (cascade: gemini → ollama → local)
        const availableProvider = providers.find(p => {
          if (!p) return false;
          return p.available;
        });
        const online = providers.some(p => {
          if (!p) return false;
          return p.available && p.provider !== 'local';
        });

        if (mountedRef.current) {
          setStatus({
            online,
            lastCheck: Date.now(),
            provider: availableProvider?.provider ?? 'none',
            availableProviders: providers,
            latency,
          });
        }

        if (import.meta.env.DEV) {
          logger.debug('Connection check complete', {
            component: 'Connection',
            providersCount: providers.length,
            bestProvider: availableProvider?.provider ?? 'none',
            latency,
          });
        }

        return online;
      } catch (err) {
        logger.error('Connection check error', { component: 'Connection' }, err as Error);

        // Honest failure state: do not invent a healthy local provider when backend truth is unavailable.
        if (mountedRef.current) {
          setStatus({
            online: false,
            lastCheck: Date.now(),
            provider: 'none',
            availableProviders: [],
            latency: 0,
          });
        }

        return false;
      } finally {
        checkInFlightRef.current = null;
        if (mountedRef.current) {
          setIsChecking(false);
        }
      }
    })();

    checkInFlightRef.current = request;
    return request;
  }, []);

  /**
   * Récupère le statut des providers sans re-check (cache)
   */
  const getProvidersStatus = useCallback(async () => {
    try {
      const providers = await tauriClient.chatGetProvidersStatus();

      // Mise à jour partielle du status
      setStatus(prev => ({
        ...prev,
        availableProviders: providers,
      }));

      return providers;
    } catch (err) {
      logger.error(
        'Failed to get providers status',
        { component: 'Connection' },
        err as Error
      );
      return status.availableProviders;
    }
  }, [status.availableProviders]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      checkInFlightRef.current = null;
    };
  }, []);

  // Auto-check on mount
  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  // Auto-check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void checkConnection();
    }, REFRESH_INTERVALS.SLOW);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Granular connection state — derived from existing state, zero new network calls.
  // Replaces reasoning over `online: boolean` with explicit, observable states.
  const connectionState = useMemo<ConnectionState>(() => {
    return deriveConnectionState(isChecking, status.availableProviders);
  }, [isChecking, status.availableProviders]);

  return {
    status,
    isChecking,
    connectionState,
    checkConnection,
    getProvidersStatus,
  };
}
