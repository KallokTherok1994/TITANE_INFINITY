/**
 * TITANE∞ v17 - Watchdog Alerts
 *
 * Système d'alertes à trois niveaux
 */
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum AlertLevel {
    /// Information seulement (hash change légitime)
    Info,
    /// Warning (cohérence faible, non-critique)
    Warn,
    /// Error (overload, validation fail)
    Error,
    /// Critical (NaN, corruption, rollback nécessaire)
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchdogAlert {
    pub level: AlertLevel,
    pub message: String,
    pub context: String,
    pub timestamp: u64,
    pub action_taken: Option<String>,
}

impl WatchdogAlert {
    pub fn info(message: String, context: String) -> Self {
        Self {
            level: AlertLevel::Info,
            message,
            context,
            timestamp: crate::core::utils::now_ms(),
            action_taken: None,
        }
    }

    pub fn warn(message: String, context: String) -> Self {
        Self {
            level: AlertLevel::Warn,
            message,
            context,
            timestamp: crate::core::utils::now_ms(),
            action_taken: None,
        }
    }

    pub fn error(message: String, context: String) -> Self {
        Self {
            level: AlertLevel::Error,
            message,
            context,
            timestamp: crate::core::utils::now_ms(),
            action_taken: None,
        }
    }

    pub fn critical(message: String, context: String, action: String) -> Self {
        Self {
            level: AlertLevel::Critical,
            message,
            context,
            timestamp: crate::core::utils::now_ms(),
            action_taken: Some(action),
        }
    }

    pub fn with_action(mut self, action: String) -> Self {
        self.action_taken = Some(action);
        self
    }
}
