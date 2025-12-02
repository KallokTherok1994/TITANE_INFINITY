/**
 * TITANE∞ vΩ∞ — STRESS REGULATION TYPES
 * OPUS v∞.5: Stress Regulation Engine
 *
 * Types pour le moteur de régulation du stress qui propose
 * des micro-interventions adaptatives pour aider l'utilisateur.
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Non-clinique, non-thérapeutique
 * - Propositions, jamais d'impositions
 * - Respiration et pauses simples uniquement
 * - Respect du refus utilisateur
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// STRESS LEVELS
// ============================================================================

/**
 * Niveau de stress actuel
 */
export type StressLevel = 'low' | 'medium' | 'high';

/**
 * Tendance du stress
 */
export type StressTrend = 'rising' | 'falling' | 'stable';

// ============================================================================
// INTERVENTION TYPES
// ============================================================================

/**
 * Types d'interventions possibles
 */
export type InterventionType =
  | 'breath'      // Respiration guidée
  | 'pause'       // Micro-pause consciente
  | 'body'        // Scan corporel rapide
  | 'focus'       // Réduction charge cognitive
  | 'agenda'      // Ajustement d'agenda
  | 'reassurance'; // Rappel bienveillant

/**
 * Résultat perçu d'une intervention
 */
export type InterventionResult = 'helpful' | 'neutral' | 'rejected' | 'unknown';

/**
 * Priorité d'une intervention
 */
export type InterventionPriority = 'low' | 'medium' | 'high';

// ============================================================================
// INTERVENTION STRUCTURES
// ============================================================================

/**
 * Définition d'un protocole d'intervention
 */
export interface InterventionProtocol {
  type: InterventionType;
  name: string;
  description: string;
  durationSeconds: number;
  steps: InterventionStep[];
  suitableFor: StressLevel[];
  requiredContext?: string[];
}

/**
 * Étape d'une intervention
 */
export interface InterventionStep {
  instruction: string;
  durationSeconds: number;
  visualCue?: string;
  audioCue?: string;
}

/**
 * Historique d'une intervention
 */
export interface InterventionHistoryEntry {
  timestamp: number;
  type: InterventionType;
  duration: number;
  completed: boolean;
  perceivedEffect: InterventionResult;
  tensionBefore: number;
  tensionAfter?: number;
  context: {
    stressLevel: StressLevel;
    hourOfDay: number;
    agendaLoad: number;
  };
}

/**
 * Poids d'efficacité des interventions
 */
export interface InterventionWeights {
  breath: number;
  pause: number;
  body: number;
  focus: number;
  agenda: number;
  reassurance: number;
}

// ============================================================================
// STRESS REGULATION STATE
// ============================================================================

/**
 * État de régulation du stress - ajouté au SingularityState
 */
export interface StressRegulationState {
  // Niveau et tendance actuels
  currentLevel: StressLevel;
  trend: StressTrend;

  // Dernière intervention
  lastInterventionType: InterventionType | null;
  lastInterventionTimestamp: number | null;
  lastInterventionResult: InterventionResult | null;

  // Historique
  interventionHistory: InterventionHistoryEntry[];

  // Configuration utilisateur
  autoRegulationEnabled: boolean;
  maxInterventionFrequency: number;  // Interventions max par heure
  cooldownMs: number;                // Temps minimum entre interventions

  // État cooldown
  cooldownActive: boolean;
  cooldownEndsAt: number | null;

  // Poids appris
  interventionWeights: InterventionWeights;

  // Statistiques
  totalInterventions: number;
  helpfulInterventions: number;
  rejectedInterventions: number;

  // Métadonnées
  lastUpdate: number;
}

// ============================================================================
// TRIGGER CONDITIONS
// ============================================================================

/**
 * Conditions de déclenchement d'une intervention
 */
export interface TriggerConditions {
  tensionAboveBaseline: boolean;
  tensionRising: boolean;
  changeProbabilityHigh: boolean;
  requiresAttention: boolean;
  userDeclaredStress: boolean;
  agendaOverloaded: boolean;
}

/**
 * Résultat d'évaluation de déclenchement
 */
export interface TriggerEvaluation {
  shouldTrigger: boolean;
  reason: string;
  priority: InterventionPriority;
  suggestedType: InterventionType;
  conditions: TriggerConditions;
}

// ============================================================================
// INTERVENTION SELECTION
// ============================================================================

/**
 * Contexte pour la sélection d'intervention
 */
export interface InterventionSelectionContext {
  stressLevel: StressLevel;
  stressTrend: StressTrend;
  hourOfDay: number;
  agendaLoad: number;        // 0-1
  recentRejections: InterventionType[];
  weights: InterventionWeights;
}

/**
 * Recommandation d'intervention
 */
export interface InterventionRecommendation {
  type: InterventionType;
  protocol: InterventionProtocol;
  confidence: number;
  reason: string;
  alternatives: InterventionType[];
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration du Stress Regulation Engine
 */
export interface StressRegulationConfig {
  // Seuils de déclenchement
  tensionThresholdMultiplier: number;  // Déclenchement si tension > baseline * multiplier
  changeProbabilityThreshold: number;  // Seuil de probabilité de changement

  // Timing
  defaultCooldownMs: number;           // 900000 = 15 minutes
  maxInterventionsPerHour: number;     // Maximum 4 par heure

  // Apprentissage
  learningRate: number;                // Vitesse d'apprentissage des poids
  minWeightValue: number;              // Poids minimum (éviter abandon total)
  maxWeightValue: number;              // Poids maximum

  // Feedback
  feedbackTimeoutMs: number;           // Temps pour donner un feedback

  // Protocoles activés
  enabledInterventions: InterventionType[];
}

// ============================================================================
// DEFAULT FACTORIES
// ============================================================================

export const getDefaultInterventionWeights = (): InterventionWeights => ({
  breath: 1.0,
  pause: 1.0,
  body: 0.8,
  focus: 0.9,
  agenda: 0.7,
  reassurance: 0.6,
});

export const getDefaultStressRegulationConfig = (): StressRegulationConfig => ({
  tensionThresholdMultiplier: 1.5,
  changeProbabilityThreshold: 0.6,
  defaultCooldownMs: 900000,
  maxInterventionsPerHour: 4,
  learningRate: 0.1,
  minWeightValue: 0.1,
  maxWeightValue: 2.0,
  feedbackTimeoutMs: 120000,
  enabledInterventions: ['breath', 'pause', 'body', 'focus', 'agenda', 'reassurance'],
});

export const getDefaultStressRegulationState = (): StressRegulationState => ({
  currentLevel: 'low',
  trend: 'stable',
  lastInterventionType: null,
  lastInterventionTimestamp: null,
  lastInterventionResult: null,
  interventionHistory: [],
  autoRegulationEnabled: true,
  maxInterventionFrequency: 4,
  cooldownMs: 900000,
  cooldownActive: false,
  cooldownEndsAt: null,
  interventionWeights: getDefaultInterventionWeights(),
  totalInterventions: 0,
  helpfulInterventions: 0,
  rejectedInterventions: 0,
  lastUpdate: 0,
});

// ============================================================================
// INTERVENTION PROTOCOLS
// ============================================================================

export const BREATH_PROTOCOL: InterventionProtocol = {
  type: 'breath',
  name: 'Respiration guidée courte',
  description: '4-6 respirations profondes pour se recentrer',
  durationSeconds: 45,
  steps: [
    { instruction: 'Inspire doucement par le nez pendant 4 secondes...', durationSeconds: 4 },
    { instruction: 'Garde l\'air 2 secondes...', durationSeconds: 2 },
    { instruction: 'Expire lentement par la bouche pendant 6 secondes...', durationSeconds: 6 },
    { instruction: 'Inspire doucement par le nez pendant 4 secondes...', durationSeconds: 4 },
    { instruction: 'Garde l\'air 2 secondes...', durationSeconds: 2 },
    { instruction: 'Expire lentement par la bouche pendant 6 secondes...', durationSeconds: 6 },
    { instruction: 'Inspire doucement par le nez pendant 4 secondes...', durationSeconds: 4 },
    { instruction: 'Garde l\'air 2 secondes...', durationSeconds: 2 },
    { instruction: 'Expire lentement par la bouche pendant 6 secondes...', durationSeconds: 6 },
    { instruction: 'Reprends ton rythme naturel.', durationSeconds: 3 },
  ],
  suitableFor: ['medium', 'high'],
};

export const PAUSE_PROTOCOL: InterventionProtocol = {
  type: 'pause',
  name: 'Micro-pause consciente',
  description: 'Courte pause pour se ressourcer',
  durationSeconds: 90,
  steps: [
    { instruction: 'Lève-toi doucement si tu peux.', durationSeconds: 10 },
    { instruction: 'Étire tes bras vers le haut, relâche.', durationSeconds: 15 },
    { instruction: 'Roule doucement les épaules.', durationSeconds: 15 },
    { instruction: 'Regarde au loin, détends tes yeux.', durationSeconds: 20 },
    { instruction: 'Prends une gorgée d\'eau si tu en as.', durationSeconds: 15 },
    { instruction: 'Reviens quand tu es prêt.', durationSeconds: 15 },
  ],
  suitableFor: ['low', 'medium'],
};

export const BODY_SCAN_PROTOCOL: InterventionProtocol = {
  type: 'body',
  name: 'Scan corporel rapide',
  description: 'Observer et relâcher les tensions',
  durationSeconds: 30,
  steps: [
    { instruction: 'Porte attention à tes épaules. Relâche-les.', durationSeconds: 8 },
    { instruction: 'Détends ta mâchoire, laisse-la s\'ouvrir légèrement.', durationSeconds: 8 },
    { instruction: 'Relâche tes mains, desserre les doigts.', durationSeconds: 8 },
    { instruction: 'Prends une respiration profonde.', durationSeconds: 6 },
  ],
  suitableFor: ['medium', 'high'],
};

export const FOCUS_PROTOCOL: InterventionProtocol = {
  type: 'focus',
  name: 'Recentrage cognitif',
  description: 'Réduire la charge mentale',
  durationSeconds: 20,
  steps: [
    { instruction: 'Identifie UNE seule chose à faire maintenant.', durationSeconds: 10 },
    { instruction: 'Mets le reste de côté mentalement.', durationSeconds: 5 },
    { instruction: 'Concentre-toi uniquement sur cette tâche.', durationSeconds: 5 },
  ],
  suitableFor: ['medium', 'high'],
};

export const AGENDA_PROTOCOL: InterventionProtocol = {
  type: 'agenda',
  name: 'Ajustement d\'agenda',
  description: 'Alléger la charge prévue',
  durationSeconds: 30,
  steps: [
    { instruction: 'Regarde ta liste de tâches à venir.', durationSeconds: 10 },
    { instruction: 'Y a-t-il quelque chose de non-urgent qu\'on peut décaler ?', durationSeconds: 10 },
    { instruction: 'Je peux t\'aider à réorganiser si tu veux.', durationSeconds: 10 },
  ],
  suitableFor: ['medium', 'high'],
};

export const REASSURANCE_PROTOCOL: InterventionProtocol = {
  type: 'reassurance',
  name: 'Rappel bienveillant',
  description: 'Auto-bienveillance simple',
  durationSeconds: 15,
  steps: [
    { instruction: 'Tu fais de ton mieux avec ce que tu as.', durationSeconds: 5 },
    { instruction: 'C\'est normal de ressentir de la tension parfois.', durationSeconds: 5 },
    { instruction: 'Prends le temps qu\'il te faut.', durationSeconds: 5 },
  ],
  suitableFor: ['low', 'medium'],
};

export const ALL_PROTOCOLS: Record<InterventionType, InterventionProtocol> = {
  breath: BREATH_PROTOCOL,
  pause: PAUSE_PROTOCOL,
  body: BODY_SCAN_PROTOCOL,
  focus: FOCUS_PROTOCOL,
  agenda: AGENDA_PROTOCOL,
  reassurance: REASSURANCE_PROTOCOL,
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const STRESS_REGULATION_CONSTANTS = {
  // Timing
  MIN_COOLDOWN_MS: 300000,           // 5 minutes minimum
  MAX_COOLDOWN_MS: 3600000,          // 1 heure maximum
  DEFAULT_COOLDOWN_MS: 900000,       // 15 minutes par défaut

  // Limites
  MAX_HISTORY_SIZE: 100,
  MAX_REJECTIONS_BEFORE_DISABLE: 5,  // Désactiver après 5 refus consécutifs

  // Labels
  LEVEL_LABELS: {
    low: 'faible',
    medium: 'modéré',
    high: 'élevé',
  } as const,

  INTERVENTION_LABELS: {
    breath: 'respiration guidée',
    pause: 'micro-pause',
    body: 'scan corporel',
    focus: 'recentrage',
    agenda: 'ajustement agenda',
    reassurance: 'rappel bienveillant',
  } as const,

  RESULT_LABELS: {
    helpful: 'utile',
    neutral: 'neutre',
    rejected: 'refusé',
    unknown: 'inconnu',
  } as const,
} as const;
