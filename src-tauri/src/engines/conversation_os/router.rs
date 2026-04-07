// Ring 2: RouterEngine — Deterministic Intent Classification
// Pure logic, no I/O, no state mutation

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Intent {
    Question,      // User asks a question
    Search,        // User wants web search
    Code,          // User wants code generation/analysis
    Chat,          // Casual conversation
    Command,       // User issues a command
    Clarification, // User clarifies previous message
    Unknown,       // Cannot classify
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouterDecision {
    pub intent: Intent,
    pub wants_search: bool,
    pub wants_memory: bool,
    pub wants_write: bool,
    pub confidence: f32, // 0.0..1.0
    pub keywords: Vec<String>,
    pub reasoning: String,
}

/// RouterEngine: Deterministic intent classifier
///
/// Analyzes user message and produces RouterDecision with intent + flags.
///
/// **Ring:** 2 (Engines)  
/// **Status:** EXPERIMENTAL  
/// **Purity:** ✅ No I/O, no state, deterministic  
pub struct RouterEngine;

impl RouterEngine {
    /// Create new RouterEngine (stateless)
    pub fn new() -> Self {
        RouterEngine
    }

    /// Classify user message into RouterDecision
    ///
    /// Uses deterministic heuristics:
    /// - Keywords: "search", "find", "code", "write", etc.
    /// - Patterns: Question marks, imperative verbs, code blocks
    /// - Length: Short = chat, long = question
    ///
    /// # Arguments
    /// * `message` - User message (trimmed)
    ///
    /// # Returns
    /// RouterDecision with intent, flags, confidence
    ///
    /// # Examples
    /// ```
    /// use titane_infinity::engines::conversation_os::router::{Intent, RouterEngine};
    ///
    /// let engine = RouterEngine::new();
    /// let decision = engine.classify("What is Rust?");
    /// assert_eq!(decision.intent, Intent::Question);
    /// assert!(decision.confidence > 0.0);
    /// ```
    pub fn classify(&self, message: &str) -> RouterDecision {
        let msg_lower = message.to_lowercase();
        let msg_trimmed = message.trim();
        let words: Vec<&str> = msg_trimmed.split_whitespace().collect();
        let word_count = words.len();

        // Extract keywords
        let mut keywords = Vec::new();
        for keyword in &[
            "search",
            "find",
            "look up",
            "google",
            "code",
            "write",
            "function",
            "implement",
            "remember",
            "recall",
            "history",
            "memorise",
            "mémorise",
            "rappelle",
            "souviens",
            "save",
            "store",
            "write to",
        ] {
            if msg_lower.contains(keyword) {
                keywords.push(keyword.to_string());
            }
        }

        // Intent detection heuristics
        let (intent, confidence, reasoning) = if msg_lower.contains("search")
            || msg_lower.contains("find")
            || msg_lower.contains("look up")
            || msg_lower.contains("google")
        {
            (
                Intent::Search,
                0.9,
                "Explicit search keywords detected".to_string(),
            )
        } else if msg_lower.contains("remember")
            || msg_lower.contains("recall")
            || msg_lower.contains("history")
            || msg_lower.contains("memorise")
            || msg_lower.contains("mémorise")
            || msg_lower.contains("rappelle")
            || msg_lower.contains("souviens")
        {
            (
                Intent::Clarification,
                0.85,
                "Memory/history reference detected".to_string(),
            )
        } else if msg_lower.contains("code")
            || msg_lower.contains("write")
            || msg_lower.contains("function")
            || msg_lower.contains("implement")
            || msg_lower.contains("```")
        {
            (
                Intent::Code,
                0.85,
                "Code-related keywords or code blocks detected".to_string(),
            )
        } else if msg_trimmed.ends_with('?') && word_count > 3 {
            (
                Intent::Question,
                0.8,
                "Question mark + sufficient length".to_string(),
            )
        } else if msg_lower.starts_with("what")
            || msg_lower.starts_with("how")
            || msg_lower.starts_with("why")
            || msg_lower.starts_with("when")
            || msg_lower.starts_with("where")
            || msg_lower.starts_with("who")
        {
            (Intent::Question, 0.75, "Question word at start".to_string())
        } else if word_count <= 5 && !msg_trimmed.ends_with('?') {
            (
                Intent::Chat,
                0.6,
                "Short message without question mark".to_string(),
            )
        } else if msg_lower.contains("remember")
            || msg_lower.contains("recall")
            || msg_lower.contains("history")
            || msg_lower.contains("memorise")
            || msg_lower.contains("mémorise")
            || msg_lower.contains("rappelle")
            || msg_lower.contains("souviens")
        {
            (
                Intent::Clarification,
                0.7,
                "Memory/history reference detected".to_string(),
            )
        } else if word_count > 10 {
            (
                Intent::Question,
                0.65,
                "Long message likely a question".to_string(),
            )
        } else {
            (
                Intent::Unknown,
                0.3,
                "No clear intent pattern detected".to_string(),
            )
        };

        // Set flags based on intent
        let wants_search = matches!(intent, Intent::Search | Intent::Question)
            && (msg_lower.contains("search")
                || msg_lower.contains("find")
                || msg_lower.contains("latest")
                || msg_lower.contains("current")
                || msg_lower.contains("recent"));

        let wants_memory = matches!(intent, Intent::Clarification | Intent::Question)
            || msg_lower.contains("remember")
            || msg_lower.contains("recall")
            || msg_lower.contains("memorise")
            || msg_lower.contains("mémorise")
            || msg_lower.contains("rappelle")
            || msg_lower.contains("souviens")
            || msg_lower.contains("we discussed")
            || msg_lower.contains("you said");

        let wants_write = msg_lower.contains("save")
            || msg_lower.contains("store")
            || msg_lower.contains("write to")
            || msg_lower.contains("create file");

        RouterDecision {
            intent,
            wants_search,
            wants_memory,
            wants_write,
            confidence,
            keywords,
            reasoning,
        }
    }
}

impl Default for RouterEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_intent() {
        let engine = RouterEngine::new();
        let decision = engine.classify("Search for Rust tutorials");
        assert_eq!(decision.intent, Intent::Search);
        assert!(decision.wants_search);
        assert!(decision.confidence > 0.8);
    }

    #[test]
    fn test_question_intent() {
        let engine = RouterEngine::new();
        let decision = engine.classify("What is the capital of France?");
        assert_eq!(decision.intent, Intent::Question);
        assert!(!decision.wants_search); // No explicit search keyword
        assert!(decision.confidence > 0.7);
    }

    #[test]
    fn test_code_intent() {
        let engine = RouterEngine::new();
        let decision = engine.classify("Write a function to sort an array");
        assert_eq!(decision.intent, Intent::Code);
        assert!(!decision.wants_search);
        assert!(decision.confidence > 0.8);
    }

    #[test]
    fn test_chat_intent() {
        let engine = RouterEngine::new();
        let decision = engine.classify("Hello there");
        assert_eq!(decision.intent, Intent::Chat);
        assert!(!decision.wants_search);
        assert!(!decision.wants_memory);
    }

    #[test]
    fn test_memory_flag() {
        let engine = RouterEngine::new();
        let decision = engine.classify("What did you say earlier about Rust?");
        assert!(decision.wants_memory);
    }

    #[test]
    fn test_write_flag() {
        let engine = RouterEngine::new();
        let decision = engine.classify("Save this to a file");
        assert!(decision.wants_write);
    }

    #[test]
    fn test_search_flag_with_question() {
        let engine = RouterEngine::new();
        let decision = engine.classify("What is the latest news on AI?");
        assert_eq!(decision.intent, Intent::Question);
        assert!(decision.wants_search); // "latest" triggers search
    }

    #[test]
    fn test_french_memory_flag() {
        let engine = RouterEngine::new();
        let decision = engine.classify("Rappelle exactement le code, le nom et la couleur.");
        assert_eq!(decision.intent, Intent::Clarification);
        assert!(decision.wants_memory);
        assert!(decision
            .keywords
            .iter()
            .any(|keyword| keyword == "rappelle"));
    }

    #[test]
    fn test_deterministic() {
        let engine = RouterEngine::new();
        let msg = "How does async Rust work?";
        let d1 = engine.classify(msg);
        let d2 = engine.classify(msg);
        assert_eq!(d1.intent, d2.intent);
        assert_eq!(d1.confidence, d2.confidence);
    }
}
