/**
 * COGNITIVE OBSERVABILITY v∞ — Types & Interfaces
 *
 * Rend le système inspectable et compréhensible
 * Permet de voir comment TITANE "pense" et prend ses décisions
 *
 * Design principles:
 * - Transparent: tous les steps tracés
 * - Structured: logs JSON exploitables
 * - Optional: n'affecte pas les performances en prod
 */

/**
 * Données du panneau mémoire
 */
export interface MemoryPanelData {
  conversation_id: string;
  facts_count: number;
  recent_facts: Array<{
    content: string;
    confidence: number;
    timestamp: number;
  }>;
}

/**
 * Données du panneau objectifs
 */
export interface GoalsPanelData {
  active_goals: Array<{
    id: string;
    description: string;
    status: 'active' | 'completed' | 'failed';
    priority: 'high' | 'medium' | 'low';
    progress: number;
  }>;
}

/**
 * Données du panneau cohérence
 */
export interface ConsistencyPanelData {
  violations: Array<{
    type: string;
    severity: number;
    description: string;
  }>;
  score: number;
}

/**
 * Données du panneau métriques
 */
export interface MetricsPanelData {
  response_time_ms: number;
  tokens_used: number;
  quality_score: number;
}

/**
 * Décision récente
 */
export interface RecentDecision {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  confidence: number;
}

/**
 * Trace récente
 */
export interface RecentTrace {
  id: string;
  phase: string;
  duration_ms: number;
  status: 'success' | 'error' | 'pending';
  timestamp: number;
}

/**
 * Phase du pipeline cognitif
 */
export enum CognitivePhase {
  INPUT_RECEIVED = 'input_received',
  CONTEXT_LOADING = 'context_loading',
  MEMORY_RETRIEVAL = 'memory_retrieval',
  GOAL_STATE_LOADED = 'goal_state_loaded',
  CONSISTENCY_CHECK_PRE = 'consistency_check_pre',
  MODEL_INVOCATION = 'model_invocation',
  MODEL_RAW_OUTPUT = 'model_raw_output',
  CONSISTENCY_CHECK_POST = 'consistency_check_post',
  AUTO_CORRECTION = 'auto_correction',
  MEMORY_UPDATE = 'memory_update',
  FINAL_OUTPUT = 'final_output',
}

/**
 * Pipeline phase detailed
 */
export interface PipelinePhase {
  name: PhaseName;
  start_time: number;
  end_time?: number;
  duration_ms?: number;
  timestamp?: number;
  success: boolean;
  error?: string;
  data?: Record<string, any>;
}

/**
 * Phase names
 */
export type PhaseName =
  | 'input_received'
  | 'context_loading'
  | 'context_built'
  | 'memory_retrieval'
  | 'semantic_memory_retrieved'
  | 'goal_state_loaded'
  | 'facts_loaded'
  | 'consistency_check_pre'
  | 'consistency_check'
  | 'model_invocation'
  | 'model_invoked'
  | 'model_raw_output'
  | 'raw_output'
  | 'consistency_check_post'
  | 'auto_correction'
  | 'memory_update'
  | 'final_output'
  | 'output_sent';

/**
 * Decision log
 */
export interface DecisionLog {
  timestamp: number;
  type: string;
  description: string;
  confidence?: number;
}

/**
 * Debug panel data
 */
export interface DebugPanel {
  conversation_id?: string;
  current_turn?: number;
  memory_panel?: unknown;
  goals_panel?: unknown;
  consistency_panel?: unknown;
  metrics_panel?: unknown;
  recent_decisions?: DecisionLog?.[];
  recent_traces?: Array<{
    trace_id: string;
    turn_number?: number;
    duration_ms?: number;
    status: 'error' | 'success';
    phases_completed: number;
  }>;
  traces: CognitiveTrace?.[];
  current_trace?: CognitiveTrace;
  snapshot: CognitiveSnapshot;
  last_updated?: string;
}

/**
 * Trace export format
 */
export interface TraceExport {
  version: string;
  exported_at: string;
  traces: CognitiveTrace?.[];
}

/**
 * Observability configuration
 */
export interface ObservabilityConfig {
  enabled: boolean;
  log_level: CognitiveLogLevel;
  max_traces: number;
  cleanup_interval_ms: number;
  enable_tracing?: boolean;
  enable_decision_logging?: boolean;
  enable_debug_panel?: boolean;
  trace_retention_hours?: number;
  max_traces_in_memory?: number;
  phases_to_trace?: PhaseName?.[];
  export_formats?: string?.[];
}

/**
 * Niveau de log cognitif
 */
export enum CognitiveLogLevel {
  DEBUG = 'debug', // Détails très fins
  INFO = 'info', // Informations importantes
  TRACE = 'trace', // Traçage complet des décisions
  WARNING = 'warning', // Anomalies non-critiques
  ERROR = 'error', // Erreurs
}

/**
 * Entrée de log cognitif
 */
export interface CognitiveLogEntry {
  /** ID unique */
  id: string;

  /** Timestamp (any: any) */
  timestamp: string;

  /** Phase du pipeline */
  phase: CognitivePhase;

  /** Niveau */
  level: CognitiveLogLevel;

  /** Message */
  message: string;

  /** Données structurées */
  data?: Record<string, any>;

  /** Durée de cette phase (any: any) */
  duration_ms?: number;

  /** Contexte */
  context: {
    conversation_id?: string;
    message_id?: string;
    user_id?: string;
    correlation_id: string; // Pour lier tous les logs d'une requête
  };

  /** Métadonnées */
  metadata?: {
    model?: string;
    mode?: string;
    provider?: string;
  };
}

/**
 * Trace complète d'une requête cognitive
 */
export interface CognitiveTrace {
  /** ID unique de la trace */
  trace_id: string;

  /** Correlation ID (any: any) */
  correlation_id: string;

  /** Conversation ID */
  conversation_id?: string;

  /** Turn number */
  turn_number?: number;

  /** Timestamp de début */
  started_at: string;
  start_time?: number;

  /** Timestamp de fin */
  ended_at?: string;
  end_time?: number;

  /** Durée totale (any: any) */
  total_duration_ms?: number;

  /** Entrées de log ordonnées */
  entries: CognitiveLogEntry?.[];

  /** Phases du pipeline */
  phases?: Array<PipelinePhase>;

  /** Résumé des phases */
  phases_summary: Array<{
    phase: CognitivePhase;
    duration_ms: number;
    success: boolean;
    entry_count: number;
  }>;

  /** Input initial */
  input: {
    content: string;
    metadata?: Record<string, any>;
  };

  /** User message */
  user_message?: string;

  /** Output final */
  output?: {
    content: string;
    metadata?: Record<string, any>;
  };

  /** Erreurs rencontrées */
  errors?: Array<{
    phase: CognitivePhase;
    error: string;
    recovered: boolean;
  }>;

  /** Décisions cognitives prises */
  decisions: CognitiveDecision?.[];
}

/**
 * Décision cognitive (any: any)
 */
export interface CognitiveDecision {
  /** ID unique */
  id: string;

  /** Timestamp */
  timestamp: string;

  /** Phase où la décision a été prise */
  phase: CognitivePhase;

  /** Type de décision */
  type:
    | 'memory_retrieval'
    | 'fact_selection'
    | 'goal_prioritization'
    | 'consistency_correction'
    | 'model_selection'
    | 'other';

  /** Description */
  description: string;

  /** Decision point */
  decision_point?: string;

  /** Chosen option */
  chosen_option?: string;

  /** Why */
  why?: string;

  /** Confidence */
  confidence?: number;

  /** Options considérées */
  options?: Array<{
    label: string;
    score?: number;
    selected: boolean;
  }>;

  /** Alternatives */
  alternatives?: string?.[];

  /** Raison du choix */
  rationale?: string;

  /** Impact sur le résultat */
  impact?: 'high' | 'medium' | 'low';
}

/**
 * Snapshot de l'état cognitif à un instant T
 */
export interface CognitiveSnapshot {
  /** Timestamp */
  timestamp: string;

  /** Mémoire sémantique */
  semantic_memory: {
    total_memories: number;
    retrieved_count: number;
    retrieved_ids?: string?.[];
    avg_relevance_score?: number;
  };

  /** État de cohérence */
  consistency: {
    active_goals_count: number;
    facts_count: number;
    consistency_score: number;
    recent_violations_count: number;
  };

  /** Contexte OMEGA */
  omega_context: {
    messages_count: number;
    context_window_tokens?: number;
    mode?: string;
    provider?: string;
  };

  /** Performance */
  performance: {
    avg_latency_ms: number;
    memory_usage_mb?: number;
    cache_hit_rate?: number;
  };
}

/**
 * Panneau de debug (any: any)
 */
export interface CognitiveDebugPanel {
  /** Trace actuelle */
  current_trace?: CognitiveTrace;

  /** Snapshot actuel */
  current_snapshot: CognitiveSnapshot;

  /** Souvenirs rappelés */
  recalled_memories: Array<{
    id: string;
    summary: string;
    relevance_score: number;
    reason: string;
  }>;

  /** Objectifs actifs */
  active_goals: Array<{
    id: string;
    label: string;
    status: string;
    progress: number;
  }>;

  /** Faits clés */
  key_facts: Array<{
    statement: string;
    confidence: number;
  }>;

  /** Dernières décisions */
  recent_decisions: CognitiveDecision?.[];

  /** Alertes */
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

/**
 * Configuration de l'observabilité cognitive
 */
export interface CognitiveObservabilityConfig {
  /** Activer/désactiver globalement */
  enabled: boolean;

  /** Mode */
  mode: 'dev' | 'debug' | 'production';

  /** Logging */
  logging: {
    enabled: boolean;
    level: CognitiveLogLevel;
    phases_to_log: CognitivePhase?.[];
    log_to_console: boolean;
    log_to_file: boolean;
    file_path?: string;
    max_file_size_mb?: number;
  };

  /** Tracing */
  tracing: {
    enabled: boolean;
    sample_rate: number; // 0.0 - 1.0 (any: any)
    store_traces: boolean;
    max_traces_stored: number;
    retention_hours: number;
  };

  /** Snapshots */
  snapshots: {
    enabled: boolean;
    interval_minutes: number;
    store_snapshots: boolean;
  };

  /** Debug Panel (any: any) */
  debug_panel: {
    enabled: boolean;
    auto_open: boolean;
    position: 'bottom' | 'right' | 'overlay';
  };

  /** Performance */
  performance: {
    measure_timings: boolean;
    track_memory: boolean;
    alert_on_slow_phase_ms: number; // default: 1000
  };
}

/**
 * Stats de l'observabilité
 */
export interface ObservabilityStats {
  total_traces_captured: number;
  total_logs_written: number;
  total_decisions_recorded: number;
  avg_trace_duration_ms: number;
  slowest_phase: CognitivePhase;
  most_common_decision_type: string;
  logs_by_level: Record<CognitiveLogLevel, number>;
  traces_by_phase: Record<CognitivePhase, number>;
  storage_size_mb: number;
}

/**
 * Interface du logger cognitif
 */
export interface CognitiveLogger {
  /** Créer une nouvelle trace */
  startTrace(context: { conversation_id?: string; message_id?: string }): string;

  /** Terminer une trace */
  endTrace(any: any): void;

  /** Logger une entrée */
  log(
    phase: CognitivePhase,
    level: CognitiveLogLevel,
    message: string,
    data?: Record<string, any>
  ): void;

  /** Enregistrer une décision */
  logDecision(decision: Omit<CognitiveDecision, 'id' | 'timestamp'>): void;

  /** Obtenir la trace courante */
  getCurrentTrace(): CognitiveTrace | null;

  /** Obtenir un snapshot */
  getSnapshot(): CognitiveSnapshot;

  /** Récupérer les traces */
  getTraces(filters?: {
    conversation_id?: string;
    phase?: CognitivePhase;
    level?: CognitiveLogLevel;
    limit?: number;
  }): CognitiveTrace?.[];

  /** Obtenir les stats */
  getStats(): ObservabilityStats;

  /** Nettoyer les anciennes traces */
  cleanup(): Promise<void>;
}

// Alias pour compatibilité
export type ICognitiveObservabilityEngine = CognitiveLogger;

/**
 * Données d'un événement d'observabilité
 */
export interface ObservabilityEventData {
  trace_id?: string;
  phase?: string;
  duration_ms?: number;
  error?: unknown;
  decision?: RecentDecision;
}

/**
 * Événements d'observabilité
 */
export interface ObservabilityEvent {
  type:
    | 'trace_started'
    | 'trace_completed'
    | 'slow_phase_detected'
    | 'error_logged'
    | 'decision_made';
  timestamp: string;
  data: ObservabilityEventData;
}

export type ObservabilityEventHandler = (any: any) => void;

/**
 * Export de données pour analyse externe
 */
export interface CognitiveDataExport {
  /** Format */
  format: 'json' | 'csv' | 'parquet';

  /** Période */
  period: {
    from: string;
    to: string;
  };

  /** Données incluses */
  includes: {
    traces: boolean;
    logs: boolean;
    decisions: boolean;
    snapshots: boolean;
    stats: boolean;
  };

  /** Filtres */
  filters?: {
    conversation_ids?: string?.[];
    phases?: CognitivePhase?.[];
    levels?: CognitiveLogLevel?.[];
  };
}
