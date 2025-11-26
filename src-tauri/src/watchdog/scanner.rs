/**
 * TITANE∞ v17 - Watchdog Scanner
 *
 * Détection d'anomalies dans le système cognitif:
 * - Cognitive load incohérent
 * - Timeline corrompue (si présente)
 * - SingularityState mismatch
 * - Moteurs désynchronisés
 */
use crate::cognitive::CognitiveState;
use crate::cognitive::security::*;
use crate::singularity::SingularityState;
use crate::watchdog::alerts::AlertLevel;
use serde::{Serialize, Deserialize};

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnomalyType {
    /// Cognitive load dépasse capacité
    CognitiveOverload { current: f32, capacity: f32 },
    /// Cohérence globale trop faible
    LowCoherence { coherence: f32, threshold: f32 },
    /// Hash mismatch détecté
    HashMismatch { expected: String, got: String },
    /// Transition invalide
    InvalidTransition { from_state: String, to_state: String, reason: String },
    /// Valeurs NaN détectées
    NaNDetected { fields: Vec<String> },
    /// Valeurs hors limites
    OutOfBounds { field: String, value: f32, min: f32, max: f32 },
    /// Désynchronisation avec SingularityState
    SingularityMismatch { reason: String },
    /// Historique trop long
    HistoryOverflow { current_size: usize, max_size: usize },
    /// Timestamp invalide
    InvalidTimestamp { timestamp: u64, reason: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub anomaly_type: AnomalyType,
    pub severity: AlertLevel,
    pub detected_at: u64,
    pub context: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub clean: bool,
    pub anomalies: Vec<Anomaly>,
    pub scan_duration_ms: u64,
    pub timestamp: u64,
}

// ────────────────────────────────────────────────────────────────
// WatchdogScanner
// ────────────────────────────────────────────────────────────────

pub struct WatchdogScanner {
    last_cognitive_hash: Option<String>,
    last_scan_timestamp: u64,
}

impl WatchdogScanner {
    pub fn new() -> Self {
        Self {
            last_cognitive_hash: None,
            last_scan_timestamp: 0,
        }
    }

    /**
     * Scan complet du système cognitif
     *
     * Vérifie:
     * - Validation structurelle CognitiveState
     * - Hash integrity
     * - Cohérence globale
     * - Synchronisation SingularityState
     */
    pub fn scan(
        &mut self,
        cognitive: &CognitiveState,
        singularity: &SingularityState,
    ) -> ScanResult {
        let start_time = std::time::Instant::now();
        let mut anomalies = Vec::new();

        // [1] Validation structurelle
        let validation = cognitive_validate(cognitive);
        if !validation.valid {
            for error in &validation.errors {
                anomalies.push(self.create_anomaly_from_error(error));
            }
        }

        // [2] Vérifier warnings (non-bloquant mais important)
        for warning in &validation.warnings {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::OutOfBounds {
                    field: "various".to_string(),
                    value: 0.0,
                    min: 0.0,
                    max: 1.0,
                },
                severity: AlertLevel::Warn,
                detected_at: crate::core::utils::now_ms(),
                context: warning.clone(),
            });
        }

        // [3] Vérifier hash integrity
        let current_hash = cognitive_compute_hash(cognitive);
        if let Some(expected_hash) = &self.last_cognitive_hash {
            // Vérifier si changement cohérent
            if current_hash != *expected_hash {
                // Hash différent, vérifier si transition valide
                // (on ne peut pas facilement retrouver prev ici, donc juste signaler)
                anomalies.push(Anomaly {
                    anomaly_type: AnomalyType::HashMismatch {
                        expected: expected_hash.clone(),
                        got: current_hash.clone(),
                    },
                    severity: AlertLevel::Info,
                    detected_at: crate::core::utils::now_ms(),
                    context: "State changed since last scan".to_string(),
                });
            }
        }
        self.last_cognitive_hash = Some(current_hash);

        // [4] Vérifier cognitive overload
        if cognitive.mental.charge.is_overloaded() {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::CognitiveOverload {
                    current: cognitive.mental.charge.current,
                    capacity: cognitive.mental.charge.capacity,
                },
                severity: AlertLevel::Error,
                detected_at: crate::core::utils::now_ms(),
                context: "Mental charge exceeds capacity".to_string(),
            });
        }

        // [5] Vérifier cohérence globale
        if cognitive.coherence.global < 0.3 {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::LowCoherence {
                    coherence: cognitive.coherence.global,
                    threshold: 0.3,
                },
                severity: AlertLevel::Error,
                detected_at: crate::core::utils::now_ms(),
                context: "Global coherence critically low".to_string(),
            });
        } else if cognitive.coherence.global < 0.5 {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::LowCoherence {
                    coherence: cognitive.coherence.global,
                    threshold: 0.5,
                },
                severity: AlertLevel::Warn,
                detected_at: crate::core::utils::now_ms(),
                context: "Global coherence below optimal".to_string(),
            });
        }

        // [6] Vérifier synchronisation avec SingularityState
        // Cognitive depth dans singularity devrait être cohérent avec cognitive.coherence.global
        let expected_depth = cognitive.coherence.global * 10.0; // Approximation
        let depth_delta = (singularity.cognitive_depth - expected_depth).abs();
        if depth_delta > 3.0 {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::SingularityMismatch {
                    reason: format!(
                        "Cognitive depth mismatch: singularity={:.2}, expected≈{:.2} (Δ={:.2})",
                        singularity.cognitive_depth, expected_depth, depth_delta
                    ),
                },
                severity: AlertLevel::Warn,
                detected_at: crate::core::utils::now_ms(),
                context: "SingularityState not aligned with CognitiveState".to_string(),
            });
        }

        // [7] Vérifier timestamp
        if cognitive.timestamp < self.last_scan_timestamp {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::InvalidTimestamp {
                    timestamp: cognitive.timestamp,
                    reason: "Timestamp before last scan (backwards in time)".to_string(),
                },
                severity: AlertLevel::Critical,
                detected_at: crate::core::utils::now_ms(),
                context: format!(
                    "Current: {}, Last scan: {}",
                    cognitive.timestamp, self.last_scan_timestamp
                ),
            });
        }
        self.last_scan_timestamp = cognitive.timestamp;

        let duration = start_time.elapsed().as_millis() as u64;

        ScanResult {
            clean: anomalies.is_empty(),
            anomalies,
            scan_duration_ms: duration,
            timestamp: crate::core::utils::now_ms(),
        }
    }

    /**
     * Créer une anomalie depuis un message d'erreur de validation
     */
    fn create_anomaly_from_error(&self, error: &str) -> Anomaly {
        let anomaly_type = if error.contains("NaN") {
            AnomalyType::NaNDetected {
                fields: vec![error.to_string()],
            }
        } else if error.contains("out of bounds") {
            AnomalyType::OutOfBounds {
                field: error.to_string(),
                value: 0.0,
                min: 0.0,
                max: 1.0,
            }
        } else {
            AnomalyType::InvalidTransition {
                from_state: "unknown".to_string(),
                to_state: "unknown".to_string(),
                reason: error.to_string(),
            }
        };

        Anomaly {
            anomaly_type,
            severity: AlertLevel::Error,
            detected_at: crate::core::utils::now_ms(),
            context: error.to_string(),
        }
    }

    /**
     * Scan rapide (seulement checks critiques)
     */
    pub fn quick_scan(&self, cognitive: &CognitiveState) -> Vec<Anomaly> {
        let mut anomalies = Vec::new();

        // Check NaN
        if cognitive.mental.charge.current.is_nan() {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::NaNDetected {
                    fields: vec!["mental.charge.current".to_string()],
                },
                severity: AlertLevel::Critical,
                detected_at: crate::core::utils::now_ms(),
                context: "NaN detected in critical field".to_string(),
            });
        }

        // Check overload
        if cognitive.mental.charge.is_overloaded() {
            anomalies.push(Anomaly {
                anomaly_type: AnomalyType::CognitiveOverload {
                    current: cognitive.mental.charge.current,
                    capacity: cognitive.mental.charge.capacity,
                },
                severity: AlertLevel::Error,
                detected_at: crate::core::utils::now_ms(),
                context: "Overload detected".to_string(),
            });
        }

        anomalies
    }
}

impl Default for WatchdogScanner {
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
    fn test_scanner_clean_state() {
        let mut scanner = WatchdogScanner::new();
        let cognitive = CognitiveState::new();
        let singularity = SingularityState::new();

        let result = scanner.scan(&cognitive, &singularity);
        assert!(result.clean || result.anomalies.iter().all(|a| matches!(a.severity, AlertLevel::Info | AlertLevel::Warn)));
    }

    #[test]
    fn test_scanner_detect_nan() {
        let mut scanner = WatchdogScanner::new();
        let mut cognitive = CognitiveState::new();
        cognitive.mental.charge.current = f32::NAN;
        let singularity = SingularityState::new();

        let result = scanner.scan(&cognitive, &singularity);
        assert!(!result.clean);
        assert!(result.anomalies.iter().any(|a| matches!(
            a.anomaly_type,
            AnomalyType::NaNDetected { .. }
        )));
    }

    #[test]
    fn test_scanner_detect_overload() {
        let mut scanner = WatchdogScanner::new();
        let mut cognitive = CognitiveState::new();
        cognitive.mental.charge.current = 1.0;
        cognitive.mental.charge.capacity = 0.8;
        let singularity = SingularityState::new();

        let result = scanner.scan(&cognitive, &singularity);
        assert!(!result.clean);
        assert!(result.anomalies.iter().any(|a| matches!(
            a.anomaly_type,
            AnomalyType::CognitiveOverload { .. }
        )));
    }

    #[test]
    fn test_scanner_detect_low_coherence() {
        let mut scanner = WatchdogScanner::new();
        let mut cognitive = CognitiveState::new();
        cognitive.coherence.global = 0.2;
        let singularity = SingularityState::new();

        let result = scanner.scan(&cognitive, &singularity);
        assert!(!result.clean);
        assert!(result.anomalies.iter().any(|a| matches!(
            a.anomaly_type,
            AnomalyType::LowCoherence { .. }
        )));
    }

    #[test]
    fn test_quick_scan() {
        let scanner = WatchdogScanner::new();
        let mut cognitive = CognitiveState::new();
        cognitive.mental.charge.current = f32::NAN;

        let anomalies = scanner.quick_scan(&cognitive);
        assert!(!anomalies.is_empty());
        assert!(anomalies.iter().any(|a| matches!(
            a.anomaly_type,
            AnomalyType::NaNDetected { .. }
        )));
    }
}
