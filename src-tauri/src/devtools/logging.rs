use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::time::SystemTime;
use tokio::sync::Mutex;
use uuid::Uuid;

/// Niveau de log
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}

/// Entrée de log structurée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    /// ID unique du log
    pub id: String,

    /// Timestamp précis
    #[serde(with = "systemtime_serde")]
    pub timestamp: SystemTime,

    /// Niveau de log
    pub level: LogLevel,

    /// Core émetteur (ex: "helios", "nexus")
    pub source_core: String,

    /// Message
    pub message: String,

    /// Contexte additionnel (JSON libre)
    pub context: serde_json::Value,

    /// Correlation ID pour grouper logs liés
    pub correlation_id: Option<String>,

    /// Session ID utilisateur
    pub session_id: Option<String>,

    /// Span ID pour tracing distribué
    pub span_id: Option<String>,
}

/// Collecteur de logs avec indexation et filtrage
pub struct LogCollector {
    entries: Arc<Mutex<VecDeque<LogEntry>>>,
    max_size: usize,
    correlation_index: Arc<Mutex<HashMap<String, Vec<String>>>>,
}

impl LogCollector {
    pub fn new(max_size: usize) -> Self {
        Self {
            entries: Arc::new(Mutex::new(VecDeque::with_capacity(max_size))),
            max_size,
            correlation_index: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Ajoute un log avec auto-génération IDs
    pub async fn log(
        &self,
        level: LogLevel,
        source_core: String,
        message: String,
        context: serde_json::Value,
    ) -> String {
        let log_id = Uuid::new_v4().to_string();

        // Récupérer correlation_id depuis thread-local
        let correlation_id = CURRENT_CORRELATION_ID.with(|id| id.borrow().clone());
        let session_id = CURRENT_SESSION_ID.with(|id| id.borrow().clone());

        let entry = LogEntry {
            id: log_id.clone(),
            timestamp: SystemTime::now(),
            level,
            source_core,
            message,
            context,
            correlation_id: correlation_id.clone(),
            session_id,
            span_id: None, // TODO: distributed tracing
        };

        // Ajouter à la collection
        {
            let mut entries = self.entries.lock().await;
            if entries.len() >= self.max_size {
                entries.pop_front();
            }
            entries.push_back(entry);
        }

        // Indexer par correlation_id
        if let Some(corr_id) = correlation_id {
            let mut index = self.correlation_index.lock().await;
            index
                .entry(corr_id)
                .or_insert_with(Vec::new)
                .push(log_id.clone());
        }

        log_id
    }

    /// Récupère logs par correlation_id
    pub async fn get_correlated_logs(&self, correlation_id: &str) -> Vec<LogEntry> {
        let index = self.correlation_index.lock().await;
        let log_ids = match index.get(correlation_id) {
            Some(ids) => ids.clone(),
            None => return vec![],
        };

        let entries = self.entries.lock().await;
        entries
            .iter()
            .filter(|e| log_ids.contains(&e.id))
            .cloned()
            .collect()
    }

    /// Filtre les logs selon critères
    pub async fn filter_logs(&self, filters: &LogFilters) -> Vec<LogEntry> {
        let entries = self.entries.lock().await;

        entries
            .iter()
            .filter(|e| {
                // Niveau
                if let Some(ref levels) = filters.levels {
                    if !levels.contains(&e.level) {
                        return false;
                    }
                }

                // Core source
                if let Some(ref cores) = filters.source_cores {
                    if !cores.contains(&e.source_core) {
                        return false;
                    }
                }

                // Plage temporelle
                if let Some(start) = filters.time_start {
                    if e.timestamp < start {
                        return false;
                    }
                }
                if let Some(end) = filters.time_end {
                    if e.timestamp > end {
                        return false;
                    }
                }

                // Recherche texte
                if let Some(ref query) = filters.text_search {
                    if !e.message.to_lowercase().contains(&query.to_lowercase()) {
                        return false;
                    }
                }

                // Correlation ID
                if let Some(ref corr_id) = filters.correlation_id {
                    if e.correlation_id.as_ref() != Some(corr_id) {
                        return false;
                    }
                }

                // Session ID
                if let Some(ref sess_id) = filters.session_id {
                    if e.session_id.as_ref() != Some(sess_id) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect()
    }

    /// Récupère tous les logs (limité aux N derniers)
    pub async fn get_recent(&self, count: usize) -> Vec<LogEntry> {
        let entries = self.entries.lock().await;
        entries
            .iter()
            .rev()
            .take(count)
            .cloned()
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect()
    }

    /// Compte total de logs
    pub async fn count(&self) -> usize {
        let entries = self.entries.lock().await;
        entries.len()
    }

    /// Vide tous les logs
    pub async fn clear(&self) {
        let mut entries = self.entries.lock().await;
        entries.clear();

        let mut index = self.correlation_index.lock().await;
        index.clear();
    }
}

/// Filtres pour recherche de logs
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct LogFilters {
    pub levels: Option<Vec<LogLevel>>,
    pub source_cores: Option<Vec<String>>,
    pub time_start: Option<SystemTime>,
    pub time_end: Option<SystemTime>,
    pub text_search: Option<String>,
    pub correlation_id: Option<String>,
    pub session_id: Option<String>,
}

// Thread-local storage pour correlation context
thread_local! {
    pub static CURRENT_CORRELATION_ID: RefCell<Option<String>> = RefCell::new(None);
    pub static CURRENT_SESSION_ID: RefCell<Option<String>> = RefCell::new(None);
}

/// Helper pour définir correlation ID dans le thread actuel
pub fn set_correlation_id(id: Option<String>) {
    CURRENT_CORRELATION_ID.with(|cell| {
        *cell.borrow_mut() = id;
    });
}

/// Helper pour définir session ID dans le thread actuel
pub fn set_session_id(id: Option<String>) {
    CURRENT_SESSION_ID.with(|cell| {
        *cell.borrow_mut() = id;
    });
}

/// Macro pour logger facilement
#[macro_export]
macro_rules! log_info {
    ($collector:expr, $core:expr, $msg:expr) => {
        $collector
            .log(
                $crate::devtools::LogLevel::Info,
                $core.into(),
                $msg.into(),
                serde_json::json!({}),
            )
            .await
    };
    ($collector:expr, $core:expr, $msg:expr, $ctx:expr) => {
        $collector
            .log(
                $crate::devtools::LogLevel::Info,
                $core.into(),
                $msg.into(),
                $ctx,
            )
            .await
    };
}

#[macro_export]
macro_rules! log_error {
    ($collector:expr, $core:expr, $msg:expr) => {
        $collector
            .log(
                $crate::devtools::LogLevel::Error,
                $core.into(),
                $msg.into(),
                serde_json::json!({}),
            )
            .await
    };
    ($collector:expr, $core:expr, $msg:expr, $ctx:expr) => {
        $collector
            .log(
                $crate::devtools::LogLevel::Error,
                $core.into(),
                $msg.into(),
                $ctx,
            )
            .await
    };
}

// Serialization helper pour SystemTime
mod systemtime_serde {
    use serde::{Deserialize, Deserializer, Serialize, Serializer};
    use std::time::{Duration, SystemTime, UNIX_EPOCH};

    pub fn serialize<S>(time: &SystemTime, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let duration = time
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or(std::time::Duration::from_secs(0));
        duration.as_secs().serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<SystemTime, D::Error>
    where
        D: Deserializer<'de>,
    {
        let secs = u64::deserialize(deserializer)?;
        Ok(UNIX_EPOCH + Duration::from_secs(secs))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_log_collection() {
        let collector = LogCollector::new(100);

        let log_id = collector
            .log(
                LogLevel::Info,
                "test_core".into(),
                "Test message".into(),
                serde_json::json!({"key": "value"}),
            )
            .await;

        assert!(!log_id.is_empty());

        let logs = collector.get_recent(10).await;
        assert_eq!(logs.len(), 1);
        assert_eq!(logs[0].message, "Test message");
    }

    #[tokio::test]
    async fn test_log_correlation() {
        let collector = LogCollector::new(100);

        let correlation_id = Uuid::new_v4().to_string();

        // Set correlation ID
        set_correlation_id(Some(correlation_id.clone()));

        collector
            .log(
                LogLevel::Info,
                "test_core".into(),
                "Log 1".into(),
                serde_json::json!({}),
            )
            .await;

        collector
            .log(
                LogLevel::Info,
                "test_core".into(),
                "Log 2".into(),
                serde_json::json!({}),
            )
            .await;

        let correlated = collector.get_correlated_logs(&correlation_id).await;
        assert_eq!(correlated.len(), 2);
    }

    #[tokio::test]
    async fn test_log_filtering() {
        let collector = LogCollector::new(100);

        collector
            .log(
                LogLevel::Info,
                "core1".into(),
                "Info message".into(),
                serde_json::json!({}),
            )
            .await;

        collector
            .log(
                LogLevel::Error,
                "core2".into(),
                "Error message".into(),
                serde_json::json!({}),
            )
            .await;

        // Filter par niveau
        let filters = LogFilters {
            levels: Some(vec![LogLevel::Error]),
            ..Default::default()
        };

        let filtered = collector.filter_logs(&filters).await;
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].level, LogLevel::Error);

        // Filter par core
        let filters = LogFilters {
            source_cores: Some(vec!["core1".into()]),
            ..Default::default()
        };

        let filtered = collector.filter_logs(&filters).await;
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].source_core, "core1");
    }

    #[tokio::test]
    async fn test_log_max_size() {
        let collector = LogCollector::new(3);

        for i in 0..5 {
            collector
                .log(
                    LogLevel::Info,
                    "test".into(),
                    format!("Message {}", i),
                    serde_json::json!({}),
                )
                .await;
        }

        let count = collector.count().await;
        assert_eq!(count, 3); // Max size respected
    }

    #[tokio::test]
    async fn test_clear_logs() {
        let collector = LogCollector::new(100);

        collector
            .log(
                LogLevel::Info,
                "test".into(),
                "Message".into(),
                serde_json::json!({}),
            )
            .await;

        assert_eq!(collector.count().await, 1);

        collector.clear().await;

        assert_eq!(collector.count().await, 0);
    }
}
