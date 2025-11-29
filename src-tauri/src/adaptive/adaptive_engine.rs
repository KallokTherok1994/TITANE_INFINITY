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
