// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — ENGINE: HEALTH CHECK
//   Quick System Health Assessment
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{HeliosState, NexusState, HarmoniaState, SentinelState, HealthStatus},
    utils::AppResult,
};

pub struct HealthCheckEngine;

impl HealthCheckEngine {
    pub fn new() -> Self {
        Self
    }
    
    /// Quick health check
    pub async fn check(
        &self,
        helios: &HeliosState,
        nexus: &NexusState,
        harmonia: &HarmoniaState,
        sentinel: &SentinelState,
    ) -> AppResult<HealthStatus> {
        
        // Check Helios
        let helios_health = helios.health_status();
        if helios_health == HealthStatus::Critical {
            return Ok(HealthStatus::Critical);
        }
        
        // Check Nexus
        if matches!(nexus.health, crate::types::ModuleHealth::Failing | crate::types::ModuleHealth::Offline) {
            return Ok(HealthStatus::Critical);
        }
        
        // Check Harmonia
        if harmonia.balance_score < 30.0 {
            return Ok(HealthStatus::Critical);
        }
        
        // Check Sentinel
        if sentinel.integrity_score < 50.0 {
            return Ok(HealthStatus::Critical);
        }
        
        // Check for warnings
        if helios_health == HealthStatus::Warning 
            || matches!(nexus.health, crate::types::ModuleHealth::Degraded)
            || harmonia.balance_score < 60.0
            || sentinel.integrity_score < 80.0 {
            return Ok(HealthStatus::Warning);
        }
        
        Ok(HealthStatus::Healthy)
    }
    
    /// Get overall health score (0-100)
    pub fn calculate_score(
        &self,
        helios: &HeliosState,
        nexus: &NexusState,
        harmonia: &HarmoniaState,
        sentinel: &SentinelState,
    ) -> f64 {
        let cpu_score = 100.0 - helios.cpu_usage;
        let ram_score = 100.0 - helios.ram_usage;
        let coherence_score = nexus.coherence_score;
        let balance_score = harmonia.balance_score;
        let integrity_score = sentinel.integrity_score;
        
        // Weighted average
        cpu_score * 0.25 + ram_score * 0.25 + coherence_score * 0.25 + balance_score * 0.15 + integrity_score * 0.10
    }
}

impl Default for HealthCheckEngine {
    fn default() -> Self {
        Self::new()
    }
}
