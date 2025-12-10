//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — RESOURCE GOVERNOR
//! Gestion et allocation des ressources système
//! ═══════════════════════════════════════════════════════════════════════════

use super::{IoPriority, MetaOrchestratorError, OrchestrationMode, ResourceAllocation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Gouverneur de ressources
pub struct ResourceGovernor {
    allocation: Arc<RwLock<ResourceAllocation>>,
    policies: ResourcePolicies,
    history: Arc<RwLock<Vec<AllocationChange>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourcePolicies {
    pub auto_scale_enabled: bool,
    pub min_cpu_quota: f64,
    pub max_cpu_quota: f64,
    pub min_memory_mb: u64,
    pub max_memory_mb: u64,
    pub scale_up_threshold: f64,
    pub scale_down_threshold: f64,
    pub cooldown_seconds: u64,
}

impl Default for ResourcePolicies {
    fn default() -> Self {
        Self {
            auto_scale_enabled: true,
            min_cpu_quota: 20.0,
            max_cpu_quota: 95.0,
            min_memory_mb: 512,
            max_memory_mb: 8192,
            scale_up_threshold: 80.0,
            scale_down_threshold: 30.0,
            cooldown_seconds: 30,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllocationChange {
    pub timestamp: u64,
    pub resource_type: ResourceType,
    pub old_value: f64,
    pub new_value: f64,
    pub reason: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResourceType {
    CPU,
    Memory,
    GPU,
    IO,
    Network,
    ThreadPool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceReport {
    pub adjustments_made: usize,
    pub current_allocation: ResourceAllocation,
    pub utilization: ResourceUtilization,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUtilization {
    pub cpu_utilized: f64,
    pub memory_utilized: f64,
    pub gpu_utilized: f64,
    pub io_utilized: f64,
}

impl ResourceGovernor {
    pub fn new() -> Self {
        Self {
            allocation: Arc::new(RwLock::new(ResourceAllocation::default())),
            policies: ResourcePolicies::default(),
            history: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn initialize(&self) -> Result<(), MetaOrchestratorError> {
        log::info!("[ResourceGovernor] Initializing resource governor...");
        Ok(())
    }

    /// Optimise l'allocation des ressources
    pub async fn optimize(&self) -> Result<ResourceReport, MetaOrchestratorError> {
        let utilization = self.measure_utilization().await;
        let mut adjustments = 0;

        // Auto-scaling basé sur l'utilisation
        if self.policies.auto_scale_enabled {
            // Scaling CPU
            let cpu_adjusted = if utilization.cpu_utilized > self.policies.scale_up_threshold {
                self.scale_up_cpu().await.is_ok()
            } else if utilization.cpu_utilized < self.policies.scale_down_threshold {
                self.scale_down_cpu().await.is_ok()
            } else {
                false
            };
            if cpu_adjusted {
                adjustments += 1;
            }

            // Scaling Mémoire
            if utilization.memory_utilized > self.policies.scale_up_threshold
                && self.scale_up_memory().await.is_ok()
            {
                adjustments += 1;
            }
        }

        let allocation = self.allocation.read().await.clone();
        let recommendations = self.generate_recommendations(&utilization);

        Ok(ResourceReport {
            adjustments_made: adjustments,
            current_allocation: allocation,
            utilization,
            recommendations,
        })
    }

    /// Applique un mode d'orchestration
    pub async fn apply_mode(&self, mode: OrchestrationMode) -> Result<(), MetaOrchestratorError> {
        let mut allocation = self.allocation.write().await;

        match mode {
            OrchestrationMode::Minimal => {
                allocation.cpu_quota_percent = 30.0;
                allocation.memory_limit_mb = 1024;
                allocation.gpu_enabled = false;
                allocation.thread_pool_size = 4;
            }
            OrchestrationMode::Balanced => {
                allocation.cpu_quota_percent = 60.0;
                allocation.memory_limit_mb = 4096;
                allocation.gpu_enabled = true;
                allocation.gpu_quota_percent = 50.0;
                allocation.thread_pool_size = 8;
            }
            OrchestrationMode::Performance => {
                allocation.cpu_quota_percent = 90.0;
                allocation.memory_limit_mb = 8192;
                allocation.gpu_enabled = true;
                allocation.gpu_quota_percent = 80.0;
                allocation.thread_pool_size = 16;
                allocation.io_priority = IoPriority::High;
            }
            OrchestrationMode::PowerSave => {
                allocation.cpu_quota_percent = 40.0;
                allocation.memory_limit_mb = 2048;
                allocation.gpu_enabled = false;
                allocation.thread_pool_size = 4;
                allocation.io_priority = IoPriority::Low;
            }
            OrchestrationMode::Emergency => {
                allocation.cpu_quota_percent = 95.0;
                allocation.memory_limit_mb = 8192;
                allocation.gpu_enabled = true;
                allocation.gpu_quota_percent = 90.0;
                allocation.thread_pool_size = 16;
                allocation.io_priority = IoPriority::Realtime;
            }
            OrchestrationMode::Maintenance => {
                allocation.cpu_quota_percent = 50.0;
                allocation.memory_limit_mb = 2048;
                allocation.gpu_enabled = false;
                allocation.thread_pool_size = 4;
            }
        }

        log::info!(
            "[ResourceGovernor] Applied mode {:?}: CPU={:.0}%, Memory={}MB",
            mode,
            allocation.cpu_quota_percent,
            allocation.memory_limit_mb
        );

        Ok(())
    }

    async fn measure_utilization(&self) -> ResourceUtilization {
        // En production, utiliser sysinfo pour les vraies métriques
        ResourceUtilization {
            cpu_utilized: 35.0,
            memory_utilized: 45.0,
            gpu_utilized: 10.0,
            io_utilized: 20.0,
        }
    }

    async fn scale_up_cpu(&self) -> Result<(), MetaOrchestratorError> {
        let mut allocation = self.allocation.write().await;
        let old = allocation.cpu_quota_percent;
        allocation.cpu_quota_percent = (old + 10.0).min(self.policies.max_cpu_quota);

        if allocation.cpu_quota_percent != old {
            self.record_change(
                ResourceType::CPU,
                old,
                allocation.cpu_quota_percent,
                "Auto scale up",
            )
            .await;
        }

        Ok(())
    }

    async fn scale_down_cpu(&self) -> Result<(), MetaOrchestratorError> {
        let mut allocation = self.allocation.write().await;
        let old = allocation.cpu_quota_percent;
        allocation.cpu_quota_percent = (old - 10.0).max(self.policies.min_cpu_quota);

        if allocation.cpu_quota_percent != old {
            self.record_change(
                ResourceType::CPU,
                old,
                allocation.cpu_quota_percent,
                "Auto scale down",
            )
            .await;
        }

        Ok(())
    }

    async fn scale_up_memory(&self) -> Result<(), MetaOrchestratorError> {
        let mut allocation = self.allocation.write().await;
        let old = allocation.memory_limit_mb as f64;
        allocation.memory_limit_mb =
            (allocation.memory_limit_mb + 512).min(self.policies.max_memory_mb);

        self.record_change(
            ResourceType::Memory,
            old,
            allocation.memory_limit_mb as f64,
            "Auto scale up",
        )
        .await;

        Ok(())
    }

    async fn record_change(&self, resource_type: ResourceType, old: f64, new: f64, reason: &str) {
        let change = AllocationChange {
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
            resource_type,
            old_value: old,
            new_value: new,
            reason: reason.to_string(),
        };

        let mut history = self.history.write().await;
        history.push(change);

        // Limiter l'historique à 100 entrées
        if history.len() > 100 {
            history.remove(0);
        }
    }

    fn generate_recommendations(&self, utilization: &ResourceUtilization) -> Vec<String> {
        let mut recommendations = Vec::new();

        if utilization.cpu_utilized > 80.0 {
            recommendations.push("High CPU usage detected - consider scaling up".to_string());
        }

        if utilization.memory_utilized > 85.0 {
            recommendations
                .push("Memory pressure detected - increase limit or optimize".to_string());
        }

        if utilization.gpu_utilized < 5.0 {
            recommendations
                .push("GPU underutilized - consider disabling for power savings".to_string());
        }

        recommendations
    }

    /// Récupère l'allocation actuelle
    pub async fn get_allocation(&self) -> ResourceAllocation {
        self.allocation.read().await.clone()
    }

    /// Récupère l'historique des changements
    pub async fn get_history(&self) -> Vec<AllocationChange> {
        self.history.read().await.clone()
    }
}
