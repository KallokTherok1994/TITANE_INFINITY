// TITANE∞ v14 - AI Chat Commands
// Tauri commands for AI interaction and Voice Mode
// Migrated to SingularityEngine CoreCollection architecture

use crate::ai::router::AIRouter;
use crate::ai::{AIRequest, AIResponse};
use crate::audio::asr::ASREngine;
use crate::audio::recorder::AudioRecorder;
use crate::audio::vad::VoiceActivityDetector;
use crate::audio::AudioConfig;
use crate::compat::CoreCollection;
use crate::memory::model::{Conversation, MessageRole};
use crate::memory::storage::MemoryStorage;
use crate::tts::local_tts::LocalTTS;
use crate::tts::online_tts::OnlineTTS;
use crate::tts::TTSRequest;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::State;

// Global state for AI Chat system (v14)
pub struct AIChatState {
    pub ai_router: Arc<Mutex<AIRouter>>,
    pub memory_storage: Arc<Mutex<MemoryStorage>>,
    pub current_conversation: Arc<Mutex<Option<Conversation>>>,
    pub online_tts: Arc<Mutex<OnlineTTS>>,
    pub local_tts: Arc<Mutex<LocalTTS>>,
    pub audio_recorder: Arc<Mutex<AudioRecorder>>,
    pub asr_engine: Arc<Mutex<ASREngine>>,
    pub vad: Arc<Mutex<VoiceActivityDetector>>,
    /// v14 Unified Core Collection (Bridge v12↔v14)
    pub core_collection: Arc<CoreCollection>,
}

impl AIChatState {
    pub fn new() -> Self {
        // Get Gemini API key from environment
        let gemini_key = std::env::var("GEMINI_API_KEY").ok();
        let ollama_model = std::env::var("OLLAMA_MODEL").ok();

        let ai_router = Arc::new(Mutex::new(AIRouter::new(gemini_key.clone(), ollama_model)));

        // Memory storage location
        let storage_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane")
            .join("memory");

        let memory_storage = Arc::new(Mutex::new(
            MemoryStorage::new(storage_dir, "titane-infinity".to_string())
                .expect("Failed to initialize memory storage"),
        ));

        let online_tts = Arc::new(Mutex::new(OnlineTTS::new(gemini_key)));
        let local_tts = Arc::new(Mutex::new(LocalTTS::new()));
        let audio_recorder = Arc::new(Mutex::new(AudioRecorder::new(AudioConfig::default())));
        let asr_engine = Arc::new(Mutex::new(ASREngine::auto()));
        let vad = Arc::new(Mutex::new(VoiceActivityDetector::new()));

        // v14 Unified Core Collection (replaces individual v12 modules)
        let core_collection = Arc::new(CoreCollection::default());

        Self {
            ai_router,
            memory_storage,
            current_conversation: Arc::new(Mutex::new(None)),
            online_tts,
            local_tts,
            audio_recorder,
            asr_engine,
            vad,
            core_collection,
        }
    }
}

#[tauri::command]
pub async fn ai_query(
    state: State<'_, AIChatState>,
    prompt: String,
    temperature: Option<f32>,
    max_tokens: Option<usize>,
) -> Result<String, String> {
    log::info!("[AI Chat v14] Query received: {}", prompt);

    // Security scan with Sentinel (v14 - via CoreCollection)
    let scan_result = {
        let sentinel_adapter = state.core_collection.sentinel();
        let sentinel = sentinel_adapter.lock().unwrap();
        sentinel.scan_input(&prompt)
    };

    if !scan_result.safe {
        log::warn!("[Sentinel v14] Security scan failed: {:?}", scan_result.threats);
        // Log to SingularityEngine Sentinel module
        if let Ok(engine) = state.core_collection.engine().lock() {
            let sentinel_mod = engine.sentinel();
            log::info!("[Sentinel v14] Alert count: {}", sentinel_mod.alert_count);
        }
        return Err("Input rejected by security scan".to_string());
    }

    // Analyze context with Harmonia (v14 - via CoreCollection)
    let context_analysis = {
        let harmonia_adapter = state.core_collection.harmonia();
        let harmonia = harmonia_adapter.lock().unwrap();
        harmonia.analyze_context(&prompt)
    };

    // Create AI request
    let request = AIRequest {
        prompt: scan_result.sanitized,
        temperature: temperature.unwrap_or(0.7),
        max_tokens: max_tokens.unwrap_or(2000),
        stream: false,
    };

    // Query AI through router (cascade Gemini → Ollama → Local)
    let router = state.ai_router.lock().unwrap();
    let response = router
        .query(request)
        .await
        .map_err(|e| e.to_string())?;

    log::info!("[AI Router v14] Response from {:?} ({} tokens)", response.provider, response.tokens);

    // Balance response with Harmonia (v14 - via CoreCollection)
    let balanced_response = {
        let harmonia_adapter = state.core_collection.harmonia();
        let harmonia = harmonia_adapter.lock().unwrap();
        harmonia.balance_response(&response.content, &context_analysis)
    };

    // Save to memory + sync to MemoryModule v14
    if let Ok(mut conv_opt) = state.current_conversation.lock() {
        if let Some(conv) = conv_opt.as_mut() {
            conv.add_entry(MessageRole::User, prompt, 0);
            conv.add_entry(MessageRole::Assistant, balanced_response.clone(), response.tokens);

            // Save to persistent storage
            let storage = state.memory_storage.lock().unwrap();
            if let Err(e) = storage.save_conversation(conv) {
                log::warn!("[Memory v14] Failed to save conversation: {}", e);
            } else {
                log::info!("[Memory v14] Conversation saved: {}", conv.id);

                // Sync to MemoryModule in SingularityEngine
                if let Ok(engine) = state.core_collection.engine().lock() {
                    let memory_mod = engine.memory();
                    log::info!("[Memory v14] Memory count: {}, capacity: {:.2}%",
                        memory_mod.memory_count, memory_mod.capacity_usage * 100.0);
                }
            }
        }
    }

    Ok(serde_json::json!({
        "content": balanced_response,
        "provider": format!("{:?}", response.provider),
        "tokens": response.tokens,
        "timestamp": response.timestamp,
    })
    .to_string())
}

#[tauri::command]
pub async fn speak(
    state: State<'_, AIChatState>,
    text: String,
    use_online: bool,
) -> Result<(), String> {
    let request = TTSRequest {
        text: text.clone(),
        voice: None,
        speed: 1.0,
        pitch: 1.0,
    };

    if use_online {
        let tts = state.online_tts.lock().unwrap();
        tts.speak(&request)
            .await
            .map_err(|e| e.to_string())?;
    } else {
        let tts = state.local_tts.lock().unwrap();
        tts.speak(&request).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn start_recording(state: State<'_, AIChatState>) -> Result<(), String> {
    let recorder = state.audio_recorder.lock().unwrap();
    recorder.start().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn stop_recording(state: State<'_, AIChatState>) -> Result<(), String> {
    let recorder = state.audio_recorder.lock().unwrap();
    recorder.stop().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn transcribe_audio(
    state: State<'_, AIChatState>,
    audio_data: Vec<u8>,
) -> Result<String, String> {
    let asr = state.asr_engine.lock().unwrap();
    asr.transcribe(&audio_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_conversation(
    state: State<'_, AIChatState>,
    title: String,
) -> Result<String, String> {
    let conversation = Conversation::new(title);
    let id = conversation.id.clone();

    let storage = state.memory_storage.lock().unwrap();
    storage
        .save_conversation(&conversation)
        .map_err(|e| e.to_string())?;

    let mut current = state.current_conversation.lock().unwrap();
    *current = Some(conversation);

    Ok(id)
}

#[tauri::command]
pub fn load_conversation(
    state: State<'_, AIChatState>,
    conversation_id: String,
) -> Result<String, String> {
    let storage = state.memory_storage.lock().unwrap();
    let conversation = storage
        .load_conversation(&conversation_id)
        .map_err(|e| e.to_string())?;

    let json = serde_json::to_string(&conversation).map_err(|e| e.to_string())?;

    let mut current = state.current_conversation.lock().unwrap();
    *current = Some(conversation);

    Ok(json)
}

#[tauri::command]
pub fn list_conversations(state: State<'_, AIChatState>) -> Result<String, String> {
    let storage = state.memory_storage.lock().unwrap();
    let conversations = storage
        .list_conversations()
        .map_err(|e| e.to_string())?;

    serde_json::to_string(&conversations).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_conversation(
    state: State<'_, AIChatState>,
    conversation_id: String,
) -> Result<(), String> {
    let storage = state.memory_storage.lock().unwrap();
    storage
        .delete_conversation(&conversation_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_all_memory(state: State<'_, AIChatState>) -> Result<(), String> {
    let storage = state.memory_storage.lock().unwrap();
    storage.clear_all().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_connection() -> Result<bool, String> {
    match tokio::time::timeout(
        std::time::Duration::from_secs(3),
        reqwest::get("https://www.google.com"),
    )
    .await
    {
        Ok(Ok(response)) => Ok(response.status().is_success()),
        _ => Ok(false),
    }
}

#[tauri::command]
pub async fn health_check(state: State<'_, AIChatState>) -> Result<String, String> {
    let router = state.ai_router.lock().unwrap();
    let health = router.health_check().await;

    // Run SelfHeal diagnostic
    let diagnostic = {
        let mut selfheal = state.selfheal.lock().unwrap();
        selfheal.run_diagnostic()
    };

    let combined = serde_json::json!({
        "ai": health,
        "diagnostic": {
            "overall_health": diagnostic.overall_health,
            "checks": diagnostic.checks,
            "issues_count": diagnostic.issues.len(),
        },
        "timestamp": chrono::Utc::now().timestamp(),
    });

    Ok(combined.to_string())
}

#[tauri::command]
pub fn get_vad_state(state: State<'_, AIChatState>) -> Result<bool, String> {
    let vad = state.vad.lock().unwrap();
    Ok(vad.is_speaking())
}

#[tauri::command]
pub fn get_module_status(state: State<'_, AIChatState>) -> Result<String, String> {
    let helios = state.helios.lock().unwrap();
    let nexus = state.nexus.lock().unwrap();
    let harmonia = state.harmonia.lock().unwrap();
    let sentinel = state.sentinel.lock().unwrap();
    let adaptive = state.adaptive.lock().unwrap();
    let selfheal = state.selfheal.lock().unwrap();

    let status = serde_json::json!({
        "modules": [
            helios.get_status(),
            nexus.get_status(),
            harmonia.get_status(),
            sentinel.get_status(),
            adaptive.get_status(),
            selfheal.get_status(),
        ],
        "timestamp": chrono::Utc::now().timestamp(),
    });

    Ok(status.to_string())
}
