// 🎯 Mode Adaptation — Adaptation des 28 modes existants
// Personnalisation dynamique de chaque mode selon les patterns de Kevin

use std::collections::HashMap;

pub struct ModeAdapter {
    mode_parameters: HashMap<String, ModeParameters>,
}

#[derive(Debug, Clone)]
pub struct ModeParameters {
    pub sensitivity: f32,     // Sensibilité du mode
    pub intensity: f32,       // Intensité d'intervention
    #[allow(dead_code)] // Prévu pour évolution future
    pub adaptation_rate: f32, // Vitesse d'adaptation
}

impl Default for ModeParameters {
    fn default() -> Self {
        Self {
            sensitivity: 0.7,
            intensity: 0.7,
            adaptation_rate: 0.5,
        }
    }
}

impl ModeAdapter {
    pub fn new() -> Self {
        let mut mode_parameters = HashMap::new();

        // Initialiser les 28 modes avec paramètres par défaut
        let modes = vec![
            "Maître-Thérapeute Humaniste",
            "Coach Professionnel ICF",
            "PNL Master Practitioner",
            "Hypnose douce non médicale",
            "Méditation profonde TITANE ZÉRO",
            "Digital Twin (Kevin+)",
            "Emotional Engine",
            "Behavioral Engine",
            "LifeEngine",
            "Stratège",
            "Architecte Systémique",
            "Analyste",
            "Autopilot Proactif",
            "Creator Engine",
            "Optimizer",
            "Refactor Engine",
            "Voice Intuitive",
            "Deep Presence Mode",
            "Holistic Consistency",
            "Clarity Engine",
            "Meaning Engine",
            "Focus Engine",
            "Project Navigator",
            "Risk Detector",
            "Forecast Engine",
            "Innovation Engine",
            "Energy Manager",
            "Flow State Inducer",
        ];

        for mode in modes {
            mode_parameters.insert(mode.to_string(), ModeParameters::default());
        }

        Self { mode_parameters }
    }

    /// Adapter les modes selon l'état de Kevin
    pub fn adapt_modes(&mut self, metrics: &super::KevinMetrics) -> Option<String> {
        let mut changes = Vec::new();

        // Adapter Thérapeute (sensibilité élevée si stress/émotion)
        if let Some(params) = self.mode_parameters.get_mut("Maître-Thérapeute Humaniste") {
            let target_sensitivity = if metrics.stress_level > 0.6 || metrics.emotional_state.abs() > 0.5 {
                0.95
            } else {
                0.7
            };

            if (params.sensitivity - target_sensitivity).abs() > 0.1 {
                params.sensitivity = target_sensitivity;
                changes.push(format!("Thérapeute sensibilité → {:.2}", target_sensitivity));
            }
        }

        // Adapter Coach (intensité selon énergie/clarté)
        if let Some(params) = self.mode_parameters.get_mut("Coach Professionnel ICF") {
            let target_intensity = if metrics.clarity_level > 0.7 && metrics.energy_level > 0.6 {
                0.9
            } else if metrics.energy_level < 0.4 {
                0.5
            } else {
                0.7
            };

            if (params.intensity - target_intensity).abs() > 0.1 {
                params.intensity = target_intensity;
                changes.push(format!("Coach intensité → {:.2}", target_intensity));
            }
        }

        // Adapter Méditation TITANE ZÉRO (sensibilité max si surcharge)
        if let Some(params) = self.mode_parameters.get_mut("Méditation profonde TITANE ZÉRO") {
            let target_sensitivity = if metrics.cognitive_load > 0.7 || metrics.stress_level > 0.7 {
                1.0
            } else {
                0.7
            };

            if (params.sensitivity - target_sensitivity).abs() > 0.1 {
                params.sensitivity = target_sensitivity;
                changes.push(format!("TITANE ZÉRO sensibilité → {:.2}", target_sensitivity));
            }
        }

        // Adapter Autopilot (activation si état optimal)
        if let Some(params) = self.mode_parameters.get_mut("Autopilot Proactif") {
            let target_intensity = if metrics.clarity_level > 0.7 && metrics.energy_level > 0.7 {
                0.9
            } else {
                0.3
            };

            if (params.intensity - target_intensity).abs() > 0.2 {
                params.intensity = target_intensity;
                changes.push(format!("Autopilot intensité → {:.2}", target_intensity));
            }
        }

        // Adapter Creator Engine (intensité selon créativité)
        if let Some(params) = self.mode_parameters.get_mut("Creator Engine") {
            let target_intensity = if metrics.creativity_level > 0.7 {
                0.95
            } else if metrics.creativity_level < 0.3 {
                0.5
            } else {
                0.7
            };

            if (params.intensity - target_intensity).abs() > 0.1 {
                params.intensity = target_intensity;
                changes.push(format!("Creator intensité → {:.2}", target_intensity));
            }
        }

        if !changes.is_empty() {
            Some(changes.join(", "))
        } else {
            None
        }
    }

    /// Obtenir les paramètres d'un mode
    pub fn get_mode_parameters(&self, mode: &str) -> Option<&ModeParameters> {
        self.mode_parameters.get(mode)
    }
}

impl Default for ModeAdapter {
    fn default() -> Self {
        Self::new()
    }
}
