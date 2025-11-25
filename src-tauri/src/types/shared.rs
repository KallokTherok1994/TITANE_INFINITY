// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — TYPES: SHARED
//   Types communs entre core et legacy modules
//   ⚠️  Cette couche unifie types/ et shared/types (deprecated)
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════
// HEALTH & STATUS
// ═══════════════════════════════════════════════════════════════

/// Health status pour modules et système
///
/// Unified version consolidant:
/// - `types::helios::HealthStatus` (Healthy/Warning/Critical)
/// - `shared::types::HealthStatus` (Healthy/Degraded/Critical/Offline)
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HealthStatus {
    /// Module fonctionne normalement
    Healthy,
    /// Module en état dégradé (remplace Warning pour legacy compat)
    #[serde(alias = "Warning")]
    Degraded,
    /// Module en état critique, intervention requise
    Critical,
    /// Module non initialisé ou crashé
    Offline,
}

impl HealthStatus {
    /// Convertit vers score numérique (0-100)
    pub fn to_score(&self) -> u8 {
        match self {
            HealthStatus::Healthy => 100,
            HealthStatus::Degraded => 60,
            HealthStatus::Critical => 20,
            HealthStatus::Offline => 0,
        }
    }

    /// Détermine status depuis un score
    pub fn from_score(score: u8) -> Self {
        match score {
            80..=100 => HealthStatus::Healthy,
            40..=79 => HealthStatus::Degraded,
            1..=39 => HealthStatus::Critical,
            _ => HealthStatus::Offline,
        }
    }

    /// Vérifie si le status nécessite une action
    pub fn needs_attention(&self) -> bool {
        matches!(self, HealthStatus::Critical | HealthStatus::Offline)
    }
}

/// Informations complètes sur la santé d'un module
///
/// Remplace `shared::types::ModuleHealth` (struct)
/// Compatible avec le système de monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleHealthInfo {
    /// Nom du module
    pub name: String,
    /// Status actuel
    pub status: HealthStatus,
    /// Uptime en secondes
    pub uptime: u64,
    /// Timestamp du dernier tick (Unix timestamp)
    pub last_tick: u64,
    /// Message de status ou d'erreur
    pub message: String,
}

impl ModuleHealthInfo {
    /// Crée une nouvelle info de santé module
    pub fn new(name: impl Into<String>, status: HealthStatus) -> Self {
        Self {
            name: name.into(),
            status,
            uptime: 0,
            last_tick: chrono::Utc::now().timestamp() as u64,
            message: String::new(),
        }
    }

    /// Crée un module healthy
    pub fn healthy(name: impl Into<String>) -> Self {
        Self::new(name, HealthStatus::Healthy)
    }

    /// Update le status avec un message
    pub fn with_message(mut self, message: impl Into<String>) -> Self {
        self.message = message.into();
        self
    }
}

// ═══════════════════════════════════════════════════════════════
// METRICS
// ═══════════════════════════════════════════════════════════════

/// Métriques système
///
/// Compatible avec `shared::types::SystemMetrics`
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub uptime: u64,
}

impl Default for SystemMetrics {
    fn default() -> Self {
        Self {
            cpu_usage: 0.0,
            memory_usage: 0.0,
            disk_usage: 0.0,
            uptime: 0,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

/// Niveau de log
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum LogLevel {
    Info,
    Warning,
    Error,
    Debug,
}

impl LogLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Info => "INFO",
            LogLevel::Warning => "WARN",
            LogLevel::Error => "ERROR",
            LogLevel::Debug => "DEBUG",
        }
    }
}

// NOTE: LogEntry est déjà bien défini dans types/memory.rs
// On ne le redéfinit pas ici pour éviter un nouveau doublon

// ═══════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════

/// Alias pour compatibilité legacy
/// ⚠️ Préférer AppResult<T> du module utils
#[deprecated(since = "17.3.0", note = "Use utils::AppResult instead")]
pub type TitaneResult<T> = Result<T, String>;

// ═══════════════════════════════════════════════════════════════
// COGNITIVE (Legacy)
// ═══════════════════════════════════════════════════════════════

/// Représentation d'un nœud cognitif
///
/// Utilisé par digital_twin et modules legacy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveNode {
    pub id: String,
    pub node_type: String,
    pub connections: Vec<String>,
    pub weight: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_health_status_score_conversion() {
        assert_eq!(HealthStatus::Healthy.to_score(), 100);
        assert_eq!(HealthStatus::Degraded.to_score(), 60);
        assert_eq!(HealthStatus::Critical.to_score(), 20);
        assert_eq!(HealthStatus::Offline.to_score(), 0);

        assert_eq!(HealthStatus::from_score(100), HealthStatus::Healthy);
        assert_eq!(HealthStatus::from_score(50), HealthStatus::Degraded);
        assert_eq!(HealthStatus::from_score(30), HealthStatus::Critical);
        assert_eq!(HealthStatus::from_score(0), HealthStatus::Offline);
    }

    #[test]
    fn test_health_status_needs_attention() {
        assert!(!HealthStatus::Healthy.needs_attention());
        assert!(!HealthStatus::Degraded.needs_attention());
        assert!(HealthStatus::Critical.needs_attention());
        assert!(HealthStatus::Offline.needs_attention());
    }

    #[test]
    fn test_module_health_info() {
        let info = ModuleHealthInfo::healthy("TestModule").with_message("All systems nominal");

        assert_eq!(info.name, "TestModule");
        assert_eq!(info.status, HealthStatus::Healthy);
        assert_eq!(info.message, "All systems nominal");
    }
}
