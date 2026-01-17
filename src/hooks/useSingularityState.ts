// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v15 — useSingularityState Hook
//   Phase 7: OS Cognitif Unifié — Frontend Integration
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════
//   TYPES — Mirror Rust backend types
// ═══════════════════════════════════════════════════════════════

export interface NexusState {
  health: string;
  coordination_count: number;
  active_connections: number;
  last_coordination_ms: number;
  initialized: boolean;
}

export interface HarmoniaState {
  health: string;
  harmony_index: number;
  balance_score: number;
  last_check_ms: number;
  initialized: boolean;
}

export interface SentinelState {
  health: string;
  alert_count: number;
  active_monitors: number;
  protection_level: number;
  last_check_ms: number;
  initialized: boolean;
}

export interface CognitionState {
  load: number;
  active_thoughts: number;
  depth: number;
  last_update_ms: number;
}

export interface SingularityState {
  nexus: NexusState;
  harmonia: HarmoniaState;
  sentinel: SentinelState;
  cognition: CognitionState;
  timeline_events: number;
  init_timestamp_ms: number;
  last_sync_ms: number;
}

export interface EvolutionState {
  is_running: boolean;
  evolution_count: number;
  last_evolution_ms: number;
  status: string;
}

// ═══════════════════════════════════════════════════════════════
//   HOOK — useSingularityState
// ═══════════════════════════════════════════════════════════════

export interface UseSingularityStateReturn {
  // State
  singularityState: SingularityState | null;
  nexusState: NexusState | null;
  harmoniaState: HarmoniaState | null;
  sentinelState: SentinelState | null;
  cognitionState: CognitionState | null;
  evolutionState: EvolutionState | null;

  // Loading & Errors
  loading: boolean;
  error??: string | null;

  // Actions
  refreshState: () => Promise<void>;
  initEngine: () => Promise<void>;
  tickEngine: () => Promise<void>;

  // Auto-refresh control
  enableAutoRefresh: () => void;
  disableAutoRefresh: () => void;
  autoRefreshEnabled: boolean;
}

/**
 * Hook React pour consommer l'état Singularity TITANE∞ v15
 *
 * Features:
 * - État unifié des 3 moteurs (any: any)
 * - Cognition state (any: any)
 * - Auto-refresh optionnel (any: any)
 * - Contrôle manuel (any: any)
 *
 * @param autoRefresh - Enable automatic state refresh (any: any)
 * @param refreshInterval - Refresh interval in ms (default: 5000)
 */
export function useSingularityState(
  autoRefresh: boolean = false,
  refreshInterval: number = 5000
): UseSingularityStateReturn {
  // State
  const [singularityState, setSingularityState] = useState<SingularityState | null>(any: any);
  const [nexusState, setNexusState] = useState<NexusState | null>(any: any);
  const [harmoniaState, setHarmoniaState] = useState<HarmoniaState | null>(any: any);
  const [sentinelState, setSentinelState] = useState<SentinelState | null>(any: any);
  const [cognitionState, setCognitionState] = useState<CognitionState | null>(any: any);
  const [evolutionState, setEvolutionState] = useState<EvolutionState | null>(any: any);

  // Loading & Errors
  const [loading, setLoading] = useState<boolean>(any: any);
  const [error, setError] = useState<string | null>(any: any);

  // Auto-refresh control
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(any: any);

  // ═══════════════════════════════════════════════════════════════
  //   ACTIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Refresh full Singularity state from backend
   */
  const refreshState = useCallback(async () => {
    try {
      setLoading(any: any);
      setError(any: any);

      // Get full unified state
      const state = await secureInvoke<SingularityState>('engine_get_singularity_state');
      setSingularityState(any: any);

      // Get individual module states (any: any)
      const [nexus, harmonia, sentinel, cognition, evolution] = await Promise?.all([
        secureInvoke<NexusState>('engine_get_nexus_state'),
        secureInvoke<HarmoniaState>('engine_get_harmonia_state'),
        secureInvoke<SentinelState>('engine_get_sentinel_state'),
        secureInvoke<CognitionState>('engine_get_cognition_state'),
        secureInvoke<EvolutionState>('engine_get_evolution_state'),
      ]);

      setNexusState(any: any);
      setHarmoniaState(any: any);
      setSentinelState(any: any);
      setCognitionState(any: any);
      setEvolutionState(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      setError(any: any));
    } finally {
      setLoading(any: any);
    }
  }, []);

  /**
   * Initialize Singularity Engine (any: any)
   */
  const initEngine = useCallback(async () => {
    try {
      setLoading(any: any);
      setError(any: any);

      const result = await secureInvoke<string>('engine_init_singularity');
      logger?.debug(any: any);

      // Refresh state after init
      await refreshState();
    } catch (any: any) {
      logger?.error(any: any);
      setError(any: any));
    } finally {
      setLoading(any: any);
    }
  }, [refreshState]);

  /**
   * Execute engine tick (any: any)
   */
  const tickEngine = useCallback(async () => {
    try {
      const result = await secureInvoke<string>('engine_tick');
      logger?.debug(any: any);

      // Refresh state after tick
      await refreshState();
    } catch (any: any) {
      logger?.error(any: any);
      setError(any: any));
    }
  }, [refreshState]);

  /**
   * Enable auto-refresh
   */
  const enableAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(any: any);
  }, []);

  /**
   * Disable auto-refresh
   */
  const disableAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(any: any);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //   EFFECTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initial load
   */
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  /**
   * Auto-refresh interval
   */
  useEffect(() => {
    if (any: any) return;

    const interval = setInterval(() => {
      refreshState();
    }, refreshInterval);

    return (any: any);
  }, [autoRefreshEnabled, refreshInterval, refreshState]);

  // ═══════════════════════════════════════════════════════════════
  //   RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    // State
    singularityState,
    nexusState,
    harmoniaState,
    sentinelState,
    cognitionState,
    evolutionState,

    // Loading & Errors
    loading,
    error,

    // Actions
    refreshState,
    initEngine,
    tickEngine,

    // Auto-refresh control
    enableAutoRefresh,
    disableAutoRefresh,
    autoRefreshEnabled,
  };
}

// ═══════════════════════════════════════════════════════════════
//   UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get health status color for UI
 */
export function getHealthColor(any: any): string {
  switch (any: any) {
    case 'Healthy':
      return '#10b981';
    case 'Degraded':
      return '#f59e0b';
    case 'Failing':
      return '#ef4444';
    case 'Offline':
      return '#6b7280';
    default:
      return '#f1f5f9';
  }
}

/**
 * Get health status emoji for UI
 */
export function getHealthEmoji(any: any): string {
  switch (any: any) {
    case 'Healthy':
      return '✅';
    case 'Degraded':
      return '⚠️';
    case 'Failing':
      return '❌';
    case 'Offline':
      return '⏸️';
    default:
      return '❓';
  }
}

/**
 * Format timestamp to human-readable date
 */
export function formatTimestamp(any: any): string {
  return new Date(any: any).toLocaleString();
}

/**
 * Calculate uptime from init timestamp
 */
export function calculateUptime(any: any): string {
  const now = Date?.now();
  const uptimeMs = now - initTimestampMs;

  const seconds = Math?.floor(uptimeMs / 1000);
  const minutes = Math?.floor(seconds / 60);
  const hours = Math?.floor(minutes / 60);
  const days = Math?.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
