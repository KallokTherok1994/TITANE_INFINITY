// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — AUDIO CAPTURE ENGINE
//   Real-time microphone capture with cpal
//   Features: Ring buffer, VAD integration, Multi-format export
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────── 
//  REAL IMPLEMENTATION when audio-capture feature is ACTIVE
// ───────────────────────────────────────────────

#[cfg(feature = "audio-capture")]
use super::{AudioConfig, AudioError, AudioResult};
#[cfg(feature = "audio-capture")]
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
#[cfg(feature = "audio-capture")]
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
#[cfg(feature = "audio-capture")]
use std::time::Duration;

#[cfg(feature = "audio-capture")]
pub struct AudioCaptureState {
    buffer: Arc<Mutex<RingBuffer>>,
    is_capturing: Arc<AtomicBool>,
    config: AudioConfig,
    stream: Option<cpal::Stream>,
}

#[cfg(feature = "audio-capture")]
struct RingBuffer {
    data: Vec<f32>,
    capacity: usize,
    write_pos: usize,
    samples_written: usize,
}

#[cfg(feature = "audio-capture")]
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
        if count == 0 { return Vec::new(); }
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

#[cfg(feature = "audio-capture")]
impl AudioCaptureState {
    pub fn new() -> Self {
        Self::with_config(AudioConfig::default())
    }

    pub fn with_config(config: AudioConfig) -> Self {
        let buffer_size = (config.sample_rate as usize) * 30;
        Self {
            buffer: Arc::new(Mutex::new(RingBuffer::new(buffer_size))),
            is_capturing: Arc::new(AtomicBool::new(false)),
            config,
            stream: None,
        }
    }

    pub fn start_capture(&mut self) -> AudioResult<()> {
        if self.is_capturing.load(Ordering::SeqCst) { return Ok(()); }
        let host = cpal::default_host();
        let device = host.default_input_device()
            .ok_or_else(|| AudioError::DeviceError("No input device".into()))?;
        let supported_config = device.default_input_config()
            .map_err(|e| AudioError::DeviceError(format!("No config: {}", e)))?;
        let buffer = self.buffer.clone();
        let is_capturing = self.is_capturing.clone();
        let stream = match supported_config.sample_format() {
            cpal::SampleFormat::F32 => self.build_stream::<f32>(&device, &supported_config.into(), buffer, is_capturing.clone()),
            cpal::SampleFormat::I16 => self.build_stream::<i16>(&device, &supported_config.into(), buffer, is_capturing.clone()),
            cpal::SampleFormat::U16 => self.build_stream::<u16>(&device, &supported_config.into(), buffer, is_capturing.clone()),
            _ => Err(AudioError::DeviceError("Unsupported format".into())),
        }?;
        stream.play().map_err(|e| AudioError::RecordingError(format!("Stream fail: {}", e)))?;
        self.stream = Some(stream);
        self.is_capturing.store(true, Ordering::SeqCst);
        Ok(())
    }

    fn build_stream<T: cpal::Sample + cpal::SizedSample + Send + 'static>(
        &self,
        device: &cpal::Device,
        config: &cpal::StreamConfig,
        buffer: Arc<Mutex<RingBuffer>>,
        is_capturing: Arc<AtomicBool>,
    ) -> AudioResult<cpal::Stream>
    where f32: cpal::FromSample<T>,
    {
        let err_fn = |err| log::error!("[AudioCapture] Error: {}", err);
        device.build_input_stream(
            config,
            move |data: &[T], _: &cpal::InputCallbackInfo| {
                if !is_capturing.load(Ordering::SeqCst) { return; }
                let samples: Vec<f32> = data.iter().map(|&s| cpal::Sample::from_sample(s)).collect();
                if let Ok(mut buf) = buffer.lock() { buf.write(&samples); }
            },
            err_fn,
            None,
        ).map_err(|e| AudioError::RecordingError(format!("Build failed: {}", e)))
    }

    pub fn stop_capture(&mut self) -> AudioResult<()> {
        if !self.is_capturing.load(Ordering::SeqCst) { return Ok(()); }
        self.is_capturing.store(false, Ordering::SeqCst);
        self.stream = None;
        Ok(())
    }

    pub fn is_capturing(&self) -> bool {
        self.is_capturing.load(Ordering::SeqCst)
    }

    pub fn get_audio_chunk(&self, duration_ms: u32) -> AudioResult<Vec<f32>> {
        let samples_count = (self.config.sample_rate * duration_ms / 1000) as usize;
        let buffer = self.buffer.lock()
            .map_err(|e| AudioError::ProcessingError(format!("Lock: {}", e)))?;
        Ok(buffer.get_last_n(samples_count))
    }

    pub fn get_all_audio(&self) -> AudioResult<Vec<f32>> {
        let buffer = self.buffer.lock()
            .map_err(|e| AudioError::ProcessingError(format!("Lock: {}", e)))?;
        let total = buffer.total_samples().min(buffer.capacity);
        Ok(buffer.get_last_n(total))
    }

    pub fn clear_buffer(&self) {
        if let Ok(mut buffer) = self.buffer.lock() { buffer.clear(); }
    }

    pub fn export_wav(&self, path: &std::path::Path) -> AudioResult<()> {
        let samples = self.get_all_audio()?;
        if samples.is_empty() { return Err(AudioError::ProcessingError("No data".into())); }
        let spec = hound::WavSpec {
            channels: self.config.channels,
            sample_rate: self.config.sample_rate,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };
        let mut writer = hound::WavWriter::create(path, spec)
            .map_err(|e| AudioError::ProcessingError(format!("WAV create: {}", e)))?;
        for sample in samples {
            let sample_i16 = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
            writer.write_sample(sample_i16).map_err(|e| {
                AudioError::ProcessingError(format!("WAV write: {}", e))
            })?;
        }
        writer.finalize()
            .map_err(|e| AudioError::ProcessingError(format!("WAV finalize: {}", e)))?;
        Ok(())
    }

    pub fn export_raw_bytes(&self) -> AudioResult<Vec<u8>> {
        let samples = self.get_all_audio()?;
        let mut bytes = Vec::with_capacity(samples.len() * 2);
        for sample in samples {
            let sample_i16 = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
            bytes.extend_from_slice(&sample_i16.to_le_bytes());
        }
        Ok(bytes)
    }

    pub fn get_config(&self) -> &AudioConfig { &self.config }

   pub fn total_samples(&self) -> usize {
        self.buffer.lock().map(|buf| buf.total_samples()).unwrap_or(0)
    }

    pub fn capture_duration_ms(&self) -> u64 {
        let samples = self.total_samples();
        (samples as u64 * 1000) / (self.config.sample_rate as u64)
    }
}

#[cfg(feature = "audio-capture")]
impl Default for AudioCaptureState {
    fn default() -> Self { Self::new() }
}

#[cfg(feature = "audio-capture")]
impl Drop for AudioCaptureState {
    fn drop(&mut self) { let _ = self.stop_capture(); }
}

#[cfg(feature = "audio-capture")]
pub fn list_input_devices() -> Vec<String> {
    let host = cpal::default_host();
    host.input_devices()
        .map(|devices| devices.filter_map(|d| d.name().ok()).collect())
        .unwrap_or_default()
}

#[cfg(feature = "audio-capture")]
pub fn list_output_devices() -> Vec<String> {
    let host = cpal::default_host();
    host.output_devices()
        .map(|devices| devices.filter_map(|d| d.name().ok()).collect())
        .unwrap_or_default()
}

#[cfg(feature = "audio-capture")]
pub fn default_input_device_name() -> Option<String> {
    let host = cpal::default_host();
    host.default_input_device().and_then(|d| d.name().ok())
}

#[cfg(feature = "audio-capture")]
pub fn default_output_device_name() -> Option<String> {
    let host = cpal::default_host();
    host.default_output_device().and_then(|d| d.name().ok())
}

// ───────────────────────────────────────────────
//  STUBS when audio-capture feature is NOT active
// ───────────────────────────────────────────────

#[cfg(not(feature = "audio-capture"))]
pub struct AudioCaptureState;

#[cfg(not(feature = "audio-capture"))]
impl AudioCaptureState {
    pub fn new() -> Self { Self }
    pub fn is_capturing(&self) -> bool { false }
}

#[cfg(not(feature = "audio-capture"))]
impl Default for AudioCaptureState {
    fn default() -> Self { Self::new() }
}

#[cfg(not(feature = "audio-capture"))]
pub fn list_input_devices() -> Vec<String> { Vec::new() }

#[cfg(not(feature = "audio-capture"))]
pub fn list_output_devices() -> Vec<String> { Vec::new() }

#[cfg(not(feature = "audio-capture"))]
pub fn default_input_device_name() -> Option<String> { None }

#[cfg(not(feature = "audio-capture"))]
pub fn default_output_device_name() -> Option<String> { None }

// ─────────────────────────────────────────────────────────────────
//  Tests
// ─────────────────────────────────────────────────────────────────

#[cfg(all(test, feature = "audio-capture"))]
mod tests {
    use super::*;

    #[test]
    fn test_ring_buffer() {
        let mut buffer = RingBuffer::new(10);
        buffer.write(&[1.0, 2.0, 3.0]);
        assert_eq!(buffer.get_last_n(3), vec![1.0, 2.0, 3.0]);
    }

    #[test]
    fn test_device_enum() {
        let _ = list_input_devices();
        let _ = list_output_devices();
    }
}
