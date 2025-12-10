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
