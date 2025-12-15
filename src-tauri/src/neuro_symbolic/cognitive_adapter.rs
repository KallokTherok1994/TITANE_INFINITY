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
        let intent = adapter
            .adapt("Remember this important fact".to_string())
            .await;

        assert_eq!(intent.target_module, "MemoryCore");
        assert!(intent.confidence >= 0.90);
        assert!(intent.mapped_to.contains("MemoryCore"));
    }

    #[tokio::test]
    async fn test_adapt_learn_intent() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter
            .adapt("Learn from this experience".to_string())
            .await;

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
        let intent = adapter
            .adapt("Evolve and adapt to new conditions".to_string())
            .await;

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

    #[test]
    fn test_cognitive_intent_clone() {
        let intent = CognitiveIntent {
            raw_intent: "Clone test".to_string(),
            mapped_to: "TITANE::Test::Action".to_string(),
            confidence: 0.88,
            target_module: "TestModule".to_string(),
        };

        let cloned = intent.clone();
        assert_eq!(cloned.raw_intent, "Clone test");
        assert_eq!(cloned.confidence, 0.88);
    }

    #[test]
    fn test_adapter_report_clone() {
        let report = AdapterReport {
            intents_processed: 3,
            avg_confidence: 0.75,
            mappings: vec![CognitiveIntent {
                raw_intent: "test".to_string(),
                mapped_to: "mapped".to_string(),
                confidence: 0.9,
                target_module: "Module".to_string(),
            }],
        };

        let cloned = report.clone();
        assert_eq!(cloned.intents_processed, 3);
        assert_eq!(cloned.mappings.len(), 1);
    }

    #[test]
    fn test_cognitive_intent_debug() {
        let intent = CognitiveIntent {
            raw_intent: "Debug test".to_string(),
            mapped_to: "TITANE::Debug".to_string(),
            confidence: 0.77,
            target_module: "DebugModule".to_string(),
        };

        let debug_str = format!("{:?}", intent);
        assert!(debug_str.contains("Debug test"));
        assert!(debug_str.contains("0.77"));
    }

    #[test]
    fn test_adapter_report_debug() {
        let report = AdapterReport {
            intents_processed: 10,
            avg_confidence: 0.82,
            mappings: vec![],
        };

        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("10"));
        assert!(debug_str.contains("0.82"));
    }

    #[test]
    fn test_cognitive_adapter_default() {
        let adapter = CognitiveAdapter::default();
        let _ = adapter;
    }

    #[test]
    fn test_analyze_intent_memory() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("I need to memory this");
        assert_eq!(module, "MemoryCore");
        assert_eq!(confidence, 0.90);
    }

    #[test]
    fn test_analyze_intent_remember() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Please remember that");
        assert_eq!(module, "MemoryCore");
        assert_eq!(confidence, 0.90);
    }

    #[test]
    fn test_analyze_intent_learn() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Learn from this");
        assert_eq!(module, "CognitiveEngine");
        assert_eq!(confidence, 0.85);
    }

    #[test]
    fn test_analyze_intent_improve() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Improve performance");
        assert_eq!(module, "CognitiveEngine");
        assert_eq!(confidence, 0.85);
    }

    #[test]
    fn test_analyze_intent_structure() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Show me the structure");
        assert_eq!(module, "SymbolicEngine");
        assert_eq!(confidence, 0.88);
    }

    #[test]
    fn test_analyze_intent_adapt() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Adapt to changes");
        assert_eq!(module, "AdaptiveEngine");
        assert_eq!(confidence, 0.87);
    }

    #[test]
    fn test_analyze_intent_evolve() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Evolve the system");
        assert_eq!(module, "AdaptiveEngine");
        assert_eq!(confidence, 0.87);
    }

    #[test]
    fn test_analyze_intent_default() {
        let adapter = CognitiveAdapter::new();
        let (module, confidence) = adapter.analyze_intent("Unknown command");
        assert_eq!(module, "SingularityEngine");
        assert_eq!(confidence, 0.70);
    }

    #[test]
    fn test_analyze_intent_case_insensitive() {
        let adapter = CognitiveAdapter::new();
        let (module1, _) = adapter.analyze_intent("MEMORY");
        let (module2, _) = adapter.analyze_intent("memory");
        let (module3, _) = adapter.analyze_intent("MeMoRy");
        assert_eq!(module1, "MemoryCore");
        assert_eq!(module2, "MemoryCore");
        assert_eq!(module3, "MemoryCore");
    }

    #[tokio::test]
    async fn test_adapt_mapped_to_format() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Test input".to_string()).await;

        assert!(intent.mapped_to.starts_with("TITANE::"));
        assert!(intent.mapped_to.ends_with("::Action"));
    }

    #[tokio::test]
    async fn test_adapt_preserves_raw_intent() {
        let adapter = CognitiveAdapter::new();
        let input = "This is my test query".to_string();
        let intent = adapter.adapt(input.clone()).await;

        assert_eq!(intent.raw_intent, input);
    }

    #[tokio::test]
    async fn test_adapt_confidence_range() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt("Any input".to_string()).await;

        assert!(intent.confidence >= 0.0);
        assert!(intent.confidence <= 1.0);
    }

    #[tokio::test]
    async fn test_adapt_empty_input() {
        let adapter = CognitiveAdapter::new();
        let intent = adapter.adapt(String::new()).await;

        // Empty input defaults to SingularityEngine
        assert_eq!(intent.target_module, "SingularityEngine");
    }

    #[tokio::test]
    async fn test_neuro_adapt_intent_command() {
        let result = neuro_adapt_intent("Test command".to_string()).await;
        assert!(result.is_ok());

        let intent = result.unwrap();
        assert_eq!(intent.raw_intent, "Test command");
    }

    #[tokio::test]
    async fn test_neuro_adapt_intent_memory_command() {
        let result = neuro_adapt_intent("Remember this fact".to_string()).await;
        assert!(result.is_ok());

        let intent = result.unwrap();
        assert_eq!(intent.target_module, "MemoryCore");
    }

    #[test]
    fn test_adapter_report_with_mappings() {
        let mappings = vec![
            CognitiveIntent {
                raw_intent: "first".to_string(),
                mapped_to: "TITANE::A".to_string(),
                confidence: 0.8,
                target_module: "A".to_string(),
            },
            CognitiveIntent {
                raw_intent: "second".to_string(),
                mapped_to: "TITANE::B".to_string(),
                confidence: 0.9,
                target_module: "B".to_string(),
            },
        ];

        let avg = (0.8 + 0.9) / 2.0;
        let report = AdapterReport {
            intents_processed: 2,
            avg_confidence: avg,
            mappings,
        };

        assert_eq!(report.intents_processed, 2);
        assert!((report.avg_confidence - 0.85).abs() < 0.01);
        assert_eq!(report.mappings.len(), 2);
    }

    #[test]
    fn test_cognitive_intent_all_fields() {
        let intent = CognitiveIntent {
            raw_intent: "full test".to_string(),
            mapped_to: "TITANE::Full::Action".to_string(),
            confidence: 0.95,
            target_module: "FullModule".to_string(),
        };

        assert_eq!(intent.raw_intent, "full test");
        assert_eq!(intent.mapped_to, "TITANE::Full::Action");
        assert_eq!(intent.confidence, 0.95);
        assert_eq!(intent.target_module, "FullModule");
    }

    #[test]
    fn test_adapter_report_empty_mappings() {
        let report = AdapterReport {
            intents_processed: 0,
            avg_confidence: 0.0,
            mappings: vec![],
        };

        assert_eq!(report.intents_processed, 0);
        assert_eq!(report.avg_confidence, 0.0);
        assert!(report.mappings.is_empty());
    }
}
