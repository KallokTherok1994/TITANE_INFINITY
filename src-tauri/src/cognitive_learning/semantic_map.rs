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
            .unwrap()
            .as_secs();

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
        self.domains.entry(domain)
            .or_default()
            .push(id.clone());

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
                .unwrap()
                .as_secs();
        }
    }

    pub fn find_related_concepts(&self, concept_id: &str) -> Vec<String> {
        self.relations.iter()
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

        let avg_weight: f32 = self.concepts.values()
            .map(|c| c.weight)
            .sum::<f32>() / self.concepts.len() as f32;

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
