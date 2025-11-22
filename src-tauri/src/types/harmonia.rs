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
