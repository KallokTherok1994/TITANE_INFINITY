// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: NEXUS
//   Internal Coherence & Module Status
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Nexus module state - System coherence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NexusState {
    pub modules: HashMap<String, ModuleStatus>,
    pub coherence_score: f64,
    pub active_connections: usize,
    pub health: ModuleHealth,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleStatus {
    pub name: String,
    pub health: ModuleHealth,
    pub uptime: u64,
    pub last_tick: i64,
    pub message: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ModuleHealth {
    Healthy,
    Degraded,
    Failing,
    Offline,
}

impl Default for NexusState {
    fn default() -> Self {
        Self {
            modules: HashMap::new(),
            coherence_score: 100.0,
            active_connections: 0,
            health: ModuleHealth::Healthy,
            timestamp: 0,
        }
    }
}

impl NexusState {
    /// Calculate overall health from module states
    pub fn calculate_health(&mut self) {
        let failing = self
            .modules
            .values()
            .filter(|m| matches!(m.health, ModuleHealth::Failing | ModuleHealth::Offline))
            .count();
        let degraded = self
            .modules
            .values()
            .filter(|m| matches!(m.health, ModuleHealth::Degraded))
            .count();

        self.health = if failing > 0 {
            ModuleHealth::Failing
        } else if degraded > 1 {
            ModuleHealth::Degraded
        } else {
            ModuleHealth::Healthy
        };
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // ModuleHealth Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_module_health_variants() {
        let healths = vec![
            ModuleHealth::Healthy,
            ModuleHealth::Degraded,
            ModuleHealth::Failing,
            ModuleHealth::Offline,
        ];
        assert_eq!(healths.len(), 4);
    }

    #[test]
    fn test_module_health_equality() {
        assert_eq!(ModuleHealth::Healthy, ModuleHealth::Healthy);
        assert_ne!(ModuleHealth::Healthy, ModuleHealth::Failing);
    }

    #[test]
    fn test_module_health_clone() {
        let health = ModuleHealth::Degraded;
        let cloned = health;
        assert_eq!(health, cloned);
    }

    #[test]
    fn test_module_health_copy() {
        let health = ModuleHealth::Offline;
        let copied: ModuleHealth = health;
        assert_eq!(health, copied);
    }

    #[test]
    fn test_module_health_debug() {
        let health = ModuleHealth::Failing;
        let debug_str = format!("{:?}", health);
        assert!(debug_str.contains("Failing"));
    }

    #[test]
    fn test_module_health_serialization() {
        let health = ModuleHealth::Degraded;
        let json = serde_json::to_string(&health).expect("ModuleHealth should serialize");
        let restored: ModuleHealth =
            serde_json::from_str(&json).expect("ModuleHealth should deserialize");
        assert_eq!(restored, ModuleHealth::Degraded);
    }

    // ─────────────────────────────────────────────────────────────
    // ModuleStatus Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_module_status_creation() {
        let status = ModuleStatus {
            name: "helios".to_string(),
            health: ModuleHealth::Healthy,
            uptime: 3600,
            last_tick: 1234567890,
            message: "All systems nominal".to_string(),
        };

        assert_eq!(status.name, "helios");
        assert_eq!(status.uptime, 3600);
    }

    #[test]
    fn test_module_status_clone() {
        let status = ModuleStatus {
            name: "test".to_string(),
            health: ModuleHealth::Degraded,
            uptime: 100,
            last_tick: 999,
            message: "msg".to_string(),
        };
        let cloned = status.clone();
        assert_eq!(cloned.name, "test");
        assert_eq!(cloned.health, ModuleHealth::Degraded);
    }

    #[test]
    fn test_module_status_debug() {
        let status = ModuleStatus {
            name: "x".to_string(),
            health: ModuleHealth::Healthy,
            uptime: 0,
            last_tick: 0,
            message: "".to_string(),
        };
        let debug_str = format!("{:?}", status);
        assert!(debug_str.contains("ModuleStatus"));
    }

    #[test]
    fn test_module_status_serialization() {
        let status = ModuleStatus {
            name: "nexus".to_string(),
            health: ModuleHealth::Failing,
            uptime: 7200,
            last_tick: 123456,
            message: "Connection lost".to_string(),
        };
        let json = serde_json::to_string(&status).expect("ModuleStatus should serialize");
        let restored: ModuleStatus =
            serde_json::from_str(&json).expect("ModuleStatus should deserialize");
        assert_eq!(restored.name, "nexus");
        assert_eq!(restored.health, ModuleHealth::Failing);
    }

    // ─────────────────────────────────────────────────────────────
    // NexusState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_nexus_state_default() {
        let state = NexusState::default();

        assert!(state.modules.is_empty());
        assert_eq!(state.coherence_score, 100.0);
        assert_eq!(state.active_connections, 0);
        assert_eq!(state.health, ModuleHealth::Healthy);
        assert_eq!(state.timestamp, 0);
    }

    #[test]
    fn test_nexus_state_with_modules() {
        let mut state = NexusState::default();

        state.modules.insert(
            "helios".to_string(),
            ModuleStatus {
                name: "helios".to_string(),
                health: ModuleHealth::Healthy,
                uptime: 1000,
                last_tick: 100,
                message: "ok".to_string(),
            },
        );

        assert_eq!(state.modules.len(), 1);
    }

    #[test]
    fn test_nexus_state_clone() {
        let state = NexusState::default();
        let cloned = state.clone();
        assert_eq!(cloned.coherence_score, state.coherence_score);
    }

    #[test]
    fn test_nexus_state_debug() {
        let state = NexusState::default();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("NexusState"));
    }

    #[test]
    fn test_nexus_state_serialization() {
        let state = NexusState {
            coherence_score: 95.5,
            active_connections: 5,
            ..Default::default()
        };
        let json = serde_json::to_string(&state).expect("NexusState should serialize");
        let restored: NexusState = serde_json::from_str(&json).expect("NexusState should deserialize");
        assert_eq!(restored.coherence_score, 95.5);
        assert_eq!(restored.active_connections, 5);
    }

    // ─────────────────────────────────────────────────────────────
    // Calculate Health Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_calculate_health_empty() {
        let mut state = NexusState::default();
        state.calculate_health();
        assert_eq!(state.health, ModuleHealth::Healthy);
    }

    #[test]
    fn test_calculate_health_all_healthy() {
        let mut state = NexusState::default();

        for name in &["mod1", "mod2", "mod3"] {
            state.modules.insert(
                name.to_string(),
                ModuleStatus {
                    name: name.to_string(),
                    health: ModuleHealth::Healthy,
                    uptime: 100,
                    last_tick: 0,
                    message: "ok".to_string(),
                },
            );
        }

        state.calculate_health();
        assert_eq!(state.health, ModuleHealth::Healthy);
    }

    #[test]
    fn test_calculate_health_one_degraded() {
        let mut state = NexusState::default();

        state.modules.insert(
            "healthy".to_string(),
            ModuleStatus {
                name: "healthy".to_string(),
                health: ModuleHealth::Healthy,
                uptime: 100,
                last_tick: 0,
                message: "ok".to_string(),
            },
        );

        state.modules.insert(
            "degraded".to_string(),
            ModuleStatus {
                name: "degraded".to_string(),
                health: ModuleHealth::Degraded,
                uptime: 50,
                last_tick: 0,
                message: "slow".to_string(),
            },
        );

        state.calculate_health();
        // Only 1 degraded, so still healthy
        assert_eq!(state.health, ModuleHealth::Healthy);
    }

    #[test]
    fn test_calculate_health_multiple_degraded() {
        let mut state = NexusState::default();

        for i in 0..3 {
            state.modules.insert(
                format!("mod{}", i),
                ModuleStatus {
                    name: format!("mod{}", i),
                    health: ModuleHealth::Degraded,
                    uptime: 50,
                    last_tick: 0,
                    message: "slow".to_string(),
                },
            );
        }

        state.calculate_health();
        // More than 1 degraded = Degraded
        assert_eq!(state.health, ModuleHealth::Degraded);
    }

    #[test]
    fn test_calculate_health_one_failing() {
        let mut state = NexusState::default();

        state.modules.insert(
            "healthy".to_string(),
            ModuleStatus {
                name: "healthy".to_string(),
                health: ModuleHealth::Healthy,
                uptime: 100,
                last_tick: 0,
                message: "ok".to_string(),
            },
        );

        state.modules.insert(
            "failing".to_string(),
            ModuleStatus {
                name: "failing".to_string(),
                health: ModuleHealth::Failing,
                uptime: 0,
                last_tick: 0,
                message: "error".to_string(),
            },
        );

        state.calculate_health();
        assert_eq!(state.health, ModuleHealth::Failing);
    }

    #[test]
    fn test_calculate_health_one_offline() {
        let mut state = NexusState::default();

        state.modules.insert(
            "offline".to_string(),
            ModuleStatus {
                name: "offline".to_string(),
                health: ModuleHealth::Offline,
                uptime: 0,
                last_tick: 0,
                message: "unreachable".to_string(),
            },
        );

        state.calculate_health();
        // Offline counts as failing
        assert_eq!(state.health, ModuleHealth::Failing);
    }

    #[test]
    fn test_calculate_health_failing_overrides_degraded() {
        let mut state = NexusState::default();

        // Add many degraded
        for i in 0..5 {
            state.modules.insert(
                format!("degraded{}", i),
                ModuleStatus {
                    name: format!("degraded{}", i),
                    health: ModuleHealth::Degraded,
                    uptime: 50,
                    last_tick: 0,
                    message: "slow".to_string(),
                },
            );
        }

        // Add one failing
        state.modules.insert(
            "failing".to_string(),
            ModuleStatus {
                name: "failing".to_string(),
                health: ModuleHealth::Failing,
                uptime: 0,
                last_tick: 0,
                message: "error".to_string(),
            },
        );

        state.calculate_health();
        // Failing takes precedence
        assert_eq!(state.health, ModuleHealth::Failing);
    }
}
