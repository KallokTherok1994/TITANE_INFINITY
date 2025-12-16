// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — AUDIO RECORDING ENGINE
//   Production-grade audio recording with state management
//   Backend: CPAL (optional) + ALSA fallback (arecord)
// ═══════════════════════════════════════════════════════════════

#[allow(dead_code)]
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;

/// Macro for safe mutex locking with auto-recovery from poisoned state
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[RecordingEngine] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

/// Recording configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingConfig {
    #[serde(default = "default_sample_rate")]
    pub sample_rate: u32,
    #[serde(default = "default_channels")]
    pub channels: u16,
    #[serde(default = "default_format")]
    pub format: String,
    #[serde(default = "default_max_duration")]
    pub max_duration: u32,
    #[serde(default)]
    pub language: Option<String>,
}

fn default_sample_rate() -> u32 {
    16000
}
fn default_channels() -> u16 {
    1
}
fn default_format() -> String {
    "wav".to_string()
}
fn default_max_duration() -> u32 {
    30
}

impl Default for RecordingConfig {
    fn default() -> Self {
        Self {
            sample_rate: 16000,
            channels: 1,
            format: "wav".to_string(),
            max_duration: 30,
            language: Some("fr-FR".to_string()),
        }
    }
}

/// Recording state
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingState {
    pub is_recording: bool,
    pub recording_id: Option<String>,
    pub started_at: Option<u64>,
    pub duration_ms: u64,
    pub file_path: Option<String>,
}

/// Recording result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingResult {
    pub transcript: String,
    pub confidence: f32,
    pub duration: f32,
    pub file_path: Option<String>,
    pub error: Option<String>,
}

/// Main recording engine with state machine
pub struct RecordingEngine {
    is_recording: Arc<AtomicBool>,
    process: Arc<Mutex<Option<Child>>>,
    recording_id: Arc<Mutex<Option<String>>>,
    start_time: Arc<Mutex<Option<Instant>>>,
    output_path: Arc<Mutex<Option<PathBuf>>>,
    config: Arc<Mutex<RecordingConfig>>,
}

impl RecordingEngine {
    pub fn new() -> Self {
        Self {
            is_recording: Arc::new(AtomicBool::new(false)),
            process: Arc::new(Mutex::new(None)),
            recording_id: Arc::new(Mutex::new(None)),
            start_time: Arc::new(Mutex::new(None)),
            output_path: Arc::new(Mutex::new(None)),
            config: Arc::new(Mutex::new(RecordingConfig::default())),
        }
    }

    /// Start recording with configuration
    pub fn start(&self, config: RecordingConfig) -> Result<String, String> {
        // ✅ GUARD: Check if already recording (HARD CHECK)
        if self.is_recording.load(Ordering::Acquire) {
            log::warn!("[RecordingEngine] Already recording, rejecting duplicate start");
            return Err("Recording already in progress".into());
        }

        // ✅ SAFETY: Kill any orphaned arecord processes
        let _ = Command::new("pkill").args(["-9", "-f", "arecord"]).output();

        // ✅ SAFETY: Force reset internal state before starting
        self.is_recording.store(false, Ordering::Release);
        *lock_or_recover!(self.recording_id) = None;
        *lock_or_recover!(self.start_time) = None;
        *lock_or_recover!(self.output_path) = None;

        // Generate unique recording ID
        let recording_id = format!("rec_{}", chrono::Utc::now().timestamp_millis());
        let output_path = std::env::temp_dir().join(format!("{}.wav", recording_id));

        log::info!(
            "[RecordingEngine] Starting recording: {} → {:?}",
            recording_id,
            output_path
        );
        log::info!(
            "[RecordingEngine] Config: sample_rate={}, channels={}, max_duration={}s",
            config.sample_rate,
            config.channels,
            config.max_duration
        );

        // Start arecord process
        let child = Command::new("arecord")
            .args([
                "-f",
                "S16_LE", // 16-bit signed little-endian
                "-r",
                &config.sample_rate.to_string(),
                "-c",
                &config.channels.to_string(),
                "-d",
                &config.max_duration.to_string(),
                output_path.to_str().ok_or("Invalid UTF-8 in output path")?,
            ])
            .stdin(std::process::Stdio::null())
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| {
                // ✅ CLEANUP: Reset flag on spawn error
                self.is_recording.store(false, Ordering::Release);
                format!("Failed to start arecord: {}. Is ALSA installed?", e)
            })?;

        let pid = child.id();
        log::info!("[RecordingEngine] arecord started with PID: {}", pid);

        // Update state
        *lock_or_recover!(self.process) = Some(child);
        *lock_or_recover!(self.recording_id) = Some(recording_id.clone());
        *lock_or_recover!(self.start_time) = Some(Instant::now());
        *lock_or_recover!(self.output_path) = Some(output_path);
        *lock_or_recover!(self.config) = config;
        self.is_recording.store(true, Ordering::Release);

        Ok(recording_id)
    }

    /// Stop recording and return audio file path
    pub fn stop(&self) -> Result<RecordingResult, String> {
        if !self.is_recording.load(Ordering::Acquire) {
            return Ok(RecordingResult {
                transcript: String::new(),
                confidence: 0.0,
                duration: 0.0,
                file_path: None,
                error: Some("No recording in progress".into()),
            });
        }

        log::info!("[RecordingEngine] Stopping recording...");

        // Calculate duration
        let duration = lock_or_recover!(self.start_time)
            .as_ref()
            .map(|t| t.elapsed().as_secs_f32())
            .unwrap_or(0.0);

        // Gracefully terminate arecord (SIGTERM allows file finalization)
        let mut process_guard = lock_or_recover!(self.process);
        if let Some(ref mut child) = *process_guard {
            let pid = child.id();
            log::info!("[RecordingEngine] Sending SIGTERM to PID {}", pid);

            // SIGTERM for graceful shutdown
            let _ = Command::new("kill")
                .args(["-TERM", &pid.to_string()])
                .output();

            // Wait for process to finish writing the file
            std::thread::sleep(std::time::Duration::from_millis(300));

            match child.wait() {
                Ok(status) => log::info!("[RecordingEngine] arecord exited: {}", status),
                Err(e) => log::warn!("[RecordingEngine] Failed to wait for arecord: {}", e),
            }
        }
        *process_guard = None;

        // Get output file
        let output_path = lock_or_recover!(self.output_path).clone();
        let file_path_str = output_path
            .as_ref()
            .and_then(|p| p.to_str().map(String::from));

        // Verify file exists and has content
        if let Some(ref path) = output_path {
            match std::fs::metadata(path) {
                Ok(metadata) => {
                    let size = metadata.len();
                    log::info!("[RecordingEngine] Audio file size: {} bytes", size);
                    if size < 100 {
                        log::warn!("[RecordingEngine] Audio file is suspiciously small!");
                    }
                }
                Err(e) => {
                    log::error!("[RecordingEngine] Audio file not found: {}", e);
                }
            }
        }

        // ✅ SAFETY: Reset state BEFORE returning (guarantee cleanup)
        self.is_recording.store(false, Ordering::Release);
        *lock_or_recover!(self.recording_id) = None;
        *lock_or_recover!(self.start_time) = None;

        // Implementation: ASR integration for recorded audio transcription
        // - Whisper: Use whisper-rs crate with WhisperContext::new(model_path)
        // - Model: Download ggml-medium.bin (~1.5GB) or ggml-small.bin (~500MB)
        // - Transcription: let segments = ctx.full(audio_samples, params)?; extract text
        // - Vosk: Alternative lightweight ASR, vosk-api crate with VoskRecognizer
        // - Language detection: Auto-detect language from first 30s of audio
        // - Confidence: Calculate from Whisper's per-segment probabilities
        // - Performance: Run transcription in tokio::task::spawn_blocking (CPU-intensive)
        // For now, return placeholder
        Ok(RecordingResult {
            transcript: String::new(),
            confidence: 0.0,
            duration,
            file_path: file_path_str,
            error: None,
        })
    }

    /// Cancel recording without saving
    pub fn cancel(&self) -> Result<(), String> {
        log::info!("[RecordingEngine] Cancelling recording...");

        // Kill the process
        let mut process_guard = lock_or_recover!(self.process);
        if let Some(ref mut child) = *process_guard {
            let _ = child.kill();
            let _ = child.wait();
        }
        *process_guard = None;

        // Kill any orphaned processes
        let _ = Command::new("pkill").args(["-9", "-f", "arecord"]).output();

        // Delete temp file
        if let Some(ref path) = *lock_or_recover!(self.output_path) {
            let _ = std::fs::remove_file(path);
        }

        // Reset state
        self.is_recording.store(false, Ordering::Release);
        *lock_or_recover!(self.recording_id) = None;
        *lock_or_recover!(self.start_time) = None;
        *lock_or_recover!(self.output_path) = None;

        log::info!("[RecordingEngine] Recording cancelled successfully");
        Ok(())
    }

    /// Get current recording state
    pub fn get_state(&self) -> RecordingState {
        let duration_ms = lock_or_recover!(self.start_time)
            .as_ref()
            .map(|t| t.elapsed().as_millis() as u64)
            .unwrap_or(0);

        RecordingState {
            is_recording: self.is_recording.load(Ordering::Acquire),
            recording_id: lock_or_recover!(self.recording_id).clone(),
            started_at: lock_or_recover!(self.start_time)
                .as_ref()
                .map(|t| t.elapsed().as_secs()),
            duration_ms,
            file_path: lock_or_recover!(self.output_path)
                .as_ref()
                .and_then(|p| p.to_str().map(String::from)),
        }
    }

    /// Check if recording is active
    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::Acquire)
    }

    /// Force reset (self-heal) - ✅ PUBLIC API
    pub fn force_reset(&self) {
        log::warn!("[RecordingEngine] FORCE RESET - emergency state cleanup");

        // Cancel recording gracefully first
        let _ = self.cancel();

        // Extra safety: kill ALL arecord processes
        let _ = Command::new("pkill").args(["-9", "arecord"]).output();

        // Hard reset all state
        self.is_recording.store(false, Ordering::Release);
        *lock_or_recover!(self.recording_id) = None;
        *lock_or_recover!(self.start_time) = None;
        *lock_or_recover!(self.output_path) = None;
        *lock_or_recover!(self.process) = None;

        log::info!("[RecordingEngine] ✅ Force reset complete");
    }
}

impl Default for RecordingEngine {
    fn default() -> Self {
        Self::new()
    }
}

// Global singleton
use once_cell::sync::Lazy;
pub static RECORDING_ENGINE: Lazy<RecordingEngine> = Lazy::new(RecordingEngine::new);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recording_config_default() {
        let config = RecordingConfig::default();
        assert_eq!(config.sample_rate, 16000);
        assert_eq!(config.channels, 1);
    }

    #[test]
    fn test_engine_initial_state() {
        let engine = RecordingEngine::new();
        assert!(!engine.is_recording());
    }
}
