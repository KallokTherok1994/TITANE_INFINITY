// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — APP: SETUP
//   Application Initialization & Configuration (Phase 2b migrated)
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::core_system::{initialize_all_cores, start_all_cores, CoreCollection},
    engine::AutoEvolutionEngine,
    utils::{AppResult, log_info},
    devtools::{
        logging::LogCollector,
        metrics::MetricsCollector,
    },
    plugin_system::{
        registry::CoreRegistry,
    },
    cognitive::engine::CognitiveEngine,
};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct TitaneApp {
    pub cores: CoreCollection,
    pub evolution: AutoEvolutionEngine,
    pub log_collector: Arc<RwLock<LogCollector>>,
    pub metrics_collector: Arc<RwLock<MetricsCollector>>,
    pub core_registry: Arc<RwLock<CoreRegistry>>,
    pub cognitive_engine: Arc<RwLock<CognitiveEngine>>,
}

impl TitaneApp {
    pub async fn new(_app_data_dir: PathBuf) -> AppResult<Self> {
        log_info("Setup", "Initializing TITANE∞ v17.2.0");

        // Initialize all cores using Phase 2 bootstrap
        log_info("Setup", "Initializing core modules (Phase 2)...");
        let cores = initialize_all_cores().await
            .map_err(|e| format!("Failed to initialize cores: {}", e))?;

        // Start all cores
        log_info("Setup", "Starting all cores...");
        start_all_cores(&cores).await
            .map_err(|e| format!("Failed to start cores: {}", e))?;

        log_info("Setup", "All 5 cores initialized and started ✅");

        // Initialize evolution engine
        log_info("Setup", "Initializing auto-evolution engine...");
        let evolution = AutoEvolutionEngine::new();

        // Initialize DevTools infrastructure
        log_info("Setup", "Initializing DevTools observability...");
        let log_collector = Arc::new(RwLock::new(LogCollector::new()));
        let metrics_collector = Arc::new(RwLock::new(MetricsCollector::new()));

        // Initialize plugin system registry (keep for compatibility)
        log_info("Setup", "Initializing core registry...");
        let core_registry = Arc::new(RwLock::new(CoreRegistry::new()));

        // Initialize cognitive engine
        log_info("Setup", "Initializing cognitive engine with three centers...");
        let cognitive_engine = Arc::new(RwLock::new(CognitiveEngine::new()));

        log_info("Setup", "TITANE∞ v17.2.0 initialized successfully (Phase 2b)");

        Ok(Self {
            cores,
            evolution,
            log_collector,
            metrics_collector,
            core_registry,
            cognitive_engine,
        })
    }
}
