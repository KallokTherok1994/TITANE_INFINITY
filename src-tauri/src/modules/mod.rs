// TITANE∞ v12 - Internal Modules
// Advanced cognitive modules for AI orchestration and self-healing

pub mod adaptive;
pub mod harmonia;
pub mod helios;
pub mod nexus;
pub mod selfheal;
pub mod sentinel;

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
