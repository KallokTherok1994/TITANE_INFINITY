// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ ULTRA — STREAMING AUDIO ENGINE
//   Real-time PCM streaming with CPAL + VAD integration
//   Replaces arecord batch recording with continuous streaming
// ═══════════════════════════════════════════════════════════════

use super::vad::{VADResult, VoiceActivityDetector};
use super::{AudioConfig, AudioError, AudioResult};
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[cfg(feature = "audio-capture")]
use cpal::{
    traits::{DeviceTrait, HostTrait, StreamTrait},
    Stream, StreamConfig,
};

// Helper macro for safe mutex access with recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::warn!("Mutex poisoned, recovering: {}", poisoned);
            poisoned.into_inner()
        })
    };
}

/// Audio streaming state machine
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum StreamingState {
    Idle,
    Listening,  // VAD monitoring, waiting for speech
    Recording,  // Active speech detected, buffering
    Processing, // Speech ended, processing buffer
}

/// Ring buffer for PCM samples (thread-safe)
pub struct RingBuffer {
    data: Vec<f32>,
    capacity: usize,
    write_pos: usize,
    read_pos: usize,
    samples_written: usize,
}

impl RingBuffer {
    pub fn new(capacity: usize) -> Self {
        Self {
            data: vec![0.0; capacity],
            capacity,
            write_pos: 0,
            read_pos: 0,
            samples_written: 0,
        }
    }

    pub fn write(&mut self, samples: &[f32]) {
        for &sample in samples {
            self.data[self.write_pos] = sample;
            self.write_pos = (self.write_pos + 1) % self.capacity;
            self.samples_written += 1;
        }
    }

    pub fn read_available(&mut self) -> Vec<f32> {
        let available = self.available_samples();
        if available == 0 {
            return Vec::new();
        }

        let mut result = Vec::with_capacity(available);
        for _ in 0..available {
            result.push(self.data[self.read_pos]);
            self.read_pos = (self.read_pos + 1) % self.capacity;
        }

        result
    }

    pub fn available_samples(&self) -> usize {
        if self.write_pos >= self.read_pos {
            self.write_pos - self.read_pos
        } else {
            self.capacity - self.read_pos + self.write_pos
        }
    }

    pub fn clear(&mut self) {
        self.write_pos = 0;
        self.read_pos = 0;
        self.samples_written = 0;
        self.data.fill(0.0);
    }

    pub fn total_written(&self) -> usize {
        self.samples_written
    }
}

/// Streaming audio configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamingConfig {
    pub sample_rate: u32,
    pub channels: u16,
    pub chunk_size_ms: u32,
    pub buffer_duration_s: u32,
    pub vad_enabled: bool,
    pub vad_threshold: f32,
    pub silence_duration_ms: u32,
}

impl Default for StreamingConfig {
    fn default() -> Self {
        Self {
            sample_rate: 16000,
            channels: 1,
            chunk_size_ms: 64, // 64ms chunks for real-time feel
            buffer_duration_s: 30,
            vad_enabled: true,
            vad_threshold: 0.5,
            silence_duration_ms: 1500, // 1.5s silence = end of speech
        }
    }
}

/// Streaming result with audio data
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamingResult {
    pub audio_data: Vec<f32>,
    pub duration_ms: u64,
    pub sample_rate: u32,
    pub has_speech: bool,
    pub vad_confidence: f32,
}

/// Main streaming audio engine
pub struct StreamingAudioEngine {
    config: StreamingConfig,
    state: Arc<Mutex<StreamingState>>,
    is_active: Arc<AtomicBool>,
    buffer: Arc<Mutex<RingBuffer>>,
    vad: Arc<Mutex<VoiceActivityDetector>>,
    speech_start_time: Arc<Mutex<Option<Instant>>>,
    last_speech_time: Arc<Mutex<Option<Instant>>>,

    #[cfg(feature = "audio-capture")]
    stream: Option<Stream>,
}

impl StreamingAudioEngine {
    pub fn new(config: StreamingConfig) -> Self {
        let buffer_samples = (config.sample_rate as usize) * (config.buffer_duration_s as usize);

        Self {
            config,
            state: Arc::new(Mutex::new(StreamingState::Idle)),
            is_active: Arc::new(AtomicBool::new(false)),
            buffer: Arc::new(Mutex::new(RingBuffer::new(buffer_samples))),
            vad: Arc::new(Mutex::new(VoiceActivityDetector::new())),
            speech_start_time: Arc::new(Mutex::new(None)),
            last_speech_time: Arc::new(Mutex::new(None)),

            #[cfg(feature = "audio-capture")]
            stream: None,
        }
    }

    /// Start streaming with CPAL (feature-gated)
    #[cfg(feature = "audio-capture")]
    pub fn start_streaming(&mut self) -> AudioResult<()> {
        log::info!("[StreamingEngine] Starting CPAL stream...");

        if self.is_active.load(Ordering::Acquire) {
            return Err(AudioError::RecordingError("Stream already active".into()));
        }

        // Get default input device
        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .ok_or_else(|| AudioError::DeviceError("No input device found".into()))?;

        log::info!("[StreamingEngine] Using device: {:?}", device.name());

        // Configure stream
        let config = StreamConfig {
            channels: self.config.channels,
            sample_rate: cpal::SampleRate(self.config.sample_rate),
            buffer_size: cpal::BufferSize::Default,
        };

        // Clone Arc references for callback
        let buffer = Arc::clone(&self.buffer);
        let vad = Arc::clone(&self.vad);
        let state = Arc::clone(&self.state);
        let speech_start = Arc::clone(&self.speech_start_time);
        let last_speech = Arc::clone(&self.last_speech_time);
        let silence_duration = self.config.silence_duration_ms;
        let vad_enabled = self.config.vad_enabled;

        // Build input stream with callback
        let stream = device
            .build_input_stream(
                &config,
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    // This callback runs in real-time audio thread
                    Self::audio_callback(
                        data,
                        &buffer,
                        &vad,
                        &state,
                        &speech_start,
                        &last_speech,
                        silence_duration,
                        vad_enabled,
                    );
                },
                |err| {
                    log::error!("[StreamingEngine] Stream error: {}", err);
                },
                None,
            )
            .map_err(|e| AudioError::RecordingError(format!("Failed to build stream: {}", e)))?;

        // Start playback
        stream
            .play()
            .map_err(|e| AudioError::RecordingError(format!("Failed to start stream: {}", e)))?;

        self.stream = Some(stream);
        self.is_active.store(true, Ordering::Release);

        // Update state with error recovery
        if let Ok(mut state) = self.state.lock() {
            *state = StreamingState::Listening;
        } else {
            log::error!("[StreamingEngine] ⚠️ State mutex poisoned, recovering");
            // Mutex poisoned but stream is still active - recover
            let recovered = self.state.lock().unwrap_or_else(|e| e.into_inner());
            *recovered = StreamingState::Listening;
        }

        log::info!("[StreamingEngine] ✅ Stream started successfully");
        Ok(())
    }

    /// Fallback: start streaming with arecord (no CPAL)
    #[cfg(not(feature = "audio-capture"))]
    pub fn start_streaming(&mut self) -> AudioResult<()> {
        log::warn!("[StreamingEngine] CPAL not available, using arecord fallback");
        Err(AudioError::NotAvailable)
    }

    /// Audio callback (runs in real-time thread)
    #[cfg(feature = "audio-capture")]
    fn audio_callback(
        data: &[f32],
        buffer: &Arc<Mutex<RingBuffer>>,
        vad: &Arc<Mutex<VoiceActivityDetector>>,
        state: &Arc<Mutex<StreamingState>>,
        speech_start: &Arc<Mutex<Option<Instant>>>,
        last_speech: &Arc<Mutex<Option<Instant>>>,
        silence_duration_ms: u32,
        vad_enabled: bool,
    ) {
        // Write to ring buffer
        if let Ok(mut buf) = buffer.lock() {
            buf.write(data);
        }

        // VAD processing
        if !vad_enabled {
            return;
        }

        let vad_result = if let Ok(vad_detector) = vad.lock() {
            vad_detector.detect(data)
        } else {
            return;
        };

        // State machine transitions
        let current_state = *lock_or_recover!(state);

        match current_state {
            StreamingState::Listening => {
                if vad_result.has_speech && vad_result.confidence > 0.7 {
                    log::info!("[StreamingEngine] 🎤 Speech detected, start recording");
                    *lock_or_recover!(state) = StreamingState::Recording;
                    *lock_or_recover!(speech_start) = Some(Instant::now());
                    *lock_or_recover!(last_speech) = Some(Instant::now());
                }
            }
            StreamingState::Recording => {
                if vad_result.has_speech {
                    // Update last speech time
                    *lock_or_recover!(last_speech) = Some(Instant::now());
                } else {
                    // Check silence duration
                    if let Some(last) = *lock_or_recover!(last_speech) {
                        let silence_duration = last.elapsed().as_millis() as u32;
                        if silence_duration > silence_duration_ms {
                            log::info!("[StreamingEngine] 🔇 Silence detected, processing...");
                            *lock_or_recover!(state) = StreamingState::Processing;
                        }
                    }
                }
            }
            _ => {}
        }
    }

    /// Stop streaming
    pub fn stop_streaming(&mut self) -> AudioResult<StreamingResult> {
        log::info!("[StreamingEngine] Stopping stream...");

        if !self.is_active.load(Ordering::Acquire) {
            return Err(AudioError::RecordingError("No active stream".into()));
        }

        // Stop CPAL stream
        #[cfg(feature = "audio-capture")]
        {
            self.stream = None; // Drop closes the stream
        }

        self.is_active.store(false, Ordering::Release);

        // Get buffered audio data
        let audio_data = {
            let mut buf = lock_or_recover!(self.buffer);
            let data = buf.read_available();
            buf.clear();
            data
        };

        // Calculate duration
        let duration_ms = if let Some(start) = *lock_or_recover!(self.speech_start_time) {
            start.elapsed().as_millis() as u64
        } else {
            0
        };

        // Get final VAD result
        let (has_speech, confidence) = if let Ok(vad) = self.vad.lock() {
            let result = vad.detect(&audio_data);
            (result.has_speech, result.confidence)
        } else {
            (false, 0.0)
        };

        // Reset state
        *lock_or_recover!(self.state) = StreamingState::Idle;
        *lock_or_recover!(self.speech_start_time) = None;
        *lock_or_recover!(self.last_speech_time) = None;

        log::info!(
            "[StreamingEngine] ✅ Stream stopped - {} samples, {:.2}s",
            audio_data.len(),
            duration_ms as f32 / 1000.0
        );

        Ok(StreamingResult {
            audio_data,
            duration_ms,
            sample_rate: self.config.sample_rate,
            has_speech,
            vad_confidence: confidence,
        })
    }

    /// Get current state
    pub fn get_state(&self) -> StreamingState {
        *lock_or_recover!(self.state)
    }

    /// Check if streaming is active
    pub fn is_active(&self) -> bool {
        self.is_active.load(Ordering::Acquire)
    }

    /// Get buffer stats (for monitoring)
    pub fn get_buffer_stats(&self) -> (usize, usize) {
        let buf = lock_or_recover!(self.buffer);
        (buf.available_samples(), buf.total_written())
    }

    /// Force stop (emergency)
    pub fn force_stop(&mut self) {
        log::warn!("[StreamingEngine] FORCE STOP");

        #[cfg(feature = "audio-capture")]
        {
            self.stream = None;
        }

        self.is_active.store(false, Ordering::Release);
        lock_or_recover!(self.buffer).clear();
        *lock_or_recover!(self.state) = StreamingState::Idle;
    }
}

impl Drop for StreamingAudioEngine {
    fn drop(&mut self) {
        if self.is_active() {
            self.force_stop();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ring_buffer() {
        let mut buffer = RingBuffer::new(100);

        // Write samples
        buffer.write(&[1.0, 2.0, 3.0]);
        assert_eq!(buffer.available_samples(), 3);

        // Read samples
        let data = buffer.read_available();
        assert_eq!(data, vec![1.0, 2.0, 3.0]);
        assert_eq!(buffer.available_samples(), 0);
    }

    #[test]
    fn test_ring_buffer_wraparound() {
        let mut buffer = RingBuffer::new(5);

        // Fill buffer
        buffer.write(&[1.0, 2.0, 3.0, 4.0, 5.0]);

        // Overflow (should wrap)
        buffer.write(&[6.0, 7.0]);

        // Read all
        let data = buffer.read_available();
        assert_eq!(data.len(), 5); // Only last 5 samples
    }

    #[test]
    fn test_streaming_config() {
        let config = StreamingConfig::default();
        assert_eq!(config.sample_rate, 16000);
        assert!(config.vad_enabled);
    }

    #[test]
    fn test_streaming_engine_creation() {
        let config = StreamingConfig::default();
        let engine = StreamingAudioEngine::new(config);
        assert!(!engine.is_active());
        assert_eq!(engine.get_state(), StreamingState::Idle);
    }
}
