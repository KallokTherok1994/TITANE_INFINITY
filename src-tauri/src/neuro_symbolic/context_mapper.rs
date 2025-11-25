/**
 * TITANE∞ v∞ - Context Mapper (Phase X)
 * Associe chaque question à l'état interne du système
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntentionVector {
    pub domain: String,
    pub importance: f32,
    pub urgency: f32,
    pub impact: HashMap<String, f32>,
    pub cross_domain_links: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMap {
    pub timestamp: u64,
    pub query: String,
    pub intention_vector: IntentionVector,
    pub mapped_engines: Vec<String>,
    pub xp_potential: f32,
}

pub struct ContextMapper;

impl ContextMapper {
    pub fn new() -> Self {
        Self
    }

    pub async fn map_context(&self, query: String) -> ContextMap {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let (domain, importance, urgency) = self.analyze_query(&query);

        let mut impact = HashMap::new();
        impact.insert("cognitive".to_string(), 0.8);
        impact.insert("technical".to_string(), 0.6);
        impact.insert("symbolic".to_string(), 0.7);

        let cross_domain_links = vec![
            "MemoryCore".to_string(),
            "CognitiveEngine".to_string(),
        ];

        let intention_vector = IntentionVector {
            domain: domain.clone(),
            importance,
            urgency,
            impact,
            cross_domain_links: cross_domain_links.clone(),
        };

        let mapped_engines = self.map_to_engines(&domain);
        let xp_potential = importance * urgency;

        ContextMap {
            timestamp,
            query,
            intention_vector,
            mapped_engines,
            xp_potential,
        }
    }

    fn analyze_query(&self, query: &str) -> (String, f32, f32) {
        let query_lower = query.to_lowercase();

        let domain = if query_lower.contains("architecture") || query_lower.contains("structure") {
            "Architecture"
        } else if query_lower.contains("learn") || query_lower.contains("understand") {
            "Cognitive"
        } else if query_lower.contains("fix") || query_lower.contains("error") {
            "Technical"
        } else {
            "General"
        }.to_string();

        let importance = if query_lower.contains("critical") || query_lower.contains("urgent") {
            0.95
        } else {
            0.70
        };

        let urgency = if query_lower.contains("now") || query_lower.contains("immediately") {
            0.90
        } else {
            0.60
        };

        (domain, importance, urgency)
    }

    fn map_to_engines(&self, domain: &str) -> Vec<String> {
        match domain {
            "Architecture" => vec!["SymbolicEngine".to_string(), "StructuralEngine".to_string()],
            "Cognitive" => vec!["CognitiveEngine".to_string(), "MemoryCore".to_string()],
            "Technical" => vec!["RepairCore".to_string(), "ValidationEngine".to_string()],
            _ => vec!["SingularityEngine".to_string()],
        }
    }
}

#[tauri::command]
pub async fn neuro_map_context(query: String) -> Result<ContextMap, String> {
    let mapper = ContextMapper::new();
    Ok(mapper.map_context(query).await)
}
