// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Propagation gravitationnelle vers tous moteurs

#![allow(unused_imports)]
#![allow(dead_code)]

use super::gravity_field::GravityField;
use crate::utils::AppResult as TitaneResult;

#[derive(Debug, Clone)]
pub struct GravityPropagation {
    pub to_kernel: bool,
    pub to_omega: bool,
    pub to_memory: bool,
    pub to_agents: bool,
    pub to_harmonic: bool,
    pub force_magnitude: f32,
}

pub struct GravityPropagationEngine;

impl GravityPropagationEngine {
    pub fn new() -> Self {
        Self
    }
    
    pub async fn propagate(&self, field: &GravityField) -> TitaneResult<GravityPropagation> {
        let force_magnitude = field.coherence_force.abs();
        
        Ok(GravityPropagation {
            to_kernel: true,
            to_omega: force_magnitude > 0.3,
            to_memory: force_magnitude > 0.2,
            to_agents: force_magnitude > 0.4,
            to_harmonic: true,
            force_magnitude,
        })
    }
}

impl Default for GravityPropagationEngine {
    fn default() -> Self {
        Self::new()
    }
}
