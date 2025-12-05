// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — COMPAT: MetaModeEngine stub
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaModeEngine;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaModeConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaModeResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KevinState {
    pub energy: f32,
    pub focus: f32,
}

impl Default for KevinState {
    fn default() -> Self {
        Self {
            energy: 1.0,
            focus: 1.0,
        }
    }
}
