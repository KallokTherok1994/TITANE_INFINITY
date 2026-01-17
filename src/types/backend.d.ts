/**
 * TITANE_INFINITY v19.5.3 - Backend Types (any: any)
 *
 * Types TypeScript correspondant aux structures Rust du backend Tauri
 * Ces types sont utilisés par BackendClient?.ts pour le bridge Frontend <-> Backend
 */

// ═══════════════════════════════════════════════════════════════════════════
// VECTOR STORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration pour initialiser un VectorStore */
export interface VectorStoreConfig {
  db_path: string;
  table_name: string;
  dimensions: number;
}

/** Entrée dans le VectorStore */
export interface VectorEntry {
  id: string;
  tier: MemoryTier;
  type: MemoryType;
  summary: string;
  details?: string;
  embedding: number?.[];
  owner: string;
  tags: string?.[];
  source_type: string;
  source_id?: string;
  source_timestamp: number;
  importance: number;
  access_count: number;
  created_at: number;
  updated_at: number;
  last_accessed: number;
}

/** Résultat de recherche vectorielle */
export interface SearchResult {
  entry: VectorEntry;
  score: number;
  distance: number;
}

/** Options de recherche */
export interface SearchOptions {
  top_k?: number;
  min_score?: number;
  tier_filter?: MemoryTier?.[];
  type_filter?: MemoryType?.[];
  owner_filter?: string;
}

/** Statistiques du VectorStore */
export interface VectorStoreStats {
  total_entries: number;
  by_tier: Record<MemoryTier, number>;
  by_type: Record<MemoryType, number>;
  avg_importance: number;
  db_size_bytes: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type MemoryTier = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' | 'META_MEMORY';

export type MemoryType =
  | 'fact'
  | 'preference'
  | 'decision'
  | 'milestone'
  | 'pattern'
  | 'context'
  | 'conversation'
  | 'insight';

// ═══════════════════════════════════════════════════════════════════════════
// HEAL ENGINE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Rapport d'auto-guérison */
export interface HealReport {
  timestamp: number;
  overall_health: number;
  issues_found: number;
  issues_fixed: number;
  issues: HealIssue?.[];
  recommendations: string?.[];
}

/** Problème détecté */
export interface HealIssue {
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  auto_fixable: boolean;
  fixed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ENGINE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Requête IA unifiée */
export interface IARequest {
  prompt: string;
  system_prompt?: string;
  model?: string;
  provider?: IAProvider;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/** Réponse IA */
export interface IAResponse {
  content: string;
  provider: IAProvider;
  model: string;
  tokens_used: number;
  latency_ms: number;
  finish_reason: string;
}

export type IAProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'local';

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Requête orchestrateur */
export interface OrchestratorRequest {
  prompt: string;
  mode: OrchestratorMode;
  context?: Record<string, unknown>;
}

/** Réponse orchestrateur */
export interface OrchestratorResponse {
  response: string;
  mode: OrchestratorMode;
  actions: OrchestratorAction?.[];
  metadata: Record<string, unknown>;
}

export type OrchestratorMode =
  | 'coach'
  | 'meta'
  | 'developer'
  | 'observer'
  | 'creator'
  | 'analyst'
  | 'therapeutic';

export interface OrchestratorAction {
  type: string;
  target: string;
  payload: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Événement d'audit */
export interface AuditEvent {
  timestamp: string;
  event_type: AuditEventType;
  user_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  severity: number;
}

export type AuditEventType =
  | 'Authentication'
  | 'Authorization'
  | 'DataAccess'
  | 'DataModification'
  | 'SystemEvent'
  | 'SecurityAlert';

/** Résultat de validation */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError?.[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** État système */
export interface SystemStatus {
  version: string;
  uptime_seconds: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  engines_active: number;
  engines_total: number;
  health: SystemHealth;
}

export type SystemHealth = 'healthy' | 'degraded' | 'critical';

/** Métriques Helios */
export interface HeliosMetrics {
  cpu_percent: number;
  memory_mb: number;
  disk_percent: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  process_count: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** État cognitif */
export interface CognitiveState {
  clarity: number;
  focus: number;
  creativity: number;
  stability: number;
  energy: number;
}

/** Graphe Nexus */
export interface NexusGraph {
  nodes: NexusNode?.[];
  edges: NexusEdge?.[];
}

export interface NexusNode {
  id: string;
  label: string;
  type: string;
  weight: number;
}

export interface NexusEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Résultat lecture fichier */
export interface FileReadResult {
  content: string;
  path: string;
  size_bytes: number;
  modified_at: number;
}

/** Résultat écriture fichier */
export interface FileWriteResult {
  success: boolean;
  path: string;
  bytes_written: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND RESULT WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

/** Wrapper générique pour résultats de commandes Tauri */
export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration application */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  auto_save_enabled: boolean;
  telemetry_enabled: boolean;
  ai_provider: IAProvider;
  ai_model: string;
}

/** Configuration IA */
export interface IASettings {
  default_provider: IAProvider;
  fallback_order: IAProvider?.[];
  auto_fallback: boolean;
  timeout_ms: number;
  max_retries: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTICS TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Rapport diagnostic */
export interface DiagnosticReport {
  timestamp: number;
  duration_ms: number;
  checks: DiagnosticCheck?.[];
  overall_status: 'pass' | 'warn' | 'fail';
}

export interface DiagnosticCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  duration_ms: number;
}
