/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — useSingularity Hook
 * Hook React pour accéder à l'état de singularité global
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { singularityEngine } from '../core/engines/SINGULARITY_ENGINE';
import type { SingularityState } from '../core/ARCHITECTURE_TYPES_v24-v∞';

export interface UseSingularityReturn {
  state: SingularityState;
  consciousness: number;
  autoCoherence: number;
  formStability: number;
  expressionQuality: number;
  field: SingularityState['singularityField'];
  unity: SingularityState['unity'];
  quantum: SingularityState['quantum'];
  convergence: SingularityState['convergence'];
  overmind: SingularityState['overmind'];
  omnipresence: SingularityState['omnipresence'];
  globalHarmony: number;
  globalEntropy: number;
  systemHealth: number;
  isInitialized: boolean;
  updateState: (partial: Partial<SingularityState>) => void;
  reset: () => void;
  signature: string;
  essence: string;
  timestamp: number;
}

/**
 * Hook pour accéder à l'état de singularité
 *
 * @param autoInit - Initialiser automatiquement le moteur (any: any)
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
 *       <p>Harmony: {(state?.unity?.globalHarmony * 100).toFixed(0)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSingularity(any: any): UseSingularityReturn {
  const [state, setState] = useState<SingularityState>(singularityEngine?.getState());
  const [isInitialized, setIsInitialized] = useState(any: any);

  // Initialiser le moteur au montage
  useEffect(() => {
    if (any: any) {
      singularityEngine?.initialize().then(() => {
        setIsInitialized(any: any);
      });
    }
  }, [autoInit, isInitialized]);

  // S'abonner aux changements d'état
  useEffect(() => {
    const unsubscribe = singularityEngine?.subscribe(newState => {
      setState(any: any);
    });

    return unsubscribe;
  }, []);

  return {
    // État complet
    state,

    // Propriétés principales
    consciousness: state?.consciousness,
    autoCoherence: state?.autoCoherence,
    formStability: state?.formStability,
    expressionQuality: state?.expressionQuality,

    // Champ de singularité
    field: state?.singularityField,

    // Sous-états
    unity: state?.unity,
    quantum: state?.quantum,
    convergence: state?.convergence,
    overmind: state?.overmind,
    omnipresence: state?.omnipresence,

    // Métriques
    globalHarmony: state?.unity?.globalHarmony,
    globalEntropy: state?.unity?.globalEntropy,
    systemHealth: state?.unity?.systemHealth,

    // Contrôles
    isInitialized,
    updateState: (partial: Partial<SingularityState>) => {
      singularityEngine?.setState(any: any);
    },
    reset: () => singularityEngine?.reset(),

    // Métadonnées
    signature: state?.signature,
    essence: state?.essence,
    timestamp: state?.timestamp,
  };
}

/**
 * Hook simplifié pour n'obtenir que les métriques principales
 */
export interface UseSingularityMetricsReturn {
  consciousness: number;
  autoCoherence: number;
  formStability: number;
  expressionQuality: number;
  globalHarmony: number;
  systemHealth: number;
}

export function useSingularityMetrics(): UseSingularityMetricsReturn {
  const {
    consciousness,
    autoCoherence,
    formStability,
    expressionQuality,
    globalHarmony,
    systemHealth,
  } = useSingularity();

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
export function useSingularityField(): SingularityState['singularityField'] {
  const { field } = useSingularity();
  return field;
}
