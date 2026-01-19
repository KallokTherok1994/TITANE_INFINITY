// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 - ASR (SECURED)
//   Speech recognition with ShellGuard protection
// ═══════════════════════════════════════════════════════════════

use super::{AudioError, AudioResult};
use crate::security::shell_guard::ShellGuard;
use std::path::Path;
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

        // Implementation: Google Cloud Speech-to-Text API v1
        // - API: google-cloud-speech crate with RecognizeRequest
        // - Auth: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
        // - Config: RecognitionConfig {encoding: LINEAR16, sample_rate: 16000, language: "fr-FR"}
        // - Request: client.recognize(audio_bytes, config).await?
        // - Response: Parse SpeechRecognitionResult.alternatives[0].transcript
        // - Error handling: Retry on transient errors (503), fallback to Whisper on failures
        // - Cost optimization: Use StreamingRecognize for real-time, Recognize for offline
        // For now, return placeholder
        Err(AudioError::NotAvailable)
    }

    fn transcribe_whisper(&self, audio_data: &[u8]) -> AudioResult<String> {
        // ✅ SECURED: Use ShellGuard and proper path validation
        let temp_path = std::env::temp_dir().join("titane_asr.wav");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        // Use ShellGuard helper for Whisper
        let result = self
            .shell_guard
            .execute_asr_whisper(&temp_path)
            .map_err(|e| AudioError::ProcessingError(e))?;

        // Read transcription from output
        let txt_path = temp_path.with_extension("txt");
        let transcription = std::fs::read_to_string(txt_path).unwrap_or(result); // Fallback to stdout if no file

        Ok(transcription.trim().to_string())
    }

    fn transcribe_vosk(&self, audio_data: &[u8]) -> AudioResult<String> {
        // ✅ SECURED: Use ShellGuard
        let temp_path = std::env::temp_dir().join("titane_asr.wav");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| AudioError::ProcessingError(e.to_string()))?;

        let path_str = temp_path
            .to_str()
            .ok_or_else(|| AudioError::ProcessingError("Invalid temp path".into()))?;

        // NOTE: vosk-transcriber NOT in default whitelist, will fail unless added
        let output = self
            .shell_guard
            .execute_verified(
                "vosk-transcriber",
                &["-i", path_str, "-m", "/usr/share/vosk/models/vosk-model-fr"],
            )
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

    // ─────────────────────────────────────────────────────────────
    // ASRProvider Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_asr_provider_debug() {
        let providers = vec![ASRProvider::Google, ASRProvider::Whisper, ASRProvider::Vosk];
        for provider in providers {
            let debug_str = format!("{:?}", provider);
            assert!(!debug_str.is_empty());
        }
    }

    #[test]
    fn test_asr_provider_clone() {
        let provider = ASRProvider::Whisper;
        let cloned = provider;
        assert!(matches!(cloned, ASRProvider::Whisper));
    }

    #[test]
    fn test_asr_provider_copy() {
        let provider = ASRProvider::Vosk;
        let copied: ASRProvider = provider;
        assert!(matches!(copied, ASRProvider::Vosk));
    }

    // ─────────────────────────────────────────────────────────────
    // ASREngine Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_asr_engine_new_google() {
        let asr = ASREngine::new(ASRProvider::Google, Some("test-key".to_string()));
        assert!(matches!(asr.get_provider(), ASRProvider::Google));
    }

    #[test]
    fn test_asr_engine_new_whisper() {
        let asr = ASREngine::new(ASRProvider::Whisper, None);
        assert!(matches!(asr.get_provider(), ASRProvider::Whisper));
    }

    #[test]
    fn test_asr_engine_new_vosk() {
        let asr = ASREngine::new(ASRProvider::Vosk, None);
        assert!(matches!(asr.get_provider(), ASRProvider::Vosk));
    }

    #[test]
    fn test_asr_engine_auto() {
        let asr = ASREngine::auto();
        let provider = asr.get_provider();
        // Should be one of the valid providers
        assert!(matches!(
            provider,
            ASRProvider::Google | ASRProvider::Whisper | ASRProvider::Vosk
        ));
    }

    #[test]
    fn test_asr_engine_default() {
        let asr = ASREngine::default();
        // Default should be same as auto()
        let _ = asr.get_provider();
    }

    #[test]
    fn test_asr_engine_google_without_key() {
        let asr = ASREngine::new(ASRProvider::Google, None);
        // Google without API key should not be available
        assert!(!asr.is_available());
    }

    #[test]
    fn test_asr_engine_google_with_key() {
        let asr = ASREngine::new(ASRProvider::Google, Some("test-api-key".to_string()));
        // Google with API key should report available (even if key is invalid)
        assert!(asr.is_available());
    }

    #[test]
    fn test_asr_engine_get_provider() {
        let asr_google = ASREngine::new(ASRProvider::Google, None);
        let asr_whisper = ASREngine::new(ASRProvider::Whisper, None);
        let asr_vosk = ASREngine::new(ASRProvider::Vosk, None);

        assert!(matches!(asr_google.get_provider(), ASRProvider::Google));
        assert!(matches!(asr_whisper.get_provider(), ASRProvider::Whisper));
        assert!(matches!(asr_vosk.get_provider(), ASRProvider::Vosk));
    }

    #[tokio::test]
    async fn test_asr_transcribe_google_not_available() {
        let asr = ASREngine::new(ASRProvider::Google, None);
        let result = asr.transcribe(&[]).await;
        // Should return NotAvailable error
        assert!(result.is_err());
    }

    #[test]
    fn test_asr_whisper_empty_data() {
        let asr = ASREngine::new(ASRProvider::Whisper, None);
        // Even if whisper is not installed, the method should handle errors gracefully
        let _result = asr.transcribe_whisper(&[]);
    }
}
