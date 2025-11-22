// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — APP: SETUP
//   Application Initialization & Configuration
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::{HeliosCore, NexusCore, HarmoniaCore, SentinelCore, MemoryCore},
    engine::AutoEvolutionEngine,
    services::StorageService,
    utils::{AppResult, log_info},
};
use std::path::PathBuf;

pub struct TitaneApp {
    pub helios: HeliosCore,
    pub nexus: NexusCore,
    pub harmonia: HarmoniaCore,
    pub sentinel: SentinelCore,
    pub memory: MemoryCore,
    pub evolution: AutoEvolutionEngine,
}

impl TitaneApp {
    pub fn new(app_data_dir: PathBuf) -> AppResult<Self> {
        log_info("Setup", "Initializing TITANE∞ v17.2.0");
        
        // Initialize storage
        let storage_path = app_data_dir.join("storage");
        let storage = StorageService::new(storage_path)?;
        
        // Initialize core modules
        log_info("Setup", "Initializing core modules...");
        let helios = HeliosCore::new();
        let nexus = NexusCore::new();
        let harmonia = HarmoniaCore::new();
        let sentinel = SentinelCore::new();
        let memory = MemoryCore::new(storage);
        
        // Register modules in Nexus
        nexus.register_module("Helios".to_string())?;
        nexus.register_module("Harmonia".to_string())?;
        nexus.register_module("Sentinel".to_string())?;
        nexus.register_module("Memory".to_string())?;
        
        // Initialize evolution engine
        log_info("Setup", "Initializing auto-evolution engine...");
        let evolution = AutoEvolutionEngine::new();
        
        log_info("Setup", "TITANE∞ v17.2.0 initialized successfully");
        
        Ok(Self {
            helios,
            nexus,
            harmonia,
            sentinel,
            memory,
            evolution,
        })
    }
}
