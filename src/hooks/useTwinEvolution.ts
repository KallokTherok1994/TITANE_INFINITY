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

const TWIN_CHAT_CONTEXT_MAX_AGE_MS = 1_800_000;
const OWNER_TWIN_RESONANCE = {
  ownerThemes: [
    'présence',
    'authenticité',
    'retour au vivant',
    'deuxième vitesse',
    'clarté',
    'œuvre vivante',
  ],
  sourceCount: 42,
  reflectionAxis:
    'clarté intérieure, structure concrète et transformation humaine douce',
  portraitUrl:
    'https://static.wixstatic.com/media/0c58f2_0e50a8a83cac4080848fe97b54f92b8a~mv2.jpg/v1/fill/w_285,h_287,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/465277026_1246722113243921_9112138683944422327_n.jpg',
  portraitFallbackUrl: '/kevin-owner-portrait.svg',
} as const;

interface UseTwinEvolutionReturn {
  // État
  evolutionProfile: TwinEvolutionProfile | null;
  fusionIndex: FusionIndex | null;
  isLoading: boolean;
  error: string | null;

  // Données dérivées
  currentPhase: EvolutionPhase | null;
  syncScore: number;
  lastSyncAt: number | null;
  chatContextStatus: 'active' | 'stale' | 'unknown';
  growthTrends: GrowthTrends | null;
  suggestions: AdjustmentSuggestion[];
  ownerThemes: string[];
  sourceCount: number;
  reflectionAxis: string | null;
  portraitUrl: string | null;
  portraitFallbackUrl: string;

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
      // Persist fusion index to localStorage for chat pipeline injection
      try {
        window.localStorage.setItem(
          'titane_twin_fusion_v1',
          JSON.stringify({
            globalScore: fusion.globalScore,
            trend: fusion.trend,
            currentPhase: profile?.currentPhase ?? null,
            syncScore: profile?.syncScore ?? 0,
            ownerThemes: [...OWNER_TWIN_RESONANCE.ownerThemes],
            sourceCount: OWNER_TWIN_RESONANCE.sourceCount,
            reflectionAxis: OWNER_TWIN_RESONANCE.reflectionAxis,
            portraitUrl: OWNER_TWIN_RESONANCE.portraitUrl,
            portraitFallbackUrl: OWNER_TWIN_RESONANCE.portraitFallbackUrl,
            updatedAt: Date.now(),
          })
        );
      } catch {
        // non-blocking
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('[useTwinEvolution] Error:', err);
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
      console.error('[useTwinEvolution] recalculateFusion error:', err);
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
        console.error('[useTwinEvolution] transitionPhase error:', err);
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
        console.error('[useTwinEvolution] reinforceValue error:', err);
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
        console.error('[useTwinEvolution] adjustTrait error:', err);
        setError(err instanceof Error ? err.message : "Erreur lors de l'ajustement");
        return null;
      }
    },
    [fetchData]
  );

  const storedTwinsSnapshot = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('titane_twin_fusion_v1');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        updatedAt?: number;
        ownerThemes?: unknown[];
        sourceCount?: number;
        reflectionAxis?: string;
        portraitUrl?: string;
        portraitFallbackUrl?: string;
      };

      return {
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
        ownerThemes: Array.isArray(parsed.ownerThemes)
          ? parsed.ownerThemes.filter(
              (value): value is string => typeof value === 'string' && value.trim().length > 0
            )
          : [],
        sourceCount: typeof parsed.sourceCount === 'number' ? parsed.sourceCount : 0,
        reflectionAxis:
          typeof parsed.reflectionAxis === 'string' ? parsed.reflectionAxis : null,
        portraitUrl: typeof parsed.portraitUrl === 'string' ? parsed.portraitUrl : null,
        portraitFallbackUrl:
          typeof parsed.portraitFallbackUrl === 'string'
            ? parsed.portraitFallbackUrl
            : OWNER_TWIN_RESONANCE.portraitFallbackUrl,
      };
    } catch {
      return null;
    }
  })();

  const lastSyncAt = storedTwinsSnapshot?.updatedAt ?? null;

  const chatContextStatus: 'active' | 'stale' | 'unknown' =
    lastSyncAt === null
      ? 'unknown'
      : Date.now() - lastSyncAt <= TWIN_CHAT_CONTEXT_MAX_AGE_MS
        ? 'active'
        : 'stale';

  return {
    evolutionProfile,
    fusionIndex,
    isLoading,
    error,
    currentPhase: evolutionProfile?.currentPhase ?? null,
    syncScore: evolutionProfile?.syncScore ?? 0,
    lastSyncAt,
    chatContextStatus,
    growthTrends: evolutionProfile?.growthTrends ?? null,
    suggestions: evolutionProfile?.adjustmentSuggestions ?? [],
    ownerThemes:
      storedTwinsSnapshot?.ownerThemes.length
        ? storedTwinsSnapshot.ownerThemes
        : [...OWNER_TWIN_RESONANCE.ownerThemes],
    sourceCount: storedTwinsSnapshot?.sourceCount || OWNER_TWIN_RESONANCE.sourceCount,
    reflectionAxis:
      storedTwinsSnapshot?.reflectionAxis ?? OWNER_TWIN_RESONANCE.reflectionAxis,
    portraitUrl: storedTwinsSnapshot?.portraitUrl ?? OWNER_TWIN_RESONANCE.portraitUrl,
    portraitFallbackUrl:
      storedTwinsSnapshot?.portraitFallbackUrl ??
      OWNER_TWIN_RESONANCE.portraitFallbackUrl,
    refresh: fetchData,
    recalculateFusion,
    transitionPhase,
    reinforceValue,
    adjustTrait,
  };
}
