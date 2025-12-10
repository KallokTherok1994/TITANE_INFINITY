/**
 * CONVERSATION EVALUATION & QA ENGINE v∞ — Types & Interfaces
 *
 * Évalue systématiquement la qualité des conversations
 * Permet de détecter les régressions et guider l'amélioration continue
 *
 * Design principles:
 * - Test-driven: scénarios de référence rejouables
 * - Metrics-based: scores quantitatifs
 * - Continuous: évaluation live optionnelle
 */

/**
 * Type de métrique d'évaluation
 */
export type MetricType =
  | 'consistency' // Cohérence globale
  | 'goal_completion' // Complétion des objectifs
  | 'conciseness' // Concision
  | 'clarity' // Clarté
  | 'relevance' // Pertinence
  | 'technical_accuracy' // Précision technique
  | 'tone' // Ton approprié
  | 'latency' // Temps de réponse
  | 'memory_usage'; // Utilisation mémoire

/**
 * Score d'une métrique
 */
export interface MetricScore {
  /** Type de métrique */
  type: MetricType;

  /** Valeur (0.0 - 1.0 pour les scores qualitatifs) */
  value: number;

  /** Unité (si applicable) */
  unit?: string; // 'seconds', 'MB', 'score', etc.

  /** Détails/raison */
  details?: string;

  /** Sous-scores (optionnel) */
  subscores?: Record<string, number>;
}

/**
 * Critère de succès pour un test
 */
export interface SuccessCriterion {
  /** ID unique */
  id: string;

  /** Description */
  description: string;

  /** Type de métrique */
  metric_type: MetricType;

  /** Condition de succès */
  condition: {
    operator: 'gte' | 'lte' | 'eq' | 'neq' | 'gt' | 'lt';
    threshold: number;
  };

  /** Poids dans l'évaluation globale */
  weight?: number; // default: 1.0

  /** Critique (échec = test failed) */
  is_critical?: boolean;
}

/**
 * Message de test
 */
export interface TestMessage {
  /** Role (user ou assistant) */
  role: 'user' | 'assistant';

  /** Contenu */
  content: string;

  /** Réponse attendue (si role = user) */
  expected_response?: {
    /** Contenu exact (optionnel) */
    exact_match?: string;

    /** Patterns requis (regex) */
    must_contain?: string[];

    /** Patterns interdits (regex) */
    must_not_contain?: string[];

    /** Contraintes structurelles */
    constraints?: {
      max_length?: number;
      min_length?: number;
      max_paragraphs?: number;
      contains_code?: boolean;
    };
  };
}

/**
 * Scénario de test de conversation
 */
export interface ConversationTestScenario {
  /** ID unique */
  id: string;

  /** Nom du scénario */
  name: string;

  /** Description */
  description: string;

  /** Catégorie */
  category: 'technical' | 'creative' | 'coaching' | 'general' | 'edge_case';

  /** Contexte initial */
  initial_context?: {
    system_prompt?: string;
    mode?: string;
    user_profile?: Record<string, any>;
    conversation_state?: Record<string, any>;
  };

  /** Séquence de messages */
  messages: TestMessage[];

  /** Objectifs du test */
  goals: string[];

  /** Critères de succès */
  success_criteria: SuccessCriterion[];

  /** Métadonnées */
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration_ms?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Résultat d'évaluation d'un message
 */
export interface MessageEvaluationResult {
  /** ID du message */
  message_id?: string;

  /** Contenu du message */
  content: string;

  /** Scores des métriques */
  scores: MetricScore[];

  /** Score global (0.0 - 1.0) */
  overall_score: number;

  /** Violations détectées */
  violations?: Array<{
    type: string;
    severity: number;
    description: string;
  }>;

  /** Feedback textuel */
  feedback?: string;
}

/**
 * Résultat d'exécution d'un scénario de test
 */
export interface TestScenarioResult {
  /** ID du scénario */
  scenario_id: string;

  /** Timestamp d'exécution */
  timestamp: string;

  /** Durée totale (ms) */
  duration_ms: number;

  /** Messages générés */
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    expected?: any;
    actual?: any;
    evaluation: MessageEvaluationResult;
  }>;

  /** Évaluation des critères */
  criteria_results: Array<{
    criterion: SuccessCriterion;
    passed: boolean;
    actual_value: number;
    details?: string;
  }>;

  /** Scores globaux */
  global_scores: MetricScore[];

  /** Résultat final */
  passed: boolean;
  overall_score: number;

  /** Erreurs rencontrées */
  errors?: Array<{
    stage: string;
    error: string;
    stack?: string;
  }>;

  /** Logs (si debug activé) */
  logs?: string[];
}

/**
 * Résultats d'une suite de tests
 */
export interface TestSuiteResult {
  /** ID de la suite */
  id: string;

  /** Timestamp */
  timestamp: string;

  /** Durée totale */
  duration_ms: number;

  /** Résultats par scénario */
  scenarios: TestScenarioResult[];

  /** Statistiques */
  stats: {
    total_scenarios: number;
    passed: number;
    failed: number;
    skipped: number;
    pass_rate: number;
    avg_score: number;
    avg_duration_ms: number;
  };

  /** Métriques agrégées */
  aggregated_metrics: Record<
    MetricType,
    {
      avg: number;
      min: number;
      max: number;
      std_dev: number;
    }
  >;

  /** Environnement */
  environment: {
    version: string;
    platform: string;
    model?: string;
  };
}

/**
 * Configuration d'évaluation live
 */
export interface LiveEvaluationConfig {
  /** Activer */
  enabled: boolean;

  /** Fréquence */
  evaluate_every_n_messages: number; // default: 5

  /** Métriques à évaluer */
  metrics_to_track: MetricType[];

  /** Seuil d'alerte */
  alert_threshold: {
    consistency_score: number; // default: 0.6
    goal_completion: number; // default: 0.5
  };

  /** Mode d'évaluation */
  mode: 'full' | 'lightweight'; // full = IA, lightweight = heuristiques

  /** Stockage des résultats */
  store_results: boolean;

  /** Notification */
  notify_on_low_score: boolean;
}

/**
 * Résultat d'évaluation live
 */
export interface LiveEvaluationResult {
  /** Timestamp */
  timestamp: string;

  /** ID de conversation */
  conversation_id: string;

  /** Nombre de messages évalués */
  messages_evaluated: number;

  /** Scores actuels */
  current_scores: MetricScore[];

  /** Tendances (sur derniers N messages) */
  trends: Record<
    MetricType,
    {
      current: number;
      previous: number;
      delta: number;
      direction: 'up' | 'down' | 'stable';
    }
  >;

  /** Alertes */
  alerts?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
}

/**
 * Configuration du moteur d'évaluation
 */
export interface EvaluationEngineConfig {
  /** Test scenarios */
  test_scenarios: {
    directory: string;
    auto_load: boolean;
    categories_enabled: string[];
  };

  /** Live evaluation */
  live_evaluation: LiveEvaluationConfig;

  /** Scoring */
  scoring: {
    default_weights: Record<MetricType, number>;
    custom_weights?: Record<string, Record<MetricType, number>>;
  };

  /** Storage */
  storage: {
    save_results: boolean;
    results_directory: string;
    retention_days: number;
  };

  /** Reporting */
  reporting: {
    generate_html_report: boolean;
    generate_json_report: boolean;
    compare_with_baseline: boolean;
  };
}

/**
 * Stats du moteur d'évaluation
 */
export interface EvaluationStats {
  total_scenarios_run: number;
  total_evaluations: number;
  overall_pass_rate: number;
  avg_overall_score: number;
  by_category: Record<
    string,
    {
      count: number;
      pass_rate: number;
      avg_score: number;
    }
  >;
  most_common_failure: string;
  best_performing_metric: MetricType;
  worst_performing_metric: MetricType;
  last_run_timestamp?: string;
}

/**
 * Événements du moteur d'évaluation
 */
export interface EvaluationEvent {
  type: 'test_started' | 'test_completed' | 'test_failed' | 'live_eval_alert';
  timestamp: string;
  data: any;
}

export type EvaluationEventHandler = (event: EvaluationEvent) => void;
