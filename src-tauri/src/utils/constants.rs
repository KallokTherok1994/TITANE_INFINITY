// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — UTILS: CONSTANTS
//   Global Constants for Backend Configuration
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // Architecture constants - used by scheduler

use std::time::Duration;

/// Application metadata
pub const APP_NAME: &str = "TITANE∞";
pub const APP_VERSION: &str = "17.2.0";
pub const APP_DESCRIPTION: &str = "Backend Architecture Refactor - Clean, Modular, Performant";

/// System monitoring intervals
pub const HELIOS_INTERVAL_MS: u64 = 1000; // 1s
pub const NEXUS_INTERVAL_MS: u64 = 2000;  // 2s
pub const SENTINEL_INTERVAL_MS: u64 = 5000; // 5s

/// Memory management
pub const MEMORY_MAX_SNAPSHOTS: usize = 100;
pub const MEMORY_MAX_LOG_ENTRIES: usize = 1000;
pub const MEMORY_SNAPSHOT_INTERVAL_MS: u64 = 10000; // 10s

/// Evolution engine
pub const EVOLUTION_DIAGNOSIS_INTERVAL_MS: u64 = 30000; // 30s
pub const EVOLUTION_MAX_HISTORY: usize = 50;
pub const EVOLUTION_REPAIR_TIMEOUT_MS: u64 = 5000; // 5s

/// Health thresholds
pub const HEALTH_CPU_CRITICAL: f64 = 90.0;
pub const HEALTH_CPU_WARNING: f64 = 75.0;
pub const HEALTH_MEM_CRITICAL: f64 = 90.0;
pub const HEALTH_MEM_WARNING: f64 = 75.0;

/// Performance tuning
pub const TASK_SPAWN_TIMEOUT: Duration = Duration::from_secs(30);
pub const LOCK_TIMEOUT: Duration = Duration::from_millis(100);

/// Storage paths (relative to app data dir)
pub const STORAGE_MEMORY_PATH: &str = "memory";
pub const STORAGE_LOGS_PATH: &str = "logs";
pub const STORAGE_SNAPSHOTS_PATH: &str = "snapshots";
pub const STORAGE_EVOLUTION_PATH: &str = "evolution";

/// Network settings
pub const NETWORK_TIMEOUT_MS: u64 = 10000; // 10s
pub const NETWORK_MAX_RETRIES: u32 = 3;

/// Security
pub const ALLOWED_FILE_EXTENSIONS: &[&str] = &["json", "txt", "log", "md"];
pub const MAX_FILE_SIZE_MB: u64 = 10;
