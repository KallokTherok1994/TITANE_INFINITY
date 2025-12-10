//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ANOMALY PREDICTOR
//! Super Prompt #4 — Prédiction proactive des anomalies
//! ═══════════════════════════════════════════════════════════════════════════════

use super::system_health::SystemHealth;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Taille de la fenêtre d'historique pour les prédictions
const PREDICTION_WINDOW: usize = 50;

/// Seuil de tendance pour alerte précoce
const TREND_ALERT_THRESHOLD: f32 = 0.15;

/// Prédiction d'anomalie
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnomalyPrediction {
    /// Probabilité d'anomalie dans les prochaines minutes (0.0 - 1.0)
    pub probability: f32,
    /// Temps estimé avant anomalie critique (en secondes, None si improbable)
    pub time_to_critical_secs: Option<u64>,
    /// Composants à risque
    pub at_risk_components: Vec<AtRiskComponent>,
    /// Confiance de la prédiction (0.0 - 1.0)
    pub confidence: f32,
    /// Timestamp de la prédiction
    pub timestamp: u64,
}

/// Composant à risque
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AtRiskComponent {
    pub name: String,
    pub risk_level: f32,
    pub trend: TrendDirection,
    pub suggested_action: Option<String>,
}

/// Direction de la tendance
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum TrendDirection {
    Improving,
    Stable,
    Degrading,
    CriticalDegradation,
}

/// Prédicteur d'anomalies basé sur les tendances
pub struct AnomalyPredictor {
    /// Historique des snapshots de santé
    history: VecDeque<SystemHealth>,
    /// Historique des scores d'anomalie
    anomaly_history: VecDeque<f32>,
    /// Dernière prédiction
    last_prediction: Option<AnomalyPrediction>,
}

impl AnomalyPredictor {
    /// Crée un nouveau prédicteur
    pub fn new() -> Self {
        Self {
            history: VecDeque::with_capacity(PREDICTION_WINDOW),
            anomaly_history: VecDeque::with_capacity(PREDICTION_WINDOW),
            last_prediction: None,
        }
    }

    /// Enregistre un nouveau snapshot de santé
    pub fn record(&mut self, health: SystemHealth) {
        // Stocker le score d'anomalie
        self.anomaly_history.push_back(health.anomaly_score);
        if self.anomaly_history.len() > PREDICTION_WINDOW {
            self.anomaly_history.pop_front();
        }

        // Stocker le snapshot complet
        self.history.push_back(health);
        if self.history.len() > PREDICTION_WINDOW {
            self.history.pop_front();
        }
    }

    /// Prédit les anomalies futures
    pub fn predict(&mut self) -> AnomalyPrediction {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        // Pas assez de données
        if self.history.len() < 5 {
            let prediction = AnomalyPrediction {
                probability: 0.0,
                time_to_critical_secs: None,
                at_risk_components: vec![],
                confidence: 0.1,
                timestamp: now,
            };
            self.last_prediction = Some(prediction.clone());
            return prediction;
        }

        // Calculer les tendances
        let anomaly_trend = self.calculate_trend(&self.anomaly_history);
        let memory_trend = self.calculate_metric_trend(|h| h.memory_usage);
        let error_trend = self.calculate_metric_trend(|h| h.error_rate);
        let latency_trend = self.calculate_latency_trend();

        // Construire la liste des composants à risque
        let mut at_risk = Vec::new();

        if memory_trend.1 > TREND_ALERT_THRESHOLD {
            at_risk.push(AtRiskComponent {
                name: "memory".to_string(),
                risk_level: memory_trend.1.min(1.0),
                trend: memory_trend.0.clone(),
                suggested_action: Some("TrimMemory ou ClearMemoryCache".to_string()),
            });
        }

        if error_trend.1 > TREND_ALERT_THRESHOLD {
            at_risk.push(AtRiskComponent {
                name: "error_rate".to_string(),
                risk_level: error_trend.1.min(1.0),
                trend: error_trend.0.clone(),
                suggested_action: Some("EnableDetailedLogging ou ReduceParallelism".to_string()),
            });
        }

        if latency_trend.1 > TREND_ALERT_THRESHOLD {
            at_risk.push(AtRiskComponent {
                name: "latency".to_string(),
                risk_level: latency_trend.1.min(1.0),
                trend: latency_trend.0.clone(),
                suggested_action: Some("RebalanceEngines ou EnableCircuitBreaker".to_string()),
            });
        }

        // Calculer la probabilité globale d'anomalie
        let trend_score =
            (anomaly_trend.1 + memory_trend.1 + error_trend.1 + latency_trend.1) / 4.0;
        let current_anomaly = self.anomaly_history.back().copied().unwrap_or(0.0);
        let probability = (current_anomaly * 0.4 + trend_score * 0.6).min(1.0);

        // Estimer le temps avant état critique
        let time_to_critical = if anomaly_trend.0 == TrendDirection::CriticalDegradation {
            Some(self.estimate_time_to_critical())
        } else if anomaly_trend.0 == TrendDirection::Degrading && current_anomaly > 0.4 {
            Some(self.estimate_time_to_critical() * 2)
        } else {
            None
        };

        // Confiance basée sur la quantité de données
        let confidence = (self.history.len() as f32 / PREDICTION_WINDOW as f32).min(1.0);

        let prediction = AnomalyPrediction {
            probability,
            time_to_critical_secs: time_to_critical,
            at_risk_components: at_risk,
            confidence,
            timestamp: now,
        };

        self.last_prediction = Some(prediction.clone());
        prediction
    }

    /// Calcule la tendance d'une série de valeurs
    fn calculate_trend(&self, values: &VecDeque<f32>) -> (TrendDirection, f32) {
        if values.len() < 3 {
            return (TrendDirection::Stable, 0.0);
        }

        let len = values.len();
        let recent: Vec<f32> = values.iter().skip(len.saturating_sub(5)).copied().collect();
        let older: Vec<f32> = values.iter().take(5).copied().collect();

        let recent_avg: f32 = recent.iter().sum::<f32>() / recent.len() as f32;
        let older_avg: f32 = older.iter().sum::<f32>() / older.len() as f32;

        let delta = recent_avg - older_avg;

        let direction = if delta > 0.2 {
            TrendDirection::CriticalDegradation
        } else if delta > 0.05 {
            TrendDirection::Degrading
        } else if delta < -0.05 {
            TrendDirection::Improving
        } else {
            TrendDirection::Stable
        };

        (direction, delta.abs())
    }

    /// Calcule la tendance d'une métrique spécifique
    fn calculate_metric_trend<F>(&self, extractor: F) -> (TrendDirection, f32)
    where
        F: Fn(&SystemHealth) -> f32,
    {
        let values: VecDeque<f32> = self.history.iter().map(&extractor).collect();
        self.calculate_trend(&values)
    }

    /// Calcule la tendance de latence (normalisée)
    fn calculate_latency_trend(&self) -> (TrendDirection, f32) {
        let values: VecDeque<f32> = self
            .history
            .iter()
            .map(|h| (h.omega_latency as f32 / 500.0).min(1.0)) // Normaliser sur 500ms
            .collect();
        self.calculate_trend(&values)
    }

    /// Estime le temps avant état critique (en secondes)
    fn estimate_time_to_critical(&self) -> u64 {
        if self.anomaly_history.len() < 2 {
            return 300; // 5 minutes par défaut
        }

        let current = *self.anomaly_history.back().unwrap_or(&0.0);
        let previous = *self.anomaly_history.iter().rev().nth(1).unwrap_or(&0.0);
        let rate_of_change = current - previous;

        if rate_of_change <= 0.0 {
            return 600; // 10 minutes si amélioration
        }

        // Temps pour atteindre 0.8 (critique)
        let remaining = (0.8 - current).max(0.0);
        let time_per_sample = 10; // 10 secondes entre samples approximativement

        ((remaining / rate_of_change) as u64 * time_per_sample)
            .max(30)
            .min(600)
    }

    /// Retourne la dernière prédiction
    pub fn last_prediction(&self) -> Option<&AnomalyPrediction> {
        self.last_prediction.as_ref()
    }

    /// Retourne les statistiques du prédicteur
    pub fn stats(&self) -> PredictorStats {
        let anomaly_avg = if self.anomaly_history.is_empty() {
            0.0
        } else {
            self.anomaly_history.iter().sum::<f32>() / self.anomaly_history.len() as f32
        };

        PredictorStats {
            samples_collected: self.history.len(),
            average_anomaly_score: anomaly_avg,
            current_trend: self.calculate_trend(&self.anomaly_history).0,
            prediction_confidence: self
                .last_prediction
                .as_ref()
                .map(|p| p.confidence)
                .unwrap_or(0.0),
        }
    }

    /// Réinitialise le prédicteur
    pub fn reset(&mut self) {
        self.history.clear();
        self.anomaly_history.clear();
        self.last_prediction = None;
    }
}

impl Default for AnomalyPredictor {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques du prédicteur
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PredictorStats {
    pub samples_collected: usize,
    pub average_anomaly_score: f32,
    pub current_trend: TrendDirection,
    pub prediction_confidence: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_predictor_creation() {
        let predictor = AnomalyPredictor::new();
        assert_eq!(predictor.history.len(), 0);
    }

    #[test]
    fn test_record_and_predict() {
        let mut predictor = AnomalyPredictor::new();

        // Enregistrer plusieurs snapshots
        for i in 0..10 {
            let mut health = SystemHealth::healthy();
            health.anomaly_score = 0.1 * (i as f32 / 10.0);
            predictor.record(health);
        }

        let prediction = predictor.predict();
        assert!(prediction.confidence > 0.0);
        assert!(prediction.probability >= 0.0);
    }

    #[test]
    fn test_degrading_trend_detection() {
        let mut predictor = AnomalyPredictor::new();

        // Simuler une dégradation progressive
        for i in 0..15 {
            let mut health = SystemHealth::healthy();
            health.anomaly_score = 0.1 + (i as f32 * 0.05);
            health.memory_usage = 0.3 + (i as f32 * 0.03);
            predictor.record(health);
        }

        let prediction = predictor.predict();

        // La probabilité devrait augmenter avec la dégradation
        assert!(prediction.probability > 0.3);
        assert!(!prediction.at_risk_components.is_empty());
    }

    #[test]
    fn test_improving_trend() {
        let mut predictor = AnomalyPredictor::new();

        // Simuler une amélioration
        for i in 0..15 {
            let mut health = SystemHealth::healthy();
            health.anomaly_score = 0.5 - (i as f32 * 0.03);
            predictor.record(health);
        }

        let prediction = predictor.predict();
        let stats = predictor.stats();

        // La tendance devrait être en amélioration
        assert_eq!(stats.current_trend, TrendDirection::Improving);
    }

    #[test]
    fn test_time_to_critical_estimation() {
        let mut predictor = AnomalyPredictor::new();

        // Simuler une dégradation rapide vers critique
        for i in 0..10 {
            let mut health = SystemHealth::healthy();
            health.anomaly_score = 0.5 + (i as f32 * 0.04);
            predictor.record(health);
        }

        let prediction = predictor.predict();

        // Devrait avoir une estimation de temps avant critique
        if let Some(time) = prediction.time_to_critical_secs {
            assert!(time > 0);
            assert!(time < 600); // Moins de 10 minutes
        }
    }

    #[test]
    fn test_reset() {
        let mut predictor = AnomalyPredictor::new();

        for _ in 0..5 {
            predictor.record(SystemHealth::healthy());
        }

        predictor.reset();
        assert_eq!(predictor.history.len(), 0);
        assert!(predictor.last_prediction().is_none());
    }
}
