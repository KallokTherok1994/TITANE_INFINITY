// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Singularity Cortex OS v∞
//   SUPER PROMPT #7 — Meta-Cognitive Cortex Central
// ═══════════════════════════════════════════════════════════════

pub mod state;

use state::{SingularityState, CognitiveMode};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Singularity Cortex OS — Cortex Central Cognitif de TITANE∞
pub struct SingularityCortex {
    state: Arc<RwLock<SingularityState>>,
}

impl SingularityCortex {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(SingularityState::new())),
        }
    }
    
    pub async fn get_state(&self) -> SingularityState {
        self.state.read().await.clone()
    }
    
    pub fn get_state_arc(&self) -> Arc<RwLock<SingularityState>> {
        Arc::clone(&self.state)
    }
    
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
}

impl Default for SingularityCortex {
    fn default() -> Self {
        Self::new()
    }
}
