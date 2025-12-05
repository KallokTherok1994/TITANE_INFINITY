//! ═══════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.A - System State Module
//! Minimal state structure for all Tauri commands
//! ═══════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// État minimal universel pour toutes les réponses Tauri
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MinimalState {
    /// Succès de l'opération
    pub ok: bool,
    /// Timestamp UNIX (secondes)
    pub ts: i64,
}

impl MinimalState {
    /// Créer un nouvel état avec timestamp actuel
    pub fn new(ok: bool) -> Self {
        Self {
            ok,
            ts: chrono::Utc::now().timestamp(),
        }
    }

    /// État de succès par défaut
    pub fn success() -> Self {
        Self::new(true)
    }

    /// État d'échec par défaut
    pub fn failure() -> Self {
        Self::new(false)
    }
}

impl Default for MinimalState {
    fn default() -> Self {
        Self::success()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_minimal_state_creation() {
        let state = MinimalState::success();
        assert!(state.ok);
        assert!(state.ts > 0);
    }

    #[test]
    fn test_minimal_state_failure() {
        let state = MinimalState::failure();
        assert!(!state.ok);
    }
}
