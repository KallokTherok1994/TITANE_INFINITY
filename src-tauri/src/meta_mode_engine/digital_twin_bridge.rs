#![allow(dead_code)]
//! 🧬 DIGITAL TWIN BRIDGE
//! Fusion avec Digital Twin pour cohérence style Kevin+

use super::KevinState;

pub struct DigitalTwinBridge {
    kevin_style_markers: Vec<String>,
}

impl DigitalTwinBridge {
    pub fn new() -> Self {
        Self {
            kevin_style_markers: vec![
                "clair".to_string(),
                "direct".to_string(),
                "structuré".to_string(),
                "pragmatique".to_string(),
                "cohérent".to_string(),
            ],
        }
    }

    /// Fusionner une réponse avec le style Kevin+
    pub fn fuse_with_kevin_style(&self, base_response: &str, state: &KevinState) -> String {
        // Ajouter clarté si cognitive_load élevé
        let mut fused = base_response.to_string();

        if state.cognitive_load > 0.6 {
            fused = format!("🔹 Clarification : {}", fused);
        }

        if state.stress_level > 0.6 {
            fused = format!("🌿 [Ton apaisant] {}", fused);
        }

        if state.energy_level > 0.7 {
            fused = format!("⚡ {}", fused);
        }

        fused
    }
}
