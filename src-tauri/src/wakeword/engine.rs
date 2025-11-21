/**
 * 🧠 Wakeword Engine - Détection locale "TITANE"
 * Utilise VAD + pattern matching pour hotword
 */

use std::collections::VecDeque;

pub struct WakewordEngine {
    buffer: VecDeque<f32>,
    buffer_size: usize,
    sample_rate: u32,
    vad_threshold: f32,
    pattern: Vec<f32>,
}

impl WakewordEngine {
    pub fn new(sample_rate: u32) -> Self {
        // Buffer pour 500ms d'audio
        let buffer_size = (sample_rate as f32 * 0.5) as usize;
        
        Self {
            buffer: VecDeque::with_capacity(buffer_size),
            buffer_size,
            sample_rate,
            vad_threshold: 0.02, // Seuil VAD
            pattern: Self::generate_titane_pattern(),
        }
    }

    /// Ajouter échantillons audio
    pub fn push_samples(&mut self, samples: &[f32]) {
        for &sample in samples {
            if self.buffer.len() >= self.buffer_size {
                self.buffer.pop_front();
            }
            self.buffer.push_back(sample);
        }
    }

    /// Détecter le hotword "TITANE"
    pub fn detect(&self) -> Option<f32> {
        if self.buffer.len() < self.buffer_size {
            return None;
        }

        // 1. Vérifier activité vocale (VAD)
        if !self.has_voice_activity() {
            return None;
        }

        // 2. Pattern matching simplifié
        let confidence = self.match_pattern();

        if confidence > 0.7 {
            Some(confidence)
        } else {
            None
        }
    }

    /// Vérifier présence de voix (VAD)
    fn has_voice_activity(&self) -> bool {
        // Calculer énergie RMS
        let energy: f32 = self.buffer
            .iter()
            .map(|&s| s * s)
            .sum::<f32>()
            / self.buffer.len() as f32;

        let rms = energy.sqrt();
        rms > self.vad_threshold
    }

    /// Matcher le pattern "TITANE"
    fn match_pattern(&self) -> f32 {
        // Méthode simplifiée: corrélation avec pattern
        // TODO: Implémenter vrai pattern matching (DTW, MFCC, etc.)
        
        let buffer_vec: Vec<f32> = self.buffer.iter().copied().collect();
        
        // Normaliser les deux signaux
        let buffer_norm = Self::normalize(&buffer_vec);
        let pattern_norm = Self::normalize(&self.pattern);

        // Corrélation croisée
        let correlation = Self::cross_correlation(&buffer_norm, &pattern_norm);
        
        correlation.abs()
    }

    /// Générer pattern de référence pour "TITANE"
    fn generate_titane_pattern() -> Vec<f32> {
        // Pattern simplifié représentant "TITANE"
        // TODO: Remplacer par vrai enregistrement de référence
        
        let mut pattern = Vec::new();
        
        // "TI" - attaque forte
        for i in 0..800 {
            pattern.push((i as f32 / 800.0 * std::f32::consts::PI * 2.0).sin() * 0.5);
        }
        
        // "TA" - pic énergétique
        for i in 0..600 {
            pattern.push((i as f32 / 600.0 * std::f32::consts::PI * 3.0).sin() * 0.8);
        }
        
        // "NE" - décroissance
        for i in 0..600 {
            pattern.push((i as f32 / 600.0 * std::f32::consts::PI * 2.0).sin() * 0.3);
        }
        
        pattern
    }

    /// Normaliser un signal
    fn normalize(signal: &[f32]) -> Vec<f32> {
        let mean = signal.iter().sum::<f32>() / signal.len() as f32;
        let variance = signal.iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f32>() / signal.len() as f32;
        let std_dev = variance.sqrt();

        if std_dev > 0.0 {
            signal.iter()
                .map(|&x| (x - mean) / std_dev)
                .collect()
        } else {
            signal.to_vec()
        }
    }

    /// Corrélation croisée
    fn cross_correlation(signal: &[f32], pattern: &[f32]) -> f32 {
        let min_len = signal.len().min(pattern.len());
        
        let sum: f32 = signal[..min_len]
            .iter()
            .zip(&pattern[..min_len])
            .map(|(&s, &p)| s * p)
            .sum();

        sum / min_len as f32
    }

    /// Réinitialiser le buffer
    pub fn reset(&mut self) {
        self.buffer.clear();
    }

    /// Ajuster seuil VAD
    pub fn set_vad_threshold(&mut self, threshold: f32) {
        self.vad_threshold = threshold.clamp(0.001, 0.1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_engine_creation() {
        let engine = WakewordEngine::new(16000);
        assert_eq!(engine.sample_rate, 16000);
        assert_eq!(engine.buffer.len(), 0);
    }

    #[test]
    fn test_push_samples() {
        let mut engine = WakewordEngine::new(16000);
        let samples = vec![0.1, 0.2, 0.3];
        
        engine.push_samples(&samples);
        assert_eq!(engine.buffer.len(), 3);
    }

    #[test]
    fn test_vad_detection() {
        let mut engine = WakewordEngine::new(16000);
        
        // Silence
        let silence = vec![0.001; 8000];
        engine.push_samples(&silence);
        assert!(!engine.has_voice_activity());
        
        // Voix
        engine.reset();
        let voice = vec![0.1; 8000];
        engine.push_samples(&voice);
        assert!(engine.has_voice_activity());
    }

    #[test]
    fn test_normalize() {
        let signal = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let normalized = WakewordEngine::normalize(&signal);
        
        // Moyenne devrait être proche de 0
        let mean = normalized.iter().sum::<f32>() / normalized.len() as f32;
        assert!(mean.abs() < 0.001);
    }
}
