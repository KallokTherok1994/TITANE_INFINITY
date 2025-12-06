/**
 * GOAL & CONSISTENCY ENGINE v∞ — Types & Interfaces
 * 
 * Gère les objectifs explicites par conversation et la cohérence multi-tour
 * Permet à TITANE∞ de maintenir une direction et d'éviter les contradictions
 * 
 * Design principles:
 * - Explicit goals: objectifs clairs et traçables
 * - Fact tracking: base de faits stable
 * - Consistency checks: validation automatique
 */

/**
 * Statut d'un objectif
 */
export enum GoalStatus {
  PENDING = 'pending',         // En attente de démarrage
  IN_PROGRESS = 'in_progress', // En cours
  COMPLETED = 'completed',     // Terminé
  BLOCKED = 'blocked',         // Bloqué (dépendance)
  ABANDONED = 'abandoned'      // Abandonné
}

/**
 * Priorité d'un objectif
 */
export enum GoalPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

/**
 * Sous-objectif
 */
export interface SubGoal {
  /** ID unique */
  id: string;
  
  /** Label court */
  label: string;
  
  /** Description détaillée (optionnel) */
  description?: string;
  
  /** Statut */
  status: GoalStatus;
  
  /** Dépendances (IDs d'autres subgoals) */
  depends_on?: string[];
  
  /** Progression estimée (0.0 - 1.0) */
  progress?: number;
  
  /** Métadonnées temporelles */
  created_at: string;
  completed_at?: string;
  deadline?: string;
}

/**
 * Objectif principal d'une conversation
 */
export interface ConversationGoal {
  /** ID de la conversation */
  conversation_id: string;
  
  /** Objectif principal */
  main_goal: string;
  
  /** Description détaillée */
  description?: string;
  
  /** Sous-objectifs */
  subgoals: SubGoal[];
  
  /** Contraintes à respecter */
  constraints: string[];
  
  /** Contexte clé */
  context_keys?: Record<string, any>;
  
  /** Priorité globale */
  priority: GoalPriority;
  
  /** Métadonnées */
  created_at: string;
  updated_at: string;
  estimated_completion?: string;
  actual_completion?: string;
}

/**
 * Niveau de confiance d'un fait
 */
export enum FactConfidence {
  LOW = 0.5,           // Incertain, à vérifier
  MEDIUM = 0.7,        // Probable
  HIGH = 0.9,          // Très probable
  VERIFIED = 0.99      // Vérifié/confirmé
}

/**
 * Type de fait
 */
export type FactType = 
  | 'user_info'        // Info sur l'utilisateur
  | 'system_info'      // Info système
  | 'project_info'     // Info projet
  | 'decision'         // Décision prise
  | 'constraint'       // Contrainte à respecter
  | 'preference'       // Préférence
  | 'technical';       // Fait technique

/**
 * Fait stable dans une conversation
 */
export interface ConversationFact {
  /** ID unique */
  id: string;
  
  /** Type de fait */
  type: FactType;
  
  /** Énoncé du fait */
  statement: string;
  
  /** Confiance (0.0 - 1.0) */
  confidence: FactConfidence | number;
  
  /** Source du fait */
  source: {
    type: 'user_stated' | 'inferred' | 'system' | 'external';
    message_id?: string;
    timestamp: string;
  };
  
  /** Validité temporelle */
  valid_from: string;
  valid_until?: string;
  
  /** Remplace un autre fait (ID) */
  supersedes?: string;
  
  /** Tags */
  tags?: string[];
  
  /** Métadonnées */
  created_at: string;
  last_verified_at?: string;
}

/**
 * État global de cohérence pour une conversation
 */
export interface ConsistencyState {
  /** ID de la conversation */
  conversation_id: string;
  
  /** Objectifs actifs */
  goals: ConversationGoal;
  
  /** Base de faits */
  facts: ConversationFact[];
  
  /** Historique de vérifications */
  checks_history: ConsistencyCheck[];
  
  /** Score de cohérence global (0.0 - 1.0) */
  consistency_score: number;
  
  /** Métadonnées */
  created_at: string;
  updated_at: string;
}

/**
 * Type de violation de cohérence
 */
export enum ConsistencyViolationType {
  CONTRADICTION = 'contradiction',           // Contredit un fait établi
  GOAL_DRIFT = 'goal_drift',                // Dévie de l'objectif
  CONSTRAINT_VIOLATION = 'constraint_violation', // Viole une contrainte
  CONSTRAINT = 'constraint',                // Contrainte générique
  MISSING_CONTEXT = 'missing_context',      // Oublie un contexte important
  INCONSISTENT_TONE = 'inconsistent_tone',  // Ton incohérent
  FACT_RESPONSE = 'fact-response',          // Réponse incohérente avec un fait
  GOAL_RESPONSE = 'goal-response',          // Réponse incohérente avec un objectif
  TEMPORAL = 'temporal'                     // Incohérence temporelle
}

/**
 * Violation de cohérence détectée
 */
export interface ConsistencyViolation {
  /** Type de violation */
  type: ConsistencyViolationType;
  
  /** Sévérité (0.0 - 1.0) */
  severity: number;
  
  /** Description */
  description: string;
  
  /** ID du fait violé */
  fact_id?: string;
  
  /** ID de l'objectif violé */
  goal_id?: string;
  
  /** Contrainte violée */
  constraint?: string;
  
  /** Extrait de la réponse */
  response_excerpt?: string;
  
  /** Date de détection */
  detected_at?: string;
  
  /** Fait ou objectif violé */
  violated_item?: {
    type: 'fact' | 'goal' | 'constraint';
    id?: string;
    content: string;
  };
  
  /** Segment de texte problématique */
  problematic_text?: string;
  
  /** Suggestion de correction */
  suggested_fix?: string;
}

/**
 * Résultat d'une vérification de cohérence
 */
export interface ConsistencyCheck {
  /** ID unique */
  id: string;
  
  /** Timestamp */
  timestamp: string;
  
  /** Message vérifié */
  message_id?: string;
  message_content?: string;
  
  /** Violations détectées */
  violations: ConsistencyViolation[];
  
  /** Score de cohérence (0.0 - 1.0) */
  score: number;
  
  /** Temps de vérification (ms) */
  check_duration_ms: number;
  
  /** Action prise */
  action?: 'none' | 'corrected' | 'flagged' | 'rejected';
  
  /** Texte corrigé (si correction appliquée) */
  corrected_text?: string;
}

/**
 * Contexte de cohérence pour injection OMEGA
 */
export interface ConsistencyContext {
  /** Objectif principal actuel */
  main_goal?: string;
  
  /** Sous-objectifs en cours */
  active_subgoals: string[];
  
  /** Contraintes à respecter */
  constraints: string[];
  
  /** Faits clés (top 10 max) */
  key_facts: Array<{
    statement: string;
    confidence: number;
  }>;
  
  /** Résumé textuel pour injection */
  summary: string;
  
  /** Métadonnées */
  metadata: {
    goals_count: number;
    facts_count: number;
    consistency_score: number;
  };
}

/**
 * Configuration du moteur de cohérence
 */
export interface GoalConsistencyConfig {
  /** Activer/désactiver */
  enabled: boolean;
  
  /** Correction automatique activée */
  enable_auto_correction?: boolean;
  
  /** Suivi des faits activé */
  enable_fact_tracking?: boolean;
  
  /** Suivi des objectifs activé */
  enable_goal_tracking?: boolean;
  
  /** Seuil de vérification de cohérence */
  consistency_check_threshold?: number;
  
  /** Taux de dégradation de la confiance des faits */
  fact_confidence_decay_rate?: number;
  
  /** Nombre max de violations avant alerte */
  max_violations_before_alert?: number;
  
  /** Poids des sévérités de violation */
  violation_severity_weights?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  /** Vérifications automatiques */
  auto_check: {
    enabled: boolean;
    check_every_n_messages: number; // default: 1
    min_severity_to_flag: number;   // default: 0.6
  };
  
  /** Correction automatique */
  auto_correct: {
    enabled: boolean;
    max_severity_to_auto_correct: number; // default: 0.7
  };
  
  /** Gestion des faits */
  facts: {
    max_facts_per_conversation: number;    // default: 100
    min_confidence_to_use: number;         // default: 0.6
    auto_supersede_old_facts: boolean;     // default: true
  };
  
  /** Gestion des objectifs */
  goals: {
    max_subgoals: number;                  // default: 20
    auto_complete_subgoals: boolean;       // default: false
  };
  
  /** Injection OMEGA */
  omega_injection: {
    inject_goals: boolean;                 // default: true
    inject_facts: boolean;                 // default: true
    max_facts_injected: number;            // default: 10
    inject_constraints: boolean;           // default: true
  };
}

/**
 * Stats du moteur de cohérence
 */
export interface ConsistencyStats {
  total_conversations_tracked: number;
  total_goals_created: number;
  total_facts_recorded: number;
  total_checks_performed: number;
  total_violations_detected: number;
  avg_consistency_score: number;
  most_common_violation_type: ConsistencyViolationType;
  auto_corrections_applied: number;
  avg_check_duration_ms: number;
}

/**
 * Événements du moteur de cohérence
 */
export interface ConsistencyEvent {
  type: 'goal_created' | 'goal_updated' | 'fact_added' | 'violation_detected' | 'auto_corrected';
  timestamp: string;
  conversation_id: string;
  data: any;
}

export type ConsistencyEventHandler = (event: ConsistencyEvent) => void;
