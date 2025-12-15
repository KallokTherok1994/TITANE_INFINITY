// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v21 — ADAPTIVE OPTIMIZATION ENGINE
//   Surcouche d'intelligence adaptative au-dessus de SingularityState v∞
//   Auto-optimisation continue basée sur l'observation des performances réelles
// ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════════════════
//   STRUCTURES DE DONNÉES — CAPTURE DE PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════

/// Échantillon de performance système à un instant T
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemPerformanceSample {
    pub timestamp: u64,
    pub cpu_load: f32,
    pub memory_usage: f32,
    pub latency_ai: u128,
    pub latency_tauri_invoke: u128,
    pub ui_fps: u32,
    pub sync_quality: f32,
    pub cognitive_stability: f32,
    pub hash_integrity_ok: bool,
}

impl Default for SystemPerformanceSample {
    fn default() -> Self {
        Self {
            timestamp: 0,
            cpu_load: 0.0,
            memory_usage: 0.0,
            latency_ai: 0,
            latency_tauri_invoke: 0,
            ui_fps: 60,
            sync_quality: 1.0,
            cognitive_stability: 1.0,
            hash_integrity_ok: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   RÈGLES ADAPTATIVES — HEURISTIQUES D'AUTO-OPTIMISATION
// ═══════════════════════════════════════════════════════════════════════════════

/// Condition déclenchant une règle adaptative
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AdaptiveCondition {
    LatencyAIAbove(u128),
    CpuLoadAbove(f32),
    MemoryUsageAbove(f32),
    CognitiveStabilityBelow(f32),
    SyncQualityBelow(f32),
    FpsBelow(u32),
    HashIntegrityFailed,
    Combined(Vec<AdaptiveCondition>),
}

/// Action exécutée par une règle adaptative
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AdaptiveAction {
    ReduceAIComplexity,
    TriggerDeepSync,
    SimplifyUITransitions,
    PreloadWebSearchDomain,
    ReanchorTimeline,
    OptimizeMemoryUsage,
    RecalibrateCoherence,
    SwitchToStableMode,
    Custom(String),
}

/// Règle adaptative complète
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveRule {
    pub id: String,
    pub name: String,
    pub condition: AdaptiveCondition,
    pub action: AdaptiveAction,
    pub enabled: bool,
    pub priority: u32,
    pub execution_count: u32,
}

impl AdaptiveRule {
    /// Vérifie si la condition est remplie
    pub fn evaluate(&self, sample: &SystemPerformanceSample) -> bool {
        if !self.enabled {
            return false;
        }

        match &self.condition {
            AdaptiveCondition::LatencyAIAbove(threshold) => sample.latency_ai > *threshold,
            AdaptiveCondition::CpuLoadAbove(threshold) => sample.cpu_load > *threshold,
            AdaptiveCondition::MemoryUsageAbove(threshold) => sample.memory_usage > *threshold,
            AdaptiveCondition::CognitiveStabilityBelow(threshold) => {
                sample.cognitive_stability < *threshold
            }
            AdaptiveCondition::SyncQualityBelow(threshold) => sample.sync_quality < *threshold,
            AdaptiveCondition::FpsBelow(threshold) => sample.ui_fps < *threshold,
            AdaptiveCondition::HashIntegrityFailed => !sample.hash_integrity_ok,
            AdaptiveCondition::Combined(conditions) => {
                conditions.iter().all(|c| self.evaluate_single(c, sample))
            }
        }
    }

    fn evaluate_single(
        &self,
        condition: &AdaptiveCondition,
        sample: &SystemPerformanceSample,
    ) -> bool {
        match condition {
            AdaptiveCondition::LatencyAIAbove(t) => sample.latency_ai > *t,
            AdaptiveCondition::CpuLoadAbove(t) => sample.cpu_load > *t,
            AdaptiveCondition::MemoryUsageAbove(t) => sample.memory_usage > *t,
            AdaptiveCondition::CognitiveStabilityBelow(t) => sample.cognitive_stability < *t,
            AdaptiveCondition::SyncQualityBelow(t) => sample.sync_quality < *t,
            AdaptiveCondition::FpsBelow(t) => sample.ui_fps < *t,
            AdaptiveCondition::HashIntegrityFailed => !sample.hash_integrity_ok,
            AdaptiveCondition::Combined(_) => false, // Nested combined not supported
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   PROFIL D'ADAPTATION — PRÉFÉRENCES INTERNES
// ═══════════════════════════════════════════════════════════════════════════════

/// Style de préférence IA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AiPreference {
    Aggressive,   // Prompts complexes, latence acceptable
    Balanced,     // Équilibre qualité/vitesse
    Conservative, // Prompts simples, latence minimale
}

/// Mode de comportement système
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemBehaviorMode {
    Speed,       // Optimisation vitesse maximale
    Stability,   // Optimisation stabilité maximale
    Reliability, // Optimisation fiabilité maximale
    Adaptive,    // Adaptation automatique selon usage
}

/// Biais d'optimisation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizationBias {
    Performance,    // Favorise la performance brute
    Consistency,    // Favorise la cohérence interne
    UserExperience, // Favorise l'expérience utilisateur
    Balanced,       // Équilibre de tous les critères
}

/// Profil de préférences d'adaptation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreferenceProfile {
    pub ai_style: AiPreference,
    pub system_mode: SystemBehaviorMode,
    pub optimization_bias: OptimizationBias,
    pub auto_learn: bool,
}

impl Default for PreferenceProfile {
    fn default() -> Self {
        Self {
            ai_style: AiPreference::Balanced,
            system_mode: SystemBehaviorMode::Adaptive,
            optimization_bias: OptimizationBias::Balanced,
            auto_learn: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   ÉTAT D'APPRENTISSAGE
// ═══════════════════════════════════════════════════════════════════════════════

/// État de l'apprentissage interne
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningState {
    pub total_samples: usize,
    pub patterns_detected: Vec<String>,
    pub optimization_cycles: u32,
    pub last_learn_timestamp: String,
    pub learning_rate: f32,
}

impl Default for LearningState {
    fn default() -> Self {
        Self {
            total_samples: 0,
            patterns_detected: Vec::new(),
            optimization_cycles: 0,
            last_learn_timestamp: String::new(),
            learning_rate: 0.1,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   ADAPTIVE OPTIMIZATION ENGINE — STRUCTURE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur d'optimisation adaptative principal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveOptimizationEngine {
    pub performance_history: Vec<SystemPerformanceSample>,
    pub optimization_rules: Vec<AdaptiveRule>,
    pub learning_state: LearningState,
    pub preference_profile: PreferenceProfile,
    pub max_history_size: usize,
}

impl Default for AdaptiveOptimizationEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl AdaptiveOptimizationEngine {
    /// Crée un nouveau moteur avec règles par défaut
    pub fn new() -> Self {
        let mut engine = Self {
            performance_history: Vec::new(),
            optimization_rules: Vec::new(),
            learning_state: LearningState::default(),
            preference_profile: PreferenceProfile::default(),
            max_history_size: 1000,
        };

        // Charger règles par défaut
        engine.load_default_rules();
        engine
    }

    /// Charge les règles adaptatives par défaut
    fn load_default_rules(&mut self) {
        self.optimization_rules = vec![
            AdaptiveRule {
                id: "rule_latency_ai_high".to_string(),
                name: "Reduce AI complexity on high latency".to_string(),
                condition: AdaptiveCondition::LatencyAIAbove(5000),
                action: AdaptiveAction::ReduceAIComplexity,
                enabled: true,
                priority: 10,
                execution_count: 0,
            },
            AdaptiveRule {
                id: "rule_cognitive_low".to_string(),
                name: "Trigger deep sync on low cognitive stability".to_string(),
                condition: AdaptiveCondition::CognitiveStabilityBelow(0.5),
                action: AdaptiveAction::TriggerDeepSync,
                enabled: true,
                priority: 20,
                execution_count: 0,
            },
            AdaptiveRule {
                id: "rule_fps_low".to_string(),
                name: "Simplify UI transitions on low FPS".to_string(),
                condition: AdaptiveCondition::FpsBelow(40),
                action: AdaptiveAction::SimplifyUITransitions,
                enabled: true,
                priority: 5,
                execution_count: 0,
            },
            AdaptiveRule {
                id: "rule_sync_low".to_string(),
                name: "Reanchor timeline on low sync quality".to_string(),
                condition: AdaptiveCondition::SyncQualityBelow(0.7),
                action: AdaptiveAction::ReanchorTimeline,
                enabled: true,
                priority: 15,
                execution_count: 0,
            },
            AdaptiveRule {
                id: "rule_hash_failed".to_string(),
                name: "Switch to stable mode on hash integrity failure".to_string(),
                condition: AdaptiveCondition::HashIntegrityFailed,
                action: AdaptiveAction::SwitchToStableMode,
                enabled: true,
                priority: 30,
                execution_count: 0,
            },
        ];
    }

    /// Capture un échantillon de performance
    pub fn capture_sample(&mut self, sample: SystemPerformanceSample) {
        log::info!("[AdaptiveEngine] Capturing performance sample");

        self.performance_history.push(sample);
        self.learning_state.total_samples += 1;

        // Limiter taille historique
        if self.performance_history.len() > self.max_history_size {
            self.performance_history.remove(0);
        }
    }

    /// Évalue les règles et retourne les actions à exécuter
    pub fn evaluate_rules(&mut self) -> Vec<AdaptiveAction> {
        if self.performance_history.is_empty() {
            return Vec::new();
        }

        let latest_sample = self
            .performance_history
            .last()
            .expect("History should not be empty after check");
        let mut actions = Vec::new();

        // Trier par priorité
        let mut rules = self.optimization_rules.clone();
        rules.sort_by(|a, b| b.priority.cmp(&a.priority));

        for rule in &mut rules {
            if rule.evaluate(latest_sample) {
                log::info!("[AdaptiveEngine] Rule triggered: {}", rule.name);
                actions.push(rule.action.clone());
                rule.execution_count += 1;
            }
        }

        // Mettre à jour les compteurs
        for action in &actions {
            if let Some(rule) = self
                .optimization_rules
                .iter_mut()
                .find(|r| std::mem::discriminant(&r.action) == std::mem::discriminant(action))
            {
                rule.execution_count += 1;
            }
        }

        actions
    }

    /// Apprentissage interne basé sur l'historique
    pub fn learn(&mut self) {
        log::info!("[AdaptiveEngine] Starting learning cycle");

        if self.performance_history.len() < 10 {
            log::warn!("[AdaptiveEngine] Insufficient samples for learning");
            return;
        }

        // Analyse simple: moyenne des derniers échantillons
        let recent_samples: Vec<_> = self.performance_history.iter().rev().take(100).collect();

        let avg_cpu =
            recent_samples.iter().map(|s| s.cpu_load).sum::<f32>() / recent_samples.len() as f32;
        let avg_latency = recent_samples.iter().map(|s| s.latency_ai).sum::<u128>()
            / recent_samples.len() as u128;
        let avg_stability = recent_samples
            .iter()
            .map(|s| s.cognitive_stability)
            .sum::<f32>()
            / recent_samples.len() as f32;

        // Détection de patterns simples
        let mut patterns = Vec::new();

        if avg_cpu > 0.8 {
            patterns.push("High CPU usage pattern detected".to_string());
        }

        if avg_latency > 3000 {
            patterns.push("High AI latency pattern detected".to_string());
        }

        if avg_stability < 0.7 {
            patterns.push("Low cognitive stability pattern detected".to_string());
        }

        self.learning_state.patterns_detected = patterns;
        self.learning_state.optimization_cycles += 1;
        self.learning_state.last_learn_timestamp = chrono::Utc::now().to_rfc3339();

        // Ajustement préférences basé sur patterns
        if self.preference_profile.auto_learn {
            self.adjust_preferences_from_patterns();
        }

        log::info!(
            "[AdaptiveEngine] Learning cycle complete - {} patterns detected",
            self.learning_state.patterns_detected.len()
        );
    }

    /// Ajuste les préférences selon les patterns détectés
    fn adjust_preferences_from_patterns(&mut self) {
        let patterns = &self.learning_state.patterns_detected;

        // Si CPU élevé → mode Conservative
        if patterns.iter().any(|p| p.contains("High CPU")) {
            self.preference_profile.ai_style = AiPreference::Conservative;
            self.preference_profile.system_mode = SystemBehaviorMode::Stability;
        }

        // Si latence AI élevée → mode Conservative
        if patterns.iter().any(|p| p.contains("High AI latency")) {
            self.preference_profile.ai_style = AiPreference::Conservative;
        }

        // Si stabilité cognitive basse → mode Reliability
        if patterns
            .iter()
            .any(|p| p.contains("Low cognitive stability"))
        {
            self.preference_profile.system_mode = SystemBehaviorMode::Reliability;
            self.preference_profile.optimization_bias = OptimizationBias::Consistency;
        }
    }

    /// Génère un résumé de l'état adaptatif
    pub fn get_summary(&self) -> AdaptiveSummary {
        let latest_sample = self.performance_history.last().cloned();

        let avg_cpu = if !self.performance_history.is_empty() {
            self.performance_history
                .iter()
                .map(|s| s.cpu_load)
                .sum::<f32>()
                / self.performance_history.len() as f32
        } else {
            0.0
        };

        let avg_latency = if !self.performance_history.is_empty() {
            self.performance_history
                .iter()
                .map(|s| s.latency_ai)
                .sum::<u128>()
                / self.performance_history.len() as u128
        } else {
            0
        };

        AdaptiveSummary {
            total_samples: self.learning_state.total_samples,
            optimization_cycles: self.learning_state.optimization_cycles,
            patterns_detected: self.learning_state.patterns_detected.len(),
            active_rules: self.optimization_rules.iter().filter(|r| r.enabled).count(),
            avg_cpu_load: avg_cpu,
            avg_ai_latency: avg_latency,
            current_mode: format!("{:?}", self.preference_profile.system_mode),
            latest_sample,
        }
    }
}

/// Résumé de l'état adaptatif
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveSummary {
    pub total_samples: usize,
    pub optimization_cycles: u32,
    pub patterns_detected: usize,
    pub active_rules: usize,
    pub avg_cpu_load: f32,
    pub avg_ai_latency: u128,
    pub current_mode: String,
    pub latest_sample: Option<SystemPerformanceSample>,
}

// ═══════════════════════════════════════════════════════════════════════════════
//   TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────────
    // Tests SystemPerformanceSample
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_system_performance_sample_default() {
        let sample = SystemPerformanceSample::default();
        assert_eq!(sample.timestamp, 0);
        assert_eq!(sample.cpu_load, 0.0);
        assert_eq!(sample.memory_usage, 0.0);
        assert_eq!(sample.latency_ai, 0);
        assert_eq!(sample.ui_fps, 60);
        assert_eq!(sample.sync_quality, 1.0);
        assert_eq!(sample.cognitive_stability, 1.0);
        assert!(sample.hash_integrity_ok);
    }

    #[test]
    fn test_system_performance_sample_custom() {
        let sample = SystemPerformanceSample {
            timestamp: 1234567890,
            cpu_load: 0.75,
            memory_usage: 0.60,
            latency_ai: 500,
            latency_tauri_invoke: 10,
            ui_fps: 45,
            sync_quality: 0.85,
            cognitive_stability: 0.90,
            hash_integrity_ok: true,
        };
        assert_eq!(sample.timestamp, 1234567890);
        assert_eq!(sample.cpu_load, 0.75);
        assert_eq!(sample.ui_fps, 45);
    }

    #[test]
    fn test_system_performance_sample_debug() {
        let sample = SystemPerformanceSample::default();
        let debug = format!("{:?}", sample);
        assert!(debug.contains("SystemPerformanceSample"));
    }

    #[test]
    fn test_system_performance_sample_clone() {
        let sample = SystemPerformanceSample::default();
        let cloned = sample.clone();
        assert_eq!(cloned.cpu_load, sample.cpu_load);
    }

    #[test]
    fn test_system_performance_sample_serialize() {
        let sample = SystemPerformanceSample::default();
        let json = serde_json::to_string(&sample).unwrap();
        assert!(json.contains("cpu_load"));
        assert!(json.contains("ui_fps"));
    }

    #[test]
    fn test_system_performance_sample_deserialize() {
        let json = r#"{"timestamp":100,"cpu_load":0.5,"memory_usage":0.3,"latency_ai":200,"latency_tauri_invoke":5,"ui_fps":60,"sync_quality":0.9,"cognitive_stability":0.8,"hash_integrity_ok":true}"#;
        let sample: SystemPerformanceSample = serde_json::from_str(json).unwrap();
        assert_eq!(sample.timestamp, 100);
        assert_eq!(sample.cpu_load, 0.5);
    }

    #[test]
    fn test_system_performance_sample_roundtrip() {
        let sample = SystemPerformanceSample {
            timestamp: 999,
            cpu_load: 0.33,
            memory_usage: 0.44,
            latency_ai: 333,
            latency_tauri_invoke: 44,
            ui_fps: 55,
            sync_quality: 0.77,
            cognitive_stability: 0.88,
            hash_integrity_ok: false,
        };
        let json = serde_json::to_string(&sample).unwrap();
        let restored: SystemPerformanceSample = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.timestamp, 999);
        assert!(!restored.hash_integrity_ok);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests AdaptiveCondition
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_adaptive_condition_latency_ai() {
        let condition = AdaptiveCondition::LatencyAIAbove(1000);
        let debug = format!("{:?}", condition);
        assert!(debug.contains("LatencyAIAbove"));
    }

    #[test]
    fn test_adaptive_condition_cpu_load() {
        let condition = AdaptiveCondition::CpuLoadAbove(0.8);
        let debug = format!("{:?}", condition);
        assert!(debug.contains("CpuLoadAbove"));
    }

    #[test]
    fn test_adaptive_condition_memory_usage() {
        let condition = AdaptiveCondition::MemoryUsageAbove(0.9);
        assert!(matches!(condition, AdaptiveCondition::MemoryUsageAbove(_)));
    }

    #[test]
    fn test_adaptive_condition_cognitive_stability() {
        let condition = AdaptiveCondition::CognitiveStabilityBelow(0.5);
        assert!(matches!(
            condition,
            AdaptiveCondition::CognitiveStabilityBelow(_)
        ));
    }

    #[test]
    fn test_adaptive_condition_sync_quality() {
        let condition = AdaptiveCondition::SyncQualityBelow(0.7);
        assert!(matches!(condition, AdaptiveCondition::SyncQualityBelow(_)));
    }

    #[test]
    fn test_adaptive_condition_fps() {
        let condition = AdaptiveCondition::FpsBelow(30);
        assert!(matches!(condition, AdaptiveCondition::FpsBelow(_)));
    }

    #[test]
    fn test_adaptive_condition_hash_integrity() {
        let condition = AdaptiveCondition::HashIntegrityFailed;
        assert!(matches!(condition, AdaptiveCondition::HashIntegrityFailed));
    }

    #[test]
    fn test_adaptive_condition_combined() {
        let conditions = vec![
            AdaptiveCondition::CpuLoadAbove(0.8),
            AdaptiveCondition::FpsBelow(30),
        ];
        let combined = AdaptiveCondition::Combined(conditions);
        assert!(matches!(combined, AdaptiveCondition::Combined(_)));
    }

    #[test]
    fn test_adaptive_condition_clone() {
        let condition = AdaptiveCondition::LatencyAIAbove(5000);
        let cloned = condition.clone();
        assert!(matches!(cloned, AdaptiveCondition::LatencyAIAbove(5000)));
    }

    #[test]
    fn test_adaptive_condition_serialize() {
        let condition = AdaptiveCondition::CpuLoadAbove(0.75);
        let json = serde_json::to_string(&condition).unwrap();
        assert!(json.contains("CpuLoadAbove"));
    }

    #[test]
    fn test_adaptive_condition_deserialize() {
        let json = r#"{"FpsBelow":45}"#;
        let condition: AdaptiveCondition = serde_json::from_str(json).unwrap();
        assert!(matches!(condition, AdaptiveCondition::FpsBelow(45)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests AdaptiveAction
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_adaptive_action_reduce_ai() {
        let action = AdaptiveAction::ReduceAIComplexity;
        assert!(matches!(action, AdaptiveAction::ReduceAIComplexity));
    }

    #[test]
    fn test_adaptive_action_deep_sync() {
        let action = AdaptiveAction::TriggerDeepSync;
        assert!(matches!(action, AdaptiveAction::TriggerDeepSync));
    }

    #[test]
    fn test_adaptive_action_simplify_ui() {
        let action = AdaptiveAction::SimplifyUITransitions;
        assert!(matches!(action, AdaptiveAction::SimplifyUITransitions));
    }

    #[test]
    fn test_adaptive_action_preload() {
        let action = AdaptiveAction::PreloadWebSearchDomain;
        assert!(matches!(action, AdaptiveAction::PreloadWebSearchDomain));
    }

    #[test]
    fn test_adaptive_action_reanchor() {
        let action = AdaptiveAction::ReanchorTimeline;
        assert!(matches!(action, AdaptiveAction::ReanchorTimeline));
    }

    #[test]
    fn test_adaptive_action_optimize_memory() {
        let action = AdaptiveAction::OptimizeMemoryUsage;
        assert!(matches!(action, AdaptiveAction::OptimizeMemoryUsage));
    }

    #[test]
    fn test_adaptive_action_recalibrate() {
        let action = AdaptiveAction::RecalibrateCoherence;
        assert!(matches!(action, AdaptiveAction::RecalibrateCoherence));
    }

    #[test]
    fn test_adaptive_action_stable_mode() {
        let action = AdaptiveAction::SwitchToStableMode;
        assert!(matches!(action, AdaptiveAction::SwitchToStableMode));
    }

    #[test]
    fn test_adaptive_action_custom() {
        let action = AdaptiveAction::Custom("my_action".to_string());
        if let AdaptiveAction::Custom(name) = action {
            assert_eq!(name, "my_action");
        }
    }

    #[test]
    fn test_adaptive_action_clone() {
        let action = AdaptiveAction::TriggerDeepSync;
        let cloned = action.clone();
        assert!(matches!(cloned, AdaptiveAction::TriggerDeepSync));
    }

    #[test]
    fn test_adaptive_action_debug() {
        let action = AdaptiveAction::ReduceAIComplexity;
        let debug = format!("{:?}", action);
        assert!(debug.contains("ReduceAIComplexity"));
    }

    #[test]
    fn test_adaptive_action_serialize() {
        let action = AdaptiveAction::TriggerDeepSync;
        let json = serde_json::to_string(&action).unwrap();
        assert!(json.contains("TriggerDeepSync"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests AdaptiveRule
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_adaptive_rule_creation() {
        let rule = AdaptiveRule {
            id: "test_rule".to_string(),
            name: "Test Rule".to_string(),
            condition: AdaptiveCondition::CpuLoadAbove(0.8),
            action: AdaptiveAction::ReduceAIComplexity,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        assert_eq!(rule.id, "test_rule");
        assert!(rule.enabled);
    }

    #[test]
    fn test_adaptive_rule_evaluate_disabled() {
        let rule = AdaptiveRule {
            id: "disabled".to_string(),
            name: "Disabled Rule".to_string(),
            condition: AdaptiveCondition::CpuLoadAbove(0.1),
            action: AdaptiveAction::ReduceAIComplexity,
            enabled: false,
            priority: 1,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            cpu_load: 0.9,
            ..Default::default()
        };
        assert!(!rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_latency() {
        let rule = AdaptiveRule {
            id: "latency".to_string(),
            name: "Latency Rule".to_string(),
            condition: AdaptiveCondition::LatencyAIAbove(1000),
            action: AdaptiveAction::ReduceAIComplexity,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample_high = SystemPerformanceSample {
            latency_ai: 2000,
            ..Default::default()
        };
        let sample_low = SystemPerformanceSample {
            latency_ai: 500,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample_high));
        assert!(!rule.evaluate(&sample_low));
    }

    #[test]
    fn test_adaptive_rule_evaluate_cpu() {
        let rule = AdaptiveRule {
            id: "cpu".to_string(),
            name: "CPU Rule".to_string(),
            condition: AdaptiveCondition::CpuLoadAbove(0.8),
            action: AdaptiveAction::ReduceAIComplexity,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            cpu_load: 0.9,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_memory() {
        let rule = AdaptiveRule {
            id: "mem".to_string(),
            name: "Memory Rule".to_string(),
            condition: AdaptiveCondition::MemoryUsageAbove(0.9),
            action: AdaptiveAction::OptimizeMemoryUsage,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            memory_usage: 0.95,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_cognitive() {
        let rule = AdaptiveRule {
            id: "cog".to_string(),
            name: "Cognitive Rule".to_string(),
            condition: AdaptiveCondition::CognitiveStabilityBelow(0.5),
            action: AdaptiveAction::TriggerDeepSync,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            cognitive_stability: 0.3,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_sync() {
        let rule = AdaptiveRule {
            id: "sync".to_string(),
            name: "Sync Rule".to_string(),
            condition: AdaptiveCondition::SyncQualityBelow(0.7),
            action: AdaptiveAction::ReanchorTimeline,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            sync_quality: 0.5,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_fps() {
        let rule = AdaptiveRule {
            id: "fps".to_string(),
            name: "FPS Rule".to_string(),
            condition: AdaptiveCondition::FpsBelow(30),
            action: AdaptiveAction::SimplifyUITransitions,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            ui_fps: 20,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_hash() {
        let rule = AdaptiveRule {
            id: "hash".to_string(),
            name: "Hash Rule".to_string(),
            condition: AdaptiveCondition::HashIntegrityFailed,
            action: AdaptiveAction::SwitchToStableMode,
            enabled: true,
            priority: 30,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            hash_integrity_ok: false,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_evaluate_combined() {
        let rule = AdaptiveRule {
            id: "combined".to_string(),
            name: "Combined Rule".to_string(),
            condition: AdaptiveCondition::Combined(vec![
                AdaptiveCondition::CpuLoadAbove(0.7),
                AdaptiveCondition::FpsBelow(40),
            ]),
            action: AdaptiveAction::SimplifyUITransitions,
            enabled: true,
            priority: 10,
            execution_count: 0,
        };
        let sample = SystemPerformanceSample {
            cpu_load: 0.8,
            ui_fps: 30,
            ..Default::default()
        };
        assert!(rule.evaluate(&sample));
    }

    #[test]
    fn test_adaptive_rule_clone() {
        let rule = AdaptiveRule {
            id: "test".to_string(),
            name: "Test".to_string(),
            condition: AdaptiveCondition::CpuLoadAbove(0.5),
            action: AdaptiveAction::ReduceAIComplexity,
            enabled: true,
            priority: 5,
            execution_count: 3,
        };
        let cloned = rule.clone();
        assert_eq!(cloned.id, "test");
        assert_eq!(cloned.execution_count, 3);
    }

    #[test]
    fn test_adaptive_rule_debug() {
        let rule = AdaptiveRule {
            id: "debug_test".to_string(),
            name: "Debug Test".to_string(),
            condition: AdaptiveCondition::CpuLoadAbove(0.5),
            action: AdaptiveAction::ReduceAIComplexity,
            enabled: true,
            priority: 5,
            execution_count: 0,
        };
        let debug = format!("{:?}", rule);
        assert!(debug.contains("AdaptiveRule"));
    }

    #[test]
    fn test_adaptive_rule_serialize() {
        let rule = AdaptiveRule {
            id: "ser".to_string(),
            name: "Serialize".to_string(),
            condition: AdaptiveCondition::FpsBelow(30),
            action: AdaptiveAction::SimplifyUITransitions,
            enabled: true,
            priority: 10,
            execution_count: 5,
        };
        let json = serde_json::to_string(&rule).unwrap();
        assert!(json.contains("ser"));
        assert!(json.contains("FpsBelow"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests AiPreference
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_ai_preference_aggressive() {
        let pref = AiPreference::Aggressive;
        assert!(matches!(pref, AiPreference::Aggressive));
    }

    #[test]
    fn test_ai_preference_balanced() {
        let pref = AiPreference::Balanced;
        assert!(matches!(pref, AiPreference::Balanced));
    }

    #[test]
    fn test_ai_preference_conservative() {
        let pref = AiPreference::Conservative;
        assert!(matches!(pref, AiPreference::Conservative));
    }

    #[test]
    fn test_ai_preference_clone() {
        let pref = AiPreference::Aggressive;
        let cloned = pref.clone();
        assert!(matches!(cloned, AiPreference::Aggressive));
    }

    #[test]
    fn test_ai_preference_debug() {
        let pref = AiPreference::Balanced;
        let debug = format!("{:?}", pref);
        assert!(debug.contains("Balanced"));
    }

    #[test]
    fn test_ai_preference_serialize() {
        let pref = AiPreference::Conservative;
        let json = serde_json::to_string(&pref).unwrap();
        assert!(json.contains("Conservative"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests SystemBehaviorMode
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_system_behavior_speed() {
        let mode = SystemBehaviorMode::Speed;
        assert!(matches!(mode, SystemBehaviorMode::Speed));
    }

    #[test]
    fn test_system_behavior_stability() {
        let mode = SystemBehaviorMode::Stability;
        assert!(matches!(mode, SystemBehaviorMode::Stability));
    }

    #[test]
    fn test_system_behavior_reliability() {
        let mode = SystemBehaviorMode::Reliability;
        assert!(matches!(mode, SystemBehaviorMode::Reliability));
    }

    #[test]
    fn test_system_behavior_adaptive() {
        let mode = SystemBehaviorMode::Adaptive;
        assert!(matches!(mode, SystemBehaviorMode::Adaptive));
    }

    #[test]
    fn test_system_behavior_clone() {
        let mode = SystemBehaviorMode::Speed;
        let cloned = mode.clone();
        assert!(matches!(cloned, SystemBehaviorMode::Speed));
    }

    #[test]
    fn test_system_behavior_serialize() {
        let mode = SystemBehaviorMode::Reliability;
        let json = serde_json::to_string(&mode).unwrap();
        assert!(json.contains("Reliability"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests OptimizationBias
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_optimization_bias_performance() {
        let bias = OptimizationBias::Performance;
        assert!(matches!(bias, OptimizationBias::Performance));
    }

    #[test]
    fn test_optimization_bias_consistency() {
        let bias = OptimizationBias::Consistency;
        assert!(matches!(bias, OptimizationBias::Consistency));
    }

    #[test]
    fn test_optimization_bias_user_experience() {
        let bias = OptimizationBias::UserExperience;
        assert!(matches!(bias, OptimizationBias::UserExperience));
    }

    #[test]
    fn test_optimization_bias_balanced() {
        let bias = OptimizationBias::Balanced;
        assert!(matches!(bias, OptimizationBias::Balanced));
    }

    #[test]
    fn test_optimization_bias_clone() {
        let bias = OptimizationBias::Performance;
        let cloned = bias.clone();
        assert!(matches!(cloned, OptimizationBias::Performance));
    }

    #[test]
    fn test_optimization_bias_serialize() {
        let bias = OptimizationBias::UserExperience;
        let json = serde_json::to_string(&bias).unwrap();
        assert!(json.contains("UserExperience"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests PreferenceProfile
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_preference_profile_default() {
        let profile = PreferenceProfile::default();
        assert!(matches!(profile.ai_style, AiPreference::Balanced));
        assert!(matches!(profile.system_mode, SystemBehaviorMode::Adaptive));
        assert!(matches!(
            profile.optimization_bias,
            OptimizationBias::Balanced
        ));
        assert!(profile.auto_learn);
    }

    #[test]
    fn test_preference_profile_custom() {
        let profile = PreferenceProfile {
            ai_style: AiPreference::Aggressive,
            system_mode: SystemBehaviorMode::Speed,
            optimization_bias: OptimizationBias::Performance,
            auto_learn: false,
        };
        assert!(matches!(profile.ai_style, AiPreference::Aggressive));
        assert!(!profile.auto_learn);
    }

    #[test]
    fn test_preference_profile_clone() {
        let profile = PreferenceProfile::default();
        let cloned = profile.clone();
        assert!(cloned.auto_learn);
    }

    #[test]
    fn test_preference_profile_debug() {
        let profile = PreferenceProfile::default();
        let debug = format!("{:?}", profile);
        assert!(debug.contains("PreferenceProfile"));
    }

    #[test]
    fn test_preference_profile_serialize() {
        let profile = PreferenceProfile::default();
        let json = serde_json::to_string(&profile).unwrap();
        assert!(json.contains("auto_learn"));
    }

    #[test]
    fn test_preference_profile_deserialize() {
        let json = r#"{"ai_style":"Aggressive","system_mode":"Speed","optimization_bias":"Performance","auto_learn":false}"#;
        let profile: PreferenceProfile = serde_json::from_str(json).unwrap();
        assert!(matches!(profile.ai_style, AiPreference::Aggressive));
        assert!(!profile.auto_learn);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests LearningState
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_learning_state_default() {
        let state = LearningState::default();
        assert_eq!(state.total_samples, 0);
        assert!(state.patterns_detected.is_empty());
        assert_eq!(state.optimization_cycles, 0);
        assert!(state.last_learn_timestamp.is_empty());
        assert_eq!(state.learning_rate, 0.1);
    }

    #[test]
    fn test_learning_state_custom() {
        let state = LearningState {
            total_samples: 100,
            patterns_detected: vec!["pattern1".to_string()],
            optimization_cycles: 5,
            last_learn_timestamp: "2024-01-01".to_string(),
            learning_rate: 0.05,
        };
        assert_eq!(state.total_samples, 100);
        assert_eq!(state.patterns_detected.len(), 1);
    }

    #[test]
    fn test_learning_state_clone() {
        let state = LearningState::default();
        let cloned = state.clone();
        assert_eq!(cloned.learning_rate, 0.1);
    }

    #[test]
    fn test_learning_state_debug() {
        let state = LearningState::default();
        let debug = format!("{:?}", state);
        assert!(debug.contains("LearningState"));
    }

    #[test]
    fn test_learning_state_serialize() {
        let state = LearningState::default();
        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("learning_rate"));
    }

    #[test]
    fn test_learning_state_deserialize() {
        let json = r#"{"total_samples":50,"patterns_detected":[],"optimization_cycles":2,"last_learn_timestamp":"","learning_rate":0.2}"#;
        let state: LearningState = serde_json::from_str(&json).unwrap();
        assert_eq!(state.total_samples, 50);
        assert_eq!(state.learning_rate, 0.2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests AdaptiveOptimizationEngine
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_engine_new() {
        let engine = AdaptiveOptimizationEngine::new();
        assert!(engine.performance_history.is_empty());
        assert_eq!(engine.optimization_rules.len(), 5);
        assert_eq!(engine.max_history_size, 1000);
    }

    #[test]
    fn test_engine_default() {
        let engine = AdaptiveOptimizationEngine::default();
        assert_eq!(engine.optimization_rules.len(), 5);
    }

    #[test]
    fn test_engine_capture_sample() {
        let mut engine = AdaptiveOptimizationEngine::new();
        let sample = SystemPerformanceSample::default();
        engine.capture_sample(sample);
        assert_eq!(engine.performance_history.len(), 1);
        assert_eq!(engine.learning_state.total_samples, 1);
    }

    #[test]
    fn test_engine_capture_multiple_samples() {
        let mut engine = AdaptiveOptimizationEngine::new();
        for i in 0..10 {
            let sample = SystemPerformanceSample {
                timestamp: i as u64,
                ..Default::default()
            };
            engine.capture_sample(sample);
        }
        assert_eq!(engine.performance_history.len(), 10);
        assert_eq!(engine.learning_state.total_samples, 10);
    }

    #[test]
    fn test_engine_history_limit() {
        let mut engine = AdaptiveOptimizationEngine::new();
        engine.max_history_size = 5;
        for i in 0..10 {
            let sample = SystemPerformanceSample {
                timestamp: i as u64,
                ..Default::default()
            };
            engine.capture_sample(sample);
        }
        assert_eq!(engine.performance_history.len(), 5);
    }

    #[test]
    fn test_engine_evaluate_rules_empty() {
        let mut engine = AdaptiveOptimizationEngine::new();
        let actions = engine.evaluate_rules();
        assert!(actions.is_empty());
    }

    #[test]
    fn test_engine_evaluate_rules_triggers() {
        let mut engine = AdaptiveOptimizationEngine::new();
        let sample = SystemPerformanceSample {
            latency_ai: 10000, // High latency triggers rule
            ..Default::default()
        };
        engine.capture_sample(sample);
        let actions = engine.evaluate_rules();
        assert!(!actions.is_empty());
    }

    #[test]
    fn test_engine_get_summary_empty() {
        let engine = AdaptiveOptimizationEngine::new();
        let summary = engine.get_summary();
        assert_eq!(summary.total_samples, 0);
        assert!(summary.latest_sample.is_none());
    }

    #[test]
    fn test_engine_get_summary_with_samples() {
        let mut engine = AdaptiveOptimizationEngine::new();
        for _ in 0..5 {
            engine.capture_sample(SystemPerformanceSample {
                cpu_load: 0.5,
                latency_ai: 200,
                ..Default::default()
            });
        }
        let summary = engine.get_summary();
        assert_eq!(summary.total_samples, 5);
        assert!(summary.latest_sample.is_some());
        assert_eq!(summary.avg_cpu_load, 0.5);
    }

    #[test]
    fn test_engine_clone() {
        let engine = AdaptiveOptimizationEngine::new();
        let cloned = engine.clone();
        assert_eq!(cloned.optimization_rules.len(), 5);
    }

    #[test]
    fn test_engine_debug() {
        let engine = AdaptiveOptimizationEngine::new();
        let debug = format!("{:?}", engine);
        assert!(debug.contains("AdaptiveOptimizationEngine"));
    }

    #[test]
    fn test_engine_serialize() {
        let engine = AdaptiveOptimizationEngine::new();
        let json = serde_json::to_string(&engine).unwrap();
        assert!(json.contains("optimization_rules"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests AdaptiveSummary
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_adaptive_summary_creation() {
        let summary = AdaptiveSummary {
            total_samples: 100,
            optimization_cycles: 5,
            patterns_detected: 3,
            active_rules: 4,
            avg_cpu_load: 0.45,
            avg_ai_latency: 300,
            current_mode: "Adaptive".to_string(),
            latest_sample: None,
        };
        assert_eq!(summary.total_samples, 100);
        assert_eq!(summary.active_rules, 4);
    }

    #[test]
    fn test_adaptive_summary_with_sample() {
        let summary = AdaptiveSummary {
            total_samples: 50,
            optimization_cycles: 2,
            patterns_detected: 1,
            active_rules: 5,
            avg_cpu_load: 0.3,
            avg_ai_latency: 150,
            current_mode: "Speed".to_string(),
            latest_sample: Some(SystemPerformanceSample::default()),
        };
        assert!(summary.latest_sample.is_some());
    }

    #[test]
    fn test_adaptive_summary_clone() {
        let summary = AdaptiveSummary {
            total_samples: 10,
            optimization_cycles: 1,
            patterns_detected: 0,
            active_rules: 5,
            avg_cpu_load: 0.2,
            avg_ai_latency: 100,
            current_mode: "Stability".to_string(),
            latest_sample: None,
        };
        let cloned = summary.clone();
        assert_eq!(cloned.total_samples, 10);
    }

    #[test]
    fn test_adaptive_summary_debug() {
        let summary = AdaptiveSummary {
            total_samples: 0,
            optimization_cycles: 0,
            patterns_detected: 0,
            active_rules: 0,
            avg_cpu_load: 0.0,
            avg_ai_latency: 0,
            current_mode: String::new(),
            latest_sample: None,
        };
        let debug = format!("{:?}", summary);
        assert!(debug.contains("AdaptiveSummary"));
    }

    #[test]
    fn test_adaptive_summary_serialize() {
        let summary = AdaptiveSummary {
            total_samples: 25,
            optimization_cycles: 3,
            patterns_detected: 2,
            active_rules: 5,
            avg_cpu_load: 0.6,
            avg_ai_latency: 400,
            current_mode: "Adaptive".to_string(),
            latest_sample: None,
        };
        let json = serde_json::to_string(&summary).unwrap();
        assert!(json.contains("total_samples"));
        assert!(json.contains("current_mode"));
    }

    #[test]
    fn test_adaptive_summary_deserialize() {
        let json = r#"{"total_samples":10,"optimization_cycles":2,"patterns_detected":1,"active_rules":5,"avg_cpu_load":0.4,"avg_ai_latency":200,"current_mode":"Speed","latest_sample":null}"#;
        let summary: AdaptiveSummary = serde_json::from_str(json).unwrap();
        assert_eq!(summary.total_samples, 10);
        assert_eq!(summary.current_mode, "Speed");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tests d'intégration
    // ─────────────────────────────────────────────────────────────────────────

    #[test]
    fn test_full_adaptive_workflow() {
        let mut engine = AdaptiveOptimizationEngine::new();

        // Capture normal samples
        for _ in 0..5 {
            engine.capture_sample(SystemPerformanceSample::default());
        }

        // No rules should trigger on default samples
        let actions = engine.evaluate_rules();
        // Default samples have good values, some rules might not trigger

        // Get summary
        let summary = engine.get_summary();
        assert_eq!(summary.total_samples, 5);
        assert_eq!(summary.active_rules, 5);
    }

    #[test]
    fn test_high_latency_triggers_action() {
        let mut engine = AdaptiveOptimizationEngine::new();
        let sample = SystemPerformanceSample {
            latency_ai: 6000, // Above 5000 threshold
            ..Default::default()
        };
        engine.capture_sample(sample);
        let actions = engine.evaluate_rules();
        assert!(actions
            .iter()
            .any(|a| matches!(a, AdaptiveAction::ReduceAIComplexity)));
    }

    #[test]
    fn test_low_fps_triggers_action() {
        let mut engine = AdaptiveOptimizationEngine::new();
        let sample = SystemPerformanceSample {
            ui_fps: 30, // Below 40 threshold
            ..Default::default()
        };
        engine.capture_sample(sample);
        let actions = engine.evaluate_rules();
        assert!(actions
            .iter()
            .any(|a| matches!(a, AdaptiveAction::SimplifyUITransitions)));
    }

    #[test]
    fn test_hash_failure_triggers_stable_mode() {
        let mut engine = AdaptiveOptimizationEngine::new();
        let sample = SystemPerformanceSample {
            hash_integrity_ok: false,
            ..Default::default()
        };
        engine.capture_sample(sample);
        let actions = engine.evaluate_rules();
        assert!(actions
            .iter()
            .any(|a| matches!(a, AdaptiveAction::SwitchToStableMode)));
    }
}
