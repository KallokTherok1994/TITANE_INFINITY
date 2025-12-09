// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Vector search asynchrone pour Memory OS
//!
//! Exécute les recherches vectorielles (FAISS/HNSW) en arrière-plan
//! pour ne pas bloquer le pipeline principal.

#![allow(unused_imports)]
#![allow(dead_code)]

use crate::utils::AppResult as TitaneResult;

pub struct ParallelMemoryEngine {
    enabled: bool,
}

impl ParallelMemoryEngine {
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    // TODO: Implémenter vector search async
    // pub async fn search_async(&self, query: &str) -> TitaneResult<Vec<MemoryItem>>
}

impl Default for ParallelMemoryEngine {
    fn default() -> Self {
        Self::new(true) // Activé par défaut
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parallel_memory_creation() {
        let engine = ParallelMemoryEngine::default();
        assert!(engine.is_enabled());
    }
}
