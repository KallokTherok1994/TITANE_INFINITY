// TITANE∞ v12 - Local TTS
// Offline text-to-speech using local engines (Coqui, Piper, espeak)

use super::{TTSError, TTSRequest, TTSResult};
use std::process::Command;

pub struct LocalTTS {
    engine: TTSEngine,
}

#[derive(Debug, Clone)]
pub enum TTSEngine {
    Espeak,
    Festival,
    Piper,
    Coqui,
}

impl LocalTTS {
    pub fn new() -> Self {
        // Auto-detect available TTS engine
        let engine = Self::detect_engine();
        Self { engine }
    }

    fn detect_engine() -> TTSEngine {
        if Self::is_command_available("piper") {
            TTSEngine::Piper
        } else if Self::is_command_available("espeak") {
            TTSEngine::Espeak
        } else if Self::is_command_available("festival") {
            TTSEngine::Festival
        } else {
            TTSEngine::Espeak // Default fallback
        }
    }

    fn is_command_available(command: &str) -> bool {
        Command::new("which")
            .arg(command)
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    pub fn is_available(&self) -> bool {
        match self.engine {
            TTSEngine::Espeak => Self::is_command_available("espeak"),
            TTSEngine::Festival => Self::is_command_available("festival"),
            TTSEngine::Piper => Self::is_command_available("piper"),
            TTSEngine::Coqui => Self::is_command_available("tts"),
        }
    }

    pub fn speak(&self, request: &TTSRequest) -> TTSResult<()> {
        match self.engine {
            TTSEngine::Espeak => self.speak_espeak(request),
            TTSEngine::Festival => self.speak_festival(request),
            TTSEngine::Piper => self.speak_piper(request),
            TTSEngine::Coqui => self.speak_coqui(request),
        }
    }

    fn speak_espeak(&self, request: &TTSRequest) -> TTSResult<()> {
        let speed = (request.speed * 175.0) as u32; // espeak speed range
        let pitch = (request.pitch * 50.0) as u32; // espeak pitch range

        Command::new("espeak")
            .arg("-v")
            .arg("fr") // French voice
            .arg("-s")
            .arg(speed.to_string())
            .arg("-p")
            .arg(pitch.to_string())
            .arg(&request.text)
            .output()
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        Ok(())
    }

    fn speak_festival(&self, request: &TTSRequest) -> TTSResult<()> {
        // Festival doesn't support direct text input easily
        // Write to temp file
        let temp_path = std::env::temp_dir().join("titane_tts.txt");
        std::fs::write(&temp_path, &request.text)
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        Command::new("festival")
            .arg("--tts")
            .arg(&temp_path)
            .output()
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        Ok(())
    }

    fn speak_piper(&self, request: &TTSRequest) -> TTSResult<()> {
        // Piper TTS (fast neural TTS)
        let output_path = std::env::temp_dir().join("titane_tts.wav");

        Command::new("sh")
            .arg("-c")
            .arg(format!(
                "echo '{}' | piper --model fr_FR-siwis-medium --output_file {}",
                request.text,
                output_path.display()
            ))
            .output()
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        // Play the generated audio
        #[cfg(target_os = "linux")]
        Command::new("paplay")
            .arg(&output_path)
            .output()
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        Ok(())
    }

    fn speak_coqui(&self, request: &TTSRequest) -> TTSResult<()> {
        // Coqui TTS
        Command::new("tts")
            .arg("--text")
            .arg(&request.text)
            .arg("--language_idx")
            .arg("fr")
            .arg("--out_path")
            .arg("/tmp/titane_tts.wav")
            .output()
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        Ok(())
    }

    pub fn get_engine_name(&self) -> String {
        format!("{:?}", self.engine)
    }
}

impl Default for LocalTTS {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_local_tts_creation() {
        let tts = LocalTTS::new();
        // Should not panic
        let _ = tts.is_available();
    }

    #[test]
    fn test_engine_detection() {
        let engine = LocalTTS::detect_engine();
        // Should return some engine
        let _ = format!("{:?}", engine);
    }
}
