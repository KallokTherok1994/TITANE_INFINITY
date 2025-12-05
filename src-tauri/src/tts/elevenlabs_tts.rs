// TITANE∞ vΩΩΩ - ElevenLabs TTS Engine
// © 2025 TITANE Team. All rights reserved.
//
// Premium cloud TTS with emotional voice adaptation
// Voice ID: FvmvwvObRqIHojkEGh5N (female, realistic, fluid)

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::time::Duration;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

use super::TTSError;

// =============================================================================
// CONSTANTS
// =============================================================================

/// Official TITANE Voice ID (ElevenLabs)
pub const TITANE_VOICE_ID: &str = "FvmvwvObRqIHojkEGh5N";

/// ElevenLabs API base URL
const ELEVENLABS_API_BASE: &str = "https://api.elevenlabs.io/v1";

/// Default request timeout (seconds)
const REQUEST_TIMEOUT_SECS: u64 = 30;

/// TTS cache directory
const TTS_CACHE_DIR: &str = "data/tts";

// =============================================================================
// TYPES
// =============================================================================

/// Emotion enum for voice adaptation
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum TTSEmotion {
    #[default]
    Neutral,
    Calm,
    Focusing,
    Excited,
    Soft,
    Grounded,
    Uplifting,
    Empathetic,
    Disciplined,
    Inspired,
}

/// Voice settings for synthesis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceSettings {
    /// Stability (0.0 - 1.0)
    pub stability: f32,
    /// Similarity boost (0.0 - 1.0)
    pub similarity_boost: f32,
    /// Style exaggeration (0.0 - 1.0)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub style: Option<f32>,
    /// Use speaker boost
    #[serde(skip_serializing_if = "Option::is_none")]
    pub use_speaker_boost: Option<bool>,
}

/// TTS synthesis request
#[derive(Debug, Clone, Serialize)]
pub struct ElevenLabsRequest {
    /// Text to synthesize
    pub text: String,
    /// Model ID (default: eleven_multilingual_v2)
    pub model_id: String,
    /// Voice settings
    pub voice_settings: VoiceSettings,
}

/// Emotion profile with voice parameters
#[derive(Debug, Clone)]
pub struct EmotionProfile {
    pub stability: f32,
    pub similarity_boost: f32,
    pub style: f32,
}

/// TTS response with audio data
#[derive(Debug)]
pub struct TTSAudioResponse {
    /// Audio data (MP3)
    pub audio_data: Vec<u8>,
    /// Content type
    pub content_type: String,
    /// Duration estimate (ms)
    pub duration_estimate_ms: u64,
}

/// ElevenLabs voice info
#[derive(Debug, Clone, Deserialize)]
pub struct VoiceInfo {
    pub voice_id: String,
    pub name: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub labels: std::collections::HashMap<String, String>,
}

/// Subscription info
#[derive(Debug, Clone, Deserialize)]
pub struct SubscriptionInfo {
    pub character_count: u64,
    pub character_limit: u64,
    pub tier: String,
}

// =============================================================================
// EMOTION PROFILES
// =============================================================================

impl EmotionProfile {
    /// Get emotion profile for given emotion
    pub fn for_emotion(emotion: &TTSEmotion) -> Self {
        match emotion {
            TTSEmotion::Neutral => Self {
                stability: 0.75,
                similarity_boost: 0.85,
                style: 0.0,
            },
            TTSEmotion::Calm => Self {
                stability: 0.85,
                similarity_boost: 0.80,
                style: 0.1,
            },
            TTSEmotion::Focusing => Self {
                stability: 0.90,
                similarity_boost: 0.85,
                style: 0.05,
            },
            TTSEmotion::Excited => Self {
                stability: 0.60,
                similarity_boost: 0.75,
                style: 0.4,
            },
            TTSEmotion::Soft => Self {
                stability: 0.90,
                similarity_boost: 0.90,
                style: 0.15,
            },
            TTSEmotion::Grounded => Self {
                stability: 0.95,
                similarity_boost: 0.85,
                style: 0.0,
            },
            TTSEmotion::Uplifting => Self {
                stability: 0.70,
                similarity_boost: 0.80,
                style: 0.3,
            },
            TTSEmotion::Empathetic => Self {
                stability: 0.85,
                similarity_boost: 0.88,
                style: 0.2,
            },
            TTSEmotion::Disciplined => Self {
                stability: 0.92,
                similarity_boost: 0.82,
                style: 0.0,
            },
            TTSEmotion::Inspired => Self {
                stability: 0.75,
                similarity_boost: 0.78,
                style: 0.25,
            },
        }
    }
}

// =============================================================================
// ELEVENLABS TTS ENGINE
// =============================================================================

/// ElevenLabs TTS Engine
pub struct ElevenLabsTTS {
    client: Client,
    api_key: Option<String>,
    voice_id: String,
    model_id: String,
}

impl ElevenLabsTTS {
    /// Create new ElevenLabs TTS engine
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(REQUEST_TIMEOUT_SECS))
            .build()
            .unwrap_or_default();

        Self {
            client,
            api_key: None,
            voice_id: TITANE_VOICE_ID.to_string(),
            model_id: "eleven_multilingual_v2".to_string(),
        }
    }

    /// Set API key from environment or config
    pub fn with_api_key(mut self, api_key: impl Into<String>) -> Self {
        self.api_key = Some(api_key.into());
        self
    }

    /// Set voice ID
    pub fn with_voice_id(mut self, voice_id: impl Into<String>) -> Self {
        self.voice_id = voice_id.into();
        self
    }

    /// Set model ID
    pub fn with_model_id(mut self, model_id: impl Into<String>) -> Self {
        self.model_id = model_id.into();
        self
    }

    /// Initialize from environment variables
    pub fn from_env() -> Self {
        let mut engine = Self::new();
        if let Ok(key) = std::env::var("ELEVENLABS_API_KEY") {
            engine.api_key = Some(key);
        }
        if let Ok(voice) = std::env::var("ELEVENLABS_VOICE_ID") {
            engine.voice_id = voice;
        }
        engine
    }

    /// Check if engine is configured with API key
    pub fn is_configured(&self) -> bool {
        self.api_key.is_some()
    }

    /// Synthesize text to speech
    pub async fn synthesize(
        &self,
        text: &str,
        emotion: &TTSEmotion,
    ) -> Result<TTSAudioResponse, TTSError> {
        let api_key = self.api_key.as_ref().ok_or_else(|| {
            TTSError::NetworkError("ElevenLabs API key not configured".to_string())
        })?;

        let profile = EmotionProfile::for_emotion(emotion);

        let request = ElevenLabsRequest {
            text: text.to_string(),
            model_id: self.model_id.clone(),
            voice_settings: VoiceSettings {
                stability: profile.stability,
                similarity_boost: profile.similarity_boost,
                style: Some(profile.style),
                use_speaker_boost: Some(true),
            },
        };

        let url = format!(
            "{}/text-to-speech/{}",
            ELEVENLABS_API_BASE, self.voice_id
        );

        let response = self
            .client
            .post(&url)
            .header("xi-api-key", api_key)
            .header("Content-Type", "application/json")
            .header("Accept", "audio/mpeg")
            .json(&request)
            .send()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Request failed: {}", e)))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(TTSError::NetworkError(format!(
                "ElevenLabs API error {}: {}",
                status, error_text
            )));
        }

        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("audio/mpeg")
            .to_string();

        let audio_data = response
            .bytes()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Failed to read audio: {}", e)))?
            .to_vec();

        // Estimate duration: ~130 chars/sec at normal speed
        let duration_estimate_ms = (text.len() as f64 / 13.0 * 100.0) as u64;

        Ok(TTSAudioResponse {
            audio_data,
            content_type,
            duration_estimate_ms,
        })
    }

    /// Synthesize and save to file
    pub async fn synthesize_to_file(
        &self,
        text: &str,
        emotion: &TTSEmotion,
        output_path: &str,
    ) -> Result<String, TTSError> {
        let response = self.synthesize(text, emotion).await?;

        // Ensure directory exists
        if let Some(parent) = Path::new(output_path).parent() {
            fs::create_dir_all(parent)
                .map_err(|e| TTSError::AudioError(format!("Failed to create dir: {}", e)))?;
        }

        // Write audio file
        let mut file = File::create(output_path)
            .await
            .map_err(|e| TTSError::AudioError(format!("Failed to create file: {}", e)))?;

        file.write_all(&response.audio_data)
            .await
            .map_err(|e| TTSError::AudioError(format!("Failed to write audio: {}", e)))?;

        Ok(output_path.to_string())
    }

    /// Get cache file path for message
    pub fn get_cache_path(message_id: &str) -> String {
        format!("{}/msg_{}.mp3", TTS_CACHE_DIR, message_id)
    }

    /// Check if cache exists for message
    pub fn cache_exists(message_id: &str) -> bool {
        Path::new(&Self::get_cache_path(message_id)).exists()
    }

    /// Synthesize with cache
    pub async fn synthesize_cached(
        &self,
        text: &str,
        emotion: &TTSEmotion,
        message_id: &str,
        force_regenerate: bool,
    ) -> Result<String, TTSError> {
        let cache_path = Self::get_cache_path(message_id);

        // Return cached if exists and not forcing regeneration
        if !force_regenerate && Path::new(&cache_path).exists() {
            return Ok(cache_path);
        }

        // Generate and cache
        self.synthesize_to_file(text, emotion, &cache_path).await
    }

    /// Get voice info from API
    pub async fn get_voice_info(&self) -> Result<VoiceInfo, TTSError> {
        let api_key = self.api_key.as_ref().ok_or_else(|| {
            TTSError::NetworkError("API key not configured".to_string())
        })?;

        let url = format!("{}/voices/{}", ELEVENLABS_API_BASE, self.voice_id);

        let response = self
            .client
            .get(&url)
            .header("xi-api-key", api_key)
            .send()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(TTSError::NetworkError("Failed to get voice info".to_string()));
        }

        response
            .json::<VoiceInfo>()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Failed to parse response: {}", e)))
    }

    /// Get subscription info (character usage)
    pub async fn get_subscription(&self) -> Result<SubscriptionInfo, TTSError> {
        let api_key = self.api_key.as_ref().ok_or_else(|| {
            TTSError::NetworkError("API key not configured".to_string())
        })?;

        let url = format!("{}/user/subscription", ELEVENLABS_API_BASE);

        let response = self
            .client
            .get(&url)
            .header("xi-api-key", api_key)
            .send()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(TTSError::NetworkError("Failed to get subscription".to_string()));
        }

        response
            .json::<SubscriptionInfo>()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Failed to parse response: {}", e)))
    }

    /// Test connectivity with API
    pub async fn test_connection(&self) -> Result<bool, TTSError> {
        let api_key = self.api_key.as_ref().ok_or_else(|| {
            TTSError::NetworkError("API key not configured".to_string())
        })?;

        let url = format!("{}/user", ELEVENLABS_API_BASE);

        let response = self
            .client
            .get(&url)
            .header("xi-api-key", api_key)
            .send()
            .await
            .map_err(|e| TTSError::NetworkError(format!("Request failed: {}", e)))?;

        Ok(response.status().is_success())
    }
}

impl Default for ElevenLabsTTS {
    fn default() -> Self {
        Self::from_env()
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/// Convert emotion string to enum
pub fn parse_emotion(emotion_str: &str) -> TTSEmotion {
    match emotion_str.to_lowercase().as_str() {
        "calm" => TTSEmotion::Calm,
        "focusing" => TTSEmotion::Focusing,
        "excited" => TTSEmotion::Excited,
        "soft" => TTSEmotion::Soft,
        "grounded" => TTSEmotion::Grounded,
        "uplifting" => TTSEmotion::Uplifting,
        "empathetic" => TTSEmotion::Empathetic,
        "disciplined" => TTSEmotion::Disciplined,
        "inspired" => TTSEmotion::Inspired,
        _ => TTSEmotion::Neutral,
    }
}

/// Ensure TTS cache directory exists
pub fn ensure_cache_dir() -> std::io::Result<()> {
    fs::create_dir_all(TTS_CACHE_DIR)
}

/// Clean old cache files (older than days)
pub fn clean_cache(max_age_days: u64) -> std::io::Result<u64> {
    let mut removed_count = 0;
    let max_age = std::time::Duration::from_secs(max_age_days * 24 * 60 * 60);
    let now = std::time::SystemTime::now();

    if let Ok(entries) = fs::read_dir(TTS_CACHE_DIR) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if let Ok(modified) = metadata.modified() {
                    if let Ok(age) = now.duration_since(modified) {
                        if age > max_age {
                            if fs::remove_file(entry.path()).is_ok() {
                                removed_count += 1;
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(removed_count)
}

// =============================================================================
// TESTS
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emotion_profile() {
        let profile = EmotionProfile::for_emotion(&TTSEmotion::Excited);
        assert!(profile.stability < 0.7);
        assert!(profile.style > 0.3);

        let calm = EmotionProfile::for_emotion(&TTSEmotion::Calm);
        assert!(calm.stability > 0.8);
    }

    #[test]
    fn test_parse_emotion() {
        assert!(matches!(parse_emotion("excited"), TTSEmotion::Excited));
        assert!(matches!(parse_emotion("CALM"), TTSEmotion::Calm));
        assert!(matches!(parse_emotion("unknown"), TTSEmotion::Neutral));
    }

    #[test]
    fn test_cache_path() {
        let path = ElevenLabsTTS::get_cache_path("msg_12345");
        assert!(path.contains("msg_msg_12345.mp3"));
    }

    #[test]
    fn test_engine_creation() {
        let engine = ElevenLabsTTS::new();
        assert!(!engine.is_configured());

        let configured = engine.with_api_key("test_key");
        assert!(configured.is_configured());
    }
}
