//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ENERGY DIAGNOSTICS
//! Super Prompt #20 — Diagnostics du système énergétique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::VecDeque;
use super::energy_model::{EnergyDimension, EnergyState};

/// Événement de diagnostic énergétique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyDiagnosticEvent {
    pub timestamp: u64,
    pub event_type: EnergyEventType,
    pub severity: DiagnosticSeverity,
    pub message: String,
    pub dimension: Option<EnergyDimension>,
    pub value: Option<f32>,
    pub metadata: Option<serde_json::Value>,
}

/// Type d'événement énergétique
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum EnergyEventType {
    /// Niveau critique atteint
    CriticalLevel,
    /// Récupération initiée
    RecoveryStarted,
    /// Récupération terminée
    RecoveryCompleted,
    /// Régulation appliquée
    RegulationApplied,
    /// Surcharge détectée
    OverloadDetected,
    /// Équilibre restauré
    BalanceRestored,
    /// Prédiction générée
    PredictionMade,
    /// Anomalie détectée
    AnomalyDetected,
    /// Changement de mode
    ModeChanged,
    /// Tick effectué
    TickCompleted,
}

/// Sévérité de diagnostic
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiagnosticSeverity {
    Debug,
    Info,
    Warning,
    Error,
    Critical,
}

/// Rapport de diagnostic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnergyDiagnosticReport {
    pub timestamp: u64,
    pub overall_health: f32,
    pub total_events: usize,
    pub events_by_type: std::collections::HashMap<String, usize>,
    pub events_by_severity: std::collections::HashMap<String, usize>,
    pub critical_events: Vec<EnergyDiagnosticEvent>,
    pub dimension_health: std::collections::HashMap<EnergyDimension, f32>,
    pub recommendations: Vec<String>,
    pub anomalies: Vec<Anomaly>,
}

/// Anomalie détectée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Anomaly {
    pub anomaly_type: AnomalyType,
    pub dimension: Option<EnergyDimension>,
    pub description: String,
    pub severity: f32,
    pub detected_at: u64,
}

/// Type d'anomalie
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AnomalyType {
    /// Chute rapide d'énergie
    RapidDrop,
    /// Consommation anormalement élevée
    HighConsumption,
    /// Récupération lente
    SlowRecovery,
    /// Oscillation inhabituelle
    Oscillation,
    /// Déséquilibre persistant
    PersistentImbalance,
    /// Pattern inhabituel
    UnusualPattern,
}

/// Diagnostics énergétiques
pub struct EnergyDiagnostics {
    events: RwLock<VecDeque<EnergyDiagnosticEvent>>,
    max_events: usize,
    anomalies: RwLock<Vec<Anomaly>>,
    stats: RwLock<DiagnosticStats>,
    state_history: RwLock<VecDeque<StateSnapshot>>,
}

#[derive(Clone, Debug)]
struct StateSnapshot {
    timestamp: u64,
    global_energy: f32,
    fatigue: f32,
}

impl EnergyDiagnostics {
    pub fn new() -> Self {
        Self {
            events: RwLock::new(VecDeque::new()),
            max_events: 1000,
            anomalies: RwLock::new(Vec::new()),
            stats: RwLock::new(DiagnosticStats::default()),
            state_history: RwLock::new(VecDeque::new()),
        }
    }

    /// Émet un événement
    pub async fn emit(&self, event_type: EnergyEventType, message: &str) {
        self.emit_full(event_type, message, DiagnosticSeverity::Info, None, None).await;
    }

    /// Émet un événement complet
    pub async fn emit_full(
        &self,
        event_type: EnergyEventType,
        message: &str,
        severity: DiagnosticSeverity,
        dimension: Option<EnergyDimension>,
        value: Option<f32>,
    ) {
        let event = EnergyDiagnosticEvent {
            timestamp: Self::now(),
            event_type,
            severity,
            message: message.to_string(),
            dimension,
            value,
            metadata: None,
        };

        let mut events = self.events.write().await;
        events.push_back(event);

        while events.len() > self.max_events {
            events.pop_front();
        }

        // Mettre à jour les stats
        let mut stats = self.stats.write().await;
        stats.total_events += 1;

        match severity {
            DiagnosticSeverity::Error | DiagnosticSeverity::Critical => {
                stats.error_count += 1;
            }
            DiagnosticSeverity::Warning => {
                stats.warning_count += 1;
            }
            _ => {}
        }
    }

    /// Émet une erreur
    pub async fn emit_error(&self, message: &str) {
        self.emit_full(
            EnergyEventType::AnomalyDetected,
            message,
            DiagnosticSeverity::Error,
            None,
            None,
        ).await;
    }

    /// Émet un avertissement
    pub async fn emit_warning(&self, message: &str) {
        self.emit_full(
            EnergyEventType::AnomalyDetected,
            message,
            DiagnosticSeverity::Warning,
            None,
            None,
        ).await;
    }

    /// Enregistre un snapshot d'état pour l'analyse
    pub async fn record_state(&self, state: &EnergyState) {
        let snapshot = StateSnapshot {
            timestamp: Self::now(),
            global_energy: state.global_energy,
            fatigue: state.fatigue_level,
        };

        let mut history = self.state_history.write().await;
        history.push_back(snapshot);

        while history.len() > 200 {
            history.pop_front();
        }
    }

    /// Détecte les anomalies
    pub async fn detect_anomalies(&self, state: &EnergyState) -> Vec<Anomaly> {
        let mut detected = Vec::new();
        let history = self.state_history.read().await;

        if history.len() < 5 {
            return detected;
        }

        // Chute rapide
        let recent: Vec<_> = history.iter().rev().take(5).collect();
        if recent.len() >= 2 {
            let first = recent.last().unwrap();
            let last = recent.first().unwrap();

            let drop = first.global_energy - last.global_energy;
            if drop > 0.2 {
                detected.push(Anomaly {
                    anomaly_type: AnomalyType::RapidDrop,
                    dimension: None,
                    description: format!("Global energy dropped by {:.1}% in short time", drop * 100.0),
                    severity: drop.min(1.0),
                    detected_at: Self::now(),
                });
            }
        }

        // Fatigue élevée persistante
        let high_fatigue_count = recent.iter()
            .filter(|s| s.fatigue > 0.7)
            .count();

        if high_fatigue_count >= 4 {
            detected.push(Anomaly {
                anomaly_type: AnomalyType::SlowRecovery,
                dimension: None,
                description: "Persistently high fatigue level".to_string(),
                severity: 0.7,
                detected_at: Self::now(),
            });
        }

        // Déséquilibre entre dimensions
        let dim_values: Vec<f32> = state.dimensions.values()
            .map(|l| l.current)
            .collect();

        if dim_values.len() >= 2 {
            let max_val = dim_values.iter().cloned().fold(f32::MIN, f32::max);
            let min_val = dim_values.iter().cloned().fold(f32::MAX, f32::min);

            if max_val - min_val > 0.4 {
                detected.push(Anomaly {
                    anomaly_type: AnomalyType::PersistentImbalance,
                    dimension: None,
                    description: format!("Large imbalance between dimensions ({:.1}%)", (max_val - min_val) * 100.0),
                    severity: (max_val - min_val).min(1.0),
                    detected_at: Self::now(),
                });
            }
        }

        // Stocker les anomalies
        if !detected.is_empty() {
            let mut anomalies = self.anomalies.write().await;
            anomalies.extend(detected.clone());

            // Limiter
            while anomalies.len() > 100 {
                anomalies.remove(0);
            }
        }

        detected
    }

    /// Génère un rapport de diagnostic
    pub async fn generate_report(&self, state: &EnergyState) -> EnergyDiagnosticReport {
        let events = self.events.read().await;
        let anomalies = self.anomalies.read().await;
        let stats = self.stats.read().await;

        // Compter par type
        let by_type: std::collections::HashMap<String, usize> = events.iter()
            .fold(std::collections::HashMap::new(), |mut acc, e| {
                *acc.entry(format!("{:?}", e.event_type)).or_insert(0) += 1;
                acc
            });

        // Compter par sévérité
        let by_severity: std::collections::HashMap<String, usize> = events.iter()
            .fold(std::collections::HashMap::new(), |mut acc, e| {
                *acc.entry(format!("{:?}", e.severity)).or_insert(0) += 1;
                acc
            });

        // Événements critiques récents
        let critical: Vec<_> = events.iter()
            .filter(|e| e.severity == DiagnosticSeverity::Critical || e.severity == DiagnosticSeverity::Error)
            .rev()
            .take(10)
            .cloned()
            .collect();

        // Santé par dimension
        let dimension_health: std::collections::HashMap<EnergyDimension, f32> = state.dimensions
            .iter()
            .map(|(k, v)| (*k, v.current))
            .collect();

        // Santé globale
        let overall_health = self.calculate_health(state, &stats);

        // Recommandations
        let recommendations = self.generate_recommendations(state, &anomalies);

        EnergyDiagnosticReport {
            timestamp: Self::now(),
            overall_health,
            total_events: events.len(),
            events_by_type: by_type,
            events_by_severity: by_severity,
            critical_events: critical,
            dimension_health,
            recommendations,
            anomalies: anomalies.clone(),
        }
    }

    /// Calcule la santé globale
    fn calculate_health(&self, state: &EnergyState, stats: &DiagnosticStats) -> f32 {
        let energy_factor = state.global_energy;
        let fatigue_factor = 1.0 - state.fatigue_level;

        let error_penalty = if stats.total_events > 0 {
            (stats.error_count as f32 / stats.total_events as f32).min(0.3)
        } else {
            0.0
        };

        (energy_factor * 0.4 + fatigue_factor * 0.4 + (1.0 - error_penalty) * 0.2).clamp(0.0, 1.0)
    }

    /// Génère des recommandations
    fn generate_recommendations(&self, state: &EnergyState, anomalies: &[Anomaly]) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Basé sur l'énergie
        if state.global_energy < 0.3 {
            recommendations.push("Niveau d'énergie bas - envisager une récupération".to_string());
        }

        // Basé sur la fatigue
        if state.fatigue_level > 0.7 {
            recommendations.push("Fatigue élevée - pause recommandée".to_string());
        }

        // Basé sur les anomalies
        for anomaly in anomalies.iter().rev().take(3) {
            match anomaly.anomaly_type {
                AnomalyType::RapidDrop => {
                    recommendations.push("Chute rapide détectée - vérifier les causes".to_string());
                }
                AnomalyType::SlowRecovery => {
                    recommendations.push("Récupération lente - optimiser les périodes de repos".to_string());
                }
                AnomalyType::PersistentImbalance => {
                    recommendations.push("Déséquilibre - diversifier les activités".to_string());
                }
                _ => {}
            }
        }

        recommendations
    }

    /// Événements récents
    pub async fn recent_events(&self, count: usize) -> Vec<EnergyDiagnosticEvent> {
        let events = self.events.read().await;
        events.iter().rev().take(count).cloned().collect()
    }

    /// Événements par type
    pub async fn events_by_type(&self, event_type: EnergyEventType) -> Vec<EnergyDiagnosticEvent> {
        let events = self.events.read().await;
        events.iter()
            .filter(|e| e.event_type == event_type)
            .cloned()
            .collect()
    }

    /// Statistiques
    pub async fn stats(&self) -> DiagnosticStats {
        self.stats.read().await.clone()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for EnergyDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques de diagnostic
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct DiagnosticStats {
    pub total_events: u64,
    pub error_count: u64,
    pub warning_count: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics() {
        let diag = EnergyDiagnostics::new();

        diag.emit(EnergyEventType::TickCompleted, "Test tick").await;
        diag.emit_error("Test error").await;

        let stats = diag.stats().await;
        assert_eq!(stats.total_events, 2);
        assert_eq!(stats.error_count, 1);
    }

    #[tokio::test]
    async fn test_recent_events() {
        let diag = EnergyDiagnostics::new();

        for i in 0..5 {
            diag.emit(EnergyEventType::TickCompleted, &format!("Tick {}", i)).await;
        }

        let recent = diag.recent_events(3).await;
        assert_eq!(recent.len(), 3);
    }
}
