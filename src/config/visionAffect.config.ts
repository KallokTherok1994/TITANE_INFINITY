/**
 * TITANE∞ vΩ∞ — CONFIGURATION VISION & AFFECT ENGINE
 * Super Prompt #9: Configuration pour le sens de présence humaine
 *
 * ⚠️ RAPPEL ÉTHIQUE:
 * - Opt-in explicite obligatoire
 * - Pas de diagnostic clinique
 * - 100% local, pas de cloud
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  VisionConfig,
  VisualLevel,
  CalibrationCommand,
  SuggestionType,
} from '@/types/visionAffect';

// ============================================================================
// CONFIGURATION PRINCIPALE
// ============================================================================

export const VISION_ENGINE_CONFIG: VisionConfig = {
  // ⚠️ DÉSACTIVÉ par défaut - Opt-in explicite requis
  featureEnabled: false,

  // Caméra - Basse résolution pour performance
  resolution: '480p',
  targetFps: 15,

  // Processing
  processingEnabled: true,
  landmarkSmoothing: 0.5,
  confidenceThreshold: 0.5,

  // Privacy - Tout désactivé par défaut
  debugOverlayEnabled: false,
  recordingEnabled: false, // ⚠️ JAMAIS true par défaut

  // Limites
  historyMaxSize: 500,
  autoDisableAfterMs: 10 * 60 * 1000, // 10 min max
};

// ============================================================================
// SEUILS DE DÉTECTION (Body Language → Affect)
// ============================================================================

/**
 * Seuils par défaut pour la conversion des scores en niveaux
 *
 * ⚠️ Ces seuils sont des heuristiques approximatives.
 * Ils seront ajustés par le VisualLearningEngine selon la baseline utilisateur.
 */
export const DEFAULT_THRESHOLDS = {
  energy: {
    // Combinaison posture + mouvement
    low: 0.35, // Score combiné < 0.35 → low
    high: 0.65, // Score combiné > 0.65 → high
  },
  tension: {
    // Basé sur mouvement agité + posture fermée
    low: 0.3,
    high: 0.6,
  },
  engagement: {
    // Basé sur stabilité regard + posture ouverte
    low: 0.35,
    high: 0.65,
  },
} as const;

/**
 * Poids pour le calcul des scores combinés
 */
export const SCORE_WEIGHTS = {
  energy: {
    posture: 0.5,
    movement: 0.3,
    gazeStability: 0.2,
  },
  tension: {
    movement: 0.4, // Mouvement agité = tension
    posture: 0.3, // Posture fermée = tension
    shoulderSymmetry: 0.2, // Asymétrie = tension
    headTilt: 0.1,
  },
  engagement: {
    gazeStability: 0.5,
    posture: 0.3,
    facialActivity: 0.2,
  },
} as const;

// ============================================================================
// CONFIGURATION MEDIAPIPE
// ============================================================================

export const MEDIAPIPE_CONFIG = {
  // Holistic model settings
  modelComplexity: 1, // 0=Lite, 1=Full, 2=Heavy
  smoothLandmarks: true,
  enableSegmentation: false, // Pas besoin pour TITANE
  refineFaceLandmarks: true,

  // Performance
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,

  // URLs des modèles (CDN MediaPipe)
  // En production, ces modèles devraient être bundlés localement
  locateFile: (file: string) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
} as const;

// ============================================================================
// INDICES DE POSE (Landmarks MediaPipe)
// ============================================================================

/**
 * Indices des landmarks pose (33 points)
 */
export const POSE_LANDMARKS = {
  // Visage
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,

  // Épaules / Torse
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,

  // Hanches / Jambes
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// ============================================================================
// CONFIGURATION CONFIANCE
// ============================================================================

/**
 * Facteurs de confiance et leurs poids
 */
export const CONFIDENCE_CONFIG = {
  weights: {
    landmarkQuality: 0.4,
    temporalStability: 0.3,
    lightingConditions: 0.15,
    faceVisibility: 0.15,
  },

  // Seuils minimum
  minAcceptableConfidence: 0.3,
  minLandmarkVisibility: 0.5,

  // Stabilité temporelle
  stabilityWindowMs: 2000, // Fenêtre de 2s pour évaluer stabilité
  maxJitterThreshold: 0.1, // Variation max acceptable entre frames
} as const;

// ============================================================================
// CONFIGURATION COACHING BRIDGE
// ============================================================================

/**
 * Configuration des suggestions de coaching
 */
export const COACHING_CONFIG = {
  // Délais avant suggestion
  energyDropDelayMs: 5 * 60 * 1000, // 5 min d'énergie basse avant suggérer pause
  tensionAlertDelayMs: 3 * 60 * 1000, // 3 min de tension haute
  stillnessAlertMs: 30 * 60 * 1000, // 30 min sans mouvement

  // Cooldown entre suggestions
  suggestionCooldownMs: 10 * 60 * 1000, // 10 min entre suggestions similaires

  // Seuils d'alerte
  alertThresholds: {
    energyDropStreak: 3, // 3 lectures "low" consécutives
    tensionSpikeStreak: 3,
    engagementDropStreak: 5,
  },
} as const;

/**
 * Messages de suggestion par type
 */
export const SUGGESTION_MESSAGES: Record<SuggestionType, string> = {
  PAUSE_SUGGESTION:
    'Les indices visuels suggèrent peut-être un besoin de pause. ' +
    'Que dirais-tu de prendre 5 minutes ?',

  MOVEMENT_SUGGESTION:
    'Tu sembles assez statique depuis un moment. ' +
    'Un petit étirement pourrait faire du bien ?',

  BREATHING_SUGGESTION:
    'Je perçois peut-être des signes de tension. ' +
    'Quelques respirations profondes pourraient aider.',

  POSTURE_REMINDER:
    'Petit rappel posture : redresse-toi si tu en as besoin. ' +
    "C'est juste un indice visuel, pas une certitude !",

  ENERGY_BOOST_TIP:
    'Ton énergie visible semble baisser. ' +
    "Un verre d'eau ou une micro-pause pourrait aider ?",

  SCHEDULE_ADJUSTMENT:
    'Entre les indices visuels et ton planning chargé, ' +
    "veux-tu qu'on réorganise certaines tâches ?",
};

// ============================================================================
// CALIBRATION BASELINE
// ============================================================================

/**
 * Configuration de la calibration baseline
 */
export const CALIBRATION_CONFIG = {
  // Durée de capture par état
  samplingDurationMs: 30 * 1000, // 30 secondes par calibration

  // Samples minimum pour valider
  minSamplesRequired: 20,

  // Commandes disponibles
  commands: {
    MARK_HIGH_ENERGY: {
      label: 'Marquer comme haute énergie',
      description: 'Enregistre ton état actuel comme référence de bonne énergie',
      icon: '⚡',
    },
    MARK_LOW_ENERGY: {
      label: 'Marquer comme basse énergie',
      description: 'Enregistre ton état actuel comme référence de fatigue',
      icon: '🔋',
    },
    MARK_RELAXED: {
      label: 'Marquer comme détendu',
      description: 'Enregistre ton état actuel comme référence de détente',
      icon: '😌',
    },
    MARK_FOCUSED: {
      label: 'Marquer comme concentré',
      description: 'Enregistre ton état actuel comme référence de focus',
      icon: '🎯',
    },
    RESET_BASELINE: {
      label: 'Réinitialiser baseline',
      description: 'Efface ta baseline personnalisée et revient aux valeurs par défaut',
      icon: '🔄',
    },
  } as Record<CalibrationCommand, { label: string; description: string; icon: string }>,
} as const;

// ============================================================================
// RÉSOLUTIONS CAMÉRA
// ============================================================================

export const CAMERA_RESOLUTIONS = {
  '480p': { width: 640, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
} as const;

// ============================================================================
// PERFORMANCE BUDGETS
// ============================================================================

export const PERFORMANCE_BUDGETS = {
  // Temps max par frame
  maxFrameProcessingMs: 100, // 100ms max par frame

  // FPS cibles
  targetFps: {
    minimum: 10,
    target: 15,
    smooth: 30,
  },

  // Mémoire
  maxHistoryEntries: 500,
  landmarkBufferSize: 30, // Buffer de 30 frames pour calculs
} as const;

// ============================================================================
// TAURI CAPABILITIES (à ajouter dans tauri.conf.json)
// ============================================================================

/**
 * Documentation des capabilities Tauri requises
 *
 * À ajouter dans src-tauri/capabilities/vision.json :
 *
 * ```json
 * {
 *   "$schema": "../gen/schemas/desktop-schema.json",
 *   "identifier": "vision-capability",
 *   "description": "Capability for Vision & Affect Engine",
 *   "windows": ["main"],
 *   "permissions": [
 *     "core:default",
 *     "camera:allow-get-devices",
 *     "camera:allow-access"
 *   ]
 * }
 * ```
 *
 * Note: Le plugin camera Tauri n'existe pas encore officiellement.
 * On utilise getUserMedia du webview, qui fonctionne après
 * que l'OS ait accordé la permission au processus Tauri.
 */
export const TAURI_CAPABILITIES_DOC = `
Pour activer la vision dans Tauri v2 :

1. L'accès caméra passe par navigator.mediaDevices.getUserMedia
2. L'OS demandera la permission au premier appel
3. Sur macOS, ajouter dans Info.plist :
   <key>NSCameraUsageDescription</key>
   <string>TITANE utilise la caméra pour détecter des indices de langage corporel (100% local)</string>

4. Sur Linux, aucune configuration spéciale requise
5. Sur Windows, la permission est gérée par le système

Le flux vidéo ne quitte JAMAIS la machine.
`;
