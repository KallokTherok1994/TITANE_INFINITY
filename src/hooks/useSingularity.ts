/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — useSingularity Hook
 * Hook React pour accéder à l'état de singularité global
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { singularityEngine } from '../core/engines/SINGULARITY_ENGINE';
import type { SingularityState } from '../core/ARCHITECTURE_TYPES_v24-v∞';

/**
 * Hook pour accéder à l'état de singularité
 *
 * @param autoInit - Initialiser automatiquement le moteur (défaut: true)
 * @returns État de singularité et méthodes de contrôle
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, isInitialized, consciousness } = useSingularity();
 *
 *   return (
 *     <div>
 *       <p>Consciousness: {consciousness}/4</p>
 *       <p>Harmony: {(state.unity.globalHarmony * 100).toFixed(0)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSingularity(autoInit = true) {
  const [state, setState] = useState<SingularityState>(singularityEngine.getState());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser le moteur au montage
  useEffect(() => {
    if (autoInit && !isInitialized) {
      singularityEngine.initialize().then(() => {
        setIsInitialized(true);
      });
    }
  }, [autoInit, isInitialized]);

  // S'abonner aux changements d'état
  useEffect(() => {
    const unsubscribe = singularityEngine.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  return {
    // État complet
    state,

    // Propriétés principales
    consciousness: state.consciousness,
    autoCoherence: state.autoCoherence,
    formStability: state.formStability,
    expressionQuality: state.expressionQuality,

    // Champ de singularité
    field: state.singularityField,

    // Sous-états
    unity: state.unity,
    quantum: state.quantum,
    convergence: state.convergence,
    overmind: state.overmind,
    omnipresence: state.omnipresence,

    // Métriques
    globalHarmony: state.unity.globalHarmony,
    globalEntropy: state.unity.globalEntropy,
    systemHealth: state.unity.systemHealth,

    // Contrôles
    isInitialized,
    updateState: (partial: Partial<SingularityState>) => {
      singularityEngine.setState(partial);
    },
    reset: () => singularityEngine.reset(),

    // Métadonnées
    signature: state.signature,
    essence: state.essence,
    timestamp: state.timestamp,
  };
}

/**
 * Hook simplifié pour n'obtenir que les métriques principales
 */
export function useSingularityMetrics() {
  const { consciousness, autoCoherence, formStability, expressionQuality, globalHarmony, systemHealth } = useSingularity();

  return {
    consciousness,
    autoCoherence,
    formStability,
    expressionQuality,
    globalHarmony,
    systemHealth,
  };
}

/**
 * Hook pour n'obtenir que le champ de singularité
 */
export function useSingularityField() {
  const { field } = useSingularity();
  return field;
}
