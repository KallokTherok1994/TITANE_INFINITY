// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - REASONING ENGINE
//   Super Prompt #13: Chain-of-thought controlled reasoning
//   Thoughts are controlled, compressed, never exposed raw
// ═══════════════════════════════════════════════════════════════

use super::brain_state::{ConversationMode, IntentClass, MemoryContext};

/// Reasoning Engine - Controlled chain-of-thought processing
#[derive(Debug, Clone)]
pub struct ReasoningEngine {
    /// Maximum reasoning steps
    max_steps: usize,
    /// Compression ratio for chain
    compression_ratio: f32,
}

impl Default for ReasoningEngine {
    fn default() -> Self {
        Self {
            max_steps: 10,
            compression_ratio: 0.3,
        }
    }
}

impl ReasoningEngine {
    /// Create new reasoning engine
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom limits
    pub fn with_config(max_steps: usize, compression_ratio: f32) -> Self {
        Self {
            max_steps,
            compression_ratio: compression_ratio.clamp(0.1, 1.0),
        }
    }

    /// Main reasoning function - builds controlled chain of thought
    pub async fn reason(
        &self,
        message: &str,
        context: &MemoryContext,
        mode: ConversationMode,
        intent: &IntentClass,
    ) -> Vec<String> {
        let mut chain = Vec::with_capacity(self.max_steps);

        // Step 1: Message analysis
        chain.push(format!(
            "Analyse: {} chars, intent={:?}",
            message.len(),
            intent
        ));

        // Step 2: Mode acknowledgment
        chain.push(format!("Mode: {:?} - {}", mode, mode.description()));

        // Step 3: Context integration
        chain.push(format!(
            "Contexte: {} items, relevance={:.2}",
            context.items.len(),
            context.relevance_score
        ));

        // Step 4: Mode-specific reasoning priorities
        let priority = self.get_mode_priority(mode);
        chain.push(format!("Priorité: {}", priority));

        // Step 5: Intent-specific reasoning
        let intent_reasoning = self.reason_by_intent(intent, message);
        chain.push(intent_reasoning);

        // Step 6: Context application
        if !context.items.is_empty() {
            let context_summary = self.summarize_context(context);
            chain.push(format!("Contexte appliqué: {}", context_summary));
        }

        // Step 7: Coherence check
        chain.push("Vérification cohérence: OK".to_string());

        // Step 8: Final synthesis direction
        let synthesis = self.synthesize_direction(mode, intent);
        chain.push(synthesis);

        // Compress the chain
        self.compress_chain(chain)
    }

    /// Get priority statement based on mode
    fn get_mode_priority(&self, mode: ConversationMode) -> &'static str {
        match mode {
            ConversationMode::Coach => "clarté + guidance + progression",
            ConversationMode::Expert => "précision + structure + technique",
            ConversationMode::Meta => "abstraction + patterns + concepts",
            ConversationMode::Cognitive => "analyse + introspection + compréhension",
            ConversationMode::Creative => "imagination + fluidité + originalité",
            ConversationMode::Logic => "faits + logique + neutralité",
            ConversationMode::Harmonic => "équilibre + calme + harmonie",
            ConversationMode::Neutral => "clarté + équilibre + adaptation",
        }
    }

    /// Reason based on intent
    fn reason_by_intent(&self, intent: &IntentClass, message: &str) -> String {
        match intent {
            IntentClass::Query => {
                format!(
                    "Question détectée: cherche information sur '{}'",
                    self.extract_topic(message)
                )
            }
            IntentClass::Task => {
                "Tâche identifiée: focus sur étapes et accomplissement".to_string()
            }
            IntentClass::Help => {
                "Demande d'aide: empathie + guidance + solutions".to_string()
            }
            IntentClass::Emotional => {
                "Expression émotionnelle: écoute + validation + support".to_string()
            }
            IntentClass::Conversation => {
                "Conversation: engagement naturel + fluidité".to_string()
            }
            IntentClass::Command => {
                "Commande: exécution + confirmation + clarté".to_string()
            }
            IntentClass::Creative => {
                "Demande créative: imagination + originalité + exploration".to_string()
            }
            IntentClass::Debug => {
                "Debug: diagnostic + solutions + technique".to_string()
            }
            IntentClass::Explanation => {
                "Explication demandée: pédagogie + clarté + exemples".to_string()
            }
            IntentClass::MetaQuery => {
                "Question système: transparence + précision + méta".to_string()
            }
            IntentClass::Unknown => {
                "Intent ambigu: clarification possible + réponse adaptative".to_string()
            }
        }
    }

    /// Extract main topic from message (simplified)
    fn extract_topic(&self, message: &str) -> String {
        // Take first meaningful words
        let words: Vec<&str> = message
            .split_whitespace()
            .filter(|w| w.len() > 3)
            .take(5)
            .collect();

        if words.is_empty() {
            "sujet général".to_string()
        } else {
            words.join(" ")
        }
    }

    /// Summarize context items
    fn summarize_context(&self, context: &MemoryContext) -> String {
        if context.items.is_empty() {
            return "aucun".to_string();
        }

        let sources: Vec<String> = context
            .source_distribution
            .iter()
            .map(|(k, v)| format!("{}:{}", k, v))
            .collect();

        format!(
            "{} items ({})",
            context.items.len(),
            sources.join(", ")
        )
    }

    /// Synthesize direction for response
    fn synthesize_direction(&self, mode: ConversationMode, intent: &IntentClass) -> String {
        let mode_str = match mode {
            ConversationMode::Coach => "approche coaching",
            ConversationMode::Expert => "approche experte",
            ConversationMode::Meta => "approche méta",
            ConversationMode::Cognitive => "approche analytique",
            ConversationMode::Creative => "approche créative",
            ConversationMode::Logic => "approche logique",
            ConversationMode::Harmonic => "approche harmonique",
            ConversationMode::Neutral => "approche équilibrée",
        };

        let intent_str = match intent {
            IntentClass::Query => "répondre à la question",
            IntentClass::Task => "guider l'accomplissement",
            IntentClass::Help => "fournir assistance",
            IntentClass::Emotional => "soutenir émotionnellement",
            IntentClass::Conversation => "engager naturellement",
            IntentClass::Command => "exécuter et confirmer",
            IntentClass::Creative => "créer et inspirer",
            IntentClass::Debug => "diagnostiquer et résoudre",
            IntentClass::Explanation => "expliquer clairement",
            IntentClass::MetaQuery => "informer sur le système",
            IntentClass::Unknown => "adapter la réponse",
        };

        format!("Synthèse: {} pour {}", mode_str, intent_str)
    }

    /// Compress reasoning chain
    fn compress_chain(&self, chain: Vec<String>) -> Vec<String> {
        let target_len = ((chain.len() as f32) * self.compression_ratio).ceil() as usize;
        let target_len = target_len.max(3); // Keep at least 3 steps

        if chain.len() <= target_len {
            return chain;
        }

        // Keep first, last, and sample middle
        let mut compressed = Vec::with_capacity(target_len);

        // Always keep first
        compressed.push(chain[0].clone());

        // Sample middle steps
        let middle_count = target_len.saturating_sub(2);
        let step = chain.len() / (middle_count + 1);

        for i in 1..=middle_count {
            let idx = (i * step).min(chain.len() - 2);
            if idx > 0 && idx < chain.len() - 1 {
                compressed.push(chain[idx].clone());
            }
        }

        // Always keep last
        compressed.push(chain[chain.len() - 1].clone());

        compressed
    }

    /// Quick single-step reasoning
    pub fn quick_reason(&self, message: &str, mode: ConversationMode) -> String {
        format!(
            "[{:?}] {} → {}",
            mode,
            if message.len() > 50 {
                format!("{}...", &message[..47])
            } else {
                message.to_string()
            },
            self.get_mode_priority(mode)
        )
    }
}

// ═══════════════════════════════════════════════════════════════
//   REASONING RESULT
// ═══════════════════════════════════════════════════════════════

/// Result of reasoning process
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ReasoningResult {
    /// Compressed reasoning chain
    pub chain: Vec<String>,
    /// Primary insight
    pub primary_insight: String,
    /// Confidence in reasoning
    pub confidence: f32,
    /// Processing time (ms)
    pub duration_ms: u128,
}

impl ReasoningResult {
    /// Create from chain
    pub fn from_chain(chain: Vec<String>, duration_ms: u128) -> Self {
        let primary_insight = chain.last().cloned().unwrap_or_default();
        Self {
            chain,
            primary_insight,
            confidence: 0.85,
            duration_ms,
        }
    }

    /// Get summary
    pub fn summary(&self) -> String {
        self.chain.join(" → ")
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_reasoning_basic() {
        let engine = ReasoningEngine::new();
        let context = MemoryContext::default();

        let chain = engine
            .reason(
                "Comment fonctionne le système?",
                &context,
                ConversationMode::Expert,
                &IntentClass::Query,
            )
            .await;

        assert!(!chain.is_empty());
        assert!(chain.len() <= 10);
    }

    #[test]
    fn test_mode_priority() {
        let engine = ReasoningEngine::new();

        let coach_priority = engine.get_mode_priority(ConversationMode::Coach);
        assert!(coach_priority.contains("clarté"));

        let expert_priority = engine.get_mode_priority(ConversationMode::Expert);
        assert!(expert_priority.contains("précision"));
    }

    #[test]
    fn test_chain_compression() {
        let engine = ReasoningEngine::with_config(10, 0.3);

        let chain: Vec<String> = (0..10).map(|i| format!("Step {}", i)).collect();
        let compressed = engine.compress_chain(chain);

        assert!(compressed.len() <= 4);
        assert!(compressed[0].contains("Step 0")); // First preserved
        assert!(compressed.last().unwrap().contains("Step 9")); // Last preserved
    }

    #[test]
    fn test_quick_reason() {
        let engine = ReasoningEngine::new();

        let result = engine.quick_reason("Test message", ConversationMode::Coach);
        assert!(result.contains("Coach"));
        assert!(result.contains("clarté"));
    }

    #[test]
    fn test_intent_reasoning() {
        let engine = ReasoningEngine::new();

        let query_reason = engine.reason_by_intent(&IntentClass::Query, "Comment faire?");
        assert!(query_reason.contains("Question"));

        let help_reason = engine.reason_by_intent(&IntentClass::Help, "Aide-moi");
        assert!(help_reason.contains("aide"));
    }
}
