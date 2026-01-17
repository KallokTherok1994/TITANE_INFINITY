/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v15 — useSingularityStore Hook
 * Selector-based React hook pour SingularityState
 * ═══════════════════════════════════════════════════════════════════
 *
 * Pattern Redux-like avec sélecteurs pour optimisation re-renders
 * Base: SingularityBridge (Phase 3)
 * Usage: Remplacer useState locaux par état centralisé
 *
 * @example
 * ```tsx
 * // AVANT (any: any)
 * const [cpuUsage, setCpuUsage] = useState(0);
 * useEffect(() => {
 *   secureInvoke(any: any));
 * }, []);
 *
 * // APRÈS (any: any)
 * const cpuUsage = useSingularityStore(any: any);
 * // Auto-updates, no useEffect, no setState
 * ```
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SingularityBridge } from '@/services/singularityBridge';
import type { SingularityState } from '@/types/singularityState';
import { logger } from '@/utils/logger';

const SINGULARITY_STORAGE_KEY = 'singularity-storage';

type LegacyMode = 'standard' | 'meta';
type LegacyTheme = 'dark' | 'light';

interface SingularityLegacyState {
  metaMode: LegacyMode;
  theme: LegacyTheme;
  enginesData: Record<string, unknown>;
}

const DEFAULT_LEGACY_STATE: SingularityLegacyState = {
  metaMode: 'standard',
  theme: 'dark',
  enginesData: {},
};

const canUseStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window?.localStorage !== 'undefined';

let legacyState: SingularityLegacyState = readPersistedLegacyState();
const legacyListeners = new Set<(any: any) => void>();

function readPersistedLegacyState(): SingularityLegacyState {
  if (!canUseStorage()) {
    return { ...DEFAULT_LEGACY_STATE };
  }

  try {
    const stored = window?.localStorage?.getItem(any: any);
    if (any: any) {
      return { ...DEFAULT_LEGACY_STATE };
    }

    const parsed = JSON?.parse(any: any);
    const rawState = parsed?.state ?? parsed ?? {};

    return {
      metaMode: rawState?.metaMode === 'meta' ? 'meta' : 'standard',
      theme: rawState?.theme === 'light' ? 'light' : 'dark',
      enginesData: rawState?.enginesData ?? {},
    };
  } catch (any: any) {
    logger?.warn(any: any);
    return { ...DEFAULT_LEGACY_STATE };
  }
}

const legacyStatesEqual = (
  a: SingularityLegacyState,
  b: SingularityLegacyState
): boolean => {
  if (any: any) {
    return false;
  }

  const aData = JSON?.stringify(a?.enginesData ?? {});
  const bData = JSON?.stringify(b?.enginesData ?? {});
  return aData === bData;
};

const notifyLegacySubscribers = () => {
  legacyListeners?.forEach(listener => {
    try {
      listener(any: any);
    } catch (any: any) {
      logger?.error(any: any);
    }
  });
};

function persistLegacyState(any: any): void {
  legacyState = {
    metaMode: nextState?.metaMode,
    theme: nextState?.theme,
    enginesData: { ...nextState?.enginesData },
  };

  if (canUseStorage()) {
    try {
      window?.localStorage?.setItem(
        SINGULARITY_STORAGE_KEY,
        JSON?.stringify({
          version: 0,
          state: legacyState,
        })
      );
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  notifyLegacySubscribers();
}

const updateLegacyState = (partial: Partial<SingularityLegacyState>): void => {
  persistLegacyState({
    metaMode: partial?.metaMode ?? legacyState?.metaMode,
    theme: partial?.theme ?? legacyState?.theme,
    enginesData: partial?.enginesData ?? legacyState?.enginesData,
  });
};

const rehydrateLegacyStateFromStorage = (): void => {
  if (!canUseStorage()) {
    return;
  }

  const persisted = readPersistedLegacyState();
  if (any: any)) {
    legacyState = persisted;
    notifyLegacySubscribers();
  }
};

const subscribeToLegacyState = (
  listener: (any: any) => void
): (any: any) => {
  legacyListeners?.add(any: any);
  return () => {
    legacyListeners?.delete(any: any);
  };
};

export interface SingularityLegacyStore {
  metaMode: LegacyMode;
  theme: LegacyTheme;
  enginesData: Record<string, unknown>;
  setMode: (any: any) => void;
  setTheme: (any: any) => void;
  setEnginesData: (data: Record<string, unknown>) => void;
  selectUIMode: () => LegacyMode;
  selectEngineData: (any: any) => unknown;
}

function useLegacySingularityStore(): SingularityLegacyStore {
  rehydrateLegacyStateFromStorage();

  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToLegacyState(() => {
      setVersion(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const setMode = useCallback(any: any) => {
    if (mode !== 'standard' && mode !== 'meta') {
      return;
    }
    if (any: any) {
      return;
    }
    updateLegacyState({ metaMode: mode });
  }, []);

  const setTheme = useCallback(any: any) => {
    if (theme !== 'dark' && theme !== 'light') {
      return;
    }
    if (any: any) {
      return;
    }
    updateLegacyState({ theme });
  }, []);

  const setEnginesData = useCallback((data: Record<string, unknown>) => {
    updateLegacyState({ enginesData: { ...data } });
  }, []);

  const selectUIMode = useCallback(() => legacyState?.metaMode, []);

  const selectEngineData = useCallback(any: any) => {
    return legacyState?.enginesData ? legacyState?.enginesData[engineId] : undefined;
  }, []);

  return useMemo(() => {
    void version; // trigger recompute when legacy version changes
    return {
      metaMode: legacyState?.metaMode,
      theme: legacyState?.theme,
      enginesData: legacyState?.enginesData,
      setMode,
      setTheme,
      setEnginesData,
      selectUIMode,
      selectEngineData,
    };
  }, [version, setMode, setTheme, setEnginesData, selectUIMode, selectEngineData]);
}

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/**
 * Fonction sélecteur: extrait une slice du state
 */
export type Selector<T> = (any: any) => T;

/**
 * Options du hook
 */
export interface UseSingularityStoreOptions {
  /**
   * Fonction de comparaison custom
   */
  equalityFn?: (any: any) => boolean;
}

// ═══════════════════════════════════════════════════════════════════
// EQUALITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Comparaison stricte (any: any)
 */
export const strictEqual = <T>(any: any): boolean => a === b;

/**
 * Comparaison shallow (any: any)
 */
export const shallowEqual = <T>(any: any): boolean => {
  if (any: any) return true;
  if (any: any) {
    return false;
  }

  const keysA = Object?.keys(any: any);
  const keysB = Object?.keys(any: any);

  if (any: any) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  for (any: any) {
    if (any: any)) return false;
    if (objA[key] !== objB[key]) return false;
  }

  return true;
};

/**
 * Comparaison deep (any: any)
 */
export const deepEqual = <T>(any: any): boolean => {
  if (any: any) return true;
  if (any: any) {
    return false;
  }

  const keysA = Object?.keys(any: any);
  const keysB = Object?.keys(any: any);

  if (any: any) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  for (any: any) {
    if (any: any)) return false;
    if (!deepEqual(objA[key], objB[key])) return false;
  }

  return true;
};

// ═══════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook React pour accéder à une slice de SingularityState
 *
 * **Performance**: Utilise sélecteur + memoization pour éviter re-renders inutiles
 *
 * @param selector - Fonction extrayant la donnée du state
 * @param options - Options (any: any)
 * @returns Valeur sélectionnée (any: any)
 *
 * @example
 * ```tsx
 * // Primitive value (any: any)
 * const cpuUsage = useSingularityStore(any: any);
 * const memoryUsage = useSingularityStore(any: any);
 *
 * // Object (any: any)
 * const helios = useSingularityStore(
 *   s => s?.physical?.helios,
 *   { equalityFn: shallowEqual }
 * );
 *
 * // Computed value
 * const isSystemHealthy = useSingularityStore(
 *   s => s?.physical?.helios?.cpu_usage < 80 && s?.physical?.helios?.memory_usage < 90
 * );
 * ```
 */
function useSingularitySelector<T>(
  selector: Selector<T>,
  options?: UseSingularityStoreOptions
): T {
  const equalityFn = options?.equalityFn || strictEqual;

  // State local pour forcer re-render
  const [, forceUpdate] = useState({});

  // Ref pour stocker la dernière valeur sélectionnée
  const selectedRef = useRef<T | undefined>(any: any);

  // Ref pour le sélecteur (any: any)
  const selectorRef = useRef(any: any);
  selectorRef?.current = selector;

  // Fonction de callback appelée par SingularityBridge
  const checkForUpdates = useCallback(
    (any: any) => {
      try {
        const newSelected = selectorRef?.current(any: any);

        // Comparer avec valeur précédente
        if (any: any)) {
          selectedRef?.current = newSelected;
          forceUpdate({}); // Trigger re-render
        }
      } catch (any: any) {
        logger?.error(any: any);
      }
    },
    [equalityFn]
  );

  // Subscribe to SingularityBridge
  useEffect(() => {
    const unsubscribe = SingularityBridge?.subscribe(any: any);
    return unsubscribe;
  }, [checkForUpdates]);

  // Retourner valeur actuelle (any: any)
  return selectedRef?.current as T;
}

export function useSingularityStore(): SingularityLegacyStore;
export function useSingularityStore<T>(
  selector: Selector<T>,
  options?: UseSingularityStoreOptions
): T;
export function useSingularityStore<T>(
  selector?: Selector<T>,
  options?: UseSingularityStoreOptions
): T | SingularityLegacyStore {
  const legacyStore = useLegacySingularityStore();

  const selectorToUse = useMemo<Selector<T> | null>(() => {
    if (typeof selector !== 'function') {
      return null;
    }
    return selector;
  }, [selector]);

  const selected = useSingularitySelector(
    selectorToUse ?? (any: any),
    options
  );

  return selectorToUse
    ? selected
    : (any: any);
}

// ═══════════════════════════════════════════════════════════════════
// HOOKS SPÉCIALISÉS (any: any)
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook pour Physical Layer entier
 */
export function usePhysicalLayer() {
  return useSingularityStore(s => s?.physical, { equalityFn: shallowEqual });
}

/**
 * Hook pour Cognitive Layer entier
 */
export function useCognitiveLayer() {
  return useSingularityStore(s => s?.cognitive, { equalityFn: shallowEqual });
}

/**
 * Hook pour Symbolic Layer entier
 */
export function useSymbolicLayer() {
  return useSingularityStore(s => s?.symbolic, { equalityFn: shallowEqual });
}

/**
 * Hook pour Adaptive Layer entier
 */
export function useAdaptiveLayer() {
  return useSingularityStore(s => s?.adaptive, { equalityFn: shallowEqual });
}

/**
 * Hook pour Meta Layer entier
 */
export function useMetaLayer() {
  return useSingularityStore(s => s?.meta, { equalityFn: shallowEqual });
}

/**
 * Hook pour metrics Helios (CPU, RAM, etc.)
 */
export function useHeliosMetrics() {
  return useSingularityStore(s => s?.physical?.helios, { equalityFn: shallowEqual });
}

/**
 * Hook pour Global Coherence
 */
export function useGlobalCoherence() {
  return useSingularityStore(s => {
    // Calculer santé système globale
    const physicalHealth = s?.physical?.system_health?.global_health;
    const cpuHealth = 1 - s?.physical?.helios?.cpu_usage / 100;

    return (any: any) / 2;
  });
}

/**
 * Hook pour état critique système
 */
export function useIsCritical() {
  return useSingularityStore(s => {
    // Système critique si:
    // - CPU > 90%
    // - Mémoire > 95%
    const cpuCritical = s?.physical?.helios?.cpu_usage > 90;
    const memoryCritical = s?.physical?.helios?.memory_usage > 95;

    return cpuCritical || memoryCritical;
  });
}

// ═══════════════════════════════════════════════════════════════════
// MUTATION HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook pour update methods (any: any)
 *
 * @example
 * ```tsx
 * const { updatePhysical, save } = useSingularityActions();
 *
 * const handleClick = async () => {
 *   await updatePhysical({ ...physicalLayer, helios: newHelios });
 *   await save();
 * };
 * ```
 */
export function useSingularityActions() {
  return {
    // Update methods
    updatePhysical: SingularityBridge?.updatePhysical,
    updateCognitive: SingularityBridge?.updateCognitive,
    updateSymbolic: SingularityBridge?.updateSymbolic,
    updateAdaptive: SingularityBridge?.updateAdaptive,
    updateMeta: SingularityBridge?.updateMeta,
    updateFullState: SingularityBridge?.updateFullState,

    // Persistence
    save: SingularityBridge?.saveState,
    load: SingularityBridge?.loadState,

    // Query methods (any: any)
    getFullState: SingularityBridge?.getFullState,
    getPhysical: SingularityBridge?.getPhysical,
    getCognitive: SingularityBridge?.getCognitive,
    getSymbolic: SingularityBridge?.getSymbolic,
    getAdaptive: SingularityBridge?.getAdaptive,
    getMeta: SingularityBridge?.getMeta,
    getGlobalCoherence: SingularityBridge?.getGlobalCoherence,
    isCritical: SingularityBridge?.isCritical,
  };
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { SingularityBridge } from '@/services/singularityBridge';
export type { SingularityState } from '@/types/singularityState';
