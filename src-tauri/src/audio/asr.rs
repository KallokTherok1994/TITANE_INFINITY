// TITANE∞ v12 - Automatic Speech Recognition (ASR)
// Hybrid online (Google) + offline (Whisper) speech-to-text

use super::{AudioError, AudioResult};
use std::process::Command;
use std::time::Duration;

#[derive(Debug, Clone, Copy)]
pub enum ASRProvider {
    Google,
    Whisper,
    Vosk,
}

pub struct ASREngine {
    provider: ASRProvider,
    api_key: Option<String>,
}

impl ASREngine {
    pub fn new(provider: ASRProvider, api_key: Option<String>) -> Self {
        Self { provider, api_key }
    }

    pub fn auto() -> Self {
        // Auto-detect best available provider
        let provider = if Self::is_whisper_available() {
            ASRProvider::Whisper
        } else if Self::is_vosk_available() {
            ASRProvider::Vosk
        } else {
            ASRProvider::Google
        };

        Self {
            provider,
            api_key: None,
        }
    }

    fn is_whisper_available() -> bool {
        Command::new("which")
            .arg("whisper")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    fn is_vosk_available() -> bool {
        // Check if vosk-cli is available
        Command::new("which")
            .arg("vosk-transcriber")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    pub async fn transcribe(&self, audio_data: &[u8]) -> AudioResult<String> {
        match self.provider {
            ASRProvider::Google => self.transcribe_google(audio_data).await,
            ASRProvider::Whisper => self.transcribe_whisper(audio_data),
            ASRProvider::Vosk => self.transcribe_vosk(audio_data),
        }
    }

    async fn transcribe_google(&self, audio_data: &[u8]) -> AudioResult<String> {
        // Google Speech-to-Text API
        // This is a simplified implementation
        // In production, use proper Google Cloud Speech API

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        // For now, return placeholder
        // TODO: Implement proper Google Speech API
        Err(AudioError::NotAvailable)
    }

    fn transcribe_whisper(&self, audio_data: &[u8]) -> AudioResult<String> {
        // Save audio to temporary file
        let temp_path = std::env::temp_dir().join("titane_asr.wav");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        // Run Whisper
        let output = Command::new("whisper")
            .arg(&temp_path)
            .arg("--model")
            .arg("base")
            .arg("--language")
            .arg("fr")
            .arg("--output_format")
            .arg("txt")
            .output()
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        if !output.status.success() {
            return Err(AudioError::ProcessingError(
                String::from_utf8_lossy(&output.stderr).to_string(),
            ));
        }

        // Read transcription
        let txt_path = temp_path.with_extension("txt");
        let transcription = std::fs::read_to_string(txt_path)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        Ok(transcription.trim().to_string())
    }

    fn transcribe_vosk(&self, audio_data: &[u8]) -> AudioResult<String> {
        // Vosk offline ASR
        let temp_path = std::env::temp_dir().join("titane_asr.wav");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        let output = Command::new("vosk-transcriber")
            .arg("-i")
            .arg(&temp_path)
            .arg("-m")
            .arg("/usr/share/vosk/models/vosk-model-fr")
            .output()
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        if !output.status.success() {
            return Err(AudioError::ProcessingError(
                "Vosk transcription failed".to_string(),
            ));
        }

        let transcription = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(transcription.trim().to_string())
    }

    pub fn get_provider(&self) -> ASRProvider {
        self.provider
    }

    pub fn is_available(&self) -> bool {
        match self.provider {
            ASRProvider::Google => self.api_key.is_some(),
            ASRProvider::Whisper => Self::is_whisper_available(),
            ASRProvider::Vosk => Self::is_vosk_available(),
        }
    }
}

impl Default for ASREngine {
    fn default() -> Self {
        Self::auto()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_asr_creation() {
        let asr = ASREngine::auto();
        // Should not panic
        let _ = asr.is_available();
    }

    #[test]
    fn test_asr_provider_detection() {
        let asr = ASREngine::auto();
        let provider = asr.get_provider();
        // Should return some provider
        let _ = format!("{:?}", provider);
    }
}
