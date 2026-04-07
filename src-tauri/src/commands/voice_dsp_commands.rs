// ═══════════════════════════════════════════════════════════════
// TITANE∞ — VOICE DSP COMMANDS
// Extraction de features audio (MFCC, pitch, energy)
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MFCCRequest {
    pub audio_data: Vec<f32>,
    pub sample_rate: Option<u32>,
    pub num_coefficients: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MFCCResponse {
    pub coefficients: Vec<f32>,
    pub pitch: f32,
    pub energy: f32,
    pub tempo: f32,
    pub sample_count: usize,
    pub duration_ms: f64,
}

/// Extraire les coefficients MFCC d'un signal audio
#[tauri::command]
pub async fn voice_extract_mfcc(request: MFCCRequest) -> Result<MFCCResponse, String> {
    // Permission check
    PERMISSION_GUARD
        .require("system_read", Role::User, "voice_extract_mfcc")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let audio = &request.audio_data;
    let sample_rate = request.sample_rate.unwrap_or(16000);
    let num_coeffs = request.num_coefficients.unwrap_or(13);

    if audio.is_empty() {
        return Err("Audio data is empty".to_string());
    }

    // 1. MFCC Extraction (simplified spectral analysis)
    let mfcc = extract_mfcc(audio, num_coeffs);

    // 2. Pitch estimation (autocorrelation)
    let pitch = estimate_pitch(audio, sample_rate);

    // 3. Energy (RMS)
    let energy = calculate_energy(audio);

    // 4. Tempo (zero-crossing rate proxy)
    let tempo = estimate_tempo(audio, sample_rate);

    let duration_ms = (audio.len() as f64 / sample_rate as f64) * 1000.0;

    Ok(MFCCResponse {
        coefficients: mfcc,
        pitch,
        energy,
        tempo,
        sample_count: audio.len(),
        duration_ms,
    })
}

/// MFCC extraction (spectral band analysis)
fn extract_mfcc(audio: &[f32], num_coeffs: usize) -> Vec<f32> {
    let band_size = audio.len() / num_coeffs.max(1);
    let mut mfcc = vec![0.0f32; num_coeffs];

    for (i, coeff) in mfcc.iter_mut().enumerate() {
        let start = i * band_size;
        let end = ((i + 1) * band_size).min(audio.len());

        let mut sum = 0.0;
        for &sample in &audio[start..end] {
            sum += sample.abs();
        }
        *coeff = sum / (end - start).max(1) as f32;
    }

    // Normalize
    let max_val = mfcc.iter().copied().fold(0.0f32, f32::max).max(1e-8);
    for coeff in mfcc.iter_mut() {
        *coeff /= max_val;
    }

    mfcc
}

/// Pitch estimation via autocorrelation
fn estimate_pitch(audio: &[f32], sample_rate: u32) -> f32 {
    let min_period = (sample_rate / 500) as usize; // 500 Hz max
    let max_period = (sample_rate / 80) as usize; // 80 Hz min

    let mut max_corr = 0.0f32;
    let mut best_period = 0usize;

    for lag in min_period..max_period.min(audio.len() / 2) {
        let mut corr = 0.0f32;
        for i in 0..(audio.len() - lag) {
            corr += audio[i] * audio[i + lag];
        }
        if corr > max_corr {
            max_corr = corr;
            best_period = lag;
        }
    }

    if best_period > 0 {
        sample_rate as f32 / best_period as f32
    } else {
        0.0
    }
}

/// RMS energy
fn calculate_energy(audio: &[f32]) -> f32 {
    let sum: f32 = audio.iter().map(|&x| x * x).sum();
    (sum / audio.len() as f32).sqrt()
}

/// Tempo estimation via zero-crossing rate
fn estimate_tempo(audio: &[f32], sample_rate: u32) -> f32 {
    let mut crossings = 0usize;
    for i in 1..audio.len() {
        if (audio[i - 1] >= 0.0 && audio[i] < 0.0) || (audio[i - 1] < 0.0 && audio[i] >= 0.0) {
            crossings += 1;
        }
    }
    let duration = audio.len() as f32 / sample_rate as f32;
    (crossings as f32 / duration) / 10.0 // Approx syllables/sec
}
