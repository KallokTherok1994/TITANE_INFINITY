/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.38 — AUTOPOIESIS HOOKS
 *   React Hooks for Autopoiesis Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import {
  autopoiesisEngine,
  type AutopoiesisState,
  type EffectivePattern,
  type EvolutionRule,
  type OptimizationStrategy as _OptimizationStrategy,
} from '@/engines/autopoiesis/autopoiesisEngine';

/**
 * Hook principal: état complet Autopoiesis
 */
export function useAutopoiesis() {
  const [state, setState] = useState<AutopoiesisState>(autopoiesisEngine.getState());

  useEffect(() => {
    return autopoiesisEngine.subscribe(setState);
  }, []);

  return state;
}

/**
 * Hook: learning state
 */
export function useAutopoiesisLearning() {
  const state = useAutopoiesis();
  return state.learning;
}

/**
 * Hook: performance metrics
 */
export function useAutopoiesisPerformance() {
  const state = useAutopoiesis();
  return state.performance;
}

/**
 * Hook: effective patterns (top N)
 */
export function useEffectivePatterns(count: number = 10) {
  const [patterns, setPatterns] = useState<EffectivePattern[]>([]);

  useEffect(() => {
    const update = () => {
      setPatterns(autopoiesisEngine.getTopPatterns(count));
    };

    update();
    const unsubscribe = autopoiesisEngine.subscribe(update);
    return unsubscribe;
  }, [count]);

  return patterns;
}

/**
 * Hook: evolution rules
 */
export function useEvolutionRules() {
  const [rules, setRules] = useState<EvolutionRule[]>([]);

  useEffect(() => {
    const update = () => {
      setRules(autopoiesisEngine.getActiveRules());
    };

    update();
    const unsubscribe = autopoiesisEngine.subscribe(update);
    return unsubscribe;
  }, []);

  return rules;
}

/**
 * Hook: optimization strategies
 */
export function useOptimizationStrategies() {
  const state = useAutopoiesis();
  return state.optimization.strategies;
}

/**
 * Hook: current metrics
 */
export function useAutopoiesisMetrics() {
  const state = useAutopoiesis();
  return state.currentMetrics;
}

/**
 * Hook: total observations
 */
export function useTotalObservations() {
  const state = useAutopoiesis();
  return state.learning.totalObservations;
}

/**
 * Hook: patterns learned
 */
export function usePatternsLearned() {
  const state = useAutopoiesis();
  return state.learning.patternsLearned;
}

/**
 * Hook: average effectiveness
 */
export function useAverageEffectiveness() {
  const state = useAutopoiesis();
  return state.performance.averageEffectiveness;
}

/**
 * Hook: trend direction
 */
export function useTrendDirection() {
  const state = useAutopoiesis();
  return state.performance.trendDirection;
}

/**
 * Hook: actions
 */
export function useAutopoiesisActions() {
  return {
    toggleStrategy: (name: string, enabled: boolean) => {
      autopoiesisEngine.toggleStrategy(name, enabled);
    },
    resetLearning: () => {
      autopoiesisEngine.resetLearning();
    },
    suggestOptimalConfig: (context: {
      taskType: string;
      userMood: string;
      timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    }) => {
      return autopoiesisEngine.suggestOptimalConfig(context);
    },
  };
}
