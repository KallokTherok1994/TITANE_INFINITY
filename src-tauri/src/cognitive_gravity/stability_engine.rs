// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Moteur de stabilité gravitationnelle

#![allow(unused_imports)]
#![allow(dead_code)]

use super::gravity_field::GravityField;
use crate::utils::AppResult as TitaneResult;

pub struct StabilityEngine {
    resync_threshold: f32,
    convergence_window: usize,
    stability_history: Vec<f32>,
}

impl StabilityEngine {
    pub fn new(resync_threshold: f32) -> Self {
        Self {
            resync_threshold,
            convergence_window: 10,
            stability_history: Vec::new(),
        }
    }

    pub async fn check_stability(&mut self, field: &GravityField) -> TitaneResult<bool> {
        // Add current stability to history
        self.stability_history.push(field.stability);

        // Keep only last N values
        if self.stability_history.len() > self.convergence_window {
            self.stability_history.remove(0);
        }

        // Check if stable
        let is_stable = field.is_stable(self.resync_threshold);

        Ok(is_stable)
    }

    pub fn needs_resync(&self, field: &GravityField) -> bool {
        field.is_critical() || !field.is_stable(self.resync_threshold)
    }

    pub fn compute_convergence(&self) -> f32 {
        if self.stability_history.is_empty() {
            return 0.0;
        }

        // Calculate variance of stability history
        let mean: f32 =
            self.stability_history.iter().sum::<f32>() / self.stability_history.len() as f32;
        let variance: f32 = self
            .stability_history
            .iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f32>()
            / self.stability_history.len() as f32;

        // Convergence = 1 - variance (lower variance = higher convergence)
        (1.0 - variance).clamp(0.0, 1.0)
    }
}

impl Default for StabilityEngine {
    fn default() -> Self {
        Self::new(0.7)
    }
}
