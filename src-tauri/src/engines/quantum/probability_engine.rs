//! TITANE∞ v20Ω — Probability Engine
//! Calcul des probabilités bayésiennes

use super::{PredictedAction, UserEvent};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Prior (a priori) pour chaque action
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActionPrior {
    pub action: String,
    pub prior: f64,
    pub observations: usize,
}

/// Likelihood conditionnelle
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConditionalLikelihood {
    pub condition: String,
    pub action: String,
    pub likelihood: f64,
    pub count: usize,
}

/// Moteur de probabilité bayésien
#[derive(Clone, Debug)]
pub struct ProbabilityEngine {
    /// Priors pour chaque action
    priors: HashMap<String, ActionPrior>,
    /// Likelihoods conditionnelles
    likelihoods: HashMap<String, Vec<ConditionalLikelihood>>,
    /// Facteur de lissage Laplace
    smoothing_factor: f64,
    /// Total des observations
    total_observations: usize,
}

impl ProbabilityEngine {
    /// Crée un nouveau moteur
    pub fn new() -> Self {
        let mut engine = Self {
            priors: HashMap::new(),
            likelihoods: HashMap::new(),
            smoothing_factor: 1.0,
            total_observations: 0,
        };

        // Initialiser les priors par défaut
        engine.init_default_priors();
        engine
    }

    /// Initialise les priors par défaut
    fn init_default_priors(&mut self) {
        let default_actions = vec![
            ("navigate", 0.25),
            ("search", 0.15),
            ("interact", 0.20),
            ("help", 0.05),
            ("configure", 0.10),
            ("create", 0.10),
            ("export", 0.05),
            ("abandon", 0.05),
            ("unknown", 0.05),
        ];

        for (action, prior) in default_actions {
            self.priors.insert(
                action.to_string(),
                ActionPrior {
                    action: action.to_string(),
                    prior,
                    observations: 0,
                },
            );
        }
    }

    /// Met à jour les probabilités basées sur un résultat
    pub fn update_from_outcome(&mut self, event: &UserEvent, actual_action: &PredictedAction) {
        let action_str = self.action_to_string(actual_action);

        // Mettre à jour le prior
        if let Some(prior) = self.priors.get_mut(&action_str) {
            prior.observations += 1;
            // Mise à jour bayésienne simplifiée
            let new_prior = (prior.prior * self.total_observations as f64 + 1.0)
                / (self.total_observations + 1) as f64;
            prior.prior = new_prior;
        }

        self.total_observations += 1;

        // Mettre à jour les likelihoods
        self.update_likelihood(event, &action_str);

        // Normaliser les priors
        self.normalize_priors();
    }

    /// Met à jour la likelihood conditionnelle
    fn update_likelihood(&mut self, event: &UserEvent, action: &str) {
        let condition = event.event_type.clone();

        let likelihoods = self.likelihoods.entry(condition.clone()).or_default();

        // Chercher l'index de l'action existante
        let found_idx = likelihoods.iter().position(|l| l.action == action);

        if let Some(idx) = found_idx {
            likelihoods[idx].count += 1;
        } else {
            let len = likelihoods.len().max(1);
            likelihoods.push(ConditionalLikelihood {
                condition,
                action: action.to_string(),
                likelihood: 1.0 / len as f64,
                count: 1,
            });
        }

        // Normaliser les likelihoods pour cette condition
        let total: usize = likelihoods.iter().map(|l| l.count).sum();
        let smoothing = self.smoothing_factor;
        let len = likelihoods.len();
        for l in likelihoods.iter_mut() {
            l.likelihood = (l.count as f64 + smoothing) / (total as f64 + smoothing * len as f64);
        }
    }

    /// Normalise les priors
    fn normalize_priors(&mut self) {
        let total: f64 = self.priors.values().map(|p| p.prior).sum();

        if total > 0.0 {
            for prior in self.priors.values_mut() {
                prior.prior /= total;
            }
        }
    }

    /// Calcule la probabilité postérieure P(Action | Evidence)
    pub fn posterior(&self, action: &str, evidence: &[(&str, &str)]) -> f64 {
        // P(A|E) = P(E|A) * P(A) / P(E)
        // Nous simplifions en ignorant P(E) car c'est constant

        let prior = self.priors.get(action).map(|p| p.prior).unwrap_or(0.01);

        // Calculer la likelihood P(E|A)
        let mut likelihood = 1.0;
        for (condition, _value) in evidence {
            if let Some(likelihoods) = self.likelihoods.get(*condition) {
                if let Some(l) = likelihoods.iter().find(|l| l.action == action) {
                    likelihood *= l.likelihood;
                } else {
                    likelihood *= self.smoothing_factor / (likelihoods.len() + 1) as f64;
                }
            }
        }

        prior * likelihood
    }

    /// Calcule les probabilités pour toutes les actions
    pub fn compute_all_posteriors(&self, evidence: &[(&str, &str)]) -> Vec<(String, f64)> {
        let mut posteriors: Vec<(String, f64)> = self
            .priors
            .keys()
            .map(|action| {
                let post = self.posterior(action, evidence);
                (action.clone(), post)
            })
            .collect();

        // Normaliser
        let total: f64 = posteriors.iter().map(|(_, p)| p).sum();
        if total > 0.0 {
            for (_, p) in posteriors.iter_mut() {
                *p /= total;
            }
        }

        posteriors.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        posteriors
    }

    /// Convertit une action en string
    fn action_to_string(&self, action: &PredictedAction) -> String {
        match action {
            PredictedAction::Navigate { .. } => "navigate".to_string(),
            PredictedAction::Search { .. } => "search".to_string(),
            PredictedAction::Interact { .. } => "interact".to_string(),
            PredictedAction::RequestHelp { .. } => "help".to_string(),
            PredictedAction::Configure { .. } => "configure".to_string(),
            PredictedAction::Create { .. } => "create".to_string(),
            PredictedAction::Export { .. } => "export".to_string(),
            PredictedAction::Abandon => "abandon".to_string(),
            PredictedAction::Unknown => "unknown".to_string(),
        }
    }

    /// Retourne l'entropie du modèle
    pub fn get_entropy(&self) -> f64 {
        let mut entropy = 0.0;

        for prior in self.priors.values() {
            if prior.prior > 0.0 {
                entropy -= prior.prior * prior.prior.log2();
            }
        }

        entropy
    }

    /// Retourne le prior le plus probable
    pub fn get_most_likely_action(&self) -> Option<&str> {
        self.priors
            .iter()
            .max_by(|a, b| a.1.prior.partial_cmp(&b.1.prior).unwrap())
            .map(|(k, _)| k.as_str())
    }

    /// Retourne les statistiques
    pub fn get_stats(&self) -> ProbabilityStats {
        ProbabilityStats {
            total_observations: self.total_observations,
            unique_actions: self.priors.len(),
            entropy: self.get_entropy(),
            most_likely: self.get_most_likely_action().map(|s| s.to_string()),
        }
    }
}

/// Statistiques du moteur de probabilité
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProbabilityStats {
    pub total_observations: usize,
    pub unique_actions: usize,
    pub entropy: f64,
    pub most_likely: Option<String>,
}

impl Default for ProbabilityEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_probability_engine() {
        let engine = ProbabilityEngine::new();

        // Tester les posteriors
        let evidence = vec![("navigate", "home")];
        let posteriors = engine.compute_all_posteriors(&evidence);

        assert!(!posteriors.is_empty());

        // La somme des probabilités devrait être ~1
        let sum: f64 = posteriors.iter().map(|(_, p)| p).sum();
        assert!((sum - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_update_from_outcome() {
        let mut engine = ProbabilityEngine::new();

        let event = UserEvent {
            id: "test".to_string(),
            event_type: "navigate".to_string(),
            timestamp: 0,
            data: HashMap::new(),
        };

        let action = PredictedAction::Navigate {
            path: "/home".to_string(),
        };

        engine.update_from_outcome(&event, &action);

        assert!(engine.total_observations > 0);
    }

    #[test]
    fn test_entropy() {
        let engine = ProbabilityEngine::new();
        let entropy = engine.get_entropy();

        // L'entropie devrait être positive pour une distribution non-triviale
        assert!(entropy > 0.0);
    }
}
