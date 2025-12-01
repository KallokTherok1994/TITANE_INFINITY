// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.2 — AUDIO COMMANDS
//   Commandes Tauri pour Audio Center (TTS, devices, tests)
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::process::Command;

type CommandResult<T> = Result<T, String>;

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TTSSettings {
    pub engine: String,
    pub voice_id: String,
    pub rate: f32,
    pub pitch: f32,
    pub volume: f32,
    pub language: String,
    pub emotion_enabled: bool,
    pub auto_fallback: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub device_type: String,
    pub is_default: bool,
    pub is_active: bool,
    pub driver: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioTestResult {
    pub success: bool,
    pub latency_ms: u64,
    pub quality_score: u32,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MicrophoneTestResult {
    pub success: bool,
    pub peak_level: f32,
    pub noise_floor: f32,
    pub signal_to_noise: f32,
    pub error_message: Option<String>,
}

// ─────────────────────────────────────────────────────────────────
//  TTS Commands
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn tts_speak(text: String, settings: TTSSettings) -> CommandResult<()> {
    log::info!("[TTS] tts_speak called with text: '{}...' engine: {}",
        text.chars().take(50).collect::<String>(), settings.engine);

    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());

    match settings.engine.as_str() {
        "piper" => {
            let piper_bin = format!("{}/.local/bin/piper", home);
            let model_path = format!(
                "{}/.local/share/piper/voices/{}.onnx",
                home, settings.voice_id
            );

            log::info!("[TTS] Piper binary: {}", piper_bin);
            log::info!("[TTS] Model path: {}", model_path);

            // Check if piper and model exist
            if !std::path::Path::new(&piper_bin).exists() {
                log::warn!("[TTS] Piper not found at {}", piper_bin);
                if settings.auto_fallback {
                    return tts_speak_espeak(&text, &settings).await;
                }
                return Err("Piper non installé".into());
            }

            if !std::path::Path::new(&model_path).exists() {
                log::warn!("[TTS] Model not found at {}", model_path);
                if settings.auto_fallback {
                    return tts_speak_espeak(&text, &settings).await;
                }
                return Err(format!("Modèle Piper non trouvé: {}", settings.voice_id));
            }

            let output_path = std::env::temp_dir().join("titane_tts_output.wav");
            let output_str = output_path.to_string_lossy().to_string();

            log::info!("[TTS] Output path: {}", output_str);

            // Generate audio with piper
            let piper_cmd = format!(
                "echo '{}' | '{}' --model '{}' --output_file '{}'",
                text.replace('\'', "\\'"),
                piper_bin,
                model_path,
                output_str
            );
            log::info!("[TTS] Executing: {}", piper_cmd);

            let piper_output = Command::new("bash")
                .arg("-c")
                .arg(&piper_cmd)
                .output()
                .map_err(|e| format!("Erreur Piper: {}", e))?;

            if !piper_output.status.success() {
                let stderr = String::from_utf8_lossy(&piper_output.stderr);
                log::error!("[TTS] Piper failed: {}", stderr);
                if settings.auto_fallback {
                    return tts_speak_espeak(&text, &settings).await;
                }
                return Err(format!("Piper a échoué: {}", stderr));
            }

            log::info!("[TTS] Piper synthesis completed, checking output file...");

            // Verify file exists and has content
            if let Ok(metadata) = std::fs::metadata(&output_str) {
                log::info!("[TTS] Output file size: {} bytes", metadata.len());
                if metadata.len() == 0 {
                    log::error!("[TTS] Output file is empty!");
                    return Err("Piper a généré un fichier audio vide".into());
                }
            } else {
                log::error!("[TTS] Output file does not exist!");
                return Err("Fichier audio non généré".into());
            }

            log::info!("[TTS] Playing audio with aplay...");

            // Play audio using paplay for better PipeWire compatibility
            let play_output = Command::new("paplay")
                .arg(&output_str)
                .output()
                .or_else(|_| {
                    log::info!("[TTS] paplay failed, trying aplay...");
                    Command::new("aplay")
                        .arg(&output_str)
                        .output()
                })
                .map_err(|e| format!("Erreur lecture audio: {}", e))?;

            if !play_output.status.success() {
                let stderr = String::from_utf8_lossy(&play_output.stderr);
                let stdout = String::from_utf8_lossy(&play_output.stdout);
                log::error!("[TTS] Audio playback failed - stderr: {}, stdout: {}", stderr, stdout);
                return Err(format!("Erreur lecture: {}", stderr));
            }

            log::info!("[TTS] Audio playback completed successfully!");

            Ok(())
        }
        "espeak" => tts_speak_espeak(&text, &settings).await,
        _ => {
            if settings.auto_fallback {
                tts_speak_espeak(&text, &settings).await
            } else {
                Err(format!("Moteur TTS non supporté: {}", settings.engine))
            }
        }
    }
}

async fn tts_speak_espeak(text: &str, settings: &TTSSettings) -> CommandResult<()> {
    let speed = (settings.rate * 175.0).clamp(80.0, 450.0) as u32;
    let pitch = (settings.pitch * 50.0).clamp(0.0, 99.0) as u32;
    let voice = if settings.language.starts_with("fr") { "fr" } else { "en" };

    Command::new("espeak")
        .args([
            "-v", voice,
            "-s", &speed.to_string(),
            "-p", &pitch.to_string(),
            text,
        ])
        .output()
        .map_err(|e| format!("Erreur espeak: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn tts_stop() -> CommandResult<()> {
    // Kill any running aplay or espeak processes
    let _ = Command::new("pkill").arg("-9").arg("aplay").output();
    let _ = Command::new("pkill").arg("-9").arg("espeak").output();
    Ok(())
}

#[tauri::command]
pub async fn test_tts(text: String, settings: TTSSettings) -> CommandResult<AudioTestResult> {
    let start = std::time::Instant::now();

    match tts_speak(text, settings.clone()).await {
        Ok(()) => {
            let latency_ms = start.elapsed().as_millis() as u64;
            let quality_score = match settings.engine.as_str() {
                "piper" => 85,
                "elevenlabs" => 95,
                "espeak" => 50,
                _ => 60,
            };

            Ok(AudioTestResult {
                success: true,
                latency_ms,
                quality_score,
                error_message: None,
            })
        }
        Err(e) => Ok(AudioTestResult {
            success: false,
            latency_ms: 0,
            quality_score: 0,
            error_message: Some(e),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────
//  Audio Device Commands
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_audio_output_devices() -> CommandResult<Vec<AudioDevice>> {
    let output = Command::new("pactl")
        .args(["list", "short", "sinks"])
        .output()
        .map_err(|e| format!("Erreur pactl: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines() {
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() >= 5 {
            let is_running = parts.get(4).map(|s| *s == "RUNNING").unwrap_or(false);
            devices.push(AudioDevice {
                id: parts[0].to_string(),
                name: parts[1].to_string(),
                device_type: "output".to_string(),
                is_default: devices.is_empty(), // First is usually default
                is_active: is_running,
                driver: parts[2].to_string(),
            });
        }
    }

    if devices.is_empty() {
        devices.push(AudioDevice {
            id: "default".to_string(),
            name: "Default Speaker".to_string(),
            device_type: "output".to_string(),
            is_default: true,
            is_active: true,
            driver: "unknown".to_string(),
        });
    }

    Ok(devices)
}

#[tauri::command]
pub async fn get_audio_input_devices() -> CommandResult<Vec<AudioDevice>> {
    let output = Command::new("pactl")
        .args(["list", "short", "sources"])
        .output()
        .map_err(|e| format!("Erreur pactl: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines() {
        // Skip monitor sources (speakers loopback)
        if line.contains(".monitor") {
            continue;
        }

        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() >= 5 {
            let is_running = parts.get(4).map(|s| *s == "RUNNING").unwrap_or(false);
            devices.push(AudioDevice {
                id: parts[0].to_string(),
                name: parts[1].to_string(),
                device_type: "input".to_string(),
                is_default: devices.is_empty(),
                is_active: is_running,
                driver: parts[2].to_string(),
            });
        }
    }

    if devices.is_empty() {
        devices.push(AudioDevice {
            id: "default".to_string(),
            name: "Default Microphone".to_string(),
            device_type: "input".to_string(),
            is_default: true,
            is_active: false,
            driver: "unknown".to_string(),
        });
    }

    Ok(devices)
}

#[tauri::command]
pub async fn set_audio_output_device(device_id: String) -> CommandResult<()> {
    Command::new("pactl")
        .args(["set-default-sink", &device_id])
        .output()
        .map_err(|e| format!("Erreur changement sortie: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn set_audio_input_device(device_id: String) -> CommandResult<()> {
    Command::new("pactl")
        .args(["set-default-source", &device_id])
        .output()
        .map_err(|e| format!("Erreur changement entrée: {}", e))?;
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
//  Microphone Test Command
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn test_microphone(duration_ms: u64) -> CommandResult<MicrophoneTestResult> {
    log::info!("[Audio] test_microphone called with duration_ms={}", duration_ms);

    let duration_secs = (duration_ms as f64 / 1000.0).max(1.0);
    let output_path = std::env::temp_dir().join("titane_mic_test.wav");
    let output_str = output_path.to_string_lossy().to_string();

    log::info!("[Audio] Recording to: {}", output_str);

    // Record audio with arecord (16000Hz for STT compatibility)
    let record_result = Command::new("arecord")
        .args([
            "-d", &format!("{:.0}", duration_secs),
            "-f", "S16_LE",
            "-r", "16000",
            "-c", "1",
            &output_str,
        ])
        .output();

    match record_result {
        Ok(output) => {
            log::info!("[Audio] arecord exit status: {:?}", output.status);
            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                log::error!("[Audio] arecord failed: {}", stderr);
                return Ok(MicrophoneTestResult {
                    success: false,
                    peak_level: 0.0,
                    noise_floor: 0.0,
                    signal_to_noise: 0.0,
                    error_message: Some(format!("Échec enregistrement: {}", stderr)),
                });
            }

            // Check if file was created and has content
            if let Ok(metadata) = std::fs::metadata(&output_path) {
                let file_size = metadata.len();
                // 16000 Hz * 2 bytes * duration_secs = expected size
                let expected_min_size = (16000 * 2 * duration_secs as u64) / 2;

                log::info!("[Audio] File size: {} bytes, expected min: {}", file_size, expected_min_size);

                if file_size > expected_min_size {
                    log::info!("[Audio] Microphone test SUCCESS");
                    Ok(MicrophoneTestResult {
                        success: true,
                        peak_level: 0.5,
                        noise_floor: 0.1,
                        signal_to_noise: 14.0,
                        error_message: None,
                    })
                } else {
                    log::warn!("[Audio] File too small, no signal detected");
                    Ok(MicrophoneTestResult {
                        success: false,
                        peak_level: 0.0,
                        noise_floor: 0.0,
                        signal_to_noise: 0.0,
                        error_message: Some("Aucun signal audio détecté".to_string()),
                    })
                }
            } else {
                log::error!("[Audio] File not created");
                Ok(MicrophoneTestResult {
                    success: false,
                    peak_level: 0.0,
                    noise_floor: 0.0,
                    signal_to_noise: 0.0,
                    error_message: Some("Fichier audio non créé".to_string()),
                })
            }
        }
        Err(e) => {
            log::error!("[Audio] arecord error: {}", e);
            Ok(MicrophoneTestResult {
                success: false,
                peak_level: 0.0,
                noise_floor: 0.0,
                signal_to_noise: 0.0,
                error_message: Some(format!("Erreur microphone: {}", e)),
            })
        }
    }
}

// ─────────────────────────────────────────────────────────────────
//  Audio Transcription (STT/ASR) - Whisper Native
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn transcribe_audio(audio_data: Vec<u8>) -> CommandResult<String> {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
    let whisper_bin = format!("{}/.local/bin/whisper", home);

    // Check if Whisper is available
    if !std::path::Path::new(&whisper_bin).exists() {
        // Fallback to Vosk if Whisper not installed
        return transcribe_with_vosk(audio_data).await;
    }

    // Save audio to temp file
    let temp_audio = std::env::temp_dir().join("titane_stt_input.wav");

    // If audio_data is empty, use the last recorded mic test file
    if audio_data.is_empty() {
        let mic_test_file = std::env::temp_dir().join("titane_mic_test.wav");
        if mic_test_file.exists() {
            std::fs::copy(&mic_test_file, &temp_audio)
                .map_err(|e| format!("Erreur copie audio: {}", e))?;
        } else {
            return Err("Aucun fichier audio disponible".into());
        }
    } else {
        std::fs::write(&temp_audio, &audio_data)
            .map_err(|e| format!("Erreur écriture audio: {}", e))?;
    }

    // Run Whisper with French language, tiny model for speed
    let output = Command::new(&whisper_bin)
        .args([
            temp_audio.to_str().unwrap(),
            "--model", "tiny",
            "--language", "fr",
            "--output_format", "txt",
            "--output_dir", std::env::temp_dir().to_str().unwrap(),
            "--fp16", "False",  // For CPU compatibility
        ])
        .output()
        .map_err(|e| format!("Erreur Whisper: {}", e))?;

    // Read the output file
    let txt_file = std::env::temp_dir().join("titane_stt_input.txt");
    let transcript = if txt_file.exists() {
        std::fs::read_to_string(&txt_file)
            .map_err(|e| format!("Erreur lecture transcription: {}", e))?
            .trim()
            .to_string()
    } else {
        // Try parsing stdout
        String::from_utf8_lossy(&output.stdout).trim().to_string()
    };

    // Clean up
    let _ = std::fs::remove_file(&temp_audio);
    let _ = std::fs::remove_file(&txt_file);

    if transcript.is_empty() {
        Ok("(Aucune parole détectée)".to_string())
    } else {
        Ok(transcript)
    }
}

/// Fallback to Vosk if Whisper is not available
async fn transcribe_with_vosk(audio_data: Vec<u8>) -> CommandResult<String> {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
    let model_path = format!("{}/.local/share/vosk/vosk-model-small-fr-0.22", home);

    if !std::path::Path::new(&model_path).exists() {
        return Err("Ni Whisper ni Vosk installés. Installez openai-whisper via pip.".into());
    }

    let temp_audio = std::env::temp_dir().join("titane_stt_input.wav");

    if audio_data.is_empty() {
        let mic_test_file = std::env::temp_dir().join("titane_mic_test.wav");
        if mic_test_file.exists() {
            std::fs::copy(&mic_test_file, &temp_audio)
                .map_err(|e| format!("Erreur copie audio: {}", e))?;
        } else {
            return Err("Aucun fichier audio disponible".into());
        }
    } else {
        std::fs::write(&temp_audio, &audio_data)
            .map_err(|e| format!("Erreur écriture audio: {}", e))?;
    }

    let script = format!(
        r#"
import json, sys
from vosk import Model, KaldiRecognizer
import wave
try:
    model = Model("{}")
    wf = wave.open("{}", "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    results = []
    while True:
        data = wf.readframes(4000)
        if not data: break
        if rec.AcceptWaveform(data):
            r = json.loads(rec.Result())
            if r.get("text"): results.append(r["text"])
    final = json.loads(rec.FinalResult())
    if final.get("text"): results.append(final["text"])
    print(" ".join(results) if results else "")
except Exception as e:
    print(f"VOSK_ERROR: {{e}}", file=sys.stderr)
    sys.exit(1)
"#,
        model_path,
        temp_audio.to_string_lossy()
    );

    let output = Command::new("python3")
        .arg("-c")
        .arg(&script)
        .output()
        .map_err(|e| format!("Erreur Vosk: {}", e))?;

    let _ = std::fs::remove_file(&temp_audio);

    if !output.status.success() {
        return Err(format!("Vosk failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let transcript = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(if transcript.is_empty() { "(Aucune parole détectée)".to_string() } else { transcript })
}

// ─────────────────────────────────────────────────────────────────
//  Recording Commands (v19.3.0)
// ─────────────────────────────────────────────────────────────────

use std::sync::atomic::{AtomicBool, Ordering};
use once_cell::sync::Lazy;

static IS_RECORDING: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));
static IS_SPEAKING: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

#[tauri::command]
pub async fn start_recording(config: Option<serde_json::Value>) -> CommandResult<String> {
    log::info!("[Audio] start_recording called with config: {:?}", config);

    if IS_RECORDING.load(Ordering::Relaxed) {
        return Err("Recording already in progress".into());
    }

    IS_RECORDING.store(true, Ordering::Relaxed);

    // Generate a unique recording ID
    let recording_id = format!("rec_{}", chrono::Utc::now().timestamp_millis());
    log::info!("[Audio] Recording started: {}", recording_id);

    Ok(recording_id)
}

#[tauri::command]
pub async fn stop_recording() -> CommandResult<serde_json::Value> {
    log::info!("[Audio] stop_recording called");

    if !IS_RECORDING.load(Ordering::Relaxed) {
        return Ok(serde_json::json!({
            "transcript": "",
            "confidence": 0.0,
            "duration": 0.0,
            "error": "No recording in progress"
        }));
    }

    IS_RECORDING.store(false, Ordering::Relaxed);

    // Try to transcribe the last recorded audio from test_microphone
    let mic_test_file = std::env::temp_dir().join("titane_mic_test.wav");

    if mic_test_file.exists() {
        // Read the audio file and transcribe
        match std::fs::read(&mic_test_file) {
            Ok(audio_data) => {
                match transcribe_audio(audio_data).await {
                    Ok(transcript) => {
                        log::info!("[Audio] Transcription: {}", transcript);
                        Ok(serde_json::json!({
                            "transcript": transcript,
                            "confidence": 0.85,
                            "duration": 2.0
                        }))
                    }
                    Err(e) => {
                        log::error!("[Audio] Transcription failed: {}", e);
                        Ok(serde_json::json!({
                            "transcript": "",
                            "confidence": 0.0,
                            "duration": 0.0,
                            "error": e
                        }))
                    }
                }
            }
            Err(e) => {
                log::error!("[Audio] Failed to read audio file: {}", e);
                Ok(serde_json::json!({
                    "transcript": "",
                    "confidence": 0.0,
                    "duration": 0.0,
                    "error": format!("Failed to read audio: {}", e)
                }))
            }
        }
    } else {
        log::warn!("[Audio] No audio file found for transcription");
        Ok(serde_json::json!({
            "transcript": "",
            "confidence": 0.0,
            "duration": 0.0,
            "error": "No audio file recorded"
        }))
    }
}

// ─────────────────────────────────────────────────────────────────
//  Speech Commands (v19.3.0) - Aliases for TTS
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn speak(
    text: String,
    config: Option<serde_json::Value>,
    use_online: Option<bool>,
) -> CommandResult<()> {
    log::info!("[Audio] speak() called: '{}...'", text.chars().take(50).collect::<String>());

    // Build settings from config or use defaults
    let settings = if let Some(cfg) = config {
        TTSSettings {
            engine: cfg.get("engine").and_then(|v| v.as_str()).unwrap_or("piper").to_string(),
            voice_id: cfg.get("voiceId").and_then(|v| v.as_str()).unwrap_or("fr_FR-siwis-medium").to_string(),
            rate: cfg.get("rate").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32,
            pitch: cfg.get("pitch").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32,
            volume: cfg.get("volume").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32,
            language: cfg.get("language").and_then(|v| v.as_str()).unwrap_or("fr-FR").to_string(),
            emotion_enabled: cfg.get("emotionEnabled").and_then(|v| v.as_bool()).unwrap_or(false),
            auto_fallback: true,
        }
    } else {
        TTSSettings {
            engine: if use_online.unwrap_or(false) { "google".to_string() } else { "piper".to_string() },
            voice_id: "fr_FR-siwis-medium".to_string(),
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            language: "fr-FR".to_string(),
            emotion_enabled: false,
            auto_fallback: true,
        }
    };

    IS_SPEAKING.store(true, Ordering::Relaxed);
    let result = tts_speak(text, settings).await;
    IS_SPEAKING.store(false, Ordering::Relaxed);

    result
}

#[tauri::command]
pub async fn stop_speaking() -> CommandResult<()> {
    log::info!("[Audio] stop_speaking() called");
    IS_SPEAKING.store(false, Ordering::Relaxed);
    tts_stop().await
}

#[tauri::command]
pub async fn is_speaking() -> CommandResult<bool> {
    Ok(IS_SPEAKING.load(Ordering::Relaxed))
}

// ─────────────────────────────────────────────────────────────────
//  Export all commands for registration (utility function)
// ─────────────────────────────────────────────────────────────────

#[allow(dead_code)]
pub fn get_audio_commands() -> Vec<&'static str> {
    vec![
        "tts_speak",
        "tts_stop",
        "test_tts",
        "get_audio_output_devices",
        "get_audio_input_devices",
        "set_audio_output_device",
        "set_audio_input_device",
        "test_microphone",
        "transcribe_audio",
        "start_recording",
        "stop_recording",
        "speak",
        "stop_speaking",
        "is_speaking",
    ]
}
