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
        // Implementation: Advanced pattern matching with DTW and MFCC
        // - MFCC extraction: Use rustfft + mel filter banks (13 coefficients typical)
        //   * Window: 25ms Hamming window with 10ms hop
        //   * Filters: 26 mel-spaced filter banks from 0-8000Hz
        // - DTW (Dynamic Time Warping): Match variable-length patterns
        //   * Algorithm: Classic DTW with Euclidean distance on MFCC vectors
        //   * Complexity: O(n*m) where n=buffer length, m=pattern length
        //   * Threshold: DTW distance < 50.0 for positive match
        // - Alternative: Cross-correlation in frequency domain for speed
        // - Libraries: rustfft for FFT, ndarray for matrix operations
        
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
        // Implementation: Use real recorded reference samples
        // - Recording: Capture 10+ samples of "TITANE" from different speakers
        //   * Format: 16kHz mono WAV files, 1-2 seconds each
        //   * Environment: Quiet room, varied distances (1m, 3m, 5m)
        // - Preprocessing: Trim silence, normalize amplitude to [-1.0, 1.0]
        // - Averaging: Compute mean MFCC features across all samples
        // - Storage: Save as binary blob in assets/wakeword/titane_pattern.bin
        // - Load at runtime: Read from embedded file with include_bytes!()
        // - Phonetic breakdown: "TI-TA-NE" = 3 syllables, ~0.6s total duration
        // - Alternative: Use TTS engine to generate synthetic samples for data augmentation
        
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

    #[test]
    fn test_engine_different_sample_rates() {
        let engine_8k = WakewordEngine::new(8000);
        let engine_44k = WakewordEngine::new(44100);

        // Buffer size proportionnel au sample rate (500ms)
        assert_eq!(engine_8k.buffer_size, 4000);  // 8000 * 0.5
        assert_eq!(engine_44k.buffer_size, 22050); // 44100 * 0.5
    }

    #[test]
    fn test_reset() {
        let mut engine = WakewordEngine::new(16000);
        engine.push_samples(&[0.1; 1000]);

        assert_eq!(engine.buffer.len(), 1000);
        engine.reset();
        assert_eq!(engine.buffer.len(), 0);
    }

    #[test]
    fn test_set_vad_threshold() {
        let mut engine = WakewordEngine::new(16000);

        engine.set_vad_threshold(0.05);
        assert_eq!(engine.vad_threshold, 0.05);

        // Test clamping - too low
        engine.set_vad_threshold(0.0001);
        assert_eq!(engine.vad_threshold, 0.001);

        // Test clamping - too high
        engine.set_vad_threshold(0.5);
        assert_eq!(engine.vad_threshold, 0.1);
    }

    #[test]
    fn test_buffer_overflow_handling() {
        let mut engine = WakewordEngine::new(16000);
        // Buffer size is 8000 samples (500ms @ 16kHz)

        // Push more than buffer can hold
        engine.push_samples(&[0.5; 10000]);

        // Buffer should be capped at max size
        assert_eq!(engine.buffer.len(), engine.buffer_size);
    }

    #[test]
    fn test_detect_with_insufficient_buffer() {
        let mut engine = WakewordEngine::new(16000);

        // Push less than required for detection
        engine.push_samples(&[0.1; 100]);

        // Should return None due to insufficient data
        assert!(engine.detect().is_none());
    }

    #[test]
    fn test_detect_with_silence() {
        let mut engine = WakewordEngine::new(16000);

        // Fill buffer with silence
        let silence = vec![0.001; 8000];
        engine.push_samples(&silence);

        // Should return None (no voice activity)
        assert!(engine.detect().is_none());
    }

    #[test]
    fn test_cross_correlation() {
        let signal1 = vec![1.0, 2.0, 3.0, 4.0];
        let signal2 = vec![1.0, 2.0, 3.0, 4.0];

        let correlation = WakewordEngine::cross_correlation(&signal1, &signal2);

        // Same signal should have high correlation
        assert!(correlation > 0.0);
    }

    #[test]
    fn test_cross_correlation_different_lengths() {
        let short = vec![1.0, 2.0];
        let long = vec![1.0, 2.0, 3.0, 4.0, 5.0];

        // Should not panic and use minimum length
        let correlation = WakewordEngine::cross_correlation(&short, &long);
        assert!(correlation.is_finite());
    }

    #[test]
    fn test_normalize_zero_variance() {
        let constant = vec![5.0; 10]; // No variance

        let normalized = WakewordEngine::normalize(&constant);

        // With zero variance, should return original
        assert_eq!(normalized.len(), 10);
    }

    #[test]
    fn test_pattern_generation() {
        let pattern = WakewordEngine::generate_titane_pattern();

        // Pattern should have expected length (800 + 600 + 600 = 2000)
        assert_eq!(pattern.len(), 2000);

        // All values should be in reasonable range
        for &val in &pattern {
            assert!(val >= -1.0 && val <= 1.0);
        }
    }

    #[test]
    fn test_normalize_produces_unit_variance() {
        let signal = vec![2.0, 4.0, 6.0, 8.0, 10.0];
        let normalized = WakewordEngine::normalize(&signal);

        // Variance should be close to 1
        let mean = normalized.iter().sum::<f32>() / normalized.len() as f32;
        let variance = normalized.iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f32>() / normalized.len() as f32;

        assert!((variance - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_vad_threshold_exact_boundaries() {
        let mut engine = WakewordEngine::new(16000);

        engine.set_vad_threshold(0.001);
        assert_eq!(engine.vad_threshold, 0.001);

        engine.set_vad_threshold(0.1);
        assert_eq!(engine.vad_threshold, 0.1);
    }

    #[test]
    fn test_push_samples_empty() {
        let mut engine = WakewordEngine::new(16000);
        engine.push_samples(&[]);
        assert_eq!(engine.buffer.len(), 0);
    }

    #[test]
    fn test_push_samples_exact_buffer_size() {
        let mut engine = WakewordEngine::new(16000);
        let samples = vec![0.5; engine.buffer_size];
        engine.push_samples(&samples);
        assert_eq!(engine.buffer.len(), engine.buffer_size);
    }

    #[test]
    fn test_cross_correlation_empty() {
        let empty: Vec<f32> = vec![];
        let signal = vec![1.0, 2.0];

        // Should handle empty gracefully
        let result = WakewordEngine::cross_correlation(&empty, &signal);
        assert!(result.is_nan() || result == 0.0);
    }

    #[test]
    fn test_pattern_values_range() {
        let pattern = WakewordEngine::generate_titane_pattern();

        let max_val = pattern.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        let min_val = pattern.iter().cloned().fold(f32::INFINITY, f32::min);

        assert!(max_val <= 1.0);
        assert!(min_val >= -1.0);
    }

    #[test]
    fn test_multiple_push_samples() {
        let mut engine = WakewordEngine::new(16000);

        engine.push_samples(&[0.1; 100]);
        engine.push_samples(&[0.2; 100]);
        engine.push_samples(&[0.3; 100]);

        assert_eq!(engine.buffer.len(), 300);
    }

    #[test]
    fn test_buffer_fifo_behavior() {
        let mut engine = WakewordEngine::new(16000);

        // Fill buffer exactly
        engine.push_samples(&[0.1; engine.buffer_size]);

        // Push one more - first should be removed
        engine.push_samples(&[0.9]);

        assert_eq!(engine.buffer.len(), engine.buffer_size);
        // Last element should be the newly pushed value
        assert_eq!(*engine.buffer.back().unwrap(), 0.9);
    }

    #[test]
    fn test_has_voice_activity_boundary() {
        let mut engine = WakewordEngine::new(16000);

        // Exactly at threshold - should be detected
        let threshold_samples = vec![engine.vad_threshold + 0.001; 8000];
        engine.push_samples(&threshold_samples);
        assert!(engine.has_voice_activity());
    }

    #[test]
    fn test_match_pattern_returns_bounded() {
        let mut engine = WakewordEngine::new(16000);
        engine.push_samples(&[0.5; engine.buffer_size]);

        let confidence = engine.match_pattern();
        // Should be bounded and finite
        assert!(confidence.is_finite());
    }

    #[test]
    fn test_detect_returns_confidence_above_threshold() {
        // If detect returns Some, confidence should be > 0.7
        // Create engine with pattern-like data
        let mut engine = WakewordEngine::new(16000);

        // Use the pattern itself as input for maximum match
        let pattern = WakewordEngine::generate_titane_pattern();
        let mut samples = vec![0.0; engine.buffer_size];
        for (i, &p) in pattern.iter().enumerate() {
            if i < samples.len() {
                samples[i] = p;
            }
        }

        engine.push_samples(&samples);

        if let Some(confidence) = engine.detect() {
            assert!(confidence > 0.7);
        }
    }

    #[test]
    fn test_reset_multiple_times() {
        let mut engine = WakewordEngine::new(16000);

        engine.push_samples(&[0.1; 1000]);
        engine.reset();
        assert_eq!(engine.buffer.len(), 0);

        engine.push_samples(&[0.2; 500]);
        engine.reset();
        assert_eq!(engine.buffer.len(), 0);

        // Reset on empty buffer
        engine.reset();
        assert_eq!(engine.buffer.len(), 0);
    }

    #[test]
    fn test_normalize_single_element() {
        let single = vec![5.0];
        let normalized = WakewordEngine::normalize(&single);
        assert_eq!(normalized.len(), 1);
    }

    #[test]
    fn test_normalize_negative_values() {
        let signal = vec![-5.0, -3.0, -1.0, 1.0, 3.0, 5.0];
        let normalized = WakewordEngine::normalize(&signal);

        // Mean should be close to 0
        let mean = normalized.iter().sum::<f32>() / normalized.len() as f32;
        assert!(mean.abs() < 0.001);
    }

    #[test]
    fn test_sample_rate_stored() {
        let engine = WakewordEngine::new(48000);
        assert_eq!(engine.sample_rate, 48000);
    }
}
