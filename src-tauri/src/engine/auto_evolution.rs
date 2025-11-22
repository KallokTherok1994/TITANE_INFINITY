// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — ENGINE: AUTO EVOLUTION
//   Main Evolution Orchestrator
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{EvolutionState, EvolutionReport, EvolutionHistory, RepairResult,
            HeliosState, NexusState, HarmoniaState, SentinelState},
    engine::{DiagnosticsEngine, RepairEngine, HealthCheckEngine},
    utils::{AppResult, log_info, EVOLUTION_MAX_HISTORY},
};
use chrono::Utc;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct AutoEvolutionEngine {
    diagnostics: DiagnosticsEngine,
    repair: RepairEngine,
    health_check: HealthCheckEngine,
    state: Arc<RwLock<EvolutionState>>,
}

impl AutoEvolutionEngine {
    pub fn new() -> Self {
        Self {
            diagnostics: DiagnosticsEngine::new(),
            repair: RepairEngine::new(),
            health_check: HealthCheckEngine::new(),
            state: Arc::new(RwLock::new(EvolutionState::default())),
        }
    }
    
    /// Main evolution pipeline
    pub async fn evolve(
        &self,
        helios: &HeliosState,
        nexus: &NexusState,
        harmonia: &HarmoniaState,
        sentinel: &SentinelState,
    ) -> AppResult<EvolutionReport> {
        log_info("Evolution", "Starting evolution cycle");
        
        // 1. Collect state (already done via parameters)
        
        // 2. Diagnose
        let report = self.diagnostics.diagnose(helios, nexus, harmonia, sentinel).await?;
        
        // 3. Decide (prioritize recommendations)
        let recommendations = report.prioritized_recommendations();
        
        // 4. Repair (apply top recommendations)
        let results = if !recommendations.is_empty() {
            let top_recs: Vec<_> = recommendations.iter().take(3).cloned().collect();
            self.repair.repair_batch(&top_recs).await?
        } else {
            Vec::new()
        };
        
        // 5. Record
        self.record_evolution(&report, &results).await?;
        
        Ok(report)
    }
    
    /// Record evolution in history
    async fn record_evolution(&self, report: &EvolutionReport, results: &[RepairResult]) -> AppResult<()> {
        let mut state = self.state.write().await;
        
        state.reports_generated += 1;
        state.repairs_applied += results.len() as u32;
        state.last_diagnosis = Some(Utc::now().timestamp());
        
        // Calculate success rate
        let successful = results.iter().filter(|r| r.success).count();
        if !results.is_empty() {
            state.success_rate = (successful as f64 / results.len() as f64) * 100.0;
        }
        
        // Add to history
        state.history.push(EvolutionHistory {
            timestamp: Utc::now().timestamp(),
            report_id: report.id.clone(),
            repairs_applied: results.len(),
            outcome: if report.has_critical_issues() { "Critical issues found".to_string() } else { "Healthy".to_string() },
        });
        
        // Keep only last N entries
        if state.history.len() > EVOLUTION_MAX_HISTORY {
            state.history.remove(0);
        }
        
        log_info("Evolution", &format!("Evolution cycle complete - {} repairs applied", results.len()));
        
        Ok(())
    }
    
    /// Get current evolution state
    pub async fn get_state(&self) -> AppResult<EvolutionState> {
        let state = self.state.read().await;
        Ok(state.clone())
    }
    
    /// Quick health check
    pub async fn quick_health_check(
        &self,
        helios: &HeliosState,
        nexus: &NexusState,
        harmonia: &HarmoniaState,
        sentinel: &SentinelState,
    ) -> AppResult<crate::types::HealthStatus> {
        self.health_check.check(helios, nexus, harmonia, sentinel).await
    }
}

impl Default for AutoEvolutionEngine {
    fn default() -> Self {
        Self::new()
    }
}
