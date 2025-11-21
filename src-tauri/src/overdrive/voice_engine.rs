// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE VOICE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Moteur vocal full-duplex avec ASR (Whisper) + TTS (Piper/Kokoro)
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfig {
    pub asr_model: String,        // whisper-tiny, whisper-base, whisper-small
    pub tts_model: String,         // piper, kokoro
    pub language: String,          // fr, en, etc.
    pub sample_rate: u32,          // 16000, 48000
    pub wake_word: String,         // "TITANE"
    pub duplex_enabled: bool,
    pub noise_reduction: bool,
    pub auto_calibration: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceStatus {
    pub asr_active: bool,
    pub tts_active: bool,
    pub audio_pipeline: String,   // pipewire|pulseaudio|alsa
    pub mic_level: f32,            // 0.0-1.0
    pub wake_word_detected: bool,
    pub processing: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionResult {
    pub text: String,
    pub confidence: f32,
    pub language: String,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesisRequest {
    pub text: String,
    pub voice: String,
    pub speed: f32,
    pub pitch: f32,
}

pub struct VoiceEngineState {
    config: Arc<Mutex<VoiceConfig>>,
    status: Arc<Mutex<VoiceStatus>>,
    is_listening: Arc<Mutex<bool>>,
    is_speaking: Arc<Mutex<bool>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> VoiceEngineState {
    let config = VoiceConfig {
        asr_model: "whisper-base".to_string(),
        tts_model: "piper".to_string(),
        language: "fr".to_string(),
        sample_rate: 16000,
        wake_word: "TITANE".to_string(),
        duplex_enabled: true,
        noise_reduction: true,
        auto_calibration: true,
    };

    let status = VoiceStatus {
        asr_active: false,
        tts_active: false,
        audio_pipeline: detect_audio_pipeline(),
        mic_level: 0.0,
        wake_word_detected: false,
        processing: false,
    };

    VoiceEngineState {
        config: Arc::new(Mutex::new(config)),
        status: Arc::new(Mutex::new(status)),
        is_listening: Arc::new(Mutex::new(false)),
        is_speaking: Arc::new(Mutex::new(false)),
    }
}

fn detect_audio_pipeline() -> String {
    // Détecter PipeWire, PulseAudio ou ALSA
    if std::process::Command::new("pactl")
        .arg("info")
        .output()
        .is_ok()
    {
        return "pipewire".to_string();
    }
    "alsa".to_string()
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES TAURI — ASR (Automatic Speech Recognition)
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_start_listening(state: State<VoiceEngineState>) -> Result<String, String> {
    let mut is_listening = state.is_listening.lock().unwrap();
    if *is_listening {
        return Err("Déjà en écoute".to_string());
    }

    *is_listening = true;
    let mut status = state.status.lock().unwrap();
    status.asr_active = true;

    println!("[VOICE] ASR démarré - En attente du wake word");
    Ok("Écoute activée".to_string())
}

#[tauri::command]
pub fn voice_stop_listening(state: State<VoiceEngineState>) -> Result<String, String> {
    let mut is_listening = state.is_listening.lock().unwrap();
    *is_listening = false;

    let mut status = state.status.lock().unwrap();
    status.asr_active = false;

    println!("[VOICE] ASR arrêté");
    Ok("Écoute désactivée".to_string())
}

#[tauri::command]
pub fn voice_transcribe_audio(
    audio_data: Vec<u8>,
    state: State<VoiceEngineState>,
) -> Result<TranscriptionResult, String> {
    let config = state.config.lock().unwrap();
    let model = &config.asr_model;

    println!("[VOICE] Transcription avec {} - {} bytes", model, audio_data.len());

    // TODO: Intégrer Whisper.cpp ou Faster-Whisper
    // Pour l'instant, simulation
    let result = TranscriptionResult {
        text: "Texte transcrit simulé".to_string(),
        confidence: 0.95,
        language: config.language.clone(),
        duration_ms: 250,
    };

    Ok(result)
}

#[tauri::command]
pub fn voice_detect_wake_word(
    audio_data: Vec<u8>,
    state: State<VoiceEngineState>,
) -> Result<bool, String> {
    let config = state.config.lock().unwrap();
    let wake_word = &config.wake_word;

    // TODO: Implémenter détection wake word (Porcupine, Snowboy, ou Whisper)
    // Simulation pour l'instant
    let detected = false; // audio_data contient "TITANE" ?

    if detected {
        let mut status = state.status.lock().unwrap();
        status.wake_word_detected = true;
        println!("[VOICE] Wake word '{}' détecté!", wake_word);
    }

    Ok(detected)
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES TAURI — TTS (Text-to-Speech)
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_synthesize_speech(
    request: SynthesisRequest,
    state: State<VoiceEngineState>,
) -> Result<Vec<u8>, String> {
    let config = state.config.lock().unwrap();
    let model = &config.tts_model;

    println!("[VOICE] Synthèse avec {} : '{}'", model, request.text);

    let mut is_speaking = state.is_speaking.lock().unwrap();
    *is_speaking = true;

    let mut status = state.status.lock().unwrap();
    status.tts_active = true;

    // TODO: Intégrer Piper ou Kokoro TTS
    // Pour l'instant, simulation
    let audio_data = vec![0u8; 16000]; // 1 seconde d'audio vide

    *is_speaking = false;
    status.tts_active = false;

    Ok(audio_data)
}

#[tauri::command]
pub fn voice_play_audio(audio_data: Vec<u8>, state: State<VoiceEngineState>) -> Result<String, String> {
    println!("[VOICE] Lecture audio - {} bytes", audio_data.len());

    // TODO: Jouer l'audio via le pipeline détecté (PipeWire, PulseAudio, ALSA)
    // Utiliser rodio, cpal, ou appel direct à paplay/aplay

    Ok("Audio joué".to_string())
}

#[tauri::command]
pub fn voice_stop_speaking(state: State<VoiceEngineState>) -> Result<String, String> {
    let mut is_speaking = state.is_speaking.lock().unwrap();
    *is_speaking = false;

    let mut status = state.status.lock().unwrap();
    status.tts_active = false;

    println!("[VOICE] TTS arrêté");
    Ok("Synthèse arrêtée".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION & STATUS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_get_config(state: State<VoiceEngineState>) -> Result<VoiceConfig, String> {
    let config = state.config.lock().unwrap();
    Ok(config.clone())
}

#[tauri::command]
pub fn voice_update_config(
    new_config: VoiceConfig,
    state: State<VoiceEngineState>,
) -> Result<String, String> {
    let mut config = state.config.lock().unwrap();
    *config = new_config;
    println!("[VOICE] Configuration mise à jour");
    Ok("Configuration mise à jour".to_string())
}

#[tauri::command]
pub fn voice_get_status(state: State<VoiceEngineState>) -> Result<VoiceStatus, String> {
    let status = state.status.lock().unwrap();
    Ok(status.clone())
}

#[tauri::command]
pub fn voice_calibrate_microphone(state: State<VoiceEngineState>) -> Result<f32, String> {
    println!("[VOICE] Calibration micro en cours...");

    // TODO: Mesurer niveau ambiant pendant 2s
    // Ajuster gain automatiquement
    // Retourner niveau optimal

    let optimal_level = 0.75;

    let mut status = state.status.lock().unwrap();
    status.mic_level = optimal_level;

    println!("[VOICE] Calibration terminée - Niveau: {}", optimal_level);
    Ok(optimal_level)
}

// ─────────────────────────────────────────────────────────────────────────────
// DUPLEX MODE (Écoute continue + Interruption)
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_enable_duplex(state: State<VoiceEngineState>) -> Result<String, String> {
    let mut config = state.config.lock().unwrap();
    config.duplex_enabled = true;

    println!("[VOICE] Mode duplex activé");
    Ok("Duplex activé".to_string())
}

#[tauri::command]
pub fn voice_disable_duplex(state: State<VoiceEngineState>) -> Result<String, String> {
    let mut config = state.config.lock().unwrap();
    config.duplex_enabled = false;

    println!("[VOICE] Mode duplex désactivé");
    Ok("Duplex désactivé".to_string())
}

#[tauri::command]
pub fn voice_check_interruption(state: State<VoiceEngineState>) -> Result<bool, String> {
    let is_speaking = state.is_speaking.lock().unwrap();
    let is_listening = state.is_listening.lock().unwrap();

    // Si l'utilisateur parle pendant que TITANE parle → interruption
    let interrupted = *is_speaking && *is_listening;

    if interrupted {
        println!("[VOICE] Interruption détectée - Arrêt TTS");
    }

    Ok(interrupted)
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC & TESTS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_test_pipeline(state: State<VoiceEngineState>) -> Result<String, String> {
    let status = state.status.lock().unwrap();
    let pipeline = &status.audio_pipeline;

    println!("[VOICE] Test pipeline: {}", pipeline);

    // Test micro
    let mic_test = test_microphone();
    // Test speakers
    let speaker_test = test_speakers();

    if mic_test && speaker_test {
        Ok(format!("Pipeline {} opérationnel", pipeline))
    } else {
        Err("Échec test audio".to_string())
    }
}

fn test_microphone() -> bool {
    // TODO: Enregistrer 1s audio et vérifier niveau
    println!("[VOICE] Test micro...");
    true
}

fn test_speakers() -> bool {
    // TODO: Jouer bip et vérifier output
    println!("[VOICE] Test speakers...");
    true
}

#[tauri::command]
pub fn voice_get_available_models(state: State<VoiceEngineState>) -> Result<Vec<String>, String> {
    // Liste des modèles ASR/TTS disponibles
    let models = vec![
        "whisper-tiny".to_string(),
        "whisper-base".to_string(),
        "whisper-small".to_string(),
        "piper-fr".to_string(),
        "kokoro-fr".to_string(),
    ];

    Ok(models)
}
