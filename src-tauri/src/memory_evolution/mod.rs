// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY EVOLUTION ENGINE++ v∞
//   SUPER PROMPT OPUS #14
//   Évolution cognitive, stabilisation mémoire, clustering avancé
//   Synthèse contextuelle, compression intelligente, patterns
// ═══════════════════════════════════════════════════════════════

pub mod memory_parser;
pub mod memory_synthesizer;
pub mod memory_clusterer;
pub mod memory_vectorizer;
pub mod memory_compressor;
pub mod memory_patterns;
pub mod memory_stability;
pub mod memory_growth;
pub mod commands;

pub use memory_parser::*;
pub use memory_synthesizer::*;
pub use memory_clusterer::*;
pub use memory_vectorizer::*;
pub use memory_compressor::*;
pub use memory_patterns::*;
pub use memory_stability::*;
pub use memory_growth::*;
pub use commands::*;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════
// TYPES FONDAMENTAUX
// ═══════════════════════════════════════════════════════════════

/// Niveau de mémoire
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryLevel {
    /// Court terme (session)
    CT,
    /// Moyen terme (jours)
    MT,
    /// Long terme (permanent)
    LT,
    /// Enhanced Long-Term (distillé)
    ELT,
    /// Core Memory (essence)
    Core,
}

/// Type de mémoire
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryType {
    Factual,
    Procedural,
    Semantic,
    Episodic,
    Meta,
    Pattern,
}

/// Statut d'évolution
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EvolutionStatus {
    Idle,
    Parsing,
    Synthesizing,
    Clustering,
    Compressing,
    Stabilizing,
    Growing,
    Complete,
    Error,
}

/// Item mémoire unifié
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryItem {
    pub id: String,
    pub level: MemoryLevel,
    pub memory_type: MemoryType,
    pub content: String,
    pub summary: Option<String>,
    pub topic: Option<String>,
    pub cluster_id: Option<String>,
    pub confidence: f32,
    pub importance: f32,
    pub created_at: String,
    pub updated_at: String,
    pub access_count: u64,
    pub last_accessed: Option<String>,
    pub vector_id: Option<String>,
    pub compressed: bool,
    pub metadata: HashMap<String, serde_json::Value>,
}

impl Default for MemoryItem {
    fn default() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            level: MemoryLevel::CT,
            memory_type: MemoryType::Factual,
            content: String::new(),
            summary: None,
            topic: None,
            cluster_id: None,
            confidence: 0.5,
            importance: 0.5,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
            access_count: 0,
            last_accessed: None,
            vector_id: None,
            compressed: false,
            metadata: HashMap::new(),
        }
    }
}

/// Configuration du Memory Evolution Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEvolutionConfig {
    /// Intervalle d'évolution automatique (minutes)
    pub auto_evolution_interval_mins: u64,
    /// Seuil de compression (items)
    pub compression_threshold: usize,
    /// Seuil de clustering (items)
    pub clustering_threshold: usize,
    /// Limite CT avant promotion MT
    pub ct_limit: usize,
    /// Limite MT avant promotion LT
    pub mt_limit: usize,
    /// Activer l'évolution automatique (faible)
    pub auto_evolution_enabled: bool,
    /// Ratio de préservation minimum
    pub min_preserve_ratio: f32,
    /// Kevin-only pour évolution complète
    pub kevin_only_full_evolution: bool,
}

impl Default for MemoryEvolutionConfig {
    fn default() -> Self {
        Self {
            auto_evolution_interval_mins: 60,
            compression_threshold: 100,
            clustering_threshold: 50,
            ct_limit: 50,
            mt_limit: 200,
            auto_evolution_enabled: true,
            min_preserve_ratio: 0.85,
            kevin_only_full_evolution: true,
        }
    }
}

/// Erreurs du Memory Evolution Engine
#[derive(Debug, thiserror::Error)]
pub enum MemoryEvolutionError {
    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Synthesis error: {0}")]
    SynthesisError(String),

    #[error("Clustering error: {0}")]
    ClusteringError(String),

    #[error("Vectorization error: {0}")]
    VectorizationError(String),

    #[error("Compression error: {0}")]
    CompressionError(String),

    #[error("Pattern extraction error: {0}")]
    PatternError(String),

    #[error("Stability error: {0}")]
    StabilityError(String),

    #[error("Growth error: {0}")]
    GrowthError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Authorization required: Kevin-only operation")]
    AuthorizationRequired,

    #[error("Memory corrupted: {0}")]
    MemoryCorrupted(String),
}

/// Résultat d'évolution mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionResult {
    pub timestamp: String,
    pub status: EvolutionStatus,
    pub items_parsed: usize,
    pub items_synthesized: usize,
    pub clusters_created: usize,
    pub items_compressed: usize,
    pub patterns_extracted: usize,
    pub stability_score: f32,
    pub growth_achieved: bool,
    pub errors: Vec<String>,
    pub duration_ms: u64,
}

impl Default for EvolutionResult {
    fn default() -> Self {
        Self {
            timestamp: chrono::Utc::now().to_rfc3339(),
            status: EvolutionStatus::Idle,
            items_parsed: 0,
            items_synthesized: 0,
            clusters_created: 0,
            items_compressed: 0,
            patterns_extracted: 0,
            stability_score: 1.0,
            growth_achieved: false,
            errors: vec![],
            duration_ms: 0,
        }
    }
}
