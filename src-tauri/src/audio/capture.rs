// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — AUDIO CAPTURE ENGINE
//   Real-time microphone capture with cpal
//   Features: Ring buffer, VAD integration, Multi-format export
// ═══════════════════════════════════════════════════════════════

use super::{AudioConfig, AudioError, AudioResult};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::mpsc;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
use std::time::Duration;

fn build_stream<T: cpal::Sample + cpal::SizedSample + Send + 'static>(
    device: &cpal::Device,
    config: &cpal::StreamConfig,
    buffer: Arc<Mutex<RingBuffer>>,
    is_capturing: Arc<AtomicBool>,
) -> Result<cpal::Stream, String>
where
    f32: cpal::FromSample<T>,
{
    let err_fn = |err| log::error!("[AudioCapture] Stream error: {}", err);

    device
        .build_input_stream(
            config,
            move |data: &[T], _: &cpal::InputCallbackInfo| {
                if !is_capturing.load(Ordering::SeqCst) {
                    return;
                }

                let samples: Vec<f32> =
                    data.iter().map(|&s| cpal::Sample::from_sample(s)).collect();

                if let Ok(mut buf) = buffer.lock() {
                    buf.write(&samples);
                }
            },
            err_fn,
            None,
        )
        .map_err(|e| format!("Failed to build stream: {}", e))
}

/// Audio capture state shared between threads
pub struct AudioCaptureState {
    /// Ring buffer for captured audio samples
    buffer: Arc<Mutex<RingBuffer>>,
    /// Flag indicating if capture is active
    is_capturing: Arc<AtomicBool>,
    /// Current audio configuration
    config: AudioConfig,
    /// Capture worker thread (keeps the CPAL stream alive)
    capture_thread: Option<std::thread::JoinHandle<()>>,
}

/// Thread-safe ring buffer for audio samples
struct RingBuffer {
    data: Vec<f32>,
    capacity: usize,
    write_pos: usize,
    samples_written: usize,
}

impl RingBuffer {
    fn new(capacity: usize) -> Self {
        Self {
            data: vec![0.0; capacity],
            capacity,
            write_pos: 0,
            samples_written: 0,
        }
    }

    fn write(&mut self, samples: &[f32]) {
        for &sample in samples {
            self.data[self.write_pos] = sample;
            self.write_pos = (self.write_pos + 1) % self.capacity;
            self.samples_written += 1;
        }
    }

    fn get_last_n(&self, count: usize) -> Vec<f32> {
        let count = count.min(self.capacity).min(self.samples_written);
        if count == 0 {
            return Vec::new();
        }

        let mut result = Vec::with_capacity(count);
        let start = if self.write_pos >= count {
            self.write_pos - count
        } else {
            self.capacity + self.write_pos - count
        };

        for i in 0..count {
            let pos = (start + i) % self.capacity;
            result.push(self.data[pos]);
        }

        result
    }

    fn clear(&mut self) {
        self.data.fill(0.0);
        self.write_pos = 0;
        self.samples_written = 0;
    }

    fn total_samples(&self) -> usize {
        self.samples_written
    }
}

impl AudioCaptureState {
    /// Create new capture state with default config
    pub fn new() -> Self {
        Self::with_config(AudioConfig::default())
    }

    /// Create capture state with custom config
    pub fn with_config(config: AudioConfig) -> Self {
        // Buffer size: sample_rate * seconds * channels
        let buffer_size = (config.sample_rate as usize) * 30; // 30 seconds buffer

        Self {
            buffer: Arc::new(Mutex::new(RingBuffer::new(buffer_size))),
            is_capturing: Arc::new(AtomicBool::new(false)),
            config,
            capture_thread: None,
        }
    }

    /// Start capturing audio from default input device
    pub fn start_capture(&mut self) -> AudioResult<()> {
        if self.is_capturing.load(Ordering::SeqCst) {
            log::warn!("[AudioCapture] Already capturing");
            return Ok(());
        }

        // Mark capturing true before spawning so the worker doesn't immediately exit.
        self.is_capturing.store(true, Ordering::SeqCst);

        let buffer = self.buffer.clone();
        let is_capturing = self.is_capturing.clone();
        let (ready_tx, ready_rx) = mpsc::channel::<Result<(), String>>();

        let handle = std::thread::spawn(move || {
            let init_result = (|| -> Result<(), String> {
                let host = cpal::default_host();
                let device = host
                    .default_input_device()
                    .ok_or_else(|| "No input device available".to_string())?;

                log::info!(
                    "[AudioCapture] Using device: {}",
                    device.name().unwrap_or_default()
                );

                let supported_config = device
                    .default_input_config()
                    .map_err(|e| format!("No supported config: {}", e))?;

                log::info!(
                    "[AudioCapture] Sample rate: {}, Channels: {}",
                    supported_config.sample_rate().0,
                    supported_config.channels()
                );

                let sample_format = supported_config.sample_format();
                let stream_config: cpal::StreamConfig = supported_config.into();

                let stream = match sample_format {
                    cpal::SampleFormat::F32 => {
                        build_stream::<f32>(&device, &stream_config, buffer.clone(), is_capturing.clone())?
                    }
                    cpal::SampleFormat::I16 => {
                        build_stream::<i16>(&device, &stream_config, buffer.clone(), is_capturing.clone())?
                    }
                    cpal::SampleFormat::U16 => {
                        build_stream::<u16>(&device, &stream_config, buffer.clone(), is_capturing.clone())?
                    }
                    format => Err(format!("Unsupported format: {:?}", format))?,
                };

                stream
                    .play()
                    .map_err(|e| format!("Failed to start stream: {}", e))?;

                // Keep stream alive until capture is stopped.
                while is_capturing.load(Ordering::SeqCst) {
                    std::thread::sleep(Duration::from_millis(50));
                }

                drop(stream);
                Ok(())
            })();

            let _ = ready_tx.send(init_result);
        });

        match ready_rx.recv_timeout(Duration::from_secs(3)) {
            Ok(Ok(())) => {
                self.capture_thread = Some(handle);
                log::info!("[AudioCapture] ✅ Capture started");
                Ok(())
            }
            Ok(Err(msg)) => {
                self.is_capturing.store(false, Ordering::SeqCst);
                let _ = handle.join();
                Err(AudioError::RecordingError(msg))
            }
            Err(_) => {
                self.is_capturing.store(false, Ordering::SeqCst);
                let _ = handle.join();
                Err(AudioError::RecordingError(
                    "Capture start timed out".to_string(),
                ))
            }
        }
    }

    /// Stop capturing audio
    pub fn stop_capture(&mut self) -> AudioResult<()> {
        if !self.is_capturing.load(Ordering::SeqCst) {
            return Ok(());
        }

        self.is_capturing.store(false, Ordering::SeqCst);

        if let Some(handle) = self.capture_thread.take() {
            let _ = handle.join();
        }

        log::info!("[AudioCapture] ✅ Capture stopped");
        Ok(())
    }

    /// Check if currently capturing
    pub fn is_capturing(&self) -> bool {
        self.is_capturing.load(Ordering::SeqCst)
    }

    /// Get captured audio data for the last N milliseconds
    pub fn get_audio_chunk(&self, duration_ms: u32) -> AudioResult<Vec<f32>> {
        let samples_count = (self.config.sample_rate * duration_ms / 1000) as usize;

        let buffer = self
            .buffer
            .lock()
            .map_err(|e| AudioError::ProcessingError(format!("Buffer lock failed: {}", e)))?;

        Ok(buffer.get_last_n(samples_count))
    }

    /// Get all captured audio data
    pub fn get_all_audio(&self) -> AudioResult<Vec<f32>> {
        let buffer = self
            .buffer
            .lock()
            .map_err(|e| AudioError::ProcessingError(format!("Buffer lock failed: {}", e)))?;

        let total = buffer.total_samples().min(buffer.capacity);
        Ok(buffer.get_last_n(total))
    }

    /// Clear the audio buffer
    pub fn clear_buffer(&self) {
        if let Ok(mut buffer) = self.buffer.lock() {
            buffer.clear();
        }
    }

    /// Export captured audio to WAV file
    pub fn export_wav(&self, path: &std::path::Path) -> AudioResult<()> {
        let samples = self.get_all_audio()?;

        if samples.is_empty() {
            return Err(AudioError::ProcessingError(
                "No audio data to export".into(),
            ));
        }

        let spec = hound::WavSpec {
            channels: self.config.channels,
            sample_rate: self.config.sample_rate,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let mut writer = hound::WavWriter::create(path, spec)
            .map_err(|e| AudioError::ProcessingError(format!("Failed to create WAV: {}", e)))?;

        for sample in samples {
            // Convert f32 [-1.0, 1.0] to i16
            let sample_i16 = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
            writer.write_sample(sample_i16).map_err(|e| {
                AudioError::ProcessingError(format!("Failed to write sample: {}", e))
            })?;
        }

        writer
            .finalize()
            .map_err(|e| AudioError::ProcessingError(format!("Failed to finalize WAV: {}", e)))?;

        log::info!("[AudioCapture] ✅ Exported WAV to {:?}", path);
        Ok(())
    }

    /// Export captured audio to raw bytes (for ASR)
    pub fn export_raw_bytes(&self) -> AudioResult<Vec<u8>> {
        let samples = self.get_all_audio()?;

        // Convert f32 samples to i16 bytes (little-endian)
        let mut bytes = Vec::with_capacity(samples.len() * 2);
        for sample in samples {
            let sample_i16 = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
            bytes.extend_from_slice(&sample_i16.to_le_bytes());
        }

        Ok(bytes)
    }

    /// Get current configuration
    pub fn get_config(&self) -> &AudioConfig {
        &self.config
    }

    /// Get total samples captured
    pub fn total_samples(&self) -> usize {
        self.buffer
            .lock()
            .map(|buf| buf.total_samples())
            .unwrap_or(0)
    }

    /// Get capture duration in milliseconds
    pub fn capture_duration_ms(&self) -> u64 {
        let samples = self.total_samples();
        (samples as u64 * 1000) / (self.config.sample_rate as u64)
    }
}

impl Default for AudioCaptureState {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for AudioCaptureState {
    fn drop(&mut self) {
        let _ = self.stop_capture();
    }
}

// ─────────────────────────────────────────────────────────────────
//  Device Enumeration
// ─────────────────────────────────────────────────────────────────

/// List available input devices
pub fn list_input_devices() -> Vec<String> {
    let host = cpal::default_host();

    host.input_devices()
        .map(|devices| devices.filter_map(|d| d.name().ok()).collect())
        .unwrap_or_default()
}

/// List available output devices
pub fn list_output_devices() -> Vec<String> {
    let host = cpal::default_host();

    host.output_devices()
        .map(|devices| devices.filter_map(|d| d.name().ok()).collect())
        .unwrap_or_default()
}

/// Get default input device name
pub fn default_input_device_name() -> Option<String> {
    let host = cpal::default_host();
    host.default_input_device().and_then(|d| d.name().ok())
}

/// Get default output device name
pub fn default_output_device_name() -> Option<String> {
    let host = cpal::default_host();
    host.default_output_device().and_then(|d| d.name().ok())
}

// ─────────────────────────────────────────────────────────────────
//  Tests
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ring_buffer_write_read() {
        let mut buffer = RingBuffer::new(10);
        buffer.write(&[1.0, 2.0, 3.0]);

        let data = buffer.get_last_n(3);
        assert_eq!(data, vec![1.0, 2.0, 3.0]);
    }

    #[test]
    fn test_ring_buffer_wrap() {
        let mut buffer = RingBuffer::new(5);
        buffer.write(&[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]);

        let data = buffer.get_last_n(5);
        assert_eq!(data, vec![3.0, 4.0, 5.0, 6.0, 7.0]);
    }

    #[test]
    fn test_capture_state_creation() {
        let state = AudioCaptureState::new();
        assert!(!state.is_capturing());
    }

    #[test]
    fn test_device_enumeration() {
        // Should not panic even if no devices
        let _inputs = list_input_devices();
        let _outputs = list_output_devices();
    }
}
