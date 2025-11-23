// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — APP: SETUP
//   Application Initialization & Configuration (v14 simplified)
// ═══════════════════════════════════════════════════════════════

use crate::{
    compat::plugin_system::core_system::CoreCollection,
    engine::AutoEvolutionEngine,
    utils::{AppResult, log_info},
    devtools::{
        logging::LogCollector,
        metrics::MetricsCollector,
    },
    compat::plugin_system::CoreRegistry,
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
        log_info("Setup", "Initializing TITANE∞ v14 (legacy compatibility mode)");

        // Create stub cores for backward compatibility
        let cores = CoreCollection::new();

        log_info("Setup", "Core stubs initialized ✅");
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

        log_info("Setup", "TITANE∞ v14 initialized successfully (legacy compat mode)");

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
