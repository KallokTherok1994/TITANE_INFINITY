// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE: NEXUS
//   Internal Coherence & Module Status Management
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{NexusState, ModuleStatus, ModuleHealth},
    utils::{AppResult, log_info},
};
use chrono::Utc;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

pub struct NexusCore {
    modules: Arc<RwLock<HashMap<String, ModuleStatus>>>,
}

impl NexusCore {
    pub fn new() -> Self {
        Self {
            modules: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Register a module
    pub fn register_module(&self, name: String) -> AppResult<()> {
        let mut modules = self.modules.write()
            .map_err(|_| crate::utils::AppError::Internal("Lock poisoned".to_string()))?;
        
        modules.insert(name.clone(), ModuleStatus {
            name,
            health: ModuleHealth::Healthy,
            uptime: 0,
            last_tick: Utc::now().timestamp(),
            message: "Initialized".to_string(),
        });
        
        Ok(())
    }
    
    /// Update module status
    pub fn update_module(&self, name: &str, health: ModuleHealth, message: String) -> AppResult<()> {
        let mut modules = self.modules.write()
            .map_err(|_| crate::utils::AppError::Internal("Lock poisoned".to_string()))?;
        
        if let Some(module) = modules.get_mut(name) {
            module.health = health;
            module.message = message;
            module.last_tick = Utc::now().timestamp();
        }
        
        Ok(())
    }
    
    /// Validate system coherence
    pub async fn validate(&self) -> AppResult<NexusState> {
        log_info("Nexus", "Validating system coherence");
        
        let modules = self.modules.read()
            .map_err(|_| crate::utils::AppError::Internal("Lock poisoned".to_string()))?;
        
        let mut state = NexusState {
            modules: modules.clone(),
            coherence_score: 100.0,
            active_connections: modules.len(),
            health: ModuleHealth::Healthy,
            timestamp: Utc::now().timestamp(),
        };
        
        // Calculate coherence score
        let failing_count = modules.values()
            .filter(|m| matches!(m.health, ModuleHealth::Failing | ModuleHealth::Offline))
            .count();
        
        let degraded_count = modules.values()
            .filter(|m| matches!(m.health, ModuleHealth::Degraded))
            .count();
        
        state.coherence_score = 100.0 - (failing_count as f64 * 30.0) - (degraded_count as f64 * 10.0);
        state.coherence_score = state.coherence_score.max(0.0);
        
        state.calculate_health();
        
        Ok(state)
    }
}

impl Default for NexusCore {
    fn default() -> Self {
        Self::new()
    }
}
