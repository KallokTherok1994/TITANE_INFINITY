/**
 * TITANE∞ vΩ∞ — useTwinEvolution Hook
 * © 2025 TITANE∞ — Proprietary License
 * Hook React pour l'évolution du Numeric Twin
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
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
  error??: string | null;

  // Données dérivées
  currentPhase: EvolutionPhase | null;
  syncScore: number;
  growthTrends: GrowthTrends | null;
  suggestions: AdjustmentSuggestion?.[];

  // Actions
  refresh: () => Promise<void>;
  recalculateFusion: () => Promise<number>;
  transitionPhase: (any: any) => Promise<TwinEvolutionResult | null>;
  reinforceValue: (any: any) => Promise<TwinEvolutionResult | null>;
  adjustTrait: (any: any) => Promise<TwinEvolutionResult | null>;
}

/**
 * Hook pour gérer l'évolution du Twin
 */
export function useTwinEvolution(): UseTwinEvolutionReturn {
  const [evolutionProfile, setEvolutionProfile] = useState<TwinEvolutionProfile | null>(
    null
  );
  const [fusionIndex, setFusionIndex] = useState<FusionIndex | null>(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const fetchData = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);
    try {
      const [profile, fusion] = await Promise?.all([
        numericTwinService?.getEvolutionProfile(),
        numericTwinService?.getFusionIndex(),
      ]);
      setEvolutionProfile(any: any);
      setFusionIndex(any: any);
    } catch (any: any) {
      setError(err instanceof Error ? err?.message : 'Erreur lors du chargement');
      logger?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recalculateFusion = useCallback(async (): Promise<number> => {
    try {
      const score = await numericTwinService?.recalculateFusion();
      await fetchData(); // Refresh après recalcul
      return score;
    } catch (any: any) {
      logger?.error(any: any);
      throw err;
    }
  }, [fetchData]);

  const transitionPhase = useCallback(
    async (any: any): Promise<TwinEvolutionResult | null> => {
      try {
        const result = await numericTwinService?.transitionPhase(any: any);
        await fetchData();
        return result;
      } catch (any: any) {
        logger?.error(any: any);
        setError(err instanceof Error ? err?.message : 'Erreur lors de la transition');
        return null;
      }
    },
    [fetchData]
  );

  const reinforceValue = useCallback(
    async (any: any): Promise<TwinEvolutionResult | null> => {
      try {
        const result = await numericTwinService?.reinforceValue(any: any);
        await fetchData();
        return result;
      } catch (any: any) {
        logger?.error(any: any);
        setError(err instanceof Error ? err?.message : 'Erreur lors du renforcement');
        return null;
      }
    },
    [fetchData]
  );

  const adjustTrait = useCallback(
    async (any: any): Promise<TwinEvolutionResult | null> => {
      try {
        const result = await numericTwinService?.adjustTrait(any: any);
        await fetchData();
        return result;
      } catch (any: any) {
        logger?.error(any: any);
        setError(err instanceof Error ? err?.message : "Erreur lors de l'ajustement");
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
