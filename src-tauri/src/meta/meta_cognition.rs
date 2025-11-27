// TITANE∞ v18 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

//! META-COGNITION ENGINE
//!
//! Implements cognitive self-awareness and self-evaluation:
//! - Observes outputs from CognitiveEngine, TimelineEngine, MemoryEngine, AIRouter
//! - Compares current state vs previous/baseline/projected states
//! - Detects contradictions, cognitive drift, emotional anomalies
//! - Produces self-evaluation reports with confidence scores
//! - Proposes regulation actions (stabilization, realignment, correction)

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

/// Meta-cognitive self-evaluation report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaCognitiveReport {
    /// Timestamp of evaluation
    pub timestamp: u64,

    /// Overall cognitive coherence (0.0 = chaos, 1.0 = perfect)
    pub coherence_score: f32,

    /// Confidence in current cognitive state
    pub confidence: f32,

    /// Whether anomaly was detected
    pub anomaly_detected: bool,

    /// Required adjustment description (if any)
    pub required_adjustment: Option<String>,

    /// Delta map: engine_name → deviation score
    pub delta_map: HashMap<String, f32>,

    /// Engine alignment status: engine_name → is_aligned
    pub engine_alignment: HashMap<String, bool>,

    /// Recommended next action
    pub recommended_next_state: Option<DeepSyncAction>,

    /// Detected issues
    pub detected_issues: Vec<CognitiveIssue>,

    /// Cognitive health indicators
    pub health_indicators: CognitiveHealthIndicators,
}

/// Cognitive issue detected by meta-cognition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveIssue {
    pub severity: IssueSeverity,
    pub category: IssueCategory,
    pub description: String,
    pub affected_engines: Vec<String>,
    pub suggested_fix: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueCategory {
    Contradiction,
    CognitiveDrift,
    EmotionalAnomaly,
    TemporalInconsistency,
    MemoryDivergence,
    LogicViolation,
    SyncDesynchronization,
}

/// Cognitive health indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveHealthIndicators {
    /// Stability score (0.0 = unstable, 1.0 = stable)
    pub stability: f32,

    /// Consistency across engines
    pub consistency: f32,

    /// Logical integrity
    pub logic_integrity: f32,

    /// Temporal coherence
    pub temporal_coherence: f32,

    /// Memory alignment
    pub memory_alignment: f32,

    /// Overall health (0.0 = critical, 1.0 = optimal)
    pub overall_health: f32,
}

/// Recommended deep sync action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeepSyncAction {
    /// No action needed
    None,

    /// Stabilize cognitive state
    StabilizeCognitive,

    /// Reanchor memory
    ReanchorMemory,

    /// Realign engines
    RealignEngines(Vec<String>),

    /// Correct timeline
    CorrectTimeline,

    /// Recalibrate AI router
    RecalibrateAI,

    /// Full deep sync
    FullDeepSync,

    /// Emergency reset
    EmergencyReset,
}

/// Cognitive regulation strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CognitiveRegulationStrategy {
    /// Gradual adjustment
    Gradual,

    /// Immediate correction
    Immediate,

    /// Phased realignment
    Phased(Vec<String>),

    /// Wait and observe
    WaitAndObserve,
}

/// Meta-cognition engine state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaCognitionState {
    pub last_evaluation: Option<MetaCognitiveReport>,
    pub evaluation_count: u64,
    pub anomaly_count: u64,
    pub correction_count: u64,
    pub average_coherence: f32,
    pub baseline_established: bool,
}

impl Default for MetaCognitionState {
    fn default() -> Self {
        Self::new()
    }
}

impl MetaCognitionState {
    pub fn new() -> Self {
        Self {
            last_evaluation: None,
            evaluation_count: 0,
            anomaly_count: 0,
            correction_count: 0,
            average_coherence: 0.0,
            baseline_established: false,
        }
    }
}

/// Meta-cognition engine
pub struct MetaCognitionEngine {
    state: MetaCognitionState,
    baseline_coherence: f32,
    deviation_threshold: f32,
}

impl Default for MetaCognitionEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl MetaCognitionEngine {
    pub fn new() -> Self {
        Self {
            state: MetaCognitionState::new(),
            baseline_coherence: 0.85, // Default baseline
            deviation_threshold: 0.15, // 15% deviation triggers anomaly
        }
    }

    /// Perform meta-cognitive evaluation
    pub async fn evaluate(
        &mut self,
        cognitive_state: &CognitiveSnapshot,
    ) -> MetaCognitiveReport {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        // Compute coherence score
        let coherence_score = self.compute_coherence(cognitive_state);

        // Detect anomalies
        let (anomaly_detected, detected_issues) = self.detect_anomalies(cognitive_state, coherence_score);

        // Compute deltas
        let delta_map = self.compute_deltas(cognitive_state);

        // Check engine alignment
        let engine_alignment = self.check_engine_alignment(cognitive_state);

        // Determine required adjustment
        let required_adjustment = if anomaly_detected {
            Some(self.determine_adjustment(&detected_issues))
        } else {
            None
        };

        // Recommend next action
        let recommended_next_state = self.recommend_action(
            coherence_score,
            anomaly_detected,
            &detected_issues,
        );

        // Compute health indicators
        let health_indicators = self.compute_health_indicators(cognitive_state);

        // Compute confidence
        let confidence = self.compute_confidence(coherence_score, &health_indicators);

        // Update state
        self.state.evaluation_count += 1;
        if anomaly_detected {
            self.state.anomaly_count += 1;
        }

        // Update average coherence
        let alpha = 0.2; // Smoothing factor
        self.state.average_coherence = alpha * coherence_score + (1.0 - alpha) * self.state.average_coherence;

        let report = MetaCognitiveReport {
            timestamp,
            coherence_score,
            confidence,
            anomaly_detected,
            required_adjustment,
            delta_map,
            engine_alignment,
            recommended_next_state,
            detected_issues,
            health_indicators,
        };

        self.state.last_evaluation = Some(report.clone());

        log::info!(
            "🧠 Meta-cognition evaluation: coherence={:.2}, confidence={:.2}, anomalies={}",
            coherence_score,
            confidence,
            if anomaly_detected { "detected" } else { "none" }
        );

        report
    }

    /// Compute overall coherence score
    fn compute_coherence(&self, snapshot: &CognitiveSnapshot) -> f32 {
        let mut score = 0.0;
        let mut count = 0.0;

        // Cognitive integrity
        if let Some(cog) = &snapshot.cognitive_integrity {
            score += cog;
            count += 1.0;
        }

        // Timeline coherence
        if let Some(timeline) = &snapshot.timeline_coherence {
            score += timeline;
            count += 1.0;
        }

        // Memory alignment
        if let Some(memory) = &snapshot.memory_alignment {
            score += memory;
            count += 1.0;
        }

        // AI router stability
        if let Some(ai) = &snapshot.ai_stability {
            score += ai;
            count += 1.0;
        }

        // Singularity coherence
        if let Some(sing) = &snapshot.singularity_coherence {
            score += sing;
            count += 1.0;
        }

        if count > 0.0 {
            (score / count).clamp(0.0, 1.0)
        } else {
            0.5 // Neutral if no data
        }
    }

    /// Detect cognitive anomalies
    fn detect_anomalies(
        &self,
        snapshot: &CognitiveSnapshot,
        coherence: f32,
    ) -> (bool, Vec<CognitiveIssue>) {
        let mut issues = Vec::new();

        // Check coherence deviation
        if (coherence - self.baseline_coherence).abs() > self.deviation_threshold {
            issues.push(CognitiveIssue {
                severity: if coherence < 0.5 {
                    IssueSeverity::Critical
                } else {
                    IssueSeverity::Medium
                },
                category: IssueCategory::CognitiveDrift,
                description: format!(
                    "Coherence deviated from baseline: {:.2} vs {:.2}",
                    coherence, self.baseline_coherence
                ),
                affected_engines: vec!["all".to_string()],
                suggested_fix: Some("Perform deep sync".to_string()),
            });
        }

        // Check emotional bounds (if present)
        if let Some(emotion) = &snapshot.emotion_state {
            if *emotion < 0.0 || *emotion > 1.0 {
                issues.push(CognitiveIssue {
                    severity: IssueSeverity::High,
                    category: IssueCategory::EmotionalAnomaly,
                    description: format!("Emotion out of bounds: {:.2}", emotion),
                    affected_engines: vec!["emotion".to_string()],
                    suggested_fix: Some("Clamp and recalibrate emotion engine".to_string()),
                });
            }
        }

        // Check temporal consistency
        if let Some(timeline) = &snapshot.timeline_coherence {
            if *timeline < 0.6 {
                issues.push(CognitiveIssue {
                    severity: IssueSeverity::Medium,
                    category: IssueCategory::TemporalInconsistency,
                    description: "Timeline coherence below threshold".to_string(),
                    affected_engines: vec!["timeline".to_string()],
                    suggested_fix: Some("Realign timeline with memory".to_string()),
                });
            }
        }

        // Check memory-cognitive alignment
        if let (Some(cog), Some(mem)) = (&snapshot.cognitive_integrity, &snapshot.memory_alignment) {
            let delta = (cog - mem).abs();
            if delta > 0.3 {
                issues.push(CognitiveIssue {
                    severity: IssueSeverity::Medium,
                    category: IssueCategory::MemoryDivergence,
                    description: format!("Cognitive-memory divergence: {:.2}", delta),
                    affected_engines: vec!["cognitive".to_string(), "memory".to_string()],
                    suggested_fix: Some("Reanchor memory to current cognitive state".to_string()),
                });
            }
        }

        let anomaly_detected = !issues.is_empty();
        (anomaly_detected, issues)
    }

    /// Compute deltas between engines
    fn compute_deltas(&self, snapshot: &CognitiveSnapshot) -> HashMap<String, f32> {
        let mut deltas = HashMap::new();

        if let Some(cog) = &snapshot.cognitive_integrity {
            let delta = (cog - self.baseline_coherence).abs();
            deltas.insert("cognitive".to_string(), delta);
        }

        if let Some(timeline) = &snapshot.timeline_coherence {
            let delta = (timeline - self.baseline_coherence).abs();
            deltas.insert("timeline".to_string(), delta);
        }

        if let Some(memory) = &snapshot.memory_alignment {
            let delta = (memory - self.baseline_coherence).abs();
            deltas.insert("memory".to_string(), delta);
        }

        if let Some(ai) = &snapshot.ai_stability {
            let delta = (ai - self.baseline_coherence).abs();
            deltas.insert("ai_router".to_string(), delta);
        }

        deltas
    }

    /// Check engine alignment
    fn check_engine_alignment(&self, snapshot: &CognitiveSnapshot) -> HashMap<String, bool> {
        let mut alignment = HashMap::new();

        if let Some(cog) = &snapshot.cognitive_integrity {
            alignment.insert("cognitive".to_string(), *cog >= 0.7);
        }

        if let Some(timeline) = &snapshot.timeline_coherence {
            alignment.insert("timeline".to_string(), *timeline >= 0.7);
        }

        if let Some(memory) = &snapshot.memory_alignment {
            alignment.insert("memory".to_string(), *memory >= 0.7);
        }

        if let Some(ai) = &snapshot.ai_stability {
            alignment.insert("ai_router".to_string(), *ai >= 0.7);
        }

        if let Some(sing) = &snapshot.singularity_coherence {
            alignment.insert("singularity".to_string(), *sing >= 0.7);
        }

        alignment
    }

    /// Determine required adjustment
    fn determine_adjustment(&self, issues: &[CognitiveIssue]) -> String {
        if issues.is_empty() {
            return "No adjustment needed".to_string();
        }

        let critical_count = issues.iter().filter(|i| matches!(i.severity, IssueSeverity::Critical)).count();

        if critical_count > 0 {
            "Emergency realignment required".to_string()
        } else {
            format!("Gradual correction recommended ({} issues)", issues.len())
        }
    }

    /// Recommend next action
    fn recommend_action(
        &self,
        coherence: f32,
        anomaly_detected: bool,
        issues: &[CognitiveIssue],
    ) -> Option<DeepSyncAction> {
        if !anomaly_detected {
            return Some(DeepSyncAction::None);
        }

        // Critical coherence
        if coherence < 0.5 {
            return Some(DeepSyncAction::EmergencyReset);
        }

        // Check issue categories
        let has_memory_issue = issues.iter().any(|i| matches!(i.category, IssueCategory::MemoryDivergence));
        let has_timeline_issue = issues.iter().any(|i| matches!(i.category, IssueCategory::TemporalInconsistency));
        let has_sync_issue = issues.iter().any(|i| matches!(i.category, IssueCategory::SyncDesynchronization));

        if has_memory_issue {
            Some(DeepSyncAction::ReanchorMemory)
        } else if has_timeline_issue {
            Some(DeepSyncAction::CorrectTimeline)
        } else if has_sync_issue || issues.len() > 3 {
            Some(DeepSyncAction::FullDeepSync)
        } else {
            Some(DeepSyncAction::StabilizeCognitive)
        }
    }

    /// Compute health indicators
    fn compute_health_indicators(&self, snapshot: &CognitiveSnapshot) -> CognitiveHealthIndicators {
        let stability = snapshot.cognitive_integrity.unwrap_or(0.5);
        let consistency = snapshot.timeline_coherence.unwrap_or(0.5);
        let logic_integrity = snapshot.singularity_coherence.unwrap_or(0.5);
        let temporal_coherence = snapshot.timeline_coherence.unwrap_or(0.5);
        let memory_alignment = snapshot.memory_alignment.unwrap_or(0.5);

        let overall_health = (stability + consistency + logic_integrity + temporal_coherence + memory_alignment) / 5.0;

        CognitiveHealthIndicators {
            stability,
            consistency,
            logic_integrity,
            temporal_coherence,
            memory_alignment,
            overall_health,
        }
    }

    /// Compute confidence score
    fn compute_confidence(&self, coherence: f32, health: &CognitiveHealthIndicators) -> f32 {
        // Confidence based on coherence and health
        let base_confidence = (coherence + health.overall_health) / 2.0;

        // Reduce confidence if evaluation history is unstable
        let history_factor = if self.state.evaluation_count > 10 {
            let anomaly_rate = self.state.anomaly_count as f32 / self.state.evaluation_count as f32;
            1.0 - (anomaly_rate * 0.5) // Max 50% reduction
        } else {
            0.9 // Lower confidence if not enough history
        };

        (base_confidence * history_factor).clamp(0.0, 1.0)
    }

    /// Get current state
    pub fn get_state(&self) -> &MetaCognitionState {
        &self.state
    }

    /// Get baseline coherence
    pub fn get_baseline(&self) -> f32 {
        self.baseline_coherence
    }

    /// Establish new baseline
    pub fn establish_baseline(&mut self, coherence: f32) {
        self.baseline_coherence = coherence.clamp(0.0, 1.0);
        self.state.baseline_established = true;
        log::info!("🧠 Meta-cognition baseline established: {:.2}", self.baseline_coherence);
    }

    /// META v18.1: Self-test du META-COGNITION ENGINE
    ///
    /// Vérifie la cohérence interne du moteur:
    /// 1. Baseline établie
    /// 2. Threshold valides
    /// 3. Évaluation stable (no NaN/Inf)
    /// 4. Détection anomalies fonctionnelle
    /// 5. État interne cohérent
    ///
    /// Retourne: (success, issues)
    pub async fn meta_selftest(&mut self) -> (bool, Vec<String>) {
        let mut issues = Vec::new();

        // [1] Vérifier baseline
        if !self.state.baseline_established {
            issues.push("Baseline not established".to_string());
        }
        if self.baseline_coherence < 0.0 || self.baseline_coherence > 1.0 {
            issues.push(format!("Invalid baseline: {}", self.baseline_coherence));
        }

        // [2] Vérifier thresholds
        if self.deviation_threshold < 0.0 || self.deviation_threshold > 1.0 {
            issues.push(format!("Invalid deviation_threshold: {}", self.deviation_threshold));
        }

        // [3] Test évaluation avec snapshot valide
        let test_snapshot = CognitiveSnapshot {
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            cognitive_integrity: Some(0.9),
            timeline_coherence: Some(0.85),
            memory_alignment: Some(0.88),
            ai_stability: Some(0.92),
            singularity_coherence: Some(0.87),
            emotion_state: Some(0.75),
        };

        let report = self.evaluate(&test_snapshot).await;

        // [4] Vérifier résultats valides (no NaN/Inf)
        if !report.coherence_score.is_finite() {
            issues.push("Coherence score is NaN/Inf".to_string());
        }
        if !report.confidence.is_finite() {
            issues.push("Confidence is NaN/Inf".to_string());
        }

        // [5] Vérifier détection anomalies fonctionnelle
        let critical_snapshot = CognitiveSnapshot {
            timestamp: test_snapshot.timestamp,
            cognitive_integrity: Some(0.2),
            timeline_coherence: Some(0.3),
            memory_alignment: Some(0.2),
            ai_stability: Some(0.3),
            singularity_coherence: Some(0.3),
            emotion_state: Some(0.1), // Anomalie émotionnelle
        };

        let critical_report = self.evaluate(&critical_snapshot).await;
        if !critical_report.anomaly_detected {
            issues.push("Anomaly detection failed for critical snapshot".to_string());
        }

        // [6] Vérifier cohérence état interne
        if self.state.evaluation_count < self.state.anomaly_count {
            issues.push("State inconsistency: anomaly_count > evaluation_count".to_string());
        }

        let success = issues.is_empty();
        if success {
            log::info!("✅ META-COGNITION ENGINE self-test: PASSED");
        } else {
            log::error!("❌ META-COGNITION ENGINE self-test: FAILED ({})", issues.len());
            for issue in &issues {
                log::error!("   • {}", issue);
            }
        }

        (success, issues)
    }
}

/// Snapshot of cognitive state for evaluation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveSnapshot {
    pub timestamp: u64,
    pub cognitive_integrity: Option<f32>,
    pub timeline_coherence: Option<f32>,
    pub memory_alignment: Option<f32>,
    pub ai_stability: Option<f32>,
    pub singularity_coherence: Option<f32>,
    pub emotion_state: Option<f32>,
}

impl Default for CognitiveSnapshot {
    fn default() -> Self {
        Self::new()
    }
}

impl CognitiveSnapshot {
    pub fn new() -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        Self {
            timestamp,
            cognitive_integrity: None,
            timeline_coherence: None,
            memory_alignment: None,
            ai_stability: None,
            singularity_coherence: None,
            emotion_state: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_meta_cognition_basic() {
        let mut engine = MetaCognitionEngine::new();

        let snapshot = CognitiveSnapshot {
            cognitive_integrity: Some(0.9),
            timeline_coherence: Some(0.85),
            memory_alignment: Some(0.88),
            ai_stability: Some(0.92),
            singularity_coherence: Some(0.87),
            ..Default::default()
        };

        let report = engine.evaluate(&snapshot).await;

        assert!(report.coherence_score > 0.8);
        assert!(report.confidence > 0.0);
        assert!(!report.anomaly_detected);
    }

    #[tokio::test]
    async fn test_anomaly_detection() {
        let mut engine = MetaCognitionEngine::new();

        // Critical coherence
        let snapshot = CognitiveSnapshot {
            cognitive_integrity: Some(0.3),
            timeline_coherence: Some(0.4),
            ..Default::default()
        };

        let report = engine.evaluate(&snapshot).await;

        assert!(report.anomaly_detected);
        assert!(!report.detected_issues.is_empty());
    }

    #[tokio::test]
    async fn test_baseline_establishment() {
        let mut engine = MetaCognitionEngine::new();

        engine.establish_baseline(0.9);

        assert_eq!(engine.baseline_coherence, 0.9);
        assert!(engine.state.baseline_established);
    }

    #[tokio::test]
    async fn test_meta_selftest() {
        let mut engine = MetaCognitionEngine::new();

        // Établir baseline d'abord
        engine.establish_baseline(0.85);

        let (success, issues) = engine.meta_selftest().await;

        assert!(success, "Meta selftest failed: {:?}", issues);
        assert_eq!(issues.len(), 0);
    }
}
