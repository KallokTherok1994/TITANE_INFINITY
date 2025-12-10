// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — CONFIGURATION
//   Paramètres globaux pour le système mémoire
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Unified Memory configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    /// Performance targets
    pub targets: PerformanceTargets,
    /// Capacity limits
    pub limits: CapacityLimits,
    /// Consolidation settings
    pub consolidation: ConsolidationConfig,
    /// Forgetting settings
    pub forgetting: ForgettingConfig,
    /// Evolution settings
    pub evolution: EvolutionConfig,
    /// Encryption enabled
    pub encryption_enabled: bool,
    /// Persistence enabled
    pub persistence_enabled: bool,
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            targets: PerformanceTargets::default(),
            limits: CapacityLimits::default(),
            consolidation: ConsolidationConfig::default(),
            forgetting: ForgettingConfig::default(),
            evolution: EvolutionConfig::default(),
            encryption_enabled: true,
            persistence_enabled: true,
        }
    }
}

/// Performance targets (milliseconds)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceTargets {
    pub store_ms: u128,
    pub recall_ms: u128,
    pub search_ms: u128,
    pub consolidation_ms: u128,
    pub max_ram_mb: usize,
}

impl Default for PerformanceTargets {
    fn default() -> Self {
        Self {
            store_ms: 5,
            recall_ms: 20,
            search_ms: 15,
            consolidation_ms: 50,
            max_ram_mb: 300,
        }
    }
}

/// Capacity limits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapacityLimits {
    pub stm_max: usize,
    pub mtm_max: usize,
    pub ltm_batch: usize,
    pub embedding_dim: usize,
}

impl Default for CapacityLimits {
    fn default() -> Self {
        Self {
            stm_max: 20,
            mtm_max: 200,
            ltm_batch: 100,
            embedding_dim: 384,
        }
    }
}

/// Consolidation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsolidationConfig {
    /// Auto-consolidation enabled
    pub enabled: bool,
    /// Interval between consolidation cycles (minutes)
    pub interval_mins: u64,
    /// Minimum importance for STM→MTM promotion
    pub stm_promotion_threshold: f32,
    /// Minimum importance for MTM→LTM promotion
    pub mtm_promotion_threshold: f32,
    /// Minimum access count for promotion
    pub min_access_count: u64,
}

impl Default for ConsolidationConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            interval_mins: 5,
            stm_promotion_threshold: 0.6,
            mtm_promotion_threshold: 0.7,
            min_access_count: 2,
        }
    }
}

/// Forgetting (decay) configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForgettingConfig {
    /// Forgetting enabled
    pub enabled: bool,
    /// Interval between forgetting cycles (minutes)
    pub interval_mins: u64,
    /// Decay rate (0.0 = no decay, 1.0 = immediate)
    pub decay_rate: f32,
    /// Minimum importance to prevent deletion
    pub min_preserve_importance: f32,
    /// Maximum age before deletion (hours)
    pub max_age_hours: u64,
}

impl Default for ForgettingConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            interval_mins: 10,
            decay_rate: 0.1,
            min_preserve_importance: 0.5,
            max_age_hours: 720, // 30 days
        }
    }
}

/// Evolution configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionConfig {
    /// Auto-evolution enabled
    pub enabled: bool,
    /// Interval between evolution cycles (minutes)
    pub interval_mins: u64,
    /// Clustering enabled
    pub clustering_enabled: bool,
    /// Compression enabled
    pub compression_enabled: bool,
    /// Pattern extraction enabled
    pub pattern_extraction_enabled: bool,
    /// Similarity threshold for compression (0.0-1.0)
    pub compression_threshold: f32,
}

impl Default for EvolutionConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            interval_mins: 60,
            clustering_enabled: true,
            compression_enabled: true,
            pattern_extraction_enabled: true,
            compression_threshold: 0.95,
        }
    }
}
