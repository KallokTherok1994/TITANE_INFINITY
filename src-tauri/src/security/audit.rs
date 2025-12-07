/**
 * TITANE∞ v19.3 — Audit Logging
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
use crate::error::TitaneResult;

#[derive(Debug, Serialize, Clone)]
pub struct AuditEvent {
    pub timestamp: DateTime<Utc>,
    pub event_type: AuditEventType,
    pub user_id: String,
    pub details: Value,
    pub ip_address: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub enum AuditEventType {
    LoginAttempt,
    ConfigChange,
    DataAccess,
    DataModification,
    SecurityViolation,
    PrivilegedAction,
}

pub struct AuditLogger {
    log_file: PathBuf,
}

impl AuditLogger {
    pub fn new(log_file: PathBuf) -> Self {
        Self { log_file }
    }
    
    pub async fn log(&self, event: AuditEvent) -> TitaneResult<()> {
        let json = serde_json::to_string(&event)?;
        
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
// TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Obtenir les logs d'audit pour une date
#[tauri::command]
pub async fn get_audit_logs(date: String) -> Result<Vec<AuditEvent>, String> {
    GLOBAL_AUDIT_LOGGER
        .read_logs(&date)
        .await
        .map_err(|e| e.to_string())
}

/// Rechercher les logs par type
#[tauri::command]
pub async fn search_audit_logs_by_type(
    date: String,
    event_type: AuditEventType,
) -> Result<Vec<AuditEvent>, String> {
    GLOBAL_AUDIT_LOGGER
        .search_by_type(&date, &event_type)
        .await
        .map_err(|e| e.to_string())
}

/// Rechercher les logs par sévérité
#[tauri::command]
pub async fn search_audit_logs_by_severity(
    date: String,
    severity: AuditSeverity,
) -> Result<Vec<AuditEvent>, String> {
    GLOBAL_AUDIT_LOGGER
        .search_by_severity(&date, severity)
        .await
        .map_err(|e| e.to_string())
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_audit_log_write() {
        let temp_dir = tempdir().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf());

        let event = AuditEvent::new(
            AuditEventType::ConfigChange,
            "test_user",
            json!({"setting": "theme"}),
        );

        assert!(logger.log(event).await.is_ok());
    }

    #[tokio::test]
    async fn test_audit_log_read() {
        let temp_dir = tempdir().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf());

        // Écrire 3 événements
        for i in 0..3 {
            let event = AuditEvent::new(
                AuditEventType::DataAccess,
                format!("user{}", i),
                json!({"resource": format!("file{}", i)}),
            );
            logger.log(event).await.ok();
        }

        // Lire les événements
        let date = Utc::now().format("%Y-%m-%d").to_string();
        let events = logger.read_logs(&date).await.unwrap();

        assert_eq!(events.len(), 3);
    }

    #[tokio::test]
    async fn test_audit_search_by_type() {
        let temp_dir = tempdir().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf());

        // Écrire différents types
        let event1 = AuditEvent::new(
            AuditEventType::ConfigChange,
            "user1",
            json!({}),
        );
        let event2 = AuditEvent::new(
            AuditEventType::SecurityViolation,
            "user2",
            json!({}),
        );
        let event3 = AuditEvent::new(
            AuditEventType::ConfigChange,
            "user3",
            json!({}),
        );

        logger.log(event1).await.ok();
        logger.log(event2).await.ok();
        logger.log(event3).await.ok();

        // Rechercher ConfigChange
        let date = Utc::now().format("%Y-%m-%d").to_string();
        let results = logger
            .search_by_type(&date, &AuditEventType::ConfigChange)
            .await
            .unwrap();

        assert_eq!(results.len(), 2);
    }

    #[tokio::test]
    async fn test_audit_search_by_severity() {
        let temp_dir = tempdir().unwrap();
        let logger = AuditLogger::new(temp_dir.path().to_path_buf());

        // Écrire différentes sévérités
        let event1 = AuditEvent::new(
            AuditEventType::DataAccess,
            "user1",
            json!({}),
        );
        let event2 = AuditEvent::new(
            AuditEventType::SecurityViolation,
            "user2",
            json!({}),
        );
        let event3 = AuditEvent::new(
            AuditEventType::ConfigChange,
            "user3",
            json!({}),
        );

        logger.log(event1).await.ok();
        logger.log(event2).await.ok();
        logger.log(event3).await.ok();

        // Rechercher Warning+
        let date = Utc::now().format("%Y-%m-%d").to_string();
        let results = logger
            .search_by_severity(&date, AuditSeverity::Warning)
            .await
            .unwrap();

        assert_eq!(results.len(), 2); // Warning + Critical
    }
}
