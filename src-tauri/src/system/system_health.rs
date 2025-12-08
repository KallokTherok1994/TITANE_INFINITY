//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SYSTEM HEALTH MODEL
//! Représentation de l'état vital du système
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{AnomalyDetector, MetricsCollector, RepairAction, SecurityEngine, SelfHealEngine};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// État de santé global du système
#[derive(Clone, Debug, Serialize, Deserialize, Default)]
pub struct SystemHealth {
    /// Charge CPU (0.0 - 1.0)
    pub cpu_load: f32,
    /// Utilisation mémoire (0.0 - 1.0)
    pub memory_usage: f32,
    /// Allocation heap en bytes
    pub heap_alloc: u64,
    /// Latences par moteur (nom -> ms)
    pub engine_latencies: HashMap<String, u64>,
    /// Latence totale OMEGA (ms)
    pub omega_latency: u64,
    /// Taux de hit cache (0.0 - 1.0)
    pub cache_hit_rate: f32,
    /// Taux d'erreur (0.0 - 1.0)
    pub error_rate: f32,
    /// Score d'anomalie calculé (0.0 - 1.0)
    pub anomaly_score: f32,
    /// Score d'intégrité (0.0 - 1.0)
    pub integrity: f32,
    /// Timestamp de la dernière mise à jour
    pub last_update: u64,
}

impl SystemHealth {
    /// Crée un état de santé avec valeurs par défaut saines
    pub fn healthy() -> Self {
        Self {
            cpu_load: 0.2,
            memory_usage: 0.3,
            heap_alloc: 100_000_000,
            engine_latencies: HashMap::new(),
            omega_latency: 50,
            cache_hit_rate: 0.8,
            error_rate: 0.0,
            anomaly_score: 0.0,
            integrity: 1.0,
            last_update: Self::now(),
        }
    }

    /// Retourne le timestamp actuel en ms
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }

    /// Vérifie si le système est en état critique
    pub fn is_critical(&self) -> bool {
        self.anomaly_score > 0.7 || self.error_rate > 0.1 || self.integrity < 0.8
    }

    /// Vérifie si le système est dégradé
    pub fn is_degraded(&self) -> bool {
        self.anomaly_score > 0.4 || self.error_rate > 0.05 || self.memory_usage > 0.75
    }

    /// Retourne un résumé textuel
    pub fn summary(&self) -> String {
        let status = if self.is_critical() {
            "CRITICAL"
        } else if self.is_degraded() {
            "DEGRADED"
        } else {
            "HEALTHY"
        };

        format!(
            "[{}] CPU: {:.0}%, RAM: {:.0}%, Anomaly: {:.2}, Errors: {:.1}%",
            status,
            self.cpu_load * 100.0,
            self.memory_usage * 100.0,
            self.anomaly_score,
            self.error_rate * 100.0
        )
    }
}

/// Moteur de santé système unifié
pub struct SystemHealthEngine {
    metrics: Arc<MetricsCollector>,
    anomaly: AnomalyDetector,
    healing: SelfHealEngine,
    security: SecurityEngine,
    health: Arc<RwLock<SystemHealth>>,
}

impl SystemHealthEngine {
    /// Crée un nouveau moteur de santé
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(MetricsCollector::new()),
            anomaly: AnomalyDetector::new(),
            healing: SelfHealEngine::new(),
            security: SecurityEngine::new(),
            health: Arc::new(RwLock::new(SystemHealth::healthy())),
        }
    }

    /// Évalue la santé et retourne les actions de réparation nécessaires
    pub async fn evaluate(&self) -> Result<Vec<RepairAction>, String> {
        let health = self.health.read().await.clone();

        // Validation sécurité
        self.security.validate_system_state(&health)?;

        // Calcul du score d'anomalie
        let score = self.anomaly.compute_score(&health);

        // Mise à jour du score
        {
            let mut h = self.health.write().await;
            h.anomaly_score = score;
        }

        // Déterminer les actions de réparation
        let actions = self.healing.determine_actions(&health).await;

        Ok(actions)
    }

    /// Met à jour les métriques
    pub async fn update_metrics(&self, health: SystemHealth) {
        *self.health.write().await = health;
        self.metrics.record(health.clone()).await;
    }

    /// Enregistre une latence moteur
    pub async fn record_engine_latency(&self, engine_id: &str, latency_ms: u64) {
        let mut health = self.health.write().await;
        health.engine_latencies.insert(engine_id.to_string(), latency_ms);
    }

    /// Enregistre une erreur
    pub async fn record_error(&self) {
        let mut health = self.health.write().await;
        health.error_rate = (health.error_rate + 0.01).min(1.0);
    }

    /// Décrémente le taux d'erreur (récupération)
    pub async fn decay_errors(&self) {
        let mut health = self.health.write().await;
        health.error_rate = (health.error_rate * 0.95).max(0.0);
    }

    /// Retourne l'état de santé actuel
    pub async fn get_health(&self) -> SystemHealth {
        self.health.read().await.clone()
    }

    /// Vérifie si une action est nécessaire
    pub async fn needs_action(&self) -> bool {
        let health = self.health.read().await;
        health.is_critical() || health.is_degraded()
    }
}

impl Default for SystemHealthEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_healthy_state() {
        let health = SystemHealth::healthy();
        assert!(!health.is_critical());
        assert!(!health.is_degraded());
    }

    #[test]
    fn test_critical_detection() {
        let mut health = SystemHealth::healthy();
        health.anomaly_score = 0.8;
        assert!(health.is_critical());
    }

    #[test]
    fn test_degraded_detection() {
        let mut health = SystemHealth::healthy();
        health.memory_usage = 0.8;
        assert!(health.is_degraded());
    }

    #[tokio::test]
    async fn test_engine_creation() {
        let engine = SystemHealthEngine::new();
        let health = engine.get_health().await;
        assert!(!health.is_critical());
    }
}
