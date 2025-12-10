//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ANTICIPATOR ENGINE
//! Super Prompt #18 — Anticipation et prédiction temporelle
//! ═══════════════════════════════════════════════════════════════════════════════

use super::planner::PlanningHorizon;
use super::temporal_memory::TemporalMemory;
use super::time_model::TemporalContext;
use serde::{Deserialize, Serialize};

/// Confiance de prédiction
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PredictionConfidence {
    VeryLow,
    Low,
    Medium,
    High,
    VeryHigh,
}

impl PredictionConfidence {
    pub fn from_score(score: f32) -> Self {
        match score {
            s if s >= 0.9 => Self::VeryHigh,
            s if s >= 0.75 => Self::High,
            s if s >= 0.5 => Self::Medium,
            s if s >= 0.25 => Self::Low,
            _ => Self::VeryLow,
        }
    }

    pub fn to_score(&self) -> f32 {
        match self {
            Self::VeryHigh => 0.95,
            Self::High => 0.8,
            Self::Medium => 0.6,
            Self::Low => 0.35,
            Self::VeryLow => 0.15,
        }
    }
}

/// Type de prédiction
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum PredictionType {
    /// Événement probable
    Event { event_type: String },
    /// Comportement attendu
    Behavior { pattern: String },
    /// Besoin anticipé
    Need { need_type: String },
    /// Risque potentiel
    Risk { risk_type: String, severity: u8 },
    /// Opportunité
    Opportunity { description: String },
    /// Changement d'état
    StateChange { from: String, to: String },
}

/// Prédiction
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Prediction {
    pub id: String,
    pub prediction_type: PredictionType,
    pub description: String,
    pub confidence: PredictionConfidence,
    pub confidence_score: f32,
    pub horizon: PlanningHorizon,
    pub predicted_at: u64,
    pub expected_at: Option<u64>,
    pub supporting_evidence: Vec<String>,
    pub recommended_actions: Vec<String>,
}

impl Prediction {
    pub fn new(prediction_type: PredictionType, description: &str, confidence_score: f32) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            prediction_type,
            description: description.to_string(),
            confidence: PredictionConfidence::from_score(confidence_score),
            confidence_score,
            horizon: PlanningHorizon::Today,
            predicted_at: now,
            expected_at: None,
            supporting_evidence: Vec::new(),
            recommended_actions: Vec::new(),
        }
    }
}

/// Anticipateur
pub struct Anticipator {
    models: Vec<PredictionModel>,
    predictions_cache: tokio::sync::RwLock<Vec<Prediction>>,
    stats: tokio::sync::RwLock<AnticipatorStats>,
}

impl Anticipator {
    pub fn new() -> Self {
        Self {
            models: Self::create_default_models(),
            predictions_cache: tokio::sync::RwLock::new(Vec::new()),
            stats: tokio::sync::RwLock::new(AnticipatorStats::default()),
        }
    }

    fn create_default_models() -> Vec<PredictionModel> {
        vec![
            // Modèle de rythme circadien
            PredictionModel {
                id: "circadian".to_string(),
                name: "Circadian Rhythm Model".to_string(),
                model_type: ModelType::Circadian,
                weight: 0.8,
                enabled: true,
            },
            // Modèle de patterns hebdomadaires
            PredictionModel {
                id: "weekly_pattern".to_string(),
                name: "Weekly Pattern Model".to_string(),
                model_type: ModelType::WeeklyPattern,
                weight: 0.7,
                enabled: true,
            },
            // Modèle de tendance
            PredictionModel {
                id: "trend".to_string(),
                name: "Trend Analysis Model".to_string(),
                model_type: ModelType::Trend,
                weight: 0.6,
                enabled: true,
            },
            // Modèle de corrélation
            PredictionModel {
                id: "correlation".to_string(),
                name: "Correlation Model".to_string(),
                model_type: ModelType::Correlation,
                weight: 0.5,
                enabled: true,
            },
        ]
    }

    /// Génère des prédictions basées sur le contexte
    pub async fn predict(
        &self,
        context: &TemporalContext,
        memory: &TemporalMemory,
    ) -> Vec<Prediction> {
        let mut predictions = Vec::new();

        for model in &self.models {
            if !model.enabled {
                continue;
            }

            let model_predictions = self.run_model(model, context, memory).await;
            predictions.extend(model_predictions);
        }

        // Trier par confiance
        predictions.sort_by(|a, b| {
            b.confidence_score
                .partial_cmp(&a.confidence_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Limiter et mettre en cache
        predictions.truncate(20);
        *self.predictions_cache.write().await = predictions.clone();

        // Stats
        let mut stats = self.stats.write().await;
        stats.predictions_made += predictions.len() as u64;

        predictions
    }

    /// Génère des prédictions pour un horizon spécifique
    pub async fn predict_horizon(
        &self,
        context: &TemporalContext,
        memory: &TemporalMemory,
        horizon: PlanningHorizon,
    ) -> Vec<Prediction> {
        let all_predictions = self.predict(context, memory).await;

        all_predictions
            .into_iter()
            .filter(|p| p.horizon == horizon)
            .collect()
    }

    /// Exécute un modèle de prédiction
    async fn run_model(
        &self,
        model: &PredictionModel,
        context: &TemporalContext,
        memory: &TemporalMemory,
    ) -> Vec<Prediction> {
        match model.model_type {
            ModelType::Circadian => self.predict_circadian(context, model.weight).await,
            ModelType::WeeklyPattern => self.predict_weekly(context, model.weight).await,
            ModelType::Trend => self.predict_trend(context, memory, model.weight).await,
            ModelType::Correlation => {
                self.predict_correlation(context, memory, model.weight)
                    .await
            }
        }
    }

    /// Prédictions basées sur le rythme circadien
    async fn predict_circadian(&self, context: &TemporalContext, weight: f32) -> Vec<Prediction> {
        let mut predictions = Vec::new();

        // Prédire le niveau d'énergie futur
        let hours_ahead = [1, 2, 4, 8];

        for hours in hours_ahead {
            let future_hour = (context.now.hour + hours as u8) % 24;
            let predicted_energy = self.estimate_energy_at_hour(future_hour);

            let now = context.now.timestamp_ms;
            let expected_at = now + (hours as u64 * 3600000);

            // Si baisse significative d'énergie prévue
            if predicted_energy < context.cognitive_energy_estimate - 0.2 {
                let prediction = Prediction {
                    id: uuid::Uuid::new_v4().to_string(),
                    prediction_type: PredictionType::StateChange {
                        from: format!("energy_{:.0}%", context.cognitive_energy_estimate * 100.0),
                        to: format!("energy_{:.0}%", predicted_energy * 100.0),
                    },
                    description: format!("Energy dip expected in {} hours", hours),
                    confidence: PredictionConfidence::from_score(weight * 0.9),
                    confidence_score: weight * 0.9,
                    horizon: if hours <= 2 {
                        PlanningHorizon::Today
                    } else {
                        PlanningHorizon::Today
                    },
                    predicted_at: now,
                    expected_at: Some(expected_at),
                    supporting_evidence: vec!["Circadian rhythm pattern".to_string()],
                    recommended_actions: vec![
                        "Schedule demanding tasks earlier".to_string(),
                        "Plan for a break".to_string(),
                    ],
                };
                predictions.push(prediction);
            }

            // Si pic de productivité prévu
            if predicted_energy > context.cognitive_energy_estimate + 0.15 {
                let prediction = Prediction {
                    id: uuid::Uuid::new_v4().to_string(),
                    prediction_type: PredictionType::Opportunity {
                        description: format!("Peak productivity window in {} hours", hours),
                    },
                    description: format!(
                        "High energy period expected around {:02}:00",
                        future_hour
                    ),
                    confidence: PredictionConfidence::from_score(weight * 0.85),
                    confidence_score: weight * 0.85,
                    horizon: PlanningHorizon::Today,
                    predicted_at: now,
                    expected_at: Some(expected_at),
                    supporting_evidence: vec!["Circadian peak time".to_string()],
                    recommended_actions: vec!["Reserve this time for focused work".to_string()],
                };
                predictions.push(prediction);
            }
        }

        predictions
    }

    /// Estime l'énergie à une heure donnée
    fn estimate_energy_at_hour(&self, hour: u8) -> f32 {
        match hour {
            5..=6 => 0.5,
            7..=8 => 0.7,
            9..=11 => 0.9,
            12..=13 => 0.65,
            14..=16 => 0.8,
            17..=18 => 0.7,
            19..=21 => 0.55,
            22..=23 => 0.35,
            _ => 0.2,
        }
    }

    /// Prédictions basées sur les patterns hebdomadaires
    async fn predict_weekly(&self, context: &TemporalContext, weight: f32) -> Vec<Prediction> {
        let mut predictions = Vec::new();
        let now = context.now.timestamp_ms;

        // Prédire le jour le plus productif à venir
        let current_day = context.now.day_of_week;

        // Mardi et mercredi sont généralement les plus productifs
        let productive_days = [2u8, 3u8]; // Tuesday, Wednesday
        let next_productive_day = productive_days
            .iter()
            .find(|&&d| d > current_day)
            .copied()
            .unwrap_or(productive_days[0]);

        let days_until = if next_productive_day > current_day {
            next_productive_day - current_day
        } else {
            7 - current_day + next_productive_day
        };

        if days_until > 0 && days_until <= 5 {
            predictions.push(Prediction {
                id: uuid::Uuid::new_v4().to_string(),
                prediction_type: PredictionType::Opportunity {
                    description: "High productivity day ahead".to_string(),
                },
                description: format!("Optimal productivity day in {} days", days_until),
                confidence: PredictionConfidence::from_score(weight * 0.7),
                confidence_score: weight * 0.7,
                horizon: PlanningHorizon::ThisWeek,
                predicted_at: now,
                expected_at: Some(now + (days_until as u64 * 86400000)),
                supporting_evidence: vec!["Weekly productivity patterns".to_string()],
                recommended_actions: vec!["Plan important tasks for this day".to_string()],
            });
        }

        // Vendredi après-midi = baisse de motivation
        if context.now.day_of_week == 5 && context.now.hour >= 14 {
            predictions.push(Prediction {
                id: uuid::Uuid::new_v4().to_string(),
                prediction_type: PredictionType::Risk {
                    risk_type: "productivity_drop".to_string(),
                    severity: 3,
                },
                description: "End of week productivity dip".to_string(),
                confidence: PredictionConfidence::from_score(weight * 0.75),
                confidence_score: weight * 0.75,
                horizon: PlanningHorizon::Today,
                predicted_at: now,
                expected_at: None,
                supporting_evidence: vec!["Friday afternoon pattern".to_string()],
                recommended_actions: vec![
                    "Focus on lighter tasks".to_string(),
                    "Review and plan for next week".to_string(),
                ],
            });
        }

        predictions
    }

    /// Prédictions basées sur les tendances
    async fn predict_trend(
        &self,
        context: &TemporalContext,
        memory: &TemporalMemory,
        weight: f32,
    ) -> Vec<Prediction> {
        let mut predictions = Vec::new();
        let now = context.now.timestamp_ms;

        // Analyser les traces récentes pour détecter des tendances
        let recent_traces = memory.recent(50).await;

        if recent_traces.is_empty() {
            return predictions;
        }

        // Compter les types d'événements
        let mut event_counts: std::collections::HashMap<String, u32> =
            std::collections::HashMap::new();
        for trace in &recent_traces {
            *event_counts.entry(trace.event_type.clone()).or_insert(0) += 1;
        }

        // Détecter les tendances montantes
        for (event_type, count) in &event_counts {
            if *count >= 5 {
                // Tendance significative
                predictions.push(Prediction {
                    id: uuid::Uuid::new_v4().to_string(),
                    prediction_type: PredictionType::Event {
                        event_type: event_type.clone(),
                    },
                    description: format!(
                        "'{}' events are trending ({}x recently)",
                        event_type, count
                    ),
                    confidence: PredictionConfidence::from_score(
                        weight * (*count as f32 / 10.0).min(0.8),
                    ),
                    confidence_score: weight * (*count as f32 / 10.0).min(0.8),
                    horizon: PlanningHorizon::Today,
                    predicted_at: now,
                    expected_at: None,
                    supporting_evidence: vec![format!("{} occurrences in recent traces", count)],
                    recommended_actions: Vec::new(),
                });
            }
        }

        predictions
    }

    /// Prédictions basées sur les corrélations
    async fn predict_correlation(
        &self,
        context: &TemporalContext,
        _memory: &TemporalMemory,
        weight: f32,
    ) -> Vec<Prediction> {
        let mut predictions = Vec::new();
        let now = context.now.timestamp_ms;

        // Corrélation énergie-heure (déjà couverte par circadien)
        // Corrélation weekend-comportement
        if context.now.is_weekend {
            predictions.push(Prediction {
                id: uuid::Uuid::new_v4().to_string(),
                prediction_type: PredictionType::Behavior {
                    pattern: "weekend_mode".to_string(),
                },
                description: "Weekend behavior patterns expected".to_string(),
                confidence: PredictionConfidence::from_score(weight * 0.8),
                confidence_score: weight * 0.8,
                horizon: PlanningHorizon::Today,
                predicted_at: now,
                expected_at: None,
                supporting_evidence: vec!["Weekend correlation".to_string()],
                recommended_actions: vec!["Flexible schedule recommended".to_string()],
            });
        }

        // Corrélation fin de session
        if context.session_duration_ms > 7200000 {
            predictions.push(Prediction {
                id: uuid::Uuid::new_v4().to_string(),
                prediction_type: PredictionType::Need {
                    need_type: "break".to_string(),
                },
                description: "Break likely needed soon".to_string(),
                confidence: PredictionConfidence::from_score(weight * 0.75),
                confidence_score: weight * 0.75,
                horizon: PlanningHorizon::Today,
                predicted_at: now,
                expected_at: Some(now + 1800000), // 30 min
                supporting_evidence: vec![format!(
                    "Session duration: {} hours",
                    context.session_duration_ms / 3600000
                )],
                recommended_actions: vec!["Consider taking a short break".to_string()],
            });
        }

        predictions
    }

    /// Récupère les prédictions en cache
    pub async fn cached_predictions(&self) -> Vec<Prediction> {
        self.predictions_cache.read().await.clone()
    }

    /// Statistiques
    pub async fn stats(&self) -> AnticipatorStats {
        self.stats.read().await.clone()
    }
}

impl Default for Anticipator {
    fn default() -> Self {
        Self::new()
    }
}

/// Modèle de prédiction
#[derive(Clone, Debug)]
struct PredictionModel {
    id: String,
    name: String,
    model_type: ModelType,
    weight: f32,
    enabled: bool,
}

/// Type de modèle
#[derive(Clone, Debug)]
enum ModelType {
    Circadian,
    WeeklyPattern,
    Trend,
    Correlation,
}

/// Statistiques de l'anticipateur
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AnticipatorStats {
    pub predictions_made: u64,
    pub predictions_verified: u64,
    pub accuracy: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_prediction_confidence() {
        assert_eq!(
            PredictionConfidence::from_score(0.95),
            PredictionConfidence::VeryHigh
        );
        assert_eq!(
            PredictionConfidence::from_score(0.5),
            PredictionConfidence::Medium
        );
        assert_eq!(
            PredictionConfidence::from_score(0.1),
            PredictionConfidence::VeryLow
        );
    }

    #[tokio::test]
    async fn test_anticipator() {
        let anticipator = Anticipator::new();
        let stats = anticipator.stats().await;
        assert_eq!(stats.predictions_made, 0);
    }
}
