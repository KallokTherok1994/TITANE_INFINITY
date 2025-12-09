// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Vision/Audio en threads dédiés
//!
//! Exécute les processus multimodaux (vision ONNX, audio FFT)
//! sur des threads dédiés pour isolation CPU.

#![allow(unused_imports)]
#![allow(dead_code)]

use crate::utils::AppResult as TitaneResult;

pub struct MultimodalParallelEngine {
    enabled: bool,
}

impl MultimodalParallelEngine {
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    // TODO: Implémenter traitement multimodal parallèle
    // pub async fn process_vision_async(&self, image: &[u8]) -> TitaneResult<VisionOutput>
    // pub async fn process_audio_async(&self, audio: &[f32]) -> TitaneResult<AudioOutput>
}

impl Default for MultimodalParallelEngine {
    fn default() -> Self {
        Self::new(true) // Activé par défaut
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multimodal_parallel_creation() {
        let engine = MultimodalParallelEngine::default();
        assert!(engine.is_enabled());
    }
}
