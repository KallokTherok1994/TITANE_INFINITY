//! TITANE∞ v∞ — System Center: Logs
//!
//! Commandes Tauri pour les logs système :
//! - Get recent logs
//! - Stream logs (via events)
//! - Filter by level/source
//!
//! © 2025 TITANE Team. All rights reserved.

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use once_cell::sync::Lazy;

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LogLevel::Trace => write!(f, "TRACE"),
            LogLevel::Debug => write!(f, "DEBUG"),
            LogLevel::Info => write!(f, "INFO"),
            LogLevel::Warn => write!(f, "WARN"),
            LogLevel::Error => write!(f, "ERROR"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: String,
    pub timestamp: u64,
    pub level: LogLevel,
    pub source: String,
    pub message: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogFilter {
    pub level: Option<LogLevel>,
    pub source: Option<String>,
    pub search: Option<String>,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogStats {
    pub total_entries: usize,
    pub by_level: std::collections::HashMap<String, usize>,
    pub by_source: std::collections::HashMap<String, usize>,
}

// ══════════════════════════════════════════════════════════════════
// LOG BUFFER (In-Memory Ring Buffer)
// ══════════════════════════════════════════════════════════════════

const MAX_LOG_ENTRIES: usize = 1000;

static LOG_BUFFER: Lazy<Arc<Mutex<VecDeque<LogEntry>>>> = Lazy::new(|| {
    Arc::new(Mutex::new(VecDeque::with_capacity(MAX_LOG_ENTRIES)))
});

static LOG_COUNTER: Lazy<Arc<Mutex<u64>>> = Lazy::new(|| Arc::new(Mutex::new(0)));

/// Add a log entry to the buffer
pub fn add_log_entry(level: LogLevel, source: &str, message: &str, metadata: Option<serde_json::Value>) {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);

    let id = {
        match LOG_COUNTER.lock() {
            Ok(mut counter) => {
                *counter += 1;
                format!("log_{}", *counter)
            }
            Err(_) => format!("log_err_{}", timestamp)
        }
    };

    let entry = LogEntry {
        id,
        timestamp,
        level,
        source: source.to_string(),
        message: message.to_string(),
        metadata,
    };

    if let Ok(mut buffer) = LOG_BUFFER.lock() {
        if buffer.len() >= MAX_LOG_ENTRIES {
            buffer.pop_front();
        }
        buffer.push_back(entry);
    }
}

/// Helper macros for logging
#[macro_export]
macro_rules! sc_log {
    ($level:expr, $source:expr, $($arg:tt)*) => {
        $crate::system_center::logs::add_log_entry(
            $level,
            $source,
            &format!($($arg)*),
            None
        )
    };
}

#[macro_export]
macro_rules! sc_info {
    ($source:expr, $($arg:tt)*) => {
        $crate::sc_log!($crate::system_center::logs::LogLevel::Info, $source, $($arg)*)
    };
}

#[macro_export]
macro_rules! sc_warn {
    ($source:expr, $($arg:tt)*) => {
        $crate::sc_log!($crate::system_center::logs::LogLevel::Warn, $source, $($arg)*)
    };
}

#[macro_export]
macro_rules! sc_error {
    ($source:expr, $($arg:tt)*) => {
        $crate::sc_log!($crate::system_center::logs::LogLevel::Error, $source, $($arg)*)
    };
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

/// Get recent logs with optional filtering
#[tauri::command]
pub async fn sc_get_logs(filter: Option<LogFilter>) -> Result<Vec<LogEntry>, String> {
    let buffer = LOG_BUFFER.lock().unwrap();
    let mut logs: Vec<LogEntry> = buffer.iter().cloned().collect();

    // Apply filters if provided
    if let Some(f) = filter {
        if let Some(level) = f.level {
            logs.retain(|l| l.level == level);
        }

        if let Some(source) = f.source {
            logs.retain(|l| l.source.contains(&source));
        }

        if let Some(search) = f.search {
            let search_lower = search.to_lowercase();
            logs.retain(|l| l.message.to_lowercase().contains(&search_lower));
        }

        if let Some(limit) = f.limit {
            logs.truncate(limit);
        }
    }

    // Return most recent first
    logs.reverse();

    Ok(logs)
}

/// Get log statistics
#[tauri::command]
pub async fn sc_get_log_stats() -> Result<LogStats, String> {
    // Phase 1 Stabilisation: Gérer lock poison
    let buffer = match LOG_BUFFER.lock() {
        Ok(buf) => buf,
        Err(e) => {
            eprintln!("Warning: LOG_BUFFER lock poisoned in stats, recovering: {}", e);
            e.into_inner()
        }
    };

    let mut by_level: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    let mut by_source: std::collections::HashMap<String, usize> = std::collections::HashMap::new();

    for entry in buffer.iter() {
        *by_level.entry(entry.level.to_string()).or_insert(0) += 1;
        *by_source.entry(entry.source.clone()).or_insert(0) += 1;
    }

    Ok(LogStats {
        total_entries: buffer.len(),
        by_level,
        by_source,
    })
}

/// Clear all logs
#[tauri::command]
pub async fn sc_clear_logs() -> Result<(), String> {
    // Phase 1 Stabilisation: Gérer lock poison
    let mut buffer = match LOG_BUFFER.lock() {
        Ok(buf) => buf,
        Err(e) => {
            eprintln!("Warning: LOG_BUFFER lock poisoned, recovering: {}", e);
            e.into_inner()
        }
    };
    buffer.clear();
    Ok(())
}

/// Add a log entry from frontend
#[tauri::command]
pub async fn sc_add_log(
    level: String,
    source: String,
    message: String,
    metadata: Option<serde_json::Value>,
) -> Result<(), String> {
    let log_level = match level.to_lowercase().as_str() {
        "trace" => LogLevel::Trace,
        "debug" => LogLevel::Debug,
        "info" => LogLevel::Info,
        "warn" | "warning" => LogLevel::Warn,
        "error" => LogLevel::Error,
        _ => LogLevel::Info,
    };

    add_log_entry(log_level, &source, &message, metadata);
    Ok(())
}

// Initialize with some default logs
pub fn init_logs() {
    add_log_entry(
        LogLevel::Info,
        "SystemCenter",
        "System Center initialized",
        None,
    );
    add_log_entry(
        LogLevel::Info,
        "SystemCenter",
        "Log buffer ready (max 1000 entries)",
        Some(serde_json::json!({ "max_entries": MAX_LOG_ENTRIES })),
    );
}
