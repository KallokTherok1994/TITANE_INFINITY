//! TITANE∞ v20Ω — Quantum Predictive Engine
//! Moteur de prédiction et anticipation

mod intention_detector;
mod pattern_analyzer;
mod prediction_model;
mod probability_engine;
mod quantum_state;

pub use intention_detector::*;
pub use pattern_analyzer::*;
pub use prediction_model::*;
pub use probability_engine::*;
pub use quantum_state::*;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Configuration du moteur quantique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct QuantumConfig {
    /// Nombre de prédictions à générer
    pub prediction_count: usize,
    /// Horizon temporel (ms)
    pub time_horizon: u64,
    /// Seuil de confiance minimum
    pub confidence_threshold: f64,
    /// Activer l'apprentissage continu
    pub enable_learning: bool,
    /// Taille de l'historique
    pub history_size: usize,
}

impl Default for QuantumConfig {
    fn default() -> Self {
        Self {
            prediction_count: 5,
            time_horizon: 30000, // 30 secondes
            confidence_threshold: 0.3,
            enable_learning: true,
            history_size: 1000,
        }
    }
}

/// Prédiction générée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Prediction {
    pub id: String,
    pub action: PredictedAction,
    pub probability: f64,
    pub confidence: f64,
    pub time_to_action: u64,
    pub context: HashMap<String, String>,
    pub reasoning: String,
}

/// Action prédite
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum PredictedAction {
    /// Navigation vers une page
    Navigate { path: String },
    /// Recherche
    Search { query_hint: String },
    /// Action sur un élément
    Interact {
        element_type: String,
        action: String,
    },
    /// Demande d'aide
    RequestHelp { topic: String },
    /// Configuration
    Configure { setting: String },
    /// Création de contenu
    Create { content_type: String },
    /// Export de données
    Export { format: String },
    /// Abandon/Fermeture
    Abandon,
    /// Action inconnue
    Unknown,
}

/// Moteur de prédiction quantique
pub struct QuantumPredictiveEngine {
    config: QuantumConfig,
    prediction_model: Arc<RwLock<PredictionModel>>,
    pattern_analyzer: Arc<RwLock<PatternAnalyzer>>,
    probability_engine: Arc<RwLock<ProbabilityEngine>>,
    quantum_state: Arc<RwLock<QuantumState>>,
    intention_detector: Arc<RwLock<IntentionDetector>>,
    predictions: Arc<RwLock<Vec<Prediction>>>,
    accuracy_history: Arc<RwLock<Vec<f64>>>,
}

impl QuantumPredictiveEngine {
    /// Crée un nouveau moteur
    pub fn new(config: QuantumConfig) -> Self {
        Self {
            config: config.clone(),
            prediction_model: Arc::new(RwLock::new(PredictionModel::new(config.history_size))),
            pattern_analyzer: Arc::new(RwLock::new(PatternAnalyzer::new())),
            probability_engine: Arc::new(RwLock::new(ProbabilityEngine::new())),
            quantum_state: Arc::new(RwLock::new(QuantumState::new())),
            intention_detector: Arc::new(RwLock::new(IntentionDetector::new())),
            predictions: Arc::new(RwLock::new(Vec::new())),
            accuracy_history: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Enregistre un événement utilisateur
    pub async fn record_event(&self, event: UserEvent) {
        // Mise à jour du modèle
        {
            let mut model = self.prediction_model.write().await;
            model.record(event.clone());
        }

        // Analyse des patterns
        {
            let mut analyzer = self.pattern_analyzer.write().await;
            analyzer.analyze(&event);
        }

        // Mise à jour de l'état quantique
        {
            let mut state = self.quantum_state.write().await;
            state.update(&event);
        }

        // Détection d'intention
        {
            let mut detector = self.intention_detector.write().await;
            detector.process(&event);
        }

        // Valider les prédictions précédentes
        self.validate_predictions(&event).await;

        // Générer de nouvelles prédictions
        if self.config.enable_learning {
            self.generate_predictions().await;
        }
    }

    /// Génère des prédictions
    pub async fn generate_predictions(&self) -> Vec<Prediction> {
        let model = self.prediction_model.read().await;
        let analyzer = self.pattern_analyzer.read().await;
        let prob_engine = self.probability_engine.read().await;
        let quantum = self.quantum_state.read().await;
        let intention = self.intention_detector.read().await;

        let mut predictions = Vec::new();

        // Prédictions basées sur les patterns
        let pattern_predictions = analyzer.predict_next_actions(self.config.prediction_count);
        for (action, prob) in pattern_predictions {
            if prob >= self.config.confidence_threshold {
                predictions.push(Prediction {
                    id: format!("pred-{}", uuid_simple()),
                    action,
                    probability: prob,
                    confidence: analyzer.get_pattern_confidence(),
                    time_to_action: self.estimate_time_to_action(&prob),
                    context: HashMap::new(),
                    reasoning: "Pattern historique".to_string(),
                });
            }
        }

        // Prédictions basées sur l'intention
        if let Some(intent) = intention.get_current_intent() {
            let intent_predictions = intention.predict_from_intent(&intent);
            for (action, prob) in intent_predictions {
                if prob >= self.config.confidence_threshold {
                    predictions.push(Prediction {
                        id: format!("pred-{}", uuid_simple()),
                        action,
                        probability: prob,
                        confidence: intention.get_confidence(),
                        time_to_action: self.estimate_time_to_action(&prob),
                        context: HashMap::new(),
                        reasoning: format!("Intention détectée: {:?}", intent),
                    });
                }
            }
        }

        // Prédictions basées sur l'état quantique (superposition)
        let quantum_predictions = quantum.collapse_predictions();
        for (action, prob) in quantum_predictions {
            if prob >= self.config.confidence_threshold {
                predictions.push(Prediction {
                    id: format!("pred-{}", uuid_simple()),
                    action,
                    probability: prob,
                    confidence: quantum.get_coherence(),
                    time_to_action: self.estimate_time_to_action(&prob),
                    context: HashMap::new(),
                    reasoning: "Superposition quantique".to_string(),
                });
            }
        }

        // Fusionner et trier par probabilité
        predictions = self.merge_predictions(predictions);
        // FIX: Handle NaN values safely to prevent panic
        predictions.sort_by(|a, b| {
            b.probability
                .partial_cmp(&a.probability)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        predictions.truncate(self.config.prediction_count);

        // Sauvegarder
        {
            let mut preds = self.predictions.write().await;
            *preds = predictions.clone();
        }

        predictions
    }

    /// Fusionne les prédictions similaires
    fn merge_predictions(&self, predictions: Vec<Prediction>) -> Vec<Prediction> {
        let mut merged: HashMap<String, Prediction> = HashMap::new();

        for pred in predictions {
            let key = format!("{:?}", pred.action);

            if let Some(existing) = merged.get_mut(&key) {
                // Moyenner les probabilités
                existing.probability = (existing.probability + pred.probability) / 2.0;
                existing.confidence = existing.confidence.max(pred.confidence);
            } else {
                merged.insert(key, pred);
            }
        }

        merged.into_values().collect()
    }

    /// Estime le temps avant l'action
    fn estimate_time_to_action(&self, probability: &f64) -> u64 {
        // Plus la probabilité est haute, plus l'action est proche
        let base_time = self.config.time_horizon as f64;
        (base_time * (1.0 - probability)).max(1000.0) as u64
    }

    /// Valide les prédictions par rapport à l'événement réel
    async fn validate_predictions(&self, event: &UserEvent) {
        let predictions = self.predictions.read().await;
        let mut accuracy_history = self.accuracy_history.write().await;

        let action_from_event = self.event_to_action(event);

        for pred in predictions.iter() {
            let was_correct = pred.action == action_from_event;
            let accuracy = if was_correct { 1.0 } else { 0.0 };
            accuracy_history.push(accuracy);

            // Limiter l'historique
            if accuracy_history.len() > 100 {
                accuracy_history.remove(0);
            }
        }

        // Apprentissage basé sur la validation
        if self.config.enable_learning {
            let mut prob_engine = self.probability_engine.write().await;
            prob_engine.update_from_outcome(event, &action_from_event);
        }
    }

    /// Convertit un événement en action
    fn event_to_action(&self, event: &UserEvent) -> PredictedAction {
        match event.event_type.as_str() {
            "navigate" => PredictedAction::Navigate {
                path: event.data.get("path").cloned().unwrap_or_default(),
            },
            "search" => PredictedAction::Search {
                query_hint: event.data.get("query").cloned().unwrap_or_default(),
            },
            "click" | "interact" => PredictedAction::Interact {
                element_type: event.data.get("element").cloned().unwrap_or_default(),
                action: event.data.get("action").cloned().unwrap_or_default(),
            },
            "help" => PredictedAction::RequestHelp {
                topic: event.data.get("topic").cloned().unwrap_or_default(),
            },
            "configure" => PredictedAction::Configure {
                setting: event.data.get("setting").cloned().unwrap_or_default(),
            },
            "create" => PredictedAction::Create {
                content_type: event.data.get("type").cloned().unwrap_or_default(),
            },
            "export" => PredictedAction::Export {
                format: event.data.get("format").cloned().unwrap_or_default(),
            },
            "abandon" | "close" => PredictedAction::Abandon,
            _ => PredictedAction::Unknown,
        }
    }

    /// Retourne les prédictions actuelles
    pub async fn get_predictions(&self) -> Vec<Prediction> {
        self.predictions.read().await.clone()
    }

    /// Retourne la précision globale
    pub async fn get_accuracy(&self) -> f64 {
        let history = self.accuracy_history.read().await;
        if history.is_empty() {
            return 0.0;
        }
        history.iter().sum::<f64>() / history.len() as f64
    }

    /// Retourne les statistiques
    pub async fn get_stats(&self) -> QuantumStats {
        let predictions = self.predictions.read().await;
        let accuracy = self.get_accuracy().await;
        let quantum = self.quantum_state.read().await;

        QuantumStats {
            total_predictions: predictions.len(),
            accuracy,
            coherence: quantum.get_coherence(),
            entropy: quantum.get_entropy(),
            learning_rate: if self.config.enable_learning {
                0.01
            } else {
                0.0
            },
        }
    }
}

/// Événement utilisateur
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserEvent {
    pub id: String,
    pub event_type: String,
    pub timestamp: u64,
    pub data: HashMap<String, String>,
}

/// Statistiques du moteur
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct QuantumStats {
    pub total_predictions: usize,
    pub accuracy: f64,
    pub coherence: f64,
    pub entropy: f64,
    pub learning_rate: f64,
}

/// Génère un UUID simple
fn uuid_simple() -> String {
    uuid::Uuid::new_v4().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_quantum_engine_creation() {
        let engine = QuantumPredictiveEngine::new(QuantumConfig::default());
        let predictions = engine.get_predictions().await;
        assert!(predictions.is_empty());
    }

    #[tokio::test]
    async fn test_record_event() {
        let engine = QuantumPredictiveEngine::new(QuantumConfig::default());

        let event = UserEvent {
            id: "test-1".to_string(),
            event_type: "navigate".to_string(),
            timestamp: 0,
            data: HashMap::from([("path".to_string(), "/home".to_string())]),
        };

        engine.record_event(event).await;

        let accuracy = engine.get_accuracy().await;
        assert!(accuracy >= 0.0 && accuracy <= 1.0);
    }
}
