// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — OMEGA PIPELINE - SELF-HEALING HOOK
//   Super Prompt #4: Integration du self-healing dans le pipeline
//   Detection → Diagnosis → Repair → Learn
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::atomic::{AtomicU32, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
//   TYPES DE BASE (Self-contained)
// ═══════════════════════════════════════════════════════════════

/// État de santé du système (copie locale pour isolation)
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct HookSystemHealth {
    pub cpu_load: f32,
    pub memory_usage: f32,
    pub omega_latency: u64,
    pub error_rate: f32,
    pub cache_hit_rate: f32,
    pub anomaly_score: f32,
    pub last_update: u64,
    pub engine_latencies: HashMap<String, u64>,
}

impl HookSystemHealth {
    pub fn healthy() -> Self {
        Self {
            cpu_load: 0.2,
            memory_usage: 0.3,
            omega_latency: 50,
            error_rate: 0.0,
            cache_hit_rate: 0.8,
            anomaly_score: 0.0,
            last_update: Self::now(),
            engine_latencies: HashMap::new(),
        }
    }

    pub fn summary(&self) -> String {
        let status = if self.anomaly_score > 0.7 {
            "CRITICAL"
        } else if self.anomaly_score > 0.4 {
            "DEGRADED"
        } else {
            "HEALTHY"
        };
        format!(
            "[{}] Score: {:.2}, Errors: {:.1}%, Latency: {}ms",
            status,
            self.anomaly_score,
            self.error_rate * 100.0,
            self.omega_latency
        )
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Niveau d'anomalie
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AnomalyLevel {
    Normal,
    Warning,
    Critical,
}

impl AnomalyLevel {
    pub fn from_score(score: f32) -> Self {
        if score < 0.4 {
            AnomalyLevel::Normal
        } else if score < 0.7 {
            AnomalyLevel::Warning
        } else {
            AnomalyLevel::Critical
        }
    }
}

/// Direction de la tendance
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TrendDirection {
    Improving,
    Stable,
    Degrading,
    CriticalDegradation,
}

/// Prédiction d'anomalie
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnomalyPrediction {
    pub probability: f32,
    pub time_to_critical_secs: Option<u64>,
    pub confidence: f32,
    pub timestamp: u64,
    pub trend: TrendDirection,
}

/// Actions de réparation
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum HookRepairAction {
    EnableSafeMode,
    DisableSafeMode,
    EnableCircuitBreaker,
    DisableCircuitBreaker,
    ClearCache,
    TrimMemory,
    ForceGC,
    EnableDetailedLogging,
    ReduceParallelism,
    RebalanceEngines,
    RestartOmega,
}

impl HookRepairAction {
    pub fn priority(&self) -> u8 {
        match self {
            HookRepairAction::EnableSafeMode => 12,
            HookRepairAction::RestartOmega => 10,
            HookRepairAction::EnableCircuitBreaker => 9,
            HookRepairAction::ClearCache => 8,
            HookRepairAction::TrimMemory => 7,
            HookRepairAction::RebalanceEngines => 6,
            HookRepairAction::ForceGC => 5,
            HookRepairAction::ReduceParallelism => 3,
            HookRepairAction::DisableSafeMode => 2,
            HookRepairAction::DisableCircuitBreaker => 2,
            HookRepairAction::EnableDetailedLogging => 1,
        }
    }

    pub fn risk_level(&self) -> u8 {
        match self {
            HookRepairAction::EnableDetailedLogging => 0,
            HookRepairAction::ForceGC => 1,
            HookRepairAction::DisableCircuitBreaker => 1,
            HookRepairAction::TrimMemory => 2,
            HookRepairAction::EnableCircuitBreaker => 2,
            HookRepairAction::ReduceParallelism => 2,
            HookRepairAction::ClearCache => 3,
            HookRepairAction::RebalanceEngines => 4,
            HookRepairAction::DisableSafeMode => 5,
            HookRepairAction::EnableSafeMode => 7,
            HookRepairAction::RestartOmega => 8,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            HookRepairAction::EnableSafeMode => "Activation du Safe Mode",
            HookRepairAction::DisableSafeMode => "Désactivation du Safe Mode",
            HookRepairAction::EnableCircuitBreaker => "Activation du circuit breaker",
            HookRepairAction::DisableCircuitBreaker => "Désactivation du circuit breaker",
            HookRepairAction::ClearCache => "Vidage du cache",
            HookRepairAction::TrimMemory => "Réduction mémoire",
            HookRepairAction::ForceGC => "Garbage collection",
            HookRepairAction::EnableDetailedLogging => "Logs détaillés",
            HookRepairAction::ReduceParallelism => "Réduction parallélisme",
            HookRepairAction::RebalanceEngines => "Rééquilibrage moteurs",
            HookRepairAction::RestartOmega => "Redémarrage OMEGA",
        }
    }
}

/// Résultat d'une action de réparation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RepairResult {
    pub action: HookRepairAction,
    pub success: bool,
    pub duration_ms: u64,
    pub message: Option<String>,
}

/// État du healing
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct HealingState {
    pub safe_mode_active: bool,
    pub circuit_breaker_active: bool,
    pub degraded_mode_active: bool,
    pub detailed_logging: bool,
}

// ═══════════════════════════════════════════════════════════════
//   SELF-HEALING HOOK CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/// Configuration du hook self-healing
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SelfHealingHookConfig {
    pub enabled: bool,
    pub evaluation_interval: u64,
    pub proactive_mode: bool,
    pub action_threshold: f32,
    pub critical_threshold: f32,
    pub auto_execute: bool,
    pub confirm_high_risk: bool,
}

impl Default for SelfHealingHookConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            evaluation_interval: 10,
            proactive_mode: true,
            action_threshold: 0.4,
            critical_threshold: 0.7,
            auto_execute: true,
            confirm_high_risk: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   ANOMALY DETECTOR (inline)
// ═══════════════════════════════════════════════════════════════

struct AnomalyDetector;

impl AnomalyDetector {
    fn compute_score(health: &HookSystemHealth) -> f32 {
        let mut score: f32 = 0.0;

        // Error rate penalty
        if health.error_rate > 0.1 {
            score += 0.4;
        } else if health.error_rate > 0.03 {
            score += 0.2;
        }

        // Latency penalty
        if health.omega_latency > 500 {
            score += 0.35;
        } else if health.omega_latency > 200 {
            score += 0.15;
        }

        // Memory penalty
        if health.memory_usage > 0.9 {
            score += 0.35;
        } else if health.memory_usage > 0.7 {
            score += 0.15;
        }

        // Cache hit rate penalty
        if health.cache_hit_rate < 0.5 {
            score += 0.15;
        }

        score.min(1.0)
    }
}

// ═══════════════════════════════════════════════════════════════
//   PREDICTOR (inline)
// ═══════════════════════════════════════════════════════════════

struct Predictor {
    history: VecDeque<f32>,
}

impl Predictor {
    fn new() -> Self {
        Self {
            history: VecDeque::with_capacity(50),
        }
    }

    fn record(&mut self, score: f32) {
        self.history.push_back(score);
        if self.history.len() > 50 {
            self.history.pop_front();
        }
    }

    fn predict(&self) -> AnomalyPrediction {
        let now = HookSystemHealth::now();

        if self.history.len() < 3 {
            return AnomalyPrediction {
                probability: 0.0,
                time_to_critical_secs: None,
                confidence: 0.1,
                timestamp: now,
                trend: TrendDirection::Stable,
            };
        }

        let len = self.history.len();
        let recent: Vec<f32> = self.history.iter().rev().take(5).copied().collect();
        let older: Vec<f32> = self.history.iter().take(5).copied().collect();

        let recent_avg: f32 = recent.iter().sum::<f32>() / recent.len() as f32;
        let older_avg: f32 = older.iter().sum::<f32>() / older.len() as f32;
        let delta = recent_avg - older_avg;

        let trend = if delta > 0.2 {
            TrendDirection::CriticalDegradation
        } else if delta > 0.05 {
            TrendDirection::Degrading
        } else if delta < -0.05 {
            TrendDirection::Improving
        } else {
            TrendDirection::Stable
        };

        let current = *self.history.back().unwrap_or(&0.0);
        let probability = (current * 0.4 + delta.abs() * 0.6).min(1.0);

        let time_to_critical = if trend == TrendDirection::CriticalDegradation {
            Some(60)
        } else if trend == TrendDirection::Degrading && current > 0.4 {
            Some(120)
        } else {
            None
        };

        AnomalyPrediction {
            probability,
            time_to_critical_secs: time_to_critical,
            confidence: (len as f32 / 50.0).min(1.0),
            timestamp: now,
            trend,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   HEALER (inline)
// ═══════════════════════════════════════════════════════════════

struct Healer;

impl Healer {
    fn determine_actions(health: &HookSystemHealth) -> Vec<HookRepairAction> {
        let mut actions = Vec::new();

        // Critical anomaly
        if health.anomaly_score > 0.8 {
            actions.push(HookRepairAction::EnableSafeMode);
            actions.push(HookRepairAction::ClearCache);
        } else if health.anomaly_score > 0.6 {
            actions.push(HookRepairAction::EnableCircuitBreaker);
            actions.push(HookRepairAction::RebalanceEngines);
        }

        // High memory
        if health.memory_usage > 0.85 {
            actions.push(HookRepairAction::TrimMemory);
            actions.push(HookRepairAction::ForceGC);
        } else if health.memory_usage > 0.7 {
            actions.push(HookRepairAction::TrimMemory);
        }

        // High error rate
        if health.error_rate > 0.08 {
            actions.push(HookRepairAction::EnableDetailedLogging);
            actions.push(HookRepairAction::ReduceParallelism);
        }

        // Low cache hit
        if health.cache_hit_rate < 0.4 {
            actions.push(HookRepairAction::ClearCache);
        }

        // Deduplicate and sort by priority
        actions.sort_by_key(|a| std::cmp::Reverse(a.priority()));
        actions.dedup();

        actions
    }
}

// ═══════════════════════════════════════════════════════════════
//   EXECUTOR (inline)
// ═══════════════════════════════════════════════════════════════

struct Executor {
    state: Arc<RwLock<HealingState>>,
    history: Arc<RwLock<VecDeque<RepairResult>>>,
    actions_executed: AtomicU32,
    actions_succeeded: AtomicU32,
}

impl Executor {
    fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(HealingState::default())),
            history: Arc::new(RwLock::new(VecDeque::with_capacity(100))),
            actions_executed: AtomicU32::new(0),
            actions_succeeded: AtomicU32::new(0),
        }
    }

    async fn execute(&self, action: HookRepairAction) -> RepairResult {
        let start = Instant::now();

        // Execute action
        let success = self.execute_action(&action).await;
        let duration_ms = start.elapsed().as_millis() as u64;

        self.actions_executed.fetch_add(1, Ordering::Relaxed);
        if success {
            self.actions_succeeded.fetch_add(1, Ordering::Relaxed);
        }

        let result = RepairResult {
            action,
            success,
            duration_ms,
            message: None,
        };

        // Record in history
        let mut history = self.history.write().await;
        history.push_back(result.clone());
        if history.len() > 100 {
            history.pop_front();
        }

        result
    }

    async fn execute_action(&self, action: &HookRepairAction) -> bool {
        let mut state = self.state.write().await;

        match action {
            HookRepairAction::EnableSafeMode => {
                state.safe_mode_active = true;
                state.degraded_mode_active = true;
                state.detailed_logging = true;
                log::warn!("[SELF-HEALING] Safe Mode ACTIVATED");
            }
            HookRepairAction::DisableSafeMode => {
                state.safe_mode_active = false;
                state.degraded_mode_active = false;
                log::info!("[SELF-HEALING] Safe Mode DEACTIVATED");
            }
            HookRepairAction::EnableCircuitBreaker => {
                state.circuit_breaker_active = true;
                log::warn!("[SELF-HEALING] Circuit Breaker ENABLED");
            }
            HookRepairAction::DisableCircuitBreaker => {
                state.circuit_breaker_active = false;
                log::info!("[SELF-HEALING] Circuit Breaker DISABLED");
            }
            HookRepairAction::EnableDetailedLogging => {
                state.detailed_logging = true;
                log::info!("[SELF-HEALING] Detailed logging ENABLED");
            }
            _ => {
                log::info!("[SELF-HEALING] Executed: {:?}", action);
            }
        }

        true
    }

    async fn get_state(&self) -> HealingState {
        self.state.read().await.clone()
    }
}

// ═══════════════════════════════════════════════════════════════
//   SELF-HEALING HOOK
// ═══════════════════════════════════════════════════════════════

/// Hook de self-healing pour le pipeline OMEGA
pub struct SelfHealingHook {
    config: SelfHealingHookConfig,
    predictor: Arc<RwLock<Predictor>>,
    executor: Executor,
    current_health: Arc<RwLock<HookSystemHealth>>,
    request_count: AtomicU64,
    last_prediction: Arc<RwLock<Option<AnomalyPrediction>>>,
    pending_actions: Arc<RwLock<Vec<HookRepairAction>>>,
}

impl SelfHealingHook {
    pub fn new() -> Self {
        Self::with_config(SelfHealingHookConfig::default())
    }

    pub fn with_config(config: SelfHealingHookConfig) -> Self {
        Self {
            config,
            predictor: Arc::new(RwLock::new(Predictor::new())),
            executor: Executor::new(),
            current_health: Arc::new(RwLock::new(HookSystemHealth::healthy())),
            request_count: AtomicU64::new(0),
            last_prediction: Arc::new(RwLock::new(None)),
            pending_actions: Arc::new(RwLock::new(Vec::new())),
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //   PIPELINE HOOKS
    // ═══════════════════════════════════════════════════════════════

    /// Hook called before each request
    pub async fn on_request_start(&self, request_id: &str) -> RequestContext {
        self.request_count.fetch_add(1, Ordering::Relaxed);
        let state = self.executor.get_state().await;

        RequestContext {
            request_id: request_id.to_string(),
            safe_mode: state.safe_mode_active,
            circuit_breaker: state.circuit_breaker_active,
            degraded_mode: state.degraded_mode_active,
            start_time: Instant::now(),
        }
    }

    /// Hook called after each request
    pub async fn on_request_complete(
        &self,
        _context: &RequestContext,
        success: bool,
        latency_ms: u64,
    ) -> Option<HealingReport> {
        if !self.config.enabled {
            return None;
        }

        // Update health
        self.update_health(success, latency_ms).await;

        // Check if we should evaluate
        let count = self.request_count.load(Ordering::Relaxed);
        if count % self.config.evaluation_interval != 0 {
            return None;
        }

        // Evaluate and potentially heal
        self.evaluate_and_heal().await
    }

    /// Hook called on error
    pub async fn on_error(&self, error_type: &str, _message: &str) -> Option<HealingReport> {
        if !self.config.enabled {
            return None;
        }

        // Immediate health update
        {
            let mut health = self.current_health.write().await;
            health.error_rate = (health.error_rate + 0.05).min(1.0);
        }

        // Emergency evaluation for critical errors
        if error_type == "timeout" || error_type == "panic" {
            return self.evaluate_and_heal().await;
        }

        None
    }

    /// Hook called periodically
    pub async fn on_tick(&self) -> Option<HealingReport> {
        if !self.config.enabled || !self.config.proactive_mode {
            return None;
        }

        // Predict future anomalies
        let prediction = {
            let mut predictor = self.predictor.write().await;
            let health = self.current_health.read().await;
            predictor.record(health.anomaly_score);
            predictor.predict()
        };

        *self.last_prediction.write().await = Some(prediction.clone());

        if prediction.probability > 0.6 {
            log::warn!(
                "[SELF-HEALING] Proactive alert: {:.0}% probability of anomaly",
                prediction.probability * 100.0
            );
            return self.evaluate_and_heal().await;
        }

        None
    }

    // ═══════════════════════════════════════════════════════════════
    //   EVALUATION AND HEALING
    // ═══════════════════════════════════════════════════════════════

    async fn evaluate_and_heal(&self) -> Option<HealingReport> {
        let mut health = self.current_health.write().await;

        // Compute anomaly score
        health.anomaly_score = AnomalyDetector::compute_score(&health);
        let level = AnomalyLevel::from_score(health.anomaly_score);

        // Record for predictor
        {
            let mut predictor = self.predictor.write().await;
            predictor.record(health.anomaly_score);
        }

        if health.anomaly_score < self.config.action_threshold {
            return Some(HealingReport {
                timestamp: HookSystemHealth::now(),
                anomaly_score: health.anomaly_score,
                level,
                actions_taken: vec![],
                actions_pending: vec![],
                prediction: self.last_prediction.read().await.clone(),
                health_summary: health.summary(),
            });
        }

        // Determine necessary actions
        let actions = Healer::determine_actions(&health);
        drop(health); // Release lock

        if actions.is_empty() {
            let health = self.current_health.read().await;
            return Some(HealingReport {
                timestamp: HookSystemHealth::now(),
                anomaly_score: health.anomaly_score,
                level,
                actions_taken: vec![],
                actions_pending: vec![],
                prediction: self.last_prediction.read().await.clone(),
                health_summary: health.summary(),
            });
        }

        log::warn!(
            "[SELF-HEALING] Level {:?} detected, {} actions proposed",
            level,
            actions.len()
        );

        // Filter actions by config
        let (auto_actions, pending_actions): (Vec<_>, Vec<_>) = if self.config.auto_execute {
            actions
                .into_iter()
                .partition(|a| !self.config.confirm_high_risk || a.risk_level() < 7)
        } else {
            (vec![], actions)
        };

        // Store pending actions
        if !pending_actions.is_empty() {
            let mut pending = self.pending_actions.write().await;
            for action in &pending_actions {
                if !pending.contains(action) {
                    pending.push(action.clone());
                }
            }
        }

        // Execute automatic actions
        let mut results = Vec::new();
        for action in auto_actions {
            log::info!("[SELF-HEALING] Executing: {:?}", action);
            let result = self.executor.execute(action).await;
            results.push(result);
        }

        let health = self.current_health.read().await;
        Some(HealingReport {
            timestamp: HookSystemHealth::now(),
            anomaly_score: health.anomaly_score,
            level,
            actions_taken: results,
            actions_pending: self.pending_actions.read().await.clone(),
            prediction: self.last_prediction.read().await.clone(),
            health_summary: health.summary(),
        })
    }

    // ═══════════════════════════════════════════════════════════════
    //   HEALTH UPDATES
    // ═══════════════════════════════════════════════════════════════

    async fn update_health(&self, success: bool, latency_ms: u64) {
        let mut health = self.current_health.write().await;

        if success {
            health.error_rate = (health.error_rate * 0.95).max(0.0);
        } else {
            health.error_rate = (health.error_rate + 0.02).min(1.0);
        }

        health.omega_latency = latency_ms;
        health.last_update = HookSystemHealth::now();
    }

    // ═══════════════════════════════════════════════════════════════
    //   PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    pub async fn get_state(&self) -> HealingState {
        self.executor.get_state().await
    }

    pub async fn get_health(&self) -> HookSystemHealth {
        self.current_health.read().await.clone()
    }

    pub async fn get_prediction(&self) -> Option<AnomalyPrediction> {
        self.last_prediction.read().await.clone()
    }

    pub async fn get_pending_actions(&self) -> Vec<HookRepairAction> {
        self.pending_actions.read().await.clone()
    }

    pub async fn confirm_action(&self, action: &HookRepairAction) -> Option<RepairResult> {
        let mut pending = self.pending_actions.write().await;
        if let Some(pos) = pending.iter().position(|a| a == action) {
            pending.remove(pos);
            drop(pending);
            return Some(self.executor.execute(action.clone()).await);
        }
        None
    }

    pub async fn reject_action(&self, action: &HookRepairAction) -> bool {
        let mut pending = self.pending_actions.write().await;
        if let Some(pos) = pending.iter().position(|a| a == action) {
            pending.remove(pos);
            return true;
        }
        false
    }

    pub async fn force_evaluation(&self) -> Option<HealingReport> {
        self.evaluate_and_heal().await
    }

    pub fn set_enabled(&mut self, enabled: bool) {
        self.config.enabled = enabled;
    }
}

impl Default for SelfHealingHook {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   CONTEXT AND REPORT TYPES
// ═══════════════════════════════════════════════════════════════

/// Request context for the hook
#[derive(Clone, Debug)]
pub struct RequestContext {
    pub request_id: String,
    pub safe_mode: bool,
    pub circuit_breaker: bool,
    pub degraded_mode: bool,
    pub start_time: Instant,
}

/// Healing report
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealingReport {
    pub timestamp: u64,
    pub anomaly_score: f32,
    pub level: AnomalyLevel,
    pub actions_taken: Vec<RepairResult>,
    pub actions_pending: Vec<HookRepairAction>,
    pub prediction: Option<AnomalyPrediction>,
    pub health_summary: String,
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_hook_creation() {
        let hook = SelfHealingHook::new();
        let health = hook.get_health().await;
        assert!(health.anomaly_score < 0.4);
    }

    #[tokio::test]
    async fn test_request_context() {
        let hook = SelfHealingHook::new();
        let ctx = hook.on_request_start("test-req-1").await;
        assert_eq!(ctx.request_id, "test-req-1");
        assert!(!ctx.safe_mode);
    }

    #[tokio::test]
    async fn test_update_health() {
        let hook = SelfHealingHook::new();

        for _ in 0..5 {
            hook.update_health(true, 50).await;
        }

        let health = hook.get_health().await;
        assert!(health.error_rate < 0.1);
    }

    #[tokio::test]
    async fn test_force_evaluation() {
        let hook = SelfHealingHook::new();
        let report = hook.force_evaluation().await;
        assert!(report.is_some());
    }

    #[tokio::test]
    async fn test_anomaly_detection() {
        let health = HookSystemHealth {
            error_rate: 0.15,
            memory_usage: 0.92,
            omega_latency: 600,
            ..HookSystemHealth::healthy()
        };

        let score = AnomalyDetector::compute_score(&health);
        assert!(score > 0.6);
    }

    #[tokio::test]
    async fn test_healer_determines_actions() {
        let mut health = HookSystemHealth::healthy();
        health.anomaly_score = 0.85;
        health.memory_usage = 0.9;

        let actions = Healer::determine_actions(&health);
        assert!(!actions.is_empty());
    }
}
