// ═══════════════════════════════════════════════════════════════
//   MEMORY OS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Memory OS Configuration (Super Prompts #6-7-8)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryOSConfigV2 {
    /// Vector index configuration
    pub vector_config: VectorConfig,
    
    /// Embedding configuration
    pub embedding_config: EmbeddingConfig,
    
    /// Clustering configuration
    pub clustering_config: ClusteringConfig,
    
    /// Storage path
    pub storage_path: PathBuf,
    
    /// Enable semantic search
    pub enable_semantic_search: bool,
    
    /// Enable clustering
    pub enable_clustering: bool,
    
    /// Auto-compression threshold
    pub auto_compress_threshold: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorConfig {
    pub dimension: usize,
    pub max_elements: usize,
    pub ef_construction: usize,
    pub m: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingConfig {
    pub source: String, // "local", "openai", "gemini"
    pub model: String,
    pub api_key: Option<String>,
    pub cache_size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringConfig {
    pub k: usize,
    pub max_iterations: usize,
    pub tolerance: f32,
}

impl Default for MemoryOSConfigV2 {
    fn default() -> Self {
        Self {
            vector_config: VectorConfig {
                dimension: 384,
                max_elements: 10_000,
                ef_construction: 200,
                m: 16,
            },
            embedding_config: EmbeddingConfig {
                source: "local".to_string(),
                model: "all-MiniLM-L6-v2".to_string(),
                api_key: None,
                cache_size: 1000,
            },
            clustering_config: ClusteringConfig {
                k: 5,
                max_iterations: 100,
                tolerance: 1e-4,
            },
            storage_path: PathBuf::from("./data/memory_os"),
            enable_semantic_search: true,
            enable_clustering: true,
            auto_compress_threshold: 0.95,
        }
    }
}
