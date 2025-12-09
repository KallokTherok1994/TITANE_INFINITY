//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ vΩ — STABILIZATION LAYER
//! Super Prompt #20 — Stabilisation cognitive & prévention dérives
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use tokio::sync::RwLock;

/// Mode de stabilisation
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum StabilizationMode {
    /// Mode normal - stabilisation standard
    Normal,
    /// Mode conservateur - priorité stabilité sur performance
    Conservative,
    /// Mode agressif - stabilisation forcée
    Aggressive,
    /// Mode adaptatif - ajuste selon conditions
    Adaptive,
}

/// Métriques de stabilité
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StabilityMetrics {
    pub coherence_score: f32,      // 0.0-1.0
    pub drift_magnitude: f32,      // 0.0-inf
    pub oscillation_amplitude: f32, // 0.0-inf
    pub convergence_rate: f32,     // -inf-+inf
    pub stability_index: f32,      // 0.0-1.0
}

impl StabilityMetrics {
    pub fn is_stable(&self) -> bool {
        self.coherence_score > 0.7
            && self.drift_magnitude < 0.3
            && self.oscillation_amplitude < 0.5
            && self.stability_index > 0.6
    }

    pub fn needs_intervention(&self) -> bool {
        self.coherence_score < 0.5
            || self.drift_magnitude > 0.5
            || self.oscillation_amplitude > 0.8
            || self.stability_index < 0.4
    }
}

/// Signal de stabilisation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StabilizationSignal {
    pub timestamp: u64,
    pub mode: StabilizationMode,
    pub energy_level: f32,
    pub fatigue_level: f32,
    pub load_level: f32,
}

/// Action de stabilisation
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum StabilizationAction {
    /// Aucune action nécessaire
    None,
    /// Réduction progressive de charge
    ReduceLoad,
    /// Simplification des réponses
    SimplifyResponses,
    /// Augmentation récupération
    IncreaseRecovery,
    /// Réinitialisation douce
    SoftReset,
    /// Réinitialisation complète
    HardReset,
    /// Mode sûr cognitif
    SafeMode,
}

/// Décision de stabilisation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StabilizationDecision {
    pub action: StabilizationAction,
    pub reason: String,
    pub urgency: f32,
    pub expected_impact: f32,
}

/// Couche de stabilisation
pub struct StabilizationLayer {
    mode: RwLock<StabilizationMode>,
    signal_history: RwLock<VecDeque<StabilizationSignal>>,
    metrics_history: RwLock<VecDeque<StabilityMetrics>>,
    max_history: usize,
    intervention_threshold: f32,
}

impl StabilizationLayer {
    pub fn new() -> Self {
        Self {
            mode: RwLock::new(StabilizationMode::Adaptive),
            signal_history: RwLock::new(VecDeque::with_capacity(100)),
            metrics_history: RwLock::new(VecDeque::with_capacity(100)),
            max_history: 100,
            intervention_threshold: 0.5,
        }
    }

    /// Enregistrer signal
    pub async fn record_signal(&self, signal: StabilizationSignal) {
        let mut history = self.signal_history.write().await;
        
        if history.len() >= self.max_history {
            history.pop_front();
        }
        
        history.push_back(signal);
    }

    /// Calculer métriques de stabilité
    pub async fn compute_stability(&self) -> StabilityMetrics {
        let history = self.signal_history.read().await;

        if history.is_empty() {
            return StabilityMetrics {
                coherence_score: 1.0,
                drift_magnitude: 0.0,
                oscillation_amplitude: 0.0,
                convergence_rate: 0.0,
                stability_index: 1.0,
            };
        }

        // Calculer cohérence (variabilité des niveaux d'énergie)
        let energy_values: Vec<f32> = history.iter()
            .map(|s| s.energy_level)
            .collect();
        
        let coherence_score = self.calculate_coherence(&energy_values);

        // Calculer dérive (tendance long terme)
        let drift_magnitude = self.calculate_drift(&energy_values);

        // Calculer oscillations (variations court terme)
        let oscillation_amplitude = self.calculate_oscillations(&energy_values);

        // Calculer taux de convergence
        let convergence_rate = self.calculate_convergence(&energy_values);

        // Index de stabilité global
        let stability_index = (coherence_score * 0.4)
            + ((1.0 - drift_magnitude.min(1.0)) * 0.3)
            + ((1.0 - oscillation_amplitude.min(1.0)) * 0.3);

        let metrics = StabilityMetrics {
            coherence_score,
            drift_magnitude,
            oscillation_amplitude,
            convergence_rate,
            stability_index,
        };

        // Enregistrer métriques
        let mut metrics_history = self.metrics_history.write().await;
        if metrics_history.len() >= self.max_history {
            metrics_history.pop_front();
        }
        metrics_history.push_back(metrics.clone());

        metrics
    }

    /// Évaluer stabilisation nécessaire
    pub async fn evaluate(&self) -> Option<StabilizationDecision> {
        let metrics = self.compute_stability().await;
        let mode = *self.mode.read().await;

        if !metrics.needs_intervention() {
            return None;
        }

        // Déterminer action selon gravité
        let action = if metrics.stability_index < 0.2 {
            StabilizationAction::SafeMode
        } else if metrics.stability_index < 0.4 {
            StabilizationAction::HardReset
        } else if metrics.drift_magnitude > 0.7 {
            StabilizationAction::SoftReset
        } else if metrics.oscillation_amplitude > 0.6 {
            StabilizationAction::ReduceLoad
        } else {
            StabilizationAction::SimplifyResponses
        };

        let urgency = 1.0 - metrics.stability_index;

        Some(StabilizationDecision {
            action,
            reason: format!(
                "Stability index: {:.2}, Coherence: {:.2}, Drift: {:.2}, Oscillation: {:.2}",
                metrics.stability_index,
                metrics.coherence_score,
                metrics.drift_magnitude,
                metrics.oscillation_amplitude
            ),
            urgency,
            expected_impact: self.estimate_impact(&action),
        })
    }

    /// Calculer cohérence
    fn calculate_coherence(&self, values: &[f32]) -> f32 {
        if values.len() < 2 {
            return 1.0;
        }

        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter()
            .map(|v| (v - mean).powi(2))
            .sum::<f32>() / values.len() as f32;
        
        let std_dev = variance.sqrt();

        // Cohérence élevée = faible variance
        (1.0 - std_dev.min(1.0)).max(0.0)
    }

    /// Calculer dérive
    fn calculate_drift(&self, values: &[f32]) -> f32 {
        if values.len() < 5 {
            return 0.0;
        }

        // Régression linéaire simple
        let n = values.len() as f32;
        let x_mean = (n - 1.0) / 2.0;
        let y_mean = values.iter().sum::<f32>() / n;

        let mut numerator = 0.0;
        let mut denominator = 0.0;

        for (i, &y) in values.iter().enumerate() {
            let x = i as f32;
            numerator += (x - x_mean) * (y - y_mean);
            denominator += (x - x_mean).powi(2);
        }

        if denominator == 0.0 {
            return 0.0;
        }

        let slope = numerator / denominator;
        slope.abs()
    }

    /// Calculer oscillations
    fn calculate_oscillations(&self, values: &[f32]) -> f32 {
        if values.len() < 3 {
            return 0.0;
        }

        let mut changes = 0.0;
        let mut direction_changes = 0;

        for i in 1..values.len() {
            let diff = values[i] - values[i - 1];
            changes += diff.abs();

            if i > 1 {
                let prev_diff = values[i - 1] - values[i - 2];
                if (diff > 0.0) != (prev_diff > 0.0) {
                    direction_changes += 1;
                }
            }
        }

        let avg_change = changes / (values.len() - 1) as f32;
        let oscillation_frequency = direction_changes as f32 / (values.len() - 2) as f32;

        avg_change * oscillation_frequency
    }

    /// Calculer convergence
    fn calculate_convergence(&self, values: &[f32]) -> f32 {
        if values.len() < 10 {
            return 0.0;
        }

        let recent = &values[values.len() - 5..];
        let older = &values[values.len() - 10..values.len() - 5];

        let recent_mean = recent.iter().sum::<f32>() / recent.len() as f32;
        let older_mean = older.iter().sum::<f32>() / older.len() as f32;

        recent_mean - older_mean
    }

    /// Estimer impact action
    fn estimate_impact(&self, action: &StabilizationAction) -> f32 {
        match action {
            StabilizationAction::None => 0.0,
            StabilizationAction::SimplifyResponses => 0.2,
            StabilizationAction::ReduceLoad => 0.4,
            StabilizationAction::IncreaseRecovery => 0.3,
            StabilizationAction::SoftReset => 0.6,
            StabilizationAction::HardReset => 0.8,
            StabilizationAction::SafeMode => 1.0,
        }
    }

    /// Définir mode
    pub async fn set_mode(&self, mode: StabilizationMode) {
        *self.mode.write().await = mode;
    }

    /// Obtenir mode actuel
    pub async fn get_mode(&self) -> StabilizationMode {
        *self.mode.read().await
    }

    /// Obtenir historique métriques
    pub async fn get_metrics_history(&self) -> Vec<StabilityMetrics> {
        self.metrics_history.read().await.iter().cloned().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_stabilization_layer_creation() {
        let layer = StabilizationLayer::new();
        let mode = layer.get_mode().await;
        
        assert_eq!(mode, StabilizationMode::Adaptive);
    }

    #[tokio::test]
    async fn test_signal_recording() {
        let layer = StabilizationLayer::new();

        let signal = StabilizationSignal {
            timestamp: 1000,
            mode: StabilizationMode::Normal,
            energy_level: 0.8,
            fatigue_level: 0.2,
            load_level: 0.5,
        };

        layer.record_signal(signal).await;

        let metrics = layer.compute_stability().await;
        assert!(metrics.stability_index > 0.0);
    }

    #[tokio::test]
    async fn test_stable_system() {
        let layer = StabilizationLayer::new();

        // Enregistrer signaux stables
        for i in 0..10 {
            layer.record_signal(StabilizationSignal {
                timestamp: i * 1000,
                mode: StabilizationMode::Normal,
                energy_level: 0.8,
                fatigue_level: 0.2,
                load_level: 0.5,
            }).await;
        }

        let metrics = layer.compute_stability().await;
        assert!(metrics.is_stable());
    }

    #[tokio::test]
    async fn test_unstable_system() {
        let layer = StabilizationLayer::new();

        // Enregistrer signaux instables (oscillations)
        for i in 0..10 {
            let energy = if i % 2 == 0 { 0.9 } else { 0.1 };
            layer.record_signal(StabilizationSignal {
                timestamp: i * 1000,
                mode: StabilizationMode::Normal,
                energy_level: energy,
                fatigue_level: 0.5,
                load_level: 0.7,
            }).await;
        }

        let metrics = layer.compute_stability().await;
        assert!(metrics.oscillation_amplitude > 0.3);
    }

    #[tokio::test]
    async fn test_stabilization_decision() {
        let layer = StabilizationLayer::new();

        // Créer instabilité
        for i in 0..10 {
            layer.record_signal(StabilizationSignal {
                timestamp: i * 1000,
                mode: StabilizationMode::Normal,
                energy_level: 0.2, // Énergie très basse
                fatigue_level: 0.9,
                load_level: 0.95,
            }).await;
        }

        let decision = layer.evaluate().await;
        assert!(decision.is_some());
        
        if let Some(d) = decision {
            assert_ne!(d.action, StabilizationAction::None);
            assert!(d.urgency > 0.5);
        }
    }
}
