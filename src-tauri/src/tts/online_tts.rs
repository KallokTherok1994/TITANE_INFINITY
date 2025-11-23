// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 - Online TTS (SECURED)
//   Cloud TTS with ShellGuard protection
// ═══════════════════════════════════════════════════════════════

use super::{TTSError, TTSRequest, TTSResult};
use crate::security::shell_guard::ShellGuard;

pub struct OnlineTTS {
    api_key: Option<String>,
    shell_guard: ShellGuard,
}

impl OnlineTTS {
    pub fn new(api_key: Option<String>) -> Self {
        Self {
            api_key,
            shell_guard: ShellGuard::new(),
        }
    }

    pub async fn is_available(&self) -> bool {
        // Check internet connectivity
        tokio::time::timeout(
            std::time::Duration::from_secs(3),
            reqwest::get("https://www.google.com"),
        )
        .await
        .is_ok()
    }

    pub async fn synthesize(&self, request: &TTSRequest) -> TTSResult<Vec<u8>> {
        if !self.is_available().await {
            return Err(TTSError::NetworkError(
                "No internet connection".to_string(),
            ));
        }

        // Use Google TTS API
        // For now, using a simple implementation
        // In production, use proper Google Cloud TTS API

        let url = format!(
            "https://translate.google.com/translate_tts?ie=UTF-8&tl=fr&client=tw-ob&q={}",
            urlencoding::encode(&request.text)
        );

        let response = reqwest::get(&url)
            .await
            .map_err(|e| TTSError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(TTSError::NetworkError(format!(
                "API error: {}",
                response.status()
            )));
        }

        let audio_data = response
            .bytes()
            .await
            .map_err(|e| TTSError::NetworkError(e.to_string()))?
            .to_vec();

        Ok(audio_data)
    }

    pub async fn speak(&self, request: &TTSRequest) -> TTSResult<()> {
        let audio_data = self.synthesize(request).await?;

        // Write to temporary file and play
        let temp_path = std::env::temp_dir().join("titane_tts.mp3");
        std::fs::write(&temp_path, audio_data)
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        // Play using system audio player
        self.play_audio(&temp_path)?;

        Ok(())
    }

    fn play_audio(&self, path: &std::path::Path) -> TTSResult<()> {
        // ✅ SECURED: Use ShellGuard for audio playback
        let path_str = path.to_str()
            .ok_or_else(|| TTSError::AudioError("Invalid path encoding".into()))?;

        #[cfg(target_os = "linux")]
        {
            // Try pactl first (most common), fallback to alternatives
            if let Ok(_) = self.shell_guard.execute_verified("pactl", &["play-file", path_str]) {
                return Ok(());
            }

            // Note: aplay, ffplay NOT in default whitelist
            // This will fail unless added to SecurityPolicy.allowed_shell_commands
            if self.shell_guard.is_command_available("aplay") {
                if let Ok(_) = self.shell_guard.execute_verified("aplay", &[path_str]) {
                    return Ok(());
                }
            }

            return Err(TTSError::AudioError(
                "No audio player available (pactl required)".into()
            ));
        }

        #[cfg(target_os = "macos")]
        {
            // Note: afplay NOT in default whitelist
            self.shell_guard
                .execute_verified("afplay", &[path_str])
                .map_err(|e| TTSError::AudioError(e))?;
        }

        #[cfg(target_os = "windows")]
        {
            // Note: powershell NOT in default whitelist, and -c flag is dangerous
            // Alternative: Use Windows API directly (winapi crate)
            return Err(TTSError::AudioError(
                "Windows audio playback requires native API (powershell blocked for security)".into()
            ));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_online_tts_creation() {
        let tts = OnlineTTS::new(None);
        // Should not panic
        let _ = tts.is_available().await;
    }
}
