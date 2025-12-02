/**
 * TITANE∞ vΩ∞ — SELF-REFLECTION TYPES
 * OPUS v∞.10: Self-Reflection Engine Types
 *
 * Définitions de types pour le moteur de méta-analyse interne :
 * - SelfReflectionProfile : profil de méta-cognition
 * - MetaScores : scores d'évaluation de qualité
 * - InternalAdjustment : ajustements internes automatiques
 *
 * Ce n'est pas une conscience.
 * C'est un système analytique technique pour :
 * - observer les sorties du système
 * - évaluer leur cohérence
 * - auto-corriger les dérives
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

/**
 * Type d'incohérence détectée
 */
export type IncoherenceType =
  | 'style_mismatch'       // Style non aligné avec l'état
  | 'density_excessive'    // Réponse trop dense
  | 'density_insufficient' // Réponse trop vide
  | 'tone_rupture'         // Rupture de ton
  | 'rhythm_break'         // Rupture de rythme
  | 'flow_disruption'      // Perturbation du flow
  | 'cognitive_overload'   // Surcharge cognitive
  | 'alignment_drift'      // Dérive d'alignement
  | 'context_disconnect'   // Déconnexion du contexte
  | 'clarity_issue';       // Problème de clarté

/**
 * Type d'ajustement interne
 */
export type AdjustmentType =
  | 'simplify'             // Simplifier la réponse
  | 'expand'               // Enrichir la réponse
  | 'slow_down'            // Ralentir le rythme
  | 'speed_up'             // Accélérer le rythme
  | 'stabilize'            // Stabiliser le ton
  | 'realign'              // Réaligner avec l'état
  | 'clarify'              // Clarifier le message
  | 'protect_flow'         // Protéger l'état de flow
  | 'reduce_density'       // Réduire la densité
  | 'increase_warmth'      // Augmenter la chaleur
  | 'decrease_formality';  // Réduire la formalité

/**
 * Niveau de sévérité d'une incohérence
 */
export type SeverityLevel =
  | 'low'                  // Impact minimal
  | 'moderate'             // Impact modéré
  | 'high'                 // Impact important
  | 'critical';            // Nécessite correction immédiate

/**
 * Statut de l'évaluation
 */
export type EvaluationStatus =
  | 'optimal'              // Réponse parfaitement alignée
  | 'acceptable'           // Petits ajustements possibles
  | 'suboptimal'           // Ajustements recommandés
  | 'problematic';         // Correction nécessaire

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Scores méta-analytiques
 */
export interface MetaScores {
  // Cohérence globale de la réponse (0-1)
  coherenceScore: number;

  // Alignement avec l'état utilisateur (0-1)
  alignmentScore: number;

  // Clarté du message (0-1)
  clarityScore: number;

  // Charge cognitive estimée (0-1, plus bas = mieux)
  densityScore: number;

  // Correspondance avec le style de présence (0-1)
  presenceMatchScore: number;

  // Correspondance avec la résonance conversationnelle (0-1)
  resonanceMatchScore: number;

  // Risque d'impact sur le flow (0-1, plus bas = mieux)
  flowImpactRisk: number;

  // Stabilité du ton (0-1)
  toneStabilityScore: number;

  // Continuité narrative (0-1)
  narrativeContinuityScore: number;

  // Score global composite (0-1)
  overallScore: number;

  // Confiance dans l'évaluation (0-1)
  evaluationConfidence: number;
}

/**
 * Incohérence détectée
 */
export interface DetectedIncoherence {
  // Type d'incohérence
  type: IncoherenceType;

  // Sévérité
  severity: SeverityLevel;

  // Description
  description: string;

  // Source de l'incohérence (quel moteur ou signal)
  source: string;

  // Score d'impact (0-1)
  impactScore: number;

  // Suggestion de correction
  suggestedCorrection: AdjustmentType;

  // Timestamp
  detectedAt: number;
}

/**
 * Ajustement interne à appliquer
 */
export interface InternalAdjustment {
  // Type d'ajustement
  type: AdjustmentType;

  // Priorité (1-10, 10 = plus urgent)
  priority: number;

  // Force de l'ajustement (0-1)
  strength: number;

  // Raison de l'ajustement
  reason: string;

  // Source de la décision
  triggeredBy: IncoherenceType | 'proactive';

  // Paramètres spécifiques
  parameters: {
    // Modification de la densité (-1 à 1)
    densityModifier?: number;

    // Modification de la longueur (-1 à 1)
    lengthModifier?: number;

    // Modification du rythme (-1 à 1)
    rhythmModifier?: number;

    // Modification de la chaleur (-1 à 1)
    warmthModifier?: number;

    // Modification de la formalité (-1 à 1)
    formalityModifier?: number;

    // Complexité cible
    targetComplexity?: 'simple' | 'standard' | 'elevated';
  };

  // Timestamp de création
  createdAt: number;

  // Appliqué ou non
  applied: boolean;
}

/**
 * Évaluation d'une réponse
 */
export interface ResponseEvaluation {
  // ID de la réponse évaluée
  responseId: string;

  // Timestamp de l'évaluation
  evaluatedAt: number;

  // Scores méta
  scores: MetaScores;

  // Statut global
  status: EvaluationStatus;

  // Incohérences détectées
  incoherences: DetectedIncoherence[];

  // Ajustements recommandés
  recommendedAdjustments: InternalAdjustment[];

  // Contexte de l'évaluation
  context: {
    // État multimodal au moment de la réponse
    multimodalTension: number;
    multimodalEnergy: number;

    // État de flow
    flowActive: boolean;
    flowIntensity: number;

    // Style de présence actif
    presenceStyle: string;

    // Mode de résonance actif
    resonanceMode: string;
  };

  // Longueur de la réponse originale
  originalResponseLength: number;

  // Résumé textuel de l'évaluation
  summary: string;
}

/**
 * Entrée d'historique de réflexion
 */
export interface ReflectionHistoryEntry {
  // ID unique
  id: string;

  // Timestamp
  timestamp: number;

  // Évaluation
  evaluation: ResponseEvaluation;

  // Ajustements appliqués
  appliedAdjustments: InternalAdjustment[];

  // Efficacité des ajustements (mesuré après)
  adjustmentEffectiveness?: number;

  // Feedback implicite détecté
  implicitFeedback?: 'positive' | 'neutral' | 'negative';
}

/**
 * Profil de self-réflexion
 */
export interface SelfReflectionProfile {
  // Scores moyens sur les dernières interactions
  averageScores: MetaScores;

  // Tendances d'incohérence
  incoherenceTrends: {
    type: IncoherenceType;
    frequency: number;         // Fréquence relative (0-1)
    averageSeverity: number;   // Sévérité moyenne (0-1)
  }[];

  // Ajustements fréquents
  frequentAdjustments: {
    type: AdjustmentType;
    frequency: number;
    averageEffectiveness: number;
  }[];

  // Patterns de dérive identifiés
  driftPatterns: {
    pattern: string;
    triggerConditions: string[];
    suggestedPrevention: AdjustmentType[];
  }[];

  // Score de stabilité globale (0-1)
  globalStabilityScore: number;

  // Score d'amélioration continue (0-1)
  improvementScore: number;

  // Dernière mise à jour
  lastUpdate: number;

  // Nombre d'évaluations totales
  totalEvaluations: number;
}

/**
 * État complet du Self-Reflection Engine
 */
export interface SelfReflectionState {
  // État actif
  isActive: boolean;

  // Dernière évaluation
  lastEvaluation: ResponseEvaluation | null;

  // Ajustements actifs (à appliquer à la prochaine réponse)
  activeAdjustments: InternalAdjustment[];

  // Profil de réflexion
  profile: SelfReflectionProfile;

  // Historique récent
  history: ReflectionHistoryEntry[];

  // Mode de réflexion
  mode: 'passive' | 'active' | 'intensive';

  // Métriques en temps réel
  realtimeMetrics: {
    consecutiveOptimalResponses: number;
    recentAdjustmentCount: number;
    currentDriftRisk: number;
  };

  // Méta-données
  lastUpdate: number;
  error: string | null;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration du Self-Reflection Engine
 */
export interface SelfReflectionEngineConfig {
  // Seuils d'évaluation
  thresholds: {
    // Score minimum pour "optimal"
    optimalThreshold: number;        // default: 0.85

    // Score minimum pour "acceptable"
    acceptableThreshold: number;     // default: 0.7

    // Score en dessous = "problematic"
    problematicThreshold: number;    // default: 0.5

    // Risque de flow maximum acceptable
    maxFlowImpactRisk: number;       // default: 0.3
  };

  // Sensibilité
  sensitivity: {
    // Sensibilité à la densité (0-1)
    densitySensitivity: number;

    // Sensibilité au ton (0-1)
    toneSensitivity: number;

    // Sensibilité au rythme (0-1)
    rhythmSensitivity: number;
  };

  // Ajustements
  adjustments: {
    // Force maximum des ajustements (0-1)
    maxAdjustmentStrength: number;

    // Délai minimum entre ajustements (ms)
    minAdjustmentInterval: number;

    // Nombre max d'ajustements simultanés
    maxSimultaneousAdjustments: number;
  };

  // Historique
  maxHistoryEntries: number;

  // Mode par défaut
  defaultMode: 'passive' | 'active' | 'intensive';

  // Intervalle d'évaluation (ms)
  evaluationIntervalMs: number;
}

// ============================================================================
// INPUTS/OUTPUTS
// ============================================================================

/**
 * Input pour l'évaluation d'une réponse
 */
export interface EvaluationInput {
  // La réponse à évaluer
  response: string;

  // ID unique de la réponse
  responseId?: string;

  // Contexte multimodal
  multimodalState?: {
    tension: number;
    energy: number;
    engagement: number;
    stability: number;
  };

  // Contexte de présence
  presenceState?: {
    style: string;
    alignmentScore: number;
  };

  // Contexte de résonance
  resonanceState?: {
    mode: string;
    resonanceScore: number;
  };

  // Contexte de flow
  flowState?: {
    isActive: boolean;
    intensity: number;
    zone: string;
  };

  // Message utilisateur précédent
  userMessage?: string;
}

/**
 * Output de l'évaluation
 */
export interface EvaluationOutput {
  // L'évaluation complète
  evaluation: ResponseEvaluation;

  // Ajustements à appliquer immédiatement
  immediateAdjustments: InternalAdjustment[];

  // Ajustements à considérer pour les prochaines réponses
  deferredAdjustments: InternalAdjustment[];

  // Résumé exécutif
  executiveSummary: string;

  // Recommandation d'action
  actionRecommendation: 'proceed' | 'adjust' | 'regenerate';
}

// ============================================================================
// HELPERS ET DEFAULTS
// ============================================================================

/**
 * Scores méta par défaut
 */
export function getDefaultMetaScores(): MetaScores {
  return {
    coherenceScore: 1.0,
    alignmentScore: 1.0,
    clarityScore: 1.0,
    densityScore: 0.5,
    presenceMatchScore: 1.0,
    resonanceMatchScore: 1.0,
    flowImpactRisk: 0.0,
    toneStabilityScore: 1.0,
    narrativeContinuityScore: 1.0,
    overallScore: 1.0,
    evaluationConfidence: 0.5,
  };
}

/**
 * Profil de self-réflexion par défaut
 */
export function getDefaultSelfReflectionProfile(): SelfReflectionProfile {
  return {
    averageScores: getDefaultMetaScores(),
    incoherenceTrends: [],
    frequentAdjustments: [],
    driftPatterns: [],
    globalStabilityScore: 1.0,
    improvementScore: 0.5,
    lastUpdate: Date.now(),
    totalEvaluations: 0,
  };
}

/**
 * État de self-réflexion par défaut
 */
export function getDefaultSelfReflectionState(): SelfReflectionState {
  return {
    isActive: true,
    lastEvaluation: null,
    activeAdjustments: [],
    profile: getDefaultSelfReflectionProfile(),
    history: [],
    mode: 'active',
    realtimeMetrics: {
      consecutiveOptimalResponses: 0,
      recentAdjustmentCount: 0,
      currentDriftRisk: 0,
    },
    lastUpdate: Date.now(),
    error: null,
  };
}

/**
 * Configuration par défaut
 */
export function getDefaultSelfReflectionEngineConfig(): SelfReflectionEngineConfig {
  return {
    thresholds: {
      optimalThreshold: 0.85,
      acceptableThreshold: 0.7,
      problematicThreshold: 0.5,
      maxFlowImpactRisk: 0.3,
    },
    sensitivity: {
      densitySensitivity: 0.7,
      toneSensitivity: 0.6,
      rhythmSensitivity: 0.5,
    },
    adjustments: {
      maxAdjustmentStrength: 0.8,
      minAdjustmentInterval: 1000,
      maxSimultaneousAdjustments: 3,
    },
    maxHistoryEntries: 50,
    defaultMode: 'active',
    evaluationIntervalMs: 100,
  };
}

/**
 * Constantes du Self-Reflection Engine
 */
export const SELF_REFLECTION_CONSTANTS = {
  // Poids pour le calcul du score global
  SCORE_WEIGHTS: {
    coherence: 0.15,
    alignment: 0.15,
    clarity: 0.15,
    density: 0.10,
    presenceMatch: 0.10,
    resonanceMatch: 0.10,
    flowImpact: 0.10,
    toneStability: 0.10,
    narrativeContinuity: 0.05,
  },

  // Seuils de sévérité
  SEVERITY_THRESHOLDS: {
    low: 0.2,
    moderate: 0.4,
    high: 0.6,
    critical: 0.8,
  },

  // Limites
  MAX_INCOHERENCES_PER_EVALUATION: 5,
  MAX_ADJUSTMENTS_PER_EVALUATION: 3,
  MIN_CONFIDENCE_FOR_ADJUSTMENT: 0.6,

  // Decay pour les tendances
  TREND_DECAY_FACTOR: 0.95,
  HISTORY_WEIGHT_DECAY: 0.9,
} as const;
