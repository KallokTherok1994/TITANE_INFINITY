// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Load Balancer pour répartition dynamique de charge

#![allow(unused_imports)]
#![allow(dead_code)]

use super::config::PerformanceConfig;
use crate::utils::AppResult as TitaneResult;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct LoadState {
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub active_tasks: usize,
    pub is_overloaded: bool,
}

pub struct LoadBalancer {
    config: PerformanceConfig,
    state: Arc<RwLock<LoadState>>,
    running: Arc<RwLock<bool>>,
}

impl LoadBalancer {
    pub fn new(config: PerformanceConfig) -> Self {
        Self {
            config,
            state: Arc::new(RwLock::new(LoadState {
                cpu_usage: 0.0,
                memory_usage: 0.0,
                active_tasks: 0,
                is_overloaded: false,
            })),
            running: Arc::new(RwLock::new(false)),
        }
    }

    pub async fn start_monitoring(&self) -> TitaneResult<()> {
        *self.running.write().await = true;
        log::info!("[LoadBalancer] ✅ Started monitoring");

        // TODO: Spawn background task pour monitorer charge système
        // let state = self.state.clone();
        // let config = self.config.clone();
        // tokio::spawn(async move {
        //     while *running.read().await {
        //         let cpu = get_cpu_usage();
        //         let mem = get_memory_usage();
        //         state.write().await.update(cpu, mem);
        //         tokio::time::sleep(Duration::from_millis(config.load_check_interval_ms)).await;
        //     }
        // });

        Ok(())
    }

    pub async fn stop_monitoring(&self) -> TitaneResult<()> {
        *self.running.write().await = false;
        log::info!("[LoadBalancer] Stopped monitoring");
        Ok(())
    }

    pub async fn current_load(&self) -> LoadState {
        self.state.read().await.clone()
    }

    pub async fn is_overloaded(&self) -> bool {
        let state = self.state.read().await;
        state.cpu_usage > self.config.cpu_threshold_percent
            || state.memory_usage > self.config.memory_threshold_percent
    }

    pub async fn should_throttle(&self) -> bool {
        if !self.config.enable_load_balancing {
            return false;
        }

        self.is_overloaded().await
    }

    /// Update load state (appelé par monitoring loop)
    pub async fn update_load(&self, cpu: f32, memory: f32, active_tasks: usize) {
        let mut state = self.state.write().await;
        state.cpu_usage = cpu;
        state.memory_usage = memory;
        state.active_tasks = active_tasks;
        state.is_overloaded = cpu > self.config.cpu_threshold_percent
            || memory > self.config.memory_threshold_percent;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_load_balancer_creation() {
        let config = PerformanceConfig::default();
        let lb = LoadBalancer::new(config);
        assert!(lb.start_monitoring().await.is_ok());
        lb.stop_monitoring().await.unwrap();
    }

    #[tokio::test]
    async fn test_overload_detection() {
        let mut config = PerformanceConfig::default();
        config.cpu_threshold_percent = 80.0;

        let lb = LoadBalancer::new(config);

        // Normal load
        lb.update_load(50.0, 50.0, 5).await;
        assert!(!lb.is_overloaded().await);

        // Overloaded
        lb.update_load(85.0, 50.0, 10).await;
        assert!(lb.is_overloaded().await);
    }

    #[tokio::test]
    async fn test_throttling_disabled() {
        let mut config = PerformanceConfig::default();
        config.enable_load_balancing = false;

        let lb = LoadBalancer::new(config);
        lb.update_load(95.0, 95.0, 20).await; // Très surchargé

        assert!(!lb.should_throttle().await); // Mais throttling désactivé
    }
}
