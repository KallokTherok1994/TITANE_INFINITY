//! TITANE∞ v20Ω — Quantum State
//! État quantique et superposition de prédictions

use super::{PredictedAction, UserEvent};
use serde::{Deserialize, Serialize};

/// Amplitude quantique pour une action
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct QuantumAmplitude {
    pub action: PredictedAction,
    pub amplitude: f64, // Amplitude complexe simplifiée (partie réelle)
    pub phase: f64,     // Phase de l'onde
}

impl QuantumAmplitude {
    /// Calcule la probabilité (carré de l'amplitude)
    pub fn probability(&self) -> f64 {
        self.amplitude * self.amplitude
    }
}

/// État quantique du système
#[derive(Clone, Debug)]
pub struct QuantumState {
    /// Superposition des états possibles
    superposition: Vec<QuantumAmplitude>,
    /// Cohérence du système (0-1)
    coherence: f64,
    /// Entropie de von Neumann
    entropy: f64,
    /// Temps depuis le dernier collapse
    time_since_collapse: u64,
    /// Facteur de décohérence
    decoherence_rate: f64,
}

impl QuantumState {
    /// Crée un nouvel état quantique
    pub fn new() -> Self {
        let mut state = Self {
            superposition: Vec::new(),
            coherence: 1.0,
            entropy: 0.0,
            time_since_collapse: 0,
            decoherence_rate: 0.01, // 1% par mise à jour
        };

        // Initialiser la superposition avec des états de base
        state.initialize_superposition();
        state
    }

    /// Initialise la superposition d'états
    fn initialize_superposition(&mut self) {
        let base_actions = vec![
            PredictedAction::Navigate {
                path: String::new(),
            },
            PredictedAction::Search {
                query_hint: String::new(),
            },
            PredictedAction::Interact {
                element_type: String::new(),
                action: String::new(),
            },
            PredictedAction::RequestHelp {
                topic: String::new(),
            },
            PredictedAction::Configure {
                setting: String::new(),
            },
            PredictedAction::Create {
                content_type: String::new(),
            },
            PredictedAction::Export {
                format: String::new(),
            },
            PredictedAction::Abandon,
        ];

        // Distribution uniforme initiale
        let n = base_actions.len() as f64;
        let initial_amplitude = (1.0 / n).sqrt();

        for (i, action) in base_actions.into_iter().enumerate() {
            self.superposition.push(QuantumAmplitude {
                action,
                amplitude: initial_amplitude,
                phase: 2.0 * std::f64::consts::PI * i as f64 / n,
            });
        }

        self.calculate_entropy();
    }

    /// Met à jour l'état basé sur un événement (évolution unitaire)
    pub fn update(&mut self, event: &UserEvent) {
        // Appliquer l'opérateur d'évolution
        self.apply_evolution_operator(event);

        // Décohérence naturelle
        self.apply_decoherence();

        // Recalculer l'entropie
        self.calculate_entropy();

        // Incrémenter le temps
        self.time_since_collapse += 1;
    }

    /// Applique l'opérateur d'évolution basé sur l'événement
    fn apply_evolution_operator(&mut self, event: &UserEvent) {
        let event_type = &event.event_type;

        // Amplifier les états cohérents avec l'événement
        for amplitude in &mut self.superposition {
            let relevance = Self::calculate_relevance_static(&amplitude.action, event_type);

            // Rotation de phase et modification d'amplitude
            amplitude.phase += relevance * std::f64::consts::PI / 4.0;
            amplitude.amplitude *= 1.0 + relevance * 0.1;
        }

        // Normaliser
        self.normalize();
    }

    /// Calcule la pertinence d'une action par rapport à un événement (version statique)
    fn calculate_relevance_static(action: &PredictedAction, event_type: &str) -> f64 {
        match (action, event_type) {
            (PredictedAction::Navigate { .. }, "navigate") => 1.0,
            (PredictedAction::Search { .. }, "search") => 1.0,
            (PredictedAction::Interact { .. }, "click" | "interact") => 1.0,
            (PredictedAction::RequestHelp { .. }, "help") => 1.0,
            (PredictedAction::Configure { .. }, "configure") => 1.0,
            (PredictedAction::Create { .. }, "create") => 1.0,
            (PredictedAction::Export { .. }, "export") => 1.0,
            (PredictedAction::Abandon, "abandon" | "close") => 1.0,
            _ => 0.0,
        }
    }

    /// Applique la décohérence
    fn apply_decoherence(&mut self) {
        // Réduire la cohérence
        self.coherence *= 1.0 - self.decoherence_rate;
        self.coherence = self.coherence.max(0.1);

        // Les amplitudes tendent vers la distribution classique
        let uniform = (1.0 / self.superposition.len() as f64).sqrt();

        for amplitude in &mut self.superposition {
            amplitude.amplitude =
                amplitude.amplitude * self.coherence + uniform * (1.0 - self.coherence);
        }
    }

    /// Normalise l'état (conservation de probabilité)
    fn normalize(&mut self) {
        let total: f64 = self.superposition.iter().map(|a| a.probability()).sum();

        if total > 0.0 {
            let factor = 1.0 / total.sqrt();
            for amplitude in &mut self.superposition {
                amplitude.amplitude *= factor;
            }
        }
    }

    /// Calcule l'entropie de von Neumann
    fn calculate_entropy(&mut self) {
        self.entropy = 0.0;

        for amplitude in &self.superposition {
            let prob = amplitude.probability();
            if prob > 0.0 {
                self.entropy -= prob * prob.log2();
            }
        }
    }

    /// Collapse l'état quantique (mesure) et retourne les prédictions
    pub fn collapse_predictions(&self) -> Vec<(PredictedAction, f64)> {
        let mut predictions: Vec<(PredictedAction, f64)> = self
            .superposition
            .iter()
            .map(|a| (a.action.clone(), a.probability()))
            .collect();

        // FIX: Handle NaN values safely to prevent panic
        predictions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        predictions
    }

    /// Effectue une mesure partielle (sans collapse complet)
    pub fn partial_measure(&self, action_type: &str) -> f64 {
        self.superposition
            .iter()
            .filter(|a| self.action_matches_type(&a.action, action_type))
            .map(|a| a.probability())
            .sum()
    }

    /// Vérifie si une action correspond à un type
    fn action_matches_type(&self, action: &PredictedAction, action_type: &str) -> bool {
        matches!(
            (action, action_type),
            (PredictedAction::Navigate { .. }, "navigate")
                | (PredictedAction::Search { .. }, "search")
                | (PredictedAction::Interact { .. }, "interact")
                | (PredictedAction::RequestHelp { .. }, "help")
                | (PredictedAction::Configure { .. }, "configure")
                | (PredictedAction::Create { .. }, "create")
                | (PredictedAction::Export { .. }, "export")
                | (PredictedAction::Abandon, "abandon")
        )
    }

    /// Retourne la cohérence
    pub fn get_coherence(&self) -> f64 {
        self.coherence
    }

    /// Retourne l'entropie
    pub fn get_entropy(&self) -> f64 {
        self.entropy
    }

    /// Retourne l'état le plus probable
    pub fn get_most_probable(&self) -> Option<&QuantumAmplitude> {
        // FIX: Handle NaN values safely to prevent panic
        self.superposition.iter().max_by(|a, b| {
            a.probability()
                .partial_cmp(&b.probability())
                .unwrap_or(std::cmp::Ordering::Equal)
        })
    }

    /// Réinitialise l'état (collapse complet)
    pub fn reset(&mut self) {
        self.superposition.clear();
        self.coherence = 1.0;
        self.time_since_collapse = 0;
        self.initialize_superposition();
    }

    /// Entangle deux états (corrélation quantique)
    pub fn entangle(&mut self, other: &QuantumState) {
        // Simplifié: moyenne des amplitudes
        for (self_amp, other_amp) in self
            .superposition
            .iter_mut()
            .zip(other.superposition.iter())
        {
            self_amp.amplitude = (self_amp.amplitude + other_amp.amplitude) / 2.0_f64.sqrt();
            self_amp.phase = (self_amp.phase + other_amp.phase) / 2.0;
        }

        self.coherence = (self.coherence + other.coherence) / 2.0;
        self.normalize();
    }
}

impl Default for QuantumState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_quantum_state_initialization() {
        let state = QuantumState::new();

        // Vérifier la normalisation
        let total: f64 = state.superposition.iter().map(|a| a.probability()).sum();
        assert!((total - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_quantum_state_update() {
        let mut state = QuantumState::new();

        let event = UserEvent {
            id: "test".to_string(),
            event_type: "navigate".to_string(),
            timestamp: 0,
            data: HashMap::new(),
        };

        state.update(&event);

        // La probabilité de "navigate" devrait avoir augmenté
        let nav_prob = state.partial_measure("navigate");
        assert!(nav_prob > 0.1);
    }

    #[test]
    fn test_collapse() {
        let state = QuantumState::new();
        let predictions = state.collapse_predictions();

        // Devrait avoir des prédictions
        assert!(!predictions.is_empty());

        // Les probabilités devraient sommer à ~1
        let sum: f64 = predictions.iter().map(|(_, p)| p).sum();
        assert!((sum - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_decoherence() {
        let mut state = QuantumState::new();

        // Appliquer plusieurs mises à jour
        let event = UserEvent {
            id: "test".to_string(),
            event_type: "navigate".to_string(),
            timestamp: 0,
            data: HashMap::new(),
        };

        for _ in 0..10 {
            state.update(&event);
        }

        // La cohérence devrait avoir diminué
        assert!(state.get_coherence() < 1.0);
    }
}
