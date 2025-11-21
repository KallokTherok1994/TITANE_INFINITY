// ⚙️ Logic Calibration — Calibration de la logique interne
// Ajustement de la précision, pertinence, cohérence décisionnelle

pub struct LogicCalibrator {
    precision_level: f32,
    pertinence_level: f32,
}

impl LogicCalibrator {
    pub fn new() -> Self {
        Self {
            precision_level: 0.8,
            pertinence_level: 0.8,
        }
    }

    /// Calibrer la logique selon l'état de Kevin
    pub fn calibrate(&mut self, metrics: &super::KevinMetrics) -> Option<String> {
        let mut changes = Vec::new();

        // Ajuster précision selon clarté mentale
        let target_precision = if metrics.clarity_level > 0.7 {
            0.95 // Haute clarté → précision maximale
        } else if metrics.clarity_level < 0.3 {
            0.6 // Confusion → réponses plus générales
        } else {
            0.8
        };

        if (self.precision_level - target_precision).abs() > 0.05 {
            self.precision_level = target_precision;
            changes.push(format!("Précision ajustée à {:.2}", target_precision));
        }

        // Ajuster pertinence selon focus
        let target_pertinence = if metrics.focus_level > 0.8 {
            0.95 // Hyper-focus → haute pertinence
        } else if metrics.cognitive_load > 0.7 {
            0.7 // Surcharge → simplifier
        } else {
            0.85
        };

        if (self.pertinence_level - target_pertinence).abs() > 0.05 {
            self.pertinence_level = target_pertinence;
            changes.push(format!("Pertinence ajustée à {:.2}", target_pertinence));
        }

        if !changes.is_empty() {
            Some(changes.join(", "))
        } else {
            None
        }
    }

    pub fn get_precision(&self) -> f32 {
        self.precision_level
    }

    pub fn get_pertinence(&self) -> f32 {
        self.pertinence_level
    }
}

impl Default for LogicCalibrator {
    fn default() -> Self {
        Self::new()
    }
}
