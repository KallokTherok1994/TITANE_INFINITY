//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ Context Graph Builder v∞
//!   SP-COGN-002: Personal Knowledge Graph for Contextual Intelligence
//! ═══════════════════════════════════════════════════════════════
//!
//! Architecture:
//! - Entity extraction from conversations
//! - Relationship inference and weighting
//! - Temporal decay for relevance
//! - Query expansion using graph traversal

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

// ────────────────────────────────────────────────────────────────
// Entity Types
// ────────────────────────────────────────────────────────────────

/// Types of entities that can exist in the graph
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EntityType {
    Person,
    Organization,
    Location,
    Concept,
    Technology,
    Project,
    Event,
    Emotion,
    Preference,
    Skill,
    Goal,
    Custom(String),
}

impl EntityType {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "person" | "user" | "name" => EntityType::Person,
            "organization" | "company" | "org" => EntityType::Organization,
            "location" | "place" | "city" | "country" => EntityType::Location,
            "concept" | "idea" | "theory" => EntityType::Concept,
            "technology" | "tech" | "tool" | "framework" => EntityType::Technology,
            "project" | "repo" | "codebase" => EntityType::Project,
            "event" | "meeting" | "deadline" => EntityType::Event,
            "emotion" | "feeling" | "mood" => EntityType::Emotion,
            "preference" | "like" | "dislike" => EntityType::Preference,
            "skill" | "ability" | "expertise" => EntityType::Skill,
            "goal" | "objective" | "target" => EntityType::Goal,
            other => EntityType::Custom(other.to_string()),
        }
    }
}

// ────────────────────────────────────────────────────────────────
// Relationship Types
// ────────────────────────────────────────────────────────────────

/// Types of relationships between entities
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RelationType {
    // Personal relationships
    KnowsAbout,
    Likes,
    Dislikes,
    Uses,
    WorksOn,
    WorksWith,
    BelongsTo,

    // Semantic relationships
    IsA,
    PartOf,
    RelatedTo,
    SimilarTo,
    OppositeOf,
    Requires,
    Enables,

    // Temporal relationships
    Before,
    After,
    During,
    Caused,

    // Custom
    Custom(String),
}

impl RelationType {
    pub fn weight(&self) -> f32 {
        match self {
            RelationType::IsA => 1.0,
            RelationType::PartOf => 0.9,
            RelationType::Requires => 0.85,
            RelationType::Enables => 0.85,
            RelationType::Uses => 0.8,
            RelationType::WorksOn => 0.8,
            RelationType::KnowsAbout => 0.7,
            RelationType::RelatedTo => 0.5,
            RelationType::SimilarTo => 0.6,
            RelationType::Likes => 0.75,
            RelationType::Dislikes => 0.75,
            RelationType::WorksWith => 0.7,
            RelationType::BelongsTo => 0.8,
            RelationType::OppositeOf => 0.6,
            RelationType::Before => 0.4,
            RelationType::After => 0.4,
            RelationType::During => 0.5,
            RelationType::Caused => 0.7,
            RelationType::Custom(_) => 0.5,
        }
    }

    pub fn is_bidirectional(&self) -> bool {
        matches!(
            self,
            RelationType::RelatedTo
                | RelationType::SimilarTo
                | RelationType::OppositeOf
                | RelationType::WorksWith
        )
    }
}

// ────────────────────────────────────────────────────────────────
// Graph Nodes and Edges
// ────────────────────────────────────────────────────────────────

/// Unique identifier for nodes
pub type NodeId = u64;

/// A node in the context graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: NodeId,
    pub name: String,
    pub entity_type: EntityType,
    pub aliases: HashSet<String>,
    pub attributes: HashMap<String, String>,
    pub created_at: u64,
    pub last_accessed: u64,
    pub access_count: u32,
    pub importance: f32,
    pub embedding: Option<Vec<f32>>,
}

impl GraphNode {
    pub fn new(id: NodeId, name: String, entity_type: EntityType) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        Self {
            id,
            name,
            entity_type,
            aliases: HashSet::new(),
            attributes: HashMap::new(),
            created_at: now,
            last_accessed: now,
            access_count: 1,
            importance: 0.5,
            embedding: None,
        }
    }

    pub fn touch(&mut self) {
        self.last_accessed = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        self.access_count += 1;
    }

    /// Calculate temporal decay (older = less relevant)
    pub fn temporal_weight(&self) -> f32 {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let age_hours = (now - self.last_accessed) as f32 / 3600.0;
        let decay_factor = (-age_hours / 168.0).exp(); // Week half-life

        self.importance * decay_factor * (1.0 + (self.access_count as f32).ln())
    }
}

/// An edge connecting two nodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphEdge {
    pub from: NodeId,
    pub to: NodeId,
    pub relation: RelationType,
    pub weight: f32,
    pub confidence: f32,
    pub evidence: Vec<String>,
    pub created_at: u64,
    pub last_reinforced: u64,
    pub reinforcement_count: u32,
}

impl GraphEdge {
    pub fn new(from: NodeId, to: NodeId, relation: RelationType) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        Self {
            from,
            to,
            relation: relation.clone(),
            weight: relation.weight(),
            confidence: 0.5,
            evidence: Vec::new(),
            created_at: now,
            last_reinforced: now,
            reinforcement_count: 1,
        }
    }

    pub fn reinforce(&mut self, evidence: Option<String>) {
        self.last_reinforced = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        self.reinforcement_count += 1;

        // Increase confidence with reinforcement (max 0.99)
        self.confidence = (self.confidence + 0.1 * (1.0 - self.confidence)).min(0.99);

        if let Some(ev) = evidence {
            if self.evidence.len() < 10 {
                self.evidence.push(ev);
            }
        }
    }

    pub fn effective_weight(&self) -> f32 {
        self.weight * self.confidence
    }
}

// ────────────────────────────────────────────────────────────────
// Context Graph
// ────────────────────────────────────────────────────────────────

/// Configuration for the context graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextGraphConfig {
    pub max_nodes: usize,
    pub max_edges_per_node: usize,
    pub decay_half_life_hours: f32,
    pub min_confidence_threshold: f32,
    pub enable_auto_inference: bool,
    pub max_traversal_depth: usize,
}

impl Default for ContextGraphConfig {
    fn default() -> Self {
        Self {
            max_nodes: 10000,
            max_edges_per_node: 50,
            decay_half_life_hours: 168.0, // 1 week
            min_confidence_threshold: 0.3,
            enable_auto_inference: true,
            max_traversal_depth: 4,
        }
    }
}

/// The main context graph structure
pub struct ContextGraph {
    nodes: RwLock<HashMap<NodeId, GraphNode>>,
    edges: RwLock<HashMap<NodeId, Vec<GraphEdge>>>,
    name_index: RwLock<HashMap<String, NodeId>>,
    next_id: AtomicU64,
    config: ContextGraphConfig,
    metrics: GraphMetrics,
}

impl ContextGraph {
    pub fn new(config: ContextGraphConfig) -> Self {
        Self {
            nodes: RwLock::new(HashMap::new()),
            edges: RwLock::new(HashMap::new()),
            name_index: RwLock::new(HashMap::new()),
            next_id: AtomicU64::new(1),
            config,
            metrics: GraphMetrics::new(),
        }
    }

    /// Add or get existing node by name
    pub fn get_or_create_node(&self, name: &str, entity_type: EntityType) -> NodeId {
        let normalized = name.to_lowercase().trim().to_string();

        // Check if exists
        {
            let index = self.name_index.read();
            if let Some(&id) = index.get(&normalized) {
                // Touch the node
                let mut nodes = self.nodes.write();
                if let Some(node) = nodes.get_mut(&id) {
                    node.touch();
                }
                return id;
            }
        }

        // Create new node
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let node = GraphNode::new(id, name.to_string(), entity_type);

        {
            let mut nodes = self.nodes.write();
            let mut index = self.name_index.write();

            nodes.insert(id, node);
            index.insert(normalized, id);
        }

        self.metrics.nodes_created.fetch_add(1, Ordering::Relaxed);
        id
    }

    /// Add an edge between two nodes
    pub fn add_edge(
        &self,
        from: NodeId,
        to: NodeId,
        relation: RelationType,
        evidence: Option<String>,
    ) {
        let mut edges = self.edges.write();

        let node_edges = edges.entry(from).or_insert_with(Vec::new);

        // Check if edge already exists
        if let Some(existing) = node_edges
            .iter_mut()
            .find(|e| e.to == to && e.relation == relation)
        {
            existing.reinforce(evidence);
            self.metrics
                .edges_reinforced
                .fetch_add(1, Ordering::Relaxed);
        } else {
            // Create new edge
            let mut edge = GraphEdge::new(from, to, relation.clone());
            if let Some(ev) = evidence {
                edge.evidence.push(ev);
            }

            // Respect max edges per node
            if node_edges.len() >= self.config.max_edges_per_node {
                // Remove weakest edge
                if let Some(min_idx) = node_edges
                    .iter()
                    .enumerate()
                    .min_by(|(_, a), (_, b)| {
                        a.effective_weight()
                            .partial_cmp(&b.effective_weight())
                            .unwrap()
                    })
                    .map(|(i, _)| i)
                {
                    node_edges.remove(min_idx);
                }
            }

            node_edges.push(edge);
            self.metrics.edges_created.fetch_add(1, Ordering::Relaxed);

            // Add reverse edge if bidirectional
            if relation.is_bidirectional() {
                drop(edges);
                self.add_edge(to, from, relation, None);
            }
        }
    }

    /// Get node by ID
    pub fn get_node(&self, id: NodeId) -> Option<GraphNode> {
        self.nodes.read().get(&id).cloned()
    }

    /// Get node by name
    pub fn get_node_by_name(&self, name: &str) -> Option<GraphNode> {
        let normalized = name.to_lowercase().trim().to_string();
        let id = self.name_index.read().get(&normalized).copied()?;
        self.get_node(id)
    }

    /// Get all edges from a node
    pub fn get_edges(&self, from: NodeId) -> Vec<GraphEdge> {
        self.edges.read().get(&from).cloned().unwrap_or_default()
    }

    /// Find related entities using BFS traversal
    pub fn find_related(
        &self,
        start: NodeId,
        max_depth: Option<usize>,
        min_weight: Option<f32>,
    ) -> Vec<(NodeId, f32, usize)> {
        let max_d = max_depth.unwrap_or(self.config.max_traversal_depth);
        let min_w = min_weight.unwrap_or(self.config.min_confidence_threshold);

        let mut visited: HashMap<NodeId, (f32, usize)> = HashMap::new();
        let mut queue: VecDeque<(NodeId, f32, usize)> = VecDeque::new();

        queue.push_back((start, 1.0, 0));
        visited.insert(start, (1.0, 0));

        let edges = self.edges.read();

        while let Some((current, weight, depth)) = queue.pop_front() {
            if depth >= max_d {
                continue;
            }

            if let Some(node_edges) = edges.get(&current) {
                for edge in node_edges {
                    let new_weight = weight * edge.effective_weight();

                    if new_weight < min_w {
                        continue;
                    }

                    let new_depth = depth + 1;

                    let should_visit = visited
                        .get(&edge.to)
                        .map(|(w, _)| new_weight > *w)
                        .unwrap_or(true);

                    if should_visit {
                        visited.insert(edge.to, (new_weight, new_depth));
                        queue.push_back((edge.to, new_weight, new_depth));
                    }
                }
            }
        }

        self.metrics.queries.fetch_add(1, Ordering::Relaxed);

        let mut results: Vec<_> = visited
            .into_iter()
            .filter(|(id, _)| *id != start)
            .map(|(id, (w, d))| (id, w, d))
            .collect();

        // Sort by weight descending
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        results
    }

    /// Query expansion: find semantically related terms
    pub fn expand_query(&self, terms: &[&str]) -> Vec<(String, f32)> {
        let mut expansions: HashMap<String, f32> = HashMap::new();

        for term in terms {
            if let Some(node) = self.get_node_by_name(term) {
                // Add the term itself with high weight
                expansions.insert(node.name.clone(), 1.0);

                // Add aliases
                for alias in &node.aliases {
                    let entry = expansions.entry(alias.clone()).or_insert(0.0);
                    *entry = entry.max(0.9);
                }

                // Find related nodes
                let related = self.find_related(node.id, Some(2), Some(0.4));

                for (related_id, weight, _) in related {
                    if let Some(related_node) = self.get_node(related_id) {
                        let entry = expansions.entry(related_node.name.clone()).or_insert(0.0);
                        *entry = entry.max(weight);
                    }
                }
            }
        }

        let mut results: Vec<_> = expansions.into_iter().collect();
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        results
    }

    /// Extract entities from text (simple pattern matching)
    pub fn extract_entities(&self, text: &str) -> Vec<(String, EntityType, f32)> {
        let mut entities = Vec::new();

        // Check against known nodes
        let nodes = self.nodes.read();
        let name_index = self.name_index.read();

        let text_lower = text.to_lowercase();
        let words: Vec<&str> = text_lower.split_whitespace().collect();

        for (name, &id) in name_index.iter() {
            if text_lower.contains(name) {
                if let Some(node) = nodes.get(&id) {
                    entities.push((node.name.clone(), node.entity_type.clone(), 0.9));
                }
            }
        }

        // Pattern-based extraction (simplified)
        let tech_patterns = [
            "rust",
            "python",
            "javascript",
            "typescript",
            "react",
            "vue",
            "angular",
            "node",
            "docker",
            "kubernetes",
            "aws",
            "azure",
            "gcp",
            "api",
            "sql",
            "mongodb",
            "redis",
            "graphql",
            "rest",
        ];

        for pattern in &tech_patterns {
            if words.contains(pattern) {
                entities.push((pattern.to_string(), EntityType::Technology, 0.7));
            }
        }

        // Deduplicate
        entities.sort_by(|a, b| a.0.cmp(&b.0));
        entities.dedup_by(|a, b| a.0 == b.0);

        entities
    }

    /// Learn from a conversation message
    pub fn learn_from_message(&self, message: &str, is_user: bool) {
        let entities = self.extract_entities(message);

        // Create nodes for new entities
        let mut node_ids: Vec<NodeId> = Vec::new();

        for (name, entity_type, _confidence) in entities {
            let id = self.get_or_create_node(&name, entity_type);
            node_ids.push(id);
        }

        // Create relationships between co-occurring entities
        if self.config.enable_auto_inference {
            for i in 0..node_ids.len() {
                for j in (i + 1)..node_ids.len() {
                    let evidence = if is_user {
                        Some(format!(
                            "User mentioned together: {}",
                            &message[..50.min(message.len())]
                        ))
                    } else {
                        Some(format!(
                            "Assistant context: {}",
                            &message[..50.min(message.len())]
                        ))
                    };

                    self.add_edge(node_ids[i], node_ids[j], RelationType::RelatedTo, evidence);
                }
            }
        }

        self.metrics
            .messages_processed
            .fetch_add(1, Ordering::Relaxed);
    }

    /// Get graph statistics
    pub fn stats(&self) -> GraphStats {
        let nodes = self.nodes.read();
        let edges = self.edges.read();

        let total_edges: usize = edges.values().map(|v| v.len()).sum();

        GraphStats {
            node_count: nodes.len(),
            edge_count: total_edges,
            avg_edges_per_node: if nodes.is_empty() {
                0.0
            } else {
                total_edges as f64 / nodes.len() as f64
            },
            metrics: self.metrics.snapshot(),
        }
    }

    /// Prune low-relevance nodes
    pub fn prune(&self, min_weight: f32) -> usize {
        let mut nodes = self.nodes.write();
        let mut edges = self.edges.write();
        let mut index = self.name_index.write();

        let to_remove: Vec<NodeId> = nodes
            .iter()
            .filter(|(_, node)| node.temporal_weight() < min_weight)
            .map(|(&id, _)| id)
            .collect();

        let removed_count = to_remove.len();

        for id in to_remove {
            if let Some(node) = nodes.remove(&id) {
                let normalized = node.name.to_lowercase();
                index.remove(&normalized);
            }
            edges.remove(&id);

            // Remove incoming edges
            for edge_list in edges.values_mut() {
                edge_list.retain(|e| e.to != id);
            }
        }

        removed_count
    }

    /// Serialize graph to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        let nodes: Vec<GraphNode> = self.nodes.read().values().cloned().collect();
        let edges: Vec<GraphEdge> = self.edges.read().values().flat_map(|v| v.clone()).collect();

        let export = GraphExport { nodes, edges };
        serde_json::to_string_pretty(&export)
    }

    /// Load graph from JSON
    pub fn from_json(json: &str, config: ContextGraphConfig) -> Result<Self, serde_json::Error> {
        let import: GraphExport = serde_json::from_str(json)?;
        let graph = Self::new(config);

        // Find max ID
        let max_id = import.nodes.iter().map(|n| n.id).max().unwrap_or(0);
        graph.next_id.store(max_id + 1, Ordering::SeqCst);

        // Insert nodes
        {
            let mut nodes = graph.nodes.write();
            let mut index = graph.name_index.write();

            for node in import.nodes {
                let normalized = node.name.to_lowercase();
                index.insert(normalized, node.id);
                nodes.insert(node.id, node);
            }
        }

        // Insert edges
        {
            let mut edges = graph.edges.write();
            for edge in import.edges {
                edges.entry(edge.from).or_insert_with(Vec::new).push(edge);
            }
        }

        Ok(graph)
    }
}

impl Default for ContextGraph {
    fn default() -> Self {
        Self::new(ContextGraphConfig::default())
    }
}

// ────────────────────────────────────────────────────────────────
// Metrics & Export
// ────────────────────────────────────────────────────────────────

#[derive(Debug, Default)]
pub struct GraphMetrics {
    pub nodes_created: AtomicU64,
    pub edges_created: AtomicU64,
    pub edges_reinforced: AtomicU64,
    pub queries: AtomicU64,
    pub messages_processed: AtomicU64,
}

impl GraphMetrics {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn snapshot(&self) -> GraphMetricsSnapshot {
        GraphMetricsSnapshot {
            nodes_created: self.nodes_created.load(Ordering::Relaxed),
            edges_created: self.edges_created.load(Ordering::Relaxed),
            edges_reinforced: self.edges_reinforced.load(Ordering::Relaxed),
            queries: self.queries.load(Ordering::Relaxed),
            messages_processed: self.messages_processed.load(Ordering::Relaxed),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphMetricsSnapshot {
    pub nodes_created: u64,
    pub edges_created: u64,
    pub edges_reinforced: u64,
    pub queries: u64,
    pub messages_processed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphStats {
    pub node_count: usize,
    pub edge_count: usize,
    pub avg_edges_per_node: f64,
    pub metrics: GraphMetricsSnapshot,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GraphExport {
    nodes: Vec<GraphNode>,
    edges: Vec<GraphEdge>,
}

// ────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_nodes() {
        let graph = ContextGraph::default();

        let rust_id = graph.get_or_create_node("Rust", EntityType::Technology);
        let rust_id2 = graph.get_or_create_node("rust", EntityType::Technology);

        // Same node (case insensitive)
        assert_eq!(rust_id, rust_id2);

        let stats = graph.stats();
        assert_eq!(stats.node_count, 1);
    }

    #[test]
    fn test_add_edges() {
        let graph = ContextGraph::default();

        let rust_id = graph.get_or_create_node("Rust", EntityType::Technology);
        let cargo_id = graph.get_or_create_node("Cargo", EntityType::Technology);

        graph.add_edge(
            rust_id,
            cargo_id,
            RelationType::Uses,
            Some("Build system".to_string()),
        );

        let edges = graph.get_edges(rust_id);
        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].to, cargo_id);
    }

    #[test]
    fn test_find_related() {
        let graph = ContextGraph::default();

        let rust_id = graph.get_or_create_node("Rust", EntityType::Technology);
        let cargo_id = graph.get_or_create_node("Cargo", EntityType::Technology);
        let crates_id = graph.get_or_create_node("crates.io", EntityType::Technology);

        graph.add_edge(rust_id, cargo_id, RelationType::Uses, None);
        graph.add_edge(cargo_id, crates_id, RelationType::Uses, None);

        let related = graph.find_related(rust_id, Some(3), Some(0.1));

        // Should find both cargo and crates.io
        assert!(related.len() >= 2);
    }

    #[test]
    fn test_query_expansion() {
        let graph = ContextGraph::default();

        let rust_id = graph.get_or_create_node("Rust", EntityType::Technology);
        let tauri_id = graph.get_or_create_node("Tauri", EntityType::Technology);

        graph.add_edge(rust_id, tauri_id, RelationType::Enables, None);

        let expansions = graph.expand_query(&["rust"]);
        assert!(!expansions.is_empty());
        assert!(expansions.iter().any(|(name, _)| name == "Rust"));
    }

    #[test]
    fn test_learn_from_message() {
        let graph = ContextGraph::default();

        graph.learn_from_message("I'm using Rust and TypeScript for this project", true);

        let stats = graph.stats();
        assert!(stats.node_count >= 2);
    }

    #[test]
    fn test_serialization() {
        let graph = ContextGraph::default();

        let rust_id = graph.get_or_create_node("Rust", EntityType::Technology);
        let cargo_id = graph.get_or_create_node("Cargo", EntityType::Technology);
        graph.add_edge(rust_id, cargo_id, RelationType::Uses, None);

        let json = graph.to_json().unwrap();
        let loaded = ContextGraph::from_json(&json, ContextGraphConfig::default()).unwrap();

        let stats = loaded.stats();
        assert_eq!(stats.node_count, 2);
    }
}
