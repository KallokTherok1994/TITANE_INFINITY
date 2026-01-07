/**
 * TITANE∞ vΩ∞ — useTwinEvolution Hook
 * © 2025 TITANE∞ — Proprietary License
 * Hook React pour l'évolution du Numeric Twin
 */

import { useState, useEffect, useCallback } from 'react';
import { numericTwinService } from '../services/api/numericTwin';
import type {
  TwinEvolutionProfile,
  FusionIndex,
  TwinEvolutionResult,
  EvolutionPhase,
  GrowthTrends,
  AdjustmentSuggestion,
} from '../types/numericTwin';

interface UseTwinEvolutionReturn {
  // État
  evolutionProfile: TwinEvolutionProfile | null;
  fusionIndex: FusionIndex | null;
  isLoading: boolean;
  error: string | null;

  // Données dérivées
  currentPhase: EvolutionPhase | null;
  syncScore: number;
  growthTrends: GrowthTrends | null;
  suggestions: AdjustmentSuggestion[];

  // Actions
  refresh: () => Promise<void>;
  recalculateFusion: () => Promise<number>;
  transitionPhase: (validated?: boolean) => Promise<TwinEvolutionResult | null>;
  reinforceValue: (valueName: string) => Promise<TwinEvolutionResult | null>;
  adjustTrait: (traitName: string, delta: number) => Promise<TwinEvolutionResult | null>;
}

/**
 * Hook pour gérer l'évolution du Twin
 */
export function useTwinEvolution(): UseTwinEvolutionReturn {
  const [evolutionProfile, setEvolutionProfile] = useState<TwinEvolutionProfile | null>(
    null
  );
  const [fusionIndex, setFusionIndex] = useState<FusionIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profile, fusion] = await Promise.all([
        numericTwinService.getEvolutionProfile(),
        numericTwinService.getFusionIndex(),
      ]);
      setEvolutionProfile(profile);
      setFusionIndex(fusion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      logger.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recalculateFusion = useCallback(async (): Promise<number> => {
    try {
      const score = await numericTwinService.recalculateFusion();
      await fetchData(); // Refresh après recalcul
      return score;
    } catch (err) {
      logger.error('recalculateFusion error:', err);
      throw err;
    }
  }, [fetchData]);

  const transitionPhase = useCallback(
    async (validated = true): Promise<TwinEvolutionResult | null> => {
      try {
        const result = await numericTwinService.transitionPhase(validated);
        await fetchData();
        return result;
      } catch (err) {
        logger.error('transitionPhase error:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la transition');
        return null;
      }
    },
    [fetchData]
  );

  const reinforceValue = useCallback(
    async (valueName: string): Promise<TwinEvolutionResult | null> => {
      try {
        const result = await numericTwinService.reinforceValue(valueName);
        await fetchData();
        return result;
      } catch (err) {
        logger.error('reinforceValue error:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du renforcement');
        return null;
      }
    },
    [fetchData]
  );

  const adjustTrait = useCallback(
    async (traitName: string, delta: number): Promise<TwinEvolutionResult | null> => {
      try {
        const result = await numericTwinService.adjustTrait(traitName, delta);
        await fetchData();
        return result;
      } catch (err) {
        logger.error('adjustTrait error:', err);
        setError(err instanceof Error ? err.message : "Erreur lors de l'ajustement");
        return null;
      }
    },
    [fetchData]
  );

  return {
    evolutionProfile,
    fusionIndex,
    isLoading,
    error,
    currentPhase: evolutionProfile?.currentPhase ?? null,
    syncScore: evolutionProfile?.syncScore ?? 0,
    growthTrends: evolutionProfile?.growthTrends ?? null,
    suggestions: evolutionProfile?.adjustmentSuggestions ?? [],
    refresh: fetchData,
    recalculateFusion,
    transitionPhase,
    reinforceValue,
    adjustTrait,
  };
}
