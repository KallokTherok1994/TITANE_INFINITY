// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY EVOLUTION TAURI COMMANDS
//   API pour le Memory Evolution Engine++
// ═══════════════════════════════════════════════════════════════

use log::info;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

use super::{
    memory_clusterer::{ClustererConfig, ClusteringResult, MemoryCluster, MemoryClusterer},
    memory_compressor::{CompressionResult, CompressorConfig, MemoryCompressor},
    memory_growth::{GrowthConfig, GrowthResult, HierarchyHealth, MemoryGrowthEngine},
    memory_parser::{MemoryParseResult, MemoryParser, ParserConfig},
    memory_patterns::{MemoryPatternExtractor, PatternConfig, PatternExtractionResult},
    memory_stability::{MemoryStabilityEngine, StabilityCheckResult, StabilityConfig},
    memory_synthesizer::{MemorySynthesizer, SynthesisResult, SynthesizerConfig},
    EvolutionResult, EvolutionStatus, MemoryEvolutionConfig, MemoryItem, MemoryLevel, MemoryType,
};

/// État global du Memory Evolution Engine
pub struct MemoryEvolutionState {
    pub config: Mutex<MemoryEvolutionConfig>,
    pub items: Mutex<Vec<MemoryItem>>,
    pub clusters: Mutex<Vec<MemoryCluster>>,
    pub last_evolution: Mutex<Option<EvolutionResult>>,
    pub parser: MemoryParser,
    pub synthesizer: MemorySynthesizer,
    pub clusterer: MemoryClusterer,
    pub compressor: MemoryCompressor,
    pub pattern_extractor: MemoryPatternExtractor,
    pub stability_engine: MemoryStabilityEngine,
    pub growth_engine: MemoryGrowthEngine,
}

impl Default for MemoryEvolutionState {
    fn default() -> Self {
        let data_path = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane-infinity")
            .join("memory_evolution");

        Self {
            config: Mutex::new(MemoryEvolutionConfig::default()),
            items: Mutex::new(vec![]),
            clusters: Mutex::new(vec![]),
            last_evolution: Mutex::new(None),
            parser: MemoryParser::new(ParserConfig::default()),
            synthesizer: MemorySynthesizer::new(SynthesizerConfig::default()),
            clusterer: MemoryClusterer::new(ClustererConfig::default()),
            compressor: MemoryCompressor::new(CompressorConfig::default()),
            pattern_extractor: MemoryPatternExtractor::new(PatternConfig::default()),
            stability_engine: MemoryStabilityEngine::new(
                StabilityConfig::default(),
                data_path.join("backups"),
            ),
            growth_engine: MemoryGrowthEngine::new(GrowthConfig::default()),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// RÉPONSES API
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEvolutionStatus {
    pub total_items: usize,
    pub items_by_level: std::collections::HashMap<String, usize>,
    pub clusters_count: usize,
    pub last_evolution: Option<EvolutionResult>,
    pub config: MemoryEvolutionConfig,
}

// ═══════════════════════════════════════════════════════════════
// COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════

/// Obtient le statut du Memory Evolution Engine
#[tauri::command]
pub async fn memory_evolution_status(
    state: State<'_, MemoryEvolutionState>,
) -> Result<MemoryEvolutionStatus, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;
    let clusters = state.clusters.lock().map_err(|e| e.to_string())?;
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let last_evolution = state.last_evolution.lock().map_err(|e| e.to_string())?;

    let mut items_by_level = std::collections::HashMap::new();
    for item in items.iter() {
        let level_str = format!("{:?}", item.level);
        *items_by_level.entry(level_str).or_insert(0) += 1;
    }

    Ok(MemoryEvolutionStatus {
        total_items: items.len(),
        items_by_level,
        clusters_count: clusters.len(),
        last_evolution: last_evolution.clone(),
        config: config.clone(),
    })
}

/// Ajoute un item mémoire
#[tauri::command]
pub async fn memory_add_item(
    state: State<'_, MemoryEvolutionState>,
    content: String,
    topic: Option<String>,
    level: Option<String>,
    memory_type: Option<String>,
) -> Result<MemoryItem, String> {
    let level = match level.as_deref() {
        Some("CT") => MemoryLevel::CT,
        Some("MT") => MemoryLevel::MT,
        Some("LT") => MemoryLevel::LT,
        Some("ELT") => MemoryLevel::ELT,
        Some("Core") => MemoryLevel::Core,
        _ => MemoryLevel::CT,
    };

    let mem_type = match memory_type.as_deref() {
        Some("Factual") => MemoryType::Factual,
        Some("Procedural") => MemoryType::Procedural,
        Some("Semantic") => MemoryType::Semantic,
        Some("Episodic") => MemoryType::Episodic,
        Some("Meta") => MemoryType::Meta,
        Some("Pattern") => MemoryType::Pattern,
        _ => MemoryType::Factual,
    };

    let item = MemoryItem {
        content,
        topic,
        level,
        memory_type: mem_type,
        ..Default::default()
    };

    let mut items = state.items.lock().map_err(|e| e.to_string())?;
    items.push(item.clone());

    info!("[MemoryEvolution] Added item: {}", item.id);

    Ok(item)
}

/// Parse les mémoires
#[tauri::command]
pub async fn memory_parse(
    state: State<'_, MemoryEvolutionState>,
) -> Result<MemoryParseResult, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    state.parser.parse(&items).map_err(|e| e.to_string())
}

/// Synthétise les mémoires
#[tauri::command]
pub async fn memory_synthesize(
    state: State<'_, MemoryEvolutionState>,
) -> Result<SynthesisResult, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    state
        .synthesizer
        .synthesize(&items)
        .map_err(|e| e.to_string())
}

/// Clusterise les mémoires
#[tauri::command]
pub async fn memory_cluster(
    state: State<'_, MemoryEvolutionState>,
) -> Result<ClusteringResult, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    let result = state.clusterer.cluster(&items).map_err(|e| e.to_string())?;

    // Sauvegarder les clusters
    let mut clusters = state.clusters.lock().map_err(|e| e.to_string())?;
    *clusters = result.clusters.clone();

    Ok(result)
}

/// Compresse les mémoires
#[tauri::command]
pub async fn memory_compress(
    state: State<'_, MemoryEvolutionState>,
) -> Result<CompressionResult, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    state.compressor.compress(&items).map_err(|e| e.to_string())
}

/// Extrait les patterns
#[tauri::command]
pub async fn memory_extract_patterns(
    state: State<'_, MemoryEvolutionState>,
) -> Result<PatternExtractionResult, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    state
        .pattern_extractor
        .extract_patterns(&items)
        .map_err(|e| e.to_string())
}

/// Vérifie la stabilité
#[tauri::command]
pub async fn memory_check_stability(
    state: State<'_, MemoryEvolutionState>,
) -> Result<StabilityCheckResult, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    state
        .stability_engine
        .check_stability(&items)
        .map_err(|e| e.to_string())
}

/// Vérifie et répare la mémoire
#[tauri::command]
pub async fn memory_check_and_repair(
    state: State<'_, MemoryEvolutionState>,
) -> Result<StabilityCheckResult, String> {
    let mut items = state.items.lock().map_err(|e| e.to_string())?;

    state
        .stability_engine
        .check_and_repair(&mut items)
        .map_err(|e| e.to_string())
}

/// Déclenche la croissance mémoire
#[tauri::command]
pub async fn memory_grow(state: State<'_, MemoryEvolutionState>) -> Result<GrowthResult, String> {
    let mut items = state.items.lock().map_err(|e| e.to_string())?;

    state
        .growth_engine
        .grow(&mut items)
        .map_err(|e| e.to_string())
}

/// Évalue la santé de la hiérarchie
#[tauri::command]
pub async fn memory_hierarchy_health(
    state: State<'_, MemoryEvolutionState>,
) -> Result<HierarchyHealth, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    Ok(state.growth_engine.evaluate_hierarchy_health(&items))
}

/// Exécute un cycle d'évolution complet
#[tauri::command]
pub async fn memory_evolve_full(
    state: State<'_, MemoryEvolutionState>,
    kevin_authorized: bool,
) -> Result<EvolutionResult, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;

    // Vérifier l'autorisation Kevin
    if config.kevin_only_full_evolution && !kevin_authorized {
        return Err("Full evolution requires Kevin authorization".to_string());
    }

    info!("[MemoryEvolution] Starting full evolution cycle...");
    let start = std::time::Instant::now();

    let mut result = EvolutionResult::default();
    result.status = EvolutionStatus::Parsing;

    // 1. Parse
    {
        let items = state.items.lock().map_err(|e| e.to_string())?;
        let parse_result = state.parser.parse(&items).map_err(|e| e.to_string())?;
        result.items_parsed =
            parse_result.ct_items.len() + parse_result.mt_items.len() + parse_result.lt_items.len();
    }

    result.status = EvolutionStatus::Synthesizing;

    // 2. Synthesize
    {
        let items = state.items.lock().map_err(|e| e.to_string())?;
        let synth_result = state
            .synthesizer
            .synthesize(&items)
            .map_err(|e| e.to_string())?;
        result.items_synthesized = synth_result.summaries.len();
    }

    result.status = EvolutionStatus::Clustering;

    // 3. Cluster
    {
        let items = state.items.lock().map_err(|e| e.to_string())?;
        let cluster_result = state.clusterer.cluster(&items).map_err(|e| e.to_string())?;
        result.clusters_created = cluster_result.clusters.len();

        let mut clusters = state.clusters.lock().map_err(|e| e.to_string())?;
        *clusters = cluster_result.clusters;
    }

    result.status = EvolutionStatus::Compressing;

    // 4. Compress
    {
        let items = state.items.lock().map_err(|e| e.to_string())?;
        let compress_result = state
            .compressor
            .compress(&items)
            .map_err(|e| e.to_string())?;
        result.items_compressed = compress_result.blocks.len();
    }

    // 5. Extract Patterns
    {
        let items = state.items.lock().map_err(|e| e.to_string())?;
        let pattern_result = state
            .pattern_extractor
            .extract_patterns(&items)
            .map_err(|e| e.to_string())?;
        result.patterns_extracted = pattern_result.patterns.len();
    }

    result.status = EvolutionStatus::Stabilizing;

    // 6. Check & Repair Stability
    {
        let mut items = state.items.lock().map_err(|e| e.to_string())?;
        let stability_result = state
            .stability_engine
            .check_and_repair(&mut items)
            .map_err(|e| e.to_string())?;
        result.stability_score = stability_result.stability_score;
    }

    result.status = EvolutionStatus::Growing;

    // 7. Grow
    {
        let mut items = state.items.lock().map_err(|e| e.to_string())?;
        let growth_result = state
            .growth_engine
            .grow(&mut items)
            .map_err(|e| e.to_string())?;
        result.growth_achieved = growth_result.growth_achieved;
    }

    result.status = EvolutionStatus::Complete;
    result.duration_ms = start.elapsed().as_millis() as u64;
    result.timestamp = chrono::Utc::now().to_rfc3339();

    // Sauvegarder le résultat
    {
        let mut last = state.last_evolution.lock().map_err(|e| e.to_string())?;
        *last = Some(result.clone());
    }

    info!(
        "[MemoryEvolution] Full evolution complete in {}ms: {} parsed, {} synthesized, {} clusters, {} patterns",
        result.duration_ms, result.items_parsed, result.items_synthesized,
        result.clusters_created, result.patterns_extracted
    );

    Ok(result)
}

/// Met à jour la configuration
#[tauri::command]
pub async fn memory_update_config(
    state: State<'_, MemoryEvolutionState>,
    new_config: MemoryEvolutionConfig,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    *config = new_config;

    info!("[MemoryEvolution] Config updated");
    Ok(())
}

/// Obtient les clusters
#[tauri::command]
pub async fn memory_get_clusters(
    state: State<'_, MemoryEvolutionState>,
) -> Result<Vec<MemoryCluster>, String> {
    let clusters = state.clusters.lock().map_err(|e| e.to_string())?;
    Ok(clusters.clone())
}

/// Obtient les items par niveau
#[tauri::command]
pub async fn memory_get_items_by_level(
    state: State<'_, MemoryEvolutionState>,
    level: String,
) -> Result<Vec<MemoryItem>, String> {
    let target_level = match level.as_str() {
        "CT" => MemoryLevel::CT,
        "MT" => MemoryLevel::MT,
        "LT" => MemoryLevel::LT,
        "ELT" => MemoryLevel::ELT,
        "Core" => MemoryLevel::Core,
        _ => return Err("Invalid level".to_string()),
    };

    let items = state.items.lock().map_err(|e| e.to_string())?;
    let filtered: Vec<_> = items
        .iter()
        .filter(|i| i.level == target_level)
        .cloned()
        .collect();

    Ok(filtered)
}

/// Crée un backup mémoire
#[tauri::command]
pub async fn memory_create_backup(
    state: State<'_, MemoryEvolutionState>,
) -> Result<String, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;

    let path = state
        .stability_engine
        .create_backup(&items)
        .map_err(|e| e.to_string())?;

    Ok(path.to_string_lossy().to_string())
}

/// Liste les backups
#[tauri::command]
pub async fn memory_list_backups(
    state: State<'_, MemoryEvolutionState>,
) -> Result<Vec<String>, String> {
    let backups = state
        .stability_engine
        .list_backups()
        .map_err(|e| e.to_string())?;

    Ok(backups
        .iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect())
}
