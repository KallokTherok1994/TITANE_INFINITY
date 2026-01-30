/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — System Store Selectors (v32.0.0+)
 * Optimized selectors for system store subscriptions
 * ═══════════════════════════════════════════════════════════════
 */

import { useSystemStore } from './systemStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (individual values, no shallow)
// ═══════════════════════════════════════════════════════════════

export const useHeliosState = () => useSystemStore(state => state.helios);
export const useNexusState = () => useSystemStore(state => state.nexus);
export const useHarmoniaState = () => useSystemStore(state => state.harmonia);
export const useSentinelState = () => useSystemStore(state => state.sentinel);
export const useSystemHealth = () => useSystemStore(state => state.health);
export const useSystemLoading = () => useSystemStore(state => state.loading);
export const useSystemError = () => useSystemStore(state => state.error);
export const useSystemLastUpdate = () => useSystemStore(state => state.lastUpdate);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (shallow equality for multiple values)
// ═══════════════════════════════════════════════════════════════

/** Snapshot for HeliosView (helios + health + loading + error) */
export const useHeliosSnapshot = () => {
  const helios = useSystemStore(state => state.helios);
  const health = useSystemStore(state => state.health);
  const loading = useSystemStore(state => state.loading);
  const error = useSystemStore(state => state.error);
  return { helios, health, loading, error };
};

/** Snapshot for NexusMesh (nexus + loading + error) */
export const useNexusSnapshot = () => {
  const nexus = useSystemStore(state => state.nexus);
  const loading = useSystemStore(state => state.loading);
  const error = useSystemStore(state => state.error);
  return { nexus, loading, error };
};

/** Snapshot for HarmoniaFlow (harmonia + loading + error) */
export const useHarmoniaSnapshot = () => {
  const harmonia = useSystemStore(state => state.harmonia);
  const loading = useSystemStore(state => state.loading);
  const error = useSystemStore(state => state.error);
  return { harmonia, loading, error };
};

/** Snapshot for SentinelAlerts (sentinel + loading + error) */
export const useSentinelSnapshot = () => {
  const sentinel = useSystemStore(state => state.sentinel);
  const loading = useSystemStore(state => state.loading);
  const error = useSystemStore(state => state.error);
  return { sentinel, loading, error };
};

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (fetch methods)
// ═══════════════════════════════════════════════════════════════

export const useFetchHelios = () => useSystemStore(state => state.fetchHelios);
export const useFetchNexus = () => useSystemStore(state => state.fetchNexus);
export const useFetchHarmonia = () => useSystemStore(state => state.fetchHarmonia);
export const useFetchSentinel = () => useSystemStore(state => state.fetchSentinel);
export const useFetchHealth = () => useSystemStore(state => state.fetchHealth);
export const useFetchAllSystem = () => useSystemStore(state => state.fetchAll);
export const useResetSystem = () => useSystemStore(state => state.reset);
