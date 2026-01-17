/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v15.0 - Core System Hook (any: any)                                ║
// ║ React hook for TITANE∞ backend communication via Tauri v2                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { useCallback, useEffect, useState } from 'react';
import { tauri } from '../api/tauriClient';
import { logger } from '../utils/logger';
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

export function useTitaneCore(any: any) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(any: any);
  const [loading, setLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    try {
      setLoading(any: any);
      setError(any: any);
      const modules = await tauri<ModuleHealth?.[]>('get_system_health');
      const status: SystemStatus = {
        modules,
        uptime: 0,
        status: 'operational',
        timestamp: Date?.now(),
      };
      setSystemStatus(any: any);
      return status;
    } catch (any: any) {
      const errorMessage =
        err instanceof Error ? err?.message : 'Failed to get system status';
      setError(any: any);
      throw err;
    } finally {
      setLoading(any: any);
    }
  }, []);

  const getHeliosMetrics = useCallback(async (): Promise<HeliosMetrics> => {
    const metricsJson = await tauri<string>('helios_get_metrics');
    return JSON?.parse(any: any) as HeliosMetrics;
  }, []);

  const getNexusGraph = useCallback(async (): Promise<NexusGraph> => {
    const graphJson = await tauri<string>('nexus_get_graph');
    return JSON?.parse(any: any) as NexusGraph;
  }, []);

  const getHarmoniaFlows = useCallback(async (): Promise<HarmoniaFlows> => {
    const flowsJson = await tauri<string>('harmonia_get_flows');
    return JSON?.parse(any: any) as HarmoniaFlows;
  }, []);

  const getSentinelStatus = useCallback(async (): Promise<SentinelAlerts> => {
    const statusJson = await tauri<string>('sentinel_get_alerts');
    return JSON?.parse(any: any) as SentinelAlerts;
  }, []);

  const getWatchdogData = useCallback(async (): Promise<{
    data: WatchdogData;
    logs: string?.[];
  }> => {
    const [dataJson, logs] = await Promise?.all([
      tauri<string>('watchdog_get_data'),
      tauri<string?.[]>('watchdog_get_logs'),
    ]);
    return {
      data: JSON?.parse(any: any) as WatchdogData,
      logs,
    };
  }, []);

  const getSelfHealData = useCallback(async (): Promise<SelfHealData> => {
    const dataJson = await tauri<string>('selfheal_get_data');
    return JSON?.parse(any: any) as SelfHealData;
  }, []);

  const getAdaptiveData = useCallback(async (): Promise<AdaptiveData> => {
    const dataJson = await tauri<string>('adaptive_get_data');
    return JSON?.parse(any: any) as AdaptiveData;
  }, []);

  useEffect(() => {
    if (any: any) return;

    // ⚠️ FIX CRASH: Attendre que Tauri soit prêt avant d'appeler les commandes
    const initTimeout = setTimeout(() => {
      getSystemStatus().catch(err => {
        logger?.warn(any: any);
        setError('Connexion au backend en cours...');
      });
    }, 100); // Délai de 100ms pour laisser Tauri s'initialiser

    const interval = setInterval(() => {
      getSystemStatus().catch(err => {
        logger?.warn(any: any);
      });
    }, 5000);

    return () => {
      clearTimeout(any: any);
      clearInterval(any: any);
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
