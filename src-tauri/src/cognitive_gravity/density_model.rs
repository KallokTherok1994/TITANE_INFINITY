// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Modèle de densité cognitive

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveDensity {
    pub local_density: f32,        // Densité locale (0.0-1.0)
    pub global_density: f32,       // Densité globale (0.0-1.0)
    pub overload_risk: f32,        // Risque de surcharge (0.0-1.0)
    pub complexity_score: f32,     // Score de complexité (0.0-1.0)
}

impl CognitiveDensity {
    pub fn new() -> Self {
        Self {
            local_density: 0.5,
            global_density: 0.5,
            overload_risk: 0.0,
            complexity_score: 0.5,
        }
    }
    
    pub fn calculate_from_components(
        &mut self,
        cognitive_mass: f32,
        entropy: f32,
        active_processes: usize,
    ) {
        // Local density = cognitive mass * active processes factor
        let process_factor = (active_processes as f32 / 10.0).min(1.0);
        self.local_density = (cognitive_mass * process_factor).clamp(0.0, 1.0);
        
        // Global density = average of local and entropy
        self.global_density = ((self.local_density + entropy) / 2.0).clamp(0.0, 1.0);
        
        // Overload risk increases with high density and high entropy
        self.overload_risk = (self.local_density * entropy).clamp(0.0, 1.0);
        
        // Complexity = function of density and entropy
        self.complexity_score = ((self.global_density + entropy) / 2.0).clamp(0.0, 1.0);
    }
    
    pub fn is_overloaded(&self, threshold: f32) -> bool {
        self.overload_risk >= threshold
    }
}

impl Default for CognitiveDensity {
    fn default() -> Self {
        Self::new()
    }
}
