//! ═══════════════════════════════════════════════════════════════════════════════
//! TEMPORAL ENGINE ↔ MEMORY SUBSYSTEM INTEGRATION
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::temporal_engine::TemporalContext;
use serde::{Deserialize, Serialize};

/// Bridge entre Temporal Engine et Memory Subsystem
pub struct TemporalMemoryBridge;

impl TemporalMemoryBridge {
    /// Obtient les ajustements mémoire selon le contexte temporel
    pub fn get_memory_adjustments(context: &TemporalContext) -> MemoryTemporalAdjustments {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;

        MemoryTemporalAdjustments {
            consolidation_intensity: Self::calculate_consolidation_intensity(hour),
            stm_to_ltm_threshold: Self::calculate_stm_ltm_threshold(hour),
            gc_frequency: Self::calculate_gc_frequency(hour, is_weekend),
            preloading_strategy: Self::determine_preloading_strategy(context),
            compression_level: Self::calculate_compression_level(hour),
            semantic_indexing_depth: Self::calculate_semantic_depth(hour),
            memory_decay_rate: Self::calculate_decay_rate(hour),
            cache_retention_hours: Self::calculate_cache_retention(hour),
        }
    }

    /// Intensité de consolidation STM → LTM
    fn calculate_consolidation_intensity(hour: u8) -> f32 {
        match hour {
            2..=4 => 1.0,           // Night: maximum consolidation
            22..=23 | 0..=1 => 0.8, // Late night: high
            5..=7 => 0.3,           // Early morning: low
            _ => 0.5,               // Day: moderate
        }
    }

    /// Seuil de promotion STM → LTM
    fn calculate_stm_ltm_threshold(hour: u8) -> f32 {
        match hour {
            2..=4 => 0.4,   // Night: promote easily
            10..=16 => 0.8, // Day: strict
            _ => 0.6,       // Default
        }
    }

    /// Fréquence de garbage collection (heures)
    fn calculate_gc_frequency(hour: u8, is_weekend: bool) -> f32 {
        let base = match hour {
            2..=4 => 0.5,   // Night: every 30 min
            10..=11 => 4.0, // Peak: every 4 hours
            _ => 2.0,       // Default: 2 hours
        };

        if is_weekend {
            base * 1.5
        } else {
            base
        }
    }

    /// Stratégie de préchargement mémoire
    fn determine_preloading_strategy(context: &TemporalContext) -> PreloadingStrategy {
        let hour = context.now.hour;
        let day_of_week = context.now.day_of_week;

        // Pattern-based preloading
        match (day_of_week, hour) {
            (1..=5, 9) => PreloadingStrategy::WorkdayMorning,
            (1..=5, 14) => PreloadingStrategy::PostLunch,
            (6..=7, 10) => PreloadingStrategy::Weekend,
            (_, 22..=23) => PreloadingStrategy::NightCleanup,
            _ => PreloadingStrategy::Minimal,
        }
    }

    /// Niveau de compression mémoire
    fn calculate_compression_level(hour: u8) -> u8 {
        match hour {
            2..=4 => 9,   // Night: max compression
            10..=11 => 3, // Peak: minimal compression
            _ => 6,       // Default: moderate
        }
    }

    /// Profondeur d'indexation sémantique
    fn calculate_semantic_depth(hour: u8) -> usize {
        match hour {
            2..=4 => 5,   // Night: deep indexing
            10..=11 => 2, // Peak: shallow
            _ => 3,       // Default
        }
    }

    /// Taux de déclin mémoire (0-1)
    fn calculate_decay_rate(hour: u8) -> f32 {
        match hour {
            2..=4 => 0.05,   // Night: slow decay
            10..=16 => 0.02, // Day: very slow decay
            _ => 0.03,       // Default
        }
    }

    /// Heures de rétention cache
    fn calculate_cache_retention(hour: u8) -> u8 {
        match hour {
            10..=16 => 24,        // Day: long retention
            22..=23 | 0..=5 => 4, // Night: short retention
            _ => 12,              // Default
        }
    }

    /// Détermine quand faire la consolidation intensive
    pub fn should_perform_consolidation(context: &TemporalContext) -> ConsolidationRecommendation {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;

        let priority = match hour {
            2..=4 => ConsolidationPriority::Critical,
            0..=1 | 5 => ConsolidationPriority::High,
            22..=23 => ConsolidationPriority::Medium,
            _ => ConsolidationPriority::Low,
        };

        let operations = vec![
            ConsolidationOperation::StmToLtm,
            ConsolidationOperation::SemanticIndexing,
            ConsolidationOperation::PatternExtraction,
        ];

        let extended_ops = if hour >= 2 && hour <= 4 {
            vec![
                ConsolidationOperation::VectorReorganization,
                ConsolidationOperation::CompressionPass,
            ]
        } else {
            vec![]
        };

        ConsolidationRecommendation {
            should_run: priority != ConsolidationPriority::Low,
            priority,
            operations: [operations, extended_ops].concat(),
            max_duration_minutes: if is_weekend { 60 } else { 30 },
        }
    }

    /// Suggère les patterns de préchargement
    pub fn suggest_preload_patterns(context: &TemporalContext) -> Vec<PreloadPattern> {
        let hour = context.now.hour;
        let day_of_week = context.now.day_of_week;

        let mut patterns = vec![];

        // Workday morning: recent work contexts
        if (1..=5).contains(&day_of_week) && hour == 9 {
            patterns.push(PreloadPattern::RecentWorkContext { days: 7 });
            patterns.push(PreloadPattern::FrequentlyAccessed { threshold: 0.7 });
        }

        // Lunch break: light preload
        if hour == 12 || hour == 13 {
            patterns.push(PreloadPattern::HighPriority);
        }

        // Evening: prepare for next day
        if hour == 20 {
            patterns.push(PreloadPattern::ScheduledForTomorrow);
        }

        patterns
    }
}

/// Ajustements temporels pour la mémoire
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MemoryTemporalAdjustments {
    pub consolidation_intensity: f32,
    pub stm_to_ltm_threshold: f32,
    pub gc_frequency: f32,
    pub preloading_strategy: PreloadingStrategy,
    pub compression_level: u8,
    pub semantic_indexing_depth: usize,
    pub memory_decay_rate: f32,
    pub cache_retention_hours: u8,
}

/// Stratégies de préchargement
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PreloadingStrategy {
    Minimal,
    WorkdayMorning,
    PostLunch,
    Weekend,
    NightCleanup,
}

/// Priorité de consolidation
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConsolidationPriority {
    Low,
    Medium,
    High,
    Critical,
}

/// Opérations de consolidation
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConsolidationOperation {
    StmToLtm,
    SemanticIndexing,
    PatternExtraction,
    VectorReorganization,
    CompressionPass,
}

/// Recommandation de consolidation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConsolidationRecommendation {
    pub should_run: bool,
    pub priority: ConsolidationPriority,
    pub operations: Vec<ConsolidationOperation>,
    pub max_duration_minutes: u32,
}

/// Patterns de préchargement
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum PreloadPattern {
    RecentWorkContext { days: u32 },
    FrequentlyAccessed { threshold: f32 },
    HighPriority,
    ScheduledForTomorrow,
}
