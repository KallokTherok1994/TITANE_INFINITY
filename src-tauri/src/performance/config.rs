// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Configuration du Performance Engine

use serde::{Deserialize, Serialize};

/// Configuration complète du Performance Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    // ─── Scheduler ───
    pub max_concurrent_tasks: usize,
    pub realtime_queue_max: usize,
    pub high_priority_queue_max: usize,
    pub normal_queue_max: usize,
    pub background_queue_max: usize,

    // ─── Thread Pools ───
    pub pool_engines_size: usize,
    pub pool_agents_size: usize,
    pub pool_memory_size: usize,
    pub pool_multimodal_size: usize,
    pub pool_api_size: usize,
    pub pool_agi_core_size: usize,
    pub pool_background_size: usize,

    // ─── Parallelism ───
    pub enable_parallel_omega: bool,
    pub enable_parallel_memory: bool,
    pub enable_multimodal_parallel: bool,

    // ─── Load Balancing ───
    pub enable_load_balancing: bool,
    pub load_check_interval_ms: u64,
    pub cpu_threshold_percent: f32,
    pub memory_threshold_percent: f32,

    // ─── Timeouts ───
    pub task_timeout_ms: u64,
    pub engine_timeout_ms: u64,
    pub vector_search_timeout_ms: u64,

    // ─── Energy Integration (#20) ───
    pub energy_aware: bool,
    pub throttle_on_low_energy: bool,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            // Scheduler
            max_concurrent_tasks: 16,
            realtime_queue_max: 10,
            high_priority_queue_max: 50,
            normal_queue_max: 200,
            background_queue_max: 1000,

            // Thread Pools (valeurs conservatrices)
            pool_engines_size: 8,      // OMEGA moteurs
            pool_agents_size: 4,        // Agent System
            pool_memory_size: 4,        // Vector search, clustering
            pool_multimodal_size: 4,    // Vision, Audio3D
            pool_api_size: 4,           // External API calls
            pool_agi_core_size: 2,      // Meta-learning
            pool_background_size: 2,    // Recovery, cleanup

            // Parallelism (désactivé par défaut, activation progressive)
            enable_parallel_omega: false,
            enable_parallel_memory: true,  // Async vector search activé
            enable_multimodal_parallel: true,

            // Load Balancing
            enable_load_balancing: true,
            load_check_interval_ms: 1000,
            cpu_threshold_percent: 80.0,
            memory_threshold_percent: 85.0,

            // Timeouts
            task_timeout_ms: 30_000,      // 30s
            engine_timeout_ms: 10_000,    // 10s
            vector_search_timeout_ms: 5_000, // 5s

            // Energy Integration
            energy_aware: true,
            throttle_on_low_energy: true,
        }
    }
}

impl PerformanceConfig {
    /// Configuration haute performance (serveur dédié)
    pub fn high_performance() -> Self {
        Self {
            max_concurrent_tasks: 32,
            pool_engines_size: 16,
            pool_agents_size: 8,
            pool_memory_size: 8,
            pool_multimodal_size: 8,
            pool_api_size: 8,
            pool_agi_core_size: 4,
            pool_background_size: 4,
            enable_parallel_omega: true,
            ..Default::default()
        }
    }

    /// Configuration économe (laptop, low power)
    pub fn low_power() -> Self {
        Self {
            max_concurrent_tasks: 4,
            pool_engines_size: 2,
            pool_agents_size: 2,
            pool_memory_size: 2,
            pool_multimodal_size: 2,
            pool_api_size: 2,
            pool_agi_core_size: 1,
            pool_background_size: 1,
            enable_parallel_omega: false,
            cpu_threshold_percent: 60.0,
            throttle_on_low_energy: true,
            ..Default::default()
        }
    }

    /// Valide la configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.max_concurrent_tasks == 0 {
            return Err("max_concurrent_tasks must be > 0".to_string());
        }

        if self.pool_engines_size == 0 {
            return Err("pool_engines_size must be > 0".to_string());
        }

        if self.cpu_threshold_percent < 0.0 || self.cpu_threshold_percent > 100.0 {
            return Err("cpu_threshold_percent must be 0-100".to_string());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config_valid() {
        let config = PerformanceConfig::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_high_performance_config() {
        let config = PerformanceConfig::high_performance();
        assert!(config.validate().is_ok());
        assert_eq!(config.max_concurrent_tasks, 32);
        assert!(config.enable_parallel_omega);
    }

    #[test]
    fn test_low_power_config() {
        let config = PerformanceConfig::low_power();
        assert!(config.validate().is_ok());
        assert_eq!(config.max_concurrent_tasks, 4);
        assert!(!config.enable_parallel_omega);
    }

    #[test]
    fn test_invalid_config() {
        let mut config = PerformanceConfig::default();
        config.max_concurrent_tasks = 0;
        assert!(config.validate().is_err());
    }
}
