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
