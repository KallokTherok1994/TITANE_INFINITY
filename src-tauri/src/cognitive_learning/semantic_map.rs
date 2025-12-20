/**
 * TITANE∞ v∞ - Semantic Map (Carte Cognitive)
 * Le "cerveau" de TITANE∞
 */
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Concept {
    pub id: String,
    pub name: String,
    pub domain: String,
    pub weight: f32,
    pub confidence: f32,
    pub created_at: u64,
    pub last_accessed: u64,
    pub access_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relation {
    pub from: String,
    pub to: String,
    pub relation_type: RelationType,
    pub strength: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationType {
    IsA,
    PartOf,
    RelatedTo,
    Causes,
    Requires,
    Implements,
    Uses,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticMapState {
    pub concepts: HashMap<String, Concept>,
    pub relations: Vec<Relation>,
    pub domains: HashMap<String, Vec<String>>,
    pub total_concepts: usize,
    pub total_relations: usize,
    pub cognitive_depth: f32,
}

pub struct SemanticMap {
    concepts: HashMap<String, Concept>,
    relations: Vec<Relation>,
    domains: HashMap<String, Vec<String>>,
}

impl Default for SemanticMap {
    fn default() -> Self {
        Self::new()
    }
}

impl SemanticMap {
    pub fn new() -> Self {
        Self {
            concepts: HashMap::new(),
            relations: Vec::new(),
            domains: HashMap::new(),
        }
    }

    pub fn add_concept(&mut self, name: String, domain: String) -> String {
        let id = format!("concept_{}", uuid::Uuid::new_v4());
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or_else(|_| crate::core::utils::now_ms() / 1000);

        let concept = Concept {
            id: id.clone(),
            name: name.clone(),
            domain: domain.clone(),
            weight: 1.0,
            confidence: 0.5,
            created_at: timestamp,
            last_accessed: timestamp,
            access_count: 0,
        };

        self.concepts.insert(id.clone(), concept);
        self.domains.entry(domain).or_default().push(id.clone());

        id
    }

    pub fn add_relation(&mut self, from: String, to: String, relation_type: RelationType) {
        let relation = Relation {
            from,
            to,
            relation_type,
            strength: 0.5,
        };
        self.relations.push(relation);
    }

    pub fn strengthen_concept(&mut self, concept_id: &str, amount: f32) {
        if let Some(concept) = self.concepts.get_mut(concept_id) {
            concept.weight = (concept.weight + amount).min(10.0);
            concept.confidence = (concept.confidence + amount * 0.1).min(1.0);
            concept.access_count += 1;
            concept.last_accessed = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or_else(|_| crate::core::utils::now_ms() / 1000);
        }
    }

    pub fn find_related_concepts(&self, concept_id: &str) -> Vec<String> {
        self.relations
            .iter()
            .filter(|r| r.from == concept_id)
            .map(|r| r.to.clone())
            .collect()
    }

    pub fn get_state(&self) -> SemanticMapState {
        let cognitive_depth = self.calculate_depth();

        SemanticMapState {
            concepts: self.concepts.clone(),
            relations: self.relations.clone(),
            domains: self.domains.clone(),
            total_concepts: self.concepts.len(),
            total_relations: self.relations.len(),
            cognitive_depth,
        }
    }

    fn calculate_depth(&self) -> f32 {
        if self.concepts.is_empty() {
            return 0.0;
        }

        let avg_weight: f32 =
            self.concepts.values().map(|c| c.weight).sum::<f32>() / self.concepts.len() as f32;

        let relation_density = if self.concepts.len() > 1 {
            self.relations.len() as f32 / (self.concepts.len() * (self.concepts.len() - 1)) as f32
        } else {
            0.0
        };

        (avg_weight * 0.6 + relation_density * 10.0 * 0.4).min(10.0)
    }
}

#[tauri::command]
pub async fn cognitive_get_map() -> Result<SemanticMapState, String> {
    let map = SemanticMap::new();
    Ok(map.get_state())
}

#[tauri::command]
pub async fn cognitive_add_concept(name: String, domain: String) -> Result<String, String> {
    let mut map = SemanticMap::new();
    Ok(map.add_concept(name, domain))
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // RelationType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_relation_type_variants() {
        let types = vec![
            RelationType::IsA,
            RelationType::PartOf,
            RelationType::RelatedTo,
            RelationType::Causes,
            RelationType::Requires,
            RelationType::Implements,
            RelationType::Uses,
        ];
        assert_eq!(types.len(), 7);
    }

    #[test]
    fn test_relation_type_clone() {
        let rt = RelationType::Implements;
        let cloned = rt.clone();
        assert!(matches!(cloned, RelationType::Implements));
    }

    #[test]
    fn test_relation_type_debug() {
        let rt = RelationType::Causes;
        let debug_str = format!("{:?}", rt);
        assert!(debug_str.contains("Causes"));
    }

    #[test]
    fn test_relation_type_serialization() {
        let rt = RelationType::Uses;
        let json = serde_json::to_string(&rt).expect("RelationType should serialize to JSON");
        let restored: RelationType =
            serde_json::from_str(&json).expect("RelationType should deserialize from JSON");
        assert!(matches!(restored, RelationType::Uses));
    }

    // ─────────────────────────────────────────────────────────────
    // Concept Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_concept_creation() {
        let concept = Concept {
            id: "c-1".to_string(),
            name: "Rust".to_string(),
            domain: "Programming".to_string(),
            weight: 1.0,
            confidence: 0.5,
            created_at: 12345,
            last_accessed: 12345,
            access_count: 0,
        };
        assert_eq!(concept.name, "Rust");
        assert_eq!(concept.weight, 1.0);
    }

    #[test]
    fn test_concept_clone() {
        let concept = Concept {
            id: "id".to_string(),
            name: "Test".to_string(),
            domain: "Domain".to_string(),
            weight: 2.5,
            confidence: 0.8,
            created_at: 100,
            last_accessed: 200,
            access_count: 5,
        };
        let cloned = concept.clone();
        assert_eq!(cloned.weight, 2.5);
        assert_eq!(cloned.access_count, 5);
    }

    #[test]
    fn test_concept_debug() {
        let concept = Concept {
            id: "x".to_string(),
            name: "y".to_string(),
            domain: "z".to_string(),
            weight: 0.0,
            confidence: 0.0,
            created_at: 0,
            last_accessed: 0,
            access_count: 0,
        };
        let debug_str = format!("{:?}", concept);
        assert!(debug_str.contains("Concept"));
    }

    #[test]
    fn test_concept_serialization() {
        let concept = Concept {
            id: "concept-123".to_string(),
            name: "AI".to_string(),
            domain: "Tech".to_string(),
            weight: 3.5,
            confidence: 0.9,
            created_at: 999,
            last_accessed: 1000,
            access_count: 10,
        };
        let json = serde_json::to_string(&concept).expect("Concept should serialize to JSON");
        let restored: Concept =
            serde_json::from_str(&json).expect("Concept should deserialize from JSON");
        assert_eq!(restored.name, "AI");
        assert_eq!(restored.weight, 3.5);
    }

    // ─────────────────────────────────────────────────────────────
    // Relation Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_relation_creation() {
        let relation = Relation {
            from: "a".to_string(),
            to: "b".to_string(),
            relation_type: RelationType::IsA,
            strength: 0.7,
        };
        assert_eq!(relation.from, "a");
        assert_eq!(relation.strength, 0.7);
    }

    #[test]
    fn test_relation_clone() {
        let relation = Relation {
            from: "x".to_string(),
            to: "y".to_string(),
            relation_type: RelationType::PartOf,
            strength: 0.5,
        };
        let cloned = relation.clone();
        assert_eq!(cloned.strength, 0.5);
    }

    #[test]
    fn test_relation_debug() {
        let relation = Relation {
            from: "a".to_string(),
            to: "b".to_string(),
            relation_type: RelationType::RelatedTo,
            strength: 0.0,
        };
        let debug_str = format!("{:?}", relation);
        assert!(debug_str.contains("Relation"));
    }

    #[test]
    fn test_relation_serialization() {
        let relation = Relation {
            from: "concept1".to_string(),
            to: "concept2".to_string(),
            relation_type: RelationType::Requires,
            strength: 0.85,
        };
        let json = serde_json::to_string(&relation).expect("Relation should serialize to JSON");
        let restored: Relation =
            serde_json::from_str(&json).expect("Relation should deserialize from JSON");
        assert_eq!(restored.from, "concept1");
        assert_eq!(restored.strength, 0.85);
    }

    // ─────────────────────────────────────────────────────────────
    // SemanticMapState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_semantic_map_state_creation() {
        let state = SemanticMapState {
            concepts: HashMap::new(),
            relations: vec![],
            domains: HashMap::new(),
            total_concepts: 0,
            total_relations: 0,
            cognitive_depth: 0.0,
        };
        assert_eq!(state.total_concepts, 0);
    }

    #[test]
    fn test_semantic_map_state_clone() {
        let state = SemanticMapState {
            concepts: HashMap::new(),
            relations: vec![],
            domains: HashMap::new(),
            total_concepts: 5,
            total_relations: 10,
            cognitive_depth: 3.5,
        };
        let cloned = state.clone();
        assert_eq!(cloned.cognitive_depth, 3.5);
    }

    #[test]
    fn test_semantic_map_state_debug() {
        let state = SemanticMapState {
            concepts: HashMap::new(),
            relations: vec![],
            domains: HashMap::new(),
            total_concepts: 0,
            total_relations: 0,
            cognitive_depth: 0.0,
        };
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("SemanticMapState"));
    }

    #[test]
    fn test_semantic_map_state_serialization() {
        let state = SemanticMapState {
            concepts: HashMap::new(),
            relations: vec![],
            domains: HashMap::new(),
            total_concepts: 10,
            total_relations: 20,
            cognitive_depth: 5.0,
        };
        let json =
            serde_json::to_string(&state).expect("SemanticMapState should serialize to JSON");
        let restored: SemanticMapState =
            serde_json::from_str(&json).expect("SemanticMapState should deserialize from JSON");
        assert_eq!(restored.total_concepts, 10);
    }

    // ─────────────────────────────────────────────────────────────
    // SemanticMap Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_semantic_map_new() {
        let map = SemanticMap::new();
        assert!(map.concepts.is_empty());
        assert!(map.relations.is_empty());
        assert!(map.domains.is_empty());
    }

    #[test]
    fn test_semantic_map_default() {
        let map = SemanticMap::default();
        assert!(map.concepts.is_empty());
    }

    #[test]
    fn test_add_concept() {
        let mut map = SemanticMap::new();
        let id = map.add_concept("Rust".to_string(), "Programming".to_string());

        assert!(id.starts_with("concept_"));
        assert_eq!(map.concepts.len(), 1);

        let concept = map
            .concepts
            .get(&id)
            .expect("concept should exist after add_concept");
        assert_eq!(concept.name, "Rust");
        assert_eq!(concept.domain, "Programming");
        assert_eq!(concept.weight, 1.0);
        assert_eq!(concept.confidence, 0.5);
    }

    #[test]
    fn test_add_concept_updates_domains() {
        let mut map = SemanticMap::new();
        let id1 = map.add_concept("Rust".to_string(), "Programming".to_string());
        let id2 = map.add_concept("Python".to_string(), "Programming".to_string());
        let _id3 = map.add_concept("Design".to_string(), "Art".to_string());

        let prog_domain = map
            .domains
            .get("Programming")
            .expect("Programming domain should exist after adding concepts");
        assert!(prog_domain.contains(&id1));
        assert!(prog_domain.contains(&id2));
        assert_eq!(prog_domain.len(), 2);

        let art_domain = map
            .domains
            .get("Art")
            .expect("Art domain should exist after adding concepts");
        assert_eq!(art_domain.len(), 1);
    }

    #[test]
    fn test_add_relation() {
        let mut map = SemanticMap::new();
        let id1 = map.add_concept("Cat".to_string(), "Animals".to_string());
        let id2 = map.add_concept("Animal".to_string(), "Biology".to_string());

        map.add_relation(id1.clone(), id2.clone(), RelationType::IsA);

        assert_eq!(map.relations.len(), 1);
        assert_eq!(map.relations[0].from, id1);
        assert_eq!(map.relations[0].to, id2);
        assert_eq!(map.relations[0].strength, 0.5);
    }

    #[test]
    fn test_strengthen_concept() {
        let mut map = SemanticMap::new();
        let id = map.add_concept("Test".to_string(), "Domain".to_string());

        let initial_weight = map
            .concepts
            .get(&id)
            .expect("concept should exist after add_concept")
            .weight;
        map.strengthen_concept(&id, 0.5);

        let concept = map
            .concepts
            .get(&id)
            .expect("concept should exist after strengthen_concept");
        assert!(concept.weight > initial_weight);
        assert_eq!(concept.access_count, 1);
    }

    #[test]
    fn test_strengthen_concept_capped() {
        let mut map = SemanticMap::new();
        let id = map.add_concept("Test".to_string(), "Domain".to_string());

        // Strengthen many times
        for _ in 0..50 {
            map.strengthen_concept(&id, 1.0);
        }

        let concept = map
            .concepts
            .get(&id)
            .expect("concept should exist after add_concept");
        assert!(concept.weight <= 10.0);
        assert!(concept.confidence <= 1.0);
    }

    #[test]
    fn test_strengthen_concept_nonexistent() {
        let mut map = SemanticMap::new();
        // Should not panic
        map.strengthen_concept("nonexistent", 1.0);
    }

    #[test]
    fn test_find_related_concepts() {
        let mut map = SemanticMap::new();
        let id1 = map.add_concept("A".to_string(), "D".to_string());
        let id2 = map.add_concept("B".to_string(), "D".to_string());
        let id3 = map.add_concept("C".to_string(), "D".to_string());

        map.add_relation(id1.clone(), id2.clone(), RelationType::RelatedTo);
        map.add_relation(id1.clone(), id3.clone(), RelationType::Uses);

        let related = map.find_related_concepts(&id1);
        assert_eq!(related.len(), 2);
        assert!(related.contains(&id2));
        assert!(related.contains(&id3));
    }

    #[test]
    fn test_find_related_concepts_empty() {
        let map = SemanticMap::new();
        let related = map.find_related_concepts("nonexistent");
        assert!(related.is_empty());
    }

    #[test]
    fn test_get_state() {
        let mut map = SemanticMap::new();
        let id1 = map.add_concept("A".to_string(), "D".to_string());
        let id2 = map.add_concept("B".to_string(), "D".to_string());
        map.add_relation(id1, id2, RelationType::PartOf);

        let state = map.get_state();
        assert_eq!(state.total_concepts, 2);
        assert_eq!(state.total_relations, 1);
        assert!(state.cognitive_depth > 0.0);
    }

    #[test]
    fn test_calculate_depth_empty() {
        let map = SemanticMap::new();
        let depth = map.calculate_depth();
        assert_eq!(depth, 0.0);
    }

    #[test]
    fn test_calculate_depth_single_concept() {
        let mut map = SemanticMap::new();
        map.add_concept("Single".to_string(), "Domain".to_string());

        let depth = map.calculate_depth();
        // avg_weight=1.0, relation_density=0
        // depth = 1.0 * 0.6 + 0 * 0.4 = 0.6
        assert!((depth - 0.6).abs() < 0.01);
    }

    #[test]
    fn test_calculate_depth_with_relations() {
        let mut map = SemanticMap::new();
        let id1 = map.add_concept("A".to_string(), "D".to_string());
        let id2 = map.add_concept("B".to_string(), "D".to_string());
        map.add_relation(id1.clone(), id2.clone(), RelationType::Uses);
        map.add_relation(id2, id1, RelationType::Uses);

        let depth = map.calculate_depth();
        // Should be higher due to relations
        assert!(depth > 0.6);
    }

    // ─────────────────────────────────────────────────────────────
    // Tauri Command Tests
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_tauri_cognitive_get_map() {
        let result = cognitive_get_map().await;
        assert!(result.is_ok());
        let state = result.expect("cognitive_get_map should succeed");
        assert_eq!(state.total_concepts, 0);
    }

    #[tokio::test]
    async fn test_tauri_cognitive_add_concept() {
        let result = cognitive_add_concept("Test".to_string(), "Domain".to_string()).await;
        assert!(result.is_ok());
        let id = result.expect("cognitive_add_concept should succeed");
        assert!(id.starts_with("concept_"));
    }
}
