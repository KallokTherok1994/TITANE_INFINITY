// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — AUDIO MODULE
//   Voice Activity Detection, Recording, Speech Recognition, TTS
//   Real-time capture with cpal + VAD integration
// ═══════════════════════════════════════════════════════════════

pub mod asr;
#[cfg(feature = "audio-capture")]
pub mod capture;
pub mod commands;
pub mod recorder;
pub mod recording_engine;
pub mod streaming_engine; // NEW: Real-time streaming with CPAL (struct available always, methods gated)
pub mod vad;
pub mod voice_fingerprint; // NEW v∞: Voice fingerprinting (SP-VOICE-001 Layer 3)
pub mod whisper_streaming; // NEW v19.3.1: Real-time Whisper streaming

#[cfg(feature = "audio-capture")]
pub use capture::{list_input_devices, list_output_devices, AudioCaptureState};
pub use commands::*;
pub use recording_engine::{
    RecordingConfig, RecordingEngine, RecordingResult, RecordingState, RECORDING_ENGINE,
};
pub use streaming_engine::{
    StreamingAudioEngine, StreamingConfig, StreamingResult, StreamingState,
};
pub use vad::{VADState, VoiceActivityDetector};
pub use voice_fingerprint::{VoiceFeatures, VoiceFingerprint, VoiceProfile};
pub use whisper_streaming::{
    AudioChunk, TranscriptionEvent, TranscriptionType, WhisperStreamConfig, WhisperStreamingEngine,
};

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
