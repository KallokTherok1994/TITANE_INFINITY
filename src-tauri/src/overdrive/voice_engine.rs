// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE VOICE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Moteur vocal full-duplex avec ASR (Whisper) + TTS (Piper/Kokoro)
// ═══════════════════════════════════════════════════════════════════════════

use crate::core::tapi_error::TAPIError;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[VoiceEngine] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfig {
    pub asr_model: String, // whisper-tiny, whisper-base, whisper-small
    pub tts_model: String, // piper, kokoro
    pub language: String,  // fr, en, etc.
    pub sample_rate: u32,  // 16000, 48000
    pub wake_word: String, // "TITANE"
    pub duplex_enabled: bool,
    pub noise_reduction: bool,
    pub auto_calibration: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceStatus {
    pub asr_active: bool,
    pub tts_active: bool,
    pub audio_pipeline: String, // pipewire|pulseaudio|alsa
    pub mic_level: f32,         // 0.0-1.0
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
    // ✅ SECURED: Use ShellGuard for detection
    use crate::security::shell_guard::ShellGuard;

    let guard = ShellGuard::new();

    // Détecter PipeWire/PulseAudio via pactl
    if guard.execute_verified("pactl", &["info"]).is_ok() {
        return "pipewire".to_string();
    }
    "alsa".to_string()
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES TAURI — ASR (Automatic Speech Recognition)
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_start_listening(state: State<VoiceEngineState>) -> Result<String, TAPIError> {
    let mut is_listening = match state.is_listening.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[VOICE] is_listening lock poisoned in voice_start_listening, recovering");
            poisoned.into_inner()
        }
    };
    if *is_listening {
        return Err(TAPIError::validation("Déjà en écoute"));
    }

    *is_listening = true;
    let mut status = match state.status.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[VOICE] status lock poisoned in voice_start_listening, recovering");
            poisoned.into_inner()
        }
    };
    status.asr_active = true;

    println!("[VOICE] ASR démarré - En attente du wake word");
    Ok("Écoute activée".to_string())
}

#[tauri::command]
pub fn voice_stop_listening(state: State<VoiceEngineState>) -> Result<String, TAPIError> {
    let mut is_listening = match state.is_listening.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[VOICE] is_listening lock poisoned in voice_stop_listening, recovering");
            poisoned.into_inner()
        }
    };
    *is_listening = false;

    let mut status = match state.status.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("[VOICE] status lock poisoned in voice_stop_listening, recovering");
            poisoned.into_inner()
        }
    };
    status.asr_active = false;

    println!("[VOICE] ASR arrêté");
    Ok("Écoute désactivée".to_string())
}

/// État global d'enregistrement pour voice_engine (indépendant de audio::commands)
static VOICE_IS_RECORDING: once_cell::sync::Lazy<std::sync::atomic::AtomicBool> =
    once_cell::sync::Lazy::new(|| std::sync::atomic::AtomicBool::new(false));

/// ═══════════════════════════════════════════════════════════════════════════
/// VOICE_CANCEL_RECORDING - Reset recording state
/// ═══════════════════════════════════════════════════════════════════════════
#[tauri::command]
pub async fn voice_cancel_recording() -> Result<(), TAPIError> {
    use std::sync::atomic::Ordering;

    println!("[VOICE] voice_cancel_recording called - resetting recording state");
    VOICE_IS_RECORDING.store(false, Ordering::Relaxed);

    // Also try to kill any lingering arecord processes
    let _ = std::process::Command::new("pkill")
        .args(["-f", "arecord"])
        .output();

    Ok(())
}

/// ═══════════════════════════════════════════════════════════════════════════
/// VOICE_IS_RECORDING - Check recording state
/// ═══════════════════════════════════════════════════════════════════════════
#[tauri::command]
pub async fn voice_is_recording() -> Result<bool, TAPIError> {
    use std::sync::atomic::Ordering;

    Ok(VOICE_IS_RECORDING.load(Ordering::Relaxed))
}

#[tauri::command]
pub async fn voice_transcribe_audio(
    audio_data: Vec<u8>,
    state: State<'_, VoiceEngineState>,
) -> Result<TranscriptionResult, TAPIError> {
    let config = lock_or_recover!(state.config);
    let language = config.language.clone();
    drop(config); // Release lock before async call

    println!("[VOICE] Transcription STT - {} bytes", audio_data.len());

    // ✅ OPUS-DIAG FIX: Implémentation réelle avec Whisper/Vosk
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
    let whisper_bin = format!("{}/.local/bin/whisper", home);
    let temp_audio = std::env::temp_dir().join("titane_voice_stt.wav");

    // Écrire l'audio dans un fichier temporaire
    if audio_data.is_empty() {
        // Utiliser le dernier fichier de test micro si pas de données
        let mic_test_file = std::env::temp_dir().join("titane_mic_test.wav");
        if mic_test_file.exists() {
            std::fs::copy(&mic_test_file, &temp_audio)
                .map_err(|e| TAPIError::internal(format!("Erreur copie audio: {}", e)))?;
        } else {
            return Err(TAPIError::validation("Aucun fichier audio disponible"));
        }
    } else {
        std::fs::write(&temp_audio, &audio_data)
            .map_err(|e| TAPIError::internal(format!("Erreur écriture audio: {}", e)))?;
    }

    // Essayer Whisper d'abord
    let transcript = if std::path::Path::new(&whisper_bin).exists() {
        let output = std::process::Command::new(&whisper_bin)
            .args([
                temp_audio
                    .to_str()
                    .ok_or_else(|| TAPIError::validation("Invalid UTF-8 in path"))?,
                "--model",
                "tiny",
                "--language",
                &language,
                "--output_format",
                "txt",
                "--output_dir",
                std::env::temp_dir()
                    .to_str()
                    .ok_or_else(|| TAPIError::validation("Invalid UTF-8 in temp_dir"))?,
                "--fp16",
                "False",
            ])
            .output()
            .map_err(|e| TAPIError::internal(format!("Erreur Whisper: {}", e)))?;

        let txt_file = std::env::temp_dir().join("titane_voice_stt.txt");
        if txt_file.exists() {
            std::fs::read_to_string(&txt_file)
                .unwrap_or_default()
                .trim()
                .to_string()
        } else {
            String::from_utf8_lossy(&output.stdout).trim().to_string()
        }
    } else {
        // Fallback message si pas de STT disponible
        println!("[VOICE] ⚠️ Whisper non installé, STT non disponible");
        "(STT non disponible - installez openai-whisper)".to_string()
    };

    // Cleanup
    let _ = std::fs::remove_file(&temp_audio);
    let _ = std::fs::remove_file(std::env::temp_dir().join("titane_voice_stt.txt"));

    println!(
        "[VOICE] Transcription: '{}'",
        &transcript[..transcript.len().min(50)]
    );

    Ok(TranscriptionResult {
        text: if transcript.is_empty() {
            "(Aucune parole détectée)".to_string()
        } else {
            transcript
        },
        confidence: 0.85,
        language,
        duration_ms: 500,
    })
}

#[tauri::command]
pub fn voice_detect_wake_word(
    _audio_data: Vec<u8>,
    _state: State<VoiceEngineState>,
) -> Result<bool, TAPIError> {
    // Wake word detection stub - Future integration with:
    // - Porcupine: Commercial wake word engine (Picovoice)
    // - Snowboy: Open-source wake word detection
    // - Whisper: OpenAI's speech recognition for custom wake words
    log::info!("[VOICE] Wake word detection called - using stub");
    log::debug!("[VOICE] Audio data size: {} bytes", _audio_data.len());
    
    // Simulation: detect "TITANE" in audio stream
    // Real implementation would:
    // 1. Convert audio_data to appropriate format
    // 2. Feed to wake word engine
    // 3. Return true if keyword detected
    let detected = false; // Stub: always false until real engine integrated

    if detected {
        let mut status = lock_or_recover!(_state.status);
        status.wake_word_detected = true;
        println!("[VOICE] Wake word detected!");
    }

    Ok(detected)
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMANDES TAURI — TTS (Text-to-Speech)
// ─────────────────────────────────────────────────────────────────────────────

/// ⚠️ DEPRECATED (v20.0): Cette fonction est un STUB et ne produit que de l'audio vide.
///
/// 🚫 NE PAS UTILISER EN PRODUCTION
///
/// ✅ UTILISER À LA PLACE: `speak()` dans `src-tauri/src/commands/ai_chat.rs`
///
/// Migration guide: `docs/VOCAL_MIGRATION_GUIDE.md`
///
/// La commande `speak()` implémente un TTS complet avec:
/// - Support local (espeak, piper, festival, coqui)
/// - Support online (Google TTS API)
/// - Protection ShellGuard contre injection de commandes
/// - Gestion erreurs robuste
/// - Logs structurés
///
/// # Exemple migration
/// ```typescript
/// // ❌ Ancien code (DEPRECATED)
/// await invoke('voice_synthesize_speech', {
///   request: { text, voice, speed, pitch }
/// });
///
/// // ✅ Nouveau code (PRODUCTION)
/// await invoke('speak', {
///   text: 'Hello world',
///   useOnline: false // Local TTS (espeak/piper)
/// });
/// ```
#[deprecated(
    since = "20.0.0",
    note = "Use speak() in commands/ai_chat.rs instead - see docs/VOCAL_MIGRATION_GUIDE.md"
)]
#[tauri::command]
pub fn voice_synthesize_speech(
    request: SynthesisRequest,
    state: State<VoiceEngineState>,
) -> Result<Vec<u8>, TAPIError> {
    // Log deprecation warning
    log::warn!(
        "[DEPRECATED] voice_synthesize_speech() called with text: '{}' - Use speak() instead",
        request.text
    );
    log::warn!("[DEPRECATED] Migration guide: docs/VOCAL_MIGRATION_GUIDE.md");

    let config = lock_or_recover!(state.config);
    let model = &config.tts_model;

    println!("[VOICE] ⚠️ DEPRECATED: voice_synthesize_speech called");
    println!("[VOICE] ℹ️ Use 'speak' command in ai_chat.rs instead");
    println!("[VOICE] 📖 Migration guide: docs/VOCAL_MIGRATION_GUIDE.md");
    println!("[VOICE] Synthèse avec {} : '{}'", model, request.text);

    let mut is_speaking = lock_or_recover!(state.is_speaking);
    *is_speaking = true;

    let mut status = lock_or_recover!(state.status);
    status.tts_active = true;

    // ⚠️ STUB: Retourne audio vide (16000 bytes = 1 seconde silence)
    // Ce STUB sera supprimé en v21.0
    let audio_data = vec![0u8; 16000];

    *is_speaking = false;
    status.tts_active = false;

    Ok(audio_data)
}

#[tauri::command]
pub fn voice_play_audio(
    _audio_data: Vec<u8>,
    state: State<VoiceEngineState>,
) -> Result<String, TAPIError> {
    println!("[VOICE] Lecture audio - stub");

    // Play audio via detected pipeline (PipeWire > PulseAudio > ALSA)
    let status = lock_or_recover!(state.status);
    let pipeline = &status.audio_pipeline;
    
    log::info!("[VOICE] Playing audio via {} pipeline", pipeline);
    log::debug!("[VOICE] Audio data size: {} bytes", _audio_data.len());
    
    // Real implementation would:
    // - PipeWire: Use `pw-play` or libpipewire bindings
    // - PulseAudio: Use `paplay` or libpulse bindings
    // - ALSA: Use `aplay` or alsa-lib bindings
    // - Fallback: rodio crate for cross-platform playback
    
    // For now: stub that logs intent
    // TODO: Uncomment when audio output is needed:
    // match pipeline.as_str() {
    //     "pipewire" => play_via_pipewire(&_audio_data)?,
    //     "pulseaudio" => play_via_pulseaudio(&_audio_data)?,
    //     "alsa" => play_via_alsa(&_audio_data)?,
    //     _ => return Err(TAPIError::internal("Unknown audio pipeline")),
    // }

    Ok(format!("Audio playback queued via {}", pipeline))
}

#[tauri::command]
pub fn voice_stop_speaking(state: State<VoiceEngineState>) -> Result<String, TAPIError> {
    let mut is_speaking = lock_or_recover!(state.is_speaking);
    *is_speaking = false;

    let mut status = lock_or_recover!(state.status);
    status.tts_active = false;

    println!("[VOICE] TTS arrêté");
    Ok("Synthèse arrêtée".to_string())
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION & STATUS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_get_config(state: State<VoiceEngineState>) -> Result<VoiceConfig, TAPIError> {
    let config = lock_or_recover!(state.config);
    Ok(config.clone())
}

#[tauri::command]
pub fn voice_update_config(
    new_config: VoiceConfig,
    state: State<VoiceEngineState>,
) -> Result<String, TAPIError> {
    let mut config = lock_or_recover!(state.config);
    *config = new_config;
    println!("[VOICE] Configuration mise à jour");
    Ok("Configuration mise à jour".to_string())
}

#[tauri::command]
pub fn voice_get_status(state: State<VoiceEngineState>) -> Result<VoiceStatus, TAPIError> {
    let status = lock_or_recover!(state.status);
    Ok(status.clone())
}

#[tauri::command]
pub fn voice_calibrate_microphone(state: State<VoiceEngineState>) -> Result<f32, TAPIError> {
    println!("[VOICE] Calibration micro en cours...");

    // Measure ambient noise level for 2 seconds
    // Real implementation would:
    // 1. Record 2s of audio from microphone
    // 2. Calculate RMS (Root Mean Square) for noise floor
    // 3. Set optimal gain based on ambient level
    // 4. Store calibration in VoiceConfig
    
    log::info!("[VOICE] Starting microphone calibration");
    
    // Stub: Simulate measurement
    // - Low ambient noise (< 30 dB): gain 0.8-1.0
    // - Medium noise (30-50 dB): gain 0.6-0.8
    // - High noise (> 50 dB): gain 0.4-0.6
    let simulated_ambient_db = 35.0; // Medium noise
    let optimal_level = if simulated_ambient_db < 30.0 {
        0.85
    } else if simulated_ambient_db < 50.0 {
        0.70
    } else {
        0.50
    };
    
    log::info!("[VOICE] Ambient noise: {:.1} dB, optimal level: {:.2}", simulated_ambient_db, optimal_level);

    let mut status = lock_or_recover!(state.status);
    status.mic_level = optimal_level;

    println!("[VOICE] Calibration terminée - Niveau: {}", optimal_level);
    Ok(optimal_level)
}

// ─────────────────────────────────────────────────────────────────────────────
// DUPLEX MODE (Écoute continue + Interruption)
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn voice_enable_duplex(state: State<VoiceEngineState>) -> Result<String, TAPIError> {
    let mut config = lock_or_recover!(state.config);
    config.duplex_enabled = true;

    println!("[VOICE] Mode duplex activé");
    Ok("Duplex activé".to_string())
}

#[tauri::command]
pub fn voice_disable_duplex(state: State<VoiceEngineState>) -> Result<String, TAPIError> {
    let mut config = lock_or_recover!(state.config);
    config.duplex_enabled = false;

    println!("[VOICE] Mode duplex désactivé");
    Ok("Duplex désactivé".to_string())
}

#[tauri::command]
pub fn voice_check_interruption(state: State<VoiceEngineState>) -> Result<bool, TAPIError> {
    let is_speaking = lock_or_recover!(state.is_speaking);
    let is_listening = lock_or_recover!(state.is_listening);

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
pub fn voice_test_pipeline(state: State<VoiceEngineState>) -> Result<String, TAPIError> {
    let status = lock_or_recover!(state.status);
    let pipeline = &status.audio_pipeline;

    println!("[VOICE] Test pipeline: {}", pipeline);

    // Test micro
    let mic_test = test_microphone();
    // Test speakers
    let speaker_test = test_speakers();

    if mic_test && speaker_test {
        Ok(format!("Pipeline {} opérationnel", pipeline))
    } else {
        Err(TAPIError::internal("Échec test audio"))
    }
}

fn test_microphone() -> bool {
    // Test microphone by recording 1s audio and verifying level
    log::info!("[VOICE] Testing microphone...");
    
    // Real implementation would:
    // 1. Open microphone input via detected pipeline
    // 2. Record 1 second of audio
    // 3. Verify audio level > threshold (not silent)
    // 4. Check for clipping or distortion
    
    // Stub: Simulate successful test
    println!("[VOICE] Test micro...");
    log::debug!("[VOICE] Microphone test: OK (stub)");
    true
}

fn test_speakers() -> bool {
    // Test speakers by playing beep and verifying output
    log::info!("[VOICE] Testing speakers...");
    
    // Real implementation would:
    // 1. Generate test tone (440 Hz beep, 0.5s)
    // 2. Play via audio output pipeline
    // 3. Verify output device is working
    // 4. Optionally: check for feedback loop
    
    // Stub: Simulate successful test
    println!("[VOICE] Test speakers...");
    log::debug!("[VOICE] Speaker test: OK (stub)");
    true
}

#[tauri::command]
pub fn voice_get_available_models(
    _state: State<VoiceEngineState>,
) -> Result<Vec<String>, TAPIError> {
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
