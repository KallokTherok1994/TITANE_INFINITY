use std::sync::Arc;

use serde_json::json;
use tauri::{async_runtime, Emitter, State, Window};

type CommandResult<T> = Result<T, String>;

use super::{
    ChatCompletionPayload, ChatEngine, ChatEngineError, ChatRequestPayload, EngineHealthReport,
    SpeechMode,
};

fn to_error(err: ChatEngineError) -> String {
    err.to_string()
}

#[tauri::command]
pub async fn generate_response(
    engine: State<'_, Arc<ChatEngine>>,
    payload: ChatRequestPayload,
) -> CommandResult<ChatCompletionPayload> {
    engine.generate_response(payload).await.map_err(to_error)
}

#[tauri::command]
pub async fn stream_response(
    window: Window,
    engine: State<'_, Arc<ChatEngine>>,
    payload: ChatRequestPayload,
) -> CommandResult<serde_json::Value> {
    let handle = engine.stream_response(payload).await.map_err(to_error)?;
    let conversation_id = handle.conversation_id.clone();
    let message_id = handle.message_id.clone();
    let receiver = handle.receiver;
    let window_clone = window.clone();

    async_runtime::spawn(async move {
        let mut stream = receiver;
        while let Some(chunk) = stream.recv().await {
            let event_name = if chunk.done {
                "chat:stream:done"
            } else {
                "chat:stream:chunk"
            };

            if let Err(err) = window_clone.emit(event_name, &chunk) {
                log::error!(
                    "[ChatEngine] Failed to emit {} event for message {}: {}",
                    event_name,
                    chunk.message_id,
                    err
                );
                break;
            }
        }
    });

    Ok(json!({
        "conversationId": conversation_id,
        "messageId": message_id,
    }))
}

#[tauri::command]
pub async fn speak_text(
    engine: State<'_, Arc<ChatEngine>>,
    text: String,
    mode: Option<SpeechMode>,
    speed: Option<f32>,
    pitch: Option<f32>,
    voice: Option<String>,
) -> CommandResult<()> {
    let mode = mode.unwrap_or(SpeechMode::Auto);
    let speed = speed.unwrap_or(1.0);
    let pitch = pitch.unwrap_or(1.0);
    engine
        .speak_text(text, mode, speed, pitch, voice)
        .await
        .map_err(to_error)
}

#[tauri::command]
pub async fn save_memory(
    engine: State<'_, Arc<ChatEngine>>,
    conversation_id: String,
) -> CommandResult<String> {
    engine.save_memory(&conversation_id).await.map_err(to_error)
}

#[tauri::command]
pub async fn load_memory(
    engine: State<'_, Arc<ChatEngine>>,
    conversation_id: String,
) -> CommandResult<serde_json::Value> {
    let conversation = engine
        .load_memory(&conversation_id)
        .await
        .map_err(to_error)?;
    serde_json::to_value(&conversation).map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn reset_memory(engine: State<'_, Arc<ChatEngine>>) -> CommandResult<()> {
    engine.reset_memory().await.map_err(to_error)
}

#[tauri::command]
pub async fn health_check(engine: State<'_, Arc<ChatEngine>>) -> CommandResult<EngineHealthReport> {
    engine.health_check().await.map_err(to_error)
}
