// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v12.0 - System Type Definitions                                     ║
// ║ TypeScript interfaces matching Rust backend structures                      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ═════════════════════════════════════════════════════════════════════════════
// HEALTH STATUS TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Module health status enumeration
 * Matches Rust enum HealthStatus in shared/types.rs
 */
export type HealthStatus = 'Healthy' | 'Degraded' | 'Critical' | 'Offline';

/**
 * Module health information structure
 * Matches Rust struct ModuleHealth in shared/types.rs
 */
export interface ModuleHealth {
  /** Module name (e.g., "Helios", "Nexus", "Memory") */
  name: string;

  /** Current health status */
  status: HealthStatus;

  /** Uptime in milliseconds since module initialization */
  uptime: number;

  /** Timestamp of last tick in milliseconds */
  last_tick: number;

  /** Human-readable status message with metrics */
  message: string;
}

/**
 * System-wide status containing all module health data
 */
export interface SystemStatus {
  /** Array of health status for each of the 8 core modules */
  modules: ModuleHealth[];

  /** System uptime in seconds */
  uptime: number;

  /** Overall system status */
  status: 'operational' | 'degraded' | 'critical';

  /** Timestamp of status generation */
  timestamp: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// HELIOS MODULE TYPES (System Monitoring)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * System metrics from Helios module
 * Matches Rust struct SystemMetrics in shared/types.rs
 */
export interface HeliosMetrics {
  /** CPU usage percentage (0.0 - 100.0) */
  cpu_usage: number;

  /** Memory usage percentage (0.0 - 100.0) */
  memory_usage: number;

  /** Disk usage percentage (0.0 - 100.0) */
  disk_usage: number;

  /** System uptime in milliseconds */
  uptime: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// NEXUS MODULE TYPES (Cognitive Graph)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Cognitive node in the Nexus graph
 * Matches Rust struct CognitiveNode in shared/types.rs
 */
export interface CognitiveNode {
  /** Unique node identifier */
  id: string;

  /** Node type classification (e.g., "core", "sensor", "effector") */
  node_type: string;

  /** Array of connected node IDs */
  connections: string[];

  /** Node importance weight (0.0 - 1.0) */
  weight: number;
}

/**
 * Complete cognitive graph structure
 */
export interface NexusGraph {
  /** Array of all cognitive nodes */
  nodes: CognitiveNode[];

  /** Total number of connections in the graph */
  connections: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// HARMONIA MODULE TYPES (System Balance)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Harmonia flow and balance data
 */
export interface HarmoniaFlows {
  /** Harmonic balance coefficient (0.0 - 1.0) */
  harmonic_balance: number;

  /** Resonance level percentage (0.0 - 100.0) */
  resonance_level: number;

  /** System load (0.0 - 1.0) */
  system_load: number;

  /** Overall stability score (0.0 - 100.0) */
  stability: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// SENTINEL MODULE TYPES (Security Monitoring)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Security alerts and integrity data from Sentinel
 */
export interface SentinelAlerts {
  /** Number of security alerts detected */
  alert_count: number;

  /** System integrity score (0.0 - 100.0) */
  integrity_score: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// WATCHDOG MODULE TYPES (Health Monitoring)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Watchdog monitoring data
 */
export interface WatchdogData {
  /** Number of missed ticks */
  tick_misses: number;

  /** Overall module health score (0.0 - 100.0) */
  module_health: number;

  /** Timestamp of last health check */
  last_check: number;
}

/**
 * Log level enumeration
 * Matches Rust enum LogLevel in shared/types.rs
 */
export type LogLevel = 'Info' | 'Warning' | 'Error';

/**
 * Individual log entry
 * Matches Rust struct LogEntry in shared/types.rs
 */
export interface LogEntry {
  /** Timestamp in milliseconds */
  timestamp: number;

  /** Log severity level */
  level: LogLevel;

  /** Source module name */
  module: string;

  /** Log message content */
  message: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// SELFHEAL MODULE TYPES (Auto-Recovery)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * SelfHeal repair statistics
 */
export interface SelfHealData {
  /** Total number of successful repairs */
  corrections_applied: number;

  /** Total number of anomalies detected */
  anomalies_detected: number;

  /** Repair success rate percentage (0.0 - 100.0) */
  heal_efficiency: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// ADAPTIVE ENGINE TYPES (Optimization)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AdaptiveEngine optimization metrics
 */
export interface AdaptiveData {
  /** Adaptability coefficient (0.0 - 1.0) */
  adaptability: number;

  /** System stability score (0.0 - 100.0) */
  stability: number;

  /** Performance trend indicator (-1.0 = degrading, +1.0 = improving) */
  trend: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// MEMORY MODULE TYPES (Encrypted Storage)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Individual memory entry
 * Matches Rust struct MemoryEntry in memory/types.rs
 */
export interface MemoryEntry {
  /** Unique entry identifier */
  id: string;

  /** Encrypted entry content */
  content: string;

  /** Creation timestamp in milliseconds */
  timestamp: number;
}

/**
 * Memory collection with metadata
 * Matches Rust struct MemoryCollection in memory/types.rs
 */
export interface MemoryCollection {
  /** Array of memory entries */
  entries: MemoryEntry[];

  /** Collection version number */
  version: number;

  /** Creation timestamp */
  created_at: number;

  /** Last update timestamp */
  updated_at: number;
}

/**
 * Memory system state
 * Matches Rust struct MemoryState in memory/mod.rs
 */
export interface MemoryState {
  /** Whether the memory system is initialized */
  initialized: boolean;

  /** Number of stored entries */
  entries_count: number;

  /** SHA-256 checksum of current data */
  checksum: string;

  /** Last update timestamp in milliseconds */
  last_update: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data?: T;

  /** Error message if request failed */
  error?: string;

  /** Response timestamp */
  timestamp: number;
}

/**
 * Color scheme for health status visualization
 */
export declare const HEALTH_STATUS_COLORS: Record<HealthStatus, string>;

/**
 * Icon names for each module (matches Icons.tsx)
 */
export declare const MODULE_ICONS: Record<string, string>;
