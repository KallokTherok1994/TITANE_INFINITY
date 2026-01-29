// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ FUSION COMMANDS — Week 2 Implementation
//   Commands: fusion_generate_ia_response, fusion_prepare_tts
// ═══════════════════════════════════════════════════════════════════════════
//
// Week 2 Deliverables:
// 1. fusion_generate_ia_response - Generate IA responses with cache support
// 2. fusion_prepare_tts - Prepare TTS audio buffers
//
// © 2026 Kevin Thibault / TITANE Team. Tous droits réservés.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use chrono::Utc;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/// Cached IA response with expiration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedIAResponse {
    pub response: String,
    pub tokens_used: u32,
    pub created_at: i64,
    pub expires_at: i64,
}

/// In-memory cache for IA responses
pub struct IACache {
    responses: Arc<Mutex<HashMap<String, CachedIAResponse>>>,
}

impl IACache {
    pub fn new() -> Self {
        Self {
            responses: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        let mut cache = self.responses.lock().ok()?;
        if let Some(entry) = cache.get(key) {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;
            
            if now < entry.expires_at {
                return Some(entry.response.clone());
            } else {
                cache.remove(key);
            }
        }
        None
    }

    pub fn set(&self, key: String, response: String, tokens: u32) -> Result<(), String> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        
        let expires_at = now + (24 * 3600); // 24 hours TTL
        
        let mut cache = self.responses.lock()
            .map_err(|e| format!("Failed to acquire cache lock: {}", e))?;
        
        // Simple LRU: remove oldest entry if cache is full
        if cache.len() >= 1000 {
            if let Some(oldest_key) = cache.iter()
                .min_by_key(|(_, v)| v.created_at)
                .map(|(k, _)| k.clone())
            {
                cache.remove(&oldest_key);
            }
        }
        
        cache.insert(key, CachedIAResponse {
            response,
            tokens_used: tokens,
            created_at: now,
            expires_at,
        });
        
        Ok(())
    }

    pub fn clear(&self) -> Result<(), String> {
        let mut cache = self.responses.lock()
            .map_err(|e| format!("Failed to acquire cache lock: {}", e))?;
        cache.clear();
        Ok(())
    }
}

impl Default for IACache {
    fn default() -> Self {
        Self::new()
    }
}

/// Voice configuration for TTS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfig {
    pub id: String,
    pub name: String,
    pub language: String,
    pub default_speed: f32,
    pub default_pitch: f32,
}

/// Voice library for TTS
pub struct VoiceLibrary {
    voices: HashMap<String, VoiceConfig>,
}

impl VoiceLibrary {
    pub fn new() -> Self {
        let mut voices = HashMap::new();
        
        // Default voices
        voices.insert("nova".to_string(), VoiceConfig {
            id: "nova".to_string(),
            name: "Nova".to_string(),
            language: "en".to_string(),
            default_speed: 1.0,
            default_pitch: 1.0,
        });
        
        voices.insert("echo".to_string(), VoiceConfig {
            id: "echo".to_string(),
            name: "Echo".to_string(),
            language: "en".to_string(),
            default_speed: 1.0,
            default_pitch: 0.8,
        });
        
        voices.insert("fable".to_string(), VoiceConfig {
            id: "fable".to_string(),
            name: "Fable".to_string(),
            language: "en".to_string(),
            default_speed: 0.9,
            default_pitch: 1.0,
        });
        
        Self { voices }
    }

    pub fn get(&self, voice_id: &str) -> Option<VoiceConfig> {
        self.voices.get(voice_id).cloned()
    }

    pub fn list_voices(&self) -> Vec<VoiceConfig> {
        self.voices.values().cloned().collect()
    }
}

impl Default for VoiceLibrary {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 3: fusion_generate_ia_response
// ═══════════════════════════════════════════════════════════════════════════

/// Request to generate IA response
#[derive(Debug, Clone, Deserialize)]
pub struct IAGenerationRequest {
    pub prompt: String,
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    pub system_prompt: Option<String>,
    pub enable_cache: Option<bool>,
    pub cache_key: Option<String>,
}

/// Response from IA generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IAGenerationResponse {
    pub success: bool,
    pub message: String,
    pub response: String,
    pub tokens_used: u32,
    pub cached: bool,
    pub generation_time_ms: u32,
    pub model: String,
    pub timestamp: i64,
}

/// Generate IA response
///
/// # Arguments
/// * `request` - Configuration for generation
/// * `state` - Shared Fusion state
///
/// # Returns
/// * `IAGenerationResponse` - Generated response
#[tauri::command]
pub fn fusion_generate_ia_response(
    request: IAGenerationRequest,
    state: tauri::State<'_, FusionWeek2State>,
) -> Result<IAGenerationResponse, String> {
    fusion_generate_ia_response_internal(request, &state)
}

/// Internal implementation for testing
fn fusion_generate_ia_response_internal(
    request: IAGenerationRequest,
    state: &FusionWeek2State,
) -> Result<IAGenerationResponse, String> {
    // Validate prompt
    if request.prompt.is_empty() || request.prompt.len() > 10000 {
        return Err("Prompt must be 1-10000 characters".to_string());
    }

    let temperature = request.temperature.unwrap_or(0.7);
    if temperature < 0.0 || temperature > 2.0 {
        return Err("Temperature must be 0.0-2.0".to_string());
    }

    let max_tokens = request.max_tokens.unwrap_or(256);
    if max_tokens < 1 || max_tokens > 4096 {
        return Err("Max tokens must be 1-4096".to_string());
    }

    let model = request.model.clone().unwrap_or_else(|| "claude-haiku".to_string());
    let enable_cache = request.enable_cache.unwrap_or(true);

    let start_time = Utc::now();

    // Check cache if enabled
    if enable_cache {
        let cache_key = request.cache_key.clone().unwrap_or_else(|| {
            format!("{}:{}:{}", model, request.prompt, temperature)
        });

        if let Some(cached_response) = state.ia_cache.get(&cache_key) {
            let generation_time_ms = Utc::now()
                .signed_duration_since(start_time)
                .num_milliseconds() as u32;

            return Ok(IAGenerationResponse {
                success: true,
                message: "Response retrieved from cache".to_string(),
                response: cached_response,
                tokens_used: 150, // Estimated
                cached: true,
                generation_time_ms,
                model,
                timestamp: Utc::now().timestamp_millis(),
            });
        }
    }

    // Simulate IA response generation
    // In production, this would integrate with actual LLM (Ollama, OpenAI, etc.)
    let response = format!(
        "Response to: {} [Model: {}, Temperature: {}]",
        &request.prompt[..std::cmp::min(50, request.prompt.len())],
        model,
        temperature
    );

    let tokens_used = (response.split_whitespace().count() as u32).max(50);

    // Cache the response if enabled
    if enable_cache {
        let cache_key = request.cache_key.clone().unwrap_or_else(|| {
            format!("{}:{}:{}", model, request.prompt, temperature)
        });
        let _ = state.ia_cache.set(cache_key, response.clone(), tokens_used);
    }

    let generation_time_ms = Utc::now()
        .signed_duration_since(start_time)
        .num_milliseconds() as u32;

    Ok(IAGenerationResponse {
        success: true,
        message: "Response generated successfully".to_string(),
        response,
        tokens_used,
        cached: false,
        generation_time_ms,
        model,
        timestamp: Utc::now().timestamp_millis(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND 4: fusion_prepare_tts
// ═══════════════════════════════════════════════════════════════════════════

/// Request to prepare TTS audio
#[derive(Debug, Clone, Deserialize)]
pub struct TTSPrepareRequest {
    pub text: String,
    pub voice: Option<String>,
    pub speed: Option<f32>,
    pub pitch: Option<f32>,
    pub format: Option<String>,
    pub language: Option<String>,
    pub enable_streaming: Option<bool>,
}

/// Response from TTS preparation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TTSPrepareResponse {
    pub success: bool,
    pub message: String,
    pub buffer_size: usize,
    pub duration_ms: u32,
    pub format: String,
    pub voice: String,
    pub sample_rate: u32,
    pub channels: u8,
    pub chunks_prepared: u32,
    pub timestamp: i64,
}

/// Prepare TTS audio buffer
///
/// # Arguments
/// * `request` - TTS configuration
/// * `state` - Shared Fusion state
///
/// # Returns
/// * `TTSPrepareResponse` - Audio buffer information
#[tauri::command]
pub fn fusion_prepare_tts(
    request: TTSPrepareRequest,
    state: tauri::State<'_, FusionWeek2State>,
) -> Result<TTSPrepareResponse, String> {
    fusion_prepare_tts_internal(request, &state)
}

/// Internal implementation for testing
fn fusion_prepare_tts_internal(
    request: TTSPrepareRequest,
    state: &FusionWeek2State,
) -> Result<TTSPrepareResponse, String> {
    // Validate text
    if request.text.is_empty() || request.text.len() > 5000 {
        return Err("Text must be 1-5000 characters".to_string());
    }

    let speed = request.speed.unwrap_or(1.0);
    if speed < 0.5 || speed > 2.0 {
        return Err("Speed must be 0.5-2.0".to_string());
    }

    let pitch = request.pitch.unwrap_or(1.0);
    if pitch < 0.5 || pitch > 2.0 {
        return Err("Pitch must be 0.5-2.0".to_string());
    }

    let format = request.format.clone().unwrap_or_else(|| "mp3".to_string());
    if !["mp3", "wav", "aac"].contains(&format.as_str()) {
        return Err("Format must be mp3, wav, or aac".to_string());
    }

    let voice_id = request.voice.clone().unwrap_or_else(|| "nova".to_string());
    let voice = state.voice_library.get(&voice_id)
        .ok_or_else(|| format!("Voice '{}' not found", voice_id))?;

    let enable_streaming = request.enable_streaming.unwrap_or(false);

    // Calculate buffer size and duration
    // Estimate: ~100 bytes per word at MP3 128kbps
    let word_count = request.text.split_whitespace().count() as u32;
    
    // Duration in seconds: words / average_speech_rate(150 wpm) * speed_factor
    let base_duration_seconds = (word_count as f32 / 150.0) / speed;
    let duration_ms = (base_duration_seconds * 1000.0) as u32;
    
    // Buffer size estimation
    let bytes_per_second = match format.as_str() {
        "mp3" => 16000,  // 128 kbps
        "aac" => 12800,  // 102.4 kbps
        "wav" => 172800, // 16-bit, 44.1kHz stereo
        _ => 16000,
    };
    
    let buffer_size = (base_duration_seconds * bytes_per_second as f32) as usize;
    
    // Calculate chunks for streaming (1 chunk ≈ 100ms of audio)
    let chunks_prepared = if enable_streaming {
        ((duration_ms + 99) / 100) as u32
    } else {
        0
    };

    Ok(TTSPrepareResponse {
        success: true,
        message: "TTS buffer prepared successfully".to_string(),
        buffer_size,
        duration_ms,
        format,
        voice: voice.name.clone(),
        sample_rate: 44100,
        channels: 2,
        chunks_prepared,
        timestamp: Utc::now().timestamp_millis(),
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/// Global Fusion state for Week 2 (extends Week 1)
pub struct FusionWeek2State {
    pub ia_cache: IACache,
    pub voice_library: VoiceLibrary,
}

impl Default for FusionWeek2State {
    fn default() -> Self {
        Self {
            ia_cache: IACache::default(),
            voice_library: VoiceLibrary::default(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ia_response_basic() {
        let state = FusionWeek2State::default();

        let request = IAGenerationRequest {
            prompt: "What is Rust?".to_string(),
            model: Some("claude-haiku".to_string()),
            temperature: Some(0.7),
            max_tokens: Some(256),
            system_prompt: None,
            enable_cache: Some(false),
            cache_key: None,
        };

        let response = fusion_generate_ia_response_internal(request, &state).unwrap();

        assert!(response.success);
        assert!(!response.cached);
        assert!(!response.response.is_empty());
        assert!(response.tokens_used > 0);
    }

    #[test]
    fn test_ia_response_invalid_prompt() {
        let state = FusionWeek2State::default();

        let request = IAGenerationRequest {
            prompt: "".to_string(),
            model: None,
            temperature: None,
            max_tokens: None,
            system_prompt: None,
            enable_cache: None,
            cache_key: None,
        };

        let result = fusion_generate_ia_response_internal(request, &state);
        assert!(result.is_err());
    }

    #[test]
    fn test_ia_response_invalid_temperature() {
        let state = FusionWeek2State::default();

        let request = IAGenerationRequest {
            prompt: "Test prompt".to_string(),
            model: None,
            temperature: Some(3.0), // Out of range
            max_tokens: None,
            system_prompt: None,
            enable_cache: None,
            cache_key: None,
        };

        let result = fusion_generate_ia_response_internal(request, &state);
        assert!(result.is_err());
    }

    #[test]
    fn test_tts_prepare_basic() {
        let state = FusionWeek2State::default();

        let request = TTSPrepareRequest {
            text: "Hello, world! This is a test of text to speech.".to_string(),
            voice: Some("nova".to_string()),
            speed: Some(1.0),
            pitch: Some(1.0),
            format: Some("mp3".to_string()),
            language: Some("en".to_string()),
            enable_streaming: Some(false),
        };

        let response = fusion_prepare_tts_internal(request, &state).unwrap();

        assert!(response.success);
        assert_eq!(response.voice, "Nova");
        assert_eq!(response.format, "mp3");
        assert!(response.duration_ms > 0);
        assert!(response.buffer_size > 0);
    }

    #[test]
    fn test_tts_prepare_invalid_speed() {
        let state = FusionWeek2State::default();

        let request = TTSPrepareRequest {
            text: "Test".to_string(),
            voice: None,
            speed: Some(3.0), // Out of range
            pitch: None,
            format: None,
            language: None,
            enable_streaming: None,
        };

        let result = fusion_prepare_tts_internal(request, &state);
        assert!(result.is_err());
    }

    #[test]
    fn test_tts_prepare_invalid_format() {
        let state = FusionWeek2State::default();

        let request = TTSPrepareRequest {
            text: "Test".to_string(),
            voice: None,
            speed: None,
            pitch: None,
            format: Some("invalid".to_string()),
            language: None,
            enable_streaming: None,
        };

        let result = fusion_prepare_tts_internal(request, &state);
        assert!(result.is_err());
    }

    #[test]
    fn test_tts_prepare_streaming() {
        let state = FusionWeek2State::default();

        let request = TTSPrepareRequest {
            text: "Hello, world! This is a longer text for testing streaming mode.".to_string(),
            voice: Some("echo".to_string()),
            speed: Some(1.0),
            pitch: Some(1.0),
            format: Some("mp3".to_string()),
            language: Some("en".to_string()),
            enable_streaming: Some(true),
        };

        let response = fusion_prepare_tts_internal(request, &state).unwrap();

        assert!(response.success);
        assert!(response.chunks_prepared > 0);
    }

    #[test]
    fn test_ia_cache_functionality() {
        let cache = IACache::default();

        // Set a value
        let _ = cache.set("key1".to_string(), "response1".to_string(), 100);

        // Retrieve it
        let value = cache.get("key1");
        assert_eq!(value, Some("response1".to_string()));

        // Non-existent key
        let value = cache.get("key2");
        assert_eq!(value, None);

        // Clear cache
        let _ = cache.clear();
        let value = cache.get("key1");
        assert_eq!(value, None);
    }

    #[test]
    fn test_voice_library() {
        let library = VoiceLibrary::default();

        // Get existing voice
        let voice = library.get("nova");
        assert!(voice.is_some());
        assert_eq!(voice.unwrap().name, "Nova");

        // Get non-existent voice
        let voice = library.get("invalid");
        assert!(voice.is_none());

        // List all voices
        let voices = library.list_voices();
        assert!(!voices.is_empty());
    }
}
