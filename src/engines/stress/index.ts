/**
 * TITANE∞ vΩ∞ — STRESS REGULATION ENGINE INDEX
 * OPUS v∞.5: Exports du module de régulation du stress
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

export { StressRegulationEngine } from './StressRegulationEngine';
export { default as stressRegulationEngine } from './StressRegulationEngine';

// Re-export types
export type {
  StressRegulationState,
  StressRegulationConfig,
  StressLevel,
  StressTrend,
  InterventionType,
  InterventionResult,
  InterventionPriority,
  InterventionProtocol,
  InterventionStep,
  InterventionHistoryEntry,
  InterventionWeights,
  TriggerConditions,
  TriggerEvaluation,
  InterventionSelectionContext,
  InterventionRecommendation,
} from '@/types/stressRegulation';

export {
  getDefaultStressRegulationState,
  getDefaultStressRegulationConfig,
  getDefaultInterventionWeights,
  ALL_PROTOCOLS,
  BREATH_PROTOCOL,
  PAUSE_PROTOCOL,
  BODY_SCAN_PROTOCOL,
  FOCUS_PROTOCOL,
  AGENDA_PROTOCOL,
  REASSURANCE_PROTOCOL,
  STRESS_REGULATION_CONSTANTS,
} from '@/types/stressRegulation';
