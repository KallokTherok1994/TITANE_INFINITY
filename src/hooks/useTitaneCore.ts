/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v30.0.0 - Core System Hook (Optimized)                                ║
// ║ React hook for TITANE∞ backend communication via Tauri v2                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { useCallback, useEffect, useRef, useState } from 'react';
import { tauri } from '../api/tauriClient';
import type {
  SystemStatus,
  ModuleHealth,
  HeliosMetrics,
  NexusGraph,
  HarmoniaFlows,
  SentinelAlerts,
  WatchdogData,
  SelfHealData,
  AdaptiveData,
} from '../types/system';

export function useTitaneCore(autoRefresh: boolean = true) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const inFlightStatusPromiseRef = useRef<Promise<SystemStatus> | null>(null);

  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    if (inFlightStatusPromiseRef.current) {
      return inFlightStatusPromiseRef.current;
    }

    const request = (async () => {
      try {
        if (mountedRef.current) {
          setLoading(true);
          setError(null);
        }

        const modules = await tauri<ModuleHealth[]>('get_system_health');
        const status: SystemStatus = {
          modules,
          uptime: 0,
          status: 'operational',
          timestamp: Date.now(),
        };

        if (mountedRef.current) {
          setSystemStatus(status);
        }

        return status;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get system status';

        if (mountedRef.current) {
          setError(errorMessage);
        }

        throw err;
      } finally {
        inFlightStatusPromiseRef.current = null;

        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    inFlightStatusPromiseRef.current = request;
    return request;
  }, []);

  const getHeliosMetrics = useCallback(async (): Promise<HeliosMetrics> => {
    const metricsJson = await tauri<string>('helios_get_metrics');
    return JSON.parse(metricsJson) as HeliosMetrics;
  }, []);

  const getNexusGraph = useCallback(async (): Promise<NexusGraph> => {
    const graphJson = await tauri<string>('nexus_get_graph');
    return JSON.parse(graphJson) as NexusGraph;
  }, []);

  const getHarmoniaFlows = useCallback(async (): Promise<HarmoniaFlows> => {
    const flowsJson = await tauri<string>('harmonia_get_flows');
    return JSON.parse(flowsJson) as HarmoniaFlows;
  }, []);

  const getSentinelStatus = useCallback(async (): Promise<SentinelAlerts> => {
    const statusJson = await tauri<string>('sentinel_get_alerts');
    return JSON.parse(statusJson) as SentinelAlerts;
  }, []);

  const getWatchdogData = useCallback(async (): Promise<{
    data: WatchdogData;
    logs: string[];
  }> => {
    const [dataJson, logs] = await Promise.all([
      tauri<string>('watchdog_get_data'),
      tauri<string[]>('watchdog_get_logs'),
    ]);
    return {
      data: JSON.parse(dataJson) as WatchdogData,
      logs,
    };
  }, []);

  const getSelfHealData = useCallback(async (): Promise<SelfHealData> => {
    const dataJson = await tauri<string>('selfheal_get_data');
    return JSON.parse(dataJson) as SelfHealData;
  }, []);

  const getAdaptiveData = useCallback(async (): Promise<AdaptiveData> => {
    const dataJson = await tauri<string>('adaptive_get_data');
    return JSON.parse(dataJson) as AdaptiveData;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      inFlightStatusPromiseRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    // ⚠️ FIX CRASH: Attendre que Tauri soit prêt avant d'appeler les commandes
    const initTimeout = setTimeout(() => {
      getSystemStatus().catch(err => {
        console.warn('[TITANE] Failed to fetch initial system status:', err);
        if (mountedRef.current) {
          setError('Connexion au backend en cours...');
        }
      });
    }, 100); // Délai de 100ms pour laisser Tauri s'initialiser

    const interval = setInterval(() => {
      void getSystemStatus().catch(err => {
        console.warn('[TITANE] Failed to refresh system status:', err);
      });
    }, 5000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, [autoRefresh, getSystemStatus]);

  return {
    systemStatus,
    loading,
    error,
    getSystemStatus,
    getHeliosMetrics,
    getNexusGraph,
    getHarmoniaFlows,
    getSentinelStatus,
    getWatchdogData,
    getSelfHealData,
    getAdaptiveData,
  };
}
