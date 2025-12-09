// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Thread pools spécialisés pour différents types de tâches cognitives

#![allow(unused_imports)]
#![allow(dead_code)]

use super::config::PerformanceConfig;
use crate::utils::AppResult as TitaneResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum PoolType {
    Engines,
    Agents,
    Memory,
    Multimodal,
    Api,
    AgiCore,
    Background,
}

pub struct CognitiveThreadPools {
    config: PerformanceConfig,
    // TODO: Implémenter vraie gestion pools (tokio, rayon)
    // pool_engines: tokio::runtime::Runtime,
    // pool_agents: tokio::runtime::Runtime,
    // etc.
}

impl CognitiveThreadPools {
    pub fn new(config: &PerformanceConfig) -> TitaneResult<Self> {
        config.validate().map_err(|e| {
            crate::utils::AppError::System(format!(
                "Invalid PerformanceConfig: {}",
                e
            ))
        })?;

        // TODO: Créer thread pools réels selon config
        // let pool_engines = tokio::runtime::Builder::new_multi_thread()
        //     .worker_threads(config.pool_engines_size)
        //     .thread_name("cognitive-engine")
        //     .build()?;

        Ok(Self {
            config: config.clone(),
        })
    }

    pub fn get_pool_size(&self, pool_type: PoolType) -> usize {
        match pool_type {
            PoolType::Engines => self.config.pool_engines_size,
            PoolType::Agents => self.config.pool_agents_size,
            PoolType::Memory => self.config.pool_memory_size,
            PoolType::Multimodal => self.config.pool_multimodal_size,
            PoolType::Api => self.config.pool_api_size,
            PoolType::AgiCore => self.config.pool_agi_core_size,
            PoolType::Background => self.config.pool_background_size,
        }
    }

    /// Obtient le pool approprié pour un type de tâche
    pub fn select_pool(&self, pool_type: PoolType) -> PoolType {
        // Pour le moment retourne le type, à remplacer par vraie référence pool
        pool_type
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_thread_pools_creation() {
        let config = PerformanceConfig::default();
        let pools = CognitiveThreadPools::new(&config);
        assert!(pools.is_ok());
    }

    #[test]
    fn test_pool_sizes() {
        let config = PerformanceConfig::default();
        let pools = CognitiveThreadPools::new(&config).unwrap();

        assert_eq!(pools.get_pool_size(PoolType::Engines), config.pool_engines_size);
        assert_eq!(pools.get_pool_size(PoolType::Memory), config.pool_memory_size);
    }

    #[test]
    fn test_high_performance_config() {
        let config = PerformanceConfig::high_performance();
        let pools = CognitiveThreadPools::new(&config).unwrap();

        assert_eq!(pools.get_pool_size(PoolType::Engines), 16);
        assert_eq!(pools.get_pool_size(PoolType::Agents), 8);
    }
}

