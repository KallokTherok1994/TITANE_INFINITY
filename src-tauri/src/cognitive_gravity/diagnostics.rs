// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Diagnostics Cognitive Gravity

#![allow(unused_imports)]
#![allow(dead_code)]

use super::anti_attractors::AntiAttractorState;
use super::attractors::AttractorState;
use super::density_model::CognitiveDensity;
use super::gravity_field::GravityField;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GravityDiagnostics {
    pub field: GravityField,
    pub attractors: AttractorState,
    pub anti_attractors: AntiAttractorState,
    pub density: CognitiveDensity,
    pub suggestions: Vec<String>,
    pub warnings: Vec<String>,
}

pub struct GravityMonitor;

impl GravityMonitor {
    pub fn new() -> Self {
        Self
    }

    pub fn analyze(
        &self,
        field: &GravityField,
        attractors: &AttractorState,
        anti_attractors: &AntiAttractorState,
        density: &CognitiveDensity,
    ) -> GravityDiagnostics {
        let mut suggestions = Vec::new();
        let mut warnings = Vec::new();

        // Warnings
        if field.is_critical() {
            warnings.push("⚠️ Champ gravitationnel CRITIQUE".to_string());
        }

        if density.is_overloaded(0.7) {
            warnings.push("🔥 Surcharge cognitive détectée".to_string());
        }

        if field.entropy > 0.6 {
            warnings.push("📊 Entropie élevée".to_string());
        }

        // Suggestions
        if field.cognitive_mass < 0.4 {
            suggestions.push("💡 Augmenter attracteurs (Clarity, Truth)".to_string());
        }

        if anti_attractors.dissonance > 0.5 {
            suggestions.push("🔧 Activer Harmonic OS régulation".to_string());
        }

        if density.overload_risk > 0.6 {
            suggestions.push("⚡ Réduire processus parallèles".to_string());
        }

        GravityDiagnostics {
            field: field.clone(),
            attractors: attractors.clone(),
            anti_attractors: anti_attractors.clone(),
            density: density.clone(),
            suggestions,
            warnings,
        }
    }
}

impl Default for GravityMonitor {
    fn default() -> Self {
        Self::new()
    }
}
