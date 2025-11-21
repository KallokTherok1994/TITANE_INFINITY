// ✨ Style Refinement — Raffinement du style d'interaction
// Ajustement automatique du ton, profondeur, rythme, structure

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleProfile {
    pub tone: Tone,
    pub depth: Depth,
    pub rhythm: Rhythm,
    pub structure: Structure,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Tone {
    Encouraging,   // Encourageant
    Reassuring,    // Rassurant
    Direct,        // Direct
    Reflective,    // Réflexif
    Clarifying,    // Clarificateur
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Depth {
    Synthetic,   // Synthétique (résumé)
    Detailed,    // Détaillé (équilibré)
    Exhaustive,  // Exhaustif (complet)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Rhythm {
    Slow,      // Lent (posé, contemplatif)
    Moderate,  // Modéré (équilibré)
    Fast,      // Rapide (efficace, concis)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Structure {
    Linear,      // Linéaire (A→B→C)
    Modular,     // Modulaire (sections indépendantes)
    Narrative,   // Narratif (histoire, progression)
}

impl Default for StyleProfile {
    fn default() -> Self {
        Self {
            tone: Tone::Direct,
            depth: Depth::Detailed,
            rhythm: Rhythm::Moderate,
            structure: Structure::Modular,
        }
    }
}

pub struct StyleRefiner {
    current_profile: StyleProfile,
}

impl StyleRefiner {
    pub fn new() -> Self {
        Self {
            current_profile: StyleProfile::default(),
        }
    }

    /// Raffiner le style selon l'état de Kevin
    pub fn refine_style(&mut self, metrics: &super::KevinMetrics) -> Option<String> {
        let mut changes = Vec::new();

        // Ajuster le ton
        let new_tone = if metrics.stress_level > 0.6 {
            Tone::Reassuring
        } else if metrics.energy_level > 0.7 {
            Tone::Encouraging
        } else if metrics.clarity_level < 0.4 {
            Tone::Clarifying
        } else if metrics.emotional_state.abs() > 0.5 {
            Tone::Reflective
        } else {
            Tone::Direct
        };

        if format!("{:?}", self.current_profile.tone) != format!("{:?}", new_tone) {
            self.current_profile.tone = new_tone.clone();
            changes.push(format!("Ton → {:?}", new_tone));
        }

        // Ajuster la profondeur
        let new_depth = if metrics.cognitive_load > 0.7 {
            Depth::Synthetic
        } else if metrics.clarity_level > 0.7 && metrics.energy_level > 0.6 {
            Depth::Exhaustive
        } else {
            Depth::Detailed
        };

        if format!("{:?}", self.current_profile.depth) != format!("{:?}", new_depth) {
            self.current_profile.depth = new_depth.clone();
            changes.push(format!("Profondeur → {:?}", new_depth));
        }

        // Ajuster le rythme
        let new_rhythm = if metrics.energy_level < 0.4 || metrics.stress_level > 0.6 {
            Rhythm::Slow
        } else if metrics.energy_level > 0.7 && metrics.focus_level > 0.7 {
            Rhythm::Fast
        } else {
            Rhythm::Moderate
        };

        if format!("{:?}", self.current_profile.rhythm) != format!("{:?}", new_rhythm) {
            self.current_profile.rhythm = new_rhythm.clone();
            changes.push(format!("Rythme → {:?}", new_rhythm));
        }

        // Ajuster la structure
        let new_structure = if metrics.clarity_level < 0.4 {
            Structure::Linear
        } else if metrics.cognitive_load > 0.6 {
            Structure::Modular
        } else {
            Structure::Narrative
        };

        if format!("{:?}", self.current_profile.structure) != format!("{:?}", new_structure) {
            self.current_profile.structure = new_structure.clone();
            changes.push(format!("Structure → {:?}", new_structure));
        }

        if !changes.is_empty() {
            Some(changes.join(", "))
        } else {
            None
        }
    }

    /// Obtenir le profil actuel
    pub fn get_current_profile(&self) -> &StyleProfile {
        &self.current_profile
    }
}

impl Default for StyleRefiner {
    fn default() -> Self {
        Self::new()
    }
}
