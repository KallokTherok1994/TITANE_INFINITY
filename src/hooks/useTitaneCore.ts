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
import { createLogger } from '@/utils/logger';

const logger = createLogger('TitaneCore');
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

// ─────────────────────────────────────────────────────────────────────────────
// Types des réponses IPC réelles (engine_commands.rs)
// ─────────────────────────────────────────────────────────────────────────────
interface SentinelStateResponse {
  health: string;
  alert_count: number;
  active_monitors: number;
  protection_level: number;
  last_check_ms: number;
  initialized: boolean;
}

interface SingularityStateResponse {
  nexus: {
    health: string;
    coordination_count: number;
    active_connections: number;
    last_coordination_ms: number;
    initialized: boolean;
  };
  harmonia: {
    health: string;
    harmony_index: number;
    balance_score: number;
    last_check_ms: number;
    initialized: boolean;
  };
  sentinel: SentinelStateResponse;
  cognition: {
    load: number;
    active_thoughts: number;
    depth: number;
    last_update_ms: number;
  };
  timeline_events: number;
  init_timestamp_ms: number;
  last_sync_ms: number;
}

function parseTauriPayload<T>(payload: T | string): T {
  if (typeof payload === 'string') {
    return JSON.parse(payload) as T;
  }

  return payload;
}

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
    const metrics = await tauri<HeliosMetrics | string>('get_helios_metrics');
    return parseTauriPayload(metrics);
  }, []);

  const getNexusGraph = useCallback(async (): Promise<NexusGraph> => {
    const graph = await tauri<NexusGraph | string>('nexus_get_graph');
    return parseTauriPayload(graph);
  }, []);

  const getHarmoniaFlows = useCallback(async (): Promise<HarmoniaFlows> => {
    const flows = await tauri<HarmoniaFlows | string>('harmonia_get_flows');
    return parseTauriPayload(flows);
  }, []);

  // ─── Proxy live: engine_get_sentinel_state ───────────────────────────────
  const getSentinelStatus = useCallback(async (): Promise<SentinelAlerts> => {
    try {
      const state = await tauri<SentinelStateResponse>('engine_get_sentinel_state');
      return {
        alert_count: state.alert_count,
        integrity_score: Math.max(0, Math.min(100, state.protection_level)),
      };
    } catch (err) {
      logger.warn('[getSentinelStatus] engine_get_sentinel_state failed', err);
      return { alert_count: 0, integrity_score: 0 };
    }
  }, []);

  // ─── Proxy live: engine_get_singularity_state → WatchdogData ─────────────
  const getWatchdogData = useCallback(async (): Promise<{
    data: WatchdogData;
    logs: string[];
  }> => {
    try {
      const state = await tauri<SingularityStateResponse>('engine_get_singularity_state');
      return {
        data: {
          tick_misses: state.sentinel.alert_count,
          module_health: Math.max(0, Math.min(100, 100 - state.cognition.load * 100)),
          last_check: state.last_sync_ms,
        },
        logs: [],
      };
    } catch (err) {
      logger.warn('[getWatchdogData] engine_get_singularity_state failed', err);
      return { data: { tick_misses: 0, module_health: 0, last_check: 0 }, logs: [] };
    }
  }, []);

  // ─── Proxy live: engine_get_singularity_state → SelfHealData ─────────────
  const getSelfHealData = useCallback(async (): Promise<SelfHealData> => {
    try {
      const state = await tauri<SingularityStateResponse>('engine_get_singularity_state');
      return {
        corrections_applied: Number(state.timeline_events),
        anomalies_detected: state.sentinel.alert_count,
        heal_efficiency: Math.round(state.harmonia.balance_score),
      };
    } catch (err) {
      logger.warn('[getSelfHealData] engine_get_singularity_state failed', err);
      return { corrections_applied: 0, anomalies_detected: 0, heal_efficiency: 0 };
    }
  }, []);

  // ─── Proxy live: engine_get_singularity_state → AdaptiveData ─────────────
  const getAdaptiveData = useCallback(async (): Promise<AdaptiveData> => {
    try {
      const state = await tauri<SingularityStateResponse>('engine_get_singularity_state');
      return {
        adaptability: Math.min(1, state.cognition.active_thoughts / 10),
        stability: Math.max(0, Math.min(100, state.harmonia.balance_score)),
        trend: state.harmonia.initialized ? 0.5 : -0.5,
      };
    } catch (err) {
      logger.warn('[getAdaptiveData] engine_get_singularity_state failed', err);
      return { adaptability: 0, stability: 0, trend: 0 };
    }
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
