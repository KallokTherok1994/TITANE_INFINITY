/**
 * TITANE∞ vΩ∞ — VISION ENGINE INDEX
 * Super Prompt #9: Exports centralisés du Vision & Affect Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// ENGINES
// ============================================================================

export {
  VisionInputEngine,
  initVisionInputEngine,
  getVisionInputEngine,
  enableVision,
  disableVision,
  startCamera,
  stopCamera,
} from './VisionInputEngine';

export {
  BodyLanguageEngine,
  initBodyLanguageEngine,
  getBodyLanguageEngine,
  processVideoFrame,
} from './BodyLanguageEngine';

export {
  AffectEstimationEngine,
  initAffectEstimationEngine,
  getAffectEstimationEngine,
  estimateAffect,
} from './AffectEstimationEngine';

export {
  VisualLearningEngine,
  initVisualLearningEngine,
  getVisualLearningEngine,
  startCalibration,
} from './VisualLearningEngine';

export {
  VisualCoachingBridge,
  initVisualCoachingBridge,
  getVisualCoachingBridge,
  processVisualAffect,
  type EnergyEngineAdapter,
  type AgendaEngineAdapter,
  type CoachingEngineAdapter,
} from './VisualCoachingBridge';

// ============================================================================
// TYPES RE-EXPORTS
// ============================================================================

export type {
  // Config
  VisionConfig,
  VisionResolution,
  CameraPermissionStatus,

  // Vision Input
  VisionInputState,
  VisionError,
  VisionErrorCode,

  // Body Language
  BodyLanguageState,
  HolisticLandmarks,
  NormalizedLandmark,

  // Affect Estimation
  AffectEstimationState,
  VisualLevel,
  AffectHistoryEntry,
  ConfidenceFactors,
  VisualBaselineProfile,
  BaselineSignature,

  // Learning
  CalibrationCommand,
  CalibrationSession,

  // Coaching
  VisualCoachingEvent,
  VisualEventType,
  CoachingSuggestion,
  SuggestionType,

  // Chat IA
  VisionIntent,
  VisionFeedbackResponse,

  // Global State
  VisionAffectGlobalState,
} from '@/types/visionAffect';

// ============================================================================
// CONFIG RE-EXPORTS
// ============================================================================

export {
  VISION_ENGINE_CONFIG,
  DEFAULT_THRESHOLDS,
  SCORE_WEIGHTS,
  MEDIAPIPE_CONFIG,
  POSE_LANDMARKS,
  CONFIDENCE_CONFIG,
  COACHING_CONFIG,
  CALIBRATION_CONFIG,
  CAMERA_RESOLUTIONS,
  PERFORMANCE_BUDGETS,
  SUGGESTION_MESSAGES,
} from '@/config/visionAffect.config';

// ============================================================================
// DEFAULTS RE-EXPORTS
// ============================================================================

export {
  DEFAULT_VISION_CONFIG,
  getDefaultVisionInputState,
  getDefaultBodyLanguageState,
  getDefaultAffectEstimationState,
  getDefaultVisionAffectGlobalState,
  VISION_ETHICAL_DISCLAIMER,
  PRUDENT_FORMULATIONS,
} from '@/types/visionAffect';
