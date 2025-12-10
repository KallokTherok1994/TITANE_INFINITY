// ═══════════════════════════════════════════════════════════════
//   KERNEL INTEGRATION — Cycle Engine ↔ Kernel OS
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::{
    cognitive_rhythm::CognitiveRhythmParams, load_regulator::LoadRegulationParams, CycleEngine,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Kernel Integration Bridge
pub struct KernelCycleBridge {
    cycle_engine: Arc<CycleEngine>,
}

impl KernelCycleBridge {
    pub fn new(cycle_engine: Arc<CycleEngine>) -> Self {
        Self { cycle_engine }
    }

    /// Get scheduler priority adjustments based on current cycle
    pub async fn get_scheduler_adjustments(&self) -> SchedulerAdjustments {
        let rhythm = self.cycle_engine.current_rhythm().await;
        let load_params = self.cycle_engine.current_load_params().await;

        SchedulerAdjustments {
            priority_multiplier: self.calculate_priority_multiplier(&rhythm),
            max_concurrent_tasks: self.calculate_max_concurrent(&load_params),
            task_timeout_multiplier: rhythm.speed_vs_quality,
            prefer_batch_processing: matches!(
                rhythm.mode,
                crate::cycle_engine::cycles::CognitiveMode::Consolidation
            ),
        }
    }

    /// Get resource limits based on current cycle
    pub async fn get_resource_limits(&self) -> ResourceLimits {
        let load_params = self.cycle_engine.current_load_params().await;
        let state = self.cycle_engine.current_state().await;

        ResourceLimits {
            max_cpu_usage: self.calculate_max_cpu(&state),
            max_memory_mb: self.calculate_max_memory(&state),
            max_concurrent_engines: load_params.kernel_priority as usize * 5 + 5,
            gc_threshold: load_params.memory_gc_frequency,
        }
    }

    fn calculate_priority_multiplier(&self, rhythm: &CognitiveRhythmParams) -> f32 {
        match rhythm.mode {
            crate::cycle_engine::cycles::CognitiveMode::Peak => 1.5,
            crate::cycle_engine::cycles::CognitiveMode::Analytical => 1.2,
            crate::cycle_engine::cycles::CognitiveMode::Consolidation => 0.7,
            _ => 1.0,
        }
    }

    fn calculate_max_concurrent(&self, load_params: &LoadRegulationParams) -> usize {
        (load_params.kernel_priority * 10.0) as usize + 3
    }

    fn calculate_max_cpu(&self, state: &crate::cycle_engine::cycles::CycleState) -> f32 {
        match state.daily_phase {
            crate::cycle_engine::cycles::DailyPhase::Noon => 0.9,
            crate::cycle_engine::cycles::DailyPhase::Night => 0.5,
            _ => 0.7,
        }
    }

    fn calculate_max_memory(&self, state: &crate::cycle_engine::cycles::CycleState) -> usize {
        match state.daily_phase {
            crate::cycle_engine::cycles::DailyPhase::Noon => 4096,
            crate::cycle_engine::cycles::DailyPhase::Night => 2048,
            _ => 3072,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerAdjustments {
    pub priority_multiplier: f32,
    pub max_concurrent_tasks: usize,
    pub task_timeout_multiplier: f32,
    pub prefer_batch_processing: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub max_cpu_usage: f32,
    pub max_memory_mb: usize,
    pub max_concurrent_engines: usize,
    pub gc_threshold: f32,
}
