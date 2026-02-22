// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.3.1 — WHISPER STREAMING ENGINE
//   Real-time incremental speech recognition with partial/final events
//   Architecture: Audio chunks → Whisper incremental → Tauri events
// ═══════════════════════════════════════════════════════════════

use super::{AudioError, AudioResult};
use crate::security::shell_guard::ShellGuard;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;

/// Macro for safe mutex locking with auto-recovery from poisoned state
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[WhisperStreaming] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

/// Whisper streaming configuration
#[derive(Debug, Clone)]
pub struct WhisperStreamConfig {
    /// Model size (tiny, base, small, medium, large)
    pub model: String,
    /// Language code (auto, en, fr, es, etc.)
    pub language: String,
    /// Minimum chunk duration for processing (ms)
    pub min_chunk_duration_ms: u64,
    /// Maximum chunk duration before forced processing (ms)
    pub max_chunk_duration_ms: u64,
    /// Partial update interval (ms)
    pub partial_update_interval_ms: u64,
    /// VAD threshold for speech detection (0.0 - 1.0)
    pub vad_threshold: f32,
    /// Silence duration to finalize segment (ms)
    pub silence_duration_ms: u64,
}

impl Default for WhisperStreamConfig {
    fn default() -> Self {
        Self {
            model: "base".to_string(),
            language: "fr".to_string(),
            min_chunk_duration_ms: 500,      // 500ms minimum
            max_chunk_duration_ms: 8000,     // 8s maximum
            partial_update_interval_ms: 300, // Update every 300ms
            vad_threshold: 0.5,
            silence_duration_ms: 1500, // 1.5s silence = final
        }
    }
}

/// Audio chunk for processing
#[derive(Debug, Clone)]
pub struct AudioChunk {
    pub data: Vec<f32>,
    pub sample_rate: u32,
    pub timestamp: Instant,
    pub has_speech: bool,
    pub vad_confidence: f32,
}

/// Transcription result types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TranscriptionType {
    Partial, // In-progress transcription
    Final,   // Confirmed segment
}

/// Transcription event sent to frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionEvent {
    pub text: String,
    pub r#type: TranscriptionType,
    pub confidence: f32,
    pub duration_ms: u64,
    pub timestamp: u64,
}

/// Whisper streaming state
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum StreamState {
    Idle,
    Buffering,
    Processing,
    Finalizing,
}

/// Main Whisper streaming engine
pub struct WhisperStreamingEngine {
    config: WhisperStreamConfig,
    state: Arc<Mutex<StreamState>>,
    buffer: Arc<Mutex<VecDeque<AudioChunk>>>,
    shell_guard: ShellGuard,
    last_partial_update: Arc<Mutex<Instant>>,
    speech_start_time: Arc<Mutex<Option<Instant>>>,
    last_speech_time: Arc<Mutex<Option<Instant>>>,
    current_segment: Arc<Mutex<Vec<f32>>>,
}

impl WhisperStreamingEngine {
    pub fn new(config: WhisperStreamConfig) -> Self {
        Self {
            config,
            state: Arc::new(Mutex::new(StreamState::Idle)),
            buffer: Arc::new(Mutex::new(VecDeque::new())),
            shell_guard: ShellGuard::new(),
            last_partial_update: Arc::new(Mutex::new(Instant::now())),
            speech_start_time: Arc::new(Mutex::new(None)),
            last_speech_time: Arc::new(Mutex::new(None)),
            current_segment: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Start streaming worker
    pub fn start_streaming(&self, app_handle: AppHandle, mut audio_rx: mpsc::Receiver<AudioChunk>) {
        let config = self.config.clone();
        let state = Arc::clone(&self.state);
        let buffer = Arc::clone(&self.buffer);
        let last_partial_update = Arc::clone(&self.last_partial_update);
        let speech_start_time = Arc::clone(&self.speech_start_time);
        let last_speech_time = Arc::clone(&self.last_speech_time);
        let current_segment = Arc::clone(&self.current_segment);
        let shell_guard = self.shell_guard.clone();

        tauri::async_runtime::spawn(async move {
            println!("[WhisperStreaming] 🎙️ Worker started");

            while let Some(chunk) = audio_rx.recv().await {
                // Push chunk to buffer
                {
                    let mut buf = lock_or_recover!(buffer);
                    buf.push_back(chunk.clone());
                }

                // Update speech timing
                if chunk.has_speech && chunk.vad_confidence > config.vad_threshold {
                    let now = Instant::now();

                    {
                        let mut speech_start = lock_or_recover!(speech_start_time);
                        if speech_start.is_none() {
                            *speech_start = Some(now);
                            println!("[WhisperStreaming] 🗣️ Speech started");
                        }
                    }

                    {
                        let mut last_speech = lock_or_recover!(last_speech_time);
                        *last_speech = Some(now);
                    }

                    // Accumulate audio segment
                    {
                        let mut segment = lock_or_recover!(current_segment);
                        segment.extend_from_slice(&chunk.data);
                    }

                    // Change state to buffering/processing
                    {
                        let mut s = lock_or_recover!(state);
                        if *s == StreamState::Idle {
                            *s = StreamState::Buffering;
                        }
                    }
                }

                // Check for partial update trigger
                let should_update_partial = {
                    let last_update = lock_or_recover!(last_partial_update);
                    last_update.elapsed()
                        >= Duration::from_millis(config.partial_update_interval_ms)
                };

                if should_update_partial {
                    let segment_duration = {
                        let segment = lock_or_recover!(current_segment);
                        (segment.len() as f32 / chunk.sample_rate as f32 * 1000.0) as u64
                    };

                    if segment_duration >= config.min_chunk_duration_ms {
                        // Process partial transcription
                        if let Ok(partial_text) = Self::transcribe_segment(
                            &current_segment,
                            chunk.sample_rate,
                            &config,
                            &shell_guard,
                            false, // Not final
                        )
                        .await
                        {
                            if !partial_text.is_empty() {
                                let event = TranscriptionEvent {
                                    text: partial_text,
                                    r#type: TranscriptionType::Partial,
                                    confidence: chunk.vad_confidence,
                                    duration_ms: segment_duration,
                                    timestamp: chunk.timestamp.elapsed().as_millis() as u64,
                                };

                                // Emit to frontend
                                let _ = app_handle.emit("whisper:partial", &event);
                                println!("[WhisperStreaming] 📝 Partial: {}", event.text);
                            }
                        }

                        // Update last partial time
                        *lock_or_recover!(last_partial_update) = Instant::now();
                    }
                }

                // Check for final segment trigger (silence detected)
                let should_finalize = {
                    let last_speech = lock_or_recover!(last_speech_time);
                    if let Some(last) = *last_speech {
                        last.elapsed() >= Duration::from_millis(config.silence_duration_ms)
                    } else {
                        false
                    }
                };

                if should_finalize {
                    let segment_duration = {
                        let segment = lock_or_recover!(current_segment);
                        (segment.len() as f32 / chunk.sample_rate as f32 * 1000.0) as u64
                    };

                    if segment_duration >= config.min_chunk_duration_ms {
                        // Process final transcription
                        if let Ok(final_text) = Self::transcribe_segment(
                            &current_segment,
                            chunk.sample_rate,
                            &config,
                            &shell_guard,
                            true, // Final
                        )
                        .await
                        {
                            if !final_text.is_empty() {
                                let event = TranscriptionEvent {
                                    text: final_text,
                                    r#type: TranscriptionType::Final,
                                    confidence: 0.9, // High confidence for final
                                    duration_ms: segment_duration,
                                    timestamp: chunk.timestamp.elapsed().as_millis() as u64,
                                };

                                // Emit to frontend
                                let _ = app_handle.emit("whisper:final", &event);
                                println!("[WhisperStreaming] ✅ Final: {}", event.text);
                            }
                        }

                        // Reset segment
                        {
                            let mut segment = lock_or_recover!(current_segment);
                            segment.clear();
                        }
                        {
                            let mut speech_start = lock_or_recover!(speech_start_time);
                            *speech_start = None;
                        }
                        {
                            let mut last_speech = lock_or_recover!(last_speech_time);
                            *last_speech = None;
                        }
                        {
                            let mut s = lock_or_recover!(state);
                            *s = StreamState::Idle;
                        }
                        {
                            let mut buf = lock_or_recover!(buffer);
                            buf.clear();
                        }
                    }
                }

                // Force finalization if max duration reached
                let segment_duration = {
                    let segment = lock_or_recover!(current_segment);
                    (segment.len() as f32 / chunk.sample_rate as f32 * 1000.0) as u64
                };

                if segment_duration >= config.max_chunk_duration_ms {
                    println!("[WhisperStreaming] ⚠️ Max duration reached, forcing finalization");

                    if let Ok(final_text) = Self::transcribe_segment(
                        &current_segment,
                        chunk.sample_rate,
                        &config,
                        &shell_guard,
                        true,
                    )
                    .await
                    {
                        if !final_text.is_empty() {
                            let event = TranscriptionEvent {
                                text: final_text,
                                r#type: TranscriptionType::Final,
                                confidence: 0.85,
                                duration_ms: segment_duration,
                                timestamp: chunk.timestamp.elapsed().as_millis() as u64,
                            };

                            let _ = app_handle.emit("whisper:final", &event);
                        }
                    }

                    // Reset
                    lock_or_recover!(current_segment).clear();
                    *lock_or_recover!(speech_start_time) = None;
                    *lock_or_recover!(last_speech_time) = None;
                    *lock_or_recover!(state) = StreamState::Idle;
                    lock_or_recover!(buffer).clear();
                }
            }

            println!("[WhisperStreaming] 🛑 Worker stopped");
        });
    }

    /// Transcribe audio segment using Whisper
    async fn transcribe_segment(
        segment: &Arc<Mutex<Vec<f32>>>,
        sample_rate: u32,
        config: &WhisperStreamConfig,
        shell_guard: &ShellGuard,
        is_final: bool,
    ) -> AudioResult<String> {
        let audio_data = lock_or_recover!(segment).clone();

        if audio_data.is_empty() {
            return Ok(String::new());
        }

        // Convert f32 samples to i16 WAV
        let wav_data = Self::samples_to_wav(&audio_data, sample_rate)?;

        // Write to temp file
        let timestamp_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);

        let temp_path =
            std::env::temp_dir().join(format!("titane_whisper_stream_{}.wav", timestamp_ms));

        // Clone for cleanup after spawn_blocking
        let temp_path_for_cleanup = temp_path.clone();

        std::fs::write(&temp_path, wav_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        // Clone shell_guard to avoid lifetime issues
        let shell_guard_cloned = shell_guard.clone();

        // Call Whisper via ShellGuard
        let result =
            tokio::task::spawn_blocking(move || shell_guard_cloned.execute_asr_whisper(&temp_path))
                .await
                .map_err(|e| AudioError::ProcessingError(e.to_string()))?
                .map_err(|e| AudioError::ProcessingError(e))?;

        // Cleanup temp file
        let _ = std::fs::remove_file(&temp_path_for_cleanup);

        Ok(result.trim().to_string())
    }

    /// Convert f32 samples to WAV bytes
    fn samples_to_wav(samples: &[f32], sample_rate: u32) -> AudioResult<Vec<u8>> {
        let mut wav_data = Vec::new();

        // WAV header
        let num_channels: u16 = 1;
        let bits_per_sample: u16 = 16;
        let byte_rate = sample_rate * num_channels as u32 * bits_per_sample as u32 / 8;
        let block_align = num_channels * bits_per_sample / 8;
        let data_size = (samples.len() * 2) as u32;
        let file_size = 36 + data_size;

        // RIFF chunk
        wav_data.extend_from_slice(b"RIFF");
        wav_data.extend_from_slice(&file_size.to_le_bytes());
        wav_data.extend_from_slice(b"WAVE");

        // fmt chunk
        wav_data.extend_from_slice(b"fmt ");
        wav_data.extend_from_slice(&16u32.to_le_bytes()); // Subchunk1Size
        wav_data.extend_from_slice(&1u16.to_le_bytes()); // AudioFormat (PCM)
        wav_data.extend_from_slice(&num_channels.to_le_bytes());
        wav_data.extend_from_slice(&sample_rate.to_le_bytes());
        wav_data.extend_from_slice(&byte_rate.to_le_bytes());
        wav_data.extend_from_slice(&block_align.to_le_bytes());
        wav_data.extend_from_slice(&bits_per_sample.to_le_bytes());

        // data chunk
        wav_data.extend_from_slice(b"data");
        wav_data.extend_from_slice(&data_size.to_le_bytes());

        // Convert f32 to i16
        for &sample in samples {
            let sample_i16 = (sample.clamp(-1.0, 1.0) * 32767.0) as i16;
            wav_data.extend_from_slice(&sample_i16.to_le_bytes());
        }

        Ok(wav_data)
    }

    /// Get current state
    pub(crate) fn get_state(&self) -> StreamState {
        *lock_or_recover!(self.state)
    }

    /// Reset streaming engine
    pub fn reset(&self) {
        *lock_or_recover!(self.state) = StreamState::Idle;
        lock_or_recover!(self.buffer).clear();
        lock_or_recover!(self.current_segment).clear();
        *lock_or_recover!(self.speech_start_time) = None;
        *lock_or_recover!(self.last_speech_time) = None;
    }
}
