//! TITANE∞ v20Ω — Pattern Analyzer
//! Analyse des patterns comportementaux

use super::{PredictedAction, UserEvent};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Pattern détecté
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BehaviorPattern {
    pub id: String,
    pub name: String,
    pub events: Vec<String>,
    pub frequency: usize,
    pub confidence: f64,
    pub typical_duration: u64,
}

/// Analyse de session
#[derive(Clone, Debug, Default)]
struct SessionAnalysis {
    start_time: u64,
    events: Vec<String>,
    navigation_count: usize,
    search_count: usize,
    interaction_count: usize,
    help_requests: usize,
    errors: usize,
}

/// Analyseur de patterns
#[derive(Clone, Debug)]
pub struct PatternAnalyzer {
    /// Patterns connus
    patterns: HashMap<String, BehaviorPattern>,
    /// Session actuelle
    current_session: SessionAnalysis,
    /// Fréquence des actions
    action_frequency: HashMap<String, usize>,
    /// Transitions d'actions
    action_transitions: HashMap<String, HashMap<String, usize>>,
    /// Dernière action
    last_action: Option<String>,
    /// Confiance globale
    confidence: f64,
}

impl PatternAnalyzer {
    /// Crée un nouvel analyseur
    pub fn new() -> Self {
        let mut analyzer = Self {
            patterns: HashMap::new(),
            current_session: SessionAnalysis::default(),
            action_frequency: HashMap::new(),
            action_transitions: HashMap::new(),
            last_action: None,
            confidence: 0.5,
        };

        // Initialiser les patterns connus
        analyzer.init_known_patterns();
        analyzer
    }

    /// Initialise les patterns prédéfinis
    fn init_known_patterns(&mut self) {
        // Pattern: Exploration
        self.patterns.insert(
            "exploration".to_string(),
            BehaviorPattern {
                id: "exploration".to_string(),
                name: "Exploration".to_string(),
                events: vec![
                    "navigate".to_string(),
                    "navigate".to_string(),
                    "navigate".to_string(),
                ],
                frequency: 0,
                confidence: 0.7,
                typical_duration: 60000,
            },
        );

        // Pattern: Recherche ciblée
        self.patterns.insert(
            "targeted_search".to_string(),
            BehaviorPattern {
                id: "targeted_search".to_string(),
                name: "Recherche ciblée".to_string(),
                events: vec![
                    "search".to_string(),
                    "click".to_string(),
                    "interact".to_string(),
                ],
                frequency: 0,
                confidence: 0.8,
                typical_duration: 30000,
            },
        );

        // Pattern: Configuration
        self.patterns.insert(
            "configuration".to_string(),
            BehaviorPattern {
                id: "configuration".to_string(),
                name: "Configuration".to_string(),
                events: vec![
                    "navigate".to_string(),
                    "configure".to_string(),
                    "configure".to_string(),
                ],
                frequency: 0,
                confidence: 0.75,
                typical_duration: 45000,
            },
        );

        // Pattern: Aide/Support
        self.patterns.insert(
            "help_seeking".to_string(),
            BehaviorPattern {
                id: "help_seeking".to_string(),
                name: "Recherche d'aide".to_string(),
                events: vec![
                    "help".to_string(),
                    "navigate".to_string(),
                    "help".to_string(),
                ],
                frequency: 0,
                confidence: 0.65,
                typical_duration: 120000,
            },
        );

        // Pattern: Création de contenu
        self.patterns.insert(
            "content_creation".to_string(),
            BehaviorPattern {
                id: "content_creation".to_string(),
                name: "Création de contenu".to_string(),
                events: vec![
                    "create".to_string(),
                    "interact".to_string(),
                    "create".to_string(),
                ],
                frequency: 0,
                confidence: 0.8,
                typical_duration: 180000,
            },
        );
    }

    /// Analyse un événement
    pub fn analyze(&mut self, event: &UserEvent) {
        let event_type = event.event_type.clone();

        // Mettre à jour la session
        if self.current_session.start_time == 0 {
            self.current_session.start_time = event.timestamp;
        }
        self.current_session.events.push(event_type.clone());

        // Compteurs par type
        match event_type.as_str() {
            "navigate" => self.current_session.navigation_count += 1,
            "search" => self.current_session.search_count += 1,
            "click" | "interact" => self.current_session.interaction_count += 1,
            "help" => self.current_session.help_requests += 1,
            "error" => self.current_session.errors += 1,
            _ => {}
        }

        // Fréquence des actions
        *self.action_frequency.entry(event_type.clone()).or_insert(0) += 1;

        // Transitions
        if let Some(ref last) = self.last_action {
            let transitions = self.action_transitions.entry(last.clone()).or_default();
            *transitions.entry(event_type.clone()).or_insert(0) += 1;
        }

        self.last_action = Some(event_type);

        // Détecter les patterns
        self.detect_patterns();
    }

    /// Détecte les patterns dans la session actuelle
    fn detect_patterns(&mut self) {
        let session_events = self.current_session.events.clone();

        if session_events.len() < 3 {
            return;
        }

        // D'abord collecter les IDs et états des patterns qui matchent
        let matches: Vec<(String, f64)> = self
            .patterns
            .iter()
            .filter_map(|(id, pattern)| {
                if Self::matches_pattern_static(&session_events, &pattern.events) {
                    Some((id.clone(), pattern.confidence))
                } else {
                    None
                }
            })
            .collect();

        // Ensuite mettre à jour les patterns matchés
        for (id, confidence) in matches {
            if let Some(pattern) = self.patterns.get_mut(&id) {
                pattern.frequency += 1;
            }
            self.confidence = self.confidence * 0.9 + confidence * 0.1;
        }
    }

    /// Vérifie si une séquence correspond à un pattern (version statique)
    fn matches_pattern_static(events: &[String], pattern: &[String]) -> bool {
        if events.len() < pattern.len() {
            return false;
        }

        // Chercher le pattern dans les derniers événements
        let start = events.len() - pattern.len();
        let recent: Vec<_> = events.iter().skip(start).collect();

        recent.iter().zip(pattern.iter()).all(|(e, p)| *e == p)
    }

    /// Vérifie si une séquence correspond à un pattern
    fn matches_pattern(&self, events: &[String], pattern: &[String]) -> bool {
        if events.len() < pattern.len() {
            return false;
        }

        // Chercher le pattern dans les derniers événements
        let start = events.len() - pattern.len();
        let recent: Vec<_> = events.iter().skip(start).collect();

        recent.iter().zip(pattern.iter()).all(|(e, p)| *e == p)
    }

    /// Prédit les prochaines actions basées sur les patterns
    pub fn predict_next_actions(&self, count: usize) -> Vec<(PredictedAction, f64)> {
        let mut predictions: Vec<(PredictedAction, f64)> = Vec::new();

        // Prédictions basées sur les transitions
        // Si la dernière action n'a pas (encore) de transitions sortantes, utiliser
        // la dernière action antérieure qui en a pour éviter de retourner un vecteur vide.
        let transition_source: Option<&str> = self
            .last_action
            .as_deref()
            .or_else(|| self.current_session.events.last().map(|s| s.as_str()))
            .and_then(|last| {
                if self.action_transitions.contains_key(last) {
                    Some(last)
                } else {
                    None
                }
            })
            .or_else(|| {
                // Fallback: remonter l'historique (en ignorant la dernière action)
                self.current_session
                    .events
                    .iter()
                    .rev()
                    .skip(1)
                    .find_map(|event_type| {
                        if self.action_transitions.contains_key(event_type) {
                            Some(event_type.as_str())
                        } else {
                            None
                        }
                    })
            });

        if let Some(source) = transition_source {
            if let Some(transitions) = self.action_transitions.get(source) {
                let total: usize = transitions.values().sum();
                if total > 0 {
                    for (next_action, &freq) in transitions {
                        let prob = freq as f64 / total as f64;
                        let action = self.event_type_to_action(next_action);
                        predictions.push((action, prob * self.confidence));
                    }
                }
            }
        }

        // Prédictions basées sur les patterns actifs
        for pattern in self.patterns.values() {
            if pattern.frequency > 0 {
                if let Some(next_event) = pattern.events.last() {
                    let action = self.event_type_to_action(next_event);
                    let prob = (pattern.frequency as f64 / 10.0).min(1.0) * pattern.confidence;
                    predictions.push((action, prob));
                }
            }
        }

        // Fallback final: si aucune transition/pattern n'est disponible, proposer
        // les actions les plus fréquentes observées.
        if predictions.is_empty() {
            let mut freqs: Vec<(&String, &usize)> = self.action_frequency.iter().collect();
            freqs.sort_by(|a, b| b.1.cmp(a.1));
            for (event_type, freq) in freqs.into_iter().take(count) {
                if *freq == 0 {
                    continue;
                }
                predictions.push((self.event_type_to_action(event_type), 0.1 * self.confidence));
            }
        }

        // Trier et limiter
        predictions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        predictions.dedup_by(|a, b| std::mem::discriminant(&a.0) == std::mem::discriminant(&b.0));
        predictions.truncate(count);

        predictions
    }

    /// Convertit un type d'événement en action prédite
    fn event_type_to_action(&self, event_type: &str) -> PredictedAction {
        match event_type {
            "navigate" => PredictedAction::Navigate {
                path: String::new(),
            },
            "search" => PredictedAction::Search {
                query_hint: String::new(),
            },
            "click" | "interact" => PredictedAction::Interact {
                element_type: String::new(),
                action: String::new(),
            },
            "help" => PredictedAction::RequestHelp {
                topic: String::new(),
            },
            "configure" => PredictedAction::Configure {
                setting: String::new(),
            },
            "create" => PredictedAction::Create {
                content_type: String::new(),
            },
            "export" => PredictedAction::Export {
                format: String::new(),
            },
            "abandon" | "close" => PredictedAction::Abandon,
            _ => PredictedAction::Unknown,
        }
    }

    /// Retourne la confiance du pattern actuel
    pub fn get_pattern_confidence(&self) -> f64 {
        self.confidence
    }

    /// Retourne le pattern dominant
    pub fn get_dominant_pattern(&self) -> Option<&BehaviorPattern> {
        self.patterns
            .values()
            .max_by(|a, b| a.frequency.cmp(&b.frequency))
    }

    /// Retourne les statistiques de session
    pub fn get_session_stats(&self) -> SessionStats {
        SessionStats {
            event_count: self.current_session.events.len(),
            navigation_count: self.current_session.navigation_count,
            search_count: self.current_session.search_count,
            interaction_count: self.current_session.interaction_count,
            help_requests: self.current_session.help_requests,
            errors: self.current_session.errors,
            dominant_pattern: self.get_dominant_pattern().map(|p| p.name.clone()),
        }
    }

    /// Réinitialise la session
    pub fn reset_session(&mut self) {
        self.current_session = SessionAnalysis::default();
        self.last_action = None;
    }
}

/// Statistiques de session
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SessionStats {
    pub event_count: usize,
    pub navigation_count: usize,
    pub search_count: usize,
    pub interaction_count: usize,
    pub help_requests: usize,
    pub errors: usize,
    pub dominant_pattern: Option<String>,
}

impl Default for PatternAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_event(event_type: &str) -> UserEvent {
        UserEvent {
            id: format!("test-{}", event_type),
            event_type: event_type.to_string(),
            timestamp: 0,
            data: HashMap::new(),
        }
    }

    #[test]
    fn test_pattern_detection() {
        let mut analyzer = PatternAnalyzer::new();

        // Simuler le pattern "exploration"
        analyzer.analyze(&make_event("navigate"));
        analyzer.analyze(&make_event("navigate"));
        analyzer.analyze(&make_event("navigate"));

        let pattern = analyzer.get_dominant_pattern();
        assert!(pattern.is_some());
    }

    #[test]
    fn test_predictions() {
        let mut analyzer = PatternAnalyzer::new();

        analyzer.analyze(&make_event("navigate"));
        analyzer.analyze(&make_event("search"));
        analyzer.analyze(&make_event("click"));

        let predictions = analyzer.predict_next_actions(3);
        assert!(!predictions.is_empty());
    }
}
