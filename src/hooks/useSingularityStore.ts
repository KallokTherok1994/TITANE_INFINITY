/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
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
 * // AVANT (useState local)
 * const [cpuUsage, setCpuUsage] = useState(0);
 * useEffect(() => {
 *   invoke('get_helios_metrics').then(data => setCpuUsage(data.cpu));
 * }, []);
 *
 * // APRÈS (useSingularityStore)
 * const cpuUsage = useSingularityStore(s => s.physical.helios.cpu_usage);
 * // Auto-updates, no useEffect, no setState
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SingularityBridge } from '@/services/singularityBridge';
import type { SingularityState } from '@/types/singularityState';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/**
 * Fonction sélecteur: extrait une slice du state
 */
export type Selector<T> = (state: SingularityState) => T;

/**
 * Options du hook
 */
export interface UseSingularityStoreOptions {
  /**
   * Fonction de comparaison custom
   */
  equalityFn?: (a: unknown, b: unknown) => boolean;
}

// ═══════════════════════════════════════════════════════════════════
// EQUALITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Comparaison stricte (défaut)
 */
export const strictEqual = <T,>(a: T, b: T): boolean => a === b;

/**
 * Comparaison shallow (objets premier niveau)
 */
export const shallowEqual = <T,>(a: T, b: T): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (objA[key] !== objB[key]) return false;
  }

  return true;
};

/**
 * Comparaison deep (récursive, coûteuse)
 */
export const deepEqual = <T,>(a: T, b: T): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
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
 * @param options - Options (equalityFn custom)
 * @returns Valeur sélectionnée (auto-updates)
 *
 * @example
 * ```tsx
 * // Primitive value (nombre, string)
 * const cpuUsage = useSingularityStore(s => s.physical.helios.cpu_usage);
 * const memoryUsage = useSingularityStore(s => s.physical.helios.memory_usage);
 *
 * // Object (besoin shallowEqual pour éviter re-render)
 * const helios = useSingularityStore(
 *   s => s.physical.helios,
 *   { equalityFn: shallowEqual }
 * );
 *
 * // Computed value
 * const isSystemHealthy = useSingularityStore(
 *   s => s.physical.helios.cpu_usage < 80 && s.physical.helios.memory_usage < 90
 * );
 * ```
 */
export function useSingularityStore<T>(
  selector: Selector<T>,
  options?: UseSingularityStoreOptions
): T {
  const equalityFn = options?.equalityFn || strictEqual;

  // State local pour forcer re-render
  const [, forceUpdate] = useState({});

  // Ref pour stocker la dernière valeur sélectionnée
  const selectedRef = useRef<T | undefined>(undefined);

  // Ref pour le sélecteur (éviter re-subscription si selector change)
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  // Fonction de callback appelée par SingularityBridge
  const checkForUpdates = useCallback((state: SingularityState) => {
    try {
      const newSelected = selectorRef.current(state);

      // Comparer avec valeur précédente
      if (!equalityFn(selectedRef.current as T, newSelected)) {
        selectedRef.current = newSelected;
        forceUpdate({}); // Trigger re-render
      }
    } catch (error) {
      console.error('[useSingularityStore] Selector error:', error);
    }
  }, [equalityFn]);

  // Subscribe to SingularityBridge
  useEffect(() => {
    const unsubscribe = SingularityBridge.subscribe(checkForUpdates);
    return unsubscribe;
  }, [checkForUpdates]);

  // Retourner valeur actuelle (ou undefined si pas encore sync)
  return selectedRef.current as T;
}

// ═══════════════════════════════════════════════════════════════════
// HOOKS SPÉCIALISÉS (Convenience)
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook pour Physical Layer entier
 */
export function usePhysicalLayer() {
  return useSingularityStore(s => s.physical, { equalityFn: shallowEqual });
}

/**
 * Hook pour Cognitive Layer entier
 */
export function useCognitiveLayer() {
  return useSingularityStore(s => s.cognitive, { equalityFn: shallowEqual });
}

/**
 * Hook pour Symbolic Layer entier
 */
export function useSymbolicLayer() {
  return useSingularityStore(s => s.symbolic, { equalityFn: shallowEqual });
}

/**
 * Hook pour Adaptive Layer entier
 */
export function useAdaptiveLayer() {
  return useSingularityStore(s => s.adaptive, { equalityFn: shallowEqual });
}

/**
 * Hook pour Meta Layer entier
 */
export function useMetaLayer() {
  return useSingularityStore(s => s.meta, { equalityFn: shallowEqual });
}

/**
 * Hook pour metrics Helios (CPU, RAM, etc.)
 */
export function useHeliosMetrics() {
  return useSingularityStore(s => s.physical.helios, { equalityFn: shallowEqual });
}

/**
 * Hook pour Global Coherence
 */
export function useGlobalCoherence() {
  return useSingularityStore(s => {
    // Calculer santé système globale
    const physicalHealth = s.physical.system_health.global_health;
    const cpuHealth = 1 - (s.physical.helios.cpu_usage / 100);

    return (physicalHealth + cpuHealth) / 2;
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
    const cpuCritical = s.physical.helios.cpu_usage > 90;
    const memoryCritical = s.physical.helios.memory_usage > 95;

    return cpuCritical || memoryCritical;
  });
}

// ═══════════════════════════════════════════════════════════════════
// MUTATION HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook pour update methods (pas de subscription)
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
    updatePhysical: SingularityBridge.updatePhysical,
    updateCognitive: SingularityBridge.updateCognitive,
    updateSymbolic: SingularityBridge.updateSymbolic,
    updateAdaptive: SingularityBridge.updateAdaptive,
    updateMeta: SingularityBridge.updateMeta,
    updateFullState: SingularityBridge.updateFullState,

    // Persistence
    save: SingularityBridge.saveState,
    load: SingularityBridge.loadState,

    // Query methods (one-time)
    getFullState: SingularityBridge.getFullState,
    getPhysical: SingularityBridge.getPhysical,
    getCognitive: SingularityBridge.getCognitive,
    getSymbolic: SingularityBridge.getSymbolic,
    getAdaptive: SingularityBridge.getAdaptive,
    getMeta: SingularityBridge.getMeta,
    getGlobalCoherence: SingularityBridge.getGlobalCoherence,
    isCritical: SingularityBridge.isCritical,
  };
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { SingularityBridge } from '@/services/singularityBridge';
export type { SingularityState } from '@/types/singularityState';
