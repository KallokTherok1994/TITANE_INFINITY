//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — PREDICTIVE ENERGY
//! Super Prompt #20 — Prédiction et anticipation énergétique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::VecDeque;
use super::energy_model::{EnergyDimension, EnergyState, EnergyTrend};

/// Prévision énergétique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyForecast {
    pub timestamp: u64,
    pub horizon_ms: u64,
    pub predictions: Vec<DimensionPrediction>,
    pub global_prediction: f32,
    pub confidence: f32,
    pub warnings: Vec<EnergyWarning>,
    pub recommendations: Vec<String>,
}

/// Prédiction par dimension
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DimensionPrediction {
    pub dimension: EnergyDimension,
    pub current: f32,
    pub predicted: f32,
    pub trend: EnergyTrend,
    pub confidence: f32,
    pub time_to_critical: Option<u64>,
}

/// Avertissement énergétique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyWarning {
    pub severity: WarningSeverity,
    pub dimension: Option<EnergyDimension>,
    pub message: String,
    pub expected_at_ms: u64,
    pub mitigation: String,
}

/// Sévérité d'avertissement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum WarningSeverity {
    Info,
    Caution,
    Warning,
    Critical,
}

/// Point de données historique
#[derive(Clone, Debug)]
struct HistoryPoint {
    timestamp: u64,
    global: f32,
    dimensions: std::collections::HashMap<EnergyDimension, f32>,
}

/// Prédicteur d'énergie
pub struct EnergyPredictor {
    history: RwLock<VecDeque<HistoryPoint>>,
    max_history: usize,
    forecasts: RwLock<VecDeque<EnergyForecast>>,
    config: PredictorConfig,
}

impl EnergyPredictor {
    pub fn new() -> Self {
        Self {
            history: RwLock::new(VecDeque::new()),
            max_history: 500,
            forecasts: RwLock::new(VecDeque::new()),
            config: PredictorConfig::default(),
        }
    }

    pub fn with_config(config: PredictorConfig) -> Self {
        Self {
            history: RwLock::new(VecDeque::new()),
            max_history: 500,
            forecasts: RwLock::new(VecDeque::new()),
            config,
        }
    }

    /// Enregistre un état pour l'historique
    pub async fn record_state(&self, state: &EnergyState) {
        let point = HistoryPoint {
            timestamp: Self::now(),
            global: state.global_energy,
            dimensions: state.dimensions.iter()
                .map(|(k, v)| (*k, v.current))
                .collect(),
        };

        let mut history = self.history.write().await;
        history.push_back(point);

        while history.len() > self.max_history {
            history.pop_front();
        }
    }

    /// Génère une prévision
    pub async fn forecast(&self, state: &EnergyState, horizon_ms: u64) -> EnergyForecast {
        let history = self.history.read().await;

        let mut predictions = Vec::new();
        let mut warnings = Vec::new();

        // Prédiction par dimension
        for (dimension, level) in &state.dimensions {
            let prediction = self.predict_dimension(
                *dimension,
                level.current,
                &history,
                horizon_ms,
            );

            // Vérifier si critique
            if let Some(ttc) = prediction.time_to_critical {
                if ttc < horizon_ms {
                    warnings.push(EnergyWarning {
                        severity: if ttc < horizon_ms / 4 {
                            WarningSeverity::Critical
                        } else if ttc < horizon_ms / 2 {
                            WarningSeverity::Warning
                        } else {
                            WarningSeverity::Caution
                        },
                        dimension: Some(*dimension),
                        message: format!("{:?} will reach critical level", dimension),
                        expected_at_ms: ttc,
                        mitigation: self.suggest_mitigation(*dimension),
                    });
                }
            }

            predictions.push(prediction);
        }

        // Prédiction globale
        let global_prediction = self.predict_global(state.global_energy, &history, horizon_ms);

        // Avertissement global
        if global_prediction < self.config.critical_threshold {
            warnings.push(EnergyWarning {
                severity: WarningSeverity::Warning,
                dimension: None,
                message: "Global energy predicted to reach critical level".to_string(),
                expected_at_ms: self.estimate_time_to_threshold(
                    state.global_energy,
                    global_prediction,
                    self.config.critical_threshold,
                    horizon_ms,
                ),
                mitigation: "Consider reducing activity or scheduling recovery".to_string(),
            });
        }

        // Recommandations
        let recommendations = self.generate_recommendations(&predictions, &warnings);

        // Calculer la confiance
        let confidence = self.calculate_confidence(&history, horizon_ms);

        let forecast = EnergyForecast {
            timestamp: Self::now(),
            horizon_ms,
            predictions,
            global_prediction,
            confidence,
            warnings,
            recommendations,
        };

        // Stocker la prévision
        let mut forecasts = self.forecasts.write().await;
        forecasts.push_back(forecast.clone());
        while forecasts.len() > 50 {
            forecasts.pop_front();
        }

        forecast
    }

    /// Prédit l'énergie d'une dimension
    fn predict_dimension(
        &self,
        dimension: EnergyDimension,
        current: f32,
        history: &VecDeque<HistoryPoint>,
        horizon_ms: u64,
    ) -> DimensionPrediction {
        // Calculer la tendance
        let trend = self.calculate_trend(dimension, history);
        let rate = self.calculate_rate(dimension, history);

        // Prédiction linéaire simple
        let predicted = (current + rate * (horizon_ms as f32 / 60000.0))
            .clamp(0.0, 1.0);

        // Temps avant niveau critique
        let time_to_critical = if rate < 0.0 && current > self.config.critical_threshold {
            let time = ((current - self.config.critical_threshold) / (-rate)) * 60000.0;
            Some(time as u64)
        } else {
            None
        };

        // Confiance basée sur la quantité de données
        let confidence = (history.len() as f32 / 50.0).min(1.0);

        DimensionPrediction {
            dimension,
            current,
            predicted,
            trend,
            confidence,
            time_to_critical,
        }
    }

    /// Prédit l'énergie globale
    fn predict_global(&self, current: f32, history: &VecDeque<HistoryPoint>, horizon_ms: u64) -> f32 {
        if history.len() < 2 {
            return current;
        }

        // Calculer le taux de changement
        let recent: Vec<_> = history.iter().rev().take(10).collect();
        if recent.len() < 2 {
            return current;
        }

        let first = match recent.last() {
            Some(f) => f,
            None => return current,
        };
        let last = match recent.first() {
            Some(l) => l,
            None => return current,
        };

        let time_diff = (last.timestamp - first.timestamp) as f32;
        if time_diff == 0.0 {
            return current;
        }

        let rate = (last.global - first.global) / time_diff;
        let predicted = current + rate * horizon_ms as f32;

        predicted.clamp(0.0, 1.0)
    }

    /// Calcule la tendance d'une dimension
    fn calculate_trend(&self, dimension: EnergyDimension, history: &VecDeque<HistoryPoint>) -> EnergyTrend {
        if history.len() < 3 {
            return EnergyTrend::Stable;
        }

        let values: Vec<f32> = history.iter()
            .rev()
            .take(10)
            .filter_map(|p| p.dimensions.get(&dimension).copied())
            .collect();

        if values.len() < 3 {
            return EnergyTrend::Stable;
        }

        let first_avg = values.iter().rev().take(3).sum::<f32>() / 3.0;
        let last_avg = values.iter().take(3).sum::<f32>() / 3.0;

        let diff = last_avg - first_avg;

        if diff > 0.05 {
            if diff > 0.15 {
                EnergyTrend::RisingFast
            } else {
                EnergyTrend::Rising
            }
        } else if diff < -0.05 {
            if diff < -0.15 {
                EnergyTrend::FallingFast
            } else {
                EnergyTrend::Falling
            }
        } else {
            EnergyTrend::Stable
        }
    }

    /// Calcule le taux de changement (par minute)
    fn calculate_rate(&self, dimension: EnergyDimension, history: &VecDeque<HistoryPoint>) -> f32 {
        if history.len() < 2 {
            return 0.0;
        }

        let recent: Vec<_> = history.iter()
            .rev()
            .take(10)
            .filter_map(|p| p.dimensions.get(&dimension).map(|v| (p.timestamp, *v)))
            .collect();

        if recent.len() < 2 {
            return 0.0;
        }

        let (t1, v1) = match recent.last() {
            Some(tuple) => *tuple,
            None => return 0.0,
        };
        let (t2, v2) = match recent.first() {
            Some(tuple) => *tuple,
            None => return 0.0,
        };

        let time_diff_min = (t2 - t1) as f32 / 60000.0;
        if time_diff_min == 0.0 {
            return 0.0;
        }

        (v2 - v1) / time_diff_min
    }

    /// Estime le temps avant d'atteindre un seuil
    fn estimate_time_to_threshold(
        &self,
        current: f32,
        predicted: f32,
        threshold: f32,
        horizon_ms: u64,
    ) -> u64 {
        if current <= threshold {
            return 0;
        }

        if predicted >= threshold {
            return horizon_ms;
        }

        let rate = (predicted - current) / horizon_ms as f32;
        if rate >= 0.0 {
            return horizon_ms;
        }

        ((current - threshold) / (-rate)) as u64
    }

    /// Suggère une mitigation pour une dimension
    fn suggest_mitigation(&self, dimension: EnergyDimension) -> String {
        match dimension {
            EnergyDimension::Cognitive => "Réduire la complexité des tâches ou faire une pause cognitive".to_string(),
            EnergyDimension::Creative => "Changer de type d'activité, éviter les tâches créatives".to_string(),
            EnergyDimension::Social => "Limiter les interactions, prévoir du temps seul".to_string(),
            EnergyDimension::Executive => "Simplifier les décisions, déléguer si possible".to_string(),
            EnergyDimension::Memory => "Externaliser l'information, prendre des notes".to_string(),
            EnergyDimension::Sensory => "Réduire les stimuli, environnement calme".to_string(),
            EnergyDimension::Physical => "Repos physique, éviter les efforts".to_string(),
        }
    }

    /// Génère des recommandations
    fn generate_recommendations(
        &self,
        predictions: &[DimensionPrediction],
        warnings: &[EnergyWarning],
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Basé sur les tendances
        let falling_fast: Vec<_> = predictions.iter()
            .filter(|p| p.trend == EnergyTrend::FallingFast)
            .collect();

        if !falling_fast.is_empty() {
            recommendations.push(format!(
                "Attention: {} dimension(s) en déclin rapide",
                falling_fast.len()
            ));
        }

        // Basé sur les avertissements
        let critical_warnings: Vec<_> = warnings.iter()
            .filter(|w| w.severity == WarningSeverity::Critical)
            .collect();

        if !critical_warnings.is_empty() {
            recommendations.push("Récupération urgente recommandée".to_string());
        }

        // Recommandation générale
        let avg_predicted: f32 = predictions.iter()
            .map(|p| p.predicted)
            .sum::<f32>() / predictions.len().max(1) as f32;

        if avg_predicted < 0.3 {
            recommendations.push("Planifier une période de repos dans l'heure".to_string());
        } else if avg_predicted < 0.5 {
            recommendations.push("Considérer une pause dans les 2 heures".to_string());
        }

        recommendations
    }

    /// Calcule la confiance de la prédiction
    fn calculate_confidence(&self, history: &VecDeque<HistoryPoint>, horizon_ms: u64) -> f32 {
        // Plus d'historique = plus de confiance
        let history_factor = (history.len() as f32 / 100.0).min(1.0);

        // Horizon court = plus de confiance
        let horizon_factor = (1.0 - (horizon_ms as f32 / 3600000.0)).max(0.3);

        history_factor * 0.6 + horizon_factor * 0.4
    }

    /// Prévisions récentes
    pub async fn recent_forecasts(&self, count: usize) -> Vec<EnergyForecast> {
        let forecasts = self.forecasts.read().await;
        forecasts.iter().rev().take(count).cloned().collect()
    }

    /// Évalue la précision des prévisions passées
    pub async fn evaluate_accuracy(&self, current_state: &EnergyState) -> f32 {
        let forecasts = self.forecasts.read().await;

        if forecasts.is_empty() {
            return 0.0;
        }

        // Comparer les prévisions passées avec l'état actuel
        let mut total_error = 0.0;
        let mut count = 0;

        for forecast in forecasts.iter().rev().take(10) {
            let predicted_global = forecast.global_prediction;
            let actual = current_state.global_energy;
            total_error += (predicted_global - actual).abs();
            count += 1;
        }

        if count == 0 {
            return 0.0;
        }

        let avg_error = total_error / count as f32;
        (1.0 - avg_error * 2.0).max(0.0)
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for EnergyPredictor {
    fn default() -> Self {
        Self::new()
    }
}

/// Configuration du prédicteur
#[derive(Clone, Debug)]
pub struct PredictorConfig {
    pub critical_threshold: f32,
    pub warning_threshold: f32,
    pub prediction_smoothing: f32,
}

impl Default for PredictorConfig {
    fn default() -> Self {
        Self {
            critical_threshold: 0.15,
            warning_threshold: 0.30,
            prediction_smoothing: 0.3,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::energy_model::EnergyLevel;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_predictor() {
        let predictor = EnergyPredictor::new();

        let mut dimensions = HashMap::new();
        dimensions.insert(EnergyDimension::Cognitive, EnergyLevel {
            current: 0.7,
            baseline: 0.8,
            min: 0.0,
            max: 1.0,
        });

        let state = EnergyState {
            global_energy: 0.7,
            dimensions,
            fatigue_level: 0.3,
            trend: EnergyTrend::Stable,
            last_update: 0,
        };

        let forecast = predictor.forecast(&state, 3600000).await;
        assert!(forecast.confidence >= 0.0);
    }
}
