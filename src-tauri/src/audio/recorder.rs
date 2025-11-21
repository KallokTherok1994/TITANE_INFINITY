// TITANE∞ v12 - Audio Recorder
// Continuous microphone recording with circular buffer

use super::{AudioConfig, AudioError, AudioResult};
use std::sync::{Arc, Mutex};

const BUFFER_SIZE: usize = 16000 * 10; // 10 seconds at 16kHz

pub struct AudioRecorder {
    config: AudioConfig,
    buffer: Arc<Mutex<CircularBuffer>>,
    is_recording: Arc<Mutex<bool>>,
}

struct CircularBuffer {
    data: Vec<f32>,
    capacity: usize,
    write_pos: usize,
    read_pos: usize,
}

impl CircularBuffer {
    fn new(capacity: usize) -> Self {
        Self {
            data: vec![0.0; capacity],
            capacity,
            write_pos: 0,
            read_pos: 0,
        }
    }

    fn write(&mut self, samples: &[f32]) {
        for &sample in samples {
            self.data[self.write_pos] = sample;
            self.write_pos = (self.write_pos + 1) % self.capacity;
        }
    }

    fn read(&mut self, count: usize) -> Vec<f32> {
        let mut result = Vec::with_capacity(count);
        for _ in 0..count.min(self.capacity) {
            result.push(self.data[self.read_pos]);
            self.read_pos = (self.read_pos + 1) % self.capacity;
        }
        result
    }

    fn get_last_n(&self, count: usize) -> Vec<f32> {
        let count = count.min(self.capacity);
        let mut result = Vec::with_capacity(count);
        let mut pos = if self.write_pos >= count {
            self.write_pos - count
        } else {
            self.capacity + self.write_pos - count
        };

        for _ in 0..count {
            result.push(self.data[pos]);
            pos = (pos + 1) % self.capacity;
        }

        result
    }

    fn clear(&mut self) {
        self.data.fill(0.0);
        self.write_pos = 0;
        self.read_pos = 0;
    }
}

impl AudioRecorder {
    pub fn new(config: AudioConfig) -> Self {
        Self {
            config,
            buffer: Arc::new(Mutex::new(CircularBuffer::new(BUFFER_SIZE))),
            is_recording: Arc::new(Mutex::new(false)),
        }
    }

    pub fn start(&self) -> AudioResult<()> {
        let mut recording = self.is_recording.lock().unwrap();
        if *recording {
            return Ok(()); // Already recording
        }

        *recording = true;

        // In a real implementation, this would start capturing from microphone
        // using cpal or similar audio library
        log::info!("Audio recording started");

        Ok(())
    }

    pub fn stop(&self) -> AudioResult<()> {
        let mut recording = self.is_recording.lock().unwrap();
        *recording = false;

        log::info!("Audio recording stopped");
        Ok(())
    }

    pub fn is_recording(&self) -> bool {
        *self.is_recording.lock().unwrap()
    }

    pub fn get_audio_chunk(&self, duration_ms: u32) -> AudioResult<Vec<f32>> {
        let samples_count = (self.config.sample_rate * duration_ms / 1000) as usize;
        let buffer = self.buffer.lock().unwrap();
        Ok(buffer.get_last_n(samples_count))
    }

    pub fn clear_buffer(&self) {
        let mut buffer = self.buffer.lock().unwrap();
        buffer.clear();
    }

    // Simulate audio input for testing
    pub fn simulate_audio(&self, samples: Vec<f32>) {
        let mut buffer = self.buffer.lock().unwrap();
        buffer.write(&samples);
    }

    pub fn get_config(&self) -> &AudioConfig {
        &self.config
    }
}

impl Default for AudioRecorder {
    fn default() -> Self {
        Self::new(AudioConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recorder_creation() {
        let recorder = AudioRecorder::new(AudioConfig::default());
        assert!(!recorder.is_recording());
    }

    #[test]
    fn test_recorder_start_stop() {
        let recorder = AudioRecorder::new(AudioConfig::default());
        recorder.start().unwrap();
        assert!(recorder.is_recording());
        recorder.stop().unwrap();
        assert!(!recorder.is_recording());
    }

    #[test]
    fn test_circular_buffer() {
        let mut buffer = CircularBuffer::new(10);
        buffer.write(&[1.0, 2.0, 3.0]);
        let data = buffer.get_last_n(3);
        assert_eq!(data, vec![1.0, 2.0, 3.0]);
    }

    #[test]
    fn test_circular_buffer_wrap() {
        let mut buffer = CircularBuffer::new(5);
        buffer.write(&[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]);
        let data = buffer.get_last_n(5);
        assert_eq!(data, vec![3.0, 4.0, 5.0, 6.0, 7.0]);
    }
}
