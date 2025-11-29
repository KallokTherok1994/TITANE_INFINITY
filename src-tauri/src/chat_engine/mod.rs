pub mod commands;
mod config;
mod errors;
mod memory;
mod providers;
mod speech;
mod streaming;
mod types;

use std::sync::Arc;
use std::time::Instant;

use memory::{create_storage, ChatMemoryManager};
use providers::{build_ai_request, ProviderBridge};
use speech::{SpeechOrchestrator, SpeechTask};
use streaming::{chunk_text, new_stream_channel, StreamReceiver, StreamSender};

use crate::ai::router::AIRouter;
use crate::memory::model::Conversation;
use crate::memory::MemoryEntry;
use crate::security::secrets_engine::SecureSecretsEngine;
use crate::tts::local_tts::LocalTTS;
use crate::tts::online_tts::OnlineTTS;

use tokio::sync::RwLock;
use tokio::time;

use serde_json::json;
use uuid::Uuid;

pub use config::ChatEngineConfig;
pub use errors::ChatEngineError;
pub use speech::SpeechMode;
pub use types::{
    ChatCompletionPayload, ChatRequestPayload, EngineHealthReport, ProviderPreference, StreamChunk,
};

#[derive(Clone)]
pub struct ChatEngine {
    config: ChatEngineConfig,
    providers: ProviderBridge,
    memory: Arc<ChatMemoryManager>,
    speech: SpeechOrchestrator,
}

pub struct StreamHandle {
    pub conversation_id: String,
    pub message_id: String,
    pub receiver: StreamReceiver,
}

impl ChatEngine {
    pub fn new(
        config: ChatEngineConfig,
        providers: ProviderBridge,
        memory: Arc<ChatMemoryManager>,
        speech: SpeechOrchestrator,
    ) -> Self {
        Self {
            config,
            providers,
            memory,
            speech,
        }
    }

    pub async fn generate_response(
        &self,
        mut payload: ChatRequestPayload,
    ) -> Result<ChatCompletionPayload, ChatEngineError> {
        payload.validate().map_err(ChatEngineError::InvalidInput)?;

        let conversation_id = self
            .memory
            .ensure_conversation(payload.conversation_id.take())
            .await?;

        self.memory
            .append_user_entry(&conversation_id, payload.user_message.clone())
            .await?;

        let context_entries = self
            .memory
            .context_window(&conversation_id, self.config.memory_context_tokens)
            .await?;

        let compiled_prompt = compile_prompt(
            payload.system_prompt.as_ref(),
            &context_entries,
            &payload.user_message,
        );

        let ai_request = build_ai_request(
            compiled_prompt,
            payload.temperature,
            payload.max_output_tokens,
        );

        let provider_pref = payload.provider;
        let start = Instant::now();

        let response = time::timeout(
            self.config.response_timeout,
            self.providers.dispatch(ai_request, provider_pref),
        )
        .await
        .map_err(|_| ChatEngineError::Timeout("Generation timed out".to_string()))??;

        let assistant_content = response.content.clone();
        self.memory
            .append_assistant_entry(&conversation_id, assistant_content.clone())
            .await?;

        let latency_ms = start.elapsed().as_millis();
        let message_id = Uuid::new_v4().to_string();

        if self.config.auto_tts_enabled && self.speech.auto_enabled() {
            let speech = self.speech.clone();
            let text = assistant_content.clone();
            tokio::spawn(async move {
                let task = SpeechTask {
                    text,
                    voice: None,
                    speed: 1.0,
                    pitch: 1.0,
                    mode: SpeechMode::Auto,
                };

                if let Err(err) = speech.speak(task).await {
                    log::warn!("[ChatEngine] Auto TTS failed: {}", err);
                }
            });
        }

        Ok(ChatCompletionPayload {
            conversation_id,
            message_id,
            provider: format!("{:?}", response.provider),
            content: assistant_content,
            token_count: response.tokens,
            latency_ms,
            timestamp: response.timestamp,
        })
    }

    pub async fn stream_response(
        &self,
        mut payload: ChatRequestPayload,
    ) -> Result<StreamHandle, ChatEngineError> {
        payload.validate().map_err(ChatEngineError::InvalidInput)?;

        let conversation_id = self
            .memory
            .ensure_conversation(payload.conversation_id.take())
            .await?;

        self.memory
            .append_user_entry(&conversation_id, payload.user_message.clone())
            .await?;

        let context_entries = self
            .memory
            .context_window(&conversation_id, self.config.memory_context_tokens)
            .await?;

        let compiled_prompt = compile_prompt(
            payload.system_prompt.as_ref(),
            &context_entries,
            &payload.user_message,
        );

        let ai_request = build_ai_request(
            compiled_prompt,
            payload.temperature,
            payload.max_output_tokens,
        );

        let provider_pref = payload.provider;
        let message_id = Uuid::new_v4().to_string();
        let (sender, receiver) = new_stream_channel(32);
        let providers = self.providers.clone();
        let memory = self.memory.clone();
        let config = self.config.clone();
        let speech = if config.auto_tts_enabled && self.speech.auto_enabled() {
            Some(self.speech.clone())
        } else {
            None
        };
        let conversation_ref = conversation_id.clone();
        let message_ref = message_id.clone();

        tokio::spawn(async move {
            let start = Instant::now();
            let dispatch = providers.dispatch(ai_request, provider_pref);
            let response = time::timeout(config.response_timeout, dispatch).await;
            match response {
                Ok(Ok(result)) => {
                    let chunks = chunk_text(
                        &result.content,
                        config.stream_chunk_size,
                        &conversation_ref,
                        &message_ref,
                    );

                    for chunk in chunks {
                        if sender.send(chunk).await.is_err() {
                            return;
                        }
                    }

                    if let Err(err) = memory
                        .append_assistant_entry(&conversation_ref, result.content.clone())
                        .await
                    {
                        log::error!("[ChatEngine] Failed to persist streamed response: {}", err);
                    }

                    if let Some(speech_engine) = speech {
                        let text = result.content.clone();
                        tokio::spawn(async move {
                            let task = SpeechTask {
                                text,
                                voice: None,
                                speed: 1.0,
                                pitch: 1.0,
                                mode: SpeechMode::Auto,
                            };
                            if let Err(err) = speech_engine.speak(task).await {
                                log::warn!("[ChatEngine] Auto TTS failed (stream): {}", err);
                            }
                        });
                    }

                    let latency_ms = start.elapsed().as_millis();
                    let done_chunk = StreamChunk {
                        conversation_id: conversation_ref.clone(),
                        message_id: message_ref.clone(),
                        ordinal: u32::MAX,
                        content: json!({
                            "provider": format!("{:?}", result.provider),
                            "latency_ms": latency_ms,
                            "timestamp": result.timestamp,
                            "tokens": result.tokens,
                        })
                        .to_string(),
                        done: true,
                    };
                    let _ = sender.send(done_chunk).await;
                }
                Ok(Err(err)) => {
                    emit_error_chunk(sender, &conversation_ref, &message_ref, err.to_string())
                        .await;
                }
                Err(_) => {
                    emit_error_chunk(
                        sender,
                        &conversation_ref,
                        &message_ref,
                        "Generation timed out".to_string(),
                    )
                    .await;
                }
            }
        });

        Ok(StreamHandle {
            conversation_id,
            message_id,
            receiver,
        })
    }

    pub async fn speak_text(
        &self,
        text: String,
        mode: SpeechMode,
        speed: f32,
        pitch: f32,
        voice: Option<String>,
    ) -> Result<(), ChatEngineError> {
        let task = SpeechTask {
            text,
            voice,
            speed,
            pitch,
            mode,
        };
        self.speech.speak(task).await
    }

    pub async fn save_memory(&self, conversation_id: &str) -> Result<String, ChatEngineError> {
        self.memory.export_conversation_json(conversation_id).await
    }

    pub async fn load_memory(
        &self,
        conversation_id: &str,
    ) -> Result<Conversation, ChatEngineError> {
        self.memory.get_conversation(conversation_id).await
    }

    pub async fn reset_memory(&self) -> Result<(), ChatEngineError> {
        self.memory.reset_all().await
    }

    pub async fn health_check(&self) -> Result<EngineHealthReport, ChatEngineError> {
        let provider_health = self.providers.health().await;
        let (conversations, messages) = self.memory.stats().await?;

        let gemini_available = provider_health
            .get("gemini")
            .and_then(|v| v.get("available"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        let gemini_configured = provider_health
            .get("gemini")
            .and_then(|v| v.get("configured"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        let ollama_available = provider_health
            .get("ollama")
            .and_then(|v| v.get("available"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        let mut providers_online = Vec::new();
        let mut providers_degraded = Vec::new();

        if gemini_available {
            providers_online.push("gemini".to_string());
        } else if gemini_configured {
            providers_degraded.push("gemini".to_string());
        }

        if ollama_available {
            providers_online.push("ollama".to_string());
        } else {
            providers_degraded.push("ollama".to_string());
        }

        Ok(EngineHealthReport {
            providers_online,
            providers_degraded,
            provider_errors: Vec::new(),
            memory_entries: messages,
            memory_tokens: messages * 128,
            auto_tts_enabled: self.config.auto_tts_enabled && self.speech.auto_enabled(),
            timestamp: chrono::Utc::now().timestamp(),
        })
    }
}

pub async fn bootstrap_from_env(
    config: Option<ChatEngineConfig>,
    secrets_engine: Option<SecureSecretsEngine>,
) -> Result<Arc<ChatEngine>, ChatEngineError> {
    let config = config.unwrap_or_default();

    let gemini_key = secrets_engine
        .as_ref()
        .and_then(|engine| engine.get_secret("gemini_api_key").ok().flatten())
        .or_else(|| std::env::var("GEMINI_API_KEY").ok());
    if gemini_key.is_none() {
        log::warn!("[ChatEngine] Gemini API key not configured. Cloud provider will be offline");
    }
    let ollama_model = std::env::var("OLLAMA_MODEL").ok();

    let router = AIRouter::new(gemini_key.clone(), ollama_model);
    let providers = ProviderBridge::new(router);

    let storage_dir = dirs::data_local_dir()
        .unwrap_or_else(|| std::env::temp_dir())
        .join("titane-infinity")
        .join("memory");

    let memory_password = std::env::var("TITANE_MEMORY_KEY")
        .or_else(|_| std::env::var("CHAT_MEMORY_PASSPHRASE"))
        .unwrap_or_else(|_| {
            log::warn!("[ChatEngine] No memory encryption key found. Using volatile fallback key");
            "titane-memory-fallback".to_string()
        });

    let storage = create_storage(storage_dir, memory_password)?;
    let memory = Arc::new(ChatMemoryManager::new(
        storage,
        config.memory_retention_tokens,
    ));

    let online_tts = Arc::new(RwLock::new(OnlineTTS::new(gemini_key.clone())));
    let local_tts = Arc::new(RwLock::new(LocalTTS::new()));
    let speech = SpeechOrchestrator::new(online_tts, local_tts, config.auto_tts_enabled);

    Ok(Arc::new(ChatEngine::new(config, providers, memory, speech)))
}

fn compile_prompt(
    system_prompt: Option<&String>,
    context: &[MemoryEntry],
    user_message: &str,
) -> String {
    let mut builder = String::with_capacity(4096);

    if let Some(system) = system_prompt {
        builder.push_str("System:\n");
        builder.push_str(system);
        builder.push_str("\n\n");
    }

    for entry in context {
        builder.push_str(&entry.role.to_string());
        builder.push_str(": ");
        builder.push_str(&entry.content);
        builder.push('\n');
    }

    builder.push_str("User: ");
    builder.push_str(user_message);
    builder.push('\n');

    builder
}

async fn emit_error_chunk(
    sender: StreamSender,
    conversation_id: &str,
    message_id: &str,
    error: String,
) {
    let chunk = StreamChunk {
        conversation_id: conversation_id.to_string(),
        message_id: message_id.to_string(),
        ordinal: u32::MAX,
        content: json!({ "error": error }).to_string(),
        done: true,
    };
    let _ = sender.send(chunk).await;
}
