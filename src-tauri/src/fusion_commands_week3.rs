// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ FUSION COMMANDS — Week 3 Implementation
//   Commands: fusion_process_lipsync
// ═══════════════════════════════════════════════════════════════════════════
//
// Week 3 Deliverables:
// 1. fusion_process_lipsync - Generate lip-sync data from text/audio metadata
//
// © 2026 Kevin Thibault / TITANE Team. Tous droits réservés.

use chrono::Utc;
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/// Single phoneme with viseme and intensity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LipSyncPhoneme {
    pub sound: String,
    pub viseme: String,
    pub intensity: f32,
}

/// Lip-sync data payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LipSyncData {
    pub phonemes: Vec<LipSyncPhoneme>,
    pub durations: Vec<u32>,
    pub timestamps: Vec<u32>,
}

/// Request to process lip-sync data
#[derive(Debug, Clone, Deserialize)]
pub struct LipSyncProcessRequest {
    pub text: String,
    pub audio_duration_ms: Option<u32>,
    pub language: Option<String>,
    pub intensity: Option<f32>,
    pub fps: Option<u32>,
    pub enable_smoothing: Option<bool>,
}

/// Response for lip-sync processing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LipSyncProcessResponse {
    pub success: bool,
    pub message: String,
    pub data: LipSyncData,
    pub duration_ms: u32,
    pub phoneme_count: usize,
    pub fps: u32,
    pub timestamp: i64,
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 5: fusion_process_lipsync
// ═══════════════════════════════════════════════════════════════════════════

/// Process lip-sync data from text and audio metadata
#[tauri::command]
pub fn fusion_process_lipsync(
    request: LipSyncProcessRequest,
) -> Result<LipSyncProcessResponse, String> {
    fusion_process_lipsync_internal(request)
}

fn fusion_process_lipsync_internal(
    request: LipSyncProcessRequest,
) -> Result<LipSyncProcessResponse, String> {
    if request.text.is_empty() || request.text.len() > 5000 {
        return Err("Text must be 1-5000 characters".to_string());
    }

    let intensity = request.intensity.unwrap_or(0.8);
    if !(0.0..=1.0).contains(&intensity) {
        return Err("Intensity must be 0.0-1.0".to_string());
    }

    let fps = request.fps.unwrap_or(60);
    if !(15..=120).contains(&fps) {
        return Err("FPS must be 15-120".to_string());
    }

    let enable_smoothing = request.enable_smoothing.unwrap_or(true);

    let word_count = request.text.split_whitespace().count() as u32;
    let estimated_duration_ms = estimate_duration_ms(word_count);

    let duration_ms = request.audio_duration_ms.unwrap_or(estimated_duration_ms);
    if duration_ms == 0 {
        return Err("Audio duration must be greater than 0".to_string());
    }

    let phonemes = build_phonemes(&request.text, intensity, enable_smoothing);
    let phoneme_count = phonemes.len();

    let (durations, timestamps) = distribute_timings(duration_ms, phoneme_count);

    Ok(LipSyncProcessResponse {
        success: true,
        message: format!(
            "Lip-sync processed for {} phonemes (lang: {})",
            phoneme_count,
            request.language.unwrap_or_else(|| "auto".to_string())
        ),
        data: LipSyncData {
            phonemes,
            durations,
            timestamps,
        },
        duration_ms,
        phoneme_count,
        fps,
        timestamp: Utc::now().timestamp_millis(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

fn estimate_duration_ms(word_count: u32) -> u32 {
    if word_count == 0 {
        return 200;
    }

    let base_seconds = word_count as f32 / 150.0;
    let duration_ms = (base_seconds * 1000.0) as u32;
    duration_ms.max(200)
}

fn build_phonemes(text: &str, intensity: f32, enable_smoothing: bool) -> Vec<LipSyncPhoneme> {
    let mut phonemes = Vec::new();

    for (index, word) in text.split_whitespace().enumerate() {
        let ch = word.chars().next().unwrap_or('m').to_ascii_lowercase();
        let (sound, viseme) = map_char_to_phoneme(ch);
        let base_intensity = if enable_smoothing {
            0.6 + (index as f32 * 0.05).sin().abs() * 0.2
        } else {
            0.75
        };

        let final_intensity = (base_intensity * intensity).clamp(0.0, 1.0);

        phonemes.push(LipSyncPhoneme {
            sound,
            viseme,
            intensity: final_intensity,
        });
    }

    if phonemes.is_empty() {
        phonemes.push(LipSyncPhoneme {
            sound: "m".to_string(),
            viseme: "M".to_string(),
            intensity: intensity.clamp(0.0, 1.0),
        });
    }

    phonemes
}

fn map_char_to_phoneme(ch: char) -> (String, String) {
    match ch {
        'a' | 'à' | 'â' | 'ä' => ("a".to_string(), "A".to_string()),
        'e' | 'é' | 'è' | 'ê' | 'ë' => ("e".to_string(), "E".to_string()),
        'i' | 'î' | 'ï' => ("i".to_string(), "I".to_string()),
        'o' | 'ô' | 'ö' => ("o".to_string(), "O".to_string()),
        'u' | 'ù' | 'û' | 'ü' => ("u".to_string(), "U".to_string()),
        'y' => ("y".to_string(), "Y".to_string()),
        'f' | 'v' => (ch.to_string(), "F".to_string()),
        'm' | 'b' | 'p' => (ch.to_string(), "M".to_string()),
        _ => (ch.to_string(), "C".to_string()),
    }
}

fn distribute_timings(duration_ms: u32, count: usize) -> (Vec<u32>, Vec<u32>) {
    if count == 0 {
        return (Vec::new(), Vec::new());
    }

    let per = duration_ms / count as u32;
    let mut durations = Vec::with_capacity(count);
    let mut timestamps = Vec::with_capacity(count);
    let mut current: u32 = 0;

    for _ in 0..count {
        durations.push(per.max(40));
        timestamps.push(current);
        current = current.saturating_add(per.max(40));
    }

    (durations, timestamps)
}


// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lipsync_basic() {
        let request = LipSyncProcessRequest {
            text: "Bonjour le monde".to_string(),
            audio_duration_ms: Some(1200),
            language: Some("fr".to_string()),
            intensity: Some(0.8),
            fps: Some(60),
            enable_smoothing: Some(true),
        };

        let response = fusion_process_lipsync_internal(request).unwrap();
        assert!(response.success);
        assert!(!response.data.phonemes.is_empty());
        assert_eq!(response.data.phonemes.len(), response.data.durations.len());
        assert_eq!(response.data.phonemes.len(), response.data.timestamps.len());
    }

    #[test]
    fn test_lipsync_invalid_text() {
        let request = LipSyncProcessRequest {
            text: "".to_string(),
            audio_duration_ms: Some(1000),
            language: None,
            intensity: None,
            fps: None,
            enable_smoothing: None,
        };

        let result = fusion_process_lipsync_internal(request);
        assert!(result.is_err());
    }

    #[test]
    fn test_lipsync_invalid_intensity() {
        let request = LipSyncProcessRequest {
            text: "Test".to_string(),
            audio_duration_ms: Some(1000),
            language: None,
            intensity: Some(1.5),
            fps: None,
            enable_smoothing: None,
        };

        let result = fusion_process_lipsync_internal(request);
        assert!(result.is_err());
    }
}
