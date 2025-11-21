#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                      AUDIO CALIBRATOR v13                                    ║
// ║                  Auto-calibration microphone                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{AdaptiveAudioConfig, EnvironmentProfile};

/// Calibrateur audio automatique
pub struct AudioCalibrator {
    config: AdaptiveAudioConfig,
    calibration_samples: Vec<f32>,
    is_calibrating: bool,
}

impl AudioCalibrator {
    /// Crée un nouveau calibrateur
    pub fn new() -> Self {
        Self {
            config: AdaptiveAudioConfig::default(),
            calibration_samples: Vec::with_capacity(1000),
            is_calibrating: false,
        }
    }

    /// Lance la calibration automatique
    pub async fn start_calibration(&mut self) -> Result<(), String> {
        self.is_calibrating = true;
        self.calibration_samples.clear();
        Ok(())
    }

    /// Ajoute un échantillon audio pendant la calibration
    pub fn add_sample(&mut self, sample: f32) {
        if self.is_calibrating && self.calibration_samples.len() < 1000 {
            self.calibration_samples.push(sample);
        }
    }

    /// Finalise la calibration et applique la config
    pub fn finalize_calibration(&mut self) -> Result<AdaptiveAudioConfig, String> {
        if !self.is_calibrating {
            return Err("Calibration not started".to_string());
        }

        if self.calibration_samples.len() < 100 {
            return Err("Not enough samples".to_string());
        }

        // Analyser les échantillons
        let noise_floor = self.calculate_noise_floor();
        let voice_level = self.calculate_voice_level();
        let environment = self.detect_environment(noise_floor);

        // Ajuster la configuration
        self.config.vad_threshold = environment.recommended_vad_threshold();
        self.config.noise_reduction = environment.recommended_noise_reduction();
        self.config.mic_gain = self.calculate_optimal_gain(voice_level, noise_floor);
        self.config.is_calibrated = true;

        self.is_calibrating = false;
        self.calibration_samples.clear();

        Ok(self.config.clone())
    }

    /// Calcule le niveau de bruit de fond
    fn calculate_noise_floor(&self) -> f32 {
        if self.calibration_samples.is_empty() {
            return 0.0;
        }

        // Prendre le 10ème percentile comme niveau de bruit
        let mut sorted = self.calibration_samples.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        
        let index = (sorted.len() as f32 * 0.1) as usize;
        sorted[index]
    }

    /// Calcule le niveau vocal moyen
    fn calculate_voice_level(&self) -> f32 {
        if self.calibration_samples.is_empty() {
            return 0.0;
        }

        // Prendre le 70ème percentile comme niveau vocal
        let mut sorted = self.calibration_samples.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        
        let index = (sorted.len() as f32 * 0.7) as usize;
        sorted[index]
    }

    /// Détecte le profil d'environnement
    fn detect_environment(&self, noise_floor: f32) -> EnvironmentProfile {
        if noise_floor < 0.1 {
            EnvironmentProfile::Silent
        } else if noise_floor < 0.25 {
            EnvironmentProfile::Moderate
        } else if noise_floor < 0.5 {
            EnvironmentProfile::Noisy
        } else if noise_floor < 0.75 {
            EnvironmentProfile::VeryNoisy
        } else {
            EnvironmentProfile::Industrial
        }
    }

    /// Calcule le gain optimal
    fn calculate_optimal_gain(&self, voice_level: f32, noise_floor: f32) -> f32 {
        let snr = voice_level / noise_floor.max(0.01);

        // Si SNR faible, augmenter le gain
        if snr < 2.0 {
            1.5
        } else if snr < 5.0 {
            1.2
        } else if snr > 10.0 {
            0.8
        } else {
            1.0
        }
    }

    /// Obtient la config actuelle
    pub fn get_config(&self) -> &AdaptiveAudioConfig {
        &self.config
    }

    /// Recalibre en continu (ajustements mineurs)
    pub fn continuous_adjust(&mut self, recent_samples: &[f32]) {
        if !self.config.is_calibrated {
            return;
        }

        // Ajustement progressif basé sur les derniers échantillons
        let current_noise = recent_samples.iter()
            .map(|s| s.abs())
            .sum::<f32>() / recent_samples.len() as f32;

        // Ajuster légèrement le seuil VAD
        let target_threshold = if current_noise > 0.5 {
            (self.config.vad_threshold * 1.05).min(0.9)
        } else {
            (self.config.vad_threshold * 0.98).max(0.2)
        };

        // Lissage progressif
        self.config.vad_threshold = self.config.vad_threshold * 0.95 + target_threshold * 0.05;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calibrator_creation() {
        let calibrator = AudioCalibrator::new();
        assert!(!calibrator.is_calibrating);
        assert!(!calibrator.config.is_calibrated);
    }

    #[test]
    fn test_noise_floor_calculation() {
        let mut calibrator = AudioCalibrator::new();
        
        // Ajouter des échantillons simulés
        for i in 0..100 {
            let sample = if i < 10 { 0.1 } else { 0.5 };
            calibrator.calibration_samples.push(sample);
        }

        let noise_floor = calibrator.calculate_noise_floor();
        assert!(noise_floor < 0.2);
    }

    #[test]
    fn test_environment_detection() {
        let calibrator = AudioCalibrator::new();
        
        let silent = calibrator.detect_environment(0.05);
        assert_eq!(silent, EnvironmentProfile::Silent);

        let noisy = calibrator.detect_environment(0.6);
        assert_eq!(noisy, EnvironmentProfile::VeryNoisy);
    }

    #[tokio::test]
    async fn test_calibration_flow() {
        let mut calibrator = AudioCalibrator::new();
        
        calibrator.start_calibration().await.unwrap();
        assert!(calibrator.is_calibrating);

        // Ajouter des échantillons
        for _ in 0..200 {
            calibrator.add_sample(0.3);
        }

        let config = calibrator.finalize_calibration().unwrap();
        assert!(config.is_calibrated);
        assert!(!calibrator.is_calibrating);
    }
}
