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

impl Default for ContextMapper {
    fn default() -> Self {
        Self::new()
    }
}

impl ContextMapper {
    pub fn new() -> Self {
        Self
    }

    pub async fn map_context(&self, query: String) -> ContextMap {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or_else(|_| crate::core::utils::now_ms() / 1000);

        let (domain, importance, urgency) = self.analyze_query(&query);

        let mut impact = HashMap::new();
        impact.insert("cognitive".to_string(), 0.8);
        impact.insert("technical".to_string(), 0.6);
        impact.insert("symbolic".to_string(), 0.7);

        let cross_domain_links = vec!["MemoryCore".to_string(), "CognitiveEngine".to_string()];

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
        }
        .to_string();

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_intention_vector_structure() {
        let mut impact = HashMap::new();
        impact.insert("cognitive".to_string(), 0.8);

        let vector = IntentionVector {
            domain: "Test".to_string(),
            importance: 0.9,
            urgency: 0.7,
            impact,
            cross_domain_links: vec!["Link1".to_string()],
        };

        assert_eq!(vector.domain, "Test");
        assert_eq!(vector.importance, 0.9);
        assert_eq!(vector.urgency, 0.7);
    }

    #[test]
    fn test_intention_vector_clone() {
        let vector = IntentionVector {
            domain: "Clone".to_string(),
            importance: 0.5,
            urgency: 0.5,
            impact: HashMap::new(),
            cross_domain_links: vec![],
        };

        let cloned = vector.clone();
        assert_eq!(cloned.domain, "Clone");
    }

    #[test]
    fn test_context_map_structure() {
        let map = ContextMap {
            timestamp: 1234567890,
            query: "Test query".to_string(),
            intention_vector: IntentionVector {
                domain: "Test".to_string(),
                importance: 0.5,
                urgency: 0.5,
                impact: HashMap::new(),
                cross_domain_links: vec![],
            },
            mapped_engines: vec!["Engine1".to_string()],
            xp_potential: 0.25,
        };

        assert_eq!(map.timestamp, 1234567890);
        assert_eq!(map.query, "Test query");
        assert_eq!(map.xp_potential, 0.25);
    }

    #[test]
    fn test_context_map_clone() {
        let map = ContextMap {
            timestamp: 1000,
            query: "Clone query".to_string(),
            intention_vector: IntentionVector {
                domain: "General".to_string(),
                importance: 0.7,
                urgency: 0.6,
                impact: HashMap::new(),
                cross_domain_links: vec![],
            },
            mapped_engines: vec![],
            xp_potential: 0.42,
        };

        let cloned = map.clone();
        assert_eq!(cloned.timestamp, 1000);
        assert_eq!(cloned.query, "Clone query");
    }

    #[test]
    fn test_context_mapper_new() {
        let mapper = ContextMapper::new();
        // Just verify it can be created
        let _ = mapper;
    }

    #[test]
    fn test_context_mapper_default() {
        let mapper = ContextMapper;
        let _ = mapper;
    }

    #[test]
    fn test_analyze_query_architecture() {
        let mapper = ContextMapper::new();
        let (domain, _, _) = mapper.analyze_query("Explain the architecture design");

        assert_eq!(domain, "Architecture");
    }

    #[test]
    fn test_analyze_query_cognitive() {
        let mapper = ContextMapper::new();
        let (domain, _, _) = mapper.analyze_query("Help me learn this concept");

        assert_eq!(domain, "Cognitive");
    }

    #[test]
    fn test_analyze_query_technical() {
        let mapper = ContextMapper::new();
        let (domain, _, _) = mapper.analyze_query("Fix this error please");

        assert_eq!(domain, "Technical");
    }

    #[test]
    fn test_analyze_query_general() {
        let mapper = ContextMapper::new();
        let (domain, _, _) = mapper.analyze_query("Hello world");

        assert_eq!(domain, "General");
    }

    #[test]
    fn test_analyze_query_critical_importance() {
        let mapper = ContextMapper::new();
        let (_, importance, _) = mapper.analyze_query("This is critical!");

        assert_eq!(importance, 0.95);
    }

    #[test]
    fn test_analyze_query_urgent_importance() {
        let mapper = ContextMapper::new();
        let (_, importance, _) = mapper.analyze_query("Urgent issue here");

        assert_eq!(importance, 0.95);
    }

    #[test]
    fn test_analyze_query_normal_importance() {
        let mapper = ContextMapper::new();
        let (_, importance, _) = mapper.analyze_query("Regular question");

        assert_eq!(importance, 0.70);
    }

    #[test]
    fn test_analyze_query_immediate_urgency() {
        let mapper = ContextMapper::new();
        let (_, _, urgency) = mapper.analyze_query("I need this now!");

        assert_eq!(urgency, 0.90);
    }

    #[test]
    fn test_analyze_query_normal_urgency() {
        let mapper = ContextMapper::new();
        let (_, _, urgency) = mapper.analyze_query("When you have time");

        assert_eq!(urgency, 0.60);
    }

    #[test]
    fn test_map_to_engines_architecture() {
        let mapper = ContextMapper::new();
        let engines = mapper.map_to_engines("Architecture");

        assert!(engines.contains(&"SymbolicEngine".to_string()));
        assert!(engines.contains(&"StructuralEngine".to_string()));
    }

    #[test]
    fn test_map_to_engines_cognitive() {
        let mapper = ContextMapper::new();
        let engines = mapper.map_to_engines("Cognitive");

        assert!(engines.contains(&"CognitiveEngine".to_string()));
        assert!(engines.contains(&"MemoryCore".to_string()));
    }

    #[test]
    fn test_map_to_engines_technical() {
        let mapper = ContextMapper::new();
        let engines = mapper.map_to_engines("Technical");

        assert!(engines.contains(&"RepairCore".to_string()));
        assert!(engines.contains(&"ValidationEngine".to_string()));
    }

    #[test]
    fn test_map_to_engines_general() {
        let mapper = ContextMapper::new();
        let engines = mapper.map_to_engines("General");

        assert!(engines.contains(&"SingularityEngine".to_string()));
    }

    #[tokio::test]
    async fn test_map_context_basic() {
        let mapper = ContextMapper::new();
        let map = mapper.map_context("Test query".to_string()).await;

        assert_eq!(map.query, "Test query");
        assert!(map.timestamp > 0);
        assert!(!map.mapped_engines.is_empty());
    }

    #[tokio::test]
    async fn test_map_context_xp_potential() {
        let mapper = ContextMapper::new();
        let map = mapper.map_context("Critical task now!".to_string()).await;

        // importance * urgency = 0.95 * 0.90 = 0.855
        assert!((map.xp_potential - 0.855).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_map_context_impact() {
        let mapper = ContextMapper::new();
        let map = mapper.map_context("Test".to_string()).await;

        assert!(map.intention_vector.impact.contains_key("cognitive"));
        assert!(map.intention_vector.impact.contains_key("technical"));
        assert!(map.intention_vector.impact.contains_key("symbolic"));
    }

    #[tokio::test]
    async fn test_map_context_cross_domain_links() {
        let mapper = ContextMapper::new();
        let map = mapper.map_context("Test".to_string()).await;

        assert!(!map.intention_vector.cross_domain_links.is_empty());
    }

    #[tokio::test]
    async fn test_neuro_map_context_command() {
        let result = neuro_map_context("Test command".to_string()).await;
        assert!(result.is_ok());

        let map = result.expect("context mapping command should succeed");
        assert_eq!(map.query, "Test command");
    }

    #[test]
    fn test_analyze_query_case_insensitive() {
        let mapper = ContextMapper::new();
        let (domain1, _, _) = mapper.analyze_query("ARCHITECTURE");
        let (domain2, _, _) = mapper.analyze_query("architecture");

        assert_eq!(domain1, domain2);
    }
}
