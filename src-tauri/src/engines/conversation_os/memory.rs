// Ring 2: MemoryEngine — Memory Context Decision Logic
// Pure logic, no I/O, decides what context to fetch

use serde::{Deserialize, Serialize};

/// Memory fetch instructions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryFetchPlan {
    pub fetch_stm: bool,
    pub stm_limit: usize,
    pub fetch_snapshot: bool,
    pub snapshot_conversation_id: Option<String>,
    pub fetch_ltm: bool,
    pub ltm_query: Option<String>,
    pub ltm_top_k: usize,
    pub reasoning: String,
}

/// Memory relevance score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRelevance {
    pub needs_context: bool,
    pub context_depth: ContextDepth,
    pub reasoning: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ContextDepth {
    None,       // No context needed
    Shallow,    // Last 3 turns
    Medium,     // Last 10 turns
    Deep,       // Last 20 turns + snapshot
    Full,       // Full STM + LTM search
}

impl ContextDepth {
    pub fn to_limit(&self) -> usize {
        match self {
            ContextDepth::None => 0,
            ContextDepth::Shallow => 3,
            ContextDepth::Medium => 10,
            ContextDepth::Deep => 20,
            ContextDepth::Full => 100,
        }
    }
}

/// MemoryEngine: Decides what context to fetch based on intent
/// 
/// **Ring:** 2 (Engines)  
/// **Status:** EXPERIMENTAL  
/// **Purity:** ✅ No I/O, no state, pure decision logic  
/// 
/// Analyzes user message and intent to determine:
/// - STM depth (how many recent turns to fetch)
/// - Whether to fetch latest snapshot
/// - Whether to perform LTM vector search
pub struct MemoryEngine;

impl MemoryEngine {
    /// Create new MemoryEngine (stateless)
    pub fn new() -> Self {
        MemoryEngine
    }

    /// Assess memory relevance based on message content
    /// 
    /// # Arguments
    /// * `message` - User message
    /// * `wants_memory` - Flag from RouterEngine
    /// 
    /// # Returns
    /// MemoryRelevance with depth assessment
    pub fn assess_relevance(&self, message: &str, wants_memory: bool) -> MemoryRelevance {
        let msg_lower = message.to_lowercase();

        // Explicit memory references
        if wants_memory {
            return MemoryRelevance {
                needs_context: true,
                context_depth: ContextDepth::Deep,
                reasoning: "Explicit memory reference detected".to_string(),
            };
        }

        // Continuation words
        if msg_lower.starts_with("also")
            || msg_lower.starts_with("and")
            || msg_lower.starts_with("but")
            || msg_lower.starts_with("however")
            || msg_lower.starts_with("additionally")
        {
            return MemoryRelevance {
                needs_context: true,
                context_depth: ContextDepth::Shallow,
                reasoning: "Continuation word detected".to_string(),
            };
        }

        // Follow-up questions
        if msg_lower.contains("elaborate")
            || msg_lower.contains("explain further")
        {
            return MemoryRelevance {
                needs_context: true,
                context_depth: ContextDepth::Medium,
                reasoning: "Follow-up question detected".to_string(),
            };
        }

        // Pronoun/anaphora references (requires context)
        if msg_lower.contains("it")
            || msg_lower.contains("that")
            || msg_lower.contains("this")
            || msg_lower.contains("them")
            || msg_lower.contains("those")
        {
            return MemoryRelevance {
                needs_context: true,
                context_depth: ContextDepth::Shallow,
                reasoning: "Anaphoric reference detected".to_string(),
            };
        }

        // Complex question (may need deep context)
        let word_count = message.split_whitespace().count();
        if word_count > 12 && message.contains('?') {
            return MemoryRelevance {
                needs_context: true,
                context_depth: ContextDepth::Medium,
                reasoning: "Complex question may need context".to_string(),
            };
        }

        // Default: no context needed
        MemoryRelevance {
            needs_context: false,
            context_depth: ContextDepth::None,
            reasoning: "No context indicators detected".to_string(),
        }
    }

    /// Create memory fetch plan
    /// 
    /// # Arguments
    /// * `relevance` - Memory relevance assessment
    /// * `conversation_id` - Current conversation ID
    /// * `enable_ltm` - Whether LTM (vector search) is available
    /// 
    /// # Returns
    /// MemoryFetchPlan with fetch instructions
    pub fn create_fetch_plan(
        &self,
        relevance: &MemoryRelevance,
        conversation_id: Option<String>,
        enable_ltm: bool,
    ) -> MemoryFetchPlan {
        if !relevance.needs_context {
            return MemoryFetchPlan {
                fetch_stm: false,
                stm_limit: 0,
                fetch_snapshot: false,
                snapshot_conversation_id: None,
                fetch_ltm: false,
                ltm_query: None,
                ltm_top_k: 0,
                reasoning: "No context fetch needed".to_string(),
            };
        }

        let stm_limit = relevance.context_depth.to_limit();
        let fetch_snapshot = matches!(
            relevance.context_depth,
            ContextDepth::Deep | ContextDepth::Full
        );
        let fetch_ltm = enable_ltm && relevance.context_depth == ContextDepth::Full;

        MemoryFetchPlan {
            fetch_stm: stm_limit > 0,
            stm_limit,
            fetch_snapshot,
            snapshot_conversation_id: if fetch_snapshot {
                conversation_id.clone()
            } else {
                None
            },
            fetch_ltm,
            ltm_query: if fetch_ltm {
                Some("(LTM query placeholder)".to_string())
            } else {
                None
            },
            ltm_top_k: if fetch_ltm { 5 } else { 0 },
            reasoning: format!("Context depth: {:?}", relevance.context_depth),
        }
    }

    /// Helper: Decide full memory strategy
    /// 
    /// Combines assess_relevance + create_fetch_plan
    pub fn decide_memory_strategy(
        &self,
        message: &str,
        wants_memory: bool,
        conversation_id: Option<String>,
        enable_ltm: bool,
    ) -> MemoryFetchPlan {
        let relevance = self.assess_relevance(message, wants_memory);
        self.create_fetch_plan(&relevance, conversation_id, enable_ltm)
    }

    /// Analyze if message refers to previous turn
    /// 
    /// Used to determine if immediate context (last turn) is sufficient
    pub fn refers_to_previous_turn(&self, message: &str) -> bool {
        let msg_lower = message.to_lowercase();
        msg_lower.contains("it")
            || msg_lower.contains("that")
            || msg_lower.contains("this")
            || msg_lower.starts_with("also")
            || msg_lower.starts_with("and")
    }
}

impl Default for MemoryEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_context_needed() {
        let engine = MemoryEngine::new();
        let relevance = engine.assess_relevance("What is Rust?", false);
        assert!(!relevance.needs_context);
        assert_eq!(relevance.context_depth, ContextDepth::None);
    }

    #[test]
    fn test_explicit_memory_reference() {
        let engine = MemoryEngine::new();
        let relevance = engine.assess_relevance("What did you say earlier?", true);
        assert!(relevance.needs_context);
        assert_eq!(relevance.context_depth, ContextDepth::Deep);
    }

    #[test]
    fn test_anaphoric_reference() {
        let engine = MemoryEngine::new();
        let relevance = engine.assess_relevance("Tell me more about it", false);
        assert!(relevance.needs_context);
        assert_eq!(relevance.context_depth, ContextDepth::Shallow);
    }

    #[test]
    fn test_continuation_word() {
        let engine = MemoryEngine::new();
        let relevance = engine.assess_relevance("Also, what about Python?", false);
        assert!(relevance.needs_context);
        assert_eq!(relevance.context_depth, ContextDepth::Shallow);
    }

    #[test]
    fn test_follow_up_question() {
        let engine = MemoryEngine::new();
        let relevance = engine.assess_relevance("Can you elaborate on that?", false);
        assert!(relevance.needs_context);
        assert_eq!(relevance.context_depth, ContextDepth::Medium);
    }

    #[test]
    fn test_complex_question() {
        let engine = MemoryEngine::new();
        let msg = "How does the borrow checker in Rust work and what are the implications for memory safety?";
        let relevance = engine.assess_relevance(msg, false);
        assert!(relevance.needs_context);
        assert_eq!(relevance.context_depth, ContextDepth::Medium);
    }

    #[test]
    fn test_fetch_plan_no_context() {
        let engine = MemoryEngine::new();
        let relevance = MemoryRelevance {
            needs_context: false,
            context_depth: ContextDepth::None,
            reasoning: "Test".to_string(),
        };
        let plan = engine.create_fetch_plan(&relevance, None, false);
        assert!(!plan.fetch_stm);
        assert!(!plan.fetch_snapshot);
        assert!(!plan.fetch_ltm);
    }

    #[test]
    fn test_fetch_plan_shallow() {
        let engine = MemoryEngine::new();
        let relevance = MemoryRelevance {
            needs_context: true,
            context_depth: ContextDepth::Shallow,
            reasoning: "Test".to_string(),
        };
        let plan = engine.create_fetch_plan(&relevance, Some("conv123".to_string()), false);
        assert!(plan.fetch_stm);
        assert_eq!(plan.stm_limit, 3);
        assert!(!plan.fetch_snapshot);
        assert!(!plan.fetch_ltm);
    }

    #[test]
    fn test_fetch_plan_deep() {
        let engine = MemoryEngine::new();
        let relevance = MemoryRelevance {
            needs_context: true,
            context_depth: ContextDepth::Deep,
            reasoning: "Test".to_string(),
        };
        let plan = engine.create_fetch_plan(&relevance, Some("conv123".to_string()), false);
        assert!(plan.fetch_stm);
        assert_eq!(plan.stm_limit, 20);
        assert!(plan.fetch_snapshot);
        assert!(!plan.fetch_ltm); // LTM disabled
    }

    #[test]
    fn test_fetch_plan_full_with_ltm() {
        let engine = MemoryEngine::new();
        let relevance = MemoryRelevance {
            needs_context: true,
            context_depth: ContextDepth::Full,
            reasoning: "Test".to_string(),
        };
        let plan = engine.create_fetch_plan(&relevance, Some("conv123".to_string()), true);
        assert!(plan.fetch_stm);
        assert!(plan.fetch_snapshot);
        assert!(plan.fetch_ltm);
        assert_eq!(plan.ltm_top_k, 5);
    }

    #[test]
    fn test_strategy_integration() {
        let engine = MemoryEngine::new();
        let plan = engine.decide_memory_strategy(
            "Tell me more about it",
            false,
            Some("conv123".to_string()),
            false,
        );
        assert!(plan.fetch_stm);
        assert_eq!(plan.stm_limit, 3);
    }

    #[test]
    fn test_refers_to_previous_turn() {
        let engine = MemoryEngine::new();
        assert!(engine.refers_to_previous_turn("Tell me more about it"));
        assert!(engine.refers_to_previous_turn("Also, what about Python?"));
        assert!(!engine.refers_to_previous_turn("What is Rust?"));
    }
}
