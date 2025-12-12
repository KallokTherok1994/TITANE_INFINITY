/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — META-SINGULARITY HOOKS
 *   React Hooks for Meta-Singularity Kernel
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import {
  metaSingularityKernel,
  type MetaSingularityState,
  type MetaCoherence,
  type EmergentPhenomenon,
  type EngineConflict as _EngineConflict,
  type MetaInsight,
} from '@/engines/metasingularity/metaSingularityKernel';

/**
 * Hook principal: état complet Meta-Singularity
 */
export function useMetaSingularity() {
  const [state, setState] = useState<MetaSingularityState>(
    metaSingularityKernel.getState()
  );

  useEffect(() => {
    return metaSingularityKernel.subscribe(setState);
  }, []);

  return state;
}

/**
 * Hook: meta-coherence
 */
export function useMetaCoherence() {
  const [coherence, setCoherence] = useState<MetaCoherence>(
    metaSingularityKernel.getCoherence()
  );

  useEffect(() => {
    const update = (state: MetaSingularityState) => setCoherence(state.coherence);
    return metaSingularityKernel.subscribe(update);
  }, []);

  return coherence;
}

/**
 * Hook: global coherence score
 */
export function useGlobalCoherence() {
  const coherence = useMetaCoherence();
  return coherence.global;
}

/**
 * Hook: active emergences
 */
export function useActiveEmergences() {
  const [emergences, setEmergences] = useState<EmergentPhenomenon[]>([]);

  useEffect(() => {
    const update = () => {
      setEmergences(metaSingularityKernel.getActiveEmergences());
    };

    update();
    return metaSingularityKernel.subscribe(update);
  }, []);

  return emergences;
}

/**
 * Hook: recent insights
 */
export function useRecentInsights(count: number = 10) {
  const [insights, setInsights] = useState<MetaInsight[]>([]);

  useEffect(() => {
    const update = () => {
      setInsights(metaSingularityKernel.getRecentInsights(count));
    };

    update();
    return metaSingularityKernel.subscribe(update);
  }, [count]);

  return insights;
}

/**
 * Hook: unresolved conflicts
 */
export function useUnresolvedConflicts() {
  const state = useMetaSingularity();
  return state.unresolvedConflicts;
}

/**
 * Hook: orchestration quality
 */
export function useOrchestrationQuality() {
  const state = useMetaSingularity();
  return state.orchestrationQuality;
}

/**
 * Hook: system stability
 */
export function useSystemStability() {
  const state = useMetaSingularity();
  return state.systemStability;
}

/**
 * Hook: emergent complexity
 */
export function useEmergentComplexity() {
  const state = useMetaSingularity();
  return state.emergentComplexity;
}

/**
 * Hook: coherence trend
 */
export function useCoherenceTrend() {
  const coherence = useMetaCoherence();
  return coherence.trend;
}

/**
 * Hook: harmonics
 */
export function useHarmonics() {
  const coherence = useMetaCoherence();
  return coherence.harmonics;
}

/**
 * Hook: dissonance level
 */
export function useDissonance() {
  const coherence = useMetaCoherence();
  return coherence.dissonance;
}

/**
 * Hook: total emergences count
 */
export function useTotalEmergences() {
  const state = useMetaSingularity();
  return state.metrics.totalEmergences;
}

/**
 * Hook: total insights count
 */
export function useTotalInsights() {
  const state = useMetaSingularity();
  return state.metrics.totalInsights;
}

/**
 * Hook: average coherence
 */
export function useAverageCoherence() {
  const state = useMetaSingularity();
  return state.metrics.averageCoherence;
}

/**
 * Hook: actions
 */
export function useMetaSingularityActions() {
  return {
    initiateTransition: (
      toState: Partial<{
        identity: Record<string, unknown>;
        expression: Record<string, unknown>;
        holoPresence: Record<string, unknown>;
      }>,
      duration: number,
      strategy: 'smooth' | 'abrupt' | 'staged' | 'adaptive' = 'smooth'
    ) => {
      metaSingularityKernel.initiateTransition(toState, duration, strategy);
    },
  };
}
