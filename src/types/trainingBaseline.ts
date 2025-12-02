/**
 * TITANE∞ vΩ∞ — TYPES TRAINING BASELINE ENGINE
 * Super Prompt OPUS v∞.2: Apprentissage visuel-personnel adaptatif
 *
 * Ce module définit les types pour l'apprentissage du comportement
 * naturel et unique de l'utilisateur.
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (NON NÉGOCIABLES):
 * - Données abstraites uniquement (pas d'images)
 * - Indices et probabilités, jamais de certitudes
 * - 100% local, aucune donnée vers le cloud
 * - Apprentissage supervisé (l'utilisateur valide)
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// LABELS D'ÉTAT UTILISATEUR
// ============================================================================

/**
 * Labels d'état que l'utilisateur peut déclarer
 * Ces labels servent d'exemples supervisés pour l'entraînement
 */
export type UserStateLabel =
  | 'calm'           // "Je suis calme"
  | 'stressed'       // "Je suis stressé"
  | 'focused'        // "Je suis concentré"
  | 'fatigued'       // "Je suis fatigué"
  | 'motivated'      // "Je suis motivé"
  | 'neutral'        // "Je suis neutre"
  | 'energized'      // "Je suis en pleine forme"
  | 'relaxed';       // "Je suis détendu"

/**
 * Mapping labels -> phrases déclencheurs FR/EN
 */
export const STATE_LABEL_TRIGGERS: Record<UserStateLabel, string[]> = {
  calm: [
    'je suis calme', 'i am calm', 'je me sens calme',
    'état calme', 'calme', 'mon calme',
  ],
  stressed: [
    'je suis stressé', 'je suis stressée', 'i am stressed',
    'je me sens stressé', 'état stressé', 'stress',
  ],
  focused: [
    'je suis concentré', 'je suis concentrée', 'i am focused',
    'je me sens concentré', 'état concentré', 'focus', 'concentration',
  ],
  fatigued: [
    'je suis fatigué', 'je suis fatiguée', 'i am tired', 'i am fatigued',
    'je me sens fatigué', 'état fatigué', 'fatigue',
  ],
  motivated: [
    'je suis motivé', 'je suis motivée', 'i am motivated',
    'je me sens motivé', 'état motivé', 'motivation',
  ],
  neutral: [
    'je suis neutre', 'i am neutral', 'état neutre',
    'je me sens normal', 'normal', 'comme d\'habitude',
  ],
  energized: [
    'je suis en forme', 'je suis énergique', 'i am energized',
    'pleine forme', 'full energy', 'énergie',
  ],
  relaxed: [
    'je suis détendu', 'je suis détendue', 'i am relaxed',
    'je me sens détendu', 'détente', 'relaxé',
  ],
};

/**
 * Phrases génériques pour déclencher l'enregistrement
 */
export const TRAINING_TRIGGER_PHRASES = [
  'enregistre cet état',
  'prends cet état comme référence',
  'sauvegarde mon état',
  'apprends cet état',
  'mémorise mon état',
  'record this state',
  'save this as baseline',
  'learn this state',
];

// ============================================================================
// SIGNATURES STATISTIQUES
// ============================================================================

/**
 * Signature statistique pour un type de mesure
 * Contient les statistiques descriptives d'un ensemble d'échantillons
 */
export interface StatisticalSignature {
  // Statistiques centrales
  mean: number;                 // Moyenne
  median: number;               // Médiane
  variance: number;             // Variance
  standardDeviation: number;    // Écart-type

  // Exponential Moving Average (pour pondérer les récents)
  ema: number;
  emaAlpha: number;             // Facteur de lissage (0.1 - 0.3 typique)

  // Échantillons
  samples: number[];            // Valeurs brutes (limitées)
  samplesCount: number;         // Nombre total d'échantillons vus
  maxSamples: number;           // Limite de stockage

  // Confiance
  weightedSamplesSum: number;   // Somme pondérée par confiance
  weightedCount: number;        // Somme des poids

  // Timestamps
  firstSampleAt: number;
  lastSampleAt: number;
}

/**
 * Valeurs par défaut pour une signature statistique
 */
export const getDefaultStatisticalSignature = (): StatisticalSignature => ({
  mean: 0.5,
  median: 0.5,
  variance: 0,
  standardDeviation: 0,
  ema: 0.5,
  emaAlpha: 0.2,
  samples: [],
  samplesCount: 0,
  maxSamples: 300,
  weightedSamplesSum: 0,
  weightedCount: 0,
  firstSampleAt: 0,
  lastSampleAt: 0,
});

// ============================================================================
// PATTERNS DE COMPORTEMENT
// ============================================================================

/**
 * Pattern de mouvement personnalisé
 */
export interface MovementPattern {
  avgMovementScore: number;
  movementDistribution: {
    low: number;      // % du temps en mouvement faible
    medium: number;   // % du temps en mouvement moyen
    high: number;     // % du temps en mouvement élevé
  };
  typicalRange: { min: number; max: number };
  signature: StatisticalSignature;
}

/**
 * Pattern de posture personnalisé
 */
export interface PosturePattern {
  avgPostureScore: number;
  postureDistribution: {
    slouched: number;   // % du temps affaissé
    neutral: number;    // % du temps neutre
    upright: number;    // % du temps droit/ouvert
  };
  typicalRange: { min: number; max: number };
  signature: StatisticalSignature;
}

/**
 * Pattern d'expressivité faciale
 */
export interface ExpressivityPattern {
  range: { min: number; max: number };  // Amplitude typique
  microchangesPerSecond: number;        // Fréquence de micro-expressions
  restFaceSignature: StatisticalSignature;  // Visage au repos
}

/**
 * Pattern de regard
 */
export interface GazePattern {
  stabilityMean: number;          // Stabilité moyenne du regard
  stabilityVariance: number;      // Variance de la stabilité
  driftFrequency: number;         // Fréquence des décrochages
  typicalFocusDuration: number;   // Durée typique de focus (ms)
  signature: StatisticalSignature;
}

// ============================================================================
// CONTEXTE TEMPOREL
// ============================================================================

/**
 * Courbe d'énergie selon l'heure du jour
 * Index 0-23 pour chaque heure
 */
export interface TimeOfDayEnergyCurve {
  hourlyMeans: number[];          // 24 valeurs (0h-23h)
  hourlyVariances: number[];      // Variance par heure
  peakHour: number;               // Heure de pic d'énergie
  lowHour: number;                // Heure de creux d'énergie
  samplesPerHour: number[];       // Échantillons par heure
}

/**
 * Patterns par jour de la semaine
 * Index 0-6 (dimanche-samedi)
 */
export interface WeekdayPatterns {
  dailyEnergyMeans: number[];     // 7 valeurs
  dailyTensionMeans: number[];    // 7 valeurs
  dailyEngagementMeans: number[]; // 7 valeurs
  workdayVsWeekend: {
    workdayAvg: number;
    weekendAvg: number;
  };
}

/**
 * Patterns par type de conversation
 */
export interface ConversationTypePatterns {
  coding: StatisticalSignature;       // Pendant le code
  brainstorming: StatisticalSignature; // Pendant brainstorm
  casual: StatisticalSignature;       // Conversation décontractée
  problem_solving: StatisticalSignature; // Résolution de problèmes
}

/**
 * Liens contextuels combinés
 */
export interface ContextLinks {
  timeOfDayEnergyCurve: TimeOfDayEnergyCurve;
  weekdayPatterns: WeekdayPatterns;
  conversationTypePatterns: ConversationTypePatterns;
}

// ============================================================================
// PROFIL BASELINE COMPLET
// ============================================================================

/**
 * Profil Baseline complet de l'utilisateur
 * Stocké dans SingularityState.trainingBaseline
 *
 * ⚠️ Données abstraites uniquement - PAS d'images
 */
export interface TrainingBaselineProfile {
  // ─────────────────────────────────────────────────────────────────────────
  // SIGNATURES PRINCIPALES (par label d'état)
  // ─────────────────────────────────────────────────────────────────────────

  /** Signatures par état déclaré */
  stateSignatures: {
    [K in UserStateLabel]?: StateSignature;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PATTERNS COMPORTEMENTAUX GLOBAUX
  // ─────────────────────────────────────────────────────────────────────────

  /** Signature d'énergie globale */
  energySignature: StatisticalSignature;

  /** Signature de tension globale */
  tensionSignature: StatisticalSignature;

  /** Signature d'engagement global */
  engagementSignature: StatisticalSignature;

  /** Pattern de mouvement */
  movementPattern: MovementPattern;

  /** Pattern de posture */
  posturePattern: PosturePattern;

  /** Pattern d'expressivité */
  expressivityPattern: ExpressivityPattern;

  /** Pattern de regard */
  gazePattern: GazePattern;

  // ─────────────────────────────────────────────────────────────────────────
  // LIENS CONTEXTUELS
  // ─────────────────────────────────────────────────────────────────────────

  /** Liens contextuels (heure, jour, type de conversation) */
  contextLinks: ContextLinks;

  // ─────────────────────────────────────────────────────────────────────────
  // SEUILS PERSONNALISÉS
  // ─────────────────────────────────────────────────────────────────────────

  /** Seuils recalibrés pour cet utilisateur */
  personalizedThresholds: PersonalizedThresholds;

  // ─────────────────────────────────────────────────────────────────────────
  // MÉTADONNÉES
  // ─────────────────────────────────────────────────────────────────────────

  /** ID unique du profil */
  profileId: string;

  /** Version du schéma */
  schemaVersion: string;

  /** Date de création */
  createdAt: number;

  /** Date de dernière mise à jour */
  updatedAt: number;

  /** Nombre total d'échantillons collectés */
  totalSamplesCount: number;

  /** Nombre de sessions d'entraînement */
  trainingSessionsCount: number;

  /** Le profil est-il suffisamment calibré ? */
  isCalibrated: boolean;

  /** Score de confiance global du profil (0-1) */
  profileConfidence: number;
}

/**
 * Signature pour un état spécifique (calm, stressed, etc.)
 */
export interface StateSignature {
  label: UserStateLabel;
  energySignature: StatisticalSignature;
  tensionSignature: StatisticalSignature;
  engagementSignature: StatisticalSignature;
  postureSignature: StatisticalSignature;
  movementSignature: StatisticalSignature;
  gazeSignature: StatisticalSignature;
  samplesCount: number;
  lastTrainingAt: number;
  confidence: number;
}

/**
 * Seuils personnalisés recalculés à partir du baseline
 */
export interface PersonalizedThresholds {
  // Énergie
  energyLowThreshold: number;
  energyHighThreshold: number;

  // Tension
  tensionLowThreshold: number;
  tensionHighThreshold: number;

  // Engagement
  engagementLowThreshold: number;
  engagementHighThreshold: number;

  // Tolérances
  tensionTolerance: number;       // Tolérance avant alerte tension
  fatigueDetectionSensitivity: number; // Sensibilité détection fatigue

  // Dernière mise à jour
  lastRecalibrationAt: number;
}

// ============================================================================
// SNAPSHOT D'ENTRAÎNEMENT
// ============================================================================

/**
 * Snapshot capturé pendant une session d'entraînement
 */
export interface TrainingSnapshot {
  /** ID unique */
  id: string;

  /** Label d'état déclaré par l'utilisateur */
  label: UserStateLabel;

  /** Timestamp de début de capture */
  startedAt: number;

  /** Timestamp de fin de capture */
  endedAt: number;

  /** Durée en ms */
  durationMs: number;

  /** Frames collectées */
  framesCollected: number;

  // ─────────────────────────────────────────────────────────────────────────
  // SCORES MOYENS CAPTURÉS
  // ─────────────────────────────────────────────────────────────────────────

  scores: {
    posture: { values: number[]; mean: number; variance: number };
    movement: { values: number[]; mean: number; variance: number };
    gaze: { values: number[]; mean: number; variance: number };
    energy: { values: number[]; mean: number; variance: number };
    tension: { values: number[]; mean: number; variance: number };
    engagement: { values: number[]; mean: number; variance: number };
  };

  /** Confiance moyenne pendant la capture */
  averageConfidence: number;

  /** Contexte au moment de la capture */
  context: {
    hourOfDay: number;
    dayOfWeek: number;
    conversationType?: string;
  };

  /** Validé par l'utilisateur ? */
  userValidated: boolean;
}

// ============================================================================
// SESSION D'ENTRAÎNEMENT
// ============================================================================

/**
 * Session d'entraînement en cours
 */
export interface TrainingSession {
  /** ID de session */
  sessionId: string;

  /** État en cours d'entraînement */
  targetLabel: UserStateLabel;

  /** Statut */
  status: 'pending' | 'capturing' | 'processing' | 'completed' | 'cancelled';

  /** Timestamp de début */
  startedAt: number;

  /** Durée cible de capture (ms) */
  targetDurationMs: number;

  /** Progression (0-100) */
  progress: number;

  /** Frames collectées jusqu'ici */
  framesCollected: number;

  /** Valeurs en cours de collecte */
  collectingScores: {
    posture: number[];
    movement: number[];
    gaze: number[];
    energy: number[];
    tension: number[];
    engagement: number[];
    confidence: number[];
  };

  /** Message à afficher à l'utilisateur */
  userMessage: string;
}

// ============================================================================
// RÉSULTAT D'ENTRAÎNEMENT
// ============================================================================

/**
 * Résultat après une session d'entraînement
 */
export interface TrainingResult {
  success: boolean;
  sessionId: string;
  label: UserStateLabel;
  snapshot: TrainingSnapshot | null;

  /** Résumé lisible pour le Chat IA */
  summary: {
    postureScore: number;
    movementScore: number;
    gazeScore: number;
    description: string;
  };

  /** Changements dans le baseline */
  baselineChanges: {
    thresholdsAdjusted: boolean;
    newSamplesAdded: number;
    confidenceChange: number;
  };

  /** Message pour l'utilisateur */
  userMessage: string;
}

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Profil baseline par défaut (non calibré)
 */
export const getDefaultTrainingBaselineProfile = (): TrainingBaselineProfile => ({
  stateSignatures: {},

  energySignature: getDefaultStatisticalSignature(),
  tensionSignature: getDefaultStatisticalSignature(),
  engagementSignature: getDefaultStatisticalSignature(),

  movementPattern: {
    avgMovementScore: 0.3,
    movementDistribution: { low: 0.6, medium: 0.3, high: 0.1 },
    typicalRange: { min: 0.1, max: 0.5 },
    signature: getDefaultStatisticalSignature(),
  },

  posturePattern: {
    avgPostureScore: 0.5,
    postureDistribution: { slouched: 0.2, neutral: 0.5, upright: 0.3 },
    typicalRange: { min: 0.3, max: 0.7 },
    signature: getDefaultStatisticalSignature(),
  },

  expressivityPattern: {
    range: { min: 0.2, max: 0.6 },
    microchangesPerSecond: 0.5,
    restFaceSignature: getDefaultStatisticalSignature(),
  },

  gazePattern: {
    stabilityMean: 0.6,
    stabilityVariance: 0.1,
    driftFrequency: 0.3,
    typicalFocusDuration: 5000,
    signature: getDefaultStatisticalSignature(),
  },

  contextLinks: {
    timeOfDayEnergyCurve: {
      hourlyMeans: new Array(24).fill(0.5),
      hourlyVariances: new Array(24).fill(0.1),
      peakHour: 10,
      lowHour: 15,
      samplesPerHour: new Array(24).fill(0),
    },
    weekdayPatterns: {
      dailyEnergyMeans: new Array(7).fill(0.5),
      dailyTensionMeans: new Array(7).fill(0.3),
      dailyEngagementMeans: new Array(7).fill(0.5),
      workdayVsWeekend: { workdayAvg: 0.5, weekendAvg: 0.5 },
    },
    conversationTypePatterns: {
      coding: getDefaultStatisticalSignature(),
      brainstorming: getDefaultStatisticalSignature(),
      casual: getDefaultStatisticalSignature(),
      problem_solving: getDefaultStatisticalSignature(),
    },
  },

  personalizedThresholds: {
    energyLowThreshold: 0.35,
    energyHighThreshold: 0.65,
    tensionLowThreshold: 0.3,
    tensionHighThreshold: 0.6,
    engagementLowThreshold: 0.35,
    engagementHighThreshold: 0.65,
    tensionTolerance: 0.7,
    fatigueDetectionSensitivity: 0.5,
    lastRecalibrationAt: 0,
  },

  profileId: '',
  schemaVersion: '1.0.0',
  createdAt: 0,
  updatedAt: 0,
  totalSamplesCount: 0,
  trainingSessionsCount: 0,
  isCalibrated: false,
  profileConfidence: 0,
});

/**
 * Session d'entraînement par défaut
 */
export const getDefaultTrainingSession = (
  label: UserStateLabel,
  durationMs: number = 5000
): TrainingSession => ({
  sessionId: `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  targetLabel: label,
  status: 'pending',
  startedAt: Date.now(),
  targetDurationMs: durationMs,
  progress: 0,
  framesCollected: 0,
  collectingScores: {
    posture: [],
    movement: [],
    gaze: [],
    energy: [],
    tension: [],
    engagement: [],
    confidence: [],
  },
  userMessage: `Préparation de l'enregistrement pour l'état "${label}"...`,
});
