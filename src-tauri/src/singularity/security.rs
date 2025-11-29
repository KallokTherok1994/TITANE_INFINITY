// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.0 — SINGULARITY SECURITY HARDENING
//   Self-check, structural validation, watchdog, STRICT mode
// ═══════════════════════════════════════════════════════════════

use super::singularity_state::SingularityState;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashSet;

const MIN_INTEGRITY: f32 = 0.7;
const MAX_INTEGRITY: f32 = 1.0;
const MIN_COHERENCE: f32 = 0.5;
const MAX_DEPTH: f32 = 10.0;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SingularityValidationError {
    IntegrityTooLow(f32),
    IntegrityTooHigh(f32),
    CoherenceTooLow(f32),
    DepthOutOfRange(f32),
    InvalidField(String),
    UnknownEngine(String),
    NaNDetected(String),
    HashMismatch { expected: String, actual: String },
}

#[derive(Debug, Clone)]
pub struct SingularityWatchdog {
    last_valid_hash: String,
    validation_count: u64,
    error_count: u64,
    strict_mode: bool,
}

impl Default for SingularityWatchdog {
    fn default() -> Self {
        Self::new()
    }
}

impl SingularityWatchdog {
    pub fn new() -> Self {
        Self {
            last_valid_hash: String::new(),
            validation_count: 0,
            error_count: 0,
            strict_mode: true, // Mode STRICT activé par défaut
        }
    }

    /// Enable/disable STRICT mode
    pub fn set_strict_mode(&mut self, enabled: bool) {
        self.strict_mode = enabled;
        log::info!("🔒 Singularity STRICT mode: {}", enabled);
    }

    /// Calculer le hash global de l'état
    pub fn compute_state_hash(state: &SingularityState) -> String {
        let json = serde_json::to_string(state).unwrap_or_default();
        let mut hasher = Sha256::new();
        hasher.update(json.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    /// Valider la structure complète
    pub fn validate_structure(
        &mut self,
        state: &SingularityState,
    ) -> Result<(), Vec<SingularityValidationError>> {
        let mut errors = Vec::new();

        // 1. Valider intégrité
        if state.integrity < MIN_INTEGRITY {
            errors.push(SingularityValidationError::IntegrityTooLow(state.integrity));
        }
        if state.integrity > MAX_INTEGRITY {
            errors.push(SingularityValidationError::IntegrityTooHigh(
                state.integrity,
            ));
        }

        // 2. Valider cohérence
        if state.global_coherence < MIN_COHERENCE {
            errors.push(SingularityValidationError::CoherenceTooLow(
                state.global_coherence,
            ));
        }

        // 3. Valider profondeurs
        if state.cognitive_depth < 0.0 || state.cognitive_depth > MAX_DEPTH {
            errors.push(SingularityValidationError::DepthOutOfRange(
                state.cognitive_depth,
            ));
        }
        if state.symbolic_depth < 0.0 || state.symbolic_depth > MAX_DEPTH {
            errors.push(SingularityValidationError::DepthOutOfRange(
                state.symbolic_depth,
            ));
        }

        // 4. Vérifier NaN
        if state.integrity.is_nan() {
            errors.push(SingularityValidationError::NaNDetected(
                "integrity".to_string(),
            ));
        }
        if state.global_coherence.is_nan() {
            errors.push(SingularityValidationError::NaNDetected(
                "global_coherence".to_string(),
            ));
        }

        // 5. Valider moteurs actifs (liste blanche)
        let valid_engines: HashSet<&str> = [
            "HyperEvolution",
            "CognitiveLearning",
            "NeuroSymbolic",
            "MetaCreation",
            "SelfRepair",
            "Singularity",
            "MemoryEngine",
            "ExperienceEngine",
        ]
        .iter()
        .cloned()
        .collect();

        for engine in &state.active_engines {
            if !valid_engines.contains(engine.as_str()) {
                errors.push(SingularityValidationError::UnknownEngine(engine.clone()));
            }
        }

        self.validation_count += 1;

        if !errors.is_empty() {
            self.error_count += 1;
            log::error!(
                "❌ Singularity validation failed: {} errors (total: {}/{})",
                errors.len(),
                self.error_count,
                self.validation_count
            );
            return Err(errors);
        }

        // Calculer et stocker le hash
        let current_hash = Self::compute_state_hash(state);
        self.last_valid_hash = current_hash;

        log::debug!(
            "✅ Singularity validation passed ({}/{})",
            self.validation_count,
            self.validation_count
        );

        Ok(())
    }

    /// Auto-réparation de l'état
    pub fn auto_repair(
        &mut self,
        state: &mut SingularityState,
    ) -> Result<(), Vec<SingularityValidationError>> {
        log::warn!("🔧 Attempting Singularity auto-repair...");

        // Réparer intégrité
        if state.integrity < MIN_INTEGRITY {
            state.integrity = MIN_INTEGRITY;
            log::info!("  Repaired integrity: {}", state.integrity);
        }
        if state.integrity > MAX_INTEGRITY {
            state.integrity = MAX_INTEGRITY;
            log::info!("  Capped integrity: {}", state.integrity);
        }

        // Réparer cohérence
        if state.global_coherence < MIN_COHERENCE {
            state.global_coherence = MIN_COHERENCE;
            log::info!("  Repaired coherence: {}", state.global_coherence);
        }

        // Réparer NaN
        if state.integrity.is_nan() {
            state.integrity = 0.8;
            log::info!("  Repaired NaN integrity");
        }
        if state.global_coherence.is_nan() {
            state.global_coherence = 0.8;
            log::info!("  Repaired NaN coherence");
        }

        // Réparer profondeurs
        state.cognitive_depth = state.cognitive_depth.clamp(0.0, MAX_DEPTH);
        state.symbolic_depth = state.symbolic_depth.clamp(0.0, MAX_DEPTH);

        // Retirer moteurs invalides
        let valid_engines: HashSet<&str> = [
            "HyperEvolution",
            "CognitiveLearning",
            "NeuroSymbolic",
            "MetaCreation",
            "SelfRepair",
            "Singularity",
        ]
        .iter()
        .cloned()
        .collect();

        state
            .active_engines
            .retain(|e| valid_engines.contains(e.as_str()));

        log::info!("✅ Auto-repair completed");

        // Revalider
        self.validate_structure(state)
    }

    /// Vérifier la cohérence du hash (détection de mutation externe)
    pub fn verify_hash(&self, state: &SingularityState) -> bool {
        if self.last_valid_hash.is_empty() {
            return true; // Pas encore de référence
        }

        let current_hash = Self::compute_state_hash(state);
        current_hash == self.last_valid_hash
    }

    /// Get statistics
    pub fn get_stats(&self) -> (u64, u64, f32) {
        let error_rate = if self.validation_count > 0 {
            self.error_count as f32 / self.validation_count as f32
        } else {
            0.0
        };
        (self.validation_count, self.error_count, error_rate)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_watchdog_validation() {
        let mut watchdog = SingularityWatchdog::new();
        let state = SingularityState::default();

        assert!(watchdog.validate_structure(&state).is_ok());
    }

    #[test]
    fn test_integrity_bounds() {
        let mut watchdog = SingularityWatchdog::new();
        let mut state = SingularityState {
            integrity: 0.5, // Too low
            ..Default::default()
        };

        assert!(watchdog.validate_structure(&state).is_err());

        state.integrity = 1.5; // Too high
        assert!(watchdog.validate_structure(&state).is_err());
    }

    #[test]
    fn test_auto_repair() {
        let mut watchdog = SingularityWatchdog::new();
        let mut state = SingularityState {
            integrity: 0.3,        // Invalid
            global_coherence: 0.2, // Invalid
            ..Default::default()
        };

        assert!(watchdog.auto_repair(&mut state).is_ok());
        assert!(state.integrity >= MIN_INTEGRITY);
        assert!(state.global_coherence >= MIN_COHERENCE);
    }

    #[test]
    fn test_unknown_engine() {
        let mut watchdog = SingularityWatchdog::new();
        let mut state = SingularityState::default();

        state.active_engines.push("UnknownEngine".to_string());

        assert!(watchdog.validate_structure(&state).is_err());
    }

    #[test]
    fn test_hash_verification() {
        let mut watchdog = SingularityWatchdog::new();
        let state = SingularityState::default();

        // First validation stores hash
        watchdog
            .validate_structure(&state)
            .expect("Failed to validate initial state structure");

        // Hash should match
        assert!(watchdog.verify_hash(&state));

        // Modify state
        let mut modified_state = state.clone();
        modified_state.integrity = 0.99;

        // Hash should not match
        assert!(!watchdog.verify_hash(&modified_state));
    }
}
