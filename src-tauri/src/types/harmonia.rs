// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: HARMONIA
//   System Balancing & Stabilization
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // Harmonia types - used by balance system

use serde::{Deserialize, Serialize};

/// Harmonia module state - System balance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmoniaState {
    pub balance_score: f64,
    pub active_flows: usize,
    pub stabilization_level: StabilizationLevel,
    pub adjustments_applied: u32,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum StabilizationLevel {
    Stable,
    Adjusting,
    Rebalancing,
}

impl Default for HarmoniaState {
    fn default() -> Self {
        Self {
            balance_score: 100.0,
            active_flows: 0,
            stabilization_level: StabilizationLevel::Stable,
            adjustments_applied: 0,
            timestamp: 0,
        }
    }
}

/// Balancing action to apply
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BalanceAction {
    pub target: String,
    pub action_type: ActionType,
    pub priority: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    ReduceLoad,
    IncreaseCapacity,
    Redistribute,
    Pause,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // StabilizationLevel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_stabilization_level_variants() {
        let levels = vec![
            StabilizationLevel::Stable,
            StabilizationLevel::Adjusting,
            StabilizationLevel::Rebalancing,
        ];
        assert_eq!(levels.len(), 3);
    }

    #[test]
    fn test_stabilization_level_equality() {
        assert_eq!(StabilizationLevel::Stable, StabilizationLevel::Stable);
        assert_ne!(StabilizationLevel::Stable, StabilizationLevel::Adjusting);
    }

    #[test]
    fn test_stabilization_level_clone() {
        let level = StabilizationLevel::Rebalancing;
        let cloned = level;
        assert_eq!(level, cloned);
    }

    #[test]
    fn test_stabilization_level_copy() {
        let level = StabilizationLevel::Adjusting;
        let copied: StabilizationLevel = level;
        assert_eq!(level, copied);
    }

    #[test]
    fn test_stabilization_level_debug() {
        let level = StabilizationLevel::Stable;
        let debug_str = format!("{:?}", level);
        assert!(debug_str.contains("Stable"));
    }

    #[test]
    fn test_stabilization_level_serialization() {
        let level = StabilizationLevel::Rebalancing;
        let json = serde_json::to_string(&level)
            .expect("StabilizationLevel should serialize to JSON");
        let restored: StabilizationLevel = serde_json::from_str(&json)
            .expect("StabilizationLevel should deserialize from JSON");
        assert_eq!(restored, StabilizationLevel::Rebalancing);
    }

    // ─────────────────────────────────────────────────────────────
    // ActionType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_action_type_variants() {
        let types = vec![
            ActionType::ReduceLoad,
            ActionType::IncreaseCapacity,
            ActionType::Redistribute,
            ActionType::Pause,
        ];
        assert_eq!(types.len(), 4);
    }

    #[test]
    fn test_action_type_clone() {
        let action = ActionType::ReduceLoad;
        let cloned = action.clone();
        assert!(matches!(cloned, ActionType::ReduceLoad));
    }

    #[test]
    fn test_action_type_debug() {
        let action = ActionType::IncreaseCapacity;
        let debug_str = format!("{:?}", action);
        assert!(debug_str.contains("IncreaseCapacity"));
    }

    #[test]
    fn test_action_type_serialization() {
        let action = ActionType::Redistribute;
        let json =
            serde_json::to_string(&action).expect("ActionType should serialize to JSON");
        let restored: ActionType =
            serde_json::from_str(&json).expect("ActionType should deserialize from JSON");
        assert!(matches!(restored, ActionType::Redistribute));
    }

    // ─────────────────────────────────────────────────────────────
    // BalanceAction Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_balance_action_creation() {
        let action = BalanceAction {
            target: "cpu".to_string(),
            action_type: ActionType::ReduceLoad,
            priority: 5,
        };
        assert_eq!(action.target, "cpu");
        assert_eq!(action.priority, 5);
    }

    #[test]
    fn test_balance_action_clone() {
        let action = BalanceAction {
            target: "memory".to_string(),
            action_type: ActionType::Pause,
            priority: 10,
        };
        let cloned = action.clone();
        assert_eq!(cloned.target, "memory");
        assert_eq!(cloned.priority, 10);
    }

    #[test]
    fn test_balance_action_debug() {
        let action = BalanceAction {
            target: "x".to_string(),
            action_type: ActionType::IncreaseCapacity,
            priority: 1,
        };
        let debug_str = format!("{:?}", action);
        assert!(debug_str.contains("BalanceAction"));
    }

    #[test]
    fn test_balance_action_serialization() {
        let action = BalanceAction {
            target: "disk".to_string(),
            action_type: ActionType::Redistribute,
            priority: 7,
        };
        let json =
            serde_json::to_string(&action).expect("BalanceAction should serialize to JSON");
        let restored: BalanceAction = serde_json::from_str(&json)
            .expect("BalanceAction should deserialize from JSON");
        assert_eq!(restored.target, "disk");
        assert_eq!(restored.priority, 7);
    }

    // ─────────────────────────────────────────────────────────────
    // HarmoniaState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_harmonia_state_default() {
        let state = HarmoniaState::default();

        assert_eq!(state.balance_score, 100.0);
        assert_eq!(state.active_flows, 0);
        assert_eq!(state.stabilization_level, StabilizationLevel::Stable);
        assert_eq!(state.adjustments_applied, 0);
        assert_eq!(state.timestamp, 0);
    }

    #[test]
    fn test_harmonia_state_with_data() {
        let state = HarmoniaState {
            balance_score: 85.5,
            active_flows: 3,
            stabilization_level: StabilizationLevel::Adjusting,
            adjustments_applied: 15,
            timestamp: 1234567890,
        };

        assert_eq!(state.balance_score, 85.5);
        assert_eq!(state.active_flows, 3);
        assert_eq!(state.adjustments_applied, 15);
    }

    #[test]
    fn test_harmonia_state_clone() {
        let state = HarmoniaState::default();
        let cloned = state.clone();
        assert_eq!(cloned.balance_score, state.balance_score);
    }

    #[test]
    fn test_harmonia_state_debug() {
        let state = HarmoniaState::default();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("HarmoniaState"));
    }

    #[test]
    fn test_harmonia_state_serialization() {
        let state = HarmoniaState {
            balance_score: 90.0,
            active_flows: 5,
            ..Default::default()
        };
        let json = serde_json::to_string(&state).expect("HarmoniaState should serialize to JSON");
        let restored: HarmoniaState = serde_json::from_str(&json)
            .expect("HarmoniaState should deserialize from JSON");
        assert_eq!(restored.balance_score, 90.0);
        assert_eq!(restored.active_flows, 5);
    }

    #[test]
    fn test_harmonia_state_all_stabilization_levels() {
        for level in &[
            StabilizationLevel::Stable,
            StabilizationLevel::Adjusting,
            StabilizationLevel::Rebalancing,
        ] {
            let state = HarmoniaState {
                stabilization_level: *level,
                ..Default::default()
            };
            let json = serde_json::to_string(&state)
                .expect("HarmoniaState should serialize to JSON");
            let restored: HarmoniaState = serde_json::from_str(&json)
                .expect("HarmoniaState should deserialize from JSON");
            assert_eq!(restored.stabilization_level, *level);
        }
    }
}
