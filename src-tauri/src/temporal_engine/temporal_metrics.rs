//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL METRICS
//! Super Prompt #18 — Métriques et santé temporelle
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

/// Santé du système temporel
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct TemporalHealth {
    pub overall_score: f32,
    pub tick_health: f32,
    pub memory_health: f32,
    pub routine_health: f32,
    pub planner_health: f32,
    pub anticipator_health: f32,
    pub alignment_health: f32,
    pub last_tick_duration_ms: u64,
    pub average_tick_duration_ms: f64,
    pub ticks_per_minute: f32,
    pub issues: Vec<HealthIssue>,
}

/// Problème de santé
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealthIssue {
    pub component: String,
    pub severity: IssueSeverity,
    pub description: String,
    pub detected_at: u64,
}

/// Sévérité du problème
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum IssueSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// Métriques temporelles
pub struct TemporalMetrics {
    state: RwLock<MetricsState>,
}

#[derive(Default)]
struct MetricsState {
    tick_durations: Vec<u64>,
    ticks_total: u64,
    ticks_last_minute: u32,
    last_minute_timestamp: u64,
    errors: Vec<MetricError>,
    component_health: std::collections::HashMap<String, f32>,
}

#[derive(Clone, Debug)]
struct MetricError {
    component: String,
    message: String,
    timestamp: u64,
}

impl TemporalMetrics {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(MetricsState::default()),
        }
    }

    /// Enregistre un tick
    pub async fn record_tick(&self, duration_ms: u64) {
        let mut state = self.state.write().await;
        let now = Self::now();

        // Ajouter la durée
        state.tick_durations.push(duration_ms);
        state.ticks_total += 1;

        // Limiter l'historique
        if state.tick_durations.len() > 1000 {
            state.tick_durations.remove(0);
        }

        // Compter les ticks par minute
        if now - state.last_minute_timestamp > 60000 {
            state.ticks_last_minute = 1;
            state.last_minute_timestamp = now;
        } else {
            state.ticks_last_minute += 1;
        }
    }

    /// Enregistre une erreur
    pub async fn record_error(&self, component: &str, message: &str) {
        let mut state = self.state.write().await;
        state.errors.push(MetricError {
            component: component.to_string(),
            message: message.to_string(),
            timestamp: Self::now(),
        });

        // Limiter les erreurs stockées
        if state.errors.len() > 100 {
            state.errors.remove(0);
        }
    }

    /// Met à jour la santé d'un composant
    pub async fn update_component_health(&self, component: &str, health: f32) {
        let mut state = self.state.write().await;
        state.component_health.insert(component.to_string(), health.clamp(0.0, 1.0));
    }

    /// Calcule la santé globale
    pub async fn health(&self) -> TemporalHealth {
        let state = self.state.read().await;

        // Calcul de la santé des ticks
        let tick_health = self.calculate_tick_health(&state);

        // Récupérer la santé des composants
        let memory_health = *state.component_health.get("memory").unwrap_or(&0.8);
        let routine_health = *state.component_health.get("routines").unwrap_or(&0.8);
        let planner_health = *state.component_health.get("planner").unwrap_or(&0.8);
        let anticipator_health = *state.component_health.get("anticipator").unwrap_or(&0.8);
        let alignment_health = *state.component_health.get("alignment").unwrap_or(&0.8);

        // Score global
        let overall = (tick_health * 0.2)
            + (memory_health * 0.15)
            + (routine_health * 0.15)
            + (planner_health * 0.2)
            + (anticipator_health * 0.15)
            + (alignment_health * 0.15);

        // Détecter les problèmes
        let mut issues = Vec::new();

        if tick_health < 0.5 {
            issues.push(HealthIssue {
                component: "ticks".to_string(),
                severity: if tick_health < 0.3 { IssueSeverity::Error } else { IssueSeverity::Warning },
                description: "Tick performance degraded".to_string(),
                detected_at: Self::now(),
            });
        }

        // Ajouter les erreurs récentes comme issues
        let recent_errors: Vec<_> = state.errors.iter()
            .filter(|e| Self::now() - e.timestamp < 300000) // 5 minutes
            .collect();

        for error in recent_errors {
            issues.push(HealthIssue {
                component: error.component.clone(),
                severity: IssueSeverity::Error,
                description: error.message.clone(),
                detected_at: error.timestamp,
            });
        }

        let last_tick_duration = *state.tick_durations.last().unwrap_or(&0);
        let average_tick = if state.tick_durations.is_empty() {
            0.0
        } else {
            state.tick_durations.iter().sum::<u64>() as f64 / state.tick_durations.len() as f64
        };

        TemporalHealth {
            overall_score: overall,
            tick_health,
            memory_health,
            routine_health,
            planner_health,
            anticipator_health,
            alignment_health,
            last_tick_duration_ms: last_tick_duration,
            average_tick_duration_ms: average_tick,
            ticks_per_minute: state.ticks_last_minute as f32,
            issues,
        }
    }

    fn calculate_tick_health(&self, state: &MetricsState) -> f32 {
        if state.tick_durations.is_empty() {
            return 1.0;
        }

        let average: f64 = state.tick_durations.iter().sum::<u64>() as f64 / state.tick_durations.len() as f64;

        // Seuils de performance (en ms)
        let excellent = 10.0;
        let good = 50.0;
        let acceptable = 100.0;

        if average <= excellent {
            1.0
        } else if average <= good {
            0.9 - ((average - excellent) / (good - excellent) * 0.1) as f32
        } else if average <= acceptable {
            0.7 - ((average - good) / (acceptable - good) * 0.3) as f32
        } else {
            (0.4 - (average - acceptable) as f32 / 500.0).max(0.1)
        }
    }

    /// Statistiques détaillées
    pub async fn detailed_stats(&self) -> DetailedStats {
        let state = self.state.read().await;

        let tick_durations = &state.tick_durations;

        let min = *tick_durations.iter().min().unwrap_or(&0);
        let max = *tick_durations.iter().max().unwrap_or(&0);
        let avg = if tick_durations.is_empty() {
            0.0
        } else {
            tick_durations.iter().sum::<u64>() as f64 / tick_durations.len() as f64
        };

        // Calculer le percentile 95
        let mut sorted = tick_durations.clone();
        sorted.sort();
        let p95_idx = (sorted.len() as f64 * 0.95) as usize;
        let p95 = sorted.get(p95_idx).copied().unwrap_or(0);

        DetailedStats {
            total_ticks: state.ticks_total,
            min_tick_duration_ms: min,
            max_tick_duration_ms: max,
            avg_tick_duration_ms: avg,
            p95_tick_duration_ms: p95,
            recent_errors_count: state.errors.len(),
            components_tracked: state.component_health.len(),
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for TemporalMetrics {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques détaillées
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct DetailedStats {
    pub total_ticks: u64,
    pub min_tick_duration_ms: u64,
    pub max_tick_duration_ms: u64,
    pub avg_tick_duration_ms: f64,
    pub p95_tick_duration_ms: u64,
    pub recent_errors_count: usize,
    pub components_tracked: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_metrics() {
        let metrics = TemporalMetrics::new();
        metrics.record_tick(10).await;
        metrics.record_tick(15).await;
        metrics.record_tick(12).await;

        let health = metrics.health().await;
        assert!(health.tick_health > 0.9);
    }

    #[tokio::test]
    async fn test_component_health() {
        let metrics = TemporalMetrics::new();
        metrics.update_component_health("memory", 0.95).await;

        let health = metrics.health().await;
        assert_eq!(health.memory_health, 0.95);
    }
}
