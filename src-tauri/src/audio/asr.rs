// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 - ASR (SECURED)
//   Speech recognition with ShellGuard protection
// ═══════════════════════════════════════════════════════════════

use super::{AudioError, AudioResult};
use crate::security::shell_guard::ShellGuard;
use std::time::Duration;
use std::path::Path;

#[derive(Debug, Clone, Copy)]
pub enum ASRProvider {
    Google,
    Whisper,
    Vosk,
}

pub struct ASREngine {
    provider: ASRProvider,
    api_key: Option<String>,
    shell_guard: ShellGuard,
}

impl ASREngine {
    pub fn new(provider: ASRProvider, api_key: Option<String>) -> Self {
        Self {
            provider,
            api_key,
            shell_guard: ShellGuard::new(),
        }
    }

    pub fn auto() -> Self {
        let shell_guard = ShellGuard::new();
        // Auto-detect best available provider
        let provider = if shell_guard.is_command_available("whisper") {
            ASRProvider::Whisper
        } else if shell_guard.is_command_available("vosk-transcriber") {
            ASRProvider::Vosk
        } else {
            ASRProvider::Google
        };

        Self {
            provider,
            api_key: None,
            shell_guard,
        }
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
        // ✅ SECURED: Use ShellGuard and proper path validation
        let temp_path = std::env::temp_dir().join("titane_asr.wav");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        // Use ShellGuard helper for Whisper
        let result = self.shell_guard
            .execute_asr_whisper(&temp_path)
            .map_err(|e| AudioError::ProcessingError(e))?;

        // Read transcription from output
        let txt_path = temp_path.with_extension("txt");
        let transcription = std::fs::read_to_string(txt_path)
            .unwrap_or(result); // Fallback to stdout if no file

        Ok(transcription.trim().to_string())
    }

    fn transcribe_vosk(&self, audio_data: &[u8]) -> AudioResult<String> {
        // ✅ SECURED: Use ShellGuard
        let temp_path = std::env::temp_dir().join("titane_asr.wav");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        let path_str = temp_path.to_str()
            .ok_or_else(|| AudioError::ProcessingError("Invalid temp path".into()))?;

        // NOTE: vosk-transcriber NOT in default whitelist, will fail unless added
        let output = self.shell_guard
            .execute_verified("vosk-transcriber", &[
                "-i", path_str,
                "-m", "/usr/share/vosk/models/vosk-model-fr"
            ])
            .map_err(|e| AudioError::ProcessingError(e))?;

        Ok(output.trim().to_string())
    }

    pub fn get_provider(&self) -> ASRProvider {
        self.provider
    }

    pub fn is_available(&self) -> bool {
        match self.provider {
            ASRProvider::Google => self.api_key.is_some(),
            ASRProvider::Whisper => self.shell_guard.is_command_available("whisper"),
            ASRProvider::Vosk => self.shell_guard.is_command_available("vosk-transcriber"),
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
