// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ FUSION COMMANDS — Week 3 Implementation
//   Commands: fusion_process_lipsync, fusion_animate_avatar
// ═══════════════════════════════════════════════════════════════════════════
//
// Week 3 Deliverables:
// 1. fusion_process_lipsync - Generate lip-sync data from text/audio metadata
// 2. fusion_animate_avatar - Generate avatar animation keyframes
//
// © 2026 Kevin Thibault / TITANE Team. Tous droits réservés.

use serde::{Deserialize, Serialize};
use chrono::Utc;

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

/// Transform entry for avatar animation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationTransform {
    pub bone: String,
    pub position: Option<[f32; 3]>,
    pub rotation: Option<[f32; 4]>,
    pub scale: Option<[f32; 3]>,
}

/// Keyframe in avatar animation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationKeyframe {
    pub time: u32,
    pub transforms: Vec<AnimationTransform>,
}

/// Avatar animation data payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvatarAnimationData {
    pub keyframes: Vec<AnimationKeyframe>,
    pub duration: u32,
    pub fps: u32,
}

/// Request to animate avatar from lip-sync data
#[derive(Debug, Clone, Deserialize)]
pub struct AnimateAvatarRequest {
    pub lipsync: LipSyncData,
    pub expression: Option<String>,
    pub animation_style: Option<String>,
    pub intensity: Option<f32>,
    pub fps: Option<u32>,
    pub include_head_motion: Option<bool>,
}

/// Response for avatar animation generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimateAvatarResponse {
    pub success: bool,
    pub message: String,
    pub animation: AvatarAnimationData,
    pub keyframe_count: usize,
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
    if fps < 15 || fps > 120 {
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
// COMMAND 6: fusion_animate_avatar
// ═══════════════════════════════════════════════════════════════════════════

/// Generate avatar animation keyframes from lip-sync data
#[tauri::command]
pub fn fusion_animate_avatar(
    request: AnimateAvatarRequest,
) -> Result<AnimateAvatarResponse, String> {
    fusion_animate_avatar_internal(request)
}

fn fusion_animate_avatar_internal(
    request: AnimateAvatarRequest,
) -> Result<AnimateAvatarResponse, String> {
    let intensity = request.intensity.unwrap_or(0.7);
    if !(0.0..=1.0).contains(&intensity) {
        return Err("Intensity must be 0.0-1.0".to_string());
    }

    let fps = request.fps.unwrap_or(60);
    if fps < 15 || fps > 120 {
        return Err("FPS must be 15-120".to_string());
    }

    if request.lipsync.phonemes.len() != request.lipsync.durations.len()
        || request.lipsync.phonemes.len() != request.lipsync.timestamps.len()
    {
        return Err("Lip-sync data arrays must have the same length".to_string());
    }

    let include_head_motion = request.include_head_motion.unwrap_or(true);
    let expression = request.expression.unwrap_or_else(|| "neutral".to_string());
    let animation_style = request
        .animation_style
        .unwrap_or_else(|| "fluid".to_string());

    let mut keyframes = Vec::new();

    for (index, phoneme) in request.lipsync.phonemes.iter().enumerate() {
        let timestamp = request.lipsync.timestamps.get(index).copied().unwrap_or(0);
        let jaw_open = (phoneme.intensity * intensity).clamp(0.0, 1.0);
        let jaw_rotation = 0.15 + jaw_open * 0.35;

        let mut transforms = Vec::new();
        transforms.push(AnimationTransform {
            bone: "jaw".to_string(),
            position: None,
            rotation: Some([0.0, 0.0, jaw_rotation, 1.0]),
            scale: None,
        });

        transforms.push(AnimationTransform {
            bone: "lips".to_string(),
            position: Some([0.0, 0.0, jaw_open * 0.02]),
            rotation: None,
            scale: Some([1.0 + jaw_open * 0.02, 1.0 + jaw_open * 0.02, 1.0]),
        });

        if include_head_motion && animation_style != "static" {
            let sway = ((index as f32 * 0.3).sin() * 0.05).clamp(-0.05, 0.05);
            transforms.push(AnimationTransform {
                bone: "head".to_string(),
                position: None,
                rotation: Some([sway, 0.0, 0.0, 1.0]),
                scale: None,
            });
        }

        if expression == "smile" {
            transforms.push(AnimationTransform {
                bone: "cheeks".to_string(),
                position: Some([0.0, 0.02, 0.0]),
                rotation: None,
                scale: Some([1.02, 1.02, 1.0]),
            });
        }

        keyframes.push(AnimationKeyframe {
            time: timestamp,
            transforms,
        });
    }

    let duration = compute_animation_duration(&request.lipsync.durations, &request.lipsync.timestamps);

    Ok(AnimateAvatarResponse {
        success: true,
        message: format!(
            "Avatar animation generated ({}, {} keyframes)",
            animation_style,
            keyframes.len()
        ),
        animation: AvatarAnimationData {
            keyframes,
            duration,
            fps,
        },
        keyframe_count: request.lipsync.phonemes.len(),
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
    let mut index = 0;

    for word in text.split_whitespace() {
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
        index += 1;
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

fn compute_animation_duration(durations: &[u32], timestamps: &[u32]) -> u32 {
    let mut max_duration = 0;
    for (index, timestamp) in timestamps.iter().enumerate() {
        let duration = durations.get(index).copied().unwrap_or(0);
        let end = timestamp.saturating_add(duration);
        if end > max_duration {
            max_duration = end;
        }
    }
    max_duration
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

    #[test]
    fn test_avatar_animation_basic() {
        let request = AnimateAvatarRequest {
            lipsync: LipSyncData {
                phonemes: vec![
                    LipSyncPhoneme {
                        sound: "a".to_string(),
                        viseme: "A".to_string(),
                        intensity: 0.8,
                    },
                    LipSyncPhoneme {
                        sound: "o".to_string(),
                        viseme: "O".to_string(),
                        intensity: 0.6,
                    },
                ],
                durations: vec![120, 120],
                timestamps: vec![0, 120],
            },
            expression: Some("smile".to_string()),
            animation_style: Some("fluid".to_string()),
            intensity: Some(0.7),
            fps: Some(60),
            include_head_motion: Some(true),
        };

        let response = fusion_animate_avatar_internal(request).unwrap();
        assert!(response.success);
        assert!(!response.animation.keyframes.is_empty());
        assert_eq!(response.animation.fps, 60);
    }

    #[test]
    fn test_avatar_animation_invalid_fps() {
        let request = AnimateAvatarRequest {
            lipsync: LipSyncData {
                phonemes: vec![],
                durations: vec![],
                timestamps: vec![],
            },
            expression: None,
            animation_style: None,
            intensity: Some(0.5),
            fps: Some(5),
            include_head_motion: None,
        };

        let result = fusion_animate_avatar_internal(request);
        assert!(result.is_err());
    }

    #[test]
    fn test_avatar_animation_empty() {
        let request = AnimateAvatarRequest {
            lipsync: LipSyncData {
                phonemes: vec![],
                durations: vec![],
                timestamps: vec![],
            },
            expression: None,
            animation_style: None,
            intensity: Some(0.5),
            fps: Some(60),
            include_head_motion: None,
        };

        let response = fusion_animate_avatar_internal(request).unwrap();
        assert!(response.success);
        assert!(response.animation.keyframes.is_empty());
    }

    #[test]
    fn test_avatar_animation_mismatched_arrays() {
        let request = AnimateAvatarRequest {
            lipsync: LipSyncData {
                phonemes: vec![LipSyncPhoneme {
                    sound: "a".to_string(),
                    viseme: "A".to_string(),
                    intensity: 0.5,
                }],
                durations: vec![100, 100],
                timestamps: vec![0],
            },
            expression: None,
            animation_style: None,
            intensity: Some(0.5),
            fps: Some(60),
            include_head_motion: None,
        };

        let result = fusion_animate_avatar_internal(request);
        assert!(result.is_err());
    }
}
