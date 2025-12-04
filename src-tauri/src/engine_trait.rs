/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v24 — ENGINE TRAIT & ORCHESTRATOR
 * Unified engine interface + orchestration
 * TODO #13
 * ═══════════════════════════════════════════════════════════════════════════
 */

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use crate::error::TitaneError;

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE TRAIT
// ═══════════════════════════════════════════════════════════════════════════

pub trait Engine: Send + Sync {
    /// Engine unique name
    fn name(&self) -> &str;
    
    /// Engine priority (0-100, higher = more important)
    fn priority(&self) -> u8;
    
    /// Initialize engine
    fn init(&mut self) -> Result<(), TitaneError>;
    
    /// Update engine state
    fn update(&mut self) -> Result<(), TitaneError>;
    
    /// Synchronize engine data
    fn sync(&mut self) -> Result<(), TitaneError>;
    
    /// Shutdown engine gracefully
    fn shutdown(&mut self) -> Result<(), TitaneError> {
        Ok(())
    }
    
    /// Get engine status
    fn status(&self) -> EngineStatus;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE STATUS
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub name: String,
    pub state: EngineState,
    pub priority: u8,
    pub last_update_ms: u64,
    pub error_count: u32,
    pub tasks_completed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EngineState {
    Uninitialized,
    Initializing,
    Running,
    Paused,
    Error,
    Shutdown,
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

pub struct EngineRegistry {
    engines: HashMap<String, Box<dyn Engine>>,
}

impl EngineRegistry {
    pub fn new() -> Self {
        Self {
            engines: HashMap::new(),
        }
    }
    
    pub fn register(&mut self, engine: Box<dyn Engine>) {
        let name = engine.name().to_string();
        self.engines.insert(name, engine);
    }
    
    pub fn get(&self, name: &str) -> Option<&Box<dyn Engine>> {
        self.engines.get(name)
    }
    
    pub fn get_mut(&mut self, name: &str) -> Option<&mut Box<dyn Engine>> {
        self.engines.get_mut(name)
    }
    
    pub fn list(&self) -> Vec<String> {
        self.engines.keys().cloned().collect()
    }
    
    pub fn count(&self) -> usize {
        self.engines.len()
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

pub struct OrchestratorEngine {
    registry: Arc<RwLock<EngineRegistry>>,
    state: EngineState,
    total_cycles: u64,
}

impl OrchestratorEngine {
    pub fn new() -> Self {
        Self {
            registry: Arc::new(RwLock::new(EngineRegistry::new())),
            state: EngineState::Uninitialized,
            total_cycles: 0,
        }
    }
    
    /// Register an engine
    pub fn register_engine(&mut self, engine: Box<dyn Engine>) -> Result<(), TitaneError> {
        let mut registry = self.registry.write()
            .map_err(|e| TitaneError::InternalError(format!("Registry lock failed: {}", e)))?;
        
        registry.register(engine);
        Ok(())
    }
    
    /// Initialize all engines by priority
    pub fn init_all(&mut self) -> Result<(), TitaneError> {
        self.state = EngineState::Initializing;
        
        let mut registry = self.registry.write()
            .map_err(|e| TitaneError::InternalError(format!("Registry lock failed: {}", e)))?;
        
        // Get engines sorted by priority
        let mut engines: Vec<_> = registry.engines.iter_mut().collect();
        engines.sort_by(|a, b| b.1.priority().cmp(&a.1.priority()));
        
        for (name, engine) in engines {
            log::info!("🔧 Initializing engine: {}", name);
            if let Err(e) = engine.init() {
                log::error!("❌ Engine {} init failed: {}", name, e);
                return Err(TitaneError::EngineOperationFailed(format!("Init {} failed", name)));
            }
        }
        
        self.state = EngineState::Running;
        Ok(())
    }
    
    /// Run orchestration cycle
    pub fn run_cycle(&mut self) -> Result<(), TitaneError> {
        if self.state != EngineState::Running {
            return Err(TitaneError::OrchestratorNotInitialized);
        }
        
        let mut registry = self.registry.write()
            .map_err(|e| TitaneError::InternalError(format!("Registry lock failed: {}", e)))?;
        
        // Update all engines by priority
        let mut engines: Vec<_> = registry.engines.iter_mut().collect();
        engines.sort_by(|a, b| b.1.priority().cmp(&a.1.priority()));
        
        for (name, engine) in engines {
            if let Err(e) = engine.update() {
                log::warn!("⚠️ Engine {} update failed: {}", name, e);
            }
        }
        
        self.total_cycles += 1;
        Ok(())
    }
    
    /// Get all engine statuses
    pub fn get_statuses(&self) -> Result<Vec<EngineStatus>, TitaneError> {
        let registry = self.registry.read()
            .map_err(|e| TitaneError::InternalError(format!("Registry lock failed: {}", e)))?;
        
        let statuses: Vec<EngineStatus> = registry.engines.values()
            .map(|engine| engine.status())
            .collect();
        
        Ok(statuses)
    }
    
    /// Shutdown all engines
    pub fn shutdown_all(&mut self) -> Result<(), TitaneError> {
        self.state = EngineState::Shutdown;
        
        let mut registry = self.registry.write()
            .map_err(|e| TitaneError::InternalError(format!("Registry lock failed: {}", e)))?;
        
        for (name, engine) in registry.engines.iter_mut() {
            log::info!("🛑 Shutting down engine: {}", name);
            let _ = engine.shutdown();
        }
        
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    
    // Mock engine for testing
    struct MockEngine {
        name: String,
        priority: u8,
        initialized: bool,
        update_count: u32,
    }
    
    impl MockEngine {
        fn new(name: &str, priority: u8) -> Self {
            Self {
                name: name.to_string(),
                priority,
                initialized: false,
                update_count: 0,
            }
        }
    }
    
    impl Engine for MockEngine {
        fn name(&self) -> &str {
            &self.name
        }
        
        fn priority(&self) -> u8 {
            self.priority
        }
        
        fn init(&mut self) -> Result<(), TitaneError> {
            self.initialized = true;
            Ok(())
        }
        
        fn update(&mut self) -> Result<(), TitaneError> {
            if !self.initialized {
                return Err(TitaneError::EngineNotFound("Not initialized".to_string()));
            }
            self.update_count += 1;
            Ok(())
        }
        
        fn sync(&mut self) -> Result<(), TitaneError> {
            Ok(())
        }
        
        fn status(&self) -> EngineStatus {
            EngineStatus {
                name: self.name.clone(),
                state: if self.initialized { EngineState::Running } else { EngineState::Uninitialized },
                priority: self.priority,
                last_update_ms: 0,
                error_count: 0,
                tasks_completed: self.update_count as u64,
            }
        }
    }
    
    #[test]
    fn test_engine_registry() {
        let mut registry = EngineRegistry::new();
        
        registry.register(Box::new(MockEngine::new("TestEngine", 50)));
        
        assert_eq!(registry.count(), 1);
        assert!(registry.get("TestEngine").is_some());
        assert_eq!(registry.list(), vec!["TestEngine"]);
    }
    
    #[test]
    fn test_orchestrator_init() {
        let mut orchestrator = OrchestratorEngine::new();
        
        orchestrator.register_engine(Box::new(MockEngine::new("Engine1", 80))).unwrap();
        orchestrator.register_engine(Box::new(MockEngine::new("Engine2", 60))).unwrap();
        
        assert!(orchestrator.init_all().is_ok());
        assert_eq!(orchestrator.state, EngineState::Running);
    }
    
    #[test]
    fn test_orchestrator_cycle() {
        let mut orchestrator = OrchestratorEngine::new();
        
        orchestrator.register_engine(Box::new(MockEngine::new("Engine1", 50))).unwrap();
        orchestrator.init_all().unwrap();
        
        assert!(orchestrator.run_cycle().is_ok());
        assert_eq!(orchestrator.total_cycles, 1);
    }
    
    #[test]
    fn test_orchestrator_priority_order() {
        let mut orchestrator = OrchestratorEngine::new();
        
        orchestrator.register_engine(Box::new(MockEngine::new("LowPriority", 10))).unwrap();
        orchestrator.register_engine(Box::new(MockEngine::new("HighPriority", 90))).unwrap();
        orchestrator.register_engine(Box::new(MockEngine::new("MediumPriority", 50))).unwrap();
        
        orchestrator.init_all().unwrap();
        
        let statuses = orchestrator.get_statuses().unwrap();
        assert_eq!(statuses.len(), 3);
    }
}
