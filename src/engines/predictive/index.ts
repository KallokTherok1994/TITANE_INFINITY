/**
 * TITANE∞ vΩ∞ — PREDICTIVE ENGINE INDEX
 * OPUS v∞.4: Exports du module prédictif
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

export { PredictiveStateEngine } from './PredictiveStateEngine';
export { default as predictiveStateEngine } from './PredictiveStateEngine';

// Re-export types
export type {
  PredictiveState,
  PredictiveEngineConfig,
  TrendDirection,
  TrendAnalysis,
  DimensionForecast,
  PatternShiftDetection,
  PatternShiftType,
  HistoryDataPoint,
  ProactiveTrigger,
  PredictionConfidence,
  PatternDetectionConfig,
  ProactiveTriggerConfig,
} from '@/types/predictiveState';

export {
  getDefaultPredictiveState,
  getDefaultPredictiveEngineConfig,
  getDefaultTrendAnalysis,
  getDefaultDimensionForecast,
  getDefaultPatternDetectionConfig,
  getDefaultProactiveTriggerConfig,
  PREDICTIVE_ENGINE_CONSTANTS,
} from '@/types/predictiveState';
