// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS (Conversation Brain)
//   Super Prompt #13: The unified cognitive core
//   Processes messages → Produces optimal, stable, contextualized responses
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::RwLock;

use super::behavior_controller::{BehaviorController, BehaviorProfile};
use super::brain_state::{
    AffectiveState, ConstraintProfile, ConversationBrainState, ConversationMode, IntentClass,
    MemoryContext, MemoryContextItem, StyleProfile,
};
use super::coherence_controller::CoherenceController;
use super::emotion_controller::EmotionController;
use super::evolution_engine::{EvolutionEngine, EvolutionSnapshot};
use super::mode_selector::ModeSelector;
use super::reasoning::ReasoningEngine;
use super::style_controller::StyleController;

// Logging macro
macro_rules! log_info {
    ($($arg:tt)*) => {
        log::info!($($arg)*);
    };
}

macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

/// Performance targets (ms)
pub mod targets {
    pub const PROCESS_CYCLE_MS: u128 = 30;
    pub const REASONING_MS: u128 = 10;
    pub const COHERENCE_MS: u128 = 5;
}

/// Singularity OS - The unified conversation brain
#[derive(Debug)]
pub struct SingularityOS {
    /// Brain state
    state: Arc<RwLock<ConversationBrainState>>,
    /// Mode selector
    mode_selector: Arc<RwLock<ModeSelector>>,
    /// Style controller
    style_controller: Arc<RwLock<StyleController>>,
    /// Emotion controller
    emotion_controller: Arc<RwLock<EmotionController>>,
    /// Coherence controller
    coherence_controller: Arc<RwLock<CoherenceController>>,
    /// Behavior controller
    behavior_controller: Arc<RwLock<BehaviorController>>,
    /// Reasoning engine
    reasoning_engine: Arc<ReasoningEngine>,
    /// Evolution engine
    evolution_engine: Arc<RwLock<EvolutionEngine>>,
    /// Intent classifier (simplified)
    intent_classifier: Arc<IntentClassifier>,
    /// Running flag
    running: Arc<RwLock<bool>>,
}

impl SingularityOS {
    /// Create new Singularity OS
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(ConversationBrainState::new())),
            mode_selector: Arc::new(RwLock::new(ModeSelector::new())),
            style_controller: Arc::new(RwLock::new(StyleController::new())),
            emotion_controller: Arc::new(RwLock::new(EmotionController::new())),
            coherence_controller: Arc::new(RwLock::new(CoherenceController::new())),
            behavior_controller: Arc::new(RwLock::new(BehaviorController::new())),
            reasoning_engine: Arc::new(ReasoningEngine::new()),
            evolution_engine: Arc::new(RwLock::new(EvolutionEngine::new())),
            intent_classifier: Arc::new(IntentClassifier::new()),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Start the Singularity OS
    pub async fn start(&self) {
        *self.running.write().await = true;
        log_info!("🧠 [SINGULARITY-OS] Started - Conversation Brain active");
    }

    /// Stop the Singularity OS
    pub async fn stop(&self) {
        *self.running.write().await = false;
        log_info!("🛑 [SINGULARITY-OS] Stopped");
    }

    /// Main processing function - The cognitive loop
    pub async fn process(
        &self,
        user_message: &str,
        memory_context: Option<MemoryContext>,
    ) -> Result<SingularityOutput, SingularityError> {
        let start = std::time::Instant::now();

        // 1. Classify intent
        let intent = self.intent_classifier.classify(user_message);

        // 2. Select mode
        let mode = {
            let mut selector = self.mode_selector.write().await;
            selector.select_with_context(
                &intent,
                user_message.len(),
                user_message.contains('?'),
                user_message.contains("```") || user_message.contains("fn "),
                None, // Would come from sentiment analysis
            )
        };

        // 3. Get context (use provided or empty)
        let context = memory_context.unwrap_or_default();

        // 4. Run reasoning
        let reasoning_start = std::time::Instant::now();
        let reasoning_chain = self
            .reasoning_engine
            .reason(user_message, &context, mode, &intent)
            .await;
        let reasoning_duration = reasoning_start.elapsed().as_millis();

        // 5. Adjust emotions
        let affect = {
            let mut emotion_ctrl = self.emotion_controller.write().await;
            emotion_ctrl.full_adjust(mode, &intent, None)
        };

        // 6. Adapt style
        let style = {
            let mut style_ctrl = self.style_controller.write().await;
            style_ctrl.adapt(mode, &affect)
        };

        // 7. Get behavior profile
        let behavior = {
            let mut behavior_ctrl = self.behavior_controller.write().await;
            behavior_ctrl.adjust(mode, &intent)
        };

        // 8. Coherence merge
        let coherence_result = {
            let mut coherence_ctrl = self.coherence_controller.write().await;
            coherence_ctrl.merge(
                &reasoning_chain,
                &context,
                &style,
                &affect,
                &behavior.constraints,
                mode,
            )
        };

        // 9. Update brain state
        {
            let mut state = self.state.write().await;
            state.mode = mode;
            state.intent = intent.clone();
            state.affect = affect;
            state.style = style.clone();
            state.context = context.clone();
            state.reasoning_chain = reasoning_chain.clone();
            state.coherence_score = coherence_result.overall_score;
            state.message_count += 1;
            state.updated_at = chrono::Utc::now().timestamp_millis();
        }

        let total_duration = start.elapsed().as_millis();

        // 10. Update evolution
        {
            let state = self.state.read().await;
            let mut evolution = self.evolution_engine.write().await;
            evolution.update(&state, total_duration);
        }

        // 11. Check performance targets
        if total_duration > targets::PROCESS_CYCLE_MS {
            log_warn!(
                "⚠️ [SINGULARITY-OS] Process exceeded target: {}ms (target: {}ms)",
                total_duration,
                targets::PROCESS_CYCLE_MS
            );
        }

        // 12. Build output
        Ok(SingularityOutput {
            synthesis: coherence_result.synthesis,
            mode,
            intent,
            affect,
            style,
            context_used: context.items,
            reasoning_trace: reasoning_chain,
            coherence_score: coherence_result.overall_score,
            behavior_profile: behavior,
            duration_ms: total_duration,
            reasoning_ms: reasoning_duration,
            is_coherent: coherence_result.is_coherent,
            recommendations: coherence_result.recommendations,
        })
    }

    /// Quick process without full context
    pub async fn quick_process(&self, message: &str) -> Result<QuickOutput, SingularityError> {
        let start = std::time::Instant::now();

        let intent = self.intent_classifier.classify(message);
        let mode = {
            let mut selector = self.mode_selector.write().await;
            selector.select(&intent)
        };

        let reasoning = self.reasoning_engine.quick_reason(message, mode);

        Ok(QuickOutput {
            mode,
            intent,
            reasoning,
            duration_ms: start.elapsed().as_millis(),
        })
    }

    /// Get current state snapshot
    pub async fn get_state(&self) -> ConversationBrainState {
        self.state.read().await.clone()
    }

    /// Get evolution snapshot
    pub async fn get_evolution(&self) -> EvolutionSnapshot {
        self.evolution_engine.read().await.snapshot()
    }

    /// Lock to specific mode
    pub async fn lock_mode(&self, mode: ConversationMode) {
        self.mode_selector.write().await.lock_mode(mode);
    }

    /// Unlock mode
    pub async fn unlock_mode(&self) {
        self.mode_selector.write().await.unlock_mode();
    }

    /// Set constraints
    pub async fn set_constraints(&self, constraints: ConstraintProfile) {
        self.behavior_controller
            .write()
            .await
            .set_constraints(constraints);
    }

    /// Get mode distribution
    pub async fn get_mode_distribution(&self) -> std::collections::HashMap<ConversationMode, f32> {
        self.mode_selector.read().await.get_distribution()
    }

    /// Get health status
    pub async fn health(&self) -> SingularityHealth {
        let state = self.state.read().await;
        let evolution = self.evolution_engine.read().await;
        let style_ctrl = self.style_controller.read().await;
        let emotion_ctrl = self.emotion_controller.read().await;

        SingularityHealth {
            is_running: *self.running.read().await,
            coherence_score: state.coherence_score,
            evolution_level: evolution.level(),
            style_stability: style_ctrl.stability_score(),
            emotional_stability: emotion_ctrl.stability_score(),
            mode_stability: self.mode_selector.read().await.stability_score(),
            success_rate: evolution.success_rate(),
            avg_latency_ms: evolution.avg_latency(),
            cognitive_drift: evolution.metrics().cognitive_drift,
            message_count: state.message_count,
        }
    }

    /// Reset session (soft reset)
    pub async fn reset_session(&self) {
        *self.state.write().await = ConversationBrainState::new();
        self.mode_selector.write().await.reset();
        self.style_controller.write().await.reset();
        self.emotion_controller.write().await.reset();
        log_info!("🔄 [SINGULARITY-OS] Session reset");
    }
}

impl Default for SingularityOS {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for SingularityOS {
    fn clone(&self) -> Self {
        Self {
            state: Arc::clone(&self.state),
            mode_selector: Arc::clone(&self.mode_selector),
            style_controller: Arc::clone(&self.style_controller),
            emotion_controller: Arc::clone(&self.emotion_controller),
            coherence_controller: Arc::clone(&self.coherence_controller),
            behavior_controller: Arc::clone(&self.behavior_controller),
            reasoning_engine: Arc::clone(&self.reasoning_engine),
            evolution_engine: Arc::clone(&self.evolution_engine),
            intent_classifier: Arc::clone(&self.intent_classifier),
            running: Arc::clone(&self.running),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   INTENT CLASSIFIER (Simplified)
// ═══════════════════════════════════════════════════════════════

/// Simple intent classifier based on keywords
#[derive(Debug)]
pub struct IntentClassifier;

impl IntentClassifier {
    pub fn new() -> Self {
        Self
    }

    pub fn classify(&self, message: &str) -> IntentClass {
        let lower = message.to_lowercase();

        // Check for question markers
        if lower.contains('?')
            || lower.starts_with("comment")
            || lower.starts_with("qu'est")
            || lower.starts_with("pourquoi")
            || lower.starts_with("quand")
            || lower.starts_with("où")
            || lower.starts_with("qui")
            || lower.starts_with("what")
            || lower.starts_with("how")
            || lower.starts_with("why")
        {
            // Could be Query or Explanation
            if lower.contains("explique") || lower.contains("explain") {
                return IntentClass::Explanation;
            }
            return IntentClass::Query;
        }

        // Check for help requests
        if lower.contains("aide")
            || lower.contains("help")
            || lower.contains("besoin")
            || lower.contains("problème")
            || lower.contains("issue")
        {
            return IntentClass::Help;
        }

        // Check for commands
        if lower.starts_with("fais")
            || lower.starts_with("do")
            || lower.starts_with("execute")
            || lower.starts_with("run")
            || lower.starts_with("lance")
        {
            return IntentClass::Command;
        }

        // Check for creative requests
        if lower.contains("crée")
            || lower.contains("create")
            || lower.contains("génère")
            || lower.contains("generate")
            || lower.contains("imagine")
            || lower.contains("invente")
        {
            return IntentClass::Creative;
        }

        // Check for debug/technical
        if lower.contains("debug")
            || lower.contains("erreur")
            || lower.contains("error")
            || lower.contains("bug")
            || lower.contains("fix")
        {
            return IntentClass::Debug;
        }

        // Check for emotional content
        if lower.contains("je me sens")
            || lower.contains("i feel")
            || lower.contains("triste")
            || lower.contains("heureux")
            || lower.contains("anxieux")
            || lower.contains("stressed")
        {
            return IntentClass::Emotional;
        }

        // Check for meta queries
        if lower.contains("système")
            || lower.contains("system")
            || lower.contains("titane")
            || lower.contains("singularity")
            || lower.contains("comment tu fonctionne")
        {
            return IntentClass::MetaQuery;
        }

        // Check for task
        if lower.contains("faire")
            || lower.contains("task")
            || lower.contains("tâche")
            || lower.contains("project")
        {
            return IntentClass::Task;
        }

        // Default to conversation
        IntentClass::Conversation
    }
}

impl Default for IntentClassifier {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   OUTPUT TYPES
// ═══════════════════════════════════════════════════════════════

/// Full output from Singularity OS processing
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SingularityOutput {
    /// Synthesized direction
    pub synthesis: String,
    /// Selected mode
    pub mode: ConversationMode,
    /// Classified intent
    pub intent: IntentClass,
    /// Affective state
    pub affect: AffectiveState,
    /// Style profile
    pub style: StyleProfile,
    /// Context items used
    pub context_used: Vec<MemoryContextItem>,
    /// Reasoning trace (compressed)
    pub reasoning_trace: Vec<String>,
    /// Coherence score
    pub coherence_score: f32,
    /// Behavior profile
    pub behavior_profile: BehaviorProfile,
    /// Total processing duration
    pub duration_ms: u128,
    /// Reasoning duration
    pub reasoning_ms: u128,
    /// Is coherent (above threshold)
    pub is_coherent: bool,
    /// Recommendations if not coherent
    pub recommendations: Vec<String>,
}

/// Quick output for fast processing
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QuickOutput {
    pub mode: ConversationMode,
    pub intent: IntentClass,
    pub reasoning: String,
    pub duration_ms: u128,
}

/// Health status of Singularity OS
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SingularityHealth {
    pub is_running: bool,
    pub coherence_score: f32,
    pub evolution_level: f32,
    pub style_stability: f32,
    pub emotional_stability: f32,
    pub mode_stability: f32,
    pub success_rate: f32,
    pub avg_latency_ms: u128,
    pub cognitive_drift: f32,
    pub message_count: u32,
}

/// Singularity error types
#[derive(Debug, Clone)]
pub enum SingularityError {
    ProcessingError(String),
    MemoryError(String),
    CoherenceError(String),
}

impl std::fmt::Display for SingularityError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
            Self::MemoryError(msg) => write!(f, "Memory error: {}", msg),
            Self::CoherenceError(msg) => write!(f, "Coherence error: {}", msg),
        }
    }
}

impl std::error::Error for SingularityError {}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_singularity_os_creation() {
        let os = SingularityOS::new();
        let health = os.health().await;
        assert!(!health.is_running);
    }

    #[tokio::test]
    async fn test_singularity_start_stop() {
        let os = SingularityOS::new();

        os.start().await;
        assert!(*os.running.read().await);

        os.stop().await;
        assert!(!*os.running.read().await);
    }

    #[tokio::test]
    async fn test_process_message() {
        let os = SingularityOS::new();
        os.start().await;

        let result = os.process("Comment fonctionne le système?", None).await;
        assert!(result.is_ok());

        let output = result.expect("process should produce output");
        assert_eq!(output.intent, IntentClass::Query);
        assert!(output.duration_ms < 100);
    }

    #[tokio::test]
    async fn test_quick_process() {
        let os = SingularityOS::new();

        let result = os.quick_process("Aide-moi").await;
        assert!(result.is_ok());

        let output = result.expect("quick process should produce output");
        assert_eq!(output.intent, IntentClass::Help);
        assert_eq!(output.mode, ConversationMode::Coach);
    }

    #[tokio::test]
    async fn test_intent_classifier() {
        let classifier = IntentClassifier::new();

        assert_eq!(classifier.classify("Comment faire?"), IntentClass::Query);
        assert_eq!(
            classifier.classify("Aide-moi s'il te plaît"),
            IntentClass::Help
        );
        assert_eq!(classifier.classify("Crée un poème"), IntentClass::Creative);
        assert_eq!(
            classifier.classify("Debug cette erreur"),
            IntentClass::Debug
        );
    }

    #[tokio::test]
    async fn test_mode_locking() {
        let os = SingularityOS::new();

        os.lock_mode(ConversationMode::Expert).await;

        let result = os
            .quick_process("Je me sens triste")
            .await
            .expect("quick process should honor locked mode");
        // Despite emotional content, should stay Expert
        assert_eq!(result.mode, ConversationMode::Expert);

        os.unlock_mode().await;
    }

    #[tokio::test]
    async fn test_evolution_updates() {
        let os = SingularityOS::new();
        os.start().await;

        // Process a few messages
        for _ in 0..3 {
            let _ = os.process("Test message", None).await;
        }

        let evolution = os.get_evolution().await;
        assert!(evolution.total_interactions >= 3);
        assert!(evolution.xp > 0.0);
    }

    #[tokio::test]
    async fn test_health_metrics() {
        let os = SingularityOS::new();
        os.start().await;

        let _ = os.process("Test coherence", None).await;

        let health = os.health().await;
        assert!(health.is_running);
        assert!(health.coherence_score > 0.0);
        assert!(health.message_count >= 1);
    }

    #[tokio::test]
    async fn test_session_reset() {
        let os = SingularityOS::new();
        os.start().await;

        let _ = os.process("Test", None).await;

        os.reset_session().await;

        let state = os.get_state().await;
        assert_eq!(state.message_count, 0);
    }
}
