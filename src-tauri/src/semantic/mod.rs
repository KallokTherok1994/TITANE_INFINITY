// TITANE∞ v13 - Semantic Search Engine
// Moteur de recherche sémantique avec indexation vectorielle et graphe de connaissance

pub mod embedder;
pub mod vector_store;
pub mod indexer;
pub mod query;
pub mod reranker;
pub mod graph;
pub mod context;
pub mod storage;
pub mod selfheal;
pub mod utils;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration du moteur sémantique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticConfig {
    pub vector_dimensions: usize,
    pub similarity_threshold: f32,
    pub max_results: usize,
    pub enable_reranking: bool,
    pub enable_graph: bool,
}

impl Default for SemanticConfig {
    fn default() -> Self {
        Self {
            vector_dimensions: 384,
            similarity_threshold: 0.7,
            max_results: 20,
            enable_reranking: true,
            enable_graph: true,
        }
    }
}

/// Document indexé
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexedDocument {
    pub id: String,
    pub title: String,
    pub content: String,
    pub doc_type: String,
    pub metadata: HashMap<String, String>,
    pub embedding: Vec<f32>,
    pub chunks: Vec<DocumentChunk>,
    pub indexed_at: chrono::DateTime<chrono::Utc>,
}

/// Fragment de document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentChunk {
    pub id: String,
    pub content: String,
    pub start_pos: usize,
    pub end_pos: usize,
    pub embedding: Vec<f32>,
    pub section_title: Option<String>,
}

/// Requête de recherche
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub text: String,
    pub filters: Option<SearchFilters>,
    pub context: Option<String>,
    pub intent: Option<SearchIntent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchFilters {
    pub doc_types: Option<Vec<String>>,
    pub date_range: Option<DateRange>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DateRange {
    pub start: chrono::DateTime<chrono::Utc>,
    pub end: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SearchIntent {
    Informational,      // Cherche à comprendre
    Navigational,       // Cherche un document spécifique
    Transactional,      // Cherche à accomplir une action
    Exploratory,        // Exploration conceptuelle
}

/// Résultat de recherche
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub document: IndexedDocument,
    pub score: f32,
    pub matched_chunks: Vec<MatchedChunk>,
    pub highlights: Vec<String>,
    pub related_concepts: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchedChunk {
    pub chunk: DocumentChunk,
    pub score: f32,
    pub relevance_explanation: String,
}

/// Réponse de recherche complète
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResponse {
    pub results: Vec<SearchResult>,
    pub total_found: usize,
    pub query_time_ms: u64,
    pub reranked: bool,
    pub suggestions: Vec<String>,
    pub related_queries: Vec<String>,
}

/// Nœud du graphe de connaissance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeNode {
    pub id: String,
    pub label: String,
    pub node_type: NodeType,
    pub properties: HashMap<String, String>,
    pub embedding: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeType {
    Document,
    Concept,
    Topic,
    Entity,
    Module,
}

/// Relation entre nœuds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeEdge {
    pub from: String,
    pub to: String,
    pub relation_type: RelationType,
    pub strength: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationType {
    Related,
    Depends,
    Contains,
    References,
    Similar,
    Extends,
}

/// Graphe de connaissance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeGraph {
    pub nodes: HashMap<String, KnowledgeNode>,
    pub edges: Vec<KnowledgeEdge>,
}

/// Erreurs du moteur sémantique
#[derive(Debug, thiserror::Error)]
pub enum SemanticError {
    #[error("Erreur d'indexation: {0}")]
    IndexingError(String),
    
    #[error("Erreur de recherche: {0}")]
    SearchError(String),
    
    #[error("Erreur d'embedding: {0}")]
    EmbeddingError(String),
    
    #[error("Erreur de graphe: {0}")]
    GraphError(String),
    
    #[error("Erreur de stockage: {0}")]
    StorageError(String),
}

pub type Result<T> = std::result::Result<T, SemanticError>;
