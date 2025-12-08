//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — BEHAVIOR STATE
//! État interne dynamique du moteur comportemental
//! ═══════════════════════════════════════════════════════════════════════════════

use super::BehaviorMode;
use serde::{Deserialize, Serialize};

/// État interne dynamique du comportement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BehaviorState {
    /// Stabilité comportementale (0-1, augmente avec le temps)
    pub stability: f32,
    /// Fluctuation actuelle (0-1, micro-adaptations)
    pub fluctuation: f32,
    /// Dernier mode utilisé
    pub last_mode: BehaviorMode,
    /// Description du dernier ajustement
    pub last_adjustment: Option<String>,
    /// Timestamp du dernier ajustement (ms depuis epoch)
    pub last_adjustment_time: u64,
    /// Nombre d'ajustements depuis le début de session
    pub adjustment_count: u32,
    /// Score de cohérence (0-1)
    pub coherence_score: f32,
}

impl Default for BehaviorState {
    fn default() -> Self {
        Self {
            stability: 0.5,
            fluctuation: 0.1,
            last_mode: BehaviorMode::Neutral,
            last_adjustment: None,
            last_adjustment_time: 0,
            adjustment_count: 0,
            coherence_score: 1.0,
        }
    }
}

impl BehaviorState {
    /// Crée un nouvel état
    pub fn new() -> Self {
        Self::default()
    }

    /// Met à jour la stabilité (augmente progressivement)
    pub fn update_stability(&mut self, delta: f32) {
        self.stability = (self.stability + delta).clamp(0.0, 1.0);
    }

    /// Met à jour la fluctuation (décroît naturellement)
    pub fn decay_fluctuation(&mut self, decay_rate: f32) {
        self.fluctuation = (self.fluctuation * (1.0 - decay_rate)).max(0.01);
    }

    /// Enregistre un ajustement
    pub fn record_adjustment(&mut self, description: &str, mode: BehaviorMode) {
        self.last_adjustment = Some(description.to_string());
        self.last_mode = mode;
        self.last_adjustment_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        self.adjustment_count += 1;

        // Augmenter légèrement la fluctuation après un ajustement
        self.fluctuation = (self.fluctuation + 0.05).min(0.5);
    }

    /// Vérifie si un ajustement est autorisé (cooldown)
    pub fn can_adjust(&self, cooldown_ms: u64) -> bool {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        now - self.last_adjustment_time >= cooldown_ms
    }

    /// Met à jour le score de cohérence
    pub fn update_coherence(&mut self, new_score: f32) {
        // Moyenne mobile
        self.coherence_score = self.coherence_score * 0.8 + new_score * 0.2;
    }

    /// Retourne un résumé de l'état
    pub fn summary(&self) -> String {
        format!(
            "Behavior State: stability={:.2}, fluctuation={:.2}, mode={:?}, coherence={:.2}",
            self.stability, self.fluctuation, self.last_mode, self.coherence_score
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_state() {
        let state = BehaviorState::default();
        assert_eq!(state.stability, 0.5);
        assert!(state.fluctuation > 0.0);
    }

    #[test]
    fn test_update_stability() {
        let mut state = BehaviorState::default();
        state.update_stability(0.1);
        assert_eq!(state.stability, 0.6);

        state.update_stability(1.0);
        assert_eq!(state.stability, 1.0); // Clamped
    }

    #[test]
    fn test_decay_fluctuation() {
        let mut state = BehaviorState::default();
        state.fluctuation = 0.5;
        state.decay_fluctuation(0.1);
        assert!(state.fluctuation < 0.5);
    }

    #[test]
    fn test_record_adjustment() {
        let mut state = BehaviorState::default();
        state.record_adjustment("Test adjustment", BehaviorMode::Coach);

        assert_eq!(state.adjustment_count, 1);
        assert_eq!(state.last_mode, BehaviorMode::Coach);
        assert!(state.last_adjustment.is_some());
    }
}
