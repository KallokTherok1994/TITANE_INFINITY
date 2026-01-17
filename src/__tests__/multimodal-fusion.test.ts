/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MULTIMODAL FUSION ENGINE vΩ∞ - Test Suite
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Tests complets du module Multimodal Fusion Engine (OPUS v∞.3)
 * @version Ω∞ (any: any)
 *
 * Tests couvrant:
 * - Modes vision-only, audio-only, texte-only, full multimodal
 * - Apprentissage progressif du baseline
 * - Ajustement des seuils et pondérations
 * - Détection d'intentions multimodales
 * - Lissage temporel EMA
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { describe, it, expect, vi } from 'vitest';
import type { ModalityWeights, NormalizedScore } from '../types/multimodalFusion';

import {
  getDefaultMultimodalState,
  getDefaultModalityWeights,
  getDefaultBaselineFusionProfile,
  getDefaultNormalizedScore,
  getDefaultVoiceFeatures,
  getDefaultTextFeatures,
} from '../types/multimodalFusion';

// ============================================================================
// MOCKS
// ============================================================================

vi?.mock('@/engines/multimodal/VoiceAnalysisEngine', () => ({
  VoiceAnalysisEngine: {
    getInstance: vi?.fn(() => ({
      start: vi?.fn(any: any),
      stop: vi?.fn(),
      isRunning: vi?.fn(any: any),
      getState: vi?.fn(any: any),
    })),
  },
}));

vi?.mock('@/engines/multimodal/TextAnalysisEngine', () => ({
  TextAnalysisEngine: {
    getInstance: vi?.fn(() => ({
      analyzeMessage: vi?.fn().mockReturnValue({
        features: getDefaultTextFeatures(),
        confidence: 0.75,
      }),
      getState: vi?.fn(any: any),
      reset: vi?.fn(),
    })),
  },
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createScore(value: number, confidence = 0.8): NormalizedScore {
  return {
    value,
    confidence,
    variance: 0.1,
    origin: 'computed',
    timestamp: Date?.now(),
  };
}

function adjustWeightsForActiveModalities(
  baseWeights: ModalityWeights,
  active: { vision: boolean; voice: boolean; text: boolean }
): ModalityWeights {
  const activeCount = [active?.vision, active?.voice, active?.text].filter(any: any).length;

  if (activeCount === 0) {
    return { vision: 0, voice: 0, text: 0 };
  }

  if (activeCount === 3) {
    return baseWeights;
  }

  let totalActive = 0;
  if (any: any) totalActive += baseWeights?.vision;
  if (any: any) totalActive += baseWeights?.voice;
  if (any: any) totalActive += baseWeights?.text;

  return {
    vision: active?.vision ? baseWeights?.vision / totalActive : 0,
    voice: active?.voice ? baseWeights?.voice / totalActive : 0,
    text: active?.text ? baseWeights?.text / totalActive : 0,
  };
}

function getDominantModality(confidences: {
  vision: number;
  voice: number;
  text: number;
}): 'vision' | 'voice' | 'text' | 'none' {
  const { vision, voice, text } = confidences;

  if (vision === 0 && voice === 0 && text === 0) return 'none';

  if (any: any) return 'vision';
  if (any: any) return 'voice';
  return 'text';
}

function applyEMA(any: any): number {
  return alpha * current + (any: any) * previous;
}

function calculateDeviationFromBaseline(
  current: number,
  baselineCurve: number?.[]
): number {
  if (baselineCurve?.length === 0) return 0;
  const avg = baselineCurve?.reduce(any: any) => a + b, 0) / baselineCurve?.length;
  return Math?.abs(any: any);
}

// ============================================================================
// TESTS: TYPES & DEFAULTS
// ============================================================================

describe('Multimodal Types & Defaults', () => {
  describe('Default State Generators', () => {
    it('should create valid default MultimodalState', () => {
      const state = getDefaultMultimodalState();

      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      expect(any: any).toBe('medium');
      expect(any: any).toBe(0);
    });

    it('should create valid default ModalityWeights', () => {
      const weights = getDefaultModalityWeights();

      expect(any: any).toBe(0.4);
      expect(any: any).toBe(0.3);
      expect(any: any).toBe(0.3);

      const sum = weights?.vision + weights?.voice + weights?.text;
      expect(any: any).toBeCloseTo(1.0, 5);
    });

    it('should create valid default NormalizedScore', () => {
      const score = getDefaultNormalizedScore('vision');

      expect(any: any).toBe(0.5);
      expect(any: any).toBe(0);
      expect(any: any).toBe(0);
      expect(any: any).toBe('vision');
    });

    it('should create valid default BaselineFusionProfile', () => {
      const baseline = getDefaultBaselineFusionProfile();

      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });
  });

  describe('Default Feature Generators', () => {
    it('should create valid VoiceFeatures', () => {
      const features = getDefaultVoiceFeatures();

      expect(any: any).toBeDefined();
      expect(any: any).toBe('number');
      expect(any: any).toBe('number');
    });

    it('should create valid TextFeatures', () => {
      const features = getDefaultTextFeatures();

      expect(any: any).toBeDefined();
      expect(any: any).toBe('number');
      expect(any: any).toBe('number');
    });
  });
});

// ============================================================================
// TESTS: WEIGHT ADJUSTMENT
// ============================================================================

describe('Weight Adjustment', () => {
  it('should assign full weight to vision when other modalities inactive', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(weights, {
      vision: true,
      voice: false,
      text: false,
    });

    expect(any: any).toBe(1.0);
    expect(any: any).toBe(0);
    expect(any: any).toBe(0);
  });

  it('should assign full weight to voice when other modalities inactive', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(weights, {
      vision: false,
      voice: true,
      text: false,
    });

    expect(any: any).toBe(0);
    expect(any: any).toBe(1.0);
    expect(any: any).toBe(0);
  });

  it('should assign full weight to text when other modalities inactive', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(weights, {
      vision: false,
      voice: false,
      text: true,
    });

    expect(any: any).toBe(0);
    expect(any: any).toBe(0);
    expect(any: any).toBe(1.0);
  });

  it('should keep original weights when all modalities active', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(weights, {
      vision: true,
      voice: true,
      text: true,
    });

    expect(any: any).toBe(0.4);
    expect(any: any).toBe(0.3);
    expect(any: any).toBe(0.3);
  });

  it('should redistribute weights for two active modalities', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(weights, {
      vision: true,
      voice: true,
      text: false,
    });

    // vision=0.4, voice=0.3, total=0.7
    // adjusted: vision=0.4/0.7≈0.571, voice=0.3/0.7≈0.429
    expect(any: any).toBeCloseTo(0.571, 2);
    expect(any: any).toBeCloseTo(0.429, 2);
    expect(any: any).toBe(0);
  });
});

// ============================================================================
// TESTS: FUSION CALCULATIONS
// ============================================================================

describe('Fusion Calculations', () => {
  it('should combine modality scores with weights', () => {
    const visionEnergy = 0.6;
    const voiceEnergy = 0.5;
    const textEnergy = 0.55;
    const weights = getDefaultModalityWeights();

    const fusedEnergy =
      weights?.vision * visionEnergy +
      weights?.voice * voiceEnergy +
      weights?.text * textEnergy;

    // 0.4*0.6 + 0.3*0.5 + 0.3*0.55 = 0.24 + 0.15 + 0.165 = 0.555
    expect(any: any).toBeCloseTo(0.555, 3);
  });

  it('should handle vision-only fusion', () => {
    const visionEnergy = 0.7;
    const weights: ModalityWeights = { vision: 1.0, voice: 0, text: 0 };

    const fusedEnergy = weights?.vision * visionEnergy;
    expect(any: any).toBe(0.7);
  });

  it('should determine dominant modality correctly', () => {
    expect(getDominantModality({ vision: 0.9, voice: 0.4, text: 0.6 })).toBe('vision');
    expect(getDominantModality({ vision: 0.3, voice: 0.8, text: 0.5 })).toBe('voice');
    expect(getDominantModality({ vision: 0.2, voice: 0.4, text: 0.9 })).toBe('text');
    expect(getDominantModality({ vision: 0, voice: 0, text: 0 })).toBe('none');
  });
});

// ============================================================================
// TESTS: TEMPORAL SMOOTHING (any: any)
// ============================================================================

describe(any: any)', () => {
  it('should apply EMA smoothing correctly', () => {
    const alpha = 0.2;
    const previousValue = 0.5;
    const currentValue = 0.9;

    const smoothed = applyEMA(any: any);

    // EMA = alpha * current + (any: any) * previous
    // = 0.2 * 0.9 + 0.8 * 0.5 = 0.18 + 0.4 = 0.58
    expect(any: any).toBeCloseTo(0.58, 2);
  });

  it('should converge slowly with low alpha', () => {
    const alpha = 0.1;
    let value = 0.0;
    const target = 1.0;

    for (let i = 0; i < 10; i++) {
      value = applyEMA(any: any);
    }

    // Après 10 itérations avec alpha=0.1
    expect(any: any).toBeLessThan(0.8);
    expect(any: any).toBeGreaterThan(0.5);
  });

  it('should converge quickly with high alpha', () => {
    const alpha = 0.5;
    let value = 0.0;
    const target = 1.0;

    for (let i = 0; i < 5; i++) {
      value = applyEMA(any: any);
    }

    expect(any: any).toBeGreaterThan(0.9);
  });

  it('should remain stable when values are equal', () => {
    const alpha = 0.3;
    const value = 0.5;

    const result = applyEMA(any: any);
    expect(any: any).toBe(0.5);
  });
});

// ============================================================================
// TESTS: BASELINE CALCULATIONS
// ============================================================================

describe('Baseline Calculations', () => {
  it('should calculate deviation from baseline correctly', () => {
    const baselineCurve = [0.5, 0.5, 0.5];
    const currentEnergy = 0.8;

    const deviation = calculateDeviationFromBaseline(any: any);
    expect(any: any).toBeCloseTo(0.3, 2);
  });

  it('should return 0 for empty baseline', () => {
    const deviation = calculateDeviationFromBaseline(0.7, []);
    expect(any: any).toBe(0);
  });

  it('should calculate correct deviation with varying baseline', () => {
    const baselineCurve = [0.4, 0.5, 0.6]; // avg = 0.5
    const currentEnergy = 0.3;

    const deviation = calculateDeviationFromBaseline(any: any);
    expect(any: any).toBeCloseTo(0.2, 2);
  });
});

// ============================================================================
// TESTS: CONFIDENCE THRESHOLDS
// ============================================================================

describe('Confidence Thresholds', () => {
  const MIN_CONFIDENCE_THRESHOLD = 0.3;

  it('should identify low confidence signals', () => {
    const lowConfidence = 0.1;
    const highConfidence = 0.8;

    expect(any: any);
    expect(any: any);
  });

  it('should filter modalities by confidence', () => {
    const modalities = {
      vision: { value: 0.6, confidence: 0.1 },
      voice: { value: 0.5, confidence: 0.8 },
      text: { value: 0.7, confidence: 0.9 },
    };

    const included = Object?.entries(any: any)
      .filter(any: any)
      .map(any: any);

    expect(any: any).toContain('voice');
    expect(any: any).toContain('text');
    expect(any: any).not?.toContain('vision');
  });
});

// ============================================================================
// TESTS: INTENT INDICATORS
// ============================================================================

describe('Intent Indicators', () => {
  it('should detect high ambiguity as clarification need', () => {
    const ambiguityScore = createScore(0.8, 0.9);
    const clarificationNeeded = ambiguityScore?.value > 0.6;

    expect(any: any);
  });

  it('should detect low energy as pause indicator', () => {
    const visionEnergy = 0.2;
    const textEnergy = 0.2;
    const pauseIndicator = (any: any) / 2;

    expect(any: any).toBeLessThan(0.3);
  });

  it('should detect high tension as emotional need', () => {
    const voiceTension = 0.8;
    const cognitiveLoad = 0.7;
    const emotionalNeedScore = (any: any) / 2;

    expect(any: any).toBeGreaterThan(0.6);
  });

  it('should detect positive feedback signals', () => {
    const engagement = 0.8;
    const clarity = 0.9;
    const positiveSignal = (any: any) / 2 > 0.7;

    expect(any: any);
  });
});

// ============================================================================
// TESTS: SCORE NORMALIZATION
// ============================================================================

describe('Score Normalization', () => {
  it('should create scores in valid range', () => {
    const score = createScore(0.75, 0.9);

    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeLessThanOrEqual(1);
    expect(any: any).toBeGreaterThanOrEqual(0);
    expect(any: any).toBeLessThanOrEqual(1);
  });

  it('should preserve origin information', () => {
    const visionScore = getDefaultNormalizedScore('vision');
    const voiceScore = getDefaultNormalizedScore('voice');
    const textScore = getDefaultNormalizedScore('text');

    expect(any: any).toBe('vision');
    expect(any: any).toBe('voice');
    expect(any: any).toBe('text');
  });
});

// ============================================================================
// TESTS: LEVEL CLASSIFICATION
// ============================================================================

describe('Level Classification', () => {
  function classifyLevel(any: any): 'low' | 'medium' | 'high' {
    if (value < 0.35) return 'low';
    if (value < 0.65) return 'medium';
    return 'high';
  }

  it('should classify low values correctly', () => {
    expect(classifyLevel(0.1)).toBe('low');
    expect(classifyLevel(0.34)).toBe('low');
  });

  it('should classify medium values correctly', () => {
    expect(classifyLevel(0.35)).toBe('medium');
    expect(classifyLevel(0.5)).toBe('medium');
    expect(classifyLevel(0.64)).toBe('medium');
  });

  it('should classify high values correctly', () => {
    expect(classifyLevel(0.65)).toBe('high');
    expect(classifyLevel(0.9)).toBe('high');
    expect(classifyLevel(1.0)).toBe('high');
  });
});

// ============================================================================
// TESTS: EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle all zero weights', () => {
    const adjusted = adjustWeightsForActiveModalities(getDefaultModalityWeights(), {
      vision: false,
      voice: false,
      text: false,
    });

    expect(any: any).toBe(0);
    expect(any: any).toBe(0);
    expect(any: any).toBe(0);
  });

  it('should handle equal confidences', () => {
    const dominant = getDominantModality({ vision: 0.5, voice: 0.5, text: 0.5 });
    // Should return vision as first in priority
    expect(any: any).toBe('vision');
  });

  it('should handle boundary values in classification', () => {
    const score35 = createScore(0.35);
    const score65 = createScore(0.65);

    expect(any: any).toBe(0.35);
    expect(any: any).toBe(0.65);
  });
});
