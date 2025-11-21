// TITANE∞ v12 - Online TTS
// Google TTS and other cloud-based speech synthesis

use super::{TTSError, TTSRequest, TTSResult};
use std::process::Command;

pub struct OnlineTTS {
    api_key: Option<String>,
}

impl OnlineTTS {
    pub fn new(api_key: Option<String>) -> Self {
        Self { api_key }
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
        #[cfg(target_os = "linux")]
        {
            Command::new("paplay")
                .arg(path)
                .output()
                .or_else(|_| {
                    Command::new("aplay").arg(path).output()
                })
                .or_else(|_| {
                    Command::new("ffplay")
                        .args(&["-nodisp", "-autoexit"])
                        .arg(path)
                        .output()
                })
                .map_err(|e| TTSError::AudioError(format!("Failed to play audio: {}", e)))?;
        }

        #[cfg(target_os = "macos")]
        {
            Command::new("afplay")
                .arg(path)
                .output()
                .map_err(|e| TTSError::AudioError(format!("Failed to play audio: {}", e)))?;
        }

        #[cfg(target_os = "windows")]
        {
            Command::new("powershell")
                .args(&[
                    "-c",
                    &format!(
                        "(New-Object Media.SoundPlayer '{}').PlaySync();",
                        path.display()
                    ),
                ])
                .output()
                .map_err(|e| TTSError::AudioError(format!("Failed to play audio: {}", e)))?;
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
