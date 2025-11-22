// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — UTILS: LOGGING SYSTEM
//   Unified, Simple, Controlled Logging
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // Logging infrastructure - used by monitoring

use chrono::Local;
use std::sync::Mutex;

static LOG_BUFFER: Mutex<Vec<String>> = Mutex::new(Vec::new());
const MAX_BUFFER_SIZE: usize = 1000;

/// Log info message
pub fn log_info(module: &str, message: &str) {
    let timestamp = Local::now().format("%H:%M:%S");
    let log_msg = format!("[{}] INFO  [{}] {}", timestamp, module, message);

    log::info!("{}", log_msg);
    store_log(log_msg);
}

/// Log warning message
pub fn log_warn(module: &str, message: &str) {
    let timestamp = Local::now().format("%H:%M:%S");
    let log_msg = format!("[{}] WARN  [{}] {}", timestamp, module, message);

    log::warn!("{}", log_msg);
    store_log(log_msg);
}

/// Log error message
pub fn log_error(module: &str, message: &str) {
    let timestamp = Local::now().format("%H:%M:%S");
    let log_msg = format!("[{}] ERROR [{}] {}", timestamp, module, message);

    log::error!("{}", log_msg);
    store_log(log_msg);
}

/// Store log in memory buffer (circular buffer)
fn store_log(message: String) {
    if let Ok(mut buffer) = LOG_BUFFER.lock() {
        if buffer.len() >= MAX_BUFFER_SIZE {
            buffer.remove(0);
        }
        buffer.push(message);
    }
}

/// Retrieve recent logs
pub fn get_recent_logs(count: usize) -> Vec<String> {
    LOG_BUFFER
        .lock()
        .map(|buffer| {
            let start = buffer.len().saturating_sub(count);
            buffer[start..].to_vec()
        })
        .unwrap_or_default()
}

/// Clear log buffer
pub fn clear_logs() {
    if let Ok(mut buffer) = LOG_BUFFER.lock() {
        buffer.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_logging() {
        clear_logs();
        log_info("test", "info message");
        log_warn("test", "warn message");
        log_error("test", "error message");

        let logs = get_recent_logs(10);
        assert_eq!(logs.len(), 3);
    }
}
