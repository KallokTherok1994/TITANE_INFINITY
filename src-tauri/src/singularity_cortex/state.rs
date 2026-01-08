// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Singularity State v∞
//   SUPER PROMPT #7 — Persistent Global Brain
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Singularity State — Le cerveau global persistant de TITANE∞
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityState {
    pub identity: SingularityIdentity,
    pub long_context: VecDeque<String>,
    pub conversation_signature: String,
    pub global_mode: CognitiveMode,
    pub last_activity: i64,
    pub coherence_level: f32,
    pub affective_tone: f32,
    pub total_interactions: u64,
    pub session_duration_ms: u64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityIdentity {
    pub name: String,
    pub version: String,
    pub style_core: String,
    pub persona: String,
    pub constraints: Vec<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum CognitiveMode {
    Coach,
    Architect,
    Analyst,
    Meta,
    Observer,
    Expert,
}

impl SingularityState {
    pub fn new() -> Self {
        Self {
            identity: SingularityIdentity::default(),
            long_context: VecDeque::with_capacity(100),
            conversation_signature: Self::generate_initial_signature(),
            global_mode: CognitiveMode::Coach,
            last_activity: chrono::Utc::now().timestamp_millis(),
            coherence_level: 1.0,
            affective_tone: 0.0,
            total_interactions: 0,
            session_duration_ms: 0,
            created_at: chrono::Utc::now().timestamp_millis(),
        }
    }

    pub fn update_signature(&mut self) {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        for ctx in self.long_context.iter().take(10) {
            ctx.hash(&mut hasher);
        }
        format!("{:?}", self.global_mode).hash(&mut hasher);
        format!("{:.2}_{:.2}", self.coherence_level, self.affective_tone).hash(&mut hasher);

        let hash = hasher.finish();
        self.conversation_signature = format!("TITANE-{:016x}", hash);
    }

    pub fn adjust_mode(&mut self, mode: CognitiveMode) {
        if self.global_mode != mode {
            self.global_mode = mode;
            self.update_signature();
        }
    }

    pub fn push_context(&mut self, item: String) {
        if self.long_context.len() >= 100 {
            self.long_context.pop_front();
        }
        self.long_context.push_back(item);
        self.update_signature();
    }

    pub fn get_recent_context(&self, n: usize) -> Vec<String> {
        self.long_context
            .iter()
            .rev()
            .take(n)
            .cloned()
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect()
    }

    pub fn update_coherence(&mut self, level: f32) {
        self.coherence_level = level.clamp(0.0, 1.0);
    }

    pub fn update_affective_tone(&mut self, tone: f32) {
        self.affective_tone = tone.clamp(-1.0, 1.0);
    }

    pub fn increment_interactions(&mut self) {
        self.total_interactions += 1;
        self.last_activity = chrono::Utc::now().timestamp_millis();
        self.update_session_duration();
    }

    fn update_session_duration(&mut self) {
        let now = chrono::Utc::now().timestamp_millis();
        self.session_duration_ms = (now - self.created_at) as u64;
    }

    pub fn stats(&self) -> SingularityStats {
        SingularityStats {
            total_interactions: self.total_interactions,
            session_duration_ms: self.session_duration_ms,
            coherence_level: self.coherence_level,
            affective_tone: self.affective_tone,
            context_size: self.long_context.len(),
            mode: self.global_mode,
            signature: self.conversation_signature.clone(),
        }
    }

    pub fn reset(&mut self) {
        self.long_context.clear();
        self.conversation_signature = Self::generate_initial_signature();
        self.global_mode = CognitiveMode::Coach;
        self.coherence_level = 1.0;
        self.affective_tone = 0.0;
        self.total_interactions = 0;
        self.session_duration_ms = 0;
        self.created_at = chrono::Utc::now().timestamp_millis();
        self.last_activity = self.created_at;
    }

    fn generate_initial_signature() -> String {
        let timestamp = chrono::Utc::now().timestamp_millis();
        format!("TITANE-{:016x}", timestamp)
    }
}

impl Default for SingularityIdentity {
    fn default() -> Self {
        Self {
            name: "TITANE∞".to_string(),
            version: "v∞".to_string(),
            style_core: "Précis, structuré, cognitif, évolutif".to_string(),
            persona: "Assistant IA local-first, privacy-first, auto-adaptatif".to_string(),
            constraints: vec![
                "Toujours respecter la vie privée utilisateur".to_string(),
                "Ne jamais partager de données sans consentement".to_string(),
                "Maintenir cohérence conversationnelle".to_string(),
                "Éviter les dérives tonales".to_string(),
                "Opérer uniquement en local".to_string(),
            ],
        }
    }
}

impl Default for SingularityState {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Display for CognitiveMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CognitiveMode::Coach => write!(f, "Coach"),
            CognitiveMode::Architect => write!(f, "Architect"),
            CognitiveMode::Analyst => write!(f, "Analyst"),
            CognitiveMode::Meta => write!(f, "Meta"),
            CognitiveMode::Observer => write!(f, "Observer"),
            CognitiveMode::Expert => write!(f, "Expert"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityStats {
    pub total_interactions: u64,
    pub session_duration_ms: u64,
    pub coherence_level: f32,
    pub affective_tone: f32,
    pub context_size: usize,
    pub mode: CognitiveMode,
    pub signature: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_singularity_state_new() {
        let state = SingularityState::new();
        assert_eq!(state.identity.name, "TITANE∞");
        assert_eq!(state.total_interactions, 0);
        assert_eq!(state.coherence_level, 1.0);
        assert_eq!(state.affective_tone, 0.0);
        assert_eq!(state.global_mode, CognitiveMode::Coach);
    }

    #[test]
    fn test_cognitive_mode_equality() {
        assert_eq!(CognitiveMode::Coach, CognitiveMode::Coach);
        assert_ne!(CognitiveMode::Coach, CognitiveMode::Architect);
    }

    #[test]
    fn test_cognitive_mode_display() {
        assert_eq!(format!("{}", CognitiveMode::Coach), "Coach");
        assert_eq!(format!("{}", CognitiveMode::Architect), "Architect");
        assert_eq!(format!("{}", CognitiveMode::Analyst), "Analyst");
        assert_eq!(format!("{}", CognitiveMode::Meta), "Meta");
        assert_eq!(format!("{}", CognitiveMode::Observer), "Observer");
        assert_eq!(format!("{}", CognitiveMode::Expert), "Expert");
    }

    #[test]
    fn test_adjust_mode() {
        let mut state = SingularityState::new();
        let initial_signature = state.conversation_signature.clone();

        state.adjust_mode(CognitiveMode::Architect);
        assert_eq!(state.global_mode, CognitiveMode::Architect);
        assert_ne!(state.conversation_signature, initial_signature);
    }

    #[test]
    fn test_adjust_mode_same_no_signature_change() {
        let mut state = SingularityState::new();
        state.adjust_mode(CognitiveMode::Expert);
        let signature_after_first = state.conversation_signature.clone();

        state.adjust_mode(CognitiveMode::Expert);
        assert_eq!(state.conversation_signature, signature_after_first);
    }

    #[test]
    fn test_push_context() {
        let mut state = SingularityState::new();

        state.push_context("Test 1".to_string());
        state.push_context("Test 2".to_string());

        assert_eq!(state.long_context.len(), 2);
        assert_eq!(state.long_context[0], "Test 1");
        assert_eq!(state.long_context[1], "Test 2");
    }

    #[test]
    fn test_push_context_max_capacity() {
        let mut state = SingularityState::new();

        // Push 101 items (max is 100)
        for i in 0..101 {
            state.push_context(format!("Context {}", i));
        }

        assert_eq!(state.long_context.len(), 100);
        // First item should be removed
        assert_eq!(state.long_context[0], "Context 1");
        assert_eq!(state.long_context[99], "Context 100");
    }

    #[test]
    fn test_get_recent_context() {
        let mut state = SingularityState::new();

        for i in 0..5 {
            state.push_context(format!("Item {}", i));
        }

        let recent = state.get_recent_context(3);
        assert_eq!(recent.len(), 3);
        assert_eq!(recent[0], "Item 2");
        assert_eq!(recent[1], "Item 3");
        assert_eq!(recent[2], "Item 4");
    }

    #[test]
    fn test_get_recent_context_more_than_available() {
        let mut state = SingularityState::new();
        state.push_context("A".to_string());
        state.push_context("B".to_string());

        let recent = state.get_recent_context(10);
        assert_eq!(recent.len(), 2);
    }

    #[test]
    fn test_update_coherence() {
        let mut state = SingularityState::new();

        state.update_coherence(0.5);
        assert_eq!(state.coherence_level, 0.5);

        // Test clamping
        state.update_coherence(1.5);
        assert_eq!(state.coherence_level, 1.0);

        state.update_coherence(-0.5);
        assert_eq!(state.coherence_level, 0.0);
    }

    #[test]
    fn test_update_affective_tone() {
        let mut state = SingularityState::new();

        state.update_affective_tone(0.7);
        assert_eq!(state.affective_tone, 0.7);

        // Test clamping
        state.update_affective_tone(2.0);
        assert_eq!(state.affective_tone, 1.0);

        state.update_affective_tone(-2.0);
        assert_eq!(state.affective_tone, -1.0);
    }

    #[test]
    fn test_increment_interactions() {
        let mut state = SingularityState::new();
        let initial_count = state.total_interactions;
        let initial_activity = state.last_activity;

        std::thread::sleep(std::time::Duration::from_millis(10));
        state.increment_interactions();

        assert_eq!(state.total_interactions, initial_count + 1);
        assert!(state.last_activity > initial_activity);
        assert!(state.session_duration_ms > 0);
    }

    #[test]
    fn test_stats() {
        let mut state = SingularityState::new();
        state.push_context("Test".to_string());
        state.increment_interactions();
        state.update_coherence(0.8);
        state.update_affective_tone(0.3);

        let stats = state.stats();
        assert_eq!(stats.total_interactions, 1);
        assert_eq!(stats.coherence_level, 0.8);
        assert_eq!(stats.affective_tone, 0.3);
        assert_eq!(stats.context_size, 1);
        assert_eq!(stats.mode, CognitiveMode::Coach);
    }

    #[test]
    fn test_reset() {
        let mut state = SingularityState::new();

        state.push_context("Test".to_string());
        state.increment_interactions();
        state.update_coherence(0.5);
        state.update_affective_tone(0.5);
        state.adjust_mode(CognitiveMode::Expert);

        state.reset();

        assert_eq!(state.long_context.len(), 0);
        assert_eq!(state.global_mode, CognitiveMode::Coach);
        assert_eq!(state.coherence_level, 1.0);
        assert_eq!(state.affective_tone, 0.0);
        assert_eq!(state.total_interactions, 0);
        assert_eq!(state.session_duration_ms, 0);
    }

    #[test]
    fn test_signature_generation() {
        let sig1 = SingularityState::generate_initial_signature();
        std::thread::sleep(std::time::Duration::from_millis(2));
        let sig2 = SingularityState::generate_initial_signature();

        assert!(sig1.starts_with("TITANE-"));
        assert!(sig2.starts_with("TITANE-"));
        assert_ne!(sig1, sig2); // Should be different due to timestamp
    }

    #[test]
    fn test_update_signature_changes() {
        let mut state = SingularityState::new();
        let initial = state.conversation_signature.clone();

        state.push_context("New context".to_string());
        assert_ne!(state.conversation_signature, initial);
    }

    #[test]
    fn test_singularity_identity_default() {
        let identity = SingularityIdentity::default();
        assert_eq!(identity.name, "TITANE∞");
        assert_eq!(identity.version, "v∞");
        assert_eq!(identity.constraints.len(), 5);
    }

    #[test]
    fn test_singularity_state_default() {
        let state = SingularityState::default();
        assert_eq!(state.global_mode, CognitiveMode::Coach);
        assert_eq!(state.total_interactions, 0);
    }
}
