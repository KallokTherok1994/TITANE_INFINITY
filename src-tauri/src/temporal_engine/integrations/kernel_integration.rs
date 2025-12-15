//! ═══════════════════════════════════════════════════════════════════════════════
//! TEMPORAL ENGINE ↔ KERNEL OS INTEGRATION
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::temporal_engine::TemporalContext;
use serde::{Deserialize, Serialize};

/// Bridge entre Temporal Engine et Kernel OS
pub struct TemporalKernelBridge;

impl TemporalKernelBridge {
    /// Obtient les ajustements scheduler basés sur le contexte temporel
    pub fn get_scheduler_adjustments(context: &TemporalContext) -> SchedulerAdjustments {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;

        // Ajuster priorités selon l'heure et le contexte
        let priority_boost = match hour {
            6..=9 => 1.3,   // Morning peak
            10..=11 => 1.5, // Peak focus
            12..=13 => 0.9, // Midday dip
            14..=16 => 1.2, // Afternoon stable
            17..=19 => 1.0, // Evening
            _ => 0.7,       // Night/early morning
        };

        let priority_boost = if is_weekend {
            priority_boost * 0.8 // Reduced on weekends
        } else {
            priority_boost
        };

        SchedulerAdjustments {
            priority_multiplier: priority_boost,
            max_concurrent_jobs: Self::calculate_max_concurrent(hour, is_weekend),
            preemption_threshold: Self::calculate_preemption_threshold(hour),
            idle_threshold_ms: Self::calculate_idle_threshold(hour),
        }
    }

    /// Calcule le nombre max de jobs concurrents
    fn calculate_max_concurrent(hour: u8, is_weekend: bool) -> usize {
        let base = match hour {
            6..=9 => 6,
            10..=11 => 8,
            12..=13 => 4,
            14..=16 => 7,
            17..=19 => 5,
            _ => 3,
        };

        if is_weekend {
            (base as f32 * 0.7) as usize
        } else {
            base
        }
    }

    /// Calcule le seuil de préemption
    fn calculate_preemption_threshold(hour: u8) -> f32 {
        match hour {
            10..=11 => 0.9, // Peak: low preemption
            12..=13 => 0.5, // Midday: high preemption
            _ => 0.7,
        }
    }

    /// Calcule le seuil d'idle
    fn calculate_idle_threshold(hour: u8) -> u64 {
        match hour {
            10..=11 => 100,          // Peak: low idle time
            22..=23 | 0..=5 => 5000, // Night: high idle time
            _ => 1000,
        }
    }

    /// Obtient les limites de ressources
    pub fn get_resource_limits(context: &TemporalContext) -> ResourceLimits {
        let hour = context.now.hour;

        ResourceLimits {
            max_cpu_percent: Self::calculate_max_cpu(hour),
            max_memory_mb: Self::calculate_max_memory(hour),
            max_disk_io_mb_per_sec: Self::calculate_max_disk_io(hour),
            gc_threshold: Self::calculate_gc_threshold(hour),
        }
    }

    fn calculate_max_cpu(hour: u8) -> f32 {
        match hour {
            10..=11 => 95.0,         // Peak: max CPU
            22..=23 | 0..=5 => 30.0, // Night: reduced
            _ => 70.0,
        }
    }

    fn calculate_max_memory(hour: u8) -> usize {
        match hour {
            10..=11 => 8192,         // Peak: 8GB
            22..=23 | 0..=5 => 2048, // Night: 2GB
            _ => 4096,               // Default: 4GB
        }
    }

    fn calculate_max_disk_io(hour: u8) -> usize {
        match hour {
            10..=11 => 500,         // Peak: 500 MB/s
            22..=23 | 0..=5 => 100, // Night: 100 MB/s
            _ => 250,               // Default: 250 MB/s
        }
    }

    fn calculate_gc_threshold(hour: u8) -> f32 {
        match hour {
            22..=23 | 0..=5 => 0.9, // Night: aggressive GC
            10..=11 => 0.5,         // Peak: minimal GC
            _ => 0.7,
        }
    }

    /// Suggère si maintenance système doit être effectuée
    pub fn should_perform_maintenance(context: &TemporalContext) -> MaintenanceAdvice {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;

        let is_maintenance_window = matches!(hour, 2..=4);
        let urgency = if is_maintenance_window {
            if is_weekend {
                MaintenanceUrgency::Critical
            } else {
                MaintenanceUrgency::High
            }
        } else {
            MaintenanceUrgency::Low
        };

        MaintenanceAdvice {
            should_perform: is_maintenance_window,
            urgency,
            suggested_tasks: Self::suggest_maintenance_tasks(hour, is_weekend),
        }
    }

    fn suggest_maintenance_tasks(hour: u8, is_weekend: bool) -> Vec<String> {
        let mut tasks = vec![];

        if matches!(hour, 2..=4) {
            tasks.push("memory_compaction".to_string());
            tasks.push("vector_db_optimization".to_string());
            tasks.push("log_rotation".to_string());

            if is_weekend {
                tasks.push("deep_self_healing".to_string());
                tasks.push("full_memory_consolidation".to_string());
            }
        }

        tasks
    }
}

/// Ajustements scheduler
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SchedulerAdjustments {
    pub priority_multiplier: f32,
    pub max_concurrent_jobs: usize,
    pub preemption_threshold: f32,
    pub idle_threshold_ms: u64,
}

/// Limites de ressources
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub max_cpu_percent: f32,
    pub max_memory_mb: usize,
    pub max_disk_io_mb_per_sec: usize,
    pub gc_threshold: f32,
}

/// Conseil de maintenance
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MaintenanceAdvice {
    pub should_perform: bool,
    pub urgency: MaintenanceUrgency,
    pub suggested_tasks: Vec<String>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum MaintenanceUrgency {
    Low,
    Medium,
    High,
    Critical,
}
