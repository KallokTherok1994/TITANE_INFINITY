// ═══════════════════════════════════════════════════════════════
//   OMEGA CONTEXT v2 — Enriched with Memory OS
//   SUPER PROMPT #8: Multimodal + Memory Bridge + Adaptive
// ═══════════════════════════════════════════════════════════════

use crate::core::modules::unified_memory::MemoryItem;
use crate::memory_os::types::VectorSearchResult;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// System health snapshot (simplified)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthSnapshot {
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub timestamp: i64,
}

/// OMEGA Context v2 (Enhanced)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaContextV2 {
    /// Input (multimodal)
    pub input: OmegaInput,
    
    /// STM context (exact matches)
    pub memory_stm: Vec<MemoryItem>,
    
    /// MTM context (exact matches)
    pub memory_mtm: Vec<MemoryItem>,
    
    /// LTM context (exact matches)
    pub memory_ltm: Vec<MemoryItem>,
    
    /// Vector search results (semantic matches)
    pub memory_vector: Vec<VectorSearchResult>,
    
    /// System health snapshot
    pub system_state: Option<SystemHealthSnapshot>,
    
    /// Engine states
    pub engine_states: HashMap<String, EngineState>,
    
    /// Metadata
    pub metadata: OmegaMetadata,
    
    /// Pipeline stage
    pub current_stage: String,
    
    /// Accumulated results
    pub accumulated_results: Vec<StageResult>,
}

/// Multimodal Input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OmegaInput {
    /// Text input
    Text(String),
    
    /// Voice input (transcribed + audio metadata)
    Voice {
        transcript: String,
        confidence: f32,
        duration_ms: u64,
        language: String,
    },
    
    /// System command
    Command(OmegaCommand),
    
    /// System event (internal signal)
    SystemEvent(SystemSignal),
    
    /// Hybrid (multiple inputs)
    Hybrid {
        text: Option<String>,
        voice: Option<String>,
        command: Option<OmegaCommand>,
    },
}

impl OmegaInput {
    pub fn as_text(&self) -> String {
        match self {
            OmegaInput::Text(text) => text.clone(),
            OmegaInput::Voice { transcript, .. } => transcript.clone(),
            OmegaInput::Command(cmd) => format!("Command: {:?}", cmd),
            OmegaInput::SystemEvent(event) => format!("Event: {:?}", event),
            OmegaInput::Hybrid { text, voice, .. } => {
                text.clone()
                    .or_else(|| voice.clone())
                    .unwrap_or_default()
            }
        }
    }
    
    pub fn is_voice(&self) -> bool {
        matches!(self, OmegaInput::Voice { .. })
    }
    
    pub fn is_command(&self) -> bool {
        matches!(self, OmegaInput::Command(_))
    }
}

/// OMEGA Command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OmegaCommand {
    /// Memory operations
    MemoryRecall { query: String, limit: usize },
    MemoryStore { content: String },
    MemoryCluster,
    MemoryCompress { threshold: f32 },
    
    /// Engine operations
    EngineReset { engine_id: String },
    EngineStatus { engine_id: String },
    
    /// System operations
    SystemDiagnostics,
    SystemHealthCheck,
    
    /// Pipeline operations
    PipelineDebug,
    PipelineProfile,
}

/// System Signal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemSignal {
    HealthDegraded { component: String, severity: f32 },
    MemoryPressure { usage_percent: f32 },
    EngineFailure { engine_id: String, error: String },
    SelfHealingTriggered { incident_id: String },
}

/// Engine State
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineState {
    pub id: String,
    pub name: String,
    pub status: EngineStatus,
    pub health: f32,
    pub latency_ms: f32,
    pub error_count: u32,
    pub last_error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EngineStatus {
    Ready,
    Running,
    Idle,
    Error,
    Disabled,
}

/// Stage Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StageResult {
    pub stage: String,
    pub success: bool,
    pub duration_ms: u64,
    pub data: serde_json::Value,
}

/// OMEGA Metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaMetadata {
    pub request_id: String,
    pub timestamp: u64,
    pub user_id: Option<String>,
    pub session_id: Option<String>,
    pub priority: u8,
    pub timeout_ms: u64,
    pub tags: Vec<String>,
}

impl Default for OmegaMetadata {
    fn default() -> Self {
        Self {
            request_id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            user_id: None,
            session_id: None,
            priority: 5,
            timeout_ms: 5000,
            tags: Vec::new(),
        }
    }
}

impl OmegaContextV2 {
    /// Create new context
    pub fn new(input: OmegaInput) -> Self {
        Self {
            input,
            memory_stm: Vec::new(),
            memory_mtm: Vec::new(),
            memory_ltm: Vec::new(),
            memory_vector: Vec::new(),
            system_state: None,
            engine_states: HashMap::new(),
            metadata: OmegaMetadata::default(),
            current_stage: "init".to_string(),
            accumulated_results: Vec::new(),
        }
    }
    
    /// Add stage result
    pub fn add_result(&mut self, stage: String, success: bool, duration_ms: u64, data: serde_json::Value) {
        self.accumulated_results.push(StageResult {
            stage,
            success,
            duration_ms,
            data,
        });
    }
    
    /// Get total memory context size
    pub fn total_memory_entries(&self) -> usize {
        self.memory_stm.len() + self.memory_mtm.len() + self.memory_ltm.len() + self.memory_vector.len()
    }
    
    /// Get input as text
    pub fn input_text(&self) -> String {
        self.input.as_text()
    }
    
    /// Check if high priority
    pub fn is_high_priority(&self) -> bool {
        self.metadata.priority >= 8
    }
    
    /// Check if system is under pressure
    pub fn is_system_under_pressure(&self) -> bool {
        if let Some(state) = &self.system_state {
            // Consider system degraded if CPU or memory > 75%
            state.cpu_usage > 75.0 || state.memory_usage > 75.0
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_context_creation() {
        let input = OmegaInput::Text("Hello world".to_string());
        let ctx = OmegaContextV2::new(input);
        
        assert_eq!(ctx.input_text(), "Hello world");
        assert_eq!(ctx.total_memory_entries(), 0);
    }
    
    #[test]
    fn test_multimodal_input() {
        let voice_input = OmegaInput::Voice {
            transcript: "Test voice".to_string(),
            confidence: 0.95,
            duration_ms: 1500,
            language: "en".to_string(),
        };
        
        let ctx = OmegaContextV2::new(voice_input);
        assert_eq!(ctx.input_text(), "Test voice");
        assert!(ctx.input.is_voice());
    }
}
