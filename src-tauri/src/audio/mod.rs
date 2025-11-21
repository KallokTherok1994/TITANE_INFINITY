// TITANE∞ v12 - Audio Module
// Voice Activity Detection, Recording, and Speech Recognition

pub mod asr;
pub mod recorder;
pub mod vad;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub sample_rate: u32,
    pub channels: u16,
    pub bit_depth: u16,
}

impl Default for AudioConfig {
    fn default() -> Self {
        Self {
            sample_rate: 16000, // 16kHz optimal for speech
            channels: 1,        // Mono
            bit_depth: 16,      // 16-bit PCM
        }
    }
}

#[derive(Debug)]
pub enum AudioError {
    DeviceError(String),
    RecordingError(String),
    ProcessingError(String),
    NotAvailable,
}

impl std::fmt::Display for AudioError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AudioError::DeviceError(e) => write!(f, "Device error: {}", e),
            AudioError::RecordingError(e) => write!(f, "Recording error: {}", e),
            AudioError::ProcessingError(e) => write!(f, "Processing error: {}", e),
            AudioError::NotAvailable => write!(f, "Audio system not available"),
        }
    }
}

impl std::error::Error for AudioError {}

pub type AudioResult<T> = Result<T, AudioError>;
