/**
 * TITANE∞ v∞ - Cognitive Adapter (Phase X)
 * Traduit pensée IA en structure TITANE∞
 */
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveIntent {
    pub raw_intent: String,
    pub mapped_to: String,
    pub confidence: f32,
    pub target_module: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdapterReport {
    pub intents_processed: usize,
    pub avg_confidence: f32,
    pub mappings: Vec<CognitiveIntent>,
}

pub struct CognitiveAdapter;

impl Default for CognitiveAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl CognitiveAdapter {
    pub fn new() -> Self {
        Self
    }

    pub async fn adapt(&self, raw_input: String) -> CognitiveIntent {
        // Analyse de l'intention
        let (target_module, confidence) = self.analyze_intent(&raw_input);

        CognitiveIntent {
            raw_intent: raw_input.clone(),
            mapped_to: format!("TITANE::{}::Action", target_module),
            confidence,
            target_module,
        }
    }

    fn analyze_intent(&self, input: &str) -> (String, f32) {
        let input_lower = input.to_lowercase();

        if input_lower.contains("memory") || input_lower.contains("remember") {
            ("MemoryCore".to_string(), 0.90)
        } else if input_lower.contains("learn") || input_lower.contains("improve") {
            ("CognitiveEngine".to_string(), 0.85)
        } else if input_lower.contains("architecture") || input_lower.contains("structure") {
            ("SymbolicEngine".to_string(), 0.88)
        } else if input_lower.contains("evolve") || input_lower.contains("adapt") {
            ("AdaptiveEngine".to_string(), 0.87)
        } else {
            ("SingularityEngine".to_string(), 0.70)
        }
    }
}

#[tauri::command]
pub async fn neuro_adapt_intent(input: String) -> Result<CognitiveIntent, String> {
    let adapter = CognitiveAdapter::new();
    Ok(adapter.adapt(input).await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cognitive_adapter_creation() {
        let adapter = CognitiveAdapter::new();
        // Default impl exists
        let _adapter2 = CognitiveAdapter::default();
        assert!(true);
    }

    #[tokio::test]
    async fn test_adapt_memory_intent() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Remember this important fact".to_string()).await;

        assert_eq!(intent.target_module, "MemoryCore");
        assert!(intent.confidence >= 0.90);
        assert!(intent.mapped_to.contains("MemoryCore"));
    }

    #[tokio::test]
    async fn test_adapt_learn_intent() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Learn from this experience".to_string()).await;

        assert_eq!(intent.target_module, "CognitiveEngine");
        assert!(intent.confidence >= 0.85);
    }

    #[tokio::test]
    async fn test_adapt_architecture_intent() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Analyze the architecture".to_string()).await;

        assert_eq!(intent.target_module, "SymbolicEngine");
        assert!(intent.confidence >= 0.88);
    }

    #[tokio::test]
    async fn test_adapt_evolve_intent() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Evolve and adapt to new conditions".to_string()).await;

        assert_eq!(intent.target_module, "AdaptiveEngine");
        assert!(intent.confidence >= 0.87);
    }

    #[tokio::test]
    async fn test_adapt_default_intent() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Do something random".to_string()).await;

        assert_eq!(intent.target_module, "SingularityEngine");
        assert!(intent.confidence >= 0.70);
    }

    #[test]
    fn test_cognitive_intent_structure() {
        let intent = CognitiveIntent {
            raw_intent: "test".to_string(),
            mapped_to: "TITANE::Test::Action".to_string(),
            confidence: 0.95,
            target_module: "TestModule".to_string(),
        };

        assert_eq!(intent.raw_intent, "test");
        assert!(intent.confidence > 0.9);
    }

    #[test]
    fn test_adapter_report_structure() {
        let report = AdapterReport {
            intents_processed: 5,
            avg_confidence: 0.85,
            mappings: vec![],
        };

        assert_eq!(report.intents_processed, 5);
        assert!(report.avg_confidence > 0.8);
    }
}
