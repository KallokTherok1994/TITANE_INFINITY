//! TITANE∞ v20Ω — Intention Detector
//! Détection des intentions utilisateur

use super::{PredictedAction, UserEvent};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Intention détectée
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum UserIntention {
    /// Cherche de l'information
    InformationSeeking,
    /// Veut accomplir une tâche
    TaskCompletion,
    /// Explore le système
    Exploration,
    /// Configure le système
    Configuration,
    /// Cherche de l'aide
    HelpSeeking,
    /// Création de contenu
    ContentCreation,
    /// Export/Sauvegarde
    DataExport,
    /// Frustration/Abandon
    Frustration,
    /// Intention incertaine
    Uncertain,
}

/// Indicateurs d'intention
#[derive(Clone, Debug, Default)]
struct IntentionIndicators {
    navigation_count: usize,
    search_count: usize,
    interaction_count: usize,
    help_count: usize,
    config_count: usize,
    create_count: usize,
    export_count: usize,
    error_count: usize,
    backtrack_count: usize,
    rapid_actions: usize,
    time_on_page: HashMap<String, u64>,
}

/// Détecteur d'intentions
#[derive(Clone, Debug)]
pub struct IntentionDetector {
    /// Indicateurs courants
    indicators: IntentionIndicators,
    /// Intention actuelle
    current_intention: Option<UserIntention>,
    /// Confiance dans l'intention
    confidence: f64,
    /// Historique des événements récents
    recent_events: Vec<UserEvent>,
    /// Dernière page visitée
    last_page: Option<String>,
    /// Timestamp de la dernière action
    last_action_time: u64,
}

impl IntentionDetector {
    /// Crée un nouveau détecteur
    pub fn new() -> Self {
        Self {
            indicators: IntentionIndicators::default(),
            current_intention: None,
            confidence: 0.0,
            recent_events: Vec::new(),
            last_page: None,
            last_action_time: 0,
        }
    }

    /// Traite un événement
    pub fn process(&mut self, event: &UserEvent) {
        // Détecter les actions rapides
        if self.last_action_time > 0 && event.timestamp - self.last_action_time < 500 {
            self.indicators.rapid_actions += 1;
        }
        self.last_action_time = event.timestamp;

        // Détecter le backtracking
        if let Some(ref last) = self.last_page {
            if let Some(current) = event.data.get("path") {
                if current == last {
                    self.indicators.backtrack_count += 1;
                }
            }
        }

        // Mettre à jour la dernière page
        if event.event_type == "navigate" {
            self.last_page = event.data.get("path").cloned();
        }

        // Compter par type
        match event.event_type.as_str() {
            "navigate" => self.indicators.navigation_count += 1,
            "search" => self.indicators.search_count += 1,
            "click" | "interact" => self.indicators.interaction_count += 1,
            "help" => self.indicators.help_count += 1,
            "configure" => self.indicators.config_count += 1,
            "create" => self.indicators.create_count += 1,
            "export" => self.indicators.export_count += 1,
            "error" => self.indicators.error_count += 1,
            _ => {}
        }

        // Ajouter aux événements récents
        self.recent_events.push(event.clone());
        if self.recent_events.len() > 20 {
            self.recent_events.remove(0);
        }

        // Détecter l'intention
        self.detect_intention();
    }

    /// Détecte l'intention basée sur les indicateurs
    fn detect_intention(&mut self) {
        let ind = &self.indicators;
        let total = ind.navigation_count
            + ind.search_count
            + ind.interaction_count
            + ind.help_count
            + ind.config_count
            + ind.create_count
            + ind.export_count;

        if total < 3 {
            self.current_intention = Some(UserIntention::Uncertain);
            self.confidence = 0.3;
            return;
        }

        // Calculer les scores pour chaque intention
        let mut scores: Vec<(UserIntention, f64)> = Vec::new();

        // Information Seeking: beaucoup de recherches et navigation
        let info_score =
            (ind.search_count as f64 * 2.0 + ind.navigation_count as f64) / total as f64;
        scores.push((UserIntention::InformationSeeking, info_score));

        // Task Completion: interactions ciblées
        let task_score = (ind.interaction_count as f64 * 1.5) / total as f64;
        scores.push((UserIntention::TaskCompletion, task_score));

        // Exploration: navigation sans recherche
        let explore_score = if ind.search_count == 0 {
            ind.navigation_count as f64 / total as f64
        } else {
            0.0
        };
        scores.push((UserIntention::Exploration, explore_score));

        // Configuration
        let config_score = (ind.config_count as f64 * 3.0) / total as f64;
        scores.push((UserIntention::Configuration, config_score));

        // Help Seeking
        let help_score = (ind.help_count as f64 * 3.0) / total as f64;
        scores.push((UserIntention::HelpSeeking, help_score));

        // Content Creation
        let create_score = (ind.create_count as f64 * 2.5) / total as f64;
        scores.push((UserIntention::ContentCreation, create_score));

        // Data Export
        let export_score = (ind.export_count as f64 * 3.0) / total as f64;
        scores.push((UserIntention::DataExport, export_score));

        // Frustration: erreurs, backtracking, actions rapides
        let frustration_score = (ind.error_count as f64 * 2.0
            + ind.backtrack_count as f64 * 1.5
            + ind.rapid_actions as f64 * 0.5)
            / total as f64;
        scores.push((UserIntention::Frustration, frustration_score.min(1.0)));

        // Trouver l'intention avec le score le plus élevé
        // FIX: Handle NaN values safely to prevent panic
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        if let Some((intention, score)) = scores.first() {
            if *score > 0.2 {
                self.current_intention = Some(intention.clone());
                self.confidence = *score;
            } else {
                self.current_intention = Some(UserIntention::Uncertain);
                self.confidence = 0.3;
            }
        }
    }

    /// Prédit les actions futures basées sur l'intention
    pub fn predict_from_intent(&self, intent: &UserIntention) -> Vec<(PredictedAction, f64)> {
        match intent {
            UserIntention::InformationSeeking => vec![
                (
                    PredictedAction::Search {
                        query_hint: String::new(),
                    },
                    0.4,
                ),
                (
                    PredictedAction::Navigate {
                        path: String::new(),
                    },
                    0.3,
                ),
                (
                    PredictedAction::Interact {
                        element_type: "link".to_string(),
                        action: "click".to_string(),
                    },
                    0.2,
                ),
            ],
            UserIntention::TaskCompletion => vec![
                (
                    PredictedAction::Interact {
                        element_type: "button".to_string(),
                        action: "click".to_string(),
                    },
                    0.5,
                ),
                (
                    PredictedAction::Create {
                        content_type: String::new(),
                    },
                    0.3,
                ),
            ],
            UserIntention::Exploration => vec![
                (
                    PredictedAction::Navigate {
                        path: String::new(),
                    },
                    0.6,
                ),
                (
                    PredictedAction::Interact {
                        element_type: "menu".to_string(),
                        action: "expand".to_string(),
                    },
                    0.3,
                ),
            ],
            UserIntention::Configuration => vec![
                (
                    PredictedAction::Configure {
                        setting: String::new(),
                    },
                    0.6,
                ),
                (
                    PredictedAction::Navigate {
                        path: "/settings".to_string(),
                    },
                    0.3,
                ),
            ],
            UserIntention::HelpSeeking => vec![
                (
                    PredictedAction::RequestHelp {
                        topic: String::new(),
                    },
                    0.5,
                ),
                (
                    PredictedAction::Search {
                        query_hint: "help".to_string(),
                    },
                    0.3,
                ),
                (
                    PredictedAction::Navigate {
                        path: "/help".to_string(),
                    },
                    0.2,
                ),
            ],
            UserIntention::ContentCreation => vec![
                (
                    PredictedAction::Create {
                        content_type: String::new(),
                    },
                    0.5,
                ),
                (
                    PredictedAction::Interact {
                        element_type: "editor".to_string(),
                        action: "type".to_string(),
                    },
                    0.3,
                ),
            ],
            UserIntention::DataExport => vec![
                (
                    PredictedAction::Export {
                        format: String::new(),
                    },
                    0.6,
                ),
                (
                    PredictedAction::Configure {
                        setting: "export".to_string(),
                    },
                    0.2,
                ),
            ],
            UserIntention::Frustration => vec![
                (
                    PredictedAction::RequestHelp {
                        topic: String::new(),
                    },
                    0.3,
                ),
                (PredictedAction::Abandon, 0.4),
                (
                    PredictedAction::Navigate {
                        path: "/".to_string(),
                    },
                    0.2,
                ),
            ],
            UserIntention::Uncertain => vec![
                (
                    PredictedAction::Navigate {
                        path: String::new(),
                    },
                    0.3,
                ),
                (
                    PredictedAction::Search {
                        query_hint: String::new(),
                    },
                    0.2,
                ),
            ],
        }
    }

    /// Retourne l'intention actuelle
    pub fn get_current_intent(&self) -> Option<UserIntention> {
        self.current_intention.clone()
    }

    /// Retourne la confiance
    pub fn get_confidence(&self) -> f64 {
        self.confidence
    }

    /// Vérifie si l'utilisateur semble frustré
    pub fn is_frustrated(&self) -> bool {
        matches!(self.current_intention, Some(UserIntention::Frustration))
            || self.indicators.error_count > 3
            || self.indicators.backtrack_count > 5
    }

    /// Retourne les indicateurs
    pub fn get_indicators(&self) -> IntentionIndicatorsSummary {
        IntentionIndicatorsSummary {
            total_actions: self.indicators.navigation_count
                + self.indicators.search_count
                + self.indicators.interaction_count,
            help_requests: self.indicators.help_count,
            errors: self.indicators.error_count,
            backtrack_count: self.indicators.backtrack_count,
            rapid_actions: self.indicators.rapid_actions,
        }
    }

    /// Réinitialise le détecteur
    pub fn reset(&mut self) {
        self.indicators = IntentionIndicators::default();
        self.current_intention = None;
        self.confidence = 0.0;
        self.recent_events.clear();
        self.last_page = None;
        self.last_action_time = 0;
    }
}

/// Résumé des indicateurs
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IntentionIndicatorsSummary {
    pub total_actions: usize,
    pub help_requests: usize,
    pub errors: usize,
    pub backtrack_count: usize,
    pub rapid_actions: usize,
}

impl Default for IntentionDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_event(event_type: &str, timestamp: u64) -> UserEvent {
        UserEvent {
            id: format!("test-{}", timestamp),
            event_type: event_type.to_string(),
            timestamp,
            data: HashMap::new(),
        }
    }

    #[test]
    fn test_intention_detection() {
        let mut detector = IntentionDetector::new();

        // Simuler une recherche d'information
        detector.process(&make_event("search", 1000));
        detector.process(&make_event("navigate", 2000));
        detector.process(&make_event("search", 3000));
        detector.process(&make_event("navigate", 4000));

        let intent = detector.get_current_intent();
        assert!(matches!(intent, Some(UserIntention::InformationSeeking)));
    }

    #[test]
    fn test_frustration_detection() {
        let mut detector = IntentionDetector::new();

        // Simuler de la frustration
        for i in 0..5 {
            detector.process(&make_event("error", i * 100));
            detector.process(&make_event("navigate", i * 100 + 50));
        }

        assert!(detector.is_frustrated());
    }

    #[test]
    fn test_predict_from_intent() {
        let detector = IntentionDetector::new();

        let predictions = detector.predict_from_intent(&UserIntention::HelpSeeking);
        assert!(!predictions.is_empty());

        // La première prédiction devrait être RequestHelp
        if let Some((action, _)) = predictions.first() {
            assert!(matches!(action, PredictedAction::RequestHelp { .. }));
        }
    }
}
