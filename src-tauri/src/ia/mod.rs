// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — IA Module
//   Unified AI Engine: OpenAI + Claude + Gemini + Local
// ═══════════════════════════════════════════════════════════════

pub mod anthropic_claude;
pub mod openai_gpt;
pub mod unified_engine;

pub use anthropic_claude::{ClaudeClient, ClaudeRequest, ClaudeResponse};
pub use openai_gpt::{OpenAIClient, OpenAIRequest, OpenAIResponse};
pub use unified_engine::{
    IAEngine, UnifiedIAEngine, UnifiedIARequest, UnifiedIAResponse, UnifiedMessage,
};
