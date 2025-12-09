// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Absorbeur de dissonances cognitives

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DissonanceRecord {
    pub source: String,
    pub severity: f32,
    pub absorbed: bool,
    pub timestamp: i64,
}

pub struct DissonanceAbsorber {
    absorption_capacity: f32,
    current_load: f32,
    absorbed_dissonances: Vec<DissonanceRecord>,
}

impl DissonanceAbsorber {
    pub fn new(absorption_capacity: f32) -> Self {
        Self {
            absorption_capacity,
            current_load: 0.0,
            absorbed_dissonances: Vec::new(),
        }
    }
    
    pub fn absorb(&mut self, source: String, severity: f32) -> bool {
        if self.current_load + severity <= self.absorption_capacity {
            self.current_load += severity;
            self.absorbed_dissonances.push(DissonanceRecord {
                source,
                severity,
                absorbed: true,
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
            true
        } else {
            self.absorbed_dissonances.push(DissonanceRecord {
                source,
                severity,
                absorbed: false,
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
            false
        }
    }
    
    pub fn release(&mut self, amount: f32) {
        self.current_load = (self.current_load - amount).max(0.0);
    }
    
    pub fn is_full(&self) -> bool {
        self.current_load >= self.absorption_capacity
    }
    
    pub fn get_load_percentage(&self) -> f32 {
        if self.absorption_capacity > 0.0 {
            (self.current_load / self.absorption_capacity).clamp(0.0, 1.0)
        } else {
            0.0
        }
    }
}

impl Default for DissonanceAbsorber {
    fn default() -> Self {
        Self::new(1.0)
    }
}
