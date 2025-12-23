#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   CYCLE ENGINE DIAGNOSTICS
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::cycles::CycleState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CycleEngineDiagnostics {
    pub enabled: bool,
    pub clock_running: bool,
    pub current_cycle: CycleState,
    pub omega_intensity: f32,
    pub self_healing_frequency: f32,
    pub memory_consolidation_active: bool,
    pub alignment_score: f32,
    pub uptime_seconds: u64,
}

impl Default for CycleEngineDiagnostics {
    fn default() -> Self {
        Self {
            enabled: false,
            clock_running: false,
            current_cycle: CycleState::current(),
            omega_intensity: 0.7,
            self_healing_frequency: 0.5,
            memory_consolidation_active: false,
            alignment_score: 0.0,
            uptime_seconds: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // CycleEngineDiagnostics Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_diagnostics_default() {
        let diag = CycleEngineDiagnostics::default();
        assert!(!diag.enabled);
        assert!(!diag.clock_running);
        assert_eq!(diag.omega_intensity, 0.7);
        assert_eq!(diag.self_healing_frequency, 0.5);
        assert!(!diag.memory_consolidation_active);
        assert_eq!(diag.alignment_score, 0.0);
        assert_eq!(diag.uptime_seconds, 0);
    }

    #[test]
    fn test_diagnostics_clone() {
        let diag = CycleEngineDiagnostics::default();
        let cloned = diag.clone();
        assert_eq!(diag.enabled, cloned.enabled);
        assert_eq!(diag.omega_intensity, cloned.omega_intensity);
        assert_eq!(diag.uptime_seconds, cloned.uptime_seconds);
    }

    #[test]
    fn test_diagnostics_debug() {
        let diag = CycleEngineDiagnostics::default();
        let debug = format!("{:?}", diag);
        assert!(debug.contains("CycleEngineDiagnostics"));
    }

    #[test]
    fn test_diagnostics_serialization() {
        let diag = CycleEngineDiagnostics::default();
        let json = serde_json::to_string(&diag)
            .expect("diagnostics should serialize");
        let restored: CycleEngineDiagnostics = serde_json::from_str(&json)
            .expect("diagnostics should deserialize");
        assert_eq!(diag.enabled, restored.enabled);
        assert_eq!(diag.omega_intensity, restored.omega_intensity);
    }

    #[test]
    fn test_diagnostics_custom_values() {
        let diag = CycleEngineDiagnostics {
            enabled: true,
            clock_running: true,
            current_cycle: CycleState::current(),
            omega_intensity: 0.9,
            self_healing_frequency: 0.8,
            memory_consolidation_active: true,
            alignment_score: 0.95,
            uptime_seconds: 3600,
        };
        assert!(diag.enabled);
        assert!(diag.clock_running);
        assert_eq!(diag.omega_intensity, 0.9);
        assert_eq!(diag.self_healing_frequency, 0.8);
        assert!(diag.memory_consolidation_active);
        assert_eq!(diag.alignment_score, 0.95);
        assert_eq!(diag.uptime_seconds, 3600);
    }

    #[test]
    fn test_diagnostics_current_cycle() {
        let diag = CycleEngineDiagnostics::default();
        assert!(diag.current_cycle.timestamp > 0);
    }

    #[test]
    fn test_diagnostics_omega_intensity_range() {
        let diag = CycleEngineDiagnostics::default();
        assert!(diag.omega_intensity >= 0.0 && diag.omega_intensity <= 1.0);
    }

    #[test]
    fn test_diagnostics_self_healing_range() {
        let diag = CycleEngineDiagnostics::default();
        assert!(diag.self_healing_frequency >= 0.0 && diag.self_healing_frequency <= 1.0);
    }

    #[test]
    fn test_diagnostics_alignment_score_range() {
        let diag = CycleEngineDiagnostics::default();
        assert!(diag.alignment_score >= 0.0 && diag.alignment_score <= 1.0);
    }

    #[test]
    fn test_diagnostics_deserialize() {
        let json = r#"{"enabled":true,"clock_running":true,"current_cycle":{"daily_phase":"Morning","weekly_phase":"Monday","monthly_phase":"Week1","seasonal_phase":"Winter","cognitive_mode":"Analytical","timestamp":1234567890},"omega_intensity":0.8,"self_healing_frequency":0.6,"memory_consolidation_active":false,"alignment_score":0.75,"uptime_seconds":7200}"#;
        let diag: CycleEngineDiagnostics = serde_json::from_str(json)
            .expect("should deserialize cycle engine diagnostics");
        assert!(diag.enabled);
        assert!(diag.clock_running);
        assert_eq!(diag.omega_intensity, 0.8);
        assert_eq!(diag.uptime_seconds, 7200);
    }
}
