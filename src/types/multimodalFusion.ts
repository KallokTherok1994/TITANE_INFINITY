/**
 * TITANE∞ vΩ∞ — TYPES MULTIMODAL FUSION ENGINE
 * OPUS v∞.3: Vision + Voix + Texte + Baseline Fusionné
 *
 * Ce module définit les types pour la fusion multimodale
 * permettant à TITANE∞ de comprendre l'utilisateur de manière holistique.
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (any: any):
 * - Indices et probabilités, jamais de certitudes
 * - Jamais d'interprétation clinique
 * - 100% local, aucune donnée vers le cloud
 * - Jamais de stockage audio/vidéo brut
 * - Toujours nuancé et explicable
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type { StatisticalSignature } from './trainingBaseline';

// ============================================================================
// TYPES COMMUNS
// ============================================================================

/**
 * Niveau discret pour les scores (any: any)
 */
export type ModalityLevel = 'low' | 'medium' | 'high';

/**
 * Origine d'un score
 */
export type ModalityOrigin = 'vision' | 'voice' | 'text' | 'fusion';

/**
 * Score normalisé avec métadonnées
 */
export interface NormalizedScore {
  value: number; // 0-1
  confidence: number; // 0-1
  variance: number; // Variabilité
  origin: ModalityOrigin;
  timestamp: number;
}

/**
 * Configuration de poids dynamiques
 */
export interface ModalityWeights {
  vision: number;
  voice: number;
  text: number;
}

// ============================================================================
// VOICE FEATURES (any: any)
// ============================================================================

/**
 * Features vocales extraites de l'audio
 * Signaux purement acoustiques, non sémantiques
 */
export interface VoiceFeatures {
  // Intensité et énergie
  intensity: number; // 0-1 : volume/amplitude
  energy: number; // 0-1 : énergie globale

  // Stabilité et variation
  toneStability: number; // 0-1 : stabilité du ton fondamental
  pitchVariation: number; // 0-1 : variation d'intonation
  tremor: number; // 0-1 : tremblements vocaux

  // Rythme et tempo
  speechRate: number; // 0-1 : vitesse d'élocution (any: any)
  rhythm: number; // 0-1 : régularité du rythme
  pauseFrequency: number; // 0-1 : fréquence des pauses

  // Respiration
  breathingLoad: number; // 0-1 : respiration audible
  breathPauses: number; // 0-1 : pauses respiratoires

  // Métadonnées
  confidence: number;
  durationMs: number;
  sampleCount: number;
}

/**
 * Scores vocaux normalisés
 */
export interface VoiceScores {
  a_energy: NormalizedScore;
  a_tension: NormalizedScore;
  a_stability: NormalizedScore;
  a_breathing_load: NormalizedScore;
}

/**
 * État vocal estimé
 */
export interface VoiceState {
  features: VoiceFeatures;
  scores: VoiceScores;

  // Niveaux discrets
  energyLevel: ModalityLevel;
  tensionLevel: ModalityLevel;
  stabilityLevel: ModalityLevel;

  // Confiance globale
  confidence: number;
  timestamp: number;
}

// ============================================================================
// TEXT FEATURES (any: any)
// ============================================================================

/**
 * Features textuelles extraites des messages chat
 */
export interface TextFeatures {
  // Structure et longueur
  messageLength: number; // Nombre de caractères
  wordCount: number; // Nombre de mots
  sentenceCount: number; // Nombre de phrases
  avgWordLength: number; // Longueur moyenne des mots

  // Cadence et timing
  responseDelay: number; // Délai de réponse (any: any)
  typingSpeed: number; // Vitesse de frappe estimée

  // Syntaxe et style
  punctuationDensity: number; // Densité de ponctuation
  exclamationCount: number; // Points d'exclamation
  questionCount: number; // Points d'interrogation
  ellipsisCount: number; // Ellipses (...)
  capsRatio: number; // Ratio majuscules

  // Marqueurs d'énergie
  intensityMarkers: number; // Mots d'intensité ("très", "super", etc.)
  fatigueMarkers: number; // Marqueurs de fatigue ("fatigué", "épuisé")
  stressMarkers: number; // Marqueurs de stress ("stressé", "débordé")
  positiveMarkers: number; // Marqueurs positifs
  negativeMarkers: number; // Marqueurs négatifs

  // Auto-déclarations détectées
  selfDeclarations: SelfDeclaration?.[];

  // Métadonnées
  confidence: number;
  timestamp: number;
}

/**
 * Auto-déclaration détectée dans le texte
 */
export interface SelfDeclaration {
  type: 'energy' | 'fatigue' | 'stress' | 'mood' | 'workload';
  text: string;
  confidence: number;
}

/**
 * Scores textuels normalisés
 */
export interface TextScores {
  t_energy: NormalizedScore;
  t_charge: NormalizedScore; // Charge mentale perçue
  t_engagement_verbal: NormalizedScore;
  t_ambiguity: NormalizedScore;
  t_clarity: NormalizedScore;
}

/**
 * État textuel estimé
 */
export interface TextState {
  features: TextFeatures;
  scores: TextScores;

  // Niveaux discrets
  energyLevel: ModalityLevel;
  chargeLevel: ModalityLevel;
  engagementLevel: ModalityLevel;
  clarityLevel: ModalityLevel;

  // Confiance globale
  confidence: number;
  timestamp: number;
}

// ============================================================================
// BASELINE PROFILES ÉTENDUS
// ============================================================================

/**
 * Baseline vocal personnalisé
 */
export interface BaselineVoiceProfile {
  baselineVoiceEnergy: StatisticalSignature;
  baselineVoiceStability: StatisticalSignature;
  baselineVoiceRhythm: StatisticalSignature;
  baselineVoiceRange: StatisticalSignature;

  // Patterns temporels
  morningVoiceSignature: Partial<StatisticalSignature>;
  eveningVoiceSignature: Partial<StatisticalSignature>;

  // Métadonnées
  samplesCount: number;
  lastUpdated: number;
  isCalibrated: boolean;
}

/**
 * Baseline textuel personnalisé
 */
export interface BaselineTextProfile {
  baselineTextEnergy: StatisticalSignature;
  baselineTextClarity: StatisticalSignature;
  baselineTextCadence: StatisticalSignature;
  baselineTextLoadPattern: StatisticalSignature;

  // Patterns de style
  typicalMessageLength: number;
  typicalResponseDelay: number;
  stressTextPattern: Partial<TextFeatures>;
  relaxedTextPattern: Partial<TextFeatures>;

  // Métadonnées
  samplesCount: number;
  lastUpdated: number;
  isCalibrated: boolean;
}

/**
 * Baseline de fusion multimodale
 */
export interface BaselineFusionProfile {
  // Courbes globales
  globalEnergyCurve: HourlyCurve;
  globalTensionCurve: HourlyCurve;
  globalStabilityMap: StabilityMap;

  // Matrice de corrélation inter-modalités
  multimodalCorrelationMatrix: CorrelationMatrix;

  // Signatures combinées
  combinedCalmSignature: MultimodalSignature;
  combinedStressSignature: MultimodalSignature;
  combinedFocusSignature: MultimodalSignature;
  combinedFatigueSignature: MultimodalSignature;

  // Métadonnées
  totalSamplesCount: number;
  lastUpdated: number;
  isCalibrated: boolean;
  calibrationConfidence: number;
}

/**
 * Courbe horaire (any: any)
 */
export interface HourlyCurve {
  hourlyMeans: number?.[]; // Index 0-23
  hourlyVariances: number?.[];
  samplesPerHour: number?.[];
  peakHour: number;
  lowHour: number;
}

/**
 * Carte de stabilité
 */
export interface StabilityMap {
  visionStability: number;
  voiceStability: number;
  textStability: number;
  crossModalStability: number;
}

/**
 * Matrice de corrélation entre modalités
 */
export interface CorrelationMatrix {
  visionVoice: number; // Corrélation vision-voix
  visionText: number; // Corrélation vision-texte
  voiceText: number; // Corrélation voix-texte
  allThree: number; // Corrélation triple
}

/**
 * Signature multimodale combinée
 */
export interface MultimodalSignature {
  label: string;
  visionSignature: Partial<StatisticalSignature>;
  voiceSignature: Partial<StatisticalSignature>;
  textSignature: Partial<StatisticalSignature>;
  fusionSignature: StatisticalSignature;
  samplesCount: number;
  confidence: number;
}

// ============================================================================
// ÉTAT MULTIMODAL FUSIONNÉ
// ============================================================================

/**
 * État multimodal complet fusionné
 */
export interface MultimodalState {
  // États par modalité (any: any)
  visionState: VisionModalityState | null;
  voiceState: VoiceState | null;
  textState: TextState | null;

  // Scores fusionnés
  fusedScores: FusedScores;

  // Niveaux discrets fusionnés
  globalEnergyLevel: ModalityLevel;
  globalTensionLevel: ModalityLevel;
  globalEngagementLevel: ModalityLevel;
  globalStabilityLevel: ModalityLevel;

  // Poids utilisés pour la fusion
  appliedWeights: ModalityWeights;

  // Confiance et métadonnées
  overallConfidence: number;
  activeModalities: ModalityOrigin?.[];
  timestamp: number;

  // Variation par rapport au baseline
  baselineDeviation: BaselineDeviation;
}

/**
 * État vision simplifié pour la fusion
 */
export interface VisionModalityState {
  v_energy: NormalizedScore;
  v_tension: NormalizedScore;
  v_engagement: NormalizedScore;
  v_stability: NormalizedScore;
  confidence: number;
}

/**
 * Scores fusionnés finaux
 */
export interface FusedScores {
  globalEnergy: NormalizedScore;
  globalTension: NormalizedScore;
  globalEngagement: NormalizedScore;
  globalStability: NormalizedScore;

  // Scores corrigés par baseline
  correctedEnergy: number;
  correctedTension: number;
  correctedEngagement: number;
}

/**
 * Déviation par rapport au baseline
 */
export interface BaselineDeviation {
  energyDeviation: number; // Positif = au-dessus du baseline
  tensionDeviation: number;
  engagementDeviation: number;
  isSignificant: boolean; // Déviation notable ?
  description: string; // Description textuelle
}

// ============================================================================
// RAPPORT MULTIMODAL
// ============================================================================

/**
 * Rapport multimodal pour l'utilisateur
 */
export interface MultimodalReport {
  // Indices par modalité
  visualIndices: ModalityIndices | null;
  vocalIndices: ModalityIndices | null;
  textualIndices: ModalityIndices | null;

  // Fusion
  fusionIndices: ModalityIndices;

  // Confiance
  overallConfidence: number;

  // Variation baseline
  baselineComparison: string;

  // Message humain
  humanReadableSummary: string;

  // Timestamp
  generatedAt: number;
}

/**
 * Indices pour une modalité
 */
export interface ModalityIndices {
  energy: { level: ModalityLevel; description: string };
  tension: { level: ModalityLevel; description: string };
  engagement: { level: ModalityLevel; description: string };
  stability?: { level: ModalityLevel; description: string };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration du Multimodal Fusion Engine
 */
export interface MultimodalFusionConfig {
  // Poids par défaut
  defaultWeights: {
    visionOnly: ModalityWeights;
    voiceOnly: ModalityWeights;
    textOnly: ModalityWeights;
    visionVoice: ModalityWeights;
    visionText: ModalityWeights;
    voiceText: ModalityWeights;
    fullMultimodal: ModalityWeights;
  };

  // Seuils
  thresholds: {
    lowThreshold: number;
    highThreshold: number;
    significantDeviation: number;
    minConfidenceForFusion: number;
  };

  // Mise à jour
  updateIntervalMs: number;
  smoothingFactor: number;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const getDefaultVoiceFeatures = (): VoiceFeatures => ({
  intensity: 0.5,
  energy: 0.5,
  toneStability: 0.5,
  pitchVariation: 0.3,
  tremor: 0.1,
  speechRate: 0.5,
  rhythm: 0.5,
  pauseFrequency: 0.3,
  breathingLoad: 0.2,
  breathPauses: 0.2,
  confidence: 0,
  durationMs: 0,
  sampleCount: 0,
});

export const getDefaultTextFeatures = (): TextFeatures => ({
  messageLength: 0,
  wordCount: 0,
  sentenceCount: 0,
  avgWordLength: 0,
  responseDelay: 0,
  typingSpeed: 0,
  punctuationDensity: 0,
  exclamationCount: 0,
  questionCount: 0,
  ellipsisCount: 0,
  capsRatio: 0,
  intensityMarkers: 0,
  fatigueMarkers: 0,
  stressMarkers: 0,
  positiveMarkers: 0,
  negativeMarkers: 0,
  selfDeclarations: [],
  confidence: 0,
  timestamp: 0,
});

export const getDefaultNormalizedScore = (any: any): NormalizedScore => ({
  value: 0.5,
  confidence: 0,
  variance: 0,
  origin,
  timestamp: Date?.now(),
});

export const getDefaultModalityWeights = (): ModalityWeights => ({
  vision: 0.4,
  voice: 0.3,
  text: 0.3,
});

export const getDefaultMultimodalState = (): MultimodalState => ({
  visionState: null,
  voiceState: null,
  textState: null,
  fusedScores: {
    globalEnergy: getDefaultNormalizedScore('fusion'),
    globalTension: getDefaultNormalizedScore('fusion'),
    globalEngagement: getDefaultNormalizedScore('fusion'),
    globalStability: getDefaultNormalizedScore('fusion'),
    correctedEnergy: 0.5,
    correctedTension: 0.5,
    correctedEngagement: 0.5,
  },
  globalEnergyLevel: 'medium',
  globalTensionLevel: 'medium',
  globalEngagementLevel: 'medium',
  globalStabilityLevel: 'medium',
  appliedWeights: getDefaultModalityWeights(),
  overallConfidence: 0,
  activeModalities: [],
  timestamp: 0,
  baselineDeviation: {
    energyDeviation: 0,
    tensionDeviation: 0,
    engagementDeviation: 0,
    isSignificant: false,
    description: '',
  },
});

export const getDefaultBaselineVoiceProfile = (): BaselineVoiceProfile => ({
  baselineVoiceEnergy: getDefaultStatisticalSignatureLocal(),
  baselineVoiceStability: getDefaultStatisticalSignatureLocal(),
  baselineVoiceRhythm: getDefaultStatisticalSignatureLocal(),
  baselineVoiceRange: getDefaultStatisticalSignatureLocal(),
  morningVoiceSignature: {},
  eveningVoiceSignature: {},
  samplesCount: 0,
  lastUpdated: 0,
  isCalibrated: false,
});

export const getDefaultBaselineTextProfile = (): BaselineTextProfile => ({
  baselineTextEnergy: getDefaultStatisticalSignatureLocal(),
  baselineTextClarity: getDefaultStatisticalSignatureLocal(),
  baselineTextCadence: getDefaultStatisticalSignatureLocal(),
  baselineTextLoadPattern: getDefaultStatisticalSignatureLocal(),
  typicalMessageLength: 50,
  typicalResponseDelay: 3000,
  stressTextPattern: {},
  relaxedTextPattern: {},
  samplesCount: 0,
  lastUpdated: 0,
  isCalibrated: false,
});

export const getDefaultBaselineFusionProfile = (): BaselineFusionProfile => ({
  globalEnergyCurve: {
    hourlyMeans: new Array(24).fill(0.5),
    hourlyVariances: new Array(24).fill(0.1),
    samplesPerHour: new Array(24).fill(0),
    peakHour: 10,
    lowHour: 15,
  },
  globalTensionCurve: {
    hourlyMeans: new Array(24).fill(0.3),
    hourlyVariances: new Array(24).fill(0.1),
    samplesPerHour: new Array(24).fill(0),
    peakHour: 17,
    lowHour: 7,
  },
  globalStabilityMap: {
    visionStability: 0.5,
    voiceStability: 0.5,
    textStability: 0.5,
    crossModalStability: 0.5,
  },
  multimodalCorrelationMatrix: {
    visionVoice: 0.5,
    visionText: 0.5,
    voiceText: 0.5,
    allThree: 0.5,
  },
  combinedCalmSignature: getDefaultMultimodalSignature('calm'),
  combinedStressSignature: getDefaultMultimodalSignature('stressed'),
  combinedFocusSignature: getDefaultMultimodalSignature('focused'),
  combinedFatigueSignature: getDefaultMultimodalSignature('fatigued'),
  totalSamplesCount: 0,
  lastUpdated: 0,
  isCalibrated: false,
  calibrationConfidence: 0,
});

export const getDefaultMultimodalSignature = (any: any): MultimodalSignature => ({
  label,
  visionSignature: {},
  voiceSignature: {},
  textSignature: {},
  fusionSignature: getDefaultStatisticalSignatureLocal(),
  samplesCount: 0,
  confidence: 0,
});

// Local helper pour éviter import circulaire
const getDefaultStatisticalSignatureLocal = (): StatisticalSignature => ({
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

export const MULTIMODAL_FUSION_CONFIG: MultimodalFusionConfig = {
  defaultWeights: {
    visionOnly: { vision: 1.0, voice: 0, text: 0 },
    voiceOnly: { vision: 0, voice: 1.0, text: 0 },
    textOnly: { vision: 0, voice: 0, text: 1.0 },
    visionVoice: { vision: 0.55, voice: 0.45, text: 0 },
    visionText: { vision: 0.55, voice: 0, text: 0.45 },
    voiceText: { vision: 0, voice: 0.55, text: 0.45 },
    fullMultimodal: { vision: 0.4, voice: 0.3, text: 0.3 },
  },
  thresholds: {
    lowThreshold: 0.35,
    highThreshold: 0.65,
    significantDeviation: 0.2,
    minConfidenceForFusion: 0.3,
  },
  updateIntervalMs: 500,
  smoothingFactor: 0.3,
};

// ============================================================================
// MESSAGES PRUDENTS
// ============================================================================

export const PRUDENT_MULTIMODAL_MESSAGES = {
  disclaimer:
    "Ce n'est qu'une estimation basée sur des indices observables. Je peux me tromper.",
  askConfirmation: 'Est-ce que ça te paraît juste ?',
  noData: "Je n'ai pas assez de données pour faire une estimation fiable.",
  lowConfidence: 'Ma confiance est faible sur cette estimation.',
  baselineNeeded: "Je n'ai pas encore assez appris de ton baseline pour comparer.",
  privacyReminder:
    "Rappel : aucun audio ni vidéo brut n'est stocké, seulement des valeurs numériques abstraites.",
};

export const LEVEL_DESCRIPTIONS_FR: Record<ModalityLevel, Record<string, string>> = {
  low: {
    energy: 'énergie faible',
    tension: 'tension faible',
    engagement: 'engagement faible',
    stability: 'stabilité faible',
  },
  medium: {
    energy: 'énergie moyenne',
    tension: 'tension modérée',
    engagement: 'engagement moyen',
    stability: 'stabilité correcte',
  },
  high: {
    energy: 'énergie plutôt haute',
    tension: 'tension possiblement élevée',
    engagement: 'bon engagement',
    stability: 'bonne stabilité',
  },
};
