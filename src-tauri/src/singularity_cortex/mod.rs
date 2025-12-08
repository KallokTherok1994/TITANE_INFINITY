// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Singularity Cortex OS v∞
//   SUPER PROMPT #7 — Meta-Cognitive Cortex Central
// ═══════════════════════════════════════════════════════════════

pub mod state;
pub mod context_manager;
pub mod coherence_supervisor;
pub mod memory_bridge;
pub mod evolution_loop;
pub mod api;

use state::{SingularityState, CognitiveMode};
use context_manager::{ContextManager, ContextBundle};
use coherence_supervisor::{CoherenceSupervisor, CoherenceReport};
use memory_bridge::{MemoryBridge, SyncResult, MemoryFilter};
use evolution_loop::{EvolutionLoop, EvolutionResult, EvolutionConfig};
use crate::engines::unified_memory::UnifiedMemoryEngine;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Singularity Cortex OS — Cortex Central Cognitif de TITANE∞
pub struct SingularityCortex {
    state: Arc<RwLock<SingularityState>>,
    evolution_config: EvolutionConfig,
}

impl SingularityCortex {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(SingularityState::new())),
            evolution_config: EvolutionConfig::default(),
        }
    }
    
    pub fn with_config(config: EvolutionConfig) -> Self {
        Self {
            state: Arc::new(RwLock::new(SingularityState::new())),
            evolution_config: config,
        }
    }
    
    pub async fn get_state(&self) -> SingularityState {
        self.state.read().await.clone()
    }
    
    pub fn get_state_arc(&self) -> Arc<RwLock<SingularityState>> {
        Arc::clone(&self.state)
    }
    
    // === PIPELINE INTEGRATION POINTS ===
    
    pub async fn pre_generation_context(
        &self,
        memory: &mut UnifiedMemoryEngine,
        query: &str,
    ) -> Result<ContextBundle, String> {
        let state = self.state.read().await;
        ContextManager::build_context(&state, memory, query).await
    }
    
    pub async fn post_generation_validation(
        &self,
        response: &str,
        context: &str,
    ) -> Result<CoherenceReport, String> {
        let state = self.state.read().await;
        Ok(CoherenceSupervisor::evaluate(response, context, &state))
    }
    
    pub async fn end_cycle_sync(
        &self,
        memory: &mut UnifiedMemoryEngine,
        filter: Option<MemoryFilter>,
    ) -> Result<SyncResult, String> {
        let mut state = self.state.write().await;
        let filter = filter.unwrap_or_default();
        MemoryBridge::sync_to_memory(&mut state, memory, &filter).await
    }
    
    pub async fn evolve(
        &self,
        coherence_report: Option<&CoherenceReport>,
    ) -> Result<EvolutionResult, String> {
        let mut state = self.state.write().await;
        Ok(EvolutionLoop::evolve(&mut state, coherence_report, &self.evolution_config))
    }
    
    // === UTILITY METHODS ===
    
    pub async fn record_interaction(&self) {
        let mut state = self.state.write().await;
        state.increment_interactions();
    }
    
    pub async fn push_context(&self, content: String) {
        let mut state = self.state.write().await;
        state.push_context(content);
    }
    
    pub async fn get_recent_context(&self, n: usize) -> Vec<String> {
        let state = self.state.read().await;
        state.get_recent_context(n)
    }
    
    pub async fn set_mode(&self, mode: CognitiveMode) {
        let mut state = self.state.write().await;
        state.adjust_mode(mode);
    }
    
    pub async fn get_stats(&self) -> state::SingularityStats {
        let state = self.state.read().await;
        state.stats()
    }
    
    pub async fn reset(&self) {
        let mut state = self.state.write().await;
        state.reset();
    }
    
    pub async fn should_reset(&self) -> bool {
        let state = self.state.read().await;
        EvolutionLoop::should_reset(&state)
    }
    
    pub async fn sync_from_memory(
        &self,
        memory: &mut UnifiedMemoryEngine,
    ) -> Result<SyncResult, String> {
        let mut state = self.state.write().await;
        MemoryBridge::sync_from_memory(&mut state, memory).await
    }
}

impl Default for SingularityCortex {
    fn default() -> Self {
        Self::new()
    }
}
