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

import { useState, useCallback, useEffect, useMemo } from 'react';
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

  /**
   * Vérifie le statut de tous les providers
   */
  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    const startTime = Date.now();

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

      setStatus({
        online,
        lastCheck: Date.now(),
        provider: availableProvider?.provider ?? 'none',
        availableProviders: providers,
        latency,
      });

      console.log(
        `🔗 Connection check: ${providers.length} providers, best: ${availableProvider?.provider ?? 'none'}`
      );

      return online;
    } catch (err) {
      logger.error('Connection check error', { component: 'Connection' }, err as Error);

      // Honest failure state: do not invent a healthy local provider when backend truth is unavailable.
      setStatus({
        online: false,
        lastCheck: Date.now(),
        provider: 'none',
        availableProviders: [],
        latency: 0,
      });

      return false;
    } finally {
      setIsChecking(false);
    }
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

  // Auto-check on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Auto-check every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkConnection, REFRESH_INTERVALS.SLOW);
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
