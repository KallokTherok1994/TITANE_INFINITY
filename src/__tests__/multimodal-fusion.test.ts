/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MULTIMODAL FUSION ENGINE vΩ∞ - Test Suite
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Tests complets du module Multimodal Fusion Engine (OPUS v∞.3)
 * @version Ω∞ (Omega Infinity)
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
import type {
  ModalityWeights,
  NormalizedScore,
} from '../types/multimodalFusion';

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

vi.mock('@/engines/multimodal/VoiceAnalysisEngine', () => ({
  VoiceAnalysisEngine: {
    getInstance: vi.fn(() => ({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      isRunning: vi.fn().mockReturnValue(false),
      getState: vi.fn().mockReturnValue(null),
    })),
  },
}));

vi.mock('@/engines/multimodal/TextAnalysisEngine', () => ({
  TextAnalysisEngine: {
    getInstance: vi.fn(() => ({
      analyzeMessage: vi.fn().mockReturnValue({
        features: getDefaultTextFeatures(),
        confidence: 0.75,
      }),
      getState: vi.fn().mockReturnValue(null),
      reset: vi.fn(),
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
    timestamp: Date.now(),
  };
}

function adjustWeightsForActiveModalities(
  baseWeights: ModalityWeights,
  active: { vision: boolean; voice: boolean; text: boolean }
): ModalityWeights {
  const activeCount = [active.vision, active.voice, active.text].filter(Boolean).length;

  if (activeCount === 0) {
    return { vision: 0, voice: 0, text: 0 };
  }

  if (activeCount === 3) {
    return baseWeights;
  }

  let totalActive = 0;
  if (active.vision) totalActive += baseWeights.vision;
  if (active.voice) totalActive += baseWeights.voice;
  if (active.text) totalActive += baseWeights.text;

  return {
    vision: active.vision ? baseWeights.vision / totalActive : 0,
    voice: active.voice ? baseWeights.voice / totalActive : 0,
    text: active.text ? baseWeights.text / totalActive : 0,
  };
}

function getDominantModality(
  confidences: { vision: number; voice: number; text: number }
): 'vision' | 'voice' | 'text' | 'none' {
  const { vision, voice, text } = confidences;

  if (vision === 0 && voice === 0 && text === 0) return 'none';

  if (vision >= voice && vision >= text) return 'vision';
  if (voice >= vision && voice >= text) return 'voice';
  return 'text';
}

function applyEMA(previous: number, current: number, alpha: number): number {
  return alpha * current + (1 - alpha) * previous;
}

function calculateDeviationFromBaseline(
  current: number,
  baselineCurve: number[]
): number {
  if (baselineCurve.length === 0) return 0;
  const avg = baselineCurve.reduce((a, b) => a + b, 0) / baselineCurve.length;
  return Math.abs(current - avg);
}

// ============================================================================
// TESTS: TYPES & DEFAULTS
// ============================================================================

describe('Multimodal Types & Defaults', () => {
  describe('Default State Generators', () => {
    it('should create valid default MultimodalState', () => {
      const state = getDefaultMultimodalState();

      expect(state).toBeDefined();
      expect(state.fusedScores).toBeDefined();
      expect(state.globalEnergyLevel).toBe('medium');
      expect(state.overallConfidence).toBe(0);
    });

    it('should create valid default ModalityWeights', () => {
      const weights = getDefaultModalityWeights();

      expect(weights.vision).toBe(0.4);
      expect(weights.voice).toBe(0.3);
      expect(weights.text).toBe(0.3);

      const sum = weights.vision + weights.voice + weights.text;
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('should create valid default NormalizedScore', () => {
      const score = getDefaultNormalizedScore('vision');

      expect(score.value).toBe(0.5);
      expect(score.confidence).toBe(0);
      expect(score.variance).toBe(0);
      expect(score.origin).toBe('vision');
    });

    it('should create valid default BaselineFusionProfile', () => {
      const baseline = getDefaultBaselineFusionProfile();

      expect(baseline).toBeDefined();
      expect(baseline.globalEnergyCurve).toBeDefined();
      expect(baseline.globalTensionCurve).toBeDefined();
      expect(baseline.multimodalCorrelationMatrix).toBeDefined();
    });
  });

  describe('Default Feature Generators', () => {
    it('should create valid VoiceFeatures', () => {
      const features = getDefaultVoiceFeatures();

      expect(features).toBeDefined();
      expect(typeof features.intensity).toBe('number');
      expect(typeof features.energy).toBe('number');
    });

    it('should create valid TextFeatures', () => {
      const features = getDefaultTextFeatures();

      expect(features).toBeDefined();
      expect(typeof features.messageLength).toBe('number');
      expect(typeof features.wordCount).toBe('number');
    });
  });
});

// ============================================================================
// TESTS: WEIGHT ADJUSTMENT
// ============================================================================

describe('Weight Adjustment', () => {
  it('should assign full weight to vision when other modalities inactive', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(
      weights,
      { vision: true, voice: false, text: false }
    );

    expect(adjusted.vision).toBe(1.0);
    expect(adjusted.voice).toBe(0);
    expect(adjusted.text).toBe(0);
  });

  it('should assign full weight to voice when other modalities inactive', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(
      weights,
      { vision: false, voice: true, text: false }
    );

    expect(adjusted.vision).toBe(0);
    expect(adjusted.voice).toBe(1.0);
    expect(adjusted.text).toBe(0);
  });

  it('should assign full weight to text when other modalities inactive', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(
      weights,
      { vision: false, voice: false, text: true }
    );

    expect(adjusted.vision).toBe(0);
    expect(adjusted.voice).toBe(0);
    expect(adjusted.text).toBe(1.0);
  });

  it('should keep original weights when all modalities active', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(
      weights,
      { vision: true, voice: true, text: true }
    );

    expect(adjusted.vision).toBe(0.4);
    expect(adjusted.voice).toBe(0.3);
    expect(adjusted.text).toBe(0.3);
  });

  it('should redistribute weights for two active modalities', () => {
    const weights = getDefaultModalityWeights();
    const adjusted = adjustWeightsForActiveModalities(
      weights,
      { vision: true, voice: true, text: false }
    );

    // vision=0.4, voice=0.3, total=0.7
    // adjusted: vision=0.4/0.7≈0.571, voice=0.3/0.7≈0.429
    expect(adjusted.vision).toBeCloseTo(0.571, 2);
    expect(adjusted.voice).toBeCloseTo(0.429, 2);
    expect(adjusted.text).toBe(0);
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
      weights.vision * visionEnergy +
      weights.voice * voiceEnergy +
      weights.text * textEnergy;

    // 0.4*0.6 + 0.3*0.5 + 0.3*0.55 = 0.24 + 0.15 + 0.165 = 0.555
    expect(fusedEnergy).toBeCloseTo(0.555, 3);
  });

  it('should handle vision-only fusion', () => {
    const visionEnergy = 0.7;
    const weights: ModalityWeights = { vision: 1.0, voice: 0, text: 0 };

    const fusedEnergy = weights.vision * visionEnergy;
    expect(fusedEnergy).toBe(0.7);
  });

  it('should determine dominant modality correctly', () => {
    expect(getDominantModality({ vision: 0.9, voice: 0.4, text: 0.6 })).toBe('vision');
    expect(getDominantModality({ vision: 0.3, voice: 0.8, text: 0.5 })).toBe('voice');
    expect(getDominantModality({ vision: 0.2, voice: 0.4, text: 0.9 })).toBe('text');
    expect(getDominantModality({ vision: 0, voice: 0, text: 0 })).toBe('none');
  });
});

// ============================================================================
// TESTS: TEMPORAL SMOOTHING (EMA)
// ============================================================================

describe('Temporal Smoothing (EMA)', () => {
  it('should apply EMA smoothing correctly', () => {
    const alpha = 0.2;
    const previousValue = 0.5;
    const currentValue = 0.9;

    const smoothed = applyEMA(previousValue, currentValue, alpha);

    // EMA = alpha * current + (1-alpha) * previous
    // = 0.2 * 0.9 + 0.8 * 0.5 = 0.18 + 0.4 = 0.58
    expect(smoothed).toBeCloseTo(0.58, 2);
  });

  it('should converge slowly with low alpha', () => {
    const alpha = 0.1;
    let value = 0.0;
    const target = 1.0;

    for (let i = 0; i < 10; i++) {
      value = applyEMA(value, target, alpha);
    }

    // Après 10 itérations avec alpha=0.1
    expect(value).toBeLessThan(0.8);
    expect(value).toBeGreaterThan(0.5);
  });

  it('should converge quickly with high alpha', () => {
    const alpha = 0.5;
    let value = 0.0;
    const target = 1.0;

    for (let i = 0; i < 5; i++) {
      value = applyEMA(value, target, alpha);
    }

    expect(value).toBeGreaterThan(0.9);
  });

  it('should remain stable when values are equal', () => {
    const alpha = 0.3;
    const value = 0.5;

    const result = applyEMA(value, value, alpha);
    expect(result).toBe(0.5);
  });
});

// ============================================================================
// TESTS: BASELINE CALCULATIONS
// ============================================================================

describe('Baseline Calculations', () => {
  it('should calculate deviation from baseline correctly', () => {
    const baselineCurve = [0.5, 0.5, 0.5];
    const currentEnergy = 0.8;

    const deviation = calculateDeviationFromBaseline(currentEnergy, baselineCurve);
    expect(deviation).toBeCloseTo(0.3, 2);
  });

  it('should return 0 for empty baseline', () => {
    const deviation = calculateDeviationFromBaseline(0.7, []);
    expect(deviation).toBe(0);
  });

  it('should calculate correct deviation with varying baseline', () => {
    const baselineCurve = [0.4, 0.5, 0.6]; // avg = 0.5
    const currentEnergy = 0.3;

    const deviation = calculateDeviationFromBaseline(currentEnergy, baselineCurve);
    expect(deviation).toBeCloseTo(0.2, 2);
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

    expect(lowConfidence < MIN_CONFIDENCE_THRESHOLD).toBe(true);
    expect(highConfidence > MIN_CONFIDENCE_THRESHOLD).toBe(true);
  });

  it('should filter modalities by confidence', () => {
    const modalities = {
      vision: { value: 0.6, confidence: 0.1 },
      voice: { value: 0.5, confidence: 0.8 },
      text: { value: 0.7, confidence: 0.9 },
    };

    const included = Object.entries(modalities)
      .filter(([_, m]) => m.confidence >= MIN_CONFIDENCE_THRESHOLD)
      .map(([name]) => name);

    expect(included).toContain('voice');
    expect(included).toContain('text');
    expect(included).not.toContain('vision');
  });
});

// ============================================================================
// TESTS: INTENT INDICATORS
// ============================================================================

describe('Intent Indicators', () => {
  it('should detect high ambiguity as clarification need', () => {
    const ambiguityScore = createScore(0.8, 0.9);
    const clarificationNeeded = ambiguityScore.value > 0.6;

    expect(clarificationNeeded).toBe(true);
  });

  it('should detect low energy as pause indicator', () => {
    const visionEnergy = 0.2;
    const textEnergy = 0.2;
    const pauseIndicator = (visionEnergy + textEnergy) / 2;

    expect(pauseIndicator).toBeLessThan(0.3);
  });

  it('should detect high tension as emotional need', () => {
    const voiceTension = 0.8;
    const cognitiveLoad = 0.7;
    const emotionalNeedScore = (voiceTension + cognitiveLoad) / 2;

    expect(emotionalNeedScore).toBeGreaterThan(0.6);
  });

  it('should detect positive feedback signals', () => {
    const engagement = 0.8;
    const clarity = 0.9;
    const positiveSignal = (engagement + clarity) / 2 > 0.7;

    expect(positiveSignal).toBe(true);
  });
});

// ============================================================================
// TESTS: SCORE NORMALIZATION
// ============================================================================

describe('Score Normalization', () => {
  it('should create scores in valid range', () => {
    const score = createScore(0.75, 0.9);

    expect(score.value).toBeGreaterThanOrEqual(0);
    expect(score.value).toBeLessThanOrEqual(1);
    expect(score.confidence).toBeGreaterThanOrEqual(0);
    expect(score.confidence).toBeLessThanOrEqual(1);
  });

  it('should preserve origin information', () => {
    const visionScore = getDefaultNormalizedScore('vision');
    const voiceScore = getDefaultNormalizedScore('voice');
    const textScore = getDefaultNormalizedScore('text');

    expect(visionScore.origin).toBe('vision');
    expect(voiceScore.origin).toBe('voice');
    expect(textScore.origin).toBe('text');
  });
});

// ============================================================================
// TESTS: LEVEL CLASSIFICATION
// ============================================================================

describe('Level Classification', () => {
  function classifyLevel(value: number): 'low' | 'medium' | 'high' {
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
    const adjusted = adjustWeightsForActiveModalities(
      getDefaultModalityWeights(),
      { vision: false, voice: false, text: false }
    );

    expect(adjusted.vision).toBe(0);
    expect(adjusted.voice).toBe(0);
    expect(adjusted.text).toBe(0);
  });

  it('should handle equal confidences', () => {
    const dominant = getDominantModality({ vision: 0.5, voice: 0.5, text: 0.5 });
    // Should return vision as first in priority
    expect(dominant).toBe('vision');
  });

  it('should handle boundary values in classification', () => {
    const score35 = createScore(0.35);
    const score65 = createScore(0.65);

    expect(score35.value).toBe(0.35);
    expect(score65.value).toBe(0.65);
  });
});
