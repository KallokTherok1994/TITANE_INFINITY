// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v12.0 - Core System Hook (Optimized)                                ║
// ║ React hook for TITANE∞ backend communication via Tauri v2                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { useCallback, useEffect, useState } from 'react';
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
  AdaptiveData
} from '../types/system';

export function useTitaneCore(autoRefresh: boolean = true) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    try {
      setLoading(true);
      setError(null);
      const modules = await tauri<ModuleHealth[]>('get_system_status');
      const status: SystemStatus = { 
        modules,
        uptime: 0,
        status: 'operational',
        timestamp: Date.now()
      };
      setSystemStatus(status);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get system status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
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

  const getWatchdogData = useCallback(async (): Promise<{ data: WatchdogData; logs: string[] }> => {
    const [dataJson, logs] = await Promise.all([
      tauri<string>('watchdog_get_data'),
      tauri<string[]>('watchdog_get_logs')
    ]);
    return {
      data: JSON.parse(dataJson) as WatchdogData,
      logs
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
    if (!autoRefresh) return;
    
    // ⚠️ FIX CRASH: Attendre que Tauri soit prêt avant d'appeler les commandes
    const initTimeout = setTimeout(() => {
      getSystemStatus().catch((err) => {
        console.warn('[TITANE] Failed to fetch initial system status:', err);
        setError('Connexion au backend en cours...');
      });
    }, 100); // Délai de 100ms pour laisser Tauri s'initialiser
    
    const interval = setInterval(() => {
      getSystemStatus().catch((err) => {
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
    getAdaptiveData
  };
}
