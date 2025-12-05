// TITANE∞ v12 - Voice Activity Detection (VAD)
// Detects when user is speaking vs silence

use super::{AudioError, AudioResult};

const VAD_THRESHOLD: f32 = 0.02; // Energy threshold for speech detection
const VAD_MIN_SPEECH_FRAMES: usize = 10; // Minimum frames to consider as speech
const VAD_MIN_SILENCE_FRAMES: usize = 20; // Minimum silence frames to end speech

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum VADState {
    Silence,
    Speech,
}

pub struct VoiceActivityDetector {
    threshold: f32,
    min_speech_frames: usize,
    min_silence_frames: usize,
    state: VADState,
    speech_frame_count: usize,
    silence_frame_count: usize,
}

impl VoiceActivityDetector {
    pub fn new() -> Self {
        Self {
            threshold: VAD_THRESHOLD,
            min_speech_frames: VAD_MIN_SPEECH_FRAMES,
            min_silence_frames: VAD_MIN_SILENCE_FRAMES,
            state: VADState::Silence,
            speech_frame_count: 0,
            silence_frame_count: 0,
        }
    }

    pub fn with_threshold(mut self, threshold: f32) -> Self {
        self.threshold = threshold;
        self
    }

    pub fn with_sensitivity(mut self, speech_frames: usize, silence_frames: usize) -> Self {
        self.min_speech_frames = speech_frames;
        self.min_silence_frames = silence_frames;
        self
    }

    pub fn process_frame(&mut self, audio_data: &[f32]) -> VADState {
        let energy = self.calculate_energy(audio_data);
        let is_speech = energy > self.threshold;

        match self.state {
            VADState::Silence => {
                if is_speech {
                    self.speech_frame_count += 1;
                    if self.speech_frame_count >= self.min_speech_frames {
                        self.state = VADState::Speech;
                        self.silence_frame_count = 0;
                    }
                } else {
                    self.speech_frame_count = 0;
                }
            }
            VADState::Speech => {
                if is_speech {
                    self.silence_frame_count = 0;
                } else {
                    self.silence_frame_count += 1;
                    if self.silence_frame_count >= self.min_silence_frames {
                        self.state = VADState::Silence;
                        self.speech_frame_count = 0;
                    }
                }
            }
        }

        self.state
    }

    fn calculate_energy(&self, audio_data: &[f32]) -> f32 {
        if audio_data.is_empty() {
            return 0.0;
        }

        // Calculate RMS (Root Mean Square) energy
        let sum_squares: f32 = audio_data.iter().map(|&sample| sample * sample).sum();
        (sum_squares / audio_data.len() as f32).sqrt()
    }

    pub fn get_state(&self) -> VADState {
        self.state
    }

    pub fn reset(&mut self) {
        self.state = VADState::Silence;
        self.speech_frame_count = 0;
        self.silence_frame_count = 0;
    }

    pub fn is_speaking(&self) -> bool {
        self.state == VADState::Speech
    }
}

impl Default for VoiceActivityDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vad_silence() {
        let mut vad = VoiceActivityDetector::new();
        let silence = vec![0.0f32; 1024];

        for _ in 0..30 {
            let state = vad.process_frame(&silence);
            assert_eq!(state, VADState::Silence);
        }
    }

    #[test]
    fn test_vad_speech() {
        let mut vad = VoiceActivityDetector::new();
        let speech: Vec<f32> = (0..1024).map(|i| (i as f32 * 0.01).sin() * 0.1).collect();

        let mut speech_detected = false;
        for _ in 0..30 {
            let state = vad.process_frame(&speech);
            if state == VADState::Speech {
                speech_detected = true;
                break;
            }
        }

        assert!(speech_detected);
    }

    #[test]
    fn test_vad_energy_calculation() {
        let vad = VoiceActivityDetector::new();
        let samples = vec![0.1, 0.2, 0.1, 0.2];
        let energy = vad.calculate_energy(&samples);
        assert!(energy > 0.0);
    }
}
