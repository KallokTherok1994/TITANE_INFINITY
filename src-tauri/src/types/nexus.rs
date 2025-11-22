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
        let failing = self.modules.values().filter(|m| matches!(m.health, ModuleHealth::Failing | ModuleHealth::Offline)).count();
        let degraded = self.modules.values().filter(|m| matches!(m.health, ModuleHealth::Degraded)).count();
        
        self.health = if failing > 0 {
            ModuleHealth::Failing
        } else if degraded > 1 {
            ModuleHealth::Degraded
        } else {
            ModuleHealth::Healthy
        };
    }
}
