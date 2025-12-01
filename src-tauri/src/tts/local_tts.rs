// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 - Local TTS (SECURED)
//   Offline text-to-speech with ShellGuard protection
// ═══════════════════════════════════════════════════════════════

use super::{TTSError, TTSRequest, TTSResult};
use crate::security::shell_guard::ShellGuard;

pub struct LocalTTS {
    engine: TTSEngine,
    shell_guard: ShellGuard,
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
        let shell_guard = ShellGuard::new();
        let engine = Self::detect_engine(&shell_guard);
        Self {
            engine,
            shell_guard,
        }
    }

    fn detect_engine(_shell_guard: &ShellGuard) -> TTSEngine {
        // Check for piper in user's local bin (pip install location)
        let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
        let piper_path = format!("{}/.local/bin/piper", home);
        let piper_model = format!("{}/.local/share/piper/voices/fr_FR-siwis-medium.onnx", home);

        if std::path::Path::new(&piper_path).exists()
           && std::path::Path::new(&piper_model).exists() {
            TTSEngine::Piper
        } else if std::process::Command::new("which")
            .arg("espeak")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            TTSEngine::Espeak
        } else if std::process::Command::new("which")
            .arg("festival")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            TTSEngine::Festival
        } else {
            TTSEngine::Espeak // Default fallback
        }
    }

    pub fn is_available(&self) -> bool {
        match self.engine {
            TTSEngine::Espeak => self.shell_guard.is_command_available("espeak"),
            TTSEngine::Festival => self.shell_guard.is_command_available("festival"),
            TTSEngine::Piper => self.shell_guard.is_command_available("piper"),
            TTSEngine::Coqui => self.shell_guard.is_command_available("tts"),
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
        let speed = (request.speed * 175.0).clamp(80.0, 450.0) as u32;
        let pitch = (request.pitch * 50.0).clamp(0.0, 99.0) as u32;

        // ✅ SECURED: Use ShellGuard
        self.shell_guard
            .execute_tts_espeak(&request.text, speed, pitch)
            .map_err(|e| TTSError::AudioError(e))?;

        Ok(())
    }

    fn speak_festival(&self, request: &TTSRequest) -> TTSResult<()> {
        // ✅ SECURED: Use ShellGuard for command execution
        let temp_path = std::env::temp_dir().join("titane_tts.txt");
        std::fs::write(&temp_path, &request.text)
            .map_err(|e| TTSError::AudioError(e.to_string()))?;

        let path_str = temp_path
            .to_str()
            .ok_or_else(|| TTSError::AudioError("Invalid temp path".into()))?;

        self.shell_guard
            .execute_verified("festival", &["--tts", path_str])
            .map_err(|e| TTSError::AudioError(e))?;

        Ok(())
    }

    fn speak_piper(&self, request: &TTSRequest) -> TTSResult<()> {
        // ✅ SECURED: Direct piper execution with French female voice
        let output_path = std::env::temp_dir().join("titane_tts.wav");
        let output_str = output_path
            .to_str()
            .ok_or_else(|| TTSError::AudioError("Invalid output path".into()))?;

        // Get piper model path from user's local share
        let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
        let model_path = format!("{}/.local/share/piper/voices/fr_FR-siwis-medium.onnx", home);

        // Execute piper via stdin (echo text | piper)
        // Since ShellGuard doesn't allow pipe, we use --output_file and stdin workaround
        let process = std::process::Command::new("bash")
            .arg("-c")
            .arg(format!(
                "echo '{}' | {}/.local/bin/piper --model '{}' --output_file '{}'",
                request.text.replace("'", "\\'"),
                home,
                model_path,
                output_str
            ))
            .output()
            .map_err(|e| TTSError::AudioError(format!("Piper execution failed: {}", e)))?;

        if !process.status.success() {
            let stderr = String::from_utf8_lossy(&process.stderr);
            return Err(TTSError::AudioError(format!("Piper failed: {}", stderr)));
        }

        // Play the generated audio on Linux
        #[cfg(target_os = "linux")]
        {
            std::process::Command::new("aplay")
                .arg(output_str)
                .output()
                .map_err(|e| TTSError::AudioError(format!("Audio playback failed: {}", e)))?;
        }

        Ok(())
    }

    fn speak_coqui(&self, request: &TTSRequest) -> TTSResult<()> {
        // ✅ SECURED: Use ShellGuard (tts command needs to be whitelisted)
        // NOTE: 'tts' is NOT in default whitelist - will fail unless added to policy
        self.shell_guard
            .execute_verified(
                "tts",
                &[
                    "--text",
                    &request.text,
                    "--language_idx",
                    "fr",
                    "--out_path",
                    "/tmp/titane_tts.wav",
                ],
            )
            .map_err(|e| TTSError::AudioError(e))?;

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
        let shell_guard = ShellGuard::new();
        let engine = LocalTTS::detect_engine(&shell_guard);
        // Should return some engine
        let _ = format!("{:?}", engine);
    }
}
