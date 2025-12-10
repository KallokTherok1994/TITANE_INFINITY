use std::sync::Arc;

use tokio::sync::RwLock;

use serde::{Deserialize, Serialize};

use crate::tts::local_tts::LocalTTS;
use crate::tts::online_tts::OnlineTTS;
use crate::tts::{TTSRequest, TTSResult};

use super::errors::ChatEngineError;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SpeechMode {
    Auto,
    Online,
    Local,
}

#[derive(Debug, Clone)]
pub struct SpeechTask {
    pub text: String,
    pub voice: Option<String>,
    pub speed: f32,
    pub pitch: f32,
    pub mode: SpeechMode,
}

impl Default for SpeechTask {
    fn default() -> Self {
        Self {
            text: String::new(),
            voice: None,
            speed: 1.0,
            pitch: 1.0,
            mode: SpeechMode::Auto,
        }
    }
}

pub struct SpeechOrchestrator {
    online: Arc<RwLock<OnlineTTS>>,
    local: Arc<RwLock<LocalTTS>>,
    auto_enabled: bool,
}

impl SpeechOrchestrator {
    pub fn new(
        online: Arc<RwLock<OnlineTTS>>,
        local: Arc<RwLock<LocalTTS>>,
        auto_enabled: bool,
    ) -> Self {
        Self {
            online,
            local,
            auto_enabled,
        }
    }

    pub fn auto_enabled(&self) -> bool {
        self.auto_enabled
    }

    pub fn set_auto_enabled(&mut self, enabled: bool) {
        self.auto_enabled = enabled;
    }

    pub async fn speak(&self, task: SpeechTask) -> Result<(), ChatEngineError> {
        if task.text.trim().is_empty() {
            return Err(ChatEngineError::InvalidInput(
                "Cannot synthesize empty text".to_string(),
            ));
        }

        let mode = match task.mode {
            SpeechMode::Auto => {
                let online_available = self.online.read().await.is_available().await;
                if online_available {
                    SpeechMode::Online
                } else {
                    SpeechMode::Local
                }
            }
            other => other,
        };

        let request = TTSRequest {
            text: task.text,
            voice: task.voice,
            speed: task.speed.clamp(0.5, 2.0),
            pitch: task.pitch.clamp(0.5, 2.0),
        };

        match mode {
            SpeechMode::Online => {
                let online = self.online.read().await;
                wrap_tts_result(online.speak(&request).await)
            }
            SpeechMode::Local => {
                let local = self.local.read().await;
                wrap_tts_result(local.speak(&request))
            }
            SpeechMode::Auto => unreachable!("Auto mode handled above"),
        }
    }
}

fn wrap_tts_result(result: TTSResult<()>) -> Result<(), ChatEngineError> {
    result.map_err(ChatEngineError::from)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // SpeechMode Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_speech_mode_auto() {
        let mode = SpeechMode::Auto;
        assert!(matches!(mode, SpeechMode::Auto));
    }

    #[test]
    fn test_speech_mode_online() {
        let mode = SpeechMode::Online;
        assert!(matches!(mode, SpeechMode::Online));
    }

    #[test]
    fn test_speech_mode_local() {
        let mode = SpeechMode::Local;
        assert!(matches!(mode, SpeechMode::Local));
    }

    #[test]
    fn test_speech_mode_clone() {
        let mode = SpeechMode::Auto;
        let cloned = mode.clone();
        assert!(matches!(cloned, SpeechMode::Auto));
    }

    #[test]
    fn test_speech_mode_copy() {
        let mode = SpeechMode::Online;
        let copied: SpeechMode = mode;
        assert!(matches!(copied, SpeechMode::Online));
        assert!(matches!(mode, SpeechMode::Online));
    }

    #[test]
    fn test_speech_mode_debug() {
        let mode = SpeechMode::Local;
        let debug_str = format!("{:?}", mode);
        assert!(debug_str.contains("Local"));
    }

    #[test]
    fn test_speech_mode_serialize_auto() {
        let mode = SpeechMode::Auto;
        let json = serde_json::to_string(&mode).unwrap();
        assert_eq!(json, "\"auto\"");
    }

    #[test]
    fn test_speech_mode_serialize_online() {
        let mode = SpeechMode::Online;
        let json = serde_json::to_string(&mode).unwrap();
        assert_eq!(json, "\"online\"");
    }

    #[test]
    fn test_speech_mode_serialize_local() {
        let mode = SpeechMode::Local;
        let json = serde_json::to_string(&mode).unwrap();
        assert_eq!(json, "\"local\"");
    }

    #[test]
    fn test_speech_mode_deserialize_auto() {
        let json = "\"auto\"";
        let mode: SpeechMode = serde_json::from_str(json).unwrap();
        assert!(matches!(mode, SpeechMode::Auto));
    }

    #[test]
    fn test_speech_mode_deserialize_online() {
        let json = "\"online\"";
        let mode: SpeechMode = serde_json::from_str(json).unwrap();
        assert!(matches!(mode, SpeechMode::Online));
    }

    #[test]
    fn test_speech_mode_deserialize_local() {
        let json = "\"local\"";
        let mode: SpeechMode = serde_json::from_str(json).unwrap();
        assert!(matches!(mode, SpeechMode::Local));
    }

    // ─────────────────────────────────────────────────────────────
    // SpeechTask Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_speech_task_default() {
        let task = SpeechTask::default();
        assert!(task.text.is_empty());
        assert!(task.voice.is_none());
        assert_eq!(task.speed, 1.0);
        assert_eq!(task.pitch, 1.0);
        assert!(matches!(task.mode, SpeechMode::Auto));
    }

    #[test]
    fn test_speech_task_creation() {
        let task = SpeechTask {
            text: "Hello world".to_string(),
            voice: Some("en-US".to_string()),
            speed: 1.2,
            pitch: 0.9,
            mode: SpeechMode::Online,
        };
        assert_eq!(task.text, "Hello world");
        assert_eq!(task.voice, Some("en-US".to_string()));
        assert_eq!(task.speed, 1.2);
        assert_eq!(task.pitch, 0.9);
        assert!(matches!(task.mode, SpeechMode::Online));
    }

    #[test]
    fn test_speech_task_clone() {
        let task = SpeechTask {
            text: "Test".to_string(),
            voice: Some("fr-FR".to_string()),
            speed: 1.5,
            pitch: 1.1,
            mode: SpeechMode::Local,
        };
        let cloned = task.clone();
        assert_eq!(cloned.text, "Test");
        assert_eq!(cloned.voice, Some("fr-FR".to_string()));
        assert_eq!(cloned.speed, 1.5);
    }

    #[test]
    fn test_speech_task_debug() {
        let task = SpeechTask::default();
        let debug_str = format!("{:?}", task);
        assert!(debug_str.contains("SpeechTask"));
    }

    #[test]
    fn test_speech_task_with_empty_text() {
        let task = SpeechTask {
            text: String::new(),
            ..Default::default()
        };
        assert!(task.text.is_empty());
    }

    #[test]
    fn test_speech_task_with_no_voice() {
        let task = SpeechTask {
            text: "Hello".to_string(),
            voice: None,
            ..Default::default()
        };
        assert!(task.voice.is_none());
    }

    #[test]
    fn test_speech_task_with_custom_speed() {
        let task = SpeechTask {
            text: "Fast speech".to_string(),
            speed: 2.0,
            ..Default::default()
        };
        assert_eq!(task.speed, 2.0);
    }

    #[test]
    fn test_speech_task_with_custom_pitch() {
        let task = SpeechTask {
            text: "High pitch".to_string(),
            pitch: 1.5,
            ..Default::default()
        };
        assert_eq!(task.pitch, 1.5);
    }

    #[test]
    fn test_speech_task_with_local_mode() {
        let task = SpeechTask {
            text: "Local speech".to_string(),
            mode: SpeechMode::Local,
            ..Default::default()
        };
        assert!(matches!(task.mode, SpeechMode::Local));
    }

    #[test]
    fn test_speech_task_with_online_mode() {
        let task = SpeechTask {
            text: "Online speech".to_string(),
            mode: SpeechMode::Online,
            ..Default::default()
        };
        assert!(matches!(task.mode, SpeechMode::Online));
    }
}
