/**
 * TITANE∞ v∞ — SP-VOICE-001 Partie 3/3: Voice Fingerprinting Rust
 * Backend Rust pour détection acoustique voix TITANE vs voix User
 * 
 * Résout feedback loop Layer 3: Voice fingerprinting
 * Détecte si l'audio capturé est la voix de TITANE (TTS) ou la voix de l'utilisateur
 * 
 * Features:
 * - Pitch detection
 * - Formant frequencies (F1, F2, F3)
 * - Spectral centroid
 * - MFCC (Mel-Frequency Cepstral Coefficients)
 * - Calibration: 5-10s samples de voix TITANE
 * - Similarity score: 0.0 (User) à 1.0 (TITANE)
 * 
 * Target: <50ms latency, >90% accuracy, <5% false positives
 */

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceFeatures {
    /// Fundamental frequency (Hz)
    pub pitch: f32,
    /// Formant frequencies F1, F2, F3 (Hz)
    pub formants: Vec<f32>,
    /// Spectral centroid (Hz)
    pub spectral_centroid: f32,
    /// MFCC coefficients (13 coefficients)
    pub mfcc: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceProfile {
    /// Average features from calibration samples
    pub avg_features: VoiceFeatures,
    /// Standard deviation for each feature
    pub std_dev: VoiceFeatures,
    /// Number of calibration samples
    pub sample_count: usize,
}

#[derive(Debug)]
pub struct VoiceFingerprint {
    /// TITANE voice profile (calibrated)
    titane_profile: Arc<Mutex<Option<VoiceProfile>>>,
    /// Similarity threshold (0.0-1.0)
    similarity_threshold: f32,
}

impl VoiceFingerprint {
    pub fn new() -> Self {
        Self {
            titane_profile: Arc::new(Mutex::new(None)),
            similarity_threshold: 0.75, // Default: 75% similarity = TITANE
        }
    }

    /**
     * Extract acoustic features from audio samples
     * 
     * @param samples Audio samples (16kHz mono)
     * @return VoiceFeatures
     */
    pub fn extract_features(&self, samples: &[f32]) -> VoiceFeatures {
        // Placeholder implementation - production should use:
        // - rustfft for FFT
        // - ndarray for matrix operations
        // - aubio-rs or similar for pitch/formants

        let pitch = self.detect_pitch(samples);
        let formants = self.detect_formants(samples);
        let spectral_centroid = self.calculate_spectral_centroid(samples);
        let mfcc = self.calculate_mfcc(samples);

        VoiceFeatures {
            pitch,
            formants,
            spectral_centroid,
            mfcc,
        }
    }

    /**
     * Calibrate TITANE voice profile
     * 
     * Requires 5-10 seconds of TITANE TTS samples (various phrases)
     * Should be called once at startup or when TTS voice changes
     * 
     * @param samples_list Multiple audio samples (16kHz mono)
     */
    pub fn calibrate_titane(&self, samples_list: Vec<Vec<f32>>) -> Result<(), String> {
        if samples_list.is_empty() {
            return Err("No samples provided for calibration".to_string());
        }

        println!("[VoiceFingerprint] 🎯 Calibrating TITANE voice profile with {} samples", samples_list.len());

        // Extract features from all samples
        let features_list: Vec<VoiceFeatures> = samples_list
            .iter()
            .map(|samples| self.extract_features(samples))
            .collect();

        // Calculate average and std dev
        let avg_features = self.calculate_average(&features_list);
        let std_dev = self.calculate_std_dev(&features_list, &avg_features);

        let profile = VoiceProfile {
            avg_features,
            std_dev,
            sample_count: samples_list.len(),
        };

        // Store profile
        let mut titane = self.titane_profile.lock().unwrap();
        *titane = Some(profile.clone());

        println!("[VoiceFingerprint] ✅ TITANE voice profile calibrated:");
        println!("  - Pitch: {:.1} Hz (±{:.1})", profile.avg_features.pitch, profile.std_dev.pitch);
        println!("  - F1: {:.1} Hz, F2: {:.1} Hz, F3: {:.1} Hz", 
            profile.avg_features.formants[0],
            profile.avg_features.formants[1],
            profile.avg_features.formants[2]
        );
        println!("  - Spectral centroid: {:.1} Hz", profile.avg_features.spectral_centroid);

        Ok(())
    }

    /**
     * Check if audio is TITANE speaking
     * 
     * @param samples Audio samples (16kHz mono)
     * @return (is_titane, similarity_score)
     */
    pub fn is_titane_speaking(&self, samples: &[f32]) -> (bool, f32) {
        let titane = self.titane_profile.lock().unwrap();

        if titane.is_none() {
            println!("[VoiceFingerprint] ⚠️ TITANE profile not calibrated, returning false");
            return (false, 0.0);
        }

        let profile = titane.as_ref().unwrap();

        // Extract features from current audio
        let current_features = self.extract_features(samples);

        // Calculate similarity score (0.0 = different, 1.0 = identical)
        let similarity = self.calculate_similarity(&current_features, &profile.avg_features);

        let is_titane = similarity >= self.similarity_threshold;

        if is_titane {
            println!("[VoiceFingerprint] 🎯 TITANE detected (similarity: {:.2})", similarity);
        }

        (is_titane, similarity)
    }

    /**
     * Check if TITANE profile is calibrated
     */
    pub fn is_calibrated(&self) -> bool {
        let titane = self.titane_profile.lock().unwrap();
        titane.is_some()
    }

    /**
     * Get TITANE profile info (if calibrated)
     */
    pub fn get_profile_info(&self) -> Option<(usize, f32)> {
        let titane = self.titane_profile.lock().unwrap();
        titane.as_ref().map(|profile| {
            (profile.sample_count, self.similarity_threshold)
        })
    }

    // ========== INTERNAL METHODS ==========

    fn detect_pitch(&self, samples: &[f32]) -> f32 {
        // Placeholder: Use autocorrelation or YIN algorithm
        // Production: Use aubio-rs pitch detection
        
        // Typical TTS pitch ranges:
        // - Female TTS: 180-220 Hz
        // - Male TTS: 100-130 Hz
        // - Human female: 150-250 Hz
        // - Human male: 85-180 Hz
        
        150.0 // Placeholder
    }

    fn detect_formants(&self, samples: &[f32]) -> Vec<f32> {
        // Placeholder: Use LPC (Linear Predictive Coding)
        // Production: Extract F1, F2, F3 formants from spectrum
        
        // Typical formants (Hz):
        // /a/: F1=700, F2=1220, F3=2600
        // /i/: F1=270, F2=2290, F3=3010
        // /u/: F1=300, F2=870, F3=2240
        
        vec![700.0, 1220.0, 2600.0] // Placeholder
    }

    fn calculate_spectral_centroid(&self, samples: &[f32]) -> f32 {
        // Placeholder: FFT → weighted average frequency
        // Production: Use rustfft
        
        1500.0 // Placeholder (Hz)
    }

    fn calculate_mfcc(&self, samples: &[f32]) -> Vec<f32> {
        // Placeholder: 13 MFCC coefficients
        // Production: Use ndarray + rustfft
        
        vec![0.0; 13] // Placeholder
    }

    fn calculate_average(&self, features_list: &[VoiceFeatures]) -> VoiceFeatures {
        let n = features_list.len() as f32;

        let pitch = features_list.iter().map(|f| f.pitch).sum::<f32>() / n;

        let formants = (0..3)
            .map(|i| {
                features_list.iter().map(|f| f.formants[i]).sum::<f32>() / n
            })
            .collect();

        let spectral_centroid = features_list.iter().map(|f| f.spectral_centroid).sum::<f32>() / n;

        let mfcc = (0..13)
            .map(|i| {
                features_list.iter().map(|f| f.mfcc[i]).sum::<f32>() / n
            })
            .collect();

        VoiceFeatures {
            pitch,
            formants,
            spectral_centroid,
            mfcc,
        }
    }

    fn calculate_std_dev(&self, features_list: &[VoiceFeatures], avg: &VoiceFeatures) -> VoiceFeatures {
        let n = features_list.len() as f32;

        let pitch = (features_list.iter().map(|f| (f.pitch - avg.pitch).powi(2)).sum::<f32>() / n).sqrt();

        let formants = (0..3)
            .map(|i| {
                (features_list.iter().map(|f| (f.formants[i] - avg.formants[i]).powi(2)).sum::<f32>() / n).sqrt()
            })
            .collect();

        let spectral_centroid = (features_list.iter().map(|f| (f.spectral_centroid - avg.spectral_centroid).powi(2)).sum::<f32>() / n).sqrt();

        let mfcc = (0..13)
            .map(|i| {
                (features_list.iter().map(|f| (f.mfcc[i] - avg.mfcc[i]).powi(2)).sum::<f32>() / n).sqrt()
            })
            .collect();

        VoiceFeatures {
            pitch,
            formants,
            spectral_centroid,
            mfcc,
        }
    }

    fn calculate_similarity(&self, a: &VoiceFeatures, b: &VoiceFeatures) -> f32 {
        // Weighted similarity score
        let pitch_weight = 0.25;
        let formant_weight = 0.25;
        let spectral_weight = 0.2;
        let mfcc_weight = 0.3;

        // Pitch similarity (normalized distance)
        let pitch_sim = 1.0 - ((a.pitch - b.pitch).abs() / 200.0).min(1.0);

        // Formant similarity
        let formant_sim = (0..3)
            .map(|i| 1.0 - ((a.formants[i] - b.formants[i]).abs() / 1000.0).min(1.0))
            .sum::<f32>() / 3.0;

        // Spectral centroid similarity
        let spectral_sim = 1.0 - ((a.spectral_centroid - b.spectral_centroid).abs() / 2000.0).min(1.0);

        // MFCC similarity (cosine similarity)
        let mfcc_sim = self.cosine_similarity(&a.mfcc, &b.mfcc);

        // Weighted average
        pitch_weight * pitch_sim
            + formant_weight * formant_sim
            + spectral_weight * spectral_sim
            + mfcc_weight * mfcc_sim
    }

    fn cosine_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let mag_a: f32 = a.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
        let mag_b: f32 = b.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();

        if mag_a == 0.0 || mag_b == 0.0 {
            return 0.0;
        }

        dot_product / (mag_a * mag_b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_features() {
        let fingerprint = VoiceFingerprint::new();
        let samples = vec![0.0; 16000]; // 1 second @ 16kHz

        let features = fingerprint.extract_features(&samples);

        assert_eq!(features.formants.len(), 3);
        assert_eq!(features.mfcc.len(), 13);
    }

    #[test]
    fn test_calibrate_titane() {
        let fingerprint = VoiceFingerprint::new();
        let samples_list = vec![
            vec![0.0; 16000],
            vec![0.0; 16000],
            vec![0.0; 16000],
        ];

        let result = fingerprint.calibrate_titane(samples_list);
        assert!(result.is_ok());
    }

    #[test]
    fn test_is_titane_speaking_without_calibration() {
        let fingerprint = VoiceFingerprint::new();
        let samples = vec![0.0; 16000];

        let (is_titane, score) = fingerprint.is_titane_speaking(&samples);

        assert_eq!(is_titane, false);
        assert_eq!(score, 0.0);
    }
}
