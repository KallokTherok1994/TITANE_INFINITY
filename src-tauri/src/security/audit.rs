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
use std::path::PathBuf;
use tokio::fs::OpenOptions;
use tokio::io::AsyncWriteExt;
use once_cell::sync::Lazy;
use tokio::sync::RwLock;

/// Type d'événement audité
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditEventType {
    /// Tentative de connexion
    LoginAttempt,
    /// Changement de configuration
    ConfigChange,
    /// Accès aux données
    DataAccess,
    /// Modification de données
    DataModification,
    /// Violation de sécurité
    SecurityViolation,
    /// Action privilégiée
    PrivilegedAction,
    /// Rate limit dépassé
    RateLimitExceeded,
    /// Erreur système
    SystemError,
    /// Événement personnalisé
    Custom(String),
}

/// Niveau de sévérité
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Ord, PartialOrd, Eq)]
pub enum AuditSeverity {
    /// Information
    Info,
    /// Avertissement
    Warning,
    /// Erreur critique
    Critical,
}

/// Événement d'audit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    /// Timestamp UTC
    pub timestamp: DateTime<Utc>,
    /// Type d'événement
    pub event_type: AuditEventType,
    /// Identifiant utilisateur (ou "system")
    pub user_id: String,
    /// Détails supplémentaires (JSON)
    pub details: serde_json::Value,
    /// Niveau de sévérité
    pub severity: AuditSeverity,
    /// IP address (optionnel)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ip_address: Option<String>,
    /// Module source
    #[serde(skip_serializing_if = "Option::is_none")]
    pub module: Option<String>,
}

impl AuditEvent {
    /// Créer un nouvel événement d'audit
    pub fn new(
        event_type: AuditEventType,
        user_id: impl Into<String>,
        details: serde_json::Value,
        severity: AuditSeverity,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            event_type,
            user_id: user_id.into(),
            details,
            severity,
            ip_address: None,
            module: None,
        }
    }

    /// Builder pattern: ajouter IP
    pub fn with_ip(mut self, ip: impl Into<String>) -> Self {
        self.ip_address = Some(ip.into());
        self
    }

    /// Builder pattern: ajouter module
    pub fn with_module(mut self, module: impl Into<String>) -> Self {
        self.module = Some(module.into());
        self
    }
}

/// Logger d'audit avec rotation de fichiers
pub struct AuditLogger {
    /// Répertoire des logs
    log_dir: PathBuf,
    /// Fichier actuel (cached)
    current_file: RwLock<Option<PathBuf>>,
}

impl AuditLogger {
    /// Créer un nouveau logger
    pub fn new(log_dir: PathBuf) -> Self {
        Self {
            log_dir,
            current_file: RwLock::new(None),
        }
    }

    /// Enregistrer un événement
    pub async fn log(&self, event: AuditEvent) -> Result<(), Box<dyn std::error::Error>> {
        // Créer le répertoire si nécessaire
        tokio::fs::create_dir_all(&self.log_dir).await?;

        // Obtenir le fichier du jour
        let log_file = self.get_current_log_file().await;

        // Sérialiser l'événement en JSON (une ligne)
        let json = serde_json::to_string(&event)?;

        // Écrire dans le fichier (append)
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_file)
            .await?;

        file.write_all(json.as_bytes()).await?;
        file.write_all(b"\n").await?;
        file.flush().await?;

        Ok(())
    }

    /// Enregistrer un événement synchrone (blocking)
    pub fn log_sync(&self, event: AuditEvent) -> Result<(), Box<dyn std::error::Error>> {
        // Version bloquante pour compatibilité
        let runtime = tokio::runtime::Handle::current();
        runtime.block_on(self.log(event))
    }

    /// Obtenir le chemin du fichier de log actuel (rotation quotidienne)
    async fn get_current_log_file(&self) -> PathBuf {
        let date = Utc::now().format("%Y-%m-%d");
        let filename = format!("audit-{}.jsonl", date);
        self.log_dir.join(filename)
    }

    /// Lire tous les événements d'un fichier
    pub async fn read_logs(
        &self,
        date: &str,
    ) -> Result<Vec<AuditEvent>, Box<dyn std::error::Error>> {
        let filename = format!("audit-{}.jsonl", date);
        let log_file = self.log_dir.join(filename);

        if !log_file.exists() {
            return Ok(Vec::new());
        }

        let content = tokio::fs::read_to_string(&log_file).await?;
        let mut events = Vec::new();

        for line in content.lines() {
            if let Ok(event) = serde_json::from_str::<AuditEvent>(line) {
                events.push(event);
            }
        }

        Ok(events)
    }

    /// Rechercher des événements par type
    pub async fn search_by_type(
        &self,
        date: &str,
        event_type: &AuditEventType,
    ) -> Result<Vec<AuditEvent>, Box<dyn std::error::Error>> {
        let events = self.read_logs(date).await?;
        Ok(events
            .into_iter()
            .filter(|e| &e.event_type == event_type)
            .collect())
    }

    /// Rechercher des événements par sévérité minimale
    pub async fn search_by_severity(
        &self,
        date: &str,
        min_severity: AuditSeverity,
    ) -> Result<Vec<AuditEvent>, Box<dyn std::error::Error>> {
        let events = self.read_logs(date).await?;
        Ok(events
            .into_iter()
            .filter(|e| e.severity >= min_severity)
            .collect())
    }

    /// Rechercher des événements par utilisateur
    pub async fn search_by_user(
        &self,
        date: &str,
        user_id: &str,
    ) -> Result<Vec<AuditEvent>, Box<dyn std::error::Error>> {
        let events = self.read_logs(date).await?;
        Ok(events
            .into_iter()
            .filter(|e| e.user_id == user_id)
            .collect())
    }
}

/// Logger global (singleton)
pub static GLOBAL_AUDIT_LOGGER: Lazy<AuditLogger> = Lazy::new(|| {
    let log_dir = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("titane-infinity")
        .join("logs")
        .join("audit");

    AuditLogger::new(log_dir)
});

/// Macro helper pour audit logging
/// 
/// Usage:
/// ```rust
/// audit_log!(
///     AuditEventType::ConfigChange,
///     "user123",
///     json!({"setting": "theme", "old": "dark", "new": "light"}),
///     AuditSeverity::Info
/// );
/// ```
#[macro_export]
macro_rules! audit_log {
    ($event_type:expr, $user_id:expr, $details:expr, $severity:expr) => {
        {
            let event = $crate::security::audit::AuditEvent::new(
                $event_type,
                $user_id,
                $details,
                $severity,
            );
            let _ = $crate::security::audit::GLOBAL_AUDIT_LOGGER.log(event).await;
        }
    };
    ($event_type:expr, $user_id:expr, $details:expr, $severity:expr, $module:expr) => {
        {
            let event = $crate::security::audit::AuditEvent::new(
                $event_type,
                $user_id,
                $details,
                $severity,
            ).with_module($module);
            let _ = $crate::security::audit::GLOBAL_AUDIT_LOGGER.log(event).await;
        }
    };
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
            AuditSeverity::Info,
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
                AuditSeverity::Info,
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
            AuditSeverity::Info,
        );
        let event2 = AuditEvent::new(
            AuditEventType::SecurityViolation,
            "user2",
            json!({}),
            AuditSeverity::Critical,
        );
        let event3 = AuditEvent::new(
            AuditEventType::ConfigChange,
            "user3",
            json!({}),
            AuditSeverity::Info,
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
            AuditSeverity::Info,
        );
        let event2 = AuditEvent::new(
            AuditEventType::SecurityViolation,
            "user2",
            json!({}),
            AuditSeverity::Critical,
        );
        let event3 = AuditEvent::new(
            AuditEventType::ConfigChange,
            "user3",
            json!({}),
            AuditSeverity::Warning,
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
