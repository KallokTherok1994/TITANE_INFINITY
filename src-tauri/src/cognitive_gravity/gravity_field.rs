// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Champ gravitationnel cognitif

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GravityField {
    pub cognitive_mass: f32,        // Masse cognitive (0.0-1.0)
    pub resonance: f32,             // Résonance harmonique (0.0-1.0)
    pub coherence_force: f32,       // Force de cohérence (-1.0 to 1.0)
    pub alignment_force: f32,       // Force d'alignement (-1.0 to 1.0)
    pub entropy: f32,               // Entropie (0.0-1.0, 0=ordre parfait)
    pub stability: f32,             // Stabilité (0.0-1.0)
    pub last_update: i64,
    pub cycle_count: u64,
}

impl GravityField {
    pub fn new() -> Self {
        Self {
            cognitive_mass: 0.5,
            resonance: 0.5,
            coherence_force: 0.0,
            alignment_force: 0.0,
            entropy: 0.5,
            stability: 0.5,
            last_update: chrono::Utc::now().timestamp_millis(),
            cycle_count: 0,
        }
    }
    
    pub fn calculate_net_force(&self, attractor_sum: f32, anti_attractor_sum: f32) -> f32 {
        (attractor_sum - anti_attractor_sum).clamp(-1.0, 1.0)
    }
    
    pub fn update_from_forces(&mut self, attractor_sum: f32, anti_attractor_sum: f32) {
        let net_force = self.calculate_net_force(attractor_sum, anti_attractor_sum);
        
        // Update coherence force
        self.coherence_force = net_force;
        
        // Update cognitive mass (influenced by attractors)
        self.cognitive_mass = (self.cognitive_mass + attractor_sum * 0.1).clamp(0.0, 1.0);
        
        // Update entropy (influenced by anti-attractors)
        self.entropy = (self.entropy + anti_attractor_sum * 0.1).clamp(0.0, 1.0);
        
        // Update stability (inverse of entropy)
        self.stability = 1.0 - self.entropy;
        
        // Update resonance (combination of mass and stability)
        self.resonance = ((self.cognitive_mass + self.stability) / 2.0).clamp(0.0, 1.0);
        
        self.cycle_count += 1;
        self.last_update = chrono::Utc::now().timestamp_millis();
    }
    
    pub fn is_stable(&self, threshold: f32) -> bool {
        self.stability >= threshold
    }
    
    pub fn is_critical(&self) -> bool {
        self.entropy > 0.7 || self.cognitive_mass < 0.3
    }
}

impl Default for GravityField {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_gravity_field() {
        let mut field = GravityField::new();
        assert_eq!(field.cognitive_mass, 0.5);
        
        field.update_from_forces(0.5, 0.2);
        assert!(field.cognitive_mass > 0.5);
        assert!(field.stability < 1.0);
    }
}
