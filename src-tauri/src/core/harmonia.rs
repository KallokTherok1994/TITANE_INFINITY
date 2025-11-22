// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE: HARMONIA
//   System Balancing & Stabilization
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{HarmoniaState, StabilizationLevel, HeliosState},
    utils::{AppResult, log_info, log_warn},
};
use chrono::Utc;

pub struct HarmoniaCore {
    adjustments_applied: std::sync::atomic::AtomicU32,
}

impl HarmoniaCore {
    pub fn new() -> Self {
        Self {
            adjustments_applied: std::sync::atomic::AtomicU32::new(0),
        }
    }
    
    /// Balance system based on current state
    pub async fn balance(&self, helios: &HeliosState) -> AppResult<HarmoniaState> {
        log_info("Harmonia", "Performing system balancing");
        
        let mut state = HarmoniaState {
            balance_score: 100.0,
            active_flows: 0,
            stabilization_level: StabilizationLevel::Stable,
            adjustments_applied: self.adjustments_applied.load(std::sync::atomic::Ordering::Relaxed),
            timestamp: Utc::now().timestamp(),
        };
        
        // Analyze system load
        let cpu_pressure = helios.cpu_usage;
        let ram_pressure = helios.ram_usage;
        
        // Determine stabilization level
        if cpu_pressure > 80.0 || ram_pressure > 80.0 {
            state.stabilization_level = StabilizationLevel::Rebalancing;
            log_warn("Harmonia", &format!("High pressure detected - CPU: {:.1}%, RAM: {:.1}%", cpu_pressure, ram_pressure));
            
            // Increment adjustments counter
            self.adjustments_applied.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            state.adjustments_applied += 1;
        } else if cpu_pressure > 60.0 || ram_pressure > 60.0 {
            state.stabilization_level = StabilizationLevel::Adjusting;
        }
        
        // Calculate balance score
        state.balance_score = 100.0 - ((cpu_pressure + ram_pressure) / 2.0).min(100.0);
        
        Ok(state)
    }
}

impl Default for HarmoniaCore {
    fn default() -> Self {
        Self::new()
    }
}
