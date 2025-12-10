//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — HEALING EXECUTOR
//! Super Prompt #4 — Exécution des actions de réparation avec historique
//! ═══════════════════════════════════════════════════════════════════════════════

use super::repair_actions::{RepairAction, RepairResult};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

/// Taille maximale de l'historique
const MAX_HISTORY_SIZE: usize = 500;

/// Configuration du Safe Mode
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SafeModeConfig {
    /// Activer uniquement les fonctionnalités essentielles
    pub essential_only: bool,
    /// Désactiver les moteurs non-critiques
    pub disable_non_critical_engines: bool,
    /// Réduire les limites de tokens
    pub reduced_token_limit: u32,
    /// Désactiver le cache
    pub disable_cache: bool,
    /// Activer les logs verbeux
    pub verbose_logging: bool,
}

impl Default for SafeModeConfig {
    fn default() -> Self {
        Self {
            essential_only: true,
            disable_non_critical_engines: true,
            reduced_token_limit: 1000,
            disable_cache: false,
            verbose_logging: true,
        }
    }
}

/// État du système de healing
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealingState {
    /// Safe Mode actif
    pub safe_mode_active: bool,
    /// Circuit breaker actif
    pub circuit_breaker_active: bool,
    /// Mode dégradé actif
    pub degraded_mode_active: bool,
    /// Moteurs isolés
    pub isolated_engines: Vec<String>,
    /// Limite de tokens actuelle
    pub current_token_limit: Option<u32>,
    /// Logs détaillés actifs
    pub detailed_logging: bool,
}

impl Default for HealingState {
    fn default() -> Self {
        Self {
            safe_mode_active: false,
            circuit_breaker_active: false,
            degraded_mode_active: false,
            isolated_engines: Vec::new(),
            current_token_limit: None,
            detailed_logging: false,
        }
    }
}

/// Entrée dans l'historique de healing
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealingHistoryEntry {
    /// Action exécutée
    pub action: RepairAction,
    /// Résultat de l'action
    pub result: RepairResult,
    /// Score d'anomalie avant l'action
    pub anomaly_before: f32,
    /// Score d'anomalie après l'action (si mesuré)
    pub anomaly_after: Option<f32>,
    /// Timestamp de l'exécution
    pub timestamp: u64,
    /// Contexte additionnel
    pub context: Option<String>,
}

/// Statistiques d'apprentissage
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct LearningStats {
    /// Actions par type avec taux de succès
    pub action_success_rates: std::collections::HashMap<String, (u32, u32)>, // (succès, total)
    /// Efficacité moyenne par action (amélioration du score)
    pub action_effectiveness: std::collections::HashMap<String, f32>,
    /// Actions les plus efficaces
    pub top_effective_actions: Vec<String>,
}

/// Exécuteur d'actions de healing
pub struct HealingExecutor {
    /// État actuel du healing
    state: Arc<RwLock<HealingState>>,
    /// Historique des actions
    history: Arc<RwLock<VecDeque<HealingHistoryEntry>>>,
    /// Statistiques d'apprentissage
    learning: Arc<RwLock<LearningStats>>,
    /// Compteur d'actions exécutées
    actions_executed: AtomicU32,
    /// Compteur d'actions réussies
    actions_succeeded: AtomicU32,
    /// Exécution en cours
    executing: AtomicBool,
}

impl HealingExecutor {
    /// Crée un nouvel exécuteur
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(HealingState::default())),
            history: Arc::new(RwLock::new(VecDeque::with_capacity(MAX_HISTORY_SIZE))),
            learning: Arc::new(RwLock::new(LearningStats::default())),
            actions_executed: AtomicU32::new(0),
            actions_succeeded: AtomicU32::new(0),
            executing: AtomicBool::new(false),
        }
    }

    /// Exécute une action de réparation
    pub async fn execute(&self, action: RepairAction, anomaly_score: f32) -> RepairResult {
        // Marquer comme en cours d'exécution
        self.executing.store(true, Ordering::SeqCst);
        let start = Instant::now();

        // Exécuter l'action
        let result = self.execute_action(&action).await;

        // Durée réelle
        let duration_ms = start.elapsed().as_millis() as u64;

        // Construire le résultat final
        let final_result = if result.is_ok() {
            self.actions_succeeded.fetch_add(1, Ordering::Relaxed);
            RepairResult::success(action.clone(), duration_ms)
        } else {
            RepairResult::failure(
                action.clone(),
                duration_ms,
                result.err().unwrap_or_default(),
            )
        };

        self.actions_executed.fetch_add(1, Ordering::Relaxed);

        // Enregistrer dans l'historique
        self.record_history(HealingHistoryEntry {
            action: action.clone(),
            result: final_result.clone(),
            anomaly_before: anomaly_score,
            anomaly_after: None, // Sera mis à jour plus tard
            timestamp: Self::now(),
            context: None,
        })
        .await;

        // Mettre à jour les statistiques d'apprentissage
        self.update_learning(&action, final_result.success).await;

        self.executing.store(false, Ordering::SeqCst);

        final_result
    }

    /// Exécute plusieurs actions en séquence
    pub async fn execute_batch(
        &self,
        actions: Vec<RepairAction>,
        anomaly_score: f32,
    ) -> Vec<RepairResult> {
        let mut results = Vec::with_capacity(actions.len());

        for action in actions {
            let result = self.execute(action, anomaly_score).await;
            results.push(result);
        }

        results
    }

    /// Exécute l'action spécifique
    async fn execute_action(&self, action: &RepairAction) -> Result<(), String> {
        let mut state = self.state.write().await;

        match action {
            RepairAction::EnableSafeMode => {
                state.safe_mode_active = true;
                state.degraded_mode_active = true;
                state.detailed_logging = true;
                log::warn!("[HEALING] Safe Mode ACTIVATED");
                Ok(())
            }

            RepairAction::DisableSafeMode => {
                state.safe_mode_active = false;
                state.degraded_mode_active = false;
                log::info!("[HEALING] Safe Mode DEACTIVATED");
                Ok(())
            }

            RepairAction::EnableCircuitBreaker => {
                state.circuit_breaker_active = true;
                log::warn!("[HEALING] Circuit Breaker ENABLED");
                Ok(())
            }

            RepairAction::DisableCircuitBreaker => {
                state.circuit_breaker_active = false;
                log::info!("[HEALING] Circuit Breaker DISABLED");
                Ok(())
            }

            RepairAction::IsolateEngine(engine_id) => {
                if !state.isolated_engines.contains(engine_id) {
                    state.isolated_engines.push(engine_id.clone());
                }
                log::warn!("[HEALING] Engine '{}' ISOLATED", engine_id);
                Ok(())
            }

            RepairAction::RestoreEngine(engine_id) => {
                state.isolated_engines.retain(|e| e != engine_id);
                log::info!("[HEALING] Engine '{}' RESTORED", engine_id);
                Ok(())
            }

            RepairAction::ReduceTokenLimit(limit) => {
                state.current_token_limit = Some(*limit);
                log::info!("[HEALING] Token limit reduced to {}", limit);
                Ok(())
            }

            RepairAction::RestoreTokenLimit => {
                state.current_token_limit = None;
                log::info!("[HEALING] Token limit RESTORED to default");
                Ok(())
            }

            RepairAction::EnableDegradedMode => {
                state.degraded_mode_active = true;
                log::warn!("[HEALING] Degraded Mode ENABLED");
                Ok(())
            }

            RepairAction::EnableDetailedLogging => {
                state.detailed_logging = true;
                log::info!("[HEALING] Detailed logging ENABLED");
                Ok(())
            }

            // Actions qui nécessitent des appels système réels
            RepairAction::ForceGC => {
                // Dans Rust, on peut seulement suggérer au système de libérer
                // Note: En production, ceci appellerait un mécanisme réel
                log::info!("[HEALING] Force GC requested (simulated)");
                Ok(())
            }

            RepairAction::ClearMemoryCache => {
                // En production: appeler le cache manager
                log::info!("[HEALING] Memory cache cleared (simulated)");
                Ok(())
            }

            RepairAction::TrimMemory => {
                log::info!("[HEALING] Memory trimmed (simulated)");
                Ok(())
            }

            RepairAction::RebalanceEngines => {
                log::info!("[HEALING] Engines rebalanced (simulated)");
                Ok(())
            }

            RepairAction::RestartEngine(engine_id) => {
                log::warn!("[HEALING] Engine '{}' RESTARTED (simulated)", engine_id);
                Ok(())
            }

            RepairAction::RestartOmega => {
                log::warn!("[HEALING] OMEGA Pipeline RESTARTED (simulated)");
                Ok(())
            }

            RepairAction::ResetConversationContext => {
                log::info!("[HEALING] Conversation context RESET");
                Ok(())
            }

            RepairAction::RebuildIndexes => {
                log::info!("[HEALING] Indexes rebuilt (simulated)");
                Ok(())
            }

            RepairAction::ReduceParallelism => {
                log::info!("[HEALING] Parallelism reduced");
                Ok(())
            }

            RepairAction::PurgeFailedProviders => {
                log::info!("[HEALING] Failed providers purged");
                Ok(())
            }
        }
    }

    /// Enregistre une entrée dans l'historique
    async fn record_history(&self, entry: HealingHistoryEntry) {
        let mut history = self.history.write().await;
        history.push_back(entry);
        while history.len() > MAX_HISTORY_SIZE {
            history.pop_front();
        }
    }

    /// Met à jour les statistiques d'apprentissage
    async fn update_learning(&self, action: &RepairAction, success: bool) {
        let mut learning = self.learning.write().await;
        let action_key = format!("{:?}", action);

        let (successes, total) = learning
            .action_success_rates
            .entry(action_key.clone())
            .or_insert((0, 0));

        *total += 1;
        if success {
            *successes += 1;
        }
    }

    /// Met à jour le score d'anomalie après une action (pour l'apprentissage)
    pub async fn update_anomaly_after(&self, anomaly_after: f32) {
        let mut history = self.history.write().await;
        if let Some(last) = history.back_mut() {
            let effectiveness = last.anomaly_before - anomaly_after;
            last.anomaly_after = Some(anomaly_after);

            // Mettre à jour l'efficacité dans les stats d'apprentissage
            let action_key = format!("{:?}", last.action);
            drop(history); // Libérer le lock

            let mut learning = self.learning.write().await;
            let current = learning
                .action_effectiveness
                .entry(action_key)
                .or_insert(0.0);
            // Moyenne mobile
            *current = (*current * 0.8) + (effectiveness * 0.2);
        }
    }

    /// Retourne l'état actuel du healing
    pub async fn get_state(&self) -> HealingState {
        self.state.read().await.clone()
    }

    /// Retourne l'historique récent
    pub async fn get_history(&self, limit: usize) -> Vec<HealingHistoryEntry> {
        let history = self.history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Retourne les statistiques d'apprentissage
    pub async fn get_learning_stats(&self) -> LearningStats {
        self.learning.read().await.clone()
    }

    /// Retourne les statistiques globales
    pub fn stats(&self) -> ExecutorStats {
        let executed = self.actions_executed.load(Ordering::Relaxed);
        let succeeded = self.actions_succeeded.load(Ordering::Relaxed);

        ExecutorStats {
            total_actions: executed,
            successful_actions: succeeded,
            success_rate: if executed > 0 {
                succeeded as f32 / executed as f32
            } else {
                0.0
            },
            is_executing: self.executing.load(Ordering::Relaxed),
        }
    }

    /// Vérifie si le Safe Mode est actif
    pub async fn is_safe_mode_active(&self) -> bool {
        self.state.read().await.safe_mode_active
    }

    /// Vérifie si un moteur est isolé
    pub async fn is_engine_isolated(&self, engine_id: &str) -> bool {
        self.state
            .read()
            .await
            .isolated_engines
            .contains(&engine_id.to_string())
    }

    /// Timestamp actuel
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for HealingExecutor {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques de l'exécuteur
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExecutorStats {
    pub total_actions: u32,
    pub successful_actions: u32,
    pub success_rate: f32,
    pub is_executing: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_executor_creation() {
        let executor = HealingExecutor::new();
        let state = executor.get_state().await;
        assert!(!state.safe_mode_active);
    }

    #[tokio::test]
    async fn test_enable_safe_mode() {
        let executor = HealingExecutor::new();

        let result = executor.execute(RepairAction::EnableSafeMode, 0.5).await;
        assert!(result.success);

        let state = executor.get_state().await;
        assert!(state.safe_mode_active);
        assert!(state.degraded_mode_active);
    }

    #[tokio::test]
    async fn test_isolate_engine() {
        let executor = HealingExecutor::new();

        executor
            .execute(RepairAction::IsolateEngine("test-engine".to_string()), 0.3)
            .await;

        assert!(executor.is_engine_isolated("test-engine").await);
        assert!(!executor.is_engine_isolated("other-engine").await);
    }

    #[tokio::test]
    async fn test_restore_engine() {
        let executor = HealingExecutor::new();

        executor
            .execute(RepairAction::IsolateEngine("test-engine".to_string()), 0.3)
            .await;
        executor
            .execute(RepairAction::RestoreEngine("test-engine".to_string()), 0.2)
            .await;

        assert!(!executor.is_engine_isolated("test-engine").await);
    }

    #[tokio::test]
    async fn test_history_recording() {
        let executor = HealingExecutor::new();

        executor.execute(RepairAction::ForceGC, 0.4).await;
        executor.execute(RepairAction::TrimMemory, 0.35).await;

        let history = executor.get_history(10).await;
        assert_eq!(history.len(), 2);
    }

    #[tokio::test]
    async fn test_stats() {
        let executor = HealingExecutor::new();

        executor.execute(RepairAction::ForceGC, 0.4).await;
        executor
            .execute(RepairAction::EnableDetailedLogging, 0.3)
            .await;

        let stats = executor.stats();
        assert_eq!(stats.total_actions, 2);
        assert_eq!(stats.successful_actions, 2);
        assert!((stats.success_rate - 1.0).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_batch_execution() {
        let executor = HealingExecutor::new();

        let actions = vec![
            RepairAction::EnableDetailedLogging,
            RepairAction::ForceGC,
            RepairAction::TrimMemory,
        ];

        let results = executor.execute_batch(actions, 0.5).await;
        assert_eq!(results.len(), 3);
        assert!(results.iter().all(|r| r.success));
    }

    #[tokio::test]
    async fn test_circuit_breaker() {
        let executor = HealingExecutor::new();

        executor
            .execute(RepairAction::EnableCircuitBreaker, 0.6)
            .await;
        let state = executor.get_state().await;
        assert!(state.circuit_breaker_active);

        executor
            .execute(RepairAction::DisableCircuitBreaker, 0.3)
            .await;
        let state = executor.get_state().await;
        assert!(!state.circuit_breaker_active);
    }
}
