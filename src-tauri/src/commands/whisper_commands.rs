// ═══════════════════════════════════════════════════════════════════
// WHISPER STREAMING COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use crate::error::TitaneError;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhisperConfig {
    pub model: String,
    pub language: String,
    pub sample_rate: u32,
}

lazy_static! {
    static ref WHISPER_ACTIVE: Mutex<bool> = Mutex::new(false);
    static ref AUDIO_CHUNKS: Mutex<Vec<Vec<u8>>> = Mutex::new(Vec::new());
}

#[tauri::command]
pub async fn start_whisper_streaming(config: WhisperConfig) -> Result<(), TitaneError> {
    log::info!("[WHISPER] start_whisper_streaming: model={}", config.model);

    let mut active = WHISPER_ACTIVE
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock WHISPER_ACTIVE: {}", e)))?;

    if *active {
        return Err(TitaneError::InvalidChatRequest(
            "Whisper streaming already active".to_string(),
        ));
    }

    *active = true;

    log::info!("[WHISPER] ✅ Whisper streaming started");
    Ok(())
}

#[tauri::command]
pub async fn stop_whisper_streaming() -> Result<(), TitaneError> {
    log::info!("[WHISPER] stop_whisper_streaming called");

    let mut active = WHISPER_ACTIVE
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock WHISPER_ACTIVE: {}", e)))?;

    *active = false;

    let mut chunks = AUDIO_CHUNKS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock AUDIO_CHUNKS: {}", e)))?;
    chunks.clear();

    log::info!("[WHISPER] ✅ Whisper streaming stopped");
    Ok(())
}

#[tauri::command]
pub async fn send_audio_chunk(chunk: Vec<u8>) -> Result<(), TitaneError> {
    log::debug!("[WHISPER] send_audio_chunk: {} bytes", chunk.len());

    let active = WHISPER_ACTIVE
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock WHISPER_ACTIVE: {}", e)))?;

    if !*active {
        return Err(TitaneError::InvalidChatRequest(
            "Whisper streaming not active".to_string(),
        ));
    }

    let mut chunks = AUDIO_CHUNKS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock AUDIO_CHUNKS: {}", e)))?;

    chunks.push(chunk);

    Ok(())
}
