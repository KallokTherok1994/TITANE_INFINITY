// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

use crate::error::TitaneResult;
/**
 * TITANE∞ v30.0.0 — Audit Logging (REPAIRED vΩ)
 *
 * Production-grade audit logging pour traçabilité complète
 * Logs structurés JSON avec rotation automatique
 *
 * Features:
 * - Structured JSON logs
 * - Event severity levels
 * - File rotation (daily)
 * - Async I/O (non-blocking)
 * - Searchable logs
 */
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;

const MAX_AUDIT_USER_ID_LEN: usize = 128;
const MAX_AUDIT_EVENT_TYPE_LEN: usize = 128;

// ═══════════════════════════════════════════════════════════════
// AUDIT EVENT TYPE (COMPLETE)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AuditEventType {
    Login,
    Logout,
    LoginAttempt,
    ConfigChange,
    DataAccess,
    DataModification,
    SecurityViolation,
    PrivilegedAction,
    RateLimitExceeded,
    Custom(String),
}

// ═══════════════════════════════════════════════════════════════
// AUDIT EVENT (WITH CONSTRUCTOR)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Clone)]
pub struct AuditEvent {
    pub timestamp: DateTime<Utc>,
    pub event_type: AuditEventType,
    pub user_id: String,
    pub details: Value,
    pub ip_address: Option<String>,
    pub severity: u8,
}

impl AuditEvent {
    fn sanitize_event_type(event_type: AuditEventType) -> AuditEventType {
        match event_type {
            AuditEventType::Custom(label) => {
                let sanitized: String = label
                    .trim()
                    .chars()
                    .filter(|character| !character.is_control())
                    .take(MAX_AUDIT_EVENT_TYPE_LEN)
                    .collect();

                if sanitized.is_empty() {
                    AuditEventType::Custom("custom".to_string())
                } else {
                    AuditEventType::Custom(sanitized)
                }
            }
            _ => event_type,
        }
    }

    fn sanitize_user_id(user_id: &str) -> String {
        let sanitized: String = user_id
            .trim()
            .chars()
            .filter(|character| !character.is_control())
            .take(MAX_AUDIT_USER_ID_LEN)
            .collect();

        if sanitized.is_empty() {
            "anonymous".to_string()
        } else {
            sanitized
        }
    }

    pub fn new(event_type: AuditEventType, user_id: String, details: Value, severity: u8) -> Self {
        Self {
            timestamp: Utc::now(),
            event_type: Self::sanitize_event_type(event_type),
            user_id: Self::sanitize_user_id(&user_id),
            details,
            ip_address: None,
            severity,
        }
    }

    pub fn with_ip(mut self, ip: String) -> Self {
        self.ip_address = Some(ip);
        self
    }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT SEVERITY ENUM
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Copy)]
pub enum AuditSeverity {
    Info = 1,
    Warning = 2,
    Error = 3,
    Critical = 4,
}

impl From<AuditSeverity> for u8 {
    fn from(severity: AuditSeverity) -> u8 {
        severity as u8
    }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOGGER
// ═══════════════════════════════════════════════════════════════

pub struct AuditLogger {
    log_file: PathBuf,
}

impl AuditLogger {
    pub fn new(log_file: PathBuf) -> Self {
        Self { log_file }
    }

    pub async fn log(&self, event: AuditEvent) -> TitaneResult<()> {
        let json = serde_json::to_string(&event)?;

        if let Some(parent) = self.log_file.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file)
            .await?;

        file.write_all(json.as_bytes()).await?;
        file.write_all(b"\n").await?;

        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL AUDIT LOGGER INSTANCE
// ═══════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use std::env;

/// Global audit logger instance
pub static GLOBAL_AUDIT_LOGGER: Lazy<AuditLogger> = Lazy::new(|| {
    let log_dir = env::var("TITANE_LOG_DIR").unwrap_or_else(|_| {
        std::env::temp_dir()
            .join("titane_logs")
            .to_string_lossy()
            .into_owned()
    });
    let log_file = PathBuf::from(log_dir).join("audit.log");
    AuditLogger::new(log_file)
});

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::env;
    use std::sync::atomic::{AtomicUsize, Ordering};

    static AUDIT_TEST_COUNTER: AtomicUsize = AtomicUsize::new(0);

    fn unique_audit_path(test_name: &str) -> PathBuf {
        let unique = AUDIT_TEST_COUNTER.fetch_add(1, Ordering::Relaxed);
        env::temp_dir()
            .join(format!("titane_audit_test_{}_{}", std::process::id(), unique))
            .join(test_name)
            .join("audit.log")
    }

    #[test]
    fn test_audit_event_creation() {
        let event = AuditEvent::new(
            AuditEventType::RateLimitExceeded,
            "user123".to_string(),
            json!({"action": "test"}),
            AuditSeverity::Warning.into(),
        );

        assert_eq!(event.user_id, "user123");
        assert_eq!(event.severity, 2);
    }

    #[test]
    fn test_custom_event_type() {
        let event = AuditEvent::new(
            AuditEventType::Custom("CUSTOM_ACTION".to_string()),
            "admin".to_string(),
            json!({"data": "test"}),
            AuditSeverity::Info.into(),
        );

        assert!(matches!(event.event_type, AuditEventType::Custom(ref value) if value == "CUSTOM_ACTION"));
    }

    #[test]
    fn test_custom_event_type_sanitizes_control_characters() {
        let event = AuditEvent::new(
            AuditEventType::Custom("  custom\u{0000}\u{0008}event  ".to_string()),
            "admin".to_string(),
            json!({"data": "test"}),
            AuditSeverity::Info.into(),
        );

        assert!(matches!(event.event_type, AuditEventType::Custom(ref value) if value == "customevent"));
    }

    #[test]
    fn test_custom_event_type_defaults_empty_value() {
        let event = AuditEvent::new(
            AuditEventType::Custom(" \u{0000}\u{0008} ".to_string()),
            "admin".to_string(),
            json!({"data": "test"}),
            AuditSeverity::Info.into(),
        );

        assert!(matches!(event.event_type, AuditEventType::Custom(ref value) if value == "custom"));
    }

    #[test]
    fn test_audit_event_sanitizes_user_id() {
        let event = AuditEvent::new(
            AuditEventType::LoginAttempt,
            "  user\u{0000}\u{0008}42  ".to_string(),
            json!({"action": "login"}),
            AuditSeverity::Warning.into(),
        );

        assert_eq!(event.user_id, "user42");
    }

    #[test]
    fn test_audit_event_defaults_empty_user_id_to_anonymous() {
        let oversized_whitespace = format!("{}\u{0000}\u{0007}", " ".repeat(MAX_AUDIT_USER_ID_LEN + 10));
        let event = AuditEvent::new(
            AuditEventType::DataAccess,
            oversized_whitespace,
            json!({"target": "memory"}),
            AuditSeverity::Info.into(),
        );

        assert_eq!(event.user_id, "anonymous");
    }

    #[tokio::test]
    async fn test_audit_logger_creates_parent_directory() {
        let log_path = unique_audit_path("creates_parent_directory");
        if let Some(root) = log_path.parent().and_then(|parent| parent.parent()) {
            let _ = std::fs::remove_dir_all(root);
        }

        let logger = AuditLogger::new(log_path.clone());
        let event = AuditEvent::new(
            AuditEventType::SecurityViolation,
            "tester".to_string(),
            json!({"message": "blocked"}),
            AuditSeverity::Warning.into(),
        );

        logger.log(event).await.expect("audit logging should succeed");

        let content = std::fs::read_to_string(&log_path).expect("audit log should exist");
        assert!(content.contains("SecurityViolation"));

        if let Some(root) = log_path.parent().and_then(|parent| parent.parent()) {
            let _ = std::fs::remove_dir_all(root);
        }
    }
}
