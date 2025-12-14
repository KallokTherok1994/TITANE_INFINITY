//! TITANE∞ v20Ω — Prediction Model
//! Modèle de prédiction basé sur l'historique

use super::UserEvent;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};

/// Séquence d'événements
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EventSequence {
    pub events: Vec<String>,
    pub frequency: usize,
    pub last_seen: u64,
}

/// Modèle de prédiction
#[derive(Clone, Debug)]
pub struct PredictionModel {
    /// Historique des événements
    history: VecDeque<UserEvent>,
    /// Taille maximale
    max_size: usize,
    /// Séquences fréquentes (n-grams)
    sequences: HashMap<String, EventSequence>,
    /// Transitions (état actuel -> états suivants)
    transitions: HashMap<String, HashMap<String, usize>>,
    /// Compteur total de transitions
    total_transitions: usize,
}

impl PredictionModel {
    /// Crée un nouveau modèle
    pub fn new(max_size: usize) -> Self {
        Self {
            history: VecDeque::with_capacity(max_size),
            max_size,
            sequences: HashMap::new(),
            transitions: HashMap::new(),
            total_transitions: 0,
        }
    }

    /// Enregistre un événement
    pub fn record(&mut self, event: UserEvent) {
        // Ajouter à l'historique
        self.history.push_back(event.clone());

        // Limiter la taille
        if self.history.len() > self.max_size {
            self.history.pop_front();
        }

        // Mettre à jour les séquences et transitions
        self.update_sequences();
        self.update_transitions(&event);
    }

    /// Met à jour les séquences n-gram
    fn update_sequences(&mut self) {
        if self.history.len() < 2 {
            return;
        }

        // Générer des n-grams (2, 3, 4)
        for n in 2..=4.min(self.history.len()) {
            let start = self.history.len().saturating_sub(n);
            let sequence: Vec<String> = self
                .history
                .iter()
                .skip(start)
                .map(|e| e.event_type.clone())
                .collect();

            let key = sequence.join("->");

            let entry = self.sequences.entry(key).or_insert(EventSequence {
                events: sequence,
                frequency: 0,
                last_seen: 0,
            });

            entry.frequency += 1;
            if let Some(last) = self.history.back() {
                entry.last_seen = last.timestamp;
            }
        }
    }

    /// Met à jour les transitions
    fn update_transitions(&mut self, event: &UserEvent) {
        if self.history.len() < 2 {
            return;
        }

        // Obtenir l'événement précédent
        let prev_idx = self.history.len() - 2;
        if let Some(prev) = self.history.get(prev_idx) {
            let prev_type = prev.event_type.clone();
            let curr_type = event.event_type.clone();

            let next_states = self.transitions.entry(prev_type).or_default();

            *next_states.entry(curr_type).or_insert(0) += 1;
            self.total_transitions += 1;
        }
    }

    /// Prédit le prochain événement
    pub fn predict_next(&self, count: usize) -> Vec<(String, f64)> {
        if let Some(current) = self.history.back() {
            if let Some(next_states) = self.transitions.get(&current.event_type) {
                let total: usize = next_states.values().sum();

                let mut predictions: Vec<(String, f64)> = next_states
                    .iter()
                    .map(|(state, &freq)| {
                        let prob = freq as f64 / total as f64;
                        (state.clone(), prob)
                    })
                    .collect();

                predictions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
                predictions.truncate(count);

                return predictions;
            }
        }

        Vec::new()
    }

    /// Prédit basé sur les séquences
    pub fn predict_from_sequence(&self, count: usize) -> Vec<(String, f64)> {
        if self.history.len() < 2 {
            return Vec::new();
        }

        // Chercher la séquence actuelle dans les patterns connus
        let recent: Vec<String> = self
            .history
            .iter()
            .rev()
            .take(3)
            .map(|e| e.event_type.clone())
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect();

        let mut matches: Vec<(String, f64)> = Vec::new();

        for (key, seq) in &self.sequences {
            // Vérifier si la séquence actuelle est un préfixe
            if seq.events.len() > recent.len() {
                let prefix: Vec<_> = seq.events.iter().take(recent.len()).cloned().collect();
                if prefix == recent {
                    // La suite de cette séquence est une prédiction
                    if let Some(next) = seq.events.get(recent.len()) {
                        let prob = seq.frequency as f64 / self.total_transitions.max(1) as f64;
                        matches.push((next.clone(), prob));
                    }
                }
            }
        }

        matches.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        matches.truncate(count);
        matches
    }

    /// Retourne les séquences les plus fréquentes
    pub fn get_top_sequences(&self, count: usize) -> Vec<&EventSequence> {
        let mut sequences: Vec<_> = self.sequences.values().collect();
        sequences.sort_by(|a, b| b.frequency.cmp(&a.frequency));
        sequences.truncate(count);
        sequences
    }

    /// Retourne l'entropie du modèle
    pub fn get_entropy(&self) -> f64 {
        if self.total_transitions == 0 {
            return 0.0;
        }

        let mut entropy = 0.0;

        for next_states in self.transitions.values() {
            let total: usize = next_states.values().sum();
            for &freq in next_states.values() {
                if freq > 0 {
                    let prob = freq as f64 / total as f64;
                    entropy -= prob * prob.log2();
                }
            }
        }

        entropy
    }

    /// Retourne la taille de l'historique
    pub fn history_size(&self) -> usize {
        self.history.len()
    }

    /// Retourne le nombre de séquences uniques
    pub fn unique_sequences(&self) -> usize {
        self.sequences.len()
    }

    /// Efface le modèle
    pub fn clear(&mut self) {
        self.history.clear();
        self.sequences.clear();
        self.transitions.clear();
        self.total_transitions = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn make_event(event_type: &str) -> UserEvent {
        UserEvent {
            id: format!("test-{}", event_type),
            event_type: event_type.to_string(),
            timestamp: 0,
            data: HashMap::new(),
        }
    }

    #[test]
    fn test_prediction_model() {
        let mut model = PredictionModel::new(100);

        // Enregistrer une séquence
        model.record(make_event("navigate"));
        model.record(make_event("search"));
        model.record(make_event("click"));
        model.record(make_event("navigate"));
        model.record(make_event("search"));

        // Prédire le prochain
        let predictions = model.predict_next(3);
        assert!(!predictions.is_empty());

        // La prédiction la plus probable devrait être "click" après "search"
        if let Some((event, _)) = predictions.first() {
            assert_eq!(event, "click");
        }
    }

    #[test]
    fn test_entropy() {
        let mut model = PredictionModel::new(100);

        // Modèle avec transitions uniformes = entropie élevée
        for _ in 0..10 {
            // Construire une distribution non-déterministe pour l'état "a":
            // a -> b et a -> c, avec fréquences similaires.
            model.record(make_event("a"));
            model.record(make_event("b"));
            model.record(make_event("a"));
            model.record(make_event("c"));
        }

        let entropy = model.get_entropy();
        assert!(entropy > 0.0);
    }
}
