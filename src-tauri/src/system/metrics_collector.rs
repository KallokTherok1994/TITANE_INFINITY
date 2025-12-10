//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — METRICS COLLECTOR
//! Collecte automatique des métriques système
//! ═══════════════════════════════════════════════════════════════════════════════

use super::system_health::SystemHealth;
use std::collections::VecDeque;
use std::sync::atomic::{AtomicU64, Ordering};
use tokio::sync::RwLock;

/// Taille maximale de l'historique
const MAX_HISTORY: usize = 100;

/// Collecteur de métriques
pub struct MetricsCollector {
    /// Historique des snapshots
    history: RwLock<VecDeque<SystemHealth>>,
    /// Compteur de requêtes totales
    total_requests: AtomicU64,
    /// Compteur d'erreurs totales
    total_errors: AtomicU64,
    /// Latence OMEGA cumulée
    cumulative_latency: AtomicU64,
}

impl MetricsCollector {
    /// Crée un nouveau collecteur
    pub fn new() -> Self {
        Self {
            history: RwLock::new(VecDeque::with_capacity(MAX_HISTORY)),
            total_requests: AtomicU64::new(0),
            total_errors: AtomicU64::new(0),
            cumulative_latency: AtomicU64::new(0),
        }
    }

    /// Enregistre un snapshot de santé
    pub async fn record(&self, health: SystemHealth) {
        let mut history = self.history.write().await;
        if history.len() >= MAX_HISTORY {
            history.pop_front();
        }
        history.push_back(health);
    }

    /// Incrémente le compteur de requêtes
    pub fn increment_requests(&self) {
        self.total_requests.fetch_add(1, Ordering::Relaxed);
    }

    /// Incrémente le compteur d'erreurs
    pub fn increment_errors(&self) {
        self.total_errors.fetch_add(1, Ordering::Relaxed);
    }

    /// Ajoute une latence au cumul
    pub fn add_latency(&self, latency_ms: u64) {
        self.cumulative_latency
            .fetch_add(latency_ms, Ordering::Relaxed);
    }

    /// Retourne la latence moyenne
    pub fn average_latency(&self) -> u64 {
        let total = self.total_requests.load(Ordering::Relaxed);
        if total == 0 {
            return 0;
        }
        self.cumulative_latency.load(Ordering::Relaxed) / total
    }

    /// Retourne le taux d'erreur global
    pub fn error_rate(&self) -> f32 {
        let total = self.total_requests.load(Ordering::Relaxed);
        if total == 0 {
            return 0.0;
        }
        self.total_errors.load(Ordering::Relaxed) as f32 / total as f32
    }

    /// Retourne les N derniers snapshots
    pub async fn recent(&self, count: usize) -> Vec<SystemHealth> {
        let history = self.history.read().await;
        history.iter().rev().take(count).cloned().collect()
    }

    /// Retourne la tendance (positive = amélioration, négative = dégradation)
    pub async fn trend(&self) -> f32 {
        let history = self.history.read().await;
        if history.len() < 2 {
            return 0.0;
        }

        let recent: Vec<_> = history.iter().rev().take(10).collect();
        if recent.len() < 2 {
            return 0.0;
        }

        // Comparer score d'anomalie récent vs ancien
        let recent_avg = recent.iter().take(5).map(|h| h.anomaly_score).sum::<f32>() / 5.0;
        let older_avg = recent.iter().skip(5).map(|h| h.anomaly_score).sum::<f32>()
            / (recent.len() - 5).max(1) as f32;

        older_avg - recent_avg // Positif = amélioration
    }

    /// Statistiques globales
    pub fn stats(&self) -> MetricsStats {
        MetricsStats {
            total_requests: self.total_requests.load(Ordering::Relaxed),
            total_errors: self.total_errors.load(Ordering::Relaxed),
            average_latency_ms: self.average_latency(),
            error_rate: self.error_rate(),
        }
    }

    /// Réinitialise les compteurs
    pub fn reset(&self) {
        self.total_requests.store(0, Ordering::Relaxed);
        self.total_errors.store(0, Ordering::Relaxed);
        self.cumulative_latency.store(0, Ordering::Relaxed);
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques agrégées
#[derive(Clone, Debug)]
pub struct MetricsStats {
    pub total_requests: u64,
    pub total_errors: u64,
    pub average_latency_ms: u64,
    pub error_rate: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_record_and_recent() {
        let collector = MetricsCollector::new();

        for i in 0..5 {
            let mut health = SystemHealth::healthy();
            health.omega_latency = i * 10;
            collector.record(health).await;
        }

        let recent = collector.recent(3).await;
        assert_eq!(recent.len(), 3);
    }

    #[test]
    fn test_increment_counters() {
        let collector = MetricsCollector::new();

        collector.increment_requests();
        collector.increment_requests();
        collector.increment_errors();

        let stats = collector.stats();
        assert_eq!(stats.total_requests, 2);
        assert_eq!(stats.total_errors, 1);
        assert_eq!(stats.error_rate, 0.5);
    }

    #[test]
    fn test_average_latency() {
        let collector = MetricsCollector::new();

        collector.increment_requests();
        collector.add_latency(100);
        collector.increment_requests();
        collector.add_latency(200);

        assert_eq!(collector.average_latency(), 150);
    }
}
