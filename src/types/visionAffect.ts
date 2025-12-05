/**
 * TITANE∞ vΩ∞ — TYPES VISION & AFFECT ENGINE
 * Super Prompt #9: Sens de la présence humaine
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (NON NÉGOCIABLES):
 * - Pas de diagnostic clinique
 * - Indices approximatifs, PAS d'émotions absolues
 * - 100% local, aucune donnée vidéo vers le cloud
 * - Opt-in explicite requis
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// PERMISSIONS & CONFIGURATION
// ============================================================================

/**
 * État des permissions caméra (3 niveaux)
 * - Tauri capabilities
 * - OS (pop-up système)
 * - Utilisateur interne TITANE
 */
export type CameraPermissionStatus =
  | 'unknown'       // Pas encore demandé
  | 'pending'       // Demande en cours
  | 'granted'       // Accordé
  | 'denied'        // Refusé
  | 'unavailable';  // Pas de caméra

/**
 * Configuration globale du Vision Engine
 */
export interface VisionConfig {
  // Activation globale
  featureEnabled: boolean;

  // Caméra
  preferredDeviceId?: string;
  resolution: VisionResolution;
  targetFps: number;

  // Processing
  processingEnabled: boolean;
  landmarkSmoothing: number;      // 0-1, lissage temporel
  confidenceThreshold: number;    // Seuil min pour considérer landmarks valides

  // Éthique & Privacy
  debugOverlayEnabled: boolean;
  recordingEnabled: boolean;      // TOUJOURS false par défaut
  historyMaxSize: number;         // Max entrées historique

  // Auto-désactivation
  autoDisableAfterMs?: number;    // Durée max mode observation
}

export type VisionResolution = '480p' | '720p' | '1080p';

export const DEFAULT_VISION_CONFIG: VisionConfig = {
  featureEnabled: false,          // Opt-in explicite
  resolution: '480p',             // Basse résolution pour perf
  targetFps: 15,                  // 15 FPS suffisant pour langage corporel
  processingEnabled: true,
  landmarkSmoothing: 0.5,
  confidenceThreshold: 0.5,
  debugOverlayEnabled: false,
  recordingEnabled: false,        // JAMAIS par défaut
  historyMaxSize: 500,
  autoDisableAfterMs: 10 * 60 * 1000, // 10 minutes max
};

// ============================================================================
// VISION INPUT STATE
// ============================================================================

/**
 * État du flux caméra
 */
export interface VisionInputState {
  // Configuration
  featureEnabled: boolean;
  cameraEnabled: boolean;

  // Permissions
  permissionStatus: CameraPermissionStatus;
  tauriCapabilityGranted: boolean;
  osPermissionGranted: boolean;

  // Caméra
  availableDevices: MediaDeviceInfo[];
  selectedDeviceId?: string;
  streamActive: boolean;

  // Performance
  fpsEstimate: number;
  lastFrameTimestamp: number;
  framesProcessed: number;

  // Erreurs
  lastError?: VisionError;
}

export interface VisionError {
  code: VisionErrorCode;
  message: string;
  timestamp: number;
  recoverable: boolean;
}

export type VisionErrorCode =
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'STREAM_ERROR'
  | 'PROCESSING_ERROR'
  | 'MEDIAPIPE_INIT_FAILED'
  | 'UNKNOWN';

export const getDefaultVisionInputState = (): VisionInputState => ({
  featureEnabled: false,
  cameraEnabled: false,
  permissionStatus: 'unknown',
  tauriCapabilityGranted: false,
  osPermissionGranted: false,
  availableDevices: [],
  selectedDeviceId: undefined,
  streamActive: false,
  fpsEstimate: 0,
  lastFrameTimestamp: 0,
  framesProcessed: 0,
  lastError: undefined,
});

// ============================================================================
// BODY LANGUAGE STATE (MediaPipe Holistic)
// ============================================================================

/**
 * Landmarks extraits par MediaPipe Holistic
 * 540+ points : corps (33), visage (468), mains (21×2)
 */
export interface HolisticLandmarks {
  pose?: NormalizedLandmark[];      // 33 landmarks corps
  face?: NormalizedLandmark[];      // 468 landmarks visage
  leftHand?: NormalizedLandmark[];  // 21 landmarks main gauche
  rightHand?: NormalizedLandmark[]; // 21 landmarks main droite
  timestamp: number;
}

export interface NormalizedLandmark {
  x: number;  // 0-1 normalisé
  y: number;  // 0-1 normalisé
  z: number;  // Profondeur relative
  visibility?: number; // 0-1 confiance visibilité
}

/**
 * État du langage corporel dérivé des landmarks
 *
 * ⚠️ Ces scores sont des APPROXIMATIONS basées sur des heuristiques simples.
 * Ils ne représentent PAS une vérité sur l'état interne de l'utilisateur.
 */
export interface BodyLanguageState {
  // Scores principaux (0-1)
  postureScore: number;         // Ouvert/droit vs affaissé/fermé
  movementScore: number;        // Calme/statique vs agité/mouvement
  gazeStabilityScore: number;   // Regard stable vs errant

  // Scores secondaires
  shoulderSymmetry: number;     // Symétrie des épaules
  headTilt: number;             // Inclinaison tête (-1 à 1)
  facialActivity: number;       // Activité faciale détectée

  // Confiance globale
  confidence: number;           // 0-1, qualité des landmarks
  landmarksDetected: boolean;

  // Debug (optionnel)
  rawLandmarksCompressed?: string;
  lastUpdateTimestamp: number;
}

export const getDefaultBodyLanguageState = (): BodyLanguageState => ({
  postureScore: 0.5,
  movementScore: 0.5,
  gazeStabilityScore: 0.5,
  shoulderSymmetry: 0.5,
  headTilt: 0,
  facialActivity: 0.5,
  confidence: 0,
  landmarksDetected: false,
  rawLandmarksCompressed: undefined,
  lastUpdateTimestamp: 0,
});

// ============================================================================
// AFFECT ESTIMATION STATE (Indices d'état NON-CLINIQUES)
// ============================================================================

/**
 * Niveau d'indice (3 niveaux simples)
 *
 * ⚠️ IMPORTANT: Ces niveaux sont des INDICES VISUELS approximatifs.
 * Ils NE représentent PAS l'état émotionnel réel de l'utilisateur.
 * Toujours formuler avec prudence : "les indices suggèrent..."
 */
export type VisualLevel = 'low' | 'medium' | 'high';

/**
 * État d'affect estimé (indices non-cliniques)
 *
 * ⚠️ GARDE-FOU: Ces estimations sont approximatives et potentiellement biaisées.
 * Ne jamais les utiliser pour des décisions critiques.
 */
export interface AffectEstimationState {
  // Indices principaux
  visualEnergyLevel: VisualLevel;       // Énergie perçue
  visualTensionLevel: VisualLevel;      // Tension corporelle apparente
  visualEngagementLevel: VisualLevel;   // Engagement physique

  // Confiance
  confidence: number;                   // 0-1
  confidenceFactors: ConfidenceFactors;

  // Historique (pour tendances)
  history: AffectHistoryEntry[];

  // Baseline personnalisée (optionnel)
  baselineProfile?: VisualBaselineProfile;

  // Métadonnées
  lastEstimationTimestamp: number;
  estimationCount: number;
}

export interface ConfidenceFactors {
  landmarkQuality: number;      // Qualité des landmarks détectés
  temporalStability: number;    // Stabilité dans le temps
  lightingConditions: number;   // Qualité de l'éclairage estimée
  faceVisibility: number;       // Visage bien visible
}

export interface AffectHistoryEntry {
  timestamp: number;
  energy: VisualLevel;
  tension: VisualLevel;
  engagement: VisualLevel;
  confidence: number;
}

/**
 * Profil de baseline personnalisé
 * Permet d'adapter les seuils à l'utilisateur
 */
export interface VisualBaselineProfile {
  // Signatures de référence
  energySignature: BaselineSignature;
  tensionSignature: BaselineSignature;
  engagementSignature: BaselineSignature;

  // Métadonnées
  createdAt: number;
  updatedAt: number;
  samplesCount: number;
  isCalibrated: boolean;
}

export interface BaselineSignature {
  lowThreshold: number;
  highThreshold: number;
  averageScore: number;
  standardDeviation: number;
}

export const getDefaultAffectEstimationState = (): AffectEstimationState => ({
  visualEnergyLevel: 'medium',
  visualTensionLevel: 'medium',
  visualEngagementLevel: 'medium',
  confidence: 0,
  confidenceFactors: {
    landmarkQuality: 0,
    temporalStability: 0,
    lightingConditions: 0,
    faceVisibility: 0,
  },
  history: [],
  baselineProfile: undefined,
  lastEstimationTimestamp: 0,
  estimationCount: 0,
});

// ============================================================================
// VISUAL LEARNING (Baseline apprentissage)
// ============================================================================

/**
 * Commande de calibration baseline
 */
export type CalibrationCommand =
  | 'MARK_HIGH_ENERGY'
  | 'MARK_LOW_ENERGY'
  | 'MARK_RELAXED'
  | 'MARK_FOCUSED'
  | 'RESET_BASELINE';

export interface CalibrationSession {
  id: string;
  command: CalibrationCommand;
  startedAt: number;
  endedAt?: number;
  samplesCollected: number;
  averageScores: {
    posture: number;
    movement: number;
    gaze: number;
  };
}

// ============================================================================
// VISUAL COACHING BRIDGE (Intégration autres moteurs)
// ============================================================================

/**
 * Événement visuel pour les autres moteurs
 */
export interface VisualCoachingEvent {
  type: VisualEventType;
  timestamp: number;
  affectState: AffectEstimationState;
  suggestion?: CoachingSuggestion;
}

export type VisualEventType =
  | 'ENERGY_DROP_DETECTED'
  | 'TENSION_SPIKE_DETECTED'
  | 'ENGAGEMENT_LOW'
  | 'EXTENDED_STILLNESS'
  | 'POSTURE_ALERT'
  | 'BASELINE_DEVIATION';

export interface CoachingSuggestion {
  type: SuggestionType;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  expires?: number;
}

export type SuggestionType =
  | 'PAUSE_SUGGESTION'
  | 'MOVEMENT_SUGGESTION'
  | 'BREATHING_SUGGESTION'
  | 'POSTURE_REMINDER'
  | 'ENERGY_BOOST_TIP'
  | 'SCHEDULE_ADJUSTMENT';

// ============================================================================
// CHAT IA - MODE OBSERVATION
// ============================================================================

/**
 * Intents Vision pour le Chat IA
 */
export type VisionIntent =
  | { type: 'VISION_ENABLE'; durationMs?: number }
  | { type: 'VISION_DISABLE' }
  | { type: 'VISION_STATUS' }
  | { type: 'VISION_FEEDBACK' }
  | { type: 'VISION_CALIBRATE'; command: CalibrationCommand };

/**
 * Réponse du Chat IA concernant la vision
 *
 * ⚠️ Les formulations DOIVENT rester prudentes et explicables.
 * Jamais de certitudes, toujours des nuances.
 */
export interface VisionFeedbackResponse {
  // Indices bruts
  energyLevel: VisualLevel;
  tensionLevel: VisualLevel;
  engagementLevel: VisualLevel;
  confidence: number;

  // Formulation prudente générée
  prudentMessage: string;

  // Suggestions optionnelles
  suggestions: CoachingSuggestion[];

  // Disclaimer obligatoire
  disclaimer: string;
}

// ============================================================================
// ÉTAT GLOBAL COMBINÉ
// ============================================================================

/**
 * État complet du Vision & Affect Engine
 */
export interface VisionAffectGlobalState {
  // Configuration
  config: VisionConfig;

  // Sous-états
  visionInput: VisionInputState;
  bodyLanguage: BodyLanguageState;
  affectEstimation: AffectEstimationState;

  // Session
  sessionStartedAt?: number;
  sessionDurationMs: number;
  autoDisableAt?: number;

  // Événements récents
  recentEvents: VisualCoachingEvent[];
}

export const getDefaultVisionAffectGlobalState = (): VisionAffectGlobalState => ({
  config: { ...DEFAULT_VISION_CONFIG },
  visionInput: getDefaultVisionInputState(),
  bodyLanguage: getDefaultBodyLanguageState(),
  affectEstimation: getDefaultAffectEstimationState(),
  sessionStartedAt: undefined,
  sessionDurationMs: 0,
  autoDisableAt: undefined,
  recentEvents: [],
});

// ============================================================================
// CONSTANTES ÉTHIQUES
// ============================================================================

/**
 * Disclaimer obligatoire pour tout feedback visuel
 */
export const VISION_ETHICAL_DISCLAIMER =
  "Ces indices sont des approximations basées sur des signaux visuels. " +
  "Ils ne représentent pas une vérité sur ton état interne. " +
  "Seul toi sais vraiment comment tu te sens.";

/**
 * Templates de formulations prudentes
 */
export const PRUDENT_FORMULATIONS = {
  energy: {
    low: "Les signaux visuels suggèrent un niveau d'énergie peut-être plus bas que d'habitude.",
    medium: "Les indices visuels semblent neutres concernant ton niveau d'énergie.",
    high: "D'après ce que je perçois, tu sembles avoir un bon niveau d'énergie visible.",
  },
  tension: {
    low: "Ta posture semble plutôt détendue d'après les indices visuels.",
    medium: "Les signaux de tension corporelle semblent dans la moyenne.",
    high: "Je perçois peut-être des signes de tension corporelle. Qu'en penses-tu ?",
  },
  engagement: {
    low: "Les indices suggèrent peut-être une attention dispersée, mais je peux me tromper.",
    medium: "Ton engagement visible semble normal.",
    high: "Tu sembles visuellement concentré et engagé.",
  },
} as const;
