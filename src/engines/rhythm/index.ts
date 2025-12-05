/**
 * TITANE∞ vΩ∞ — HUMAN RHYTHM ENGINE INDEX
 * OPUS v∞.6: Exports du module de rythme humain
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

export { HumanRhythmEngine } from './HumanRhythmEngine';
export { default as humanRhythmEngine } from './HumanRhythmEngine';

// Re-export types
export type {
  HumanRhythmState,
  HumanRhythmConfig,
  DayMoment,
  WeekDay,
  WeekPeriod,
  Chronotype,
  ChronotypeConfidence,
  EnergyLevel,
  EnergyTrend,
  MomentEnergyPattern,
  DailyPattern,
  WeekDayPattern,
  WeeklyPattern,
  CircadianState,
  PacingRecommendation,
  TaskType,
  OptimalWindow,
  EnergyHistoryEntry,
} from '@/types/humanRhythm';

export {
  getDefaultHumanRhythmState,
  getDefaultHumanRhythmConfig,
  getDefaultCircadianState,
  getDefaultPacingRecommendation,
  getDefaultDailyPattern,
  getDefaultWeeklyPattern,
  getDefaultMomentPattern,
  getDayMomentFromHour,
  getWeekDayFromIndex,
  isWeekend,
  HUMAN_RHYTHM_CONSTANTS,
} from '@/types/humanRhythm';
