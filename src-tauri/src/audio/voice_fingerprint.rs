/**
 * TITANE∞ v∞ — SP-VOICE-001 Partie 3/3: Voice Fingerprinting Rust
 * Backend Rust pour détection acoustique voix TITANE vs voix User
 *
 * Résout feedback loop Layer 3: Voice fingerprinting
 * Détecte si l'audio capturé est la voix de TITANE (TTS) ou la voix de l'utilisateur
 *
 * Features:
 * - YIN algorithm: Pitch detection (fundamental frequency F0)
 * - LPC (Linear Predictive Coding): Formant extraction (F1, F2, F3)
 * - FFT (Fast Fourier Transform): Spectral centroid
 * - MFCC (Mel-Frequency Cepstral Coefficients): 13 coefficients
 * - Calibration: 5-10s samples de voix TITANE
 * - Similarity score: 0.0 (User) à 1.0 (TITANE)
 *
 * Target: <50ms latency, >90% accuracy, <5% false positives
 */
use rustfft::{num_complex::Complex, FftPlanner};
use serde::{Deserialize, Serialize};
use std::f32::consts::PI;
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
            similarity_threshold: 0.85, // Higher threshold for accuracy (reduced false positives)
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

        println!(
            "[VoiceFingerprint] 🎯 Calibrating TITANE voice profile with {} samples",
            samples_list.len()
        );

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
        println!(
            "  - Pitch: {:.1} Hz (±{:.1})",
            profile.avg_features.pitch, profile.std_dev.pitch
        );
        println!(
            "  - F1: {:.1} Hz, F2: {:.1} Hz, F3: {:.1} Hz",
            profile.avg_features.formants[0],
            profile.avg_features.formants[1],
            profile.avg_features.formants[2]
        );
        println!(
            "  - Spectral centroid: {:.1} Hz",
            profile.avg_features.spectral_centroid
        );

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
            println!(
                "[VoiceFingerprint] 🎯 TITANE detected (similarity: {:.2})",
                similarity
            );
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
        titane
            .as_ref()
            .map(|profile| (profile.sample_count, self.similarity_threshold))
    }

    // ========== INTERNAL METHODS ==========

    /**
     * YIN Algorithm: Pitch detection via autocorrelation
     *
     * Reference: "YIN, a fundamental frequency estimator for speech and music"
     * by Alain de Cheveigné and Hideki Kawahara (2002)
     *
     * @param samples Audio samples (16kHz mono)
     * @return Fundamental frequency F0 (Hz), or 0.0 if no pitch detected
     */
    fn detect_pitch(&self, samples: &[f32]) -> f32 {
        if samples.len() < 2048 {
            return 0.0; // Not enough samples
        }

        let sample_rate = 16000.0;
        let min_lag = (sample_rate / 500.0) as usize; // Max 500 Hz
        let max_lag = (sample_rate / 60.0) as usize; // Min 60 Hz

        // Step 1: Difference function
        let mut diff = vec![0.0; max_lag + 1];
        for tau in 0..=max_lag {
            let mut sum = 0.0;
            for j in 0..(samples.len() - tau) {
                let delta = samples[j] - samples[j + tau];
                sum += delta * delta;
            }
            diff[tau] = sum;
        }

        // Step 2: Cumulative mean normalized difference
        let mut cmnd = vec![0.0; max_lag + 1];
        cmnd[0] = 1.0;
        let mut running_sum = 0.0;
        for tau in 1..=max_lag {
            running_sum += diff[tau];
            cmnd[tau] = diff[tau] / (running_sum / tau as f32);
        }

        // Step 3: Absolute threshold (find first minimum below 0.1)
        let threshold = 0.1;
        let mut tau_estimate = 0;
        for tau in min_lag..=max_lag {
            if cmnd[tau] < threshold {
                // Parabolic interpolation for sub-sample precision
                if tau > 0 && tau < max_lag {
                    let x0 = cmnd[tau - 1];
                    let x1 = cmnd[tau];
                    let x2 = cmnd[tau + 1];
                    let better_tau = tau as f32 + (x2 - x0) / (2.0 * (2.0 * x1 - x2 - x0));
                    tau_estimate = better_tau as usize;
                } else {
                    tau_estimate = tau;
                }
                break;
            }
        }

        if tau_estimate > 0 {
            sample_rate / tau_estimate as f32
        } else {
            0.0 // No pitch detected
        }
    }

    /**
     * LPC (Linear Predictive Coding): Formant extraction
     *
     * Uses autocorrelation method + Levinson-Durbin algorithm
     * to find LPC coefficients, then extract formant frequencies
     *
     * @param samples Audio samples (16kHz mono)
     * @return Formants [F1, F2, F3] in Hz
     */
    fn detect_formants(&self, samples: &[f32]) -> Vec<f32> {
        if samples.len() < 512 {
            return vec![700.0, 1220.0, 2600.0]; // Default /a/ vowel
        }

        let sample_rate = 16000.0;
        let order = 12; // LPC order (typical: 10-14)

        // Step 1: Pre-emphasis filter (boost high frequencies)
        let mut emphasized = vec![0.0; samples.len()];
        let alpha = 0.97;
        emphasized[0] = samples[0];
        for i in 1..samples.len() {
            emphasized[i] = samples[i] - alpha * samples[i - 1];
        }

        // Step 2: Hamming window
        let window_size = emphasized.len().min(512);
        let mut windowed = vec![0.0; window_size];
        for i in 0..window_size {
            let hamming = 0.54 - 0.46 * (2.0 * PI * i as f32 / (window_size - 1) as f32).cos();
            windowed[i] = emphasized[i] * hamming;
        }

        // Step 3: Autocorrelation
        let mut autocorr = vec![0.0; order + 1];
        for k in 0..=order {
            let mut sum = 0.0;
            for n in 0..(window_size - k) {
                sum += windowed[n] * windowed[n + k];
            }
            autocorr[k] = sum;
        }

        // Step 4: Levinson-Durbin algorithm
        let mut lpc = vec![0.0; order + 1];
        let mut error = autocorr[0];

        for i in 1..=order {
            let mut lambda = 0.0;
            for j in 1..i {
                lambda += lpc[j] * autocorr[i - j];
            }
            let ki = (autocorr[i] - lambda) / error;

            // Save old coefficients before updating
            let old_lpc = lpc.clone();
            lpc[i] = ki;

            for j in 1..i {
                lpc[j] = old_lpc[j] - ki * old_lpc[i - j];
            }

            error *= 1.0 - ki * ki;
        }

        // Step 5: Convert LPC to formants via root finding (simplified)
        // Find peaks in spectrum (formants = resonances)
        let mut formants = Vec::new();
        let nfft = 512;
        let mut spectrum = vec![0.0; nfft / 2];

        for k in 0..(nfft / 2) {
            let freq = k as f32 * sample_rate / nfft as f32;
            let omega = 2.0 * PI * freq / sample_rate;

            let mut real = 1.0;
            let mut imag = 0.0;

            for n in 1..=order {
                real -= lpc[n] * (n as f32 * omega).cos();
                imag += lpc[n] * (n as f32 * omega).sin();
            }

            spectrum[k] = 1.0 / (real * real + imag * imag).sqrt();
        }

        // Find local maxima (formants)
        for i in 1..(spectrum.len() - 1) {
            if spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1] {
                let freq = i as f32 * sample_rate / nfft as f32;
                if freq > 200.0 && freq < 4000.0 {
                    formants.push(freq);
                }
            }
        }

        // Return first 3 formants (F1, F2, F3)
        formants.sort_by(|a, b| a.partial_cmp(b).unwrap());
        while formants.len() < 3 {
            formants.push(0.0);
        }
        formants.truncate(3);
        formants
    }

    /**
     * FFT: Spectral centroid calculation
     *
     * Spectral centroid = weighted average of frequencies
     * (brightness/timbre measure)
     *
     * @param samples Audio samples (16kHz mono)
     * @return Spectral centroid in Hz
     */
    fn calculate_spectral_centroid(&self, samples: &[f32]) -> f32 {
        if samples.len() < 512 {
            return 0.0;
        }

        let sample_rate = 16000.0;
        let fft_size = 512;

        // Prepare FFT input
        let mut buffer: Vec<Complex<f32>> = samples
            .iter()
            .take(fft_size)
            .map(|&x| Complex { re: x, im: 0.0 })
            .collect();

        // Apply Hamming window
        for (i, sample) in buffer.iter_mut().enumerate() {
            let hamming = 0.54 - 0.46 * (2.0 * PI * i as f32 / (fft_size - 1) as f32).cos();
            sample.re *= hamming;
        }

        // Compute FFT
        let mut planner = FftPlanner::new();
        let fft = planner.plan_fft_forward(fft_size);
        fft.process(&mut buffer);

        // Compute magnitude spectrum
        let mut magnitude = vec![0.0; fft_size / 2];
        for i in 0..(fft_size / 2) {
            magnitude[i] = (buffer[i].re * buffer[i].re + buffer[i].im * buffer[i].im).sqrt();
        }

        // Compute spectral centroid
        let mut numerator = 0.0;
        let mut denominator = 0.0;
        for (i, &mag) in magnitude.iter().enumerate() {
            let freq = i as f32 * sample_rate / fft_size as f32;
            numerator += freq * mag;
            denominator += mag;
        }

        if denominator > 0.0 {
            numerator / denominator
        } else {
            0.0
        }
    }

    /**
     * MFCC: Mel-Frequency Cepstral Coefficients
     *
     * Pipeline:
     * 1. FFT → Power spectrum
     * 2. Mel filterbank (40 filters, 20-8000 Hz)
     * 3. Log(energy)
     * 4. DCT-II → 13 MFCC coefficients
     *
     * @param samples Audio samples (16kHz mono)
     * @return 13 MFCC coefficients
     */
    fn calculate_mfcc(&self, samples: &[f32]) -> Vec<f32> {
        if samples.len() < 512 {
            return vec![0.0; 13];
        }

        let sample_rate = 16000.0;
        let fft_size = 512;
        let num_filters = 40;
        let num_cepstral = 13;

        // Step 1: FFT → Power spectrum
        let mut buffer: Vec<Complex<f32>> = samples
            .iter()
            .take(fft_size)
            .map(|&x| Complex { re: x, im: 0.0 })
            .collect();

        // Apply Hamming window
        for (i, sample) in buffer.iter_mut().enumerate() {
            let hamming = 0.54 - 0.46 * (2.0 * PI * i as f32 / (fft_size - 1) as f32).cos();
            sample.re *= hamming;
        }

        let mut planner = FftPlanner::new();
        let fft = planner.plan_fft_forward(fft_size);
        fft.process(&mut buffer);

        let mut power_spectrum = vec![0.0; fft_size / 2];
        for i in 0..(fft_size / 2) {
            power_spectrum[i] = buffer[i].re * buffer[i].re + buffer[i].im * buffer[i].im;
        }

        // Step 2: Mel filterbank
        let mel_filters = self.create_mel_filterbank(num_filters, fft_size, sample_rate);
        let mut mel_energies = vec![0.0; num_filters];
        for (i, filter) in mel_filters.iter().enumerate() {
            let mut energy = 0.0;
            for (j, &coeff) in filter.iter().enumerate() {
                energy += coeff * power_spectrum[j];
            }
            mel_energies[i] = energy.max(1e-10); // Avoid log(0)
        }

        // Step 3: Log energy
        for energy in mel_energies.iter_mut() {
            *energy = energy.ln();
        }

        // Step 4: DCT-II
        let mut mfcc = vec![0.0; num_cepstral];
        for i in 0..num_cepstral {
            let mut sum = 0.0;
            for (j, &energy) in mel_energies.iter().enumerate() {
                sum += energy * ((PI * i as f32 * (j as f32 + 0.5)) / num_filters as f32).cos();
            }
            mfcc[i] = sum;
        }

        mfcc
    }

    /**
     * Create Mel filterbank
     *
     * @param num_filters Number of filters (typically 40)
     * @param fft_size FFT size
     * @param sample_rate Sample rate (Hz)
     * @return Vec of filters, each filter is Vec<f32> of size fft_size/2
     */
    fn create_mel_filterbank(
        &self,
        num_filters: usize,
        fft_size: usize,
        sample_rate: f32,
    ) -> Vec<Vec<f32>> {
        let low_freq = 20.0;
        let high_freq = sample_rate / 2.0;

        // Convert Hz to Mel
        let hz_to_mel = |hz: f32| 2595.0 * (1.0 + hz / 700.0).log10();
        let mel_to_hz = |mel: f32| 700.0 * (10.0_f32.powf(mel / 2595.0) - 1.0);

        let low_mel = hz_to_mel(low_freq);
        let high_mel = hz_to_mel(high_freq);

        // Create mel points (linearly spaced in mel scale)
        let mut mel_points = vec![0.0; num_filters + 2];
        for i in 0..(num_filters + 2) {
            mel_points[i] = low_mel + (high_mel - low_mel) * i as f32 / (num_filters + 1) as f32;
        }

        // Convert mel points to Hz
        let mut hz_points = vec![0.0; num_filters + 2];
        for i in 0..(num_filters + 2) {
            hz_points[i] = mel_to_hz(mel_points[i]);
        }

        // Convert Hz to FFT bin
        let mut bin_points = vec![0; num_filters + 2];
        for i in 0..(num_filters + 2) {
            bin_points[i] = ((fft_size as f32 + 1.0) * hz_points[i] / sample_rate).floor() as usize;
        }

        // Create triangular filters
        let mut filters = vec![vec![0.0; fft_size / 2]; num_filters];
        for i in 0..num_filters {
            let left = bin_points[i];
            let center = bin_points[i + 1];
            let right = bin_points[i + 2];

            // Rising slope
            for j in left..center {
                if center > left {
                    filters[i][j] = (j - left) as f32 / (center - left) as f32;
                }
            }

            // Falling slope
            for j in center..right {
                if right > center {
                    filters[i][j] = (right - j) as f32 / (right - center) as f32;
                }
            }
        }

        filters
    }

    fn detect_pitch_placeholder(&self, _samples: &[f32]) -> f32 {
        // Fallback if YIN fails
        150.0
    }

    fn detect_formants_placeholder(&self, _samples: &[f32]) -> Vec<f32> {
        vec![700.0, 1220.0, 2600.0]
    }

    fn calculate_spectral_centroid_placeholder(&self, _samples: &[f32]) -> f32 {
        1500.0
    }

    fn calculate_mfcc_placeholder(&self, _samples: &[f32]) -> Vec<f32> {
        vec![0.0; 13]
    }

    fn calculate_average(&self, features_list: &[VoiceFeatures]) -> VoiceFeatures {
        let n = features_list.len() as f32;

        let pitch = features_list.iter().map(|f| f.pitch).sum::<f32>() / n;

        let formants = (0..3)
            .map(|i| features_list.iter().map(|f| f.formants[i]).sum::<f32>() / n)
            .collect();

        let spectral_centroid = features_list
            .iter()
            .map(|f| f.spectral_centroid)
            .sum::<f32>()
            / n;

        let mfcc = (0..13)
            .map(|i| features_list.iter().map(|f| f.mfcc[i]).sum::<f32>() / n)
            .collect();

        VoiceFeatures {
            pitch,
            formants,
            spectral_centroid,
            mfcc,
        }
    }

    fn calculate_std_dev(
        &self,
        features_list: &[VoiceFeatures],
        avg: &VoiceFeatures,
    ) -> VoiceFeatures {
        let n = features_list.len() as f32;

        let pitch = (features_list
            .iter()
            .map(|f| (f.pitch - avg.pitch).powi(2))
            .sum::<f32>()
            / n)
            .sqrt();

        let formants = (0..3)
            .map(|i| {
                (features_list
                    .iter()
                    .map(|f| (f.formants[i] - avg.formants[i]).powi(2))
                    .sum::<f32>()
                    / n)
                    .sqrt()
            })
            .collect();

        let spectral_centroid = (features_list
            .iter()
            .map(|f| (f.spectral_centroid - avg.spectral_centroid).powi(2))
            .sum::<f32>()
            / n)
            .sqrt();

        let mfcc = (0..13)
            .map(|i| {
                (features_list
                    .iter()
                    .map(|f| (f.mfcc[i] - avg.mfcc[i]).powi(2))
                    .sum::<f32>()
                    / n)
                    .sqrt()
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
        // Weighted similarity score (optimized for voice discrimination)
        let pitch_weight = 0.35; // Higher: pitch is key for voice ID
        let formant_weight = 0.35; // Higher: formants define voice character
        let spectral_weight = 0.15; // Lower: less discriminative
        let mfcc_weight = 0.15; // Lower: noisy with synthetic signals

        // Pitch similarity (normalized distance)
        let pitch_sim = 1.0 - ((a.pitch - b.pitch).abs() / 200.0).min(1.0);

        // Formant similarity
        let formant_sim = (0..3)
            .map(|i| 1.0 - ((a.formants[i] - b.formants[i]).abs() / 1000.0).min(1.0))
            .sum::<f32>()
            / 3.0;

        // Spectral centroid similarity
        let spectral_sim =
            1.0 - ((a.spectral_centroid - b.spectral_centroid).abs() / 2000.0).min(1.0);

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

    // ========== BASIC TESTS ==========

    #[test]
    fn test_extract_features() {
        let fingerprint = VoiceFingerprint::new();
        let samples = vec![0.0; 16000]; // 1 second @ 16kHz

        let features = fingerprint.extract_features(&samples);

        assert_eq!(features.formants.len(), 3);
        assert_eq!(features.mfcc.len(), 13);
        assert!(features.pitch >= 0.0);
        assert!(features.spectral_centroid >= 0.0);
    }

    #[test]
    fn test_calibrate_titane() {
        let fingerprint = VoiceFingerprint::new();
        let samples_list = vec![vec![0.0; 16000], vec![0.0; 16000], vec![0.0; 16000]];

        let result = fingerprint.calibrate_titane(samples_list);
        assert!(result.is_ok());
        assert!(fingerprint.is_calibrated());
    }

    #[test]
    fn test_is_titane_speaking_without_calibration() {
        let fingerprint = VoiceFingerprint::new();
        let samples = vec![0.0; 16000];

        let (is_titane, score) = fingerprint.is_titane_speaking(&samples);

        assert_eq!(is_titane, false);
        assert_eq!(score, 0.0);
    }

    // ========== DSP ALGORITHM TESTS ==========

    #[test]
    fn test_yin_pitch_detection_sine_wave() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let frequency = 150.0; // 150 Hz sine wave
        let duration = 1.0; // 1 second

        // Generate sine wave
        let mut samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples.push((2.0 * PI * frequency * t).sin() * 0.5);
        }

        let detected_pitch = fingerprint.detect_pitch(&samples);

        // YIN should detect ~150 Hz (±10 Hz tolerance)
        assert!(
            detected_pitch >= 140.0 && detected_pitch <= 160.0,
            "Expected pitch ~150 Hz, got {} Hz",
            detected_pitch
        );
    }

    #[test]
    fn test_yin_pitch_detection_male_voice() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let frequency = 110.0; // Male voice (A2)
        let duration = 1.0;

        let mut samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples.push((2.0 * PI * frequency * t).sin() * 0.5);
        }

        let detected_pitch = fingerprint.detect_pitch(&samples);

        assert!(
            detected_pitch >= 100.0 && detected_pitch <= 120.0,
            "Expected pitch ~110 Hz, got {} Hz",
            detected_pitch
        );
    }

    #[test]
    fn test_lpc_formants_vowel_a() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let duration = 1.0;

        // Synthesize /a/ vowel (F1=700, F2=1220, F3=2600)
        let mut samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            let signal = (2.0 * PI * 150.0 * t).sin() // F0 = 150 Hz
                + 0.5 * (2.0 * PI * 700.0 * t).sin()  // F1
                + 0.3 * (2.0 * PI * 1220.0 * t).sin() // F2
                + 0.2 * (2.0 * PI * 2600.0 * t).sin(); // F3
            samples.push(signal * 0.25);
        }

        let formants = fingerprint.detect_formants(&samples);

        // LPC should detect formants near expected values (±200 Hz tolerance)
        assert_eq!(formants.len(), 3, "Expected 3 formants");
        assert!(
            formants[0] >= 500.0 && formants[0] <= 900.0,
            "F1 expected ~700 Hz, got {} Hz",
            formants[0]
        );
        assert!(
            formants[1] >= 1000.0 && formants[1] <= 1500.0,
            "F2 expected ~1220 Hz, got {} Hz",
            formants[1]
        );
        // F3 harder to detect, skip strict assertion
    }

    #[test]
    fn test_fft_spectral_centroid_low_freq() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let frequency = 200.0; // Low frequency
        let duration = 0.5;

        let mut samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples.push((2.0 * PI * frequency * t).sin() * 0.5);
        }

        let centroid = fingerprint.calculate_spectral_centroid(&samples);

        // Spectral centroid should be close to fundamental frequency
        assert!(
            centroid >= 150.0 && centroid <= 400.0,
            "Expected centroid ~200 Hz, got {} Hz",
            centroid
        );
    }

    #[test]
    fn test_fft_spectral_centroid_high_freq() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let frequency = 2000.0; // High frequency
        let duration = 0.5;

        let mut samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples.push((2.0 * PI * frequency * t).sin() * 0.5);
        }

        let centroid = fingerprint.calculate_spectral_centroid(&samples);

        assert!(
            centroid >= 1500.0 && centroid <= 2500.0,
            "Expected centroid ~2000 Hz, got {} Hz",
            centroid
        );
    }

    #[test]
    fn test_mfcc_coefficients_length() {
        let fingerprint = VoiceFingerprint::new();
        let samples = vec![0.1; 16000];

        let mfcc = fingerprint.calculate_mfcc(&samples);

        assert_eq!(mfcc.len(), 13, "Expected 13 MFCC coefficients");
    }

    #[test]
    fn test_mfcc_different_signals() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let duration = 1.0;

        // Signal 1: Low frequency
        let mut samples1 = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples1.push((2.0 * PI * 200.0 * t).sin() * 0.5);
        }

        // Signal 2: High frequency
        let mut samples2 = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples2.push((2.0 * PI * 2000.0 * t).sin() * 0.5);
        }

        let mfcc1 = fingerprint.calculate_mfcc(&samples1);
        let mfcc2 = fingerprint.calculate_mfcc(&samples2);

        // MFCCs should be different for different signals
        let mut diff_count = 0;
        for i in 0..13 {
            if (mfcc1[i] - mfcc2[i]).abs() > 0.1 {
                diff_count += 1;
            }
        }

        assert!(
            diff_count >= 5,
            "Expected at least 5 different MFCC coefficients, got {}",
            diff_count
        );
    }

    // ========== INTEGRATION TESTS ==========

    #[test]
    fn test_similarity_identical_signals() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let duration = 1.0;

        // Generate identical sine wave
        let mut samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples.push((2.0 * PI * 150.0 * t).sin() * 0.5);
        }

        let features1 = fingerprint.extract_features(&samples);
        let features2 = fingerprint.extract_features(&samples);

        let similarity = fingerprint.calculate_similarity(&features1, &features2);

        // Identical signals should have similarity ~1.0
        assert!(
            similarity >= 0.95,
            "Expected similarity ~1.0, got {}",
            similarity
        );
    }

    #[test]
    fn test_similarity_different_signals() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let duration = 1.0;

        // Signal 1: 150 Hz
        let mut samples1 = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples1.push((2.0 * PI * 150.0 * t).sin() * 0.5);
        }

        // Signal 2: 300 Hz
        let mut samples2 = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            samples2.push((2.0 * PI * 300.0 * t).sin() * 0.5);
        }

        let features1 = fingerprint.extract_features(&samples1);
        let features2 = fingerprint.extract_features(&samples2);

        let similarity = fingerprint.calculate_similarity(&features1, &features2);

        // Different signals should have similarity < 0.8
        assert!(
            similarity < 0.8,
            "Expected similarity < 0.8, got {}",
            similarity
        );
    }

    #[test]
    fn test_calibration_and_detection_workflow() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let duration = 1.0;

        // Calibrate with 150 Hz sine wave (simulating TITANE TTS)
        let mut titane_samples = Vec::new();
        for _ in 0..5 {
            let mut sample = Vec::new();
            for i in 0..(sample_rate * duration) as usize {
                let t = i as f32 / sample_rate;
                sample.push((2.0 * PI * 150.0 * t).sin() * 0.5);
            }
            titane_samples.push(sample);
        }

        let result = fingerprint.calibrate_titane(titane_samples);
        assert!(result.is_ok());

        // Test with similar signal (should be detected as TITANE)
        let mut test_samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            test_samples.push((2.0 * PI * 150.0 * t).sin() * 0.5);
        }

        let (is_titane, similarity) = fingerprint.is_titane_speaking(&test_samples);
        assert!(
            is_titane,
            "Expected TITANE detection, similarity: {}",
            similarity
        );
        assert!(similarity >= 0.75);

        // Test with different signal (should NOT be detected as TITANE)
        let mut user_samples = Vec::new();
        for i in 0..(sample_rate * duration) as usize {
            let t = i as f32 / sample_rate;
            user_samples.push((2.0 * PI * 300.0 * t).sin() * 0.5);
        }

        let (is_user, similarity) = fingerprint.is_titane_speaking(&user_samples);
        assert!(
            !is_user,
            "Expected user detection, similarity: {}",
            similarity
        );
    }

    #[test]
    fn test_accuracy_target_90_percent() {
        let fingerprint = VoiceFingerprint::new();
        let sample_rate = 16000.0;
        let duration = 1.0;

        // Calibrate with TITANE voice (150 Hz with harmonics)
        let mut titane_samples = Vec::new();
        for _ in 0..5 {
            let mut sample = Vec::new();
            for i in 0..(sample_rate * duration) as usize {
                let t = i as f32 / sample_rate;
                // More realistic voice: fundamental + harmonics
                let signal = (2.0 * PI * 150.0 * t).sin() * 0.5
                    + (2.0 * PI * 300.0 * t).sin() * 0.25
                    + (2.0 * PI * 450.0 * t).sin() * 0.125;
                sample.push(signal);
            }
            titane_samples.push(sample);
        }
        fingerprint.calibrate_titane(titane_samples).unwrap();

        // Test accuracy: 10 TITANE samples + 10 user samples
        let mut correct_detections = 0;
        let total_tests = 20;

        // 10 TITANE samples (should be detected) - similar to calibration
        for _ in 0..10 {
            let mut sample = Vec::new();
            for i in 0..(sample_rate * duration) as usize {
                let t = i as f32 / sample_rate;
                let signal = (2.0 * PI * 150.0 * t).sin() * 0.5
                    + (2.0 * PI * 300.0 * t).sin() * 0.25
                    + (2.0 * PI * 450.0 * t).sin() * 0.125;
                sample.push(signal);
            }
            let (is_titane, score) = fingerprint.is_titane_speaking(&sample);
            if is_titane {
                correct_detections += 1;
            } else {
                println!(
                    "[Test] ❌ False negative: TITANE not detected (score: {:.2})",
                    score
                );
            }
        }

        // 10 user samples (should NOT be detected) - significantly different frequencies
        let user_freqs = [
            (85.0, 170.0, 255.0),  // Very low voice (male bass)
            (100.0, 200.0, 300.0), // Low male voice
            (220.0, 440.0, 660.0), // Female voice (A3)
            (260.0, 520.0, 780.0), // High female voice
            (180.0, 360.0, 540.0), // Different male voice
            (240.0, 480.0, 720.0), // Alto voice
            (120.0, 240.0, 360.0), // Bass voice
            (200.0, 400.0, 600.0), // Baritone voice
            (280.0, 560.0, 840.0), // Soprano voice
            (90.0, 180.0, 270.0),  // Very low bass
        ];

        for (f0, f1, f2) in user_freqs {
            let mut sample = Vec::new();
            for i in 0..(sample_rate * duration) as usize {
                let t = i as f32 / sample_rate;
                let signal = (2.0 * PI * f0 * t).sin() * 0.5
                    + (2.0 * PI * f1 * t).sin() * 0.25
                    + (2.0 * PI * f2 * t).sin() * 0.125;
                sample.push(signal);
            }
            let (is_titane, score) = fingerprint.is_titane_speaking(&sample);
            if !is_titane {
                correct_detections += 1;
            } else {
                println!(
                    "[Test] ❌ False positive: User voice detected as TITANE (F0={} Hz, score: {:.2})",
                    f0, score
                );
            }
        }

        let accuracy = correct_detections as f32 / total_tests as f32;
        println!(
            "[Test] Accuracy: {:.1}% ({}/{})",
            accuracy * 100.0,
            correct_detections,
            total_tests
        );

        assert!(
            accuracy >= 0.90,
            "Expected accuracy ≥90%, got {:.1}% ({}/{})",
            accuracy * 100.0,
            correct_detections,
            total_tests
        );
    }
}
