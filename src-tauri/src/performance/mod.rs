// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! # TITANE∞ Performance & Parallelism Engine vΩ
//!
//! Optimisation, multi-threading cognitif, scheduler avancé pour le TITANE∞ OS.
//!
//! ## Modules
//!
//! - `scheduler`: CognitiveScheduler avec multi-queues de priorité
//! - `executor`: Exécuteur non-bloquant tokio
//! - `thread_pool`: Thread pools spécialisés (engines, agents, memory, multimodal)
//! - `task_queue`: Queues de tâches (Realtime, High, Normal, Background)
//! - `priorities`: Modèle de scoring multi-dimensionnel
//! - `load_balancer`: Répartition de charge dynamique (intégré Meta-Energy #20)
//! - `parallel_omega`: Exécution parallèle du pipeline OMEGA v2
//! - `parallel_memory`: Vector search asynchrone
//! - `multimodal_parallel`: Vision/Audio en threads dédiés
//! - `deadlock_detector`: Détection cycles d'attente
//! - `diagnostics`: Métriques performance temps réel
//! - `config`: Configuration pools & queues

#![allow(unused_imports)]
#![allow(dead_code)]

pub mod config;
pub mod diagnostics;
pub mod executor;
pub mod load_balancer;
pub mod multimodal_parallel;
pub mod parallel_memory;
pub mod parallel_omega;
pub mod priorities;
pub mod scheduler;
pub mod task_queue;
pub mod thread_pool;

// Deadlock detector sera implémenté en Phase 2
// pub mod deadlock_detector;

pub use config::PerformanceConfig;
pub use diagnostics::{PerformanceDiagnostics, PerformanceMetrics};
pub use executor::CognitiveExecutor;
pub use load_balancer::LoadBalancer;
pub use priorities::{CognitivePriority, PriorityModel, PriorityScore};
pub use scheduler::{CognitiveScheduler, SchedulerState};
pub use task_queue::{CognitiveTask, TaskPriority, TaskQueues, TaskType};
pub use thread_pool::{CognitiveThreadPools, PoolType};

use crate::utils::AppResult as TitaneResult;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Performance Engine principal
#[derive(Clone)]
pub struct PerformanceEngine {
    scheduler: Arc<CognitiveScheduler>,
    executor: Arc<CognitiveExecutor>,
    thread_pools: Arc<CognitiveThreadPools>,
    load_balancer: Arc<LoadBalancer>,
    diagnostics: Arc<RwLock<PerformanceDiagnostics>>,
    config: PerformanceConfig,
}

impl PerformanceEngine {
    /// Crée un nouveau Performance Engine
    pub fn new(config: PerformanceConfig) -> TitaneResult<Self> {
        let thread_pools = Arc::new(CognitiveThreadPools::new(&config)?);
        let executor = Arc::new(CognitiveExecutor::new(thread_pools.clone()));
        let scheduler = Arc::new(CognitiveScheduler::new(config.clone())?);
        let load_balancer = Arc::new(LoadBalancer::new(config.clone()));
        let diagnostics = Arc::new(RwLock::new(PerformanceDiagnostics::new()));

        Ok(Self {
            scheduler,
            executor,
            thread_pools,
            load_balancer,
            diagnostics,
            config,
        })
    }

    /// Initialise le moteur (démarre background tasks)
    pub async fn initialize(&self) -> TitaneResult<()> {
        log::info!("[PerformanceEngine] Initializing...");

        // Démarrer scheduler loop
        self.scheduler.start().await?;

        // Démarrer load balancer monitoring
        self.load_balancer.start_monitoring().await?;

        log::info!("[PerformanceEngine] ✅ Initialized successfully");
        Ok(())
    }

    /// Soumet une tâche cognitive
    pub async fn submit_task(&self, task: CognitiveTask) -> TitaneResult<String> {
        let task_id = task.id.clone();

        // Enqueue task
        self.scheduler.enqueue(task).await?;

        // Update diagnostics
        let mut diag = self.diagnostics.write().await;
        diag.increment_submitted();

        Ok(task_id)
    }

    /// Accès au scheduler
    pub fn scheduler(&self) -> Arc<CognitiveScheduler> {
        self.scheduler.clone()
    }

    /// Accès aux thread pools
    pub fn pools(&self) -> Arc<CognitiveThreadPools> {
        self.thread_pools.clone()
    }

    /// Accès à l'executor
    pub fn executor(&self) -> Arc<CognitiveExecutor> {
        self.executor.clone()
    }

    /// Accès au load balancer
    pub fn load_balancer(&self) -> Arc<LoadBalancer> {
        self.load_balancer.clone()
    }

    /// Obtient les diagnostics actuels
    pub async fn diagnostics(&self) -> PerformanceDiagnostics {
        self.diagnostics.read().await.clone()
    }

    /// Vérifie si le parallélisme OMEGA est activé
    pub fn is_parallel_enabled(&self) -> bool {
        self.config.enable_parallel_omega
    }

    /// Shutdown propre
    pub async fn shutdown(&self) -> TitaneResult<()> {
        log::info!("[PerformanceEngine] Shutting down...");

        self.scheduler.stop().await?;
        self.load_balancer.stop_monitoring().await?;

        log::info!("[PerformanceEngine] ✅ Shutdown complete");
        Ok(())
    }
}

impl Default for PerformanceEngine {
    fn default() -> Self {
        Self::new(PerformanceConfig::default()).expect("Failed to create default PerformanceEngine")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_performance_engine_creation() {
        let config = PerformanceConfig::default();
        let engine = PerformanceEngine::new(config);
        assert!(engine.is_ok());
    }

    #[tokio::test]
    async fn test_performance_engine_initialization() {
        let config = PerformanceConfig::default();
        let engine = PerformanceEngine::new(config)
            .expect("performance engine should build with default config");
        let result = engine.initialize().await;
        assert!(result.is_ok());

        // Cleanup
        engine
            .shutdown()
            .await
            .expect("shutdown should succeed in test");
    }

    #[tokio::test]
    async fn test_parallel_omega_enabled() {
        let mut config = PerformanceConfig::default();
        config.enable_parallel_omega = true;

        let engine = PerformanceEngine::new(config)
            .expect("performance engine should build when parallel omega enabled");
        assert!(engine.is_parallel_enabled());
    }
}
