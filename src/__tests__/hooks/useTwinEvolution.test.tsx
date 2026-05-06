import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@/test-utils';
import { useTwinEvolution } from '@/hooks/useTwinEvolution';
import {
  numericTwinService,
  persistTwinChatContextSnapshot,
} from '@/services/api/numericTwin';

vi.mock('@/services/api/numericTwin', () => ({
  numericTwinService: {
    getEvolutionProfile: vi.fn(),
    getFusionIndex: vi.fn(),
    getState: vi.fn(),
    recalculateFusion: vi.fn(),
    transitionPhase: vi.fn(),
    reinforceValue: vi.fn(),
    adjustTrait: vi.fn(),
  },
  OWNER_TWIN_RESONANCE: {
    ownerThemes: ['présence'],
    sourceCount: 42,
    reflectionAxis: 'clarté',
    portraitUrl: '/portrait.jpg',
    portraitFallbackUrl: '/portrait.svg',
  },
  persistTwinChatContextSnapshot: vi.fn(),
}));

describe('useTwinEvolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(numericTwinService.getEvolutionProfile).mockResolvedValue({
      currentPhase: 'Observation',
      milestonesCount: 1,
      growthTrends: {
        cognitiveGrowth: 0.2,
        emotionalGrowth: 0.3,
        spiritualGrowth: 0.4,
        entrepreneurialGrowth: 0.5,
      },
      adjustmentSuggestions: [],
      syncScore: 0.66,
    });
    vi.mocked(numericTwinService.getFusionIndex).mockResolvedValue({
      globalScore: 0.71,
      valueAlignment: 0.6,
      cognitiveAlignment: 0.7,
      styleAlignment: 0.8,
      therapeuticAlignment: 0.5,
      creativeAlignment: 0.4,
      evolutionAlignment: 0.9,
      trend: 'Improving',
    });
    vi.mocked(numericTwinService.getState).mockResolvedValue({
      identityCore: { name: 'Twin', signature: 'sig', coreValues: [], humanStyle: { sincerity: 0.5, gentleIntensity: 0.5, accessibleDepth: 0.5, calmPrecision: 0.5, organicFluidity: 0.5 }, fusionIndex: 0.71, version: '1', },
      valueMap: { observedValues: [], confirmedValues: [], alignmentScore: 0.2 },
      cognitivePatterns: { reasoningPatterns: [], structuringStyle: { simpleToComplex: 0.1, structureLevel: 0.2, hierarchyPreference: 0.3, visualPreference: 0.4 } },
      therapeuticModel: { deepListening: 0.1, rhythmRespect: 0.2, relationalClarity: 0.3, supportPrecision: 0.4, nonDirectiveGuidance: 0.5, holisticIntegration: 0.6 },
      creativeSignature: { operationalIntuition: 0.1, artisticSense: 0.2, symbolicSense: 0.3, structuralCreativity: 0.4, methodologicalInnovation: 0.5, embodiedNarration: 0.6, frameworksCount: 3 },
      evolutionProfile: {
        currentPhase: 'Observation',
        milestonesCount: 1,
        growthTrends: {
          cognitiveGrowth: 0.2,
          emotionalGrowth: 0.3,
          spiritualGrowth: 0.4,
          entrepreneurialGrowth: 0.5,
        },
        adjustmentSuggestions: [],
        syncScore: 0.66,
      },
      fusionIndex: {
        globalScore: 0.71,
        valueAlignment: 0.6,
        cognitiveAlignment: 0.7,
        styleAlignment: 0.8,
        therapeuticAlignment: 0.5,
        creativeAlignment: 0.4,
        evolutionAlignment: 0.9,
        trend: 'Improving',
      },
    });
  });

  it('persists the shared Twin snapshot after the initial fetch', async () => {
    const { result } = renderHook(() => useTwinEvolution());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentPhase).toBe('Observation');
    expect(result.current.syncScore).toBe(0.66);
    expect(persistTwinChatContextSnapshot).toHaveBeenCalledTimes(1);
    expect(persistTwinChatContextSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        fusion: expect.objectContaining({ globalScore: 0.71, trend: 'Improving' }),
        profile: expect.objectContaining({ currentPhase: 'Observation', syncScore: 0.66 }),
      })
    );
  });

  it('refreshes data and persists again after recalculateFusion', async () => {
    vi.mocked(numericTwinService.recalculateFusion).mockResolvedValue(0.92);

    const { result } = renderHook(() => useTwinEvolution());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(persistTwinChatContextSnapshot).mockClear();

    let score = 0;
    await act(async () => {
      score = await result.current.recalculateFusion();
    });

    await waitFor(() => {
      expect(persistTwinChatContextSnapshot).toHaveBeenCalledTimes(1);
    });

    expect(score).toBe(0.92);
    expect(numericTwinService.recalculateFusion).toHaveBeenCalledTimes(1);
  });
});