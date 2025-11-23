// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — UTILS: LOGGING SYSTEM
//   Unified, Simple, Controlled Logging
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // Logging infrastructure - used by monitoring

use chrono::Local;
use tokio::sync::Mutex;
use std::sync::OnceLock;

static LOG_BUFFER: OnceLock<Mutex<Vec<String>>> = OnceLock::new();

fn get_log_buffer() -> &'static Mutex<Vec<String>> {
    LOG_BUFFER.get_or_init(|| Mutex::new(Vec::new()))
}
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
    tokio::spawn(async move {
        let mut buffer = get_log_buffer().lock().await;
        if buffer.len() >= MAX_BUFFER_SIZE {
            buffer.remove(0);
        }
        buffer.push(message);
    });
}

/// Retrieve recent logs
pub async fn get_recent_logs(count: usize) -> Vec<String> {
    let buffer = get_log_buffer().lock().await;
    let start = buffer.len().saturating_sub(count);
    buffer[start..].to_vec()
}

/// Clear log buffer
pub async fn clear_logs() {
    let mut buffer = get_log_buffer().lock().await;
    buffer.clear();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_logging() {
        clear_logs().await;
        log_info("test", "info message");
        log_warn("test", "warn message");
        log_error("test", "error message");

        // Wait a bit for async spawn to complete
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

        let logs = get_recent_logs(10).await;
        assert_eq!(logs.len(), 3);
    }
}
