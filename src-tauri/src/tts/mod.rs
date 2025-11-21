// TITANE∞ v12 - TTS (Text-to-Speech) Module
// Hybrid online/offline speech synthesis

pub mod local_tts;
pub mod online_tts;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TTSRequest {
    pub text: String,
    pub voice: Option<String>,
    pub speed: f32,
    pub pitch: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TTSProvider {
    GoogleTTS,
    LocalTTS,
}

#[derive(Debug)]
pub enum TTSError {
    NetworkError(String),
    AudioError(String),
    UnsupportedFormat(String),
    NoProviderAvailable,
}

impl std::fmt::Display for TTSError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TTSError::NetworkError(e) => write!(f, "Network error: {}", e),
            TTSError::AudioError(e) => write!(f, "Audio error: {}", e),
            TTSError::UnsupportedFormat(e) => write!(f, "Unsupported format: {}", e),
            TTSError::NoProviderAvailable => write!(f, "No TTS provider available"),
        }
    }
}

impl std::error::Error for TTSError {}

pub type TTSResult<T> = Result<T, TTSError>;
