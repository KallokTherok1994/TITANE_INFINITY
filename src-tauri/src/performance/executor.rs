// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Executor non-bloquant pour tâches cognitives

#![allow(unused_imports)]
#![allow(dead_code)]

use super::thread_pool::{CognitiveThreadPools, PoolType};
use crate::utils::AppResult as TitaneResult;
use std::sync::Arc;

pub struct CognitiveExecutor {
    pools: Arc<CognitiveThreadPools>,
}

impl CognitiveExecutor {
    pub fn new(pools: Arc<CognitiveThreadPools>) -> Self {
        Self { pools }
    }

    /// Exécute une future asynchrone
    pub async fn execute<F, T>(&self, future: F) -> TitaneResult<T>
    where
        F: std::future::Future<Output = TitaneResult<T>> + Send + 'static,
        T: Send + 'static,
    {
        tokio::spawn(future)
            .await
            .map_err(|e| crate::utils::AppError::System(e.to_string()))?
    }

    /// Exécute sur un pool spécifique
    pub async fn execute_on_pool<F, T>(&self, pool_type: PoolType, future: F) -> TitaneResult<T>
    where
        F: std::future::Future<Output = TitaneResult<T>> + Send + 'static,
        T: Send + 'static,
    {
        // Implementation: Route tasks to specialized thread pools by type
        // - AI pool: High CPU, 4-8 threads for AI inference (Ollama, embeddings)
        // - Memory pool: Low latency, 2-4 threads for memory operations (vector search)
        // - I/O pool: High concurrency, 16+ threads for disk/network I/O
        // - Routing: Match pool_type to get dedicated pool from self.pools
        // - Execution: pool.spawn(future) instead of tokio::spawn for isolation
        // - Fallback: Use tokio global pool if specialized pool unavailable
        // For now, use tokio global
        let _selected_pool = self.pools.select_pool(pool_type);

        tokio::spawn(future)
            .await
            .map_err(|e| crate::utils::AppError::System(e.to_string()))?
    }

    /// Exécute avec timeout
    pub async fn execute_with_timeout<F, T>(&self, future: F, timeout_ms: u64) -> TitaneResult<T>
    where
        F: std::future::Future<Output = TitaneResult<T>> + Send + 'static,
        T: Send + 'static,
    {
        let timeout = tokio::time::Duration::from_millis(timeout_ms);

        tokio::time::timeout(timeout, future).await.map_err(|_| {
            crate::utils::AppError::System(format!("Task timed out after {}ms", timeout_ms))
        })?
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::performance::PerformanceConfig;

    #[tokio::test]
    async fn test_executor_creation() {
        let config = PerformanceConfig::default();
        let pools = Arc::new(CognitiveThreadPools::new(&config).unwrap());
        let _executor = CognitiveExecutor::new(pools);
    }

    #[tokio::test]
    async fn test_execute_simple_future() {
        let config = PerformanceConfig::default();
        let pools = Arc::new(CognitiveThreadPools::new(&config).unwrap());
        let executor = CognitiveExecutor::new(pools);

        let result = executor
            .execute(async { Ok::<i32, crate::utils::AppError>(42) })
            .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_execute_with_timeout_success() {
        let config = PerformanceConfig::default();
        let pools = Arc::new(CognitiveThreadPools::new(&config).unwrap());
        let executor = CognitiveExecutor::new(pools);

        let result = executor
            .execute_with_timeout(
                async {
                    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
                    Ok::<i32, crate::utils::AppError>(42)
                },
                200,
            )
            .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_execute_with_timeout_failure() {
        let config = PerformanceConfig::default();
        let pools = Arc::new(CognitiveThreadPools::new(&config).unwrap());
        let executor = CognitiveExecutor::new(pools);

        let result = executor
            .execute_with_timeout(
                async {
                    tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
                    Ok::<i32, crate::utils::AppError>(42)
                },
                50,
            )
            .await;

        assert!(result.is_err());
    }
}
