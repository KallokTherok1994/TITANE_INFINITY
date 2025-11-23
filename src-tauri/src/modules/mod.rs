// TITANE∞ v17.2.0 - Internal Modules (Legacy)
// Phase 2 cleanup: All v12 modules removed
// Functionality migrated to plugin_system/cores/

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleStatus {
    pub name: String,
    pub active: bool,
    pub health: f32,
    pub last_check: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealth {
    pub overall_health: f32,
    pub modules: Vec<ModuleStatus>,
    pub timestamp: i64,
}
