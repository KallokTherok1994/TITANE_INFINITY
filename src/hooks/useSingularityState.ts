// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v15 — useSingularityState Hook
//   Phase 7: OS Cognitif Unifié — Frontend Integration
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';

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
  error: string | null;

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
 * - État unifié des 3 moteurs (Nexus, Harmonia, Sentinel)
 * - Cognition state (charge cognitive, profondeur)
 * - Auto-refresh optionnel (5s par défaut)
 * - Contrôle manuel (init, tick, refresh)
 *
 * @param autoRefresh - Enable automatic state refresh (default: false)
 * @param refreshInterval - Refresh interval in ms (default: 5000)
 */
export function useSingularityState(
  autoRefresh: boolean = false,
  refreshInterval: number = 5000
): UseSingularityStateReturn {
  // State
  const [singularityState, setSingularityState] = useState<SingularityState | null>(null);
  const [nexusState, setNexusState] = useState<NexusState | null>(null);
  const [harmoniaState, setHarmoniaState] = useState<HarmoniaState | null>(null);
  const [sentinelState, setSentinelState] = useState<SentinelState | null>(null);
  const [cognitionState, setCognitionState] = useState<CognitionState | null>(null);
  const [evolutionState, setEvolutionState] = useState<EvolutionState | null>(null);

  // Loading & Errors
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh control
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(autoRefresh);

  // ═══════════════════════════════════════════════════════════════
  //   ACTIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Refresh full Singularity state from backend
   */
  const refreshState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get full unified state
      const state = await secureInvoke<SingularityState>('engine_get_singularity_state');
      setSingularityState(state);

      // Get individual module states (optional, for granular access)
      const [nexus, harmonia, sentinel, cognition, evolution] = await Promise.all([
        secureInvoke<NexusState>('engine_get_nexus_state'),
        secureInvoke<HarmoniaState>('engine_get_harmonia_state'),
        secureInvoke<SentinelState>('engine_get_sentinel_state'),
        secureInvoke<CognitionState>('engine_get_cognition_state'),
        secureInvoke<EvolutionState>('engine_get_evolution_state'),
      ]);

      setNexusState(nexus);
      setHarmoniaState(harmonia);
      setSentinelState(sentinel);
      setCognitionState(cognition);
      setEvolutionState(evolution);
    } catch (err) {
      console.error('[useSingularityState] Refresh failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize Singularity Engine (idempotent)
   */
  const initEngine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await secureInvoke<string>('engine_init_singularity');
      console.log('[useSingularityState] Init:', result);

      // Refresh state after init
      await refreshState();
    } catch (err) {
      console.error('[useSingularityState] Init failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [refreshState]);

  /**
   * Execute engine tick (update all modules)
   */
  const tickEngine = useCallback(async () => {
    try {
      const result = await secureInvoke<string>('engine_tick');
      console.log('[useSingularityState] Tick:', result);

      // Refresh state after tick
      await refreshState();
    } catch (err) {
      console.error('[useSingularityState] Tick failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [refreshState]);

  /**
   * Enable auto-refresh
   */
  const enableAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(true);
  }, []);

  /**
   * Disable auto-refresh
   */
  const disableAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(false);
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
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      refreshState();
    }, refreshInterval);

    return () => clearInterval(interval);
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
export function getHealthColor(health: string): string {
  switch (health) {
    case 'Healthy':
      return '#00ff88';
    case 'Degraded':
      return '#ffaa00';
    case 'Failing':
      return '#ff3344';
    case 'Offline':
      return '#666666';
    default:
      return '#ffffff';
  }
}

/**
 * Get health status emoji for UI
 */
export function getHealthEmoji(health: string): string {
  switch (health) {
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
export function formatTimestamp(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString();
}

/**
 * Calculate uptime from init timestamp
 */
export function calculateUptime(initTimestampMs: number): string {
  const now = Date.now();
  const uptimeMs = now - initTimestampMs;

  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
