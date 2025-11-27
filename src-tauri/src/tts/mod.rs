// TITANE∞ v24.20 - TTS (Text-to-Speech) Module
// Hybrid online/offline speech synthesis + streaming support
// Phase 8: SmallVec optimization for reduced heap allocations

pub mod local_tts;
pub mod online_tts;

use serde::{Deserialize, Serialize};
use smallvec::{SmallVec, smallvec};

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

/// v24.20 Phase 8: Split text into chunks for streaming TTS with SmallVec optimization
/// Target: ~500ms of speech per chunk (approx 50-80 chars at normal speed)
/// Optimization: SmallVec<[String; 4]> avoids heap allocation for small texts (<=4 chunks)
/// Most TTS requests are <300 chars → 1-3 chunks → stack-allocated
pub fn split_into_chunks(text: &str, max_chars: usize) -> Vec<String> {
    let mut chunks: SmallVec<[String; 4]> = SmallVec::new();
    let mut current_chunk = String::new();

    // Split by sentences first
    for sentence in text.split(&['.', '!', '?', ';'][..]) {
        let trimmed = sentence.trim();
        if trimmed.is_empty() {
            continue;
        }

        // If sentence fits in current chunk, add it
        if current_chunk.len() + trimmed.len() + 2 <= max_chars {
            if !current_chunk.is_empty() {
                current_chunk.push_str(". ");
            }
            current_chunk.push_str(trimmed);
        } else {
            // Save current chunk and start new one
            if !current_chunk.is_empty() {
                chunks.push(current_chunk);
            }
            current_chunk = trimmed.to_string();
        }
    }

    // Add remaining chunk
    if !current_chunk.is_empty() {
        chunks.push(current_chunk);
    }

    // If no chunks (no sentence delimiters), split by words
    if chunks.is_empty() && !text.is_empty() {
        let words: SmallVec<[&str; 16]> = text.split_whitespace().collect();
        let mut chunk = String::new();

        for word in words {
            if chunk.len() + word.len() + 1 > max_chars {
                if !chunk.is_empty() {
                    chunks.push(chunk);
                }
                chunk = word.to_string();
            } else {
                if !chunk.is_empty() {
                    chunk.push(' ');
                }
                chunk.push_str(word);
            }
        }

        if !chunk.is_empty() {
            chunks.push(chunk);
        }
    }

    chunks.into_vec()
}
