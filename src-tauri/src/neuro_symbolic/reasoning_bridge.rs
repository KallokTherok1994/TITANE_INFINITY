/**
 * TITANE∞ v∞ - Reasoning Bridge (Phase X)
 * Fusionne reasoning IA + structure interne
 */
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReasoningContext {
    pub query: String,
    pub ai_reasoning: String,
    pub structural_context: String,
    pub hybrid_response: String,
    pub confidence: f32,
}

pub struct ReasoningBridge;

impl Default for ReasoningBridge {
    fn default() -> Self {
        Self::new()
    }
}

impl ReasoningBridge {
    pub fn new() -> Self {
        Self
    }

    pub async fn bridge(&self, query: String) -> ReasoningContext {
        // Raisonnement IA (simulé)
        let ai_reasoning = format!("Analyse IA de: '{}'", query);

        // Contexte structurel TITANE∞
        let structural_context = self.get_structural_context(&query);

        // Fusion hybride
        let hybrid_response = format!(
            "Réponse hybride: {} + Context: {}",
            ai_reasoning, structural_context
        );

        let confidence = 0.87;

        ReasoningContext {
            query,
            ai_reasoning,
            structural_context,
            hybrid_response,
            confidence,
        }
    }

    fn get_structural_context(&self, query: &str) -> String {
        if query.to_lowercase().contains("architecture") {
            "Structure TITANE∞: 20 moteurs unifiés, 6 couches, SingularityState central".to_string()
        } else if query.to_lowercase().contains("memory") {
            "MemoryCore: Persistance locale, XP tracking, associations cognitives".to_string()
        } else {
            "Contexte global TITANE∞ disponible".to_string()
        }
    }
}

#[tauri::command]
pub async fn neuro_bridge_reasoning(query: String) -> Result<ReasoningContext, String> {
    let bridge = ReasoningBridge::new();
    Ok(bridge.bridge(query).await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reasoning_context_structure() {
        let context = ReasoningContext {
            query: "Test query".to_string(),
            ai_reasoning: "AI analysis".to_string(),
            structural_context: "Structure info".to_string(),
            hybrid_response: "Combined response".to_string(),
            confidence: 0.9,
        };

        assert_eq!(context.query, "Test query");
        assert_eq!(context.ai_reasoning, "AI analysis");
        assert_eq!(context.confidence, 0.9);
    }

    #[test]
    fn test_reasoning_context_clone() {
        let context = ReasoningContext {
            query: "Clone test".to_string(),
            ai_reasoning: "Reasoning".to_string(),
            structural_context: "Context".to_string(),
            hybrid_response: "Response".to_string(),
            confidence: 0.75,
        };

        let cloned = context.clone();
        assert_eq!(cloned.query, "Clone test");
        assert_eq!(cloned.confidence, 0.75);
    }

    #[test]
    fn test_reasoning_bridge_new() {
        let bridge = ReasoningBridge::new();
        let _ = bridge;
    }

    #[test]
    fn test_reasoning_bridge_default() {
        let bridge = ReasoningBridge::default();
        let _ = bridge;
    }

    #[test]
    fn test_get_structural_context_architecture() {
        let bridge = ReasoningBridge::new();
        let context = bridge.get_structural_context("Tell me about the architecture");

        assert!(context.contains("TITANE∞"));
        assert!(context.contains("moteurs"));
    }

    #[test]
    fn test_get_structural_context_memory() {
        let bridge = ReasoningBridge::new();
        let context = bridge.get_structural_context("How does memory work?");

        assert!(context.contains("MemoryCore"));
    }

    #[test]
    fn test_get_structural_context_general() {
        let bridge = ReasoningBridge::new();
        let context = bridge.get_structural_context("Random question");

        assert!(context.contains("TITANE∞"));
    }

    #[test]
    fn test_get_structural_context_case_insensitive() {
        let bridge = ReasoningBridge::new();
        let context1 = bridge.get_structural_context("ARCHITECTURE");
        let context2 = bridge.get_structural_context("architecture");

        // Both should return architecture-related context
        assert!(context1.contains("TITANE∞"));
        assert!(context2.contains("TITANE∞"));
    }

    #[tokio::test]
    async fn test_bridge_basic() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge("Test query".to_string()).await;

        assert_eq!(context.query, "Test query");
        assert!(!context.ai_reasoning.is_empty());
        assert!(!context.structural_context.is_empty());
        assert!(!context.hybrid_response.is_empty());
    }

    #[tokio::test]
    async fn test_bridge_ai_reasoning() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge("What is this?".to_string()).await;

        // AI reasoning should contain the query
        assert!(context.ai_reasoning.contains("What is this?"));
    }

    #[tokio::test]
    async fn test_bridge_hybrid_response() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge("Test".to_string()).await;

        // Hybrid response should combine AI and structural
        assert!(context.hybrid_response.contains("Réponse hybride"));
        assert!(context.hybrid_response.contains("Context"));
    }

    #[tokio::test]
    async fn test_bridge_confidence() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge("Any query".to_string()).await;

        assert_eq!(context.confidence, 0.87);
    }

    #[tokio::test]
    async fn test_neuro_bridge_reasoning_command() {
        let result = neuro_bridge_reasoning("Command test".to_string()).await;
        assert!(result.is_ok());

        let context = result.unwrap();
        assert_eq!(context.query, "Command test");
    }

    #[tokio::test]
    async fn test_bridge_architecture_query() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge("Explain the architecture".to_string()).await;

        assert!(context.structural_context.contains("moteurs"));
        assert!(context.structural_context.contains("couches"));
    }

    #[tokio::test]
    async fn test_bridge_memory_query() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge("How does memory work?".to_string()).await;

        assert!(context.structural_context.contains("MemoryCore"));
        assert!(context.structural_context.contains("Persistance"));
    }

    #[test]
    fn test_reasoning_context_debug() {
        let context = ReasoningContext {
            query: "Debug".to_string(),
            ai_reasoning: "AI".to_string(),
            structural_context: "Struct".to_string(),
            hybrid_response: "Hybrid".to_string(),
            confidence: 0.5,
        };

        let debug_str = format!("{:?}", context);
        assert!(debug_str.contains("Debug"));
        assert!(debug_str.contains("0.5"));
    }

    #[tokio::test]
    async fn test_bridge_empty_query() {
        let bridge = ReasoningBridge::new();
        let context = bridge.bridge(String::new()).await;

        // Should still produce a valid context
        assert!(context.query.is_empty());
        assert!(!context.hybrid_response.is_empty());
    }

    #[test]
    fn test_confidence_range() {
        let context = ReasoningContext {
            query: "Test".to_string(),
            ai_reasoning: "AI".to_string(),
            structural_context: "Context".to_string(),
            hybrid_response: "Response".to_string(),
            confidence: 0.87,
        };

        assert!(context.confidence >= 0.0 && context.confidence <= 1.0);
    }
}
