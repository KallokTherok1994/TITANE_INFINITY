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
  FINAL_OUTPUT = 'final_output'
}

/**
 * Niveau de log cognitif
 */
export enum CognitiveLogLevel {
  DEBUG = 'debug',     // Détails très fins
  INFO = 'info',       // Informations importantes
  TRACE = 'trace',     // Traçage complet des décisions
  WARNING = 'warning', // Anomalies non-critiques
  ERROR = 'error'      // Erreurs
}

/**
 * Entrée de log cognitif
 */
export interface CognitiveLogEntry {
  /** ID unique */
  id: string;
  
  /** Timestamp (ISO 8601 avec ms) */
  timestamp: string;
  
  /** Phase du pipeline */
  phase: CognitivePhase;
  
  /** Niveau */
  level: CognitiveLogLevel;
  
  /** Message */
  message: string;
  
  /** Données structurées */
  data?: Record<string, any>;
  
  /** Durée de cette phase (ms) */
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
  
  /** Correlation ID (groupe tous les logs) */
  correlation_id: string;
  
  /** Timestamp de début */
  started_at: string;
  
  /** Timestamp de fin */
  ended_at?: string;
  
  /** Durée totale (ms) */
  total_duration_ms?: number;
  
  /** Entrées de log ordonnées */
  entries: CognitiveLogEntry[];
  
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
  decisions: CognitiveDecision[];
}

/**
 * Décision cognitive (traçabilité des choix)
 */
export interface CognitiveDecision {
  /** ID unique */
  id: string;
  
  /** Timestamp */
  timestamp: string;
  
  /** Phase où la décision a été prise */
  phase: CognitivePhase;
  
  /** Type de décision */
  type: 'memory_retrieval' | 'fact_selection' | 'goal_prioritization' | 'consistency_correction' | 'model_selection' | 'other';
  
  /** Description */
  description: string;
  
  /** Options considérées */
  options?: Array<{
    label: string;
    score?: number;
    selected: boolean;
  }>;
  
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
    retrieved_ids?: string[];
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
 * Panneau de debug (UI)
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
  recent_decisions: CognitiveDecision[];
  
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
    phases_to_log: CognitivePhase[];
    log_to_console: boolean;
    log_to_file: boolean;
    file_path?: string;
    max_file_size_mb?: number;
  };
  
  /** Tracing */
  tracing: {
    enabled: boolean;
    sample_rate: number; // 0.0 - 1.0 (1.0 = toutes les requêtes)
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
  
  /** Debug Panel (UI) */
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
  endTrace(traceId: string): void;
  
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
  }): CognitiveTrace[];
  
  /** Obtenir les stats */
  getStats(): ObservabilityStats;
  
  /** Nettoyer les anciennes traces */
  cleanup(): Promise<void>;
}

/**
 * Événements d'observabilité
 */
export interface ObservabilityEvent {
  type: 'trace_started' | 'trace_completed' | 'slow_phase_detected' | 'error_logged' | 'decision_made';
  timestamp: string;
  data: any;
}

export type ObservabilityEventHandler = (event: ObservabilityEvent) => void;

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
    conversation_ids?: string[];
    phases?: CognitivePhase[];
    levels?: CognitiveLogLevel[];
  };
}
