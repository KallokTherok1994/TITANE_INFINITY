// TITANE∞ v13 - Knowledge Graph
// Graphe de connaissance pour relations sémantiques

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Nœud du graphe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeNode {
    pub id: String,
    pub doc_id: String,
    pub title: String,
    pub node_type: NodeType,
    pub metadata: HashMap<String, String>,
}

/// Type de nœud
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum NodeType {
    Document,
    Concept,
    Entity,
    Topic,
}

/// Arête du graphe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeEdge {
    pub from_id: String,
    pub to_id: String,
    pub relation_type: RelationType,
    pub weight: f32,
}

/// Type de relation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RelationType {
    Similar,
    References,
    DerivedFrom,
    PartOf,
    Related,
}

/// Graphe de connaissance
pub struct KnowledgeGraph {
    nodes: HashMap<String, KnowledgeNode>,
    edges: Vec<KnowledgeEdge>,
}

impl KnowledgeGraph {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            edges: Vec::new(),
        }
    }

    pub fn add_node(&mut self, node: KnowledgeNode) {
        self.nodes.insert(node.id.clone(), node);
    }

    pub fn add_edge(&mut self, edge: KnowledgeEdge) {
        self.edges.push(edge);
    }

    pub fn get_node(&self, id: &str) -> Option<&KnowledgeNode> {
        self.nodes.get(id)
    }

    pub fn find_related(&self, node_id: &str) -> Vec<&KnowledgeNode> {
        let related_ids: Vec<&str> = self.edges
            .iter()
            .filter(|e| e.from_id == node_id)
            .map(|e| e.to_id.as_str())
            .collect();

        related_ids
            .into_iter()
            .filter_map(|id| self.nodes.get(id))
            .collect()
    }
}

impl Default for KnowledgeGraph {
    fn default() -> Self {
        Self::new()
    }
}
