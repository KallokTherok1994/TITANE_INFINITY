//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SELF-HEAL ENGINE
//! Moteur d'auto-réparation
//! ═══════════════════════════════════════════════════════════════════════════════

use super::repair_actions::RepairAction;
use super::system_health::SystemHealth;

/// Configuration du self-healing
#[derive(Clone, Debug)]
pub struct SelfHealConfig {
    /// Seuil d'anomalie pour déclencher des actions
    pub anomaly_threshold: f32,
    /// Seuil mémoire critique
    pub memory_critical_threshold: f32,
    /// Seuil d'erreur critique
    pub error_rate_threshold: f32,
    /// Latence moteur maximale (ms)
    pub max_engine_latency_ms: u64,
    /// Intégrité minimale
    pub min_integrity: f32,
    /// Activer le mode agressif
    pub aggressive_mode: bool,
}

impl Default for SelfHealConfig {
    fn default() -> Self {
        Self {
            anomaly_threshold: 0.6,
            memory_critical_threshold: 0.85,
            error_rate_threshold: 0.08,
            max_engine_latency_ms: 150,
            min_integrity: 0.9,
            aggressive_mode: false,
        }
    }
}

/// Moteur d'auto-réparation
pub struct SelfHealEngine {
    config: SelfHealConfig,
    /// Nombre d'actions exécutées
    actions_count: std::sync::atomic::AtomicU32,
}

impl SelfHealEngine {
    /// Crée un nouveau moteur
    pub fn new() -> Self {
        Self {
            config: SelfHealConfig::default(),
            actions_count: std::sync::atomic::AtomicU32::new(0),
        }
    }

    /// Crée avec configuration personnalisée
    pub fn with_config(config: SelfHealConfig) -> Self {
        Self {
            config,
            actions_count: std::sync::atomic::AtomicU32::new(0),
        }
    }

    /// Détermine les actions de réparation nécessaires
    pub async fn determine_actions(&self, health: &SystemHealth) -> Vec<RepairAction> {
        let mut actions = Vec::new();

        // Anomalie critique → actions majeures
        if health.anomaly_score > 0.8 {
            actions.push(RepairAction::RestartOmega);
            actions.push(RepairAction::ClearMemoryCache);
        } else if health.anomaly_score > self.config.anomaly_threshold {
            actions.push(RepairAction::RebalanceEngines);
        }

        // Latences moteurs élevées
        let slow_engines: Vec<_> = health
            .engine_latencies
            .iter()
            .filter(|(_, &l)| l > self.config.max_engine_latency_ms)
            .collect();

        if slow_engines.len() > 2 {
            actions.push(RepairAction::RebalanceEngines);
        }

        // Mémoire critique
        if health.memory_usage > self.config.memory_critical_threshold {
            actions.push(RepairAction::TrimMemory);
            actions.push(RepairAction::ForceGC);
        } else if health.memory_usage > 0.7 {
            actions.push(RepairAction::TrimMemory);
        }

        // Taux d'erreur élevé
        if health.error_rate > self.config.error_rate_threshold {
            actions.push(RepairAction::ResetConversationContext);
            if self.config.aggressive_mode {
                actions.push(RepairAction::EnableDegradedMode);
            }
        }

        // Intégrité faible
        if health.integrity < self.config.min_integrity {
            actions.push(RepairAction::RebuildIndexes);
        }

        // Cache inefficace
        if health.cache_hit_rate < 0.4 {
            actions.push(RepairAction::ClearMemoryCache);
        }

        // Mode agressif : ajouter logging si problèmes détectés
        if self.config.aggressive_mode && !actions.is_empty() {
            actions.push(RepairAction::EnableDetailedLogging);
        }

        // Dédupliquer et trier par priorité
        actions.sort_by(|a, b| b.priority().cmp(&a.priority()));
        actions.dedup();

        // Enregistrer le nombre d'actions
        self.actions_count.fetch_add(
            actions.len() as u32,
            std::sync::atomic::Ordering::Relaxed,
        );

        actions
    }

    /// Retourne le nombre total d'actions exécutées
    pub fn total_actions(&self) -> u32 {
        self.actions_count.load(std::sync::atomic::Ordering::Relaxed)
    }

    /// Active le mode agressif
    pub fn set_aggressive(&mut self, aggressive: bool) {
        self.config.aggressive_mode = aggressive;
    }
}

impl Default for SelfHealEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_healthy_no_actions() {
        let engine = SelfHealEngine::new();
        let health = SystemHealth::healthy();
        let actions = engine.determine_actions(&health).await;
        assert!(actions.is_empty());
    }

    #[tokio::test]
    async fn test_critical_anomaly() {
        let engine = SelfHealEngine::new();
        let mut health = SystemHealth::healthy();
        health.anomaly_score = 0.9;

        let actions = engine.determine_actions(&health).await;
        assert!(actions.contains(&RepairAction::RestartOmega));
    }

    #[tokio::test]
    async fn test_memory_critical() {
        let engine = SelfHealEngine::new();
        let mut health = SystemHealth::healthy();
        health.memory_usage = 0.9;

        let actions = engine.determine_actions(&health).await;
        assert!(actions.contains(&RepairAction::TrimMemory));
    }

    #[tokio::test]
    async fn test_aggressive_mode() {
        let mut engine = SelfHealEngine::new();
        engine.set_aggressive(true);

        let mut health = SystemHealth::healthy();
        health.error_rate = 0.1;

        let actions = engine.determine_actions(&health).await;
        assert!(actions.contains(&RepairAction::EnableDetailedLogging));
    }
}
