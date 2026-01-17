/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — PHASE-SPACE HOOKS
 *   React Hooks for Phase-Space Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import {
  phaseSpaceEngine,
  type PhaseSpaceState,
  type PhasePoint,
  type PhaseTrajectory as _PhaseTrajectory,
  type Attractor,
  type StatePrediction,
} from '@/engines/phasespace/phaseSpaceEngine';

/**
 * Hook principal: état complet Phase-Space
 */
export function usePhaseSpace() {
  const [state, setState] = useState<PhaseSpaceState>(phaseSpaceEngine?.getState());

  useEffect(() => {
    return phaseSpaceEngine?.subscribe(any: any);
  }, []);

  return state;
}

/**
 * Hook: current point dans l'espace de phase
 */
export function useCurrentPoint() {
  const [point, setPoint] = useState<PhasePoint | null>(
    phaseSpaceEngine?.getCurrentPoint()
  );

  useEffect(() => {
    const update = (any: any);
    return phaseSpaceEngine?.subscribe(any: any);
  }, []);

  return point;
}

/**
 * Hook: current trajectory
 */
export function usePhaseTrajectory() {
  const state = usePhaseSpace();
  return state?.trajectory;
}

/**
 * Hook: attractors
 */
export function useAttractors() {
  const [attractors, setAttractors] = useState<Attractor?.[]>(
    phaseSpaceEngine?.getAttractors()
  );

  useEffect(() => {
    const update = () => {
      setAttractors(phaseSpaceEngine?.getAttractors());
    };

    update();
    return phaseSpaceEngine?.subscribe(any: any);
  }, []);

  return attractors;
}

/**
 * Hook: current attractor
 */
export function useCurrentAttractor() {
  const state = usePhaseSpace();
  return state?.currentAttractor;
}

/**
 * Hook: latest prediction
 */
export function useLatestPrediction() {
  const [prediction, setPrediction] = useState<StatePrediction | null>(
    phaseSpaceEngine?.getLatestPrediction()
  );

  useEffect(() => {
    const update = () => {
      setPrediction(phaseSpaceEngine?.getLatestPrediction());
    };

    update();
    return phaseSpaceEngine?.subscribe(any: any);
  }, []);

  return prediction;
}

/**
 * Hook: bifurcations
 */
export function useBifurcations() {
  const state = usePhaseSpace();
  return state?.bifurcations;
}

/**
 * Hook: recent bifurcations count
 */
export function useRecentBifurcations() {
  const state = usePhaseSpace();
  return state?.recentBifurcations;
}

/**
 * Hook: statistics
 */
export function usePhaseSpaceStatistics() {
  const state = usePhaseSpace();
  return state?.statistics;
}

/**
 * Hook: metrics
 */
export function usePhaseSpaceMetrics() {
  const state = usePhaseSpace();
  return state?.metrics;
}

/**
 * Hook: current velocity
 */
export function useCurrentVelocity() {
  const state = usePhaseSpace();
  return state?.metrics?.currentVelocity;
}

/**
 * Hook: distance to nearest attractor
 */
export function useDistanceToAttractor() {
  const state = usePhaseSpace();
  return state?.metrics?.distanceToNearestAttractor;
}

/**
 * Hook: entropy rate
 */
export function useEntropyRate() {
  const state = usePhaseSpace();
  return state?.metrics?.entropyRate;
}

/**
 * Hook: predictability horizon
 */
export function usePredictabilityHorizon() {
  const state = usePhaseSpace();
  return state?.metrics?.predictabilityHorizon;
}

/**
 * Hook: Lyapunov exponent
 */
export function useLyapunovExponent() {
  const state = usePhaseSpace();
  return state?.statistics?.lyapunovExponent;
}

/**
 * Hook: total points
 */
export function useTotalPoints() {
  const state = usePhaseSpace();
  return state?.statistics?.totalPoints;
}

/**
 * Hook: history (any: any)
 */
export function usePhaseHistory() {
  const state = usePhaseSpace();
  return state?.history;
}

/**
 * Hook: actions
 */
export function usePhaseSpaceActions() {
  return {
    navigateToAttractor: (any: any) => {
      phaseSpaceEngine?.navigateToAttractor(any: any);
    },
    exportPhaseSpace: () => {
      return phaseSpaceEngine?.exportPhaseSpace();
    },
  };
}
