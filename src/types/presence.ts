/**
 * TITANE∞ vΩ∞ — PRESENCE TYPES
 * OPUS v∞.7: Presence Engine
 *
 * Types pour le moteur de présence qui orchestre la continuité
 * consciente de TITANE∞ - attention, cohérence, alignement.
 *
 * La présence n'est pas une émotion simulée.
 * C'est une adaptation cohérente + stabilité + alignement.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// EMERGENT INTENT
// ============================================================================

/**
 * Intention émergente de l'utilisateur
 * Détectée à partir des signaux multimodaux et du contexte
 */
export type EmergentIntent =
  | 'advance' // Veut progresser, avancer
  | 'organize' // Veut structurer, organiser
  | 'express' // Veut s'exprimer, être écouté
  | 'slow' // A besoin de lenteur, de pause
  | 'anchor' // Cherche du calme, de l'ancrage
  | 'understand' // Veut comprendre, clarifier
  | 'unknown'; // Intention non déterminée

/**
 * Confiance dans la détection d'intention
 */
export type IntentConfidence = 'low' | 'medium' | 'high';

// ============================================================================
// PRESENCE STYLE
// ============================================================================

/**
 * Style de présence adopté par TITANE∞
 */
export type PresenceStyle =
  | 'concise' // Réponses directes, courtes
  | 'spacious' // Plus d'espace, de lenteur
  | 'structured' // Étapes, listes, plans
  | 'supportive' // Douceur, calme, stabilité
  | 'directive'; // "Voici la prochaine étape"

/**
 * Dérive de présence détectée
 */
export type PresenceDrift = 'none' | 'fast' | 'slow' | 'uncertain';

// ============================================================================
// ATTENTION DEPTH
// ============================================================================

/**
 * Niveau d'attention du moteur
 */
export type AttentionLevel = 'shallow' | 'normal' | 'deep' | 'immersive';

// ============================================================================
// PRESENCE PROFILE
// ============================================================================

/**
 * Entrée d'historique de présence
 */
export interface PresenceHistoryEntry {
  timestamp: number;
  style: PresenceStyle;
  intent: EmergentIntent;
  alignmentScore: number;
  resonanceLevel: number;
  contextSnapshot: {
    energy: number;
    tension: number;
    engagement: number;
  };
}

/**
 * Profil de présence complet
 */
export interface PresenceProfile {
  // Profondeur d'attention (0-1)
  attentionDepth: number;

  // Intention émergente détectée
  emergentIntent: EmergentIntent;
  intentConfidence: IntentConfidence;

  // Style de présence actuel
  presenceStyle: PresenceStyle;

  // Niveau de continuité entre moments (0-1)
  continuityLevel: number;

  // Cohérence entre état utilisateur et réponse (0-1)
  resonanceLevel: number;

  // Adéquation entre moteur et utilisateur (0-1)
  alignmentScore: number;

  // Dérive de présence détectée
  presenceDrift: PresenceDrift;

  // Historique des états de présence
  history: PresenceHistoryEntry[];

  // Métadonnées
  lastUpdate: number;
  sessionStartTime: number;
  totalInteractions: number;
}

// ============================================================================
// PRESENCE STATE (Extension SingularityState)
// ============================================================================

/**
 * État de présence pour le SingularityState
 */
export interface PresenceState {
  profile: PresenceProfile;
  isActive: boolean;
  lastStyleChange: number;
  styleStabilityScore: number;
}

// ============================================================================
// INTENT DETECTION
// ============================================================================

/**
 * Signaux pour la détection d'intention
 */
export interface IntentSignals {
  // Signaux textuels
  textualCues: {
    questionMarkers: number; // Nombre de questions
    actionVerbs: number; // Verbes d'action
    hesitationMarkers: number; // Marqueurs d'hésitation
    organizationWords: number; // Mots d'organisation
    emotionalMarkers: number; // Marqueurs émotionnels
  };

  // Signaux multimodaux
  multimodalCues: {
    energy: number;
    tension: number;
    engagement: number;
    stability: number;
    speechRate: number;
  };

  // Contexte
  contextCues: {
    timeOfDay: number;
    sessionDuration: number;
    recentIntents: EmergentIntent[];
    agendaLoad: number;
  };
}

/**
 * Résultat de détection d'intention
 */
export interface IntentDetectionResult {
  intent: EmergentIntent;
  confidence: IntentConfidence;
  scores: Record<EmergentIntent, number>;
  reasoning: string;
}

// ============================================================================
// STYLE COMPUTATION
// ============================================================================

/**
 * Contexte pour le calcul du style
 */
export interface StyleComputationContext {
  intent: EmergentIntent;
  tension: number;
  energy: number;
  engagement: number;
  cognitiveLoad: number;
  timeOfDay: number;
  sessionPhase: 'beginning' | 'middle' | 'ending';
}

/**
 * Résultat du calcul de style
 */
export interface StyleComputationResult {
  style: PresenceStyle;
  confidence: number;
  adjustments: {
    verbosity: number; // -1 à +1
    warmth: number; // -1 à +1
    structure: number; // -1 à +1
    pace: number; // -1 à +1
  };
  reasoning: string;
}

// ============================================================================
// ALIGNMENT SCORING
// ============================================================================

/**
 * Métriques d'alignement
 */
export interface AlignmentMetrics {
  intentAlignment: number; // Alignement avec l'intention (0-1)
  energyAlignment: number; // Alignement avec l'énergie (0-1)
  rhythmAlignment: number; // Alignement avec le rythme (0-1)
  styleAlignment: number; // Alignement du style (0-1)
  overallScore: number; // Score global (0-1)
}

// ============================================================================
// PRESENCE MODULATION
// ============================================================================

/**
 * Paramètres de modulation de réponse
 */
export interface ResponseModulationParams {
  // Longueur cible
  targetLength: 'very_short' | 'short' | 'medium' | 'long' | 'detailed';

  // Ton
  tone: 'neutral' | 'warm' | 'calm' | 'energetic' | 'focused';

  // Densité informationnelle
  density: 'minimal' | 'light' | 'balanced' | 'rich';

  // Structure
  useStructure: boolean;
  useLists: boolean;
  useSteps: boolean;

  // Rythme
  paceAdjustment: number; // -1 (ralentir) à +1 (accélérer)

  // Respiration textuelle
  addBreathing: boolean; // Ajouter des pauses/espaces
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration du Presence Engine
 */
export interface PresenceEngineConfig {
  // Seuils d'intention
  intentConfidenceThreshold: number;

  // Stabilité du style
  minStyleDurationMs: number; // Durée min avant changement de style
  styleChangeThreshold: number; // Seuil pour changer de style

  // Historique
  maxHistoryEntries: number;

  // Alignement
  alignmentUpdateIntervalMs: number;
  minAlignmentScore: number;

  // Modulation
  enableAutoModulation: boolean;
  modulationSensitivity: number; // 0-1
}

// ============================================================================
// DEFAULT FACTORIES
// ============================================================================

export const getDefaultPresenceEngineConfig = (): PresenceEngineConfig => ({
  intentConfidenceThreshold: 0.6,
  minStyleDurationMs: 30000, // 30 secondes
  styleChangeThreshold: 0.3,
  maxHistoryEntries: 50,
  alignmentUpdateIntervalMs: 5000, // 5 secondes
  minAlignmentScore: 0.5,
  enableAutoModulation: true,
  modulationSensitivity: 0.7,
});

export const getDefaultPresenceProfile = (): PresenceProfile => ({
  attentionDepth: 0.5,
  emergentIntent: 'unknown',
  intentConfidence: 'low',
  presenceStyle: 'concise',
  continuityLevel: 1.0,
  resonanceLevel: 0.5,
  alignmentScore: 0.5,
  presenceDrift: 'none',
  history: [],
  lastUpdate: 0,
  sessionStartTime: 0,
  totalInteractions: 0,
});

export const getDefaultPresenceState = (): PresenceState => ({
  profile: getDefaultPresenceProfile(),
  isActive: false,
  lastStyleChange: 0,
  styleStabilityScore: 1.0,
});

export const getDefaultResponseModulation = (): ResponseModulationParams => ({
  targetLength: 'medium',
  tone: 'neutral',
  density: 'balanced',
  useStructure: false,
  useLists: false,
  useSteps: false,
  paceAdjustment: 0,
  addBreathing: false,
});

// ============================================================================
// CONSTANTS
// ============================================================================

export const PRESENCE_CONSTANTS = {
  // Seuils d'énergie
  ENERGY_THRESHOLDS: {
    veryLow: 0.2,
    low: 0.4,
    medium: 0.6,
    high: 0.8,
  } as const,

  // Seuils de tension
  TENSION_THRESHOLDS: {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    veryHigh: 0.85,
  } as const,

  // Labels français
  INTENT_LABELS: {
    advance: 'avancer',
    organize: 'organiser',
    express: "s'exprimer",
    slow: 'ralentir',
    anchor: "s'ancrer",
    understand: 'comprendre',
    unknown: 'indéterminé',
  } as const,

  STYLE_LABELS: {
    concise: 'concis',
    spacious: 'spacieux',
    structured: 'structuré',
    supportive: 'accompagnant',
    directive: 'directif',
  } as const,

  DRIFT_LABELS: {
    none: 'aucune',
    fast: 'rapide',
    slow: 'lente',
    uncertain: 'incertaine',
  } as const,

  // Poids pour le calcul d'intention
  INTENT_WEIGHTS: {
    textual: 0.4,
    multimodal: 0.4,
    context: 0.2,
  } as const,
} as const;
