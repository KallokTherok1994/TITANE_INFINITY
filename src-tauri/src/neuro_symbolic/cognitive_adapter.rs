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
