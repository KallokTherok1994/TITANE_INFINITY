/**
 * TITANE∞ vΩ∞ — FLOW TYPES
 * OPUS v∞.8: Focus & Flow Engine Types
 *
 * Définitions de types pour le moteur de flux :
 * - FlowProfile : profil de flux de l'utilisateur
 * - FlowState : état courant du flux
 * - FlowZone : zone de flux (challenge vs. compétence)
 * - FlowConditions : conditions pour entrer en flux
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

/**
 * Zone de flux basée sur le modèle de Csikszentmihalyi
 */
export type FlowZone =
  | 'anxiety'    // Challenge trop élevé par rapport aux compétences
  | 'flow'       // Équilibre parfait challenge/compétences
  | 'boredom'    // Challenge trop faible
  | 'apathy'     // Faible challenge ET faibles compétences perçues
  | 'control'    // Compétences élevées, challenge modéré
  | 'relaxation' // Compétences élevées, challenge faible
  | 'arousal'    // Challenge élevé, compétences modérées (proche du flow)
  | 'worry';     // Challenge modéré, compétences faibles

/**
 * Phase du cycle de flux
 */
export type FlowPhase =
  | 'preparation'   // Préparation à l'entrée en flow
  | 'struggle'      // Phase de lutte initiale (normal)
  | 'release'       // Lâcher-prise
  | 'flow'          // État de flow actif
  | 'recovery'      // Récupération post-flow
  | 'idle';         // Pas en cycle de flow

/**
 * Type de transition de flux
 */
export type FlowTransition =
  | 'entering'      // Entrée dans le flow
  | 'deepening'     // Approfondissement du flow
  | 'maintaining'   // Maintien du flow
  | 'surfacing'     // Remontée du flow
  | 'exiting'       // Sortie du flow
  | 'interrupted'   // Flow interrompu
  | 'none';         // Pas de transition

/**
 * Niveau de préparation au focus
 */
export type FocusReadiness =
  | 'optimal'       // Conditions parfaites pour le flow
  | 'good'          // Bonnes conditions
  | 'moderate'      // Conditions moyennes
  | 'poor'          // Mauvaises conditions
  | 'blocked';      // Flow impossible actuellement

/**
 * Type de perturbation du flow
 */
export type FlowDisruptor =
  | 'external_interruption'  // Interruption externe
  | 'internal_distraction'   // Distraction interne
  | 'fatigue'                // Fatigue mentale/physique
  | 'anxiety_spike'          // Pic d'anxiété
  | 'boredom_drift'          // Glissement vers l'ennui
  | 'complexity_overflow'    // Surcharge de complexité
  | 'motivation_loss'        // Perte de motivation
  | 'none';                  // Pas de perturbation

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Conditions nécessaires pour le flow
 */
export interface FlowConditions {
  // Conditions de base
  clearGoals: number;           // Clarté des objectifs (0-1)
  immediateFeedback: number;    // Feedback immédiat (0-1)
  challengeSkillBalance: number; // Équilibre défi/compétence (0-1)

  // Conditions environnementales
  distractionLevel: number;     // Niveau de distraction (0-1, bas = mieux)
  timeAvailable: number;        // Temps disponible perçu (0-1)
  energyLevel: number;          // Niveau d'énergie (0-1)

  // Conditions psychologiques
  senseOfControl: number;       // Sentiment de contrôle (0-1)
  intrinsicMotivation: number;  // Motivation intrinsèque (0-1)
  confidenceLevel: number;      // Confiance en ses capacités (0-1)

  // Score global
  overallReadiness: number;     // Préparation globale (0-1)
}

/**
 * Métriques du flow actif
 */
export interface FlowMetrics {
  // Intensité et profondeur
  flowIntensity: number;        // Intensité du flow (0-1)
  flowDepth: number;            // Profondeur du flow (0-1)
  immersionLevel: number;       // Niveau d'immersion (0-1)

  // Temporel
  timeInFlow: number;           // Temps dans le flow (ms)
  timeSinceLastPeak: number;    // Temps depuis le dernier pic (ms)
  estimatedTimeRemaining: number; // Temps de flow restant estimé (ms)

  // Qualité
  qualityScore: number;         // Score de qualité (0-1)
  stabilityScore: number;       // Stabilité du flow (0-1)
  productivityEstimate: number; // Estimation de productivité (0-1)

  // Tendances
  intensityTrend: 'rising' | 'stable' | 'falling';
  depthTrend: 'deepening' | 'stable' | 'surfacing';
}

/**
 * Indicateurs de dérive du flow
 */
export interface FlowDriftIndicators {
  // Type de dérive
  driftType: 'toward_anxiety' | 'toward_boredom' | 'toward_exit' | 'none';
  driftSpeed: 'slow' | 'moderate' | 'fast';
  driftProbability: number;     // Probabilité de dérive (0-1)

  // Causes détectées
  detectedDisruptors: FlowDisruptor[];
  primaryDisruptor: FlowDisruptor;

  // Recommandations
  suggestedActions: FlowSuggestion[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Suggestion pour maintenir/entrer dans le flow
 */
export interface FlowSuggestion {
  type: 'challenge_adjustment' | 'break' | 'environment' | 'goal_clarification' | 'energy_boost';
  description: string;
  priority: number;             // 0-1
  estimatedImpact: number;      // 0-1
}

/**
 * État de sortie du flow
 */
export interface FlowExitState {
  exitType: 'graceful' | 'interrupted' | 'exhausted' | 'distracted';
  totalFlowTime: number;        // Temps total en flow (ms)
  peakIntensity: number;        // Intensité maximale atteinte
  accomplishmentSense: number;  // Sentiment d'accomplissement (0-1)
  recoveryNeeded: 'minimal' | 'moderate' | 'significant';
  nextFlowEstimate: number;     // Temps avant prochain flow possible (ms)
}

/**
 * Entrée d'historique du flow
 */
export interface FlowHistoryEntry {
  timestamp: number;
  zone: FlowZone;
  phase: FlowPhase;
  intensity: number;
  depth: number;
  duration: number;
  conditions: Partial<FlowConditions>;
  exitState?: FlowExitState;
}

/**
 * Profil de flow de l'utilisateur
 */
export interface FlowProfile {
  // Caractéristiques personnelles
  averageFlowDuration: number;       // Durée moyenne de flow (ms)
  peakFlowTime: number;              // Moment préféré pour le flow
  flowProneness: number;             // Propension au flow (0-1)
  recoveryRate: number;              // Vitesse de récupération (0-1)

  // Préférences
  preferredChallengeLevel: number;   // Niveau de défi préféré (0-1)
  optimalComplexity: number;         // Complexité optimale (0-1)
  breakFrequency: number;            // Fréquence de pauses (ms)

  // Statistiques
  totalFlowSessions: number;
  totalFlowTime: number;             // Temps total en flow (ms)
  averageQuality: number;            // Qualité moyenne (0-1)
  longestFlowStreak: number;         // Plus longue session (ms)

  // Patterns
  commonDisruptors: FlowDisruptor[];
  successfulEntryConditions: Partial<FlowConditions>;
  bestPerformanceWindows: Array<{ start: number; end: number }>; // heures

  // Historique
  history: FlowHistoryEntry[];

  // Métadonnées
  lastFlowSession: number;           // Timestamp dernière session
  lastUpdate: number;
}

/**
 * État complet du moteur de flow
 */
export interface FlowState {
  // État actif
  isActive: boolean;
  currentZone: FlowZone;
  currentPhase: FlowPhase;
  currentTransition: FlowTransition;

  // Métriques en temps réel
  conditions: FlowConditions;
  metrics: FlowMetrics;
  driftIndicators: FlowDriftIndicators;

  // Profil
  profile: FlowProfile;

  // Timestamps
  flowStartTime: number | null;
  lastUpdate: number;

  // Erreurs
  error: string | null;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration du moteur de flow
 */
export interface FlowEngineConfig {
  // Seuils de détection
  flowEntryThreshold: number;        // Seuil pour entrer en flow (0-1)
  flowExitThreshold: number;         // Seuil pour sortir du flow (0-1)
  driftDetectionSensitivity: number; // Sensibilité détection dérive (0-1)

  // Temporel
  minFlowDuration: number;           // Durée min pour compter (ms)
  maxFlowDuration: number;           // Durée max recommandée (ms)
  recoveryPeriod: number;            // Période de récupération (ms)
  updateIntervalMs: number;          // Intervalle mise à jour (ms)

  // Limites
  maxHistoryEntries: number;
  challengeAdjustmentRate: number;   // Vitesse ajustement défi (0-1)

  // Notifications
  notifyOnFlowEntry: boolean;
  notifyOnFlowExit: boolean;
  notifyOnDrift: boolean;
}

// ============================================================================
// RÉSULTATS
// ============================================================================

/**
 * Résultat de l'évaluation de préparation au focus
 */
export interface FocusReadinessResult {
  readiness: FocusReadiness;
  score: number;                     // Score global (0-1)
  conditions: FlowConditions;
  blockers: string[];                // Facteurs bloquants
  recommendations: FlowSuggestion[];
  estimatedTimeToReady: number;      // Temps pour être prêt (ms)
}

/**
 * Résultat de l'entrée en flow
 */
export interface FlowEntryResult {
  success: boolean;
  zone: FlowZone;
  phase: FlowPhase;
  initialIntensity: number;
  reason: string;
  suggestions?: FlowSuggestion[];
}

/**
 * Résultat du maintien du flow
 */
export interface FlowMaintenanceResult {
  maintained: boolean;
  metrics: FlowMetrics;
  drift: FlowDriftIndicators;
  adjustments: FlowSuggestion[];
}

/**
 * Résultat de la sortie du flow
 */
export interface FlowExitResult {
  exitState: FlowExitState;
  summary: string;
  nextSteps: FlowSuggestion[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const FLOW_CONSTANTS = {
  // Zones (challenge, skill thresholds)
  ZONE_THRESHOLDS: {
    flow: { challengeMin: 0.5, challengeMax: 0.8, skillMin: 0.5, skillMax: 0.8 },
    anxiety: { challengeMin: 0.7, skillMax: 0.5 },
    boredom: { challengeMax: 0.4, skillMin: 0.6 },
    apathy: { challengeMax: 0.3, skillMax: 0.3 },
  },

  // Phases (durées typiques en ms)
  PHASE_DURATIONS: {
    preparation: 5 * 60 * 1000,    // 5 minutes
    struggle: 15 * 60 * 1000,      // 15 minutes
    release: 5 * 60 * 1000,        // 5 minutes
    flow: 45 * 60 * 1000,          // 45 minutes typique
    recovery: 15 * 60 * 1000,      // 15 minutes
  },

  // Seuils de conditions
  CONDITION_THRESHOLDS: {
    excellent: 0.8,
    good: 0.6,
    moderate: 0.4,
    poor: 0.2,
  },

  // Labels
  ZONE_LABELS: {
    anxiety: 'Anxiété (défi trop élevé)',
    flow: 'Flow (équilibre parfait)',
    boredom: 'Ennui (défi trop faible)',
    apathy: 'Apathie (faible engagement)',
    control: 'Contrôle (maîtrise élevée)',
    relaxation: 'Relaxation',
    arousal: 'Éveil (proche du flow)',
    worry: 'Inquiétude',
  } as Record<FlowZone, string>,

  PHASE_LABELS: {
    preparation: 'Préparation',
    struggle: 'Phase de lutte',
    release: 'Lâcher-prise',
    flow: 'Flow actif',
    recovery: 'Récupération',
    idle: 'Inactif',
  } as Record<FlowPhase, string>,

  READINESS_LABELS: {
    optimal: 'Conditions optimales',
    good: 'Bonnes conditions',
    moderate: 'Conditions moyennes',
    poor: 'Conditions défavorables',
    blocked: 'Flow impossible actuellement',
  } as Record<FocusReadiness, string>,

  DISRUPTOR_LABELS: {
    external_interruption: 'Interruption externe',
    internal_distraction: 'Distraction interne',
    fatigue: 'Fatigue',
    anxiety_spike: 'Pic d\'anxiété',
    boredom_drift: 'Ennui',
    complexity_overflow: 'Surcharge de complexité',
    motivation_loss: 'Perte de motivation',
    none: 'Aucune perturbation',
  } as Record<FlowDisruptor, string>,
};

// ============================================================================
// FONCTIONS UTILITAIRES - DEFAULTS
// ============================================================================

export function getDefaultFlowConditions(): FlowConditions {
  return {
    clearGoals: 0.5,
    immediateFeedback: 0.5,
    challengeSkillBalance: 0.5,
    distractionLevel: 0.3,
    timeAvailable: 0.5,
    energyLevel: 0.5,
    senseOfControl: 0.5,
    intrinsicMotivation: 0.5,
    confidenceLevel: 0.5,
    overallReadiness: 0.5,
  };
}

export function getDefaultFlowMetrics(): FlowMetrics {
  return {
    flowIntensity: 0,
    flowDepth: 0,
    immersionLevel: 0,
    timeInFlow: 0,
    timeSinceLastPeak: 0,
    estimatedTimeRemaining: 0,
    qualityScore: 0,
    stabilityScore: 0,
    productivityEstimate: 0,
    intensityTrend: 'stable',
    depthTrend: 'stable',
  };
}

export function getDefaultFlowDriftIndicators(): FlowDriftIndicators {
  return {
    driftType: 'none',
    driftSpeed: 'slow',
    driftProbability: 0,
    detectedDisruptors: [],
    primaryDisruptor: 'none',
    suggestedActions: [],
    urgencyLevel: 'low',
  };
}

export function getDefaultFlowProfile(): FlowProfile {
  return {
    averageFlowDuration: 30 * 60 * 1000, // 30 minutes
    peakFlowTime: 10,                     // 10h
    flowProneness: 0.5,
    recoveryRate: 0.5,
    preferredChallengeLevel: 0.6,
    optimalComplexity: 0.5,
    breakFrequency: 25 * 60 * 1000,      // 25 minutes (Pomodoro)
    totalFlowSessions: 0,
    totalFlowTime: 0,
    averageQuality: 0.5,
    longestFlowStreak: 0,
    commonDisruptors: [],
    successfulEntryConditions: {},
    bestPerformanceWindows: [{ start: 9, end: 12 }, { start: 14, end: 17 }],
    history: [],
    lastFlowSession: 0,
    lastUpdate: Date.now(),
  };
}

export function getDefaultFlowState(): FlowState {
  return {
    isActive: false,
    currentZone: 'apathy',
    currentPhase: 'idle',
    currentTransition: 'none',
    conditions: getDefaultFlowConditions(),
    metrics: getDefaultFlowMetrics(),
    driftIndicators: getDefaultFlowDriftIndicators(),
    profile: getDefaultFlowProfile(),
    flowStartTime: null,
    lastUpdate: Date.now(),
    error: null,
  };
}

export function getDefaultFlowEngineConfig(): FlowEngineConfig {
  return {
    flowEntryThreshold: 0.6,
    flowExitThreshold: 0.4,
    driftDetectionSensitivity: 0.7,
    minFlowDuration: 5 * 60 * 1000,      // 5 minutes
    maxFlowDuration: 90 * 60 * 1000,     // 90 minutes
    recoveryPeriod: 15 * 60 * 1000,      // 15 minutes
    updateIntervalMs: 5000,              // 5 secondes
    maxHistoryEntries: 100,
    challengeAdjustmentRate: 0.1,
    notifyOnFlowEntry: true,
    notifyOnFlowExit: true,
    notifyOnDrift: true,
  };
}
