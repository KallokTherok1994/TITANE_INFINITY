/**
 * TITANE∞ vΩ∞ — KNOWLEDGE INTEGRATION TYPES
 * OPUS v∞.11: Knowledge Integration Engine Types
 *
 * Définitions de types pour le moteur d'intégration des connaissances :
 * - KnowledgeProfile : profil de connaissances unifiées
 * - ConflictMatrix : matrice de conflits inter-modules
 * - PatternMap : carte des patterns observés
 * - ContextGraph : graphe contextuel
 *
 * Ce moteur est le chef d'orchestre cognitif de TITANE∞.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

/**
 * Source d'une connaissance
 */
export type KnowledgeSource =
  | 'multimodal'         // MultimodalFusionEngine
  | 'predictive'         // PredictiveEngine
  | 'rhythm'             // RhythmEngine
  | 'presence'           // PresenceEngine
  | 'resonance'          // ResonanceEngine
  | 'flow'               // FlowEngine
  | 'stress'             // StressRegulationEngine
  | 'reflection'         // SelfReflectionEngine
  | 'context'            // ChatContextEngine
  | 'user_input'         // Input utilisateur direct
  | 'inference';         // Inférence système

/**
 * Type de connaissance
 */
export type KnowledgeType =
  | 'behavioral'         // Comportement utilisateur
  | 'rhythmic'           // Patterns rythmiques
  | 'emotional'          // États émotionnels (détectés, non imités)
  | 'contextual'         // Contexte conversationnel
  | 'preferential'       // Préférences
  | 'systemic'           // État du système
  | 'relational';        // Relations entre éléments

/**
 * Niveau de confiance
 */
export type ConfidenceLevel =
  | 'very_low'           // < 0.2
  | 'low'                // 0.2 - 0.4
  | 'medium'             // 0.4 - 0.6
  | 'high'               // 0.6 - 0.8
  | 'very_high';         // > 0.8

/**
 * Type de conflit
 */
export type ConflictType =
  | 'contradiction'      // Données contradictoires
  | 'inconsistency'      // Incohérence logique
  | 'redundancy'         // Données redondantes
  | 'obsolescence'       // Données obsolètes
  | 'priority_clash';    // Conflit de priorité

/**
 * Stratégie de résolution
 */
export type ResolutionStrategy =
  | 'newer_wins'         // La donnée la plus récente gagne
  | 'higher_confidence'  // La confiance la plus élevée gagne
  | 'weighted_merge'     // Fusion pondérée
  | 'source_priority'    // Priorité par source
  | 'manual_review';     // Révision manuelle requise

// ============================================================================
// INTERFACES - ÉLÉMENTS DE CONNAISSANCE
// ============================================================================

/**
 * Élément de connaissance individuel
 */
export interface KnowledgeItem {
  // Identifiant unique
  id: string;

  // Type de connaissance
  type: KnowledgeType;

  // Source de la connaissance
  source: KnowledgeSource;

  // Clé (nom du pattern ou de l'information)
  key: string;

  // Valeur (données structurées)
  value: unknown;

  // Confiance (0-1)
  confidence: number;

  // Poids (importance relative, 0-1)
  weight: number;

  // Timestamps
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;

  // Relations avec d'autres éléments
  relatedItems: string[];

  // Tags pour recherche
  tags: string[];
}

/**
 * Pattern observé
 */
export interface ObservedPattern {
  // Identifiant
  id: string;

  // Clé du pattern
  key: string;

  // Valeur/description
  value: string;

  // Confiance (0-1)
  confidence: number;

  // Fréquence d'observation (0-1)
  frequency: number;

  // Sources ayant confirmé ce pattern
  confirmedBy: KnowledgeSource[];

  // Conditions de déclenchement
  triggerConditions: string[];

  // Dernière observation
  lastObserved: number;

  // Nombre d'observations
  observationCount: number;
}

/**
 * Entrée dans la matrice de conflits
 */
export interface ConflictEntry {
  // Identifiant unique
  id: string;

  // Type de conflit
  type: ConflictType;

  // Module A impliqué
  moduleA: KnowledgeSource;

  // Module B impliqué
  moduleB: KnowledgeSource;

  // Description du conflit
  description: string;

  // Sévérité (0-1)
  severity: number;

  // Données en conflit
  conflictingData: {
    fromA: unknown;
    fromB: unknown;
  };

  // Résolu ou non
  resolved: boolean;

  // Stratégie de résolution utilisée
  resolutionStrategy?: ResolutionStrategy;

  // Résultat de la résolution
  resolutionResult?: unknown;

  // Timestamps
  detectedAt: number;
  resolvedAt?: number;
}

/**
 * Nœud du graphe contextuel
 */
export interface ContextNode {
  // Identifiant
  id: string;

  // Type de nœud
  type: 'topic' | 'entity' | 'concept' | 'action' | 'state';

  // Label
  label: string;

  // Données associées
  data: Record<string, unknown>;

  // Importance (0-1)
  importance: number;

  // Timestamp de création
  createdAt: number;

  // Dernière activation
  lastActivated: number;
}

/**
 * Arête du graphe contextuel
 */
export interface ContextEdge {
  // Identifiant
  id: string;

  // Nœud source
  from: string;

  // Nœud cible
  to: string;

  // Type de relation
  relation: 'relates_to' | 'causes' | 'follows' | 'contains' | 'contradicts' | 'supports';

  // Force de la relation (0-1)
  strength: number;

  // Bidirectionnel ?
  bidirectional: boolean;

  // Timestamp
  createdAt: number;
}

/**
 * Graphe contextuel
 */
export interface ContextGraph {
  // Nœuds
  nodes: ContextNode[];

  // Arêtes
  edges: ContextEdge[];

  // Centre actuel (nœud le plus important)
  currentCenter: string | null;

  // Dernière mise à jour
  lastUpdate: number;
}

// ============================================================================
// INTERFACES - ÉTAT INTÉGRÉ
// ============================================================================

/**
 * Snapshot de l'état intégré du système
 */
export interface IntegratedState {
  // État multimodal résumé
  multimodal: {
    energy: number;
    tension: number;
    engagement: number;
    stability: number;
  };

  // État prédictif résumé
  predictive: {
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
    nextPrediction: string;
  };

  // État rythmique résumé
  rhythm: {
    currentPhase: string;
    energyLevel: number;
    optimalWindow: boolean;
  };

  // État de présence résumé
  presence: {
    style: string;
    alignmentScore: number;
    stability: number;
  };

  // État de résonance résumé
  resonance: {
    mode: string;
    resonanceScore: number;
    adaptationActive: boolean;
  };

  // État de flow résumé
  flow: {
    isActive: boolean;
    zone: string;
    intensity: number;
  };

  // État de stress résumé
  stress: {
    level: number;
    trend: 'rising' | 'stable' | 'falling';
    interventionNeeded: boolean;
  };

  // Cohérence globale
  globalCoherence: number;

  // Timestamp
  timestamp: number;
}

/**
 * Événement d'intégration
 */
export interface IntegrationEvent {
  // Identifiant
  id: string;

  // Type d'événement
  type: 'integration' | 'conflict_detected' | 'conflict_resolved' | 'pattern_learned' | 'update';

  // Source
  source: KnowledgeSource;

  // Description
  description: string;

  // Données associées
  data: Record<string, unknown>;

  // Impact sur la cohérence (-1 à 1)
  coherenceImpact: number;

  // Timestamp
  timestamp: number;
}

// ============================================================================
// INTERFACES - PROFIL ET ÉTAT
// ============================================================================

/**
 * Profil de connaissances
 */
export interface KnowledgeProfile {
  // État intégré actuel
  integratedState: IntegratedState;

  // Matrice de conflits actifs
  conflictMatrix: ConflictEntry[];

  // Vérification de redondance
  redundancyCheck: {
    item: string;
    duplicates: string[];
  }[];

  // Carte des patterns
  patternMap: ObservedPattern[];

  // Graphe contextuel
  contextGraph: ContextGraph;

  // Historique d'apprentissage
  learningHistory: {
    pattern: string;
    learnedAt: number;
    confidence: number;
  }[];

  // Événements d'intégration récents
  integrationEvents: IntegrationEvent[];

  // Score de cohérence global (0-1)
  coherenceScore: number;

  // Score de stabilité (0-1)
  stabilityScore: number;

  // Méta-données
  lastUpdate: number;
  totalIntegrations: number;
  totalConflictsResolved: number;
}

/**
 * État du Knowledge Integration Engine
 */
export interface KnowledgeIntegrationState {
  // État actif
  isActive: boolean;

  // Profil de connaissances
  profile: KnowledgeProfile;

  // Mode d'intégration
  mode: 'passive' | 'active' | 'learning';

  // File d'attente d'intégration
  integrationQueue: {
    source: KnowledgeSource;
    data: unknown;
    priority: number;
    addedAt: number;
  }[];

  // Conflits en attente de résolution
  pendingConflicts: ConflictEntry[];

  // Métriques temps réel
  realtimeMetrics: {
    integrationsPerMinute: number;
    conflictRate: number;
    averageCoherence: number;
  };

  // Dernière mise à jour
  lastUpdate: number;

  // Erreur
  error: string | null;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration du Knowledge Integration Engine
 */
export interface KnowledgeIntegrationEngineConfig {
  // Seuils
  thresholds: {
    // Seuil de cohérence minimum
    minCoherenceScore: number;        // default: 0.7

    // Seuil de confiance pour intégration
    minConfidenceForIntegration: number;  // default: 0.5

    // Seuil de sévérité pour conflit urgent
    urgentConflictSeverity: number;   // default: 0.7
  };

  // Résolution de conflits
  conflictResolution: {
    // Stratégie par défaut
    defaultStrategy: ResolutionStrategy;

    // Priorité des sources (ordre décroissant)
    sourcePriority: KnowledgeSource[];

    // Délai avant résolution automatique (ms)
    autoResolveDelay: number;
  };

  // Apprentissage
  learning: {
    // Apprentissage activé
    enabled: boolean;

    // Taux d'apprentissage (0-1)
    learningRate: number;

    // Seuil de fréquence pour créer un pattern
    patternFrequencyThreshold: number;
  };

  // Graphe contextuel
  contextGraph: {
    // Nombre max de nœuds
    maxNodes: number;

    // Nombre max d'arêtes
    maxEdges: number;

    // Decay des nœuds inactifs
    inactivityDecay: number;
  };

  // Historique
  maxHistoryEntries: number;
  maxIntegrationEvents: number;

  // Intervalle de mise à jour (ms)
  updateIntervalMs: number;
}

// ============================================================================
// INPUTS/OUTPUTS
// ============================================================================

/**
 * Input pour l'intégration de connaissances
 */
export interface IntegrationInput {
  // Source de la connaissance
  source: KnowledgeSource;

  // États à intégrer (selon disponibilité)
  multimodalState?: {
    energy: number;
    tension: number;
    engagement: number;
    stability: number;
  };

  predictiveState?: {
    trend: string;
    confidence: number;
    predictions: unknown[];
  };

  rhythmState?: {
    currentPhase: string;
    energyLevel: number;
    isOptimalWindow: boolean;
  };

  presenceState?: {
    style: string;
    alignmentScore: number;
  };

  resonanceState?: {
    mode: string;
    resonanceScore: number;
  };

  flowState?: {
    isActive: boolean;
    zone: string;
    intensity: number;
  };

  stressState?: {
    level: number;
    trend: string;
  };

  contextState?: {
    currentTopic: string;
    conversationDepth: number;
  };

  // Données additionnelles
  additionalData?: Record<string, unknown>;
}

/**
 * Output de l'intégration
 */
export interface IntegrationOutput {
  // Succès de l'intégration
  success: boolean;

  // État intégré résultant
  integratedState: IntegratedState;

  // Nouveaux conflits détectés
  newConflicts: ConflictEntry[];

  // Conflits résolus
  resolvedConflicts: ConflictEntry[];

  // Nouveaux patterns détectés
  newPatterns: ObservedPattern[];

  // Score de cohérence après intégration
  coherenceScore: number;

  // Score de stabilité après intégration
  stabilityScore: number;

  // Recommandations
  recommendations: string[];

  // Événement d'intégration
  event: IntegrationEvent;
}

// ============================================================================
// HELPERS ET DEFAULTS
// ============================================================================

/**
 * État intégré par défaut
 */
export function getDefaultIntegratedState(): IntegratedState {
  return {
    multimodal: {
      energy: 0.5,
      tension: 0.3,
      engagement: 0.5,
      stability: 0.7,
    },
    predictive: {
      trend: 'stable',
      confidence: 0.5,
      nextPrediction: '',
    },
    rhythm: {
      currentPhase: 'neutral',
      energyLevel: 0.5,
      optimalWindow: false,
    },
    presence: {
      style: 'neutral',
      alignmentScore: 0.7,
      stability: 0.8,
    },
    resonance: {
      mode: 'neutral',
      resonanceScore: 0.7,
      adaptationActive: false,
    },
    flow: {
      isActive: false,
      zone: 'not-ready',
      intensity: 0,
    },
    stress: {
      level: 0.3,
      trend: 'stable',
      interventionNeeded: false,
    },
    globalCoherence: 0.8,
    timestamp: Date.now(),
  };
}

/**
 * Graphe contextuel par défaut
 */
export function getDefaultContextGraph(): ContextGraph {
  return {
    nodes: [],
    edges: [],
    currentCenter: null,
    lastUpdate: Date.now(),
  };
}

/**
 * Profil de connaissances par défaut
 */
export function getDefaultKnowledgeProfile(): KnowledgeProfile {
  return {
    integratedState: getDefaultIntegratedState(),
    conflictMatrix: [],
    redundancyCheck: [],
    patternMap: [],
    contextGraph: getDefaultContextGraph(),
    learningHistory: [],
    integrationEvents: [],
    coherenceScore: 0.8,
    stabilityScore: 0.8,
    lastUpdate: Date.now(),
    totalIntegrations: 0,
    totalConflictsResolved: 0,
  };
}

/**
 * État du Knowledge Integration Engine par défaut
 */
export function getDefaultKnowledgeIntegrationState(): KnowledgeIntegrationState {
  return {
    isActive: true,
    profile: getDefaultKnowledgeProfile(),
    mode: 'active',
    integrationQueue: [],
    pendingConflicts: [],
    realtimeMetrics: {
      integrationsPerMinute: 0,
      conflictRate: 0,
      averageCoherence: 0.8,
    },
    lastUpdate: Date.now(),
    error: null,
  };
}

/**
 * Configuration par défaut
 */
export function getDefaultKnowledgeIntegrationEngineConfig(): KnowledgeIntegrationEngineConfig {
  return {
    thresholds: {
      minCoherenceScore: 0.7,
      minConfidenceForIntegration: 0.5,
      urgentConflictSeverity: 0.7,
    },
    conflictResolution: {
      defaultStrategy: 'weighted_merge',
      sourcePriority: [
        'multimodal',
        'presence',
        'resonance',
        'flow',
        'stress',
        'rhythm',
        'predictive',
        'reflection',
        'context',
        'user_input',
        'inference',
      ],
      autoResolveDelay: 5000,
    },
    learning: {
      enabled: true,
      learningRate: 0.1,
      patternFrequencyThreshold: 0.3,
    },
    contextGraph: {
      maxNodes: 100,
      maxEdges: 300,
      inactivityDecay: 0.95,
    },
    maxHistoryEntries: 100,
    maxIntegrationEvents: 50,
    updateIntervalMs: 500,
  };
}

/**
 * Constantes du Knowledge Integration Engine
 */
export const KNOWLEDGE_INTEGRATION_CONSTANTS = {
  // Poids des sources pour la fusion
  SOURCE_WEIGHTS: {
    multimodal: 1.0,
    presence: 0.9,
    resonance: 0.85,
    flow: 0.85,
    stress: 0.8,
    rhythm: 0.75,
    predictive: 0.7,
    reflection: 0.7,
    context: 0.6,
    user_input: 0.5,
    inference: 0.4,
  } as Record<KnowledgeSource, number>,

  // Decay pour les patterns
  PATTERN_DECAY: 0.98,

  // Seuil de similarité pour détection de redondance
  REDUNDANCY_SIMILARITY_THRESHOLD: 0.85,

  // Durée de vie par défaut d'un élément (ms)
  DEFAULT_ITEM_TTL: 3600000, // 1 heure

  // Nombre max de patterns
  MAX_PATTERNS: 200,

  // Nombre max de conflits en mémoire
  MAX_CONFLICTS: 50,
} as const;
