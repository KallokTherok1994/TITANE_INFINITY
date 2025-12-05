use crate::cognitive::security::*;
/**
 * TITANE∞ v17 - Watchdog Fixer
 *
 * Auto-réparation du système cognitif
 */
use crate::cognitive::CognitiveState;
use crate::watchdog::alerts::{AlertLevel, WatchdogAlert};
use crate::watchdog::scanner::Anomaly;
use serde::{Deserialize, Serialize};

#[cfg(test)]
use crate::watchdog::scanner::AnomalyType;

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FixAction {
    /// Sanitized valeurs invalides
    Sanitize { fields_fixed: Vec<String> },
    /// Rollback vers état précédent
    Rollback { reason: String },
    /// Réinitialisation partielle
    PartialReset { components: Vec<String> },
    /// Recalcul cohérence
    RecalculateCoherence,
    /// Aucune action nécessaire
    NoAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixResult {
    pub success: bool,
    pub action: FixAction,
    pub anomalies_fixed: usize,
    pub alerts: Vec<WatchdogAlert>,
    pub timestamp: u64,
}

// ────────────────────────────────────────────────────────────────
// WatchdogFixer
// ────────────────────────────────────────────────────────────────

pub struct WatchdogFixer {
    last_valid_state: Option<CognitiveState>,
}

impl WatchdogFixer {
    pub fn new() -> Self {
        Self {
            last_valid_state: None,
        }
    }

    /**
     * Tente de réparer un CognitiveState avec anomalies détectées
     *
     * Stratégie:
     * 1. Sanitize si anomalies mineures (NaN, out of bounds)
     * 2. Rollback si corruption majeure
     * 3. Partial reset si cohérence critique
     */
    pub fn fix(&mut self, current: &mut CognitiveState, anomalies: &[Anomaly]) -> FixResult {
        let mut alerts = Vec::new();
        let start_timestamp = crate::core::utils::now_ms();

        // [0] Aucune anomalie
        if anomalies.is_empty() {
            // Sauvegarder état valide
            self.last_valid_state = Some(current.clone());
            return FixResult {
                success: true,
                action: FixAction::NoAction,
                anomalies_fixed: 0,
                alerts,
                timestamp: start_timestamp,
            };
        }

        // [1] Analyser sévérité des anomalies
        let has_critical = anomalies.iter().any(|a| a.severity == AlertLevel::Critical);
        let has_errors = anomalies.iter().any(|a| a.severity == AlertLevel::Error);

        // [2] Cas CRITICAL → Rollback
        if has_critical {
            if let Some(prev_state) = &self.last_valid_state {
                *current = prev_state.clone();
                current.timestamp = crate::core::utils::now_ms();

                alerts.push(WatchdogAlert::critical(
                    "Critical corruption detected".to_string(),
                    format!("{} critical anomalies", anomalies.len()),
                    "Rolled back to last valid state".to_string(),
                ));

                return FixResult {
                    success: true,
                    action: FixAction::Rollback {
                        reason: "Critical anomalies detected".to_string(),
                    },
                    anomalies_fixed: anomalies.len(),
                    alerts,
                    timestamp: start_timestamp,
                };
            } else {
                // Pas de rollback possible → Partial reset
                alerts.push(WatchdogAlert::critical(
                    "No valid state for rollback".to_string(),
                    "Performing partial reset".to_string(),
                    "Reset to defaults".to_string(),
                ));

                *current = CognitiveState::new();

                return FixResult {
                    success: true,
                    action: FixAction::PartialReset {
                        components: vec!["all".to_string()],
                    },
                    anomalies_fixed: anomalies.len(),
                    alerts,
                    timestamp: start_timestamp,
                };
            }
        }

        // [3] Cas ERROR → Sanitize + Repair
        if has_errors {
            // Clone prev pour éviter borrow conflict
            let prev_clone = if let Some(prev_state) = &self.last_valid_state {
                prev_state.clone()
            } else {
                current.clone()
            };

            match cognitive_auto_repair(&prev_clone, current) {
                Ok(msg) => {
                    alerts.push(
                        WatchdogAlert::warn("Auto-repair successful".to_string(), msg.clone())
                            .with_action("Sanitized invalid values".to_string()),
                    );

                    // Sauvegarder nouvel état valide
                    self.last_valid_state = Some(current.clone());

                    return FixResult {
                        success: true,
                        action: FixAction::Sanitize {
                            fields_fixed: vec!["multiple".to_string()],
                        },
                        anomalies_fixed: anomalies.len(),
                        alerts,
                        timestamp: start_timestamp,
                    };
                }
                Err(err) => {
                    alerts.push(WatchdogAlert::error(
                        "Auto-repair failed".to_string(),
                        err.clone(),
                    ));

                    return FixResult {
                        success: false,
                        action: FixAction::NoAction,
                        anomalies_fixed: 0,
                        alerts,
                        timestamp: start_timestamp,
                    };
                }
            }
        }

        // [4] Cas WARN → Sanitize léger
        cognitive_sanitize(current);
        current.update_coherence();

        alerts.push(WatchdogAlert::info(
            "Minor issues sanitized".to_string(),
            format!("{} warnings resolved", anomalies.len()),
        ));

        // Sauvegarder état valide
        self.last_valid_state = Some(current.clone());

        FixResult {
            success: true,
            action: FixAction::Sanitize {
                fields_fixed: vec!["minor".to_string()],
            },
            anomalies_fixed: anomalies.len(),
            alerts,
            timestamp: start_timestamp,
        }
    }

    /**
     * Force un rollback immédiat (usage interne)
     */
    pub fn force_rollback(&mut self, current: &mut CognitiveState) -> bool {
        if let Some(prev) = &self.last_valid_state {
            *current = prev.clone();
            current.timestamp = crate::core::utils::now_ms();
            true
        } else {
            false
        }
    }

    /**
     * Réinitialisation complète (dernier recours)
     */
    pub fn full_reset(&mut self, current: &mut CognitiveState) {
        *current = CognitiveState::new();
        self.last_valid_state = Some(current.clone());
    }
}

impl Default for WatchdogFixer {
    fn default() -> Self {
        Self::new()
    }
}

// ────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fixer_no_anomalies() {
        let mut fixer = WatchdogFixer::new();
        let mut state = CognitiveState::new();

        let result = fixer.fix(&mut state, &[]);
        assert!(result.success);
        assert!(matches!(result.action, FixAction::NoAction));
        assert_eq!(result.anomalies_fixed, 0);
    }

    #[test]
    fn test_fixer_sanitize_warnings() {
        let mut fixer = WatchdogFixer::new();
        let mut state = CognitiveState::new();

        let anomalies = vec![Anomaly {
            anomaly_type: AnomalyType::OutOfBounds {
                field: "test".to_string(),
                value: 1.5,
                min: 0.0,
                max: 1.0,
            },
            severity: AlertLevel::Warn,
            detected_at: crate::core::utils::now_ms(),
            context: "test".to_string(),
        }];

        let result = fixer.fix(&mut state, &anomalies);
        assert!(result.success);
        assert!(matches!(result.action, FixAction::Sanitize { .. }));
    }

    #[test]
    fn test_fixer_rollback_critical() {
        let mut fixer = WatchdogFixer::new();
        let mut state = CognitiveState::new();

        // Sauvegarder état valide
        fixer.fix(&mut state, &[]);

        // Corrompre état
        state.mental.charge.current = f32::NAN;

        let anomalies = vec![Anomaly {
            anomaly_type: AnomalyType::NaNDetected {
                fields: vec!["mental.charge.current".to_string()],
            },
            severity: AlertLevel::Critical,
            detected_at: crate::core::utils::now_ms(),
            context: "test".to_string(),
        }];

        let result = fixer.fix(&mut state, &anomalies);
        assert!(result.success);
        assert!(matches!(result.action, FixAction::Rollback { .. }));
        assert!(!state.mental.charge.current.is_nan());
    }

    #[test]
    fn test_fixer_partial_reset_no_rollback() {
        let mut fixer = WatchdogFixer::new();
        let mut state = CognitiveState::new();
        state.mental.charge.current = f32::NAN;

        let anomalies = vec![Anomaly {
            anomaly_type: AnomalyType::NaNDetected {
                fields: vec!["mental.charge.current".to_string()],
            },
            severity: AlertLevel::Critical,
            detected_at: crate::core::utils::now_ms(),
            context: "test".to_string(),
        }];

        let result = fixer.fix(&mut state, &anomalies);
        assert!(result.success);
        assert!(matches!(result.action, FixAction::PartialReset { .. }));
    }

    #[test]
    fn test_force_rollback() {
        let mut fixer = WatchdogFixer::new();
        let mut state = CognitiveState::new();

        // Sauvegarder
        fixer.fix(&mut state, &[]);

        // Modifier
        state.mental.charge.current = 0.9;

        // Rollback
        let success = fixer.force_rollback(&mut state);
        assert!(success);
        assert!(state.mental.charge.current < 0.9);
    }

    #[test]
    fn test_full_reset() {
        let mut fixer = WatchdogFixer::new();
        let mut state = CognitiveState::new();
        state.mental.charge.current = 0.9;

        fixer.full_reset(&mut state);

        // Devrait être proche des valeurs par défaut
        assert!(state.mental.charge.current < 0.5);
    }
}
