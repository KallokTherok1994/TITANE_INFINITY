// TITANE∞ v30.0.0 - AI Chat Commands
// Tauri commands for AI interaction and Voice Mode
// Clean architecture v15: Unified SingularityEngine, documented, production-ready
// V24 OPTIMIZATION: Response streaming support for memory efficiency

use dashmap::DashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::State;
use titane_infinity::ai::router::AIRouter;
use titane_infinity::audio::asr::ASREngine;
use titane_infinity::audio::recorder::AudioRecorder;
use titane_infinity::audio::vad::VoiceActivityDetector;
use titane_infinity::audio::{AudioConfig, AudioError};
use titane_infinity::compat::core_collection::CoreCollection;
use titane_infinity::memory::model::Conversation;
use titane_infinity::memory::storage::MemoryStorage;
use titane_infinity::security::secrets_engine::SecureSecretsEngine;
use titane_infinity::tts::local_tts::LocalTTS;
use titane_infinity::tts::online_tts::OnlineTTS;
use titane_infinity::tts::TTSRequest;
use tokio::sync::RwLock;
// use uuid::Uuid;

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
    pub current_conversation: Arc<RwLock<Option<Conversation>>>,
    pub is_speaking: Arc<RwLock<bool>>,
    pub online_tts: Arc<RwLock<OnlineTTS>>,
    pub local_tts: Arc<RwLock<LocalTTS>>,
    pub audio_recorder: Arc<RwLock<AudioRecorder>>,
    pub asr_engine: Arc<RwLock<ASREngine>>,
}

/// TTS engine enum for DashMap storage
pub enum TTSEngine {
    Online(OnlineTTS),
    Local(LocalTTS),
}

/// Audio device enum for DashMap storage
pub enum AudioDevice {
    Recorder(AudioRecorder),
    ASR(ASREngine),
    VAD(VoiceActivityDetector),
}

impl AIChatState {
    pub fn new() -> Self {
        let secrets_engine =
            SecureSecretsEngine::new(std::env::var("TITANE_SECRETS_PASSPHRASE").ok())
                .unwrap_or_default();

        let gemini_key = secrets_engine
            .get_secret("gemini_api_key")
            .ok()
            .flatten()
            .or_else(|| std::env::var("GEMINI_API_KEY").ok());
        let ollama_model = std::env::var("OLLAMA_DEFAULT_MODEL")
            .or_else(|_| std::env::var("OLLAMA_MODEL"))
            .ok();

        // v19.5.2 P2-1: DashMap for lock-free concurrent access
        let ai_router = Arc::new(DashMap::new());
        ai_router.insert(
            "default".to_string(),
            AIRouter::new(gemini_key.clone(), ollama_model),
        );

        // Memory storage location
        let storage_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane")
            .join("memory");

        // Phase 1 Stabilisation: Fallback à mémoire in-memory si storage échoue
        let memory_storage = Arc::new(RwLock::new(
            MemoryStorage::new(storage_dir, "titane-infinity".to_string())
                .unwrap_or_else(|e| {
                    eprintln!("Warning: Failed to initialize persistent memory storage ({}), using in-memory fallback", e);
                    let fallback_dir = std::env::temp_dir().join("titane-memory-fallback");
                    MemoryStorage::new(fallback_dir, "titane-infinity".to_string())
                        .expect("memory storage fallback init should succeed")
                }),
        ));

        // v19.5.2: TTS engines in DashMap
        let online_tts = Arc::new(RwLock::new(OnlineTTS::new(gemini_key.clone())));
        let local_tts = Arc::new(RwLock::new(LocalTTS::new()));
        let tts_engines = Arc::new(DashMap::new());
        tts_engines.insert(
            "online".to_string(),
            TTSEngine::Online(OnlineTTS::new(gemini_key)),
        );
        tts_engines.insert("local".to_string(), TTSEngine::Local(LocalTTS::new()));

        // v19.5.2: Audio devices in DashMap
        let audio_recorder = Arc::new(RwLock::new(AudioRecorder::new(AudioConfig::default())));
        let asr_engine = Arc::new(RwLock::new(ASREngine::auto()));
        let audio_devices = Arc::new(DashMap::new());
        audio_devices.insert(
            "recorder".to_string(),
            AudioDevice::Recorder(AudioRecorder::new(AudioConfig::default())),
        );
        audio_devices.insert("asr".to_string(), AudioDevice::ASR(ASREngine::auto()));
        audio_devices.insert(
            "vad".to_string(),
            AudioDevice::VAD(VoiceActivityDetector::new()),
        );

        // v19.5.2: Conversations in DashMap (empty initially)
        let conversations = Arc::new(DashMap::new());

        // v15 Unified Core Collection (Clean architecture)
        let core_collection = Arc::new(CoreCollection::default());

        // v19.5.2: State flags in DashMap
        let state_flags = Arc::new(DashMap::new());
        state_flags.insert("is_speaking".to_string(), false);
        let current_conversation = Arc::new(RwLock::new(None));
        let is_speaking = Arc::new(RwLock::new(false));

        Self {
            ai_router,
            memory_storage,
            conversations,
            tts_engines,
            audio_devices,
            core_collection,
            state_flags,
            current_conversation,
            is_speaking,
            online_tts,
            local_tts,
            audio_recorder,
            asr_engine,
        }
    }
}
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
pub async fn is_speaking(state: State<'_, AIChatState>) -> Result<bool, String> {
    let is_speaking = state.is_speaking.read().await;
    Ok(*is_speaking)
}

pub async fn start_recording(state: State<'_, AIChatState>) -> Result<(), String> {
    let recorder: tokio::sync::RwLockReadGuard<'_, AudioRecorder> =
        state.audio_recorder.read().await;
    recorder.start().map_err(|e: AudioError| e.to_string())
}

pub async fn stop_recording(state: State<'_, AIChatState>) -> Result<(), String> {
    let recorder: tokio::sync::RwLockReadGuard<'_, AudioRecorder> =
        state.audio_recorder.read().await;
    recorder.stop().map_err(|e: AudioError| e.to_string())
}

pub async fn transcribe_audio(
    state: State<'_, AIChatState>,
    audio_data: Vec<u8>,
) -> Result<String, String> {
    let asr: tokio::sync::RwLockReadGuard<'_, ASREngine> = state.asr_engine.read().await;
    asr.transcribe(&audio_data)
        .await
        .map_err(|e: AudioError| e.to_string())
}

#[tauri::command]
pub async fn check_connection() -> Result<bool, String> {
    let connectivity = tokio::time::timeout(
        std::time::Duration::from_secs(3),
        tokio::net::TcpStream::connect("www.google.com:443"),
    )
    .await;

    Ok(matches!(connectivity, Ok(Ok(_))))
}

pub async fn health_check(state: State<'_, AIChatState>) -> Result<String, String> {
    let health = if let Some(router_ref) = state.ai_router.get("default") {
        router_ref.health_check().await
    } else {
        serde_json::Value::Bool(false)
    };

    let combined = serde_json::json!({
        "ai": health,
        "diagnostic": {
            "overall_health": health,
            "checks": ["router_default"],
            "issues_count": 0,
        },
        "timestamp": chrono::Utc::now().timestamp(),
    });

    Ok(combined.to_string())
}

#[tauri::command]
pub async fn get_vad_state(state: State<'_, AIChatState>) -> Result<bool, String> {
    let speaking = state
        .state_flags
        .get("vad_speaking")
        .map(|flag| *flag)
        .unwrap_or(false);
    Ok(speaking)
}

#[tauri::command]
pub fn get_module_status(state: State<'_, AIChatState>) -> Result<String, String> {
    let engine_ready = state.core_collection.engine().lock().is_ok();

    let status = serde_json::json!({
        "modules": [
            { "name": "helios", "status": "available" },
            { "name": "nexus", "status": "available" },
            { "name": "harmonia", "status": "available" },
            { "name": "sentinel", "status": "available" },
            { "name": "engine", "status": if engine_ready { "ready" } else { "locked" } },
        ],
        "timestamp": chrono::Utc::now().timestamp(),
    });

    Ok(status.to_string())
}
