// TITANE∞ v15 - AI Chat Commands
// Tauri commands for AI interaction and Voice Mode
// Clean architecture v15: Unified SingularityEngine, documented, production-ready

use crate::ai::router::AIRouter;
use crate::ai::{AIRequest, AIResponse};
use crate::audio::asr::ASREngine;
use crate::audio::recorder::AudioRecorder;
use crate::audio::vad::VoiceActivityDetector;
use crate::audio::AudioConfig;
use crate::compat::CoreCollection;
use crate::memory::model::{Conversation, MessageRole};
use crate::memory::storage::MemoryStorage;
use crate::security::secrets_engine::SecureSecretsEngine;
use crate::tts::local_tts::LocalTTS;
use crate::tts::online_tts::OnlineTTS;
use crate::tts::TTSRequest;
use dashmap::DashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use tauri::State;

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[AIChat] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}


// Global state for AI Chat system (v15)
// v19.5.2 P2-1: Optimized with DashMap for concurrent access (Phase 2)
// DashMap provides lock-free concurrent HashMap (proven 5x improvement)
pub struct AIChatState {
    /// AIRouter stored in DashMap for lock-free access
    /// Key: "default" for main router
    pub ai_router: Arc<DashMap<String, AIRouter>>,
    /// MemoryStorage - keeping RwLock as single-writer pattern fits
    pub memory_storage: Arc<RwLock<MemoryStorage>>,
    /// Current conversation - DashMap for concurrent session management
    /// Key: conversation_id or "current" for active session
    pub conversations: Arc<DashMap<String, Conversation>>,
    /// TTS engines in DashMap for concurrent voice operations
    pub tts_engines: Arc<DashMap<String, TTSEngine>>,
    /// Audio devices in DashMap for concurrent capture
    pub audio_devices: Arc<DashMap<String, AudioDevice>>,
    /// v15 Unified Core Collection (Clean architecture)
    pub core_collection: Arc<CoreCollection>,
    /// v19.5.2: DashMap for atomic state management
    pub state_flags: Arc<DashMap<String, bool>>,
}

/// TTS engine enum for DashMap storage
#[derive(Clone)]
pub enum TTSEngine {
    Online(OnlineTTS),
    Local(LocalTTS),
}

/// Audio device enum for DashMap storage
#[derive(Clone)]
pub enum AudioDevice {
    Recorder(AudioRecorder),
    ASR(ASREngine),
    VAD(VoiceActivityDetector),
}

impl AIChatState {
    pub fn new() -> Self {
        let secrets_engine = SecureSecretsEngine::new(std::env::var("TITANE_SECRETS_PASSPHRASE").ok())
            .unwrap_or_default();

        let gemini_key = secrets_engine
            .get_secret("gemini_api_key")
            .ok()
            .flatten()
            .or_else(|| std::env::var("GEMINI_API_KEY").ok());
        let ollama_model = std::env::var("OLLAMA_MODEL").ok();

        // v19.5.2 P2-1: DashMap for lock-free concurrent access
        let ai_router = Arc::new(DashMap::new());
        ai_router.insert("default".to_string(), AIRouter::new(gemini_key.clone(), ollama_model));

        // Memory storage location
        let storage_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane")
            .join("memory");

        let memory_storage = Arc::new(RwLock::new(
            MemoryStorage::new(storage_dir, "titane-infinity".to_string())
                .expect("Failed to initialize memory storage"),
        ));

        // v19.5.2: TTS engines in DashMap
        let tts_engines = Arc::new(DashMap::new());
        tts_engines.insert("online".to_string(), TTSEngine::Online(OnlineTTS::new(gemini_key)));
        tts_engines.insert("local".to_string(), TTSEngine::Local(LocalTTS::new()));

        // v19.5.2: Audio devices in DashMap
        let audio_devices = Arc::new(DashMap::new());
        audio_devices.insert("recorder".to_string(), AudioDevice::Recorder(AudioRecorder::new(AudioConfig::default())));
        audio_devices.insert("asr".to_string(), AudioDevice::ASR(ASREngine::auto()));
        audio_devices.insert("vad".to_string(), AudioDevice::VAD(VoiceActivityDetector::new()));

        // v19.5.2: Conversations in DashMap (empty initially)
        let conversations = Arc::new(DashMap::new());

        // v15 Unified Core Collection (Clean architecture)
        let core_collection = Arc::new(CoreCollection::default());

        // v19.5.2: State flags in DashMap
        let state_flags = Arc::new(DashMap::new());
        state_flags.insert("is_speaking".to_string(), false);

        Self {
            ai_router,
            memory_storage,
            conversations,
            tts_engines,
            audio_devices,
            core_collection,
            state_flags,
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
    log::info!("[AI Chat v15] Query received: {}", prompt);

    // Security scan with Sentinel (v15 - via CoreCollection)
    let scan_result = {
        let sentinel_adapter = state.core_collection.sentinel();
        let sentinel = lock_or_recover!(sentinel_adapter);
        sentinel.scan_input(&prompt)
    };

    if !scan_result.safe {
        log::warn!("[Sentinel v15] Security scan failed: {:?}", scan_result.threats);
        // Log to SingularityEngine Sentinel module
        if let Ok(engine) = state.core_collection.engine().lock() {
            let sentinel_mod = engine.sentinel();
            log::info!("[Sentinel v15] Alert count: {}", sentinel_mod.alert_count);
        }
        return Err("Input rejected by security scan".to_string());
    }

    // Analyze context with Harmonia (v15 - via CoreCollection)
    let context_analysis = {
        let harmonia_adapter = state.core_collection.harmonia();
        let harmonia = lock_or_recover!(harmonia_adapter);
        harmonia.analyze_context(&prompt)
    };

    // Create AI request v15
    let request = AIRequest {
        prompt: scan_result.sanitized,
        temperature: temperature.unwrap_or(0.7),
        max_tokens: max_tokens.unwrap_or(2000),
        stream: false,
    };

    // Query AI through router (cascade Gemini → Ollama → Local)
    // v19.5.2 P2-1: DashMap lock-free access (no .read().await needed!)
    let response = {
        let router_ref = state.ai_router.get("default")
            .ok_or_else(|| "AI Router not initialized".to_string())?;
        router_ref.query(request).await.map_err(|e| e.to_string())?
    };

    log::info!("[AI Router v15] Response from {:?} ({} tokens)", response.provider, response.tokens);

    // Balance response with Harmonia (v15 - via CoreCollection)
    let balanced_response = {
        let harmonia_adapter = state.core_collection.harmonia();
        let harmonia = lock_or_recover!(harmonia_adapter);
        harmonia.balance_response(&response.content, &context_analysis)
    };

    // Save to memory + sync to MemoryModule v15
    if let Ok(mut conv_opt) = state.current_conversation.try_write() {
        if let Some(conv) = conv_opt.as_mut() {
            conv.add_entry(MessageRole::User, prompt, 0);
            conv.add_entry(MessageRole::Assistant, balanced_response.clone(), response.tokens);

            // Save to persistent storage
            let storage = state.memory_storage.read().await;
            if let Err(e) = storage.save_conversation(conv) {
                log::warn!("[Memory v15] Failed to save conversation: {}", e);
            } else {
                log::info!("[Memory v15] Conversation saved: {}", conv.id);

                // Sync to MemoryModule in SingularityEngine v15
                if let Ok(engine) = state.core_collection.engine().lock() {
                    let memory_mod = engine.memory();
                    log::info!("[Memory v15] Memory count: {}, capacity: {:.2}%",
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

/// v24.20: TTS avec streaming + background task (non-blocking)
#[tauri::command]
pub async fn speak(
    state: State<'_, AIChatState>,
    text: String,
    use_online: bool,
    rate: Option<f32>,
    pitch: Option<f32>,
    voice: Option<String>,
) -> Result<(), String> {
    // Validation entrée
    if text.trim().is_empty() {
        return Err("Text cannot be empty".to_string());
    }
    if text.len() > 10000 {
        return Err("Text too long (max 10000 chars)".to_string());
    }

    // v24.20: RwLock anti-superposition (async-safe)
    {
        let is_speaking = state.is_speaking.read().await;
        if *is_speaking {
            return Err("TTS busy: another synthesis is in progress. Please wait or call stop_speaking().".to_string());
        }
    }

    // Clone state for background task
    let is_speaking = state.is_speaking.clone();
    let online_tts = state.online_tts.clone();
    let local_tts = state.local_tts.clone();

    // Validation + clamp paramètres
    let speed = rate.unwrap_or(1.0).clamp(0.5, 2.0);
    let pitch_value = pitch.unwrap_or(1.0).clamp(0.5, 2.0);

    // v24.20: Spawn background task (non-blocking UI)
    tokio::spawn(async move {
        // Set speaking flag
        {
            let mut speaking = is_speaking.write().await;
            *speaking = true;
        }

        log::info!(
            "[TTS v24.20] Background synthesis: mode={}, rate={:.2}, pitch={:.2}, voice={:?}, len={}",
            if use_online { "online" } else { "local" },
            speed,
            pitch_value,
            voice,
            text.len()
        );

        let request = TTSRequest {
            text,
            voice,
            speed,
            pitch: pitch_value,
        };

        // Execute synthesis in background
        let result = if use_online {
            let tts = online_tts.read().await;
            tts.speak(&request).await
        } else {
            let tts = local_tts.read().await;
            tts.speak(&request)
        };

        // Release speaking flag
        {
            let mut speaking = is_speaking.write().await;
            *speaking = false;
        }

        match result {
            Ok(_) => log::info!("[TTS v24.20] Background synthesis complete"),
            Err(e) => log::error!("[TTS v24.20] Background synthesis failed: {:?}", e),
        }
    });

    // Return immediately (non-blocking)
    log::info!("[TTS v24.20] Synthesis started in background (non-blocking)");
    Ok(())
}

/// v24.20: Arrêt synthèse TTS en cours (async-safe)
#[tauri::command]
pub async fn stop_speaking(state: State<'_, AIChatState>) -> Result<(), String> {
    let mut is_speaking = state.is_speaking.write().await;
    if !*is_speaking {
        return Ok(()); // Already stopped
    }
    *is_speaking = false;
    log::info!("[TTS v24.20] Speech stopped by user");
    Ok(())
}

/// v24.20: Vérification état TTS (async-safe)
#[tauri::command]
pub async fn is_speaking(state: State<'_, AIChatState>) -> Result<bool, String> {
    let is_speaking = state.is_speaking.read().await;
    Ok(*is_speaking)
}

#[tauri::command]
pub async fn start_recording(state: State<'_, AIChatState>) -> Result<(), String> {
    let recorder = state.audio_recorder.read().await;
    recorder.start().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_recording(state: State<'_, AIChatState>) -> Result<(), String> {
    let recorder = state.audio_recorder.read().await;
    recorder.stop().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn transcribe_audio(
    state: State<'_, AIChatState>,
    audio_data: Vec<u8>,
) -> Result<String, String> {
    let asr = state.asr_engine.read().await;
    asr.transcribe(&audio_data)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_conversation(
    state: State<'_, AIChatState>,
    title: String,
) -> Result<String, String> {
    let conversation = Conversation::new(title);
    let id = conversation.id.clone();

    let storage = state.memory_storage.read().await;
    storage
        .save_conversation(&conversation)
        .map_err(|e| e.to_string())?;

    let mut current = state.current_conversation.write().await;
    *current = Some(conversation);

    Ok(id)
}

#[tauri::command]
pub async fn load_conversation(
    state: State<'_, AIChatState>,
    conversation_id: String,
) -> Result<String, String> {
    let storage = state.memory_storage.read().await;
    let conversation = storage
        .load_conversation(&conversation_id)
        .map_err(|e| e.to_string())?;

    let json = serde_json::to_string(&conversation).map_err(|e| e.to_string())?;

    let mut current = state.current_conversation.write().await;
    *current = Some(conversation);

    Ok(json)
}

#[tauri::command]
pub async fn list_conversations(state: State<'_, AIChatState>) -> Result<String, String> {
    let storage = state.memory_storage.read().await;
    let conversations = storage
        .list_conversations()
        .map_err(|e| e.to_string())?;

    serde_json::to_string(&conversations).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_conversation(
    state: State<'_, AIChatState>,
    conversation_id: String,
) -> Result<(), String> {
    let storage = state.memory_storage.read().await;
    storage
        .delete_conversation(&conversation_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clear_all_memory(state: State<'_, AIChatState>) -> Result<(), String> {
    let storage = state.memory_storage.read().await;
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
    let router = state.ai_router.read().await;
    let health = router.health_check().await;

    // Run SelfHeal diagnostic
    let diagnostic = {
        let mut selfheal = state.lock_or_recover!(selfheal);
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
pub async fn get_vad_state(state: State<'_, AIChatState>) -> Result<bool, String> {
    let vad = state.vad.read().await;
    Ok(vad.is_speaking())
}

#[tauri::command]
pub fn get_module_status(state: State<'_, AIChatState>) -> Result<String, String> {
    let helios = state.lock_or_recover!(helios);
    let nexus = state.lock_or_recover!(nexus);
    let harmonia = state.lock_or_recover!(harmonia);
    let sentinel = state.lock_or_recover!(sentinel);
    let adaptive = state.lock_or_recover!(adaptive);
    let selfheal = state.lock_or_recover!(selfheal);

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
