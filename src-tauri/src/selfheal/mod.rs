#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       SELFHEAL++ ENGINE v13                                  ║
// ║                   Auto-réparation instantanée                                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub mod monitor;

// Modules à implémenter (templates disponibles dans TITANE_V13_INTEGRATION_GUIDE.md)
// pub mod recovery;
// pub mod diagnostics;

// pub use recovery::AutoRecovery;
// pub use diagnostics::SelfDiagnostics;

use serde::{Deserialize, Serialize};

/// État de santé du système
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Critical,
    Recovering,
}

/// Type de problème détecté
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueType {
    ASRCrash,
    TTSFailure,
    OllamaFrozen,
    GeminiTimeout,
    MemoryCorruption,
    DuplexDesync,
    NetworkLoss,
    CPUOverload,
    HighLatency,
}

/// Incident système
#[derive(Debug, Clone)]
pub struct SystemIncident {
    pub id: String,
    pub issue_type: IssueType,
    pub detected_at: u64,          // ms since epoch
    pub resolved_at: Option<u64>,  // ms since epoch
    pub auto_recovered: bool,
    pub recovery_duration_ms: Option<u64>,
}

impl SystemIncident {
    pub fn new(issue_type: IssueType) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            issue_type,
            detected_at: crate::core::utils::now_ms(),
            resolved_at: None,
            auto_recovered: false,
            recovery_duration_ms: None,
        }
    }

    pub fn mark_resolved(&mut self, auto_recovered: bool) {
        let now = crate::core::utils::now_ms();
        self.resolved_at = Some(now);
        self.auto_recovered = auto_recovered;
        self.recovery_duration_ms = Some(now.saturating_sub(self.detected_at));
    }
}

/// Statistiques de réparation
#[derive(Debug, Clone, Default)]
pub struct RecoveryStats {
    pub total_incidents: usize,
    pub auto_recovered: usize,
    pub manual_intervention: usize,
    pub avg_recovery_time_ms: u64,
    pub health_score: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_incident_creation() {
        let incident = SystemIncident::new(IssueType::ASRCrash);
        assert!(!incident.auto_recovered);
        assert!(incident.resolved_at.is_none());
    }

    #[test]
    fn test_incident_resolution() {
        let mut incident = SystemIncident::new(IssueType::TTSFailure);

        std::thread::sleep(Duration::from_millis(10));
        incident.mark_resolved(true);

        assert!(incident.auto_recovered);
        assert!(incident.resolved_at.is_some());
        assert!(incident.recovery_duration.is_some());
    }
}
