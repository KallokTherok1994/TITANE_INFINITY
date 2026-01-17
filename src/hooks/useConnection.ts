/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 — USE CONNECTION HOOK (REFACTORED)
 * Hook React pour monitoring status providers IA temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { tauriClient, type ProviderStatus } from '../services/tauriClient';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import { logger } from '@/lib/logger';

export interface ConnectionStatus {
  online: boolean;
  lastCheck: number;
  provider: string; // gemini | ollama | local
  availableProviders: ProviderStatus[];
  latency: number;
}

export interface UseConnectionReturn {
  status: ConnectionStatus;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
  getProvidersStatus: () => Promise<ProviderStatus[]>;
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
        provider: availableProvider?.provider ?? 'local',
        availableProviders: providers,
        latency,
      });

      logger.debug(
        `🔗 Connection check: ${providers.length} providers, best: ${availableProvider?.provider ?? 'none'}`
      );

      return online;
    } catch (err) {
      logger.error('Connection check error', { component: 'Connection' }, err as Error);

      // Fallback: mode local uniquement
      setStatus({
        online: false,
        lastCheck: Date.now(),
        provider: 'local',
        availableProviders: [
          {
            provider: 'local',
            available: true,
            latency_ms: 0,
            models: ['echo'],
            error: undefined,
          },
        ],
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

  return {
    status,
    isChecking,
    checkConnection,
    getProvidersStatus,
  };
}
