/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Backend Types (Comprehensive)
 * Complete TypeScript type definitions for all Tauri commands and interfaces
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// HELIOS - System Monitoring
// ─────────────────────────────────────────────────────────────────

export interface HeliosState {
  cpu_usage: number;
  ram_usage: number;
  disk_usage: [number, number, number]; // [used, total, percentage]
  uptime: number;
  load_average: [number, number, number]; // [1min, 5min, 15min]
  timestamp: number;
}

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

// ─────────────────────────────────────────────────────────────────
// NEXUS - Module Coherence
// ─────────────────────────────────────────────────────────────────

export interface NexusState {
  modules: Record<string, ModuleStatus>;
  coherence_score: number;
  timestamp: number;
}

export interface ModuleStatus {
  name: string;
  health: ModuleHealth;
  last_check: number;
  error_count: number;
}

export type ModuleHealth = 'Healthy' | 'Degraded' | 'Failed';

// ─────────────────────────────────────────────────────────────────
// HARMONIA - System Balancing
// ─────────────────────────────────────────────────────────────────

export interface HarmoniaState {
  balance_score: number;
  stabilization_level: StabilizationLevel;
  adjustments_made: number;
  timestamp: number;
}

export type StabilizationLevel = 'Stable' | 'Adjusting' | 'Critical';

export interface BalanceAction {
  action_type: ActionType;
  target: string;
  priority: number;
  reason: string;
}

export type ActionType = 'Reduce' | 'Increase' | 'Maintain' | 'Alert';

// ─────────────────────────────────────────────────────────────────
// SENTINEL - Anomaly Detection
// ─────────────────────────────────────────────────────────────────

export interface SentinelState {
  integrity_score: number;
  alerts: Alert[];
  scans_performed: number;
  timestamp: number;
}

export interface Alert {
  id: string;
  severity: Severity;
  category: AlertCategory;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlertCategory =
  | 'Performance'
  | 'Security'
  | 'Stability'
  | 'Resource'
  | 'Unknown';

// ─────────────────────────────────────────────────────────────────
// MEMORY - Unified Storage
// ─────────────────────────────────────────────────────────────────

export type MemoryDiskMode = 'disabled' | 'read_only' | 'write_only' | 'read_write';

export interface MemoryState {
  snapshots_count: number;
  log_entries_count: number;
  timeline_events: number;
  storage_size_mb: number;
  timestamp: number;
  disk_mode: MemoryDiskMode;
  synthetic_mode: boolean;
  last_validation_ts?: number | null;
  last_compaction_ts?: number | null;
  issues: string[];
  /** Legacy optional props preserved for backwards compatibility */
  logs_count?: number;
  timeline_count?: number;
  last_snapshot?: Snapshot;
  last_event?: TimelineEvent;
}

export interface MemoryFileReport {
  name: string;
  size_bytes: number;
  modified_ts: number;
  version?: string | null;
}

export interface MemoryDirectoryReport {
  base_path: string;
  missing: boolean;
  total_size_bytes: number;
  files: MemoryFileReport[];
}

export interface Snapshot {
  id: string;
  timestamp: number;
  helios: HeliosState;
  nexus: NexusEngineState; // [FIX-006] was NexusState
  harmonia: HarmoniaEngineState; // [FIX-006] was HarmoniaState
  sentinel: SentinelEngineState; // [FIX-006] was SentinelState
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  message: string;
}

export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Critical';

export interface TimelineEvent {
  id: string;
  timestamp: number;
  event_type: EventType;
  description: string;
  metadata?: Record<string, string>;
}

export type EventType =
  | 'SystemStart'
  | 'SystemStop'
  | 'ModuleRegistered'
  | 'AlertCreated'
  | 'EvolutionComplete'
  | 'Custom';

// ─────────────────────────────────────────────────────────────────
// ENGINE - Auto-Evolution
// ─────────────────────────────────────────────────────────────────

export interface EvolutionReport {
  timestamp: number;
  issues: Issue[];
  recommendations: Recommendation[];
  health_score: number;
  duration_ms: number;
}

export interface Issue {
  severity: IssueSeverity;
  category: string;
  description: string;
  affected_module?: string;
}

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Recommendation {
  priority: number;
  action: string;
  reason: string;
  estimated_impact: string;
  target_module?: string;
}

export interface RepairResult {
  success: boolean;
  action: string;
  message: string;
  timestamp: number;
}

export interface EvolutionState {
  last_evolution?: EvolutionReport;
  history: EvolutionHistory[];
  total_evolutions: number;
}

export interface EvolutionHistory {
  timestamp: number;
  health_score: number;
  issues_count: number;
  repairs_count: number;
}

// ─────────────────────────────────────────────────────────────────
// SYSTEM - Full State
// ─────────────────────────────────────────────────────────────────

export interface SystemState {
  helios: HeliosState;
  nexus: NexusEngineState; // [FIX-006] was NexusState — aligned with engine_get_nexus_state
  harmonia: HarmoniaEngineState; // [FIX-006] was HarmoniaState — aligned with engine_get_harmonia_state
  sentinel: SentinelEngineState; // [FIX-006] was SentinelState — aligned with engine_get_sentinel_state
  memory: MemoryState;
  evolution: EvolutionState;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// ENGINE MODULE STATES — Aligned with actual Rust backend responses
// Source: src-tauri/src/commands/engine_commands.rs
// [FIX-003] These types replace NexusState/HarmoniaState/SentinelState
// for engine_get_* IPC calls. Legacy types preserved for Snapshot/SystemState.
// ─────────────────────────────────────────────────────────────────

/** Aligned with engine_commands.rs NexusStateResponse */
export interface NexusEngineState {
  health: string;
  coordination_count: number;
  active_connections: number;
  last_coordination_ms: number;
  initialized: boolean;
}

/** Aligned with engine_commands.rs HarmoniaStateResponse */
export interface HarmoniaEngineState {
  health: string;
  harmony_index: number;
  balance_score: number;
  last_check_ms: number;
  initialized: boolean;
}

/** Aligned with engine_commands.rs SentinelStateResponse */
export interface SentinelEngineState {
  health: string;
  alert_count: number;
  active_monitors: number;
  protection_level: number;
  last_check_ms: number;
  initialized: boolean;
}

// ─────────────────────────────────────────────────────────────────
// 17.2.0 ADDITIONS - Enhanced Type Definitions
// ─────────────────────────────────────────────────────────────────

/**
 * Standard Tauri command response structure
 */
export interface TauriResponse<T = any> {
  ok: boolean;
  content?: T;
  error?: string;
}

/**
 * System information response
 */
export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  memory: {
    total: number;
    free: number;
  };
  cpu: {
    cores: number;
    model: string;
  };
}

/**
 * System status response
 */
export interface SystemStatus {
  helios: {
    cpu: number;
    memory: number;
    disk: number;
  };
  nexus: {
    modules: string[];
    coherence: number;
  };
  harmonia: {
    balance: number;
    flows: number;
  };
  sentinel: {
    alerts: number;
    integrity: number;
  };
}

/**
 * System health response
 */
export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  modules: Record<string, 'healthy' | 'degraded' | 'critical'>;
  score: number;
}

/**
 * System metrics response
 */
export interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytes_sent: number;
    bytes_recv: number;
  };
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  message: string;
  data?: any;
}

/**
 * Log filter options
 */
export interface LogFilter {
  level?: 'debug' | 'info' | 'warn' | 'error';
  module?: string;
  from?: number;
  to?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────
// CHAT & AI TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Chat history entry
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    response_time?: number;
  };
}

/**
 * Chat history response
 */
export interface ChatHistory {
  messages: ChatMessage[];
  total: number;
  has_more: boolean;
}

/**
 * Chat history filter
 */
export interface ChatHistoryFilter {
  limit?: number;
  offset?: number;
  from?: number;
  to?: number;
  role?: 'user' | 'assistant' | 'system';
}

/**
 * Chat settings
 */
export interface ChatSettings {
  model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  system_prompt: string;
}

/**
 * AI model settings
 */
export interface AiSettings {
  models: string[];
  default_model: string;
  model_config: Record<string, any>;
}

/**
 * Persona configuration
 */
export interface PersonaSettings {
  active_persona: string;
  personas: Record<string, PersonaConfig>;
}

export interface PersonaConfig {
  name: string;
  description: string;
  system_prompt: string;
  personality: Record<string, any>;
}

/**
 * Ollama server status
 */
export interface OllamaStatus {
  connected: boolean;
  version?: string;
  models: string[];
  health: 'healthy' | 'degraded' | 'offline';
  error?: string;
}

// ─────────────────────────────────────────────────────────────────
// AUDIO & TTS TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Audio system status
 */
export interface AudioStatus {
  available: boolean;
  devices: AudioDevice[];
  default_input?: string;
  default_output?: string;
  error?: string;
}

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output';
  is_default: boolean;
  sample_rate: number;
  channels: number;
}

/**
 * TTS status
 */
export interface TtsStatus {
  available: boolean;
  voices: TtsVoice[];
  default_voice?: string;
  speaking: boolean;
  error?: string;
}

export interface TtsVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female';
  description?: string;
}

/**
 * TTS configuration
 */
export interface TtsConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────
// FILE & STORAGE TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * File information
 */
export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: 'file' | 'directory';
  modified: number;
  created: number;
  permissions: string;
  is_hidden: boolean;
}

/**
 * Directory contents
 */
export interface DirectoryContents {
  path: string;
  files: FileInfo[];
  directories: FileInfo[];
  total_files: number;
  total_size: number;
}

/**
 * Storage information
 */
export interface StorageInfo {
  total: number;
  used: number;
  free: number;
  filesystem: string;
  mount_point: string;
  type: string;
}

/**
 * File permissions
 */
export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  owner: string;
  group: string;
  mode: string;
}

// ─────────────────────────────────────────────────────────────────
// NETWORK & COMMUNICATION TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Network status
 */
export interface NetworkStatus {
  connected: boolean;
  interfaces: NetworkInterface[];
  default_gateway?: string;
  dns_servers: string[];
  error?: string;
}

export interface NetworkInterface {
  name: string;
  ip: string;
  netmask: string;
  mac?: string;
  speed?: number;
  status: 'up' | 'down';
}

/**
 * Proxy settings
 */
export interface ProxySettings {
  enabled: boolean;
  type: 'http' | 'https' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  bypass_hosts: string[];
}

/**
 * API endpoint status
 */
export interface ApiStatus {
  endpoint: string;
  status: 'online' | 'offline' | 'degraded';
  response_time: number;
  last_check: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION & SETTINGS TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Application settings
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  startup: {
    auto_start: boolean;
    minimize_to_tray: boolean;
    check_updates: boolean;
  };
  performance: {
    max_memory: number;
    max_cpu: number;
    background_sync: boolean;
  };
}

/**
 * User preferences
 */
export interface UserPreferences {
  interface: {
    font_size: number;
    animations: boolean;
    compact_mode: boolean;
  };
  behavior: {
    confirm_exit: boolean;
    auto_save: boolean;
    backup_interval: number;
  };
  privacy: {
    telemetry: boolean;
    crash_reports: boolean;
    usage_stats: boolean;
  };
}

/**
 * Theme configuration
 */
export interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  custom_css?: string;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  encryption: {
    enabled: boolean;
    algorithm: string;
    key_size: number;
  };
  authentication: {
    enabled: boolean;
    method: 'password' | 'biometric' | 'none';
    timeout: number;
  };
  privacy: {
    data_retention: number;
    auto_cleanup: boolean;
    secure_delete: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────
// PAGINATION & FILTER TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination response
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────
// ERROR HANDLING TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Standardized error response
 */
export interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
    module?: string;
  };
}

/**
 * Error codes
 */
export const ERROR_CODES = {
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Module errors
  MODULE_OFFLINE: 'MODULE_OFFLINE',
  MODULE_TIMEOUT: 'MODULE_TIMEOUT',
  MODULE_ERROR: 'MODULE_ERROR',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  INVALID_URL: 'INVALID_URL',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // File errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_PERMISSION: 'FILE_PERMISSION',
  FILE_CORRUPTED: 'FILE_CORRUPTED',

  // Configuration errors
  CONFIG_ERROR: 'CONFIG_ERROR',
  INVALID_CONFIG: 'INVALID_CONFIG',
  CONFIG_MISSING: 'CONFIG_MISSING',
} as const;

// ─────────────────────────────────────────────────────────────────
// REAL-TIME UPDATE TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Real-time update event
 */
export interface UpdateEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}

/**
 * System update event
 */
export interface SystemUpdateEvent {
  type: 'system_status' | 'module_health' | 'performance_metrics';
  data: SystemStatus | SystemHealth | SystemMetrics;
}

/**
 * Chat update event
 */
export interface ChatUpdateEvent {
  type: 'new_message' | 'message_update' | 'typing_indicator';
  data: ChatMessage | { message_id: string; content: string } | { is_typing: boolean };
}

/**
 * Audio update event
 */
export interface AudioUpdateEvent {
  type: 'device_change' | 'volume_change' | 'recording_status';
  data: { devices: AudioDevice[] } | { volume: number } | { recording: boolean };
}

// ─────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────

/**
 * Deep partial type for optional updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Pick specific properties from a type
 */
export type PickProperties<T, K extends keyof T> = Pick<T, K>;

/**
 * Omit specific properties from a type
 */
export type OmitProperties<T, K extends keyof T> = Omit<T, K>;

/**
 * Union type for all module names
 */
export type ModuleName =
  | 'helios'
  | 'nexus'
  | 'harmonia'
  | 'sentinel'
  | 'chat'
  | 'audio'
  | 'file'
  | 'network'
  | 'config';

/**
 * Union type for all command names
 */
export type CommandName =
  | 'get_system_info'
  | 'get_system_status'
  | 'get_system_health'
  | 'get_system_metrics'
  | 'get_system_logs'
  | 'get_helios_state'
  | 'get_cpu_usage'
  | 'get_memory_usage'
  | 'get_disk_usage'
  | 'get_nexus_state'
  | 'get_module_status'
  | 'get_coherence_score'
  | 'get_harmonia_state'
  | 'get_balance_score'
  | 'get_stabilization_level'
  | 'get_sentinel_state'
  | 'get_security_alerts'
  | 'get_integrity_score'
  | 'get_chat_history'
  | 'get_chat_settings'
  | 'get_ai_settings'
  | 'get_persona_settings'
  | 'get_ollama_status'
  | 'get_audio_status'
  | 'get_tts_status'
  | 'get_audio_devices'
  | 'get_tts_voices'
  | 'get_file_info'
  | 'get_directory_contents'
  | 'get_storage_info'
  | 'get_file_permissions'
  | 'get_network_status'
  | 'get_proxy_settings'
  | 'get_api_status'
  | 'get_app_settings'
  | 'get_user_preferences'
  | 'get_theme_settings'
  | 'get_security_settings';

// ─────────────────────────────────────────────────────────────────
// COMMAND TYPE MAPPINGS
// ─────────────────────────────────────────────────────────────────

/**
 * Command response type mapping
 */
export interface CommandResponseMap {
  get_system_info: SystemInfo;
  get_system_status: SystemStatus;
  get_system_health: SystemHealth;
  get_system_metrics: SystemMetrics;
  get_system_logs: PaginationResponse<LogEntry>;
  get_helios_state: HeliosState;
  get_cpu_usage: { usage: number; load: number[]; cores: number };
  get_memory_usage: {
    used: number;
    total: number;
    percentage: number;
    available: number;
  };
  get_disk_usage: { used: number; total: number; percentage: number; free: number };
  get_nexus_state: NexusState;
  get_module_status: ModuleStatus;
  get_coherence_score: { score: number };
  get_harmonia_state: HarmoniaState;
  get_balance_score: { score: number };
  get_stabilization_level: { level: StabilizationLevel };
  get_sentinel_state: SentinelState;
  get_security_alerts: Alert[];
  get_integrity_score: { score: number };
  get_chat_history: ChatHistory;
  get_chat_settings: ChatSettings;
  get_ai_settings: AiSettings;
  get_persona_settings: PersonaSettings;
  get_ollama_status: OllamaStatus;
  get_audio_status: AudioStatus;
  get_tts_status: TtsStatus;
  get_audio_devices: AudioDevice[];
  get_tts_voices: TtsVoice[];
  get_file_info: FileInfo;
  get_directory_contents: DirectoryContents;
  get_storage_info: StorageInfo[];
  get_file_permissions: FilePermissions;
  get_network_status: NetworkStatus;
  get_proxy_settings: ProxySettings;
  get_api_status: ApiStatus[];
  get_app_settings: AppSettings;
  get_user_preferences: UserPreferences;
  get_theme_settings: ThemeSettings;
  get_security_settings: SecuritySettings;
}

/**
 * Command parameter type mapping
 */
export interface CommandParamsMap {
  get_system_info: {};
  get_system_status: {};
  get_system_health: {};
  get_system_metrics: {};
  get_system_logs: LogFilter;
  get_helios_state: {};
  get_cpu_usage: {};
  get_memory_usage: {};
  get_disk_usage: {};
  get_nexus_state: {};
  get_module_status: { module: string };
  get_coherence_score: {};
  get_harmonia_state: {};
  get_balance_score: {};
  get_stabilization_level: {};
  get_sentinel_state: {};
  get_security_alerts: { severity?: Severity; limit?: number };
  get_integrity_score: {};
  get_chat_history: ChatHistoryFilter;
  get_chat_settings: {};
  get_ai_settings: {};
  get_persona_settings: {};
  get_ollama_status: {};
  get_audio_status: {};
  get_tts_status: {};
  get_audio_devices: {};
  get_tts_voices: {};
  get_file_info: { path: string };
  get_directory_contents: { path: string; recursive?: boolean };
  get_storage_info: {};
  get_file_permissions: { path: string };
  get_network_status: {};
  get_proxy_settings: {};
  get_api_status: { endpoints?: string[] };
  get_app_settings: {};
  get_user_preferences: {};
  get_theme_settings: {};
  get_security_settings: {};
}

// ─────────────────────────────────────────────────────────────────
// TYPE GUARDS
// ─────────────────────────────────────────────────────────────────

/**
 * Type guard for TauriResponse
 */
export function isTauriResponse<T>(obj: any): obj is TauriResponse<T> {
  return obj && typeof obj === 'object' && 'ok' in obj;
}

/**
 * Type guard for ErrorResponse
 */
export function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj && typeof obj === 'object' && obj.ok === false && 'error' in obj;
}

/**
 * Type guard for SystemInfo
 */
export function isSystemInfo(obj: any): obj is SystemInfo {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.platform === 'string' &&
    typeof obj.arch === 'string'
  );
}

/**
 * Type guard for ChatMessage
 */
export function isChatMessage(obj: any): obj is ChatMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    ['user', 'assistant', 'system'].includes(obj.role) &&
    typeof obj.content === 'string'
  );
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

// Note: Types are already declared above, so we don't need to re-export them here
// to avoid duplicate export errors. The types are available from the module directly.

// ─────────────────────────────────────────────────────────────────
// BACKWARD COMPATIBILITY
// ─────────────────────────────────────────────────────────────────

/**
 * Legacy type aliases for backward compatibility
 */
export type SystemInfoResponse = SystemInfo;
export type SystemStatusResponse = SystemStatus;
export type SystemHealthResponse = SystemHealth;
export type SystemMetricsResponse = SystemMetrics;
export type LogEntryResponse = LogEntry;
export type ChatHistoryResponse = ChatHistory;
export type ChatSettingsResponse = ChatSettings;
export type AudioStatusResponse = AudioStatus;
export type TtsStatusResponse = TtsStatus;

// ─────────────────────────────────────────────────────────────────
// VERSION INFORMATION
// ─────────────────────────────────────────────────────────────────

/**
 * Backend types version information
 */
export const BACKEND_TYPES_VERSION = '17.2.0';
export const BACKEND_TYPES_DATE = '2025-12-15';

/**
 * Type compatibility check
 */
export function checkTypeCompatibility(version: string): boolean {
  // Simple version check - could be enhanced for semantic versioning
  return version === BACKEND_TYPES_VERSION;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface CommandError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
