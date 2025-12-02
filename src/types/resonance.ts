/**
 * TITANE∞ vΩ∞ — RESONANCE TYPES
 * OPUS v∞.9: Conversational Resonance Engine Types
 *
 * Définitions de types pour le moteur de résonance conversationnelle :
 * - ResonanceProfile : profil de résonance de l'utilisateur
 * - ResonanceState : état courant de la résonance
 * - LinguisticAdaptation : adaptation linguistique
 * - ToneModulation : modulation du ton
 * - RhythmSynchronization : synchronisation du rythme
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

/**
 * Style linguistique global
 */
export type LinguisticStyle =
  | 'formal'      // Formel, professionnel
  | 'casual'      // Décontracté, familier
  | 'technical'   // Technique, précis
  | 'poetic'      // Poétique, métaphorique
  | 'direct'      // Direct, concis
  | 'elaborated'  // Élaboré, détaillé
  | 'empathetic'  // Empathique, chaleureux
  | 'neutral';    // Neutre, équilibré

/**
 * Ton émotionnel
 */
export type EmotionalTone =
  | 'warm'        // Chaleureux
  | 'calm'        // Calme
  | 'energetic'   // Énergique
  | 'supportive'  // Soutenant
  | 'focused'     // Concentré
  | 'playful'     // Ludique
  | 'serious'     // Sérieux
  | 'reassuring'  // Rassurant
  | 'neutral';    // Neutre

/**
 * Rythme conversationnel
 */
export type ConversationalRhythm =
  | 'rapid'       // Rapide, dynamique
  | 'moderate'    // Modéré, équilibré
  | 'slow'        // Lent, posé
  | 'variable'    // Variable selon le contexte
  | 'matched';    // Synchronisé avec l'utilisateur

/**
 * Niveau de complexité linguistique
 */
export type ComplexityLevel =
  | 'simple'      // Vocabulaire simple, phrases courtes
  | 'standard'    // Niveau standard
  | 'elevated'    // Vocabulaire riche, constructions variées
  | 'expert';     // Terminologie spécialisée

/**
 * Type de synchronisation
 */
export type SyncType =
  | 'mirroring'   // Miroir : imiter le style de l'utilisateur
  | 'complementing' // Compléter : compenser le style
  | 'leading'     // Guider : orienter vers un nouveau style
  | 'neutral';    // Neutre : style par défaut

/**
 * Dimension de résonance
 */
export type ResonanceDimension =
  | 'lexical'     // Choix des mots
  | 'syntactic'   // Structure des phrases
  | 'semantic'    // Sens et signification
  | 'prosodic'    // Rythme et ton
  | 'pragmatic';  // Intention et contexte

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Analyse linguistique d'un texte
 */
export interface LinguisticAnalysis {
  // Métriques de base
  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  averageWordLength: number;

  // Complexité
  complexityScore: number;           // 0-1
  vocabularyRichness: number;        // 0-1
  readabilityScore: number;          // 0-1

  // Style détecté
  detectedStyle: LinguisticStyle;
  styleConfidence: number;           // 0-1

  // Ton
  detectedTone: EmotionalTone;
  toneIntensity: number;             // 0-1

  // Rythme
  rhythm: ConversationalRhythm;
  pacingScore: number;               // 0-1

  // Marqueurs spécifiques
  questionCount: number;
  exclamationCount: number;
  hesitationMarkers: number;
  emphasisMarkers: number;
}

/**
 * Adaptation linguistique à appliquer
 */
export interface LinguisticAdaptation {
  // Style cible
  targetStyle: LinguisticStyle;
  styleBlend: Partial<Record<LinguisticStyle, number>>; // Mélange de styles

  // Ton cible
  targetTone: EmotionalTone;
  toneIntensity: number;             // 0-1

  // Complexité cible
  targetComplexity: ComplexityLevel;

  // Rythme cible
  targetRhythm: ConversationalRhythm;

  // Synchronisation
  syncType: SyncType;
  syncStrength: number;              // 0-1

  // Ajustements spécifiques
  adjustments: {
    verbosity: number;               // -1 à 1 (moins à plus)
    formality: number;               // -1 à 1 (informel à formel)
    warmth: number;                  // 0 à 1
    precision: number;               // 0 à 1
    creativity: number;              // 0 à 1
  };
}

/**
 * Paramètres de modulation du ton
 */
export interface ToneModulation {
  // Ton principal
  baseTone: EmotionalTone;

  // Sous-tons (nuances)
  undertones: Array<{
    tone: EmotionalTone;
    weight: number;                  // 0-1
  }>;

  // Intensité globale
  overallIntensity: number;          // 0-1

  // Variation autorisée
  variationRange: number;            // 0-1

  // Contraintes
  avoidTones: EmotionalTone[];       // Tons à éviter
  preferredTransitions: Array<{
    from: EmotionalTone;
    to: EmotionalTone;
    smoothness: number;              // 0-1
  }>;
}

/**
 * Paramètres de synchronisation du rythme
 */
export interface RhythmSynchronization {
  // Rythme de base
  baseRhythm: ConversationalRhythm;

  // Synchronisation avec l'utilisateur
  userRhythmMatch: number;           // 0-1

  // Paramètres de phrase
  sentenceLength: {
    target: number;                  // Nombre de mots cible
    variance: number;                // Variance autorisée
  };

  // Paramètres de paragraphe
  paragraphLength: {
    target: number;                  // Nombre de phrases cible
    variance: number;
  };

  // Pauses et respiration
  breathingPoints: {
    frequency: number;               // 0-1 (peu fréquent à fréquent)
    placement: 'natural' | 'regular' | 'dramatic';
  };

  // Timing
  responseLatency: 'immediate' | 'considered' | 'deliberate';
}

/**
 * Score de résonance par dimension
 */
export interface ResonanceScores {
  lexical: number;                   // 0-1
  syntactic: number;                 // 0-1
  semantic: number;                  // 0-1
  prosodic: number;                  // 0-1
  pragmatic: number;                 // 0-1
  overall: number;                   // 0-1 (moyenne pondérée)
}

/**
 * Historique de résonance
 */
export interface ResonanceHistoryEntry {
  timestamp: number;
  userAnalysis: LinguisticAnalysis;
  adaptation: LinguisticAdaptation;
  resonanceScores: ResonanceScores;
  feedbackSignal?: number;           // -1 à 1 (négatif à positif)
}

/**
 * Préférences linguistiques de l'utilisateur (apprises)
 */
export interface UserLinguisticPreferences {
  // Style préféré
  preferredStyle: LinguisticStyle;
  styleVariability: number;          // 0-1

  // Ton préféré
  preferredTone: EmotionalTone;
  toneVariability: number;           // 0-1

  // Complexité préférée
  preferredComplexity: ComplexityLevel;

  // Rythme préféré
  preferredRhythm: ConversationalRhythm;

  // Sensibilités
  sensitivities: {
    toFormality: number;             // 0-1
    toTechnicalLanguage: number;     // 0-1
    toEmotionalLanguage: number;     // 0-1
    toLength: number;                // 0-1
  };

  // Vocabulaire
  vocabulary: {
    technicalTermsComfort: number;   // 0-1
    abstractConceptsComfort: number; // 0-1
    idiomsFamiliarity: number;       // 0-1
  };

  // Confiance dans les préférences
  confidence: number;                // 0-1
  sampleSize: number;                // Nombre d'interactions analysées
}

/**
 * Profil de résonance de l'utilisateur
 */
export interface ResonanceProfile {
  // Préférences apprises
  preferences: UserLinguisticPreferences;

  // Patterns observés
  patterns: {
    morningStyle?: LinguisticStyle;
    afternoonStyle?: LinguisticStyle;
    eveningStyle?: LinguisticStyle;
    stressedStyle?: LinguisticStyle;
    relaxedStyle?: LinguisticStyle;
  };

  // Historique
  history: ResonanceHistoryEntry[];

  // Statistiques
  totalInteractions: number;
  averageResonance: number;
  bestResonanceScore: number;

  // Métadonnées
  lastUpdate: number;
  profileVersion: number;
}

/**
 * État complet du moteur de résonance
 */
export interface ResonanceState {
  // État actif
  isActive: boolean;

  // Analyse courante
  currentUserAnalysis: LinguisticAnalysis | null;
  currentAdaptation: LinguisticAdaptation;

  // Modulations actives
  toneModulation: ToneModulation;
  rhythmSync: RhythmSynchronization;

  // Scores courants
  currentResonance: ResonanceScores;

  // Profil
  profile: ResonanceProfile;

  // Métadonnées
  lastUpdate: number;
  error: string | null;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration du moteur de résonance
 */
export interface ResonanceEngineConfig {
  // Sensibilité de l'adaptation
  adaptationSensitivity: number;     // 0-1

  // Lissage des changements
  smoothingFactor: number;           // 0-1 (plus haut = plus de lissage)

  // Limites d'adaptation
  maxStyleShift: number;             // Distance max de changement de style
  maxToneShift: number;              // Distance max de changement de ton

  // Synchronisation
  syncEnabled: boolean;
  syncDelay: number;                 // ms avant de synchroniser

  // Apprentissage
  learningEnabled: boolean;
  learningRate: number;              // 0-1

  // Historique
  maxHistoryEntries: number;

  // Mise à jour
  updateIntervalMs: number;
}

// ============================================================================
// RÉSULTATS
// ============================================================================

/**
 * Résultat de l'analyse d'un message utilisateur
 */
export interface UserMessageAnalysisResult {
  analysis: LinguisticAnalysis;
  suggestedAdaptation: LinguisticAdaptation;
  resonanceImpact: ResonanceScores;
}

/**
 * Résultat de la génération de paramètres de réponse
 */
export interface ResponseParametersResult {
  adaptation: LinguisticAdaptation;
  toneModulation: ToneModulation;
  rhythmSync: RhythmSynchronization;
  styleSummary: string;
}

/**
 * Résultat de la modulation d'une réponse
 */
export interface ResponseModulationResult {
  originalLength: number;
  modulatedLength: number;
  appliedModulations: string[];
  finalResonanceScore: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const RESONANCE_CONSTANTS = {
  // Poids par dimension pour le score global
  DIMENSION_WEIGHTS: {
    lexical: 0.20,
    syntactic: 0.15,
    semantic: 0.25,
    prosodic: 0.20,
    pragmatic: 0.20,
  } as Record<ResonanceDimension, number>,

  // Seuils de résonance
  RESONANCE_THRESHOLDS: {
    excellent: 0.85,
    good: 0.70,
    moderate: 0.50,
    poor: 0.30,
  },

  // Labels
  STYLE_LABELS: {
    formal: 'Formel',
    casual: 'Décontracté',
    technical: 'Technique',
    poetic: 'Poétique',
    direct: 'Direct',
    elaborated: 'Élaboré',
    empathetic: 'Empathique',
    neutral: 'Neutre',
  } as Record<LinguisticStyle, string>,

  TONE_LABELS: {
    warm: 'Chaleureux',
    calm: 'Calme',
    energetic: 'Énergique',
    supportive: 'Soutenant',
    focused: 'Concentré',
    playful: 'Ludique',
    serious: 'Sérieux',
    reassuring: 'Rassurant',
    neutral: 'Neutre',
  } as Record<EmotionalTone, string>,

  RHYTHM_LABELS: {
    rapid: 'Rapide',
    moderate: 'Modéré',
    slow: 'Lent',
    variable: 'Variable',
    matched: 'Synchronisé',
  } as Record<ConversationalRhythm, string>,

  COMPLEXITY_LABELS: {
    simple: 'Simple',
    standard: 'Standard',
    elevated: 'Soutenu',
    expert: 'Expert',
  } as Record<ComplexityLevel, string>,

  // Distances entre styles (pour transitions)
  STYLE_DISTANCES: {
    formal: { casual: 0.8, technical: 0.3, poetic: 0.6, direct: 0.4, elaborated: 0.3, empathetic: 0.5, neutral: 0.2 },
    casual: { formal: 0.8, technical: 0.7, poetic: 0.5, direct: 0.3, elaborated: 0.5, empathetic: 0.2, neutral: 0.4 },
    technical: { formal: 0.3, casual: 0.7, poetic: 0.8, direct: 0.2, elaborated: 0.4, empathetic: 0.6, neutral: 0.3 },
  } as Partial<Record<LinguisticStyle, Partial<Record<LinguisticStyle, number>>>>,
};

// ============================================================================
// FONCTIONS UTILITAIRES - DEFAULTS
// ============================================================================

export function getDefaultLinguisticAnalysis(): LinguisticAnalysis {
  return {
    wordCount: 0,
    sentenceCount: 0,
    averageSentenceLength: 0,
    averageWordLength: 0,
    complexityScore: 0.5,
    vocabularyRichness: 0.5,
    readabilityScore: 0.5,
    detectedStyle: 'neutral',
    styleConfidence: 0,
    detectedTone: 'neutral',
    toneIntensity: 0.5,
    rhythm: 'moderate',
    pacingScore: 0.5,
    questionCount: 0,
    exclamationCount: 0,
    hesitationMarkers: 0,
    emphasisMarkers: 0,
  };
}

export function getDefaultLinguisticAdaptation(): LinguisticAdaptation {
  return {
    targetStyle: 'neutral',
    styleBlend: { neutral: 1 },
    targetTone: 'neutral',
    toneIntensity: 0.5,
    targetComplexity: 'standard',
    targetRhythm: 'moderate',
    syncType: 'neutral',
    syncStrength: 0.5,
    adjustments: {
      verbosity: 0,
      formality: 0,
      warmth: 0.5,
      precision: 0.5,
      creativity: 0.5,
    },
  };
}

export function getDefaultToneModulation(): ToneModulation {
  return {
    baseTone: 'neutral',
    undertones: [],
    overallIntensity: 0.5,
    variationRange: 0.3,
    avoidTones: [],
    preferredTransitions: [],
  };
}

export function getDefaultRhythmSynchronization(): RhythmSynchronization {
  return {
    baseRhythm: 'moderate',
    userRhythmMatch: 0.5,
    sentenceLength: { target: 15, variance: 5 },
    paragraphLength: { target: 3, variance: 1 },
    breathingPoints: { frequency: 0.5, placement: 'natural' },
    responseLatency: 'considered',
  };
}

export function getDefaultResonanceScores(): ResonanceScores {
  return {
    lexical: 0.5,
    syntactic: 0.5,
    semantic: 0.5,
    prosodic: 0.5,
    pragmatic: 0.5,
    overall: 0.5,
  };
}

export function getDefaultUserLinguisticPreferences(): UserLinguisticPreferences {
  return {
    preferredStyle: 'neutral',
    styleVariability: 0.5,
    preferredTone: 'neutral',
    toneVariability: 0.5,
    preferredComplexity: 'standard',
    preferredRhythm: 'moderate',
    sensitivities: {
      toFormality: 0.5,
      toTechnicalLanguage: 0.5,
      toEmotionalLanguage: 0.5,
      toLength: 0.5,
    },
    vocabulary: {
      technicalTermsComfort: 0.5,
      abstractConceptsComfort: 0.5,
      idiomsFamiliarity: 0.5,
    },
    confidence: 0,
    sampleSize: 0,
  };
}

export function getDefaultResonanceProfile(): ResonanceProfile {
  return {
    preferences: getDefaultUserLinguisticPreferences(),
    patterns: {},
    history: [],
    totalInteractions: 0,
    averageResonance: 0.5,
    bestResonanceScore: 0,
    lastUpdate: Date.now(),
    profileVersion: 1,
  };
}

export function getDefaultResonanceState(): ResonanceState {
  return {
    isActive: false,
    currentUserAnalysis: null,
    currentAdaptation: getDefaultLinguisticAdaptation(),
    toneModulation: getDefaultToneModulation(),
    rhythmSync: getDefaultRhythmSynchronization(),
    currentResonance: getDefaultResonanceScores(),
    profile: getDefaultResonanceProfile(),
    lastUpdate: Date.now(),
    error: null,
  };
}

export function getDefaultResonanceEngineConfig(): ResonanceEngineConfig {
  return {
    adaptationSensitivity: 0.6,
    smoothingFactor: 0.7,
    maxStyleShift: 0.5,
    maxToneShift: 0.4,
    syncEnabled: true,
    syncDelay: 2000,
    learningEnabled: true,
    learningRate: 0.1,
    maxHistoryEntries: 100,
    updateIntervalMs: 1000,
  };
}
