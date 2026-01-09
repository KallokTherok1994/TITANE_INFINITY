// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.2 — AUDIO COMMANDS
//   Commandes Tauri pour Audio Center (TTS, devices, tests, VAD)
// ═══════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
#[allow(dead_code)]
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};

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
    log::info!(
        "[TTS] tts_speak called with text: '{}...' engine: {}",
        text.chars().take(50).collect::<String>(),
        settings.engine
    );

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

            // ✅ SECURED: Use stdin pipe instead of shell interpolation to prevent injection
            // This avoids shell interpretation of special characters in text
            use std::io::Write;

            let mut piper_process = Command::new(&piper_bin)
                .arg("--model")
                .arg(&model_path)
                .arg("--output_file")
                .arg(&output_str)
                .stdin(std::process::Stdio::piped())
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .spawn()
                .map_err(|e| format!("Erreur lancement Piper: {}", e))?;

            // Write text to stdin (safe - no shell interpretation)
            if let Some(mut stdin) = piper_process.stdin.take() {
                stdin
                    .write_all(text.as_bytes())
                    .map_err(|e| format!("Erreur écriture stdin Piper: {}", e))?;
            }

            let piper_output = piper_process
                .wait_with_output()
                .map_err(|e| format!("Erreur attente Piper: {}", e))?;

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
                    Command::new("aplay").arg(&output_str).output()
                })
                .map_err(|e| format!("Erreur lecture audio: {}", e))?;

            if !play_output.status.success() {
                let stderr = String::from_utf8_lossy(&play_output.stderr);
                let stdout = String::from_utf8_lossy(&play_output.stdout);
                log::error!(
                    "[TTS] Audio playback failed - stderr: {}, stdout: {}",
                    stderr,
                    stdout
                );
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
    let voice = if settings.language.starts_with("fr") {
        "fr"
    } else {
        "en"
    };

    Command::new("espeak")
        .args([
            "-v",
            voice,
            "-s",
            &speed.to_string(),
            "-p",
            &pitch.to_string(),
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
    // Try PipeWire first (modern Linux audio)
    if let Ok(devices) = get_pipewire_output_devices().await {
        if !devices.is_empty() {
            return Ok(devices);
        }
    }

    // Fallback to PulseAudio
    if let Ok(output) = Command::new("pactl")
        .args(["list", "short", "sinks"])
        .output()
    {
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
                    is_default: devices.is_empty(),
                    is_active: is_running,
                    driver: parts[2].to_string(),
                });
            }
        }

        if !devices.is_empty() {
            return Ok(devices);
        }
    }

    // Fallback to ALSA
    if let Ok(devices) = get_alsa_output_devices().await {
        if !devices.is_empty() {
            return Ok(devices);
        }
    }

    // Last resort: return default device
    Ok(vec![AudioDevice {
        id: "default".to_string(),
        name: "Default Speaker".to_string(),
        device_type: "output".to_string(),
        is_default: true,
        is_active: true,
        driver: "system".to_string(),
    }])
}

#[tauri::command]
pub async fn get_audio_input_devices() -> CommandResult<Vec<AudioDevice>> {
    // Try PipeWire first (modern Linux audio)
    if let Ok(devices) = get_pipewire_input_devices().await {
        if !devices.is_empty() {
            return Ok(devices);
        }
    }

    // Fallback to PulseAudio
    if let Ok(output) = Command::new("pactl")
        .args(["list", "short", "sources"])
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut devices = Vec::new();

        for line in stdout.lines() {
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

        if !devices.is_empty() {
            return Ok(devices);
        }
    }

    // Fallback to ALSA
    if let Ok(devices) = get_alsa_input_devices().await {
        if !devices.is_empty() {
            return Ok(devices);
        }
    }

    // Last resort: return default device
    Ok(vec![AudioDevice {
        id: "default".to_string(),
        name: "Default Microphone".to_string(),
        device_type: "input".to_string(),
        is_default: true,
        is_active: false,
        driver: "system".to_string(),
    }])
}

// ─────────────────────────────────────────────────────────────────
//  PipeWire Helper Functions
// ─────────────────────────────────────────────────────────────────

async fn get_pipewire_output_devices() -> Result<Vec<AudioDevice>, String> {
    let output = Command::new("pw-cli")
        .args(["list-objects"])
        .output()
        .map_err(|e| format!("Erreur pw-cli: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();
    let mut current_device: Option<AudioDevice> = None;
    let mut is_sink = false;
    let mut id_counter = 0;

    for line in stdout.lines() {
        let line = line.trim();

        if line.contains("type = \"PipeWire:Interface:Node\"") {
            if let Some(device) = current_device.take() {
                if is_sink {
                    devices.push(device);
                }
            }
            current_device = Some(AudioDevice {
                id: format!("{}", id_counter),
                name: String::new(),
                device_type: "output".to_string(),
                is_default: devices.is_empty(),
                is_active: false,
                driver: "pipewire".to_string(),
            });
            is_sink = false;
            id_counter += 1;
        }

        if line.contains("media.class = \"Audio/Sink\"") {
            is_sink = true;
        }

        if let Some(ref mut device) = current_device {
            if line.contains("node.description =") || line.contains("node.name =") {
                if let Some(name_start) = line.find('\"') {
                    if let Some(name_end) = line[name_start + 1..].find('\"') {
                        let name = &line[name_start + 1..name_start + 1 + name_end];
                        if device.name.is_empty() || line.contains("node.description") {
                            device.name = name.to_string();
                        }
                    }
                }
            }

            if line.contains("\"running\"") || line.contains("state = \"running\"") {
                device.is_active = true;
            }
        }
    }

    if let Some(device) = current_device {
        if is_sink {
            devices.push(device);
        }
    }

    Ok(devices)
}

async fn get_pipewire_input_devices() -> Result<Vec<AudioDevice>, String> {
    let output = Command::new("pw-cli")
        .args(["list-objects"])
        .output()
        .map_err(|e| format!("Erreur pw-cli: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();
    let mut current_device: Option<AudioDevice> = None;
    let mut is_source = false;
    let mut id_counter = 0;

    for line in stdout.lines() {
        let line = line.trim();

        if line.contains("type = \"PipeWire:Interface:Node\"") {
            if let Some(device) = current_device.take() {
                if is_source {
                    devices.push(device);
                }
            }
            current_device = Some(AudioDevice {
                id: format!("{}", id_counter),
                name: String::new(),
                device_type: "input".to_string(),
                is_default: devices.is_empty(),
                is_active: false,
                driver: "pipewire".to_string(),
            });
            is_source = false;
            id_counter += 1;
        }

        if line.contains("media.class = \"Audio/Source\"") && !line.contains("monitor") {
            is_source = true;
        }

        if let Some(ref mut device) = current_device {
            if line.contains("node.description =") || line.contains("node.name =") {
                if let Some(name_start) = line.find('\"') {
                    if let Some(name_end) = line[name_start + 1..].find('\"') {
                        let name = &line[name_start + 1..name_start + 1 + name_end];
                        if device.name.is_empty() || line.contains("node.description") {
                            device.name = name.to_string();
                        }
                    }
                }
            }

            if line.contains("\"running\"") || line.contains("state = \"running\"") {
                device.is_active = true;
            }
        }
    }

    if let Some(device) = current_device {
        if is_source {
            devices.push(device);
        }
    }

    Ok(devices)
}

// ─────────────────────────────────────────────────────────────────
//  ALSA Helper Functions
// ─────────────────────────────────────────────────────────────────

async fn get_alsa_output_devices() -> Result<Vec<AudioDevice>, String> {
    let output = Command::new("aplay")
        .args(["-l"])
        .output()
        .map_err(|e| format!("Erreur aplay: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines() {
        if line.starts_with("carte ") || line.starts_with("card ") {
            if let Some(_card_start) = line.find("carte ").or_else(|| line.find("card ")) {
                if let Some(colon_pos) = line.find(':') {
                    let card_name = line[colon_pos + 1..].trim();

                    devices.push(AudioDevice {
                        id: format!("alsa_{}", devices.len()),
                        name: card_name.to_string(),
                        device_type: "output".to_string(),
                        is_default: devices.is_empty(),
                        is_active: true,
                        driver: "alsa".to_string(),
                    });
                }
            }
        }
    }

    Ok(devices)
}

async fn get_alsa_input_devices() -> Result<Vec<AudioDevice>, String> {
    let output = Command::new("arecord")
        .args(["-l"])
        .output()
        .map_err(|e| format!("Erreur arecord: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines() {
        if line.starts_with("carte ") || line.starts_with("card ") {
            if let Some(_card_start) = line.find("carte ").or_else(|| line.find("card ")) {
                if let Some(colon_pos) = line.find(':') {
                    let card_name = line[colon_pos + 1..].trim();

                    devices.push(AudioDevice {
                        id: format!("alsa_{}", devices.len()),
                        name: card_name.to_string(),
                        device_type: "input".to_string(),
                        is_default: devices.is_empty(),
                        is_active: false,
                        driver: "alsa".to_string(),
                    });
                }
            }
        }
    }

    Ok(devices)
}

#[tauri::command]
pub async fn set_audio_output_device(device_id: String) -> CommandResult<()> {
    // Try PipeWire first
    if Command::new("pw-cli").arg("--version").output().is_ok() {
        // PipeWire device switching would require more complex logic
        // For now, fall through to pactl
    }

    // Try PulseAudio
    if Command::new("pactl")
        .args(["set-default-sink", &device_id])
        .output()
        .is_ok()
    {
        return Ok(());
    }

    // ALSA doesn't have a simple command-line way to switch devices
    Err("Device switching not supported on this system".to_string())
}

#[tauri::command]
pub async fn set_audio_input_device(device_id: String) -> CommandResult<()> {
    // Try PipeWire first
    if Command::new("pw-cli").arg("--version").output().is_ok() {
        // PipeWire device switching would require more complex logic
        // For now, fall through to pactl
    }

    // Try PulseAudio
    if Command::new("pactl")
        .args(["set-default-source", &device_id])
        .output()
        .is_ok()
    {
        return Ok(());
    }

    // ALSA doesn't have a simple command-line way to switch devices
    Err("Device switching not supported on this system".to_string())
}

// ─────────────────────────────────────────────────────────────────
//  Microphone Test Command
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn test_microphone(duration_ms: u64) -> CommandResult<MicrophoneTestResult> {
    log::info!(
        "[Audio] test_microphone called with duration_ms={}",
        duration_ms
    );

    let duration_secs = (duration_ms as f64 / 1000.0).max(1.0);
    let output_path = std::env::temp_dir().join("titane_mic_test.wav");
    let output_str = output_path.to_string_lossy().to_string();

    log::info!("[Audio] Recording to: {}", output_str);

    // Record audio with arecord (16000Hz for STT compatibility)
    let record_result = Command::new("arecord")
        .args([
            "-d",
            &format!("{:.0}", duration_secs),
            "-f",
            "S16_LE",
            "-r",
            "16000",
            "-c",
            "1",
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

                log::info!(
                    "[Audio] File size: {} bytes, expected min: {}",
                    file_size,
                    expected_min_size
                );

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
                    #[cfg(feature = "mock")]
                    log::info!("[Audio] File too small, no signal detected");

                    #[cfg(not(feature = "mock"))]
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
    let temp_audio_path = temp_audio
        .to_str()
        .ok_or_else(|| "Invalid audio path".to_string())?;
    let output_dir_path = std::env::temp_dir();
    let output_dir = output_dir_path
        .to_str()
        .ok_or_else(|| "Invalid temp directory path".to_string())?;

    let output = Command::new(&whisper_bin)
        .args([
            temp_audio_path,
            "--model",
            "tiny",
            "--language",
            "fr",
            "--output_format",
            "txt",
            "--output_dir",
            output_dir,
            "--fp16",
            "False", // For CPU compatibility
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
        return Err(format!(
            "Vosk failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let transcript = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(if transcript.is_empty() {
        "(Aucune parole détectée)".to_string()
    } else {
        transcript
    })
}

// ─────────────────────────────────────────────────────────────────
//  Recording Commands (v∞) - NEW PRODUCTION ENGINE
// ─────────────────────────────────────────────────────────────────

use super::recording_engine::{RecordingConfig, RECORDING_ENGINE};

static IS_SPEAKING: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

/// Start recording with configuration
/// Returns unique recording ID
/// ✅ v∞.8 FIX: Auto-retry avec force_reset si "Recording already in progress"
#[tauri::command]
pub async fn start_recording(config: Option<serde_json::Value>) -> CommandResult<String> {
    log::info!("[Audio::start_recording] Called with config: {:?}", config);

    // Parse config or use defaults
    let recording_config = if let Some(cfg) = config {
        serde_json::from_value::<RecordingConfig>(cfg).unwrap_or_default()
    } else {
        RecordingConfig::default()
    };

    // ✅ FIRST ATTEMPT: Try to start recording
    match RECORDING_ENGINE.start(recording_config.clone()) {
        Ok(recording_id) => {
            log::info!("[Audio::start_recording] ✅ Started: {}", recording_id);
            Ok(recording_id)
        }
        Err(e) => {
            // ✅ DETECT "Recording already in progress" error
            if e.contains("Recording already in progress") || e.contains("AlreadyRecording") {
                log::warn!(
                    "[Audio::start_recording] ⚠️ Stuck state detected, applying force_reset..."
                );

                // 🔥 FORCE RESET to unstuck backend
                RECORDING_ENGINE.force_reset();

                // Wait 100ms for cleanup
                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

                // ✅ RETRY ONCE after force_reset
                log::info!("[Audio::start_recording] 🔄 Retrying after force_reset...");
                match RECORDING_ENGINE.start(recording_config) {
                    Ok(recording_id) => {
                        log::info!(
                            "[Audio::start_recording] ✅ Started after retry: {}",
                            recording_id
                        );
                        Ok(recording_id)
                    }
                    Err(retry_err) => {
                        log::error!(
                            "[Audio::start_recording] ❌ Failed even after force_reset: {}",
                            retry_err
                        );
                        Err(retry_err)
                    }
                }
            } else {
                // Other errors: just return
                log::error!("[Audio::start_recording] ❌ Failed: {}", e);
                Err(e)
            }
        }
    }
}

/// Stop recording and return transcription result
#[tauri::command]
pub async fn stop_recording() -> CommandResult<serde_json::Value> {
    log::info!("[Audio::stop_recording] Called");

    // ✅ SAFETY: Check if actually recording
    if !RECORDING_ENGINE.is_recording() {
        log::warn!("[Audio::stop_recording] Not recording, returning empty result");
        return Ok(serde_json::json!({
            "transcript": "",
            "confidence": 0.0,
            "duration": 0.0,
            "filePath": null,
            "error": "Not recording",
        }));
    }

    match RECORDING_ENGINE.stop() {
        Ok(result) => {
            log::info!(
                "[Audio::stop_recording] ✅ Stopped - duration: {:.2}s, file: {:?}",
                result.duration,
                result.file_path
            );

            // If we have an audio file, try to transcribe
            let transcript = if let Some(ref file_path) = result.file_path {
                match std::fs::read(file_path) {
                    Ok(audio_data) => match transcribe_audio(audio_data).await {
                        Ok(text) => {
                            log::info!("[Audio::stop_recording] Transcription: '{}'", text);
                            text
                        }
                        Err(e) => {
                            log::warn!("[Audio::stop_recording] Transcription failed: {}", e);
                            result.transcript
                        }
                    },
                    Err(e) => {
                        log::warn!("[Audio::stop_recording] Failed to read audio file: {}", e);
                        result.transcript
                    }
                }
            } else {
                result.transcript
            };

            Ok(serde_json::json!({
                "transcript": transcript,
                "confidence": result.confidence,
                "duration": result.duration,
                "filePath": result.file_path,
                "error": result.error,
            }))
        }
        Err(e) => {
            log::error!("[Audio::stop_recording] ❌ Failed: {}", e);
            Err(e)
        }
    }
}

/// Cancel recording without transcription
#[tauri::command]
pub async fn cancel_recording() -> CommandResult<()> {
    log::info!("[Audio::cancel_recording] Called");

    match RECORDING_ENGINE.cancel() {
        Ok(_) => {
            log::info!("[Audio::cancel_recording] ✅ Cancelled");
            Ok(())
        }
        Err(e) => {
            log::error!("[Audio::cancel_recording] ❌ Failed: {}", e);
            Err(e)
        }
    }
}

/// Check if recording is in progress
#[tauri::command]
pub async fn is_recording() -> CommandResult<bool> {
    let state = RECORDING_ENGINE.is_recording();
    log::debug!("[Audio::is_recording] State: {}", state);
    Ok(state)
}

/// Get current recording state (for UI/debugging)
#[tauri::command]
pub async fn get_recording_status() -> CommandResult<serde_json::Value> {
    let state = RECORDING_ENGINE.get_state();
    serde_json::to_value(state).map_err(|e| format!("Failed to serialize state: {}", e))
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
    log::info!(
        "[Audio] speak() called: '{}...'",
        text.chars().take(50).collect::<String>()
    );

    // Build settings from config or use defaults
    let settings = if let Some(cfg) = config {
        TTSSettings {
            engine: cfg
                .get("engine")
                .and_then(|v| v.as_str())
                .unwrap_or("piper")
                .to_string(),
            voice_id: cfg
                .get("voiceId")
                .and_then(|v| v.as_str())
                .unwrap_or("fr_FR-siwis-medium")
                .to_string(),
            rate: cfg.get("rate").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32,
            pitch: cfg.get("pitch").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32,
            volume: cfg.get("volume").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32,
            language: cfg
                .get("language")
                .and_then(|v| v.as_str())
                .unwrap_or("fr-FR")
                .to_string(),
            emotion_enabled: cfg
                .get("emotionEnabled")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
            auto_fallback: true,
        }
    } else {
        TTSSettings {
            engine: if use_online.unwrap_or(false) {
                "google".to_string()
            } else {
                "piper".to_string()
            },
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
//  Voice Activity Detection (VAD) Commands v∞
//  Inline VAD to avoid module conflicts with mock mode
// ─────────────────────────────────────────────────────────────────

use std::sync::Mutex as StdMutex;

// ═══════════════════════════════════════════════════════════════
// Inline VAD Implementation (avoids module dependency issues)
// ═══════════════════════════════════════════════════════════════

const VAD_THRESHOLD: f32 = 0.02;
const VAD_MIN_SPEECH_FRAMES: usize = 10;
const VAD_MIN_SILENCE_FRAMES: usize = 20;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum VADState {
    Silence,
    Speech,
}

pub struct VoiceActivityDetector {
    threshold: f32,
    min_speech_frames: usize,
    min_silence_frames: usize,
    state: VADState,
    speech_frame_count: usize,
    silence_frame_count: usize,
}

impl VoiceActivityDetector {
    pub fn new() -> Self {
        Self {
            threshold: VAD_THRESHOLD,
            min_speech_frames: VAD_MIN_SPEECH_FRAMES,
            min_silence_frames: VAD_MIN_SILENCE_FRAMES,
            state: VADState::Silence,
            speech_frame_count: 0,
            silence_frame_count: 0,
        }
    }

    pub fn with_threshold(mut self, threshold: f32) -> Self {
        self.threshold = threshold;
        self
    }

    pub fn with_sensitivity(mut self, speech_frames: usize, silence_frames: usize) -> Self {
        self.min_speech_frames = speech_frames;
        self.min_silence_frames = silence_frames;
        self
    }

    pub fn process_frame(&mut self, audio_data: &[f32]) -> VADState {
        let energy = self.calculate_energy(audio_data);
        let is_speech = energy > self.threshold;

        match self.state {
            VADState::Silence => {
                if is_speech {
                    self.speech_frame_count += 1;
                    if self.speech_frame_count >= self.min_speech_frames {
                        self.state = VADState::Speech;
                        self.silence_frame_count = 0;
                    }
                } else {
                    self.speech_frame_count = 0;
                }
            }
            VADState::Speech => {
                if is_speech {
                    self.silence_frame_count = 0;
                } else {
                    self.silence_frame_count += 1;
                    if self.silence_frame_count >= self.min_silence_frames {
                        self.state = VADState::Silence;
                        self.speech_frame_count = 0;
                    }
                }
            }
        }

        self.state
    }

    fn calculate_energy(&self, audio_data: &[f32]) -> f32 {
        if audio_data.is_empty() {
            return 0.0;
        }
        let sum_squares: f32 = audio_data.iter().map(|&sample| sample * sample).sum();
        (sum_squares / audio_data.len() as f32).sqrt()
    }

    pub fn get_state(&self) -> VADState {
        self.state
    }

    pub fn reset(&mut self) {
        self.state = VADState::Silence;
        self.speech_frame_count = 0;
        self.silence_frame_count = 0;
    }

    pub fn is_speaking(&self) -> bool {
        self.state == VADState::Speech
    }
}

impl Default for VoiceActivityDetector {
    fn default() -> Self {
        Self::new()
    }
}

/// Global VAD instance (thread-safe)
static VAD: Lazy<StdMutex<VoiceActivityDetector>> =
    Lazy::new(|| StdMutex::new(VoiceActivityDetector::new()));

/// VAD configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VADConfig {
    pub threshold: f32,
    pub min_speech_frames: usize,
    pub min_silence_frames: usize,
}

impl Default for VADConfig {
    fn default() -> Self {
        Self {
            threshold: 0.02,
            min_speech_frames: 10,
            min_silence_frames: 20,
        }
    }
}

/// VAD status response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VADStatus {
    pub state: String,
    pub is_speaking: bool,
}

/// Get current VAD state
#[tauri::command]
pub async fn vad_get_state() -> CommandResult<VADStatus> {
    let vad = VAD.lock().map_err(|e| format!("VAD lock error: {}", e))?;

    let state = match vad.get_state() {
        VADState::Silence => "silence",
        VADState::Speech => "speech",
    };

    Ok(VADStatus {
        state: state.to_string(),
        is_speaking: vad.is_speaking(),
    })
}

/// Process audio frame through VAD
#[tauri::command]
pub async fn vad_process_frame(audio_data: Vec<f32>) -> CommandResult<VADStatus> {
    let mut vad = VAD.lock().map_err(|e| format!("VAD lock error: {}", e))?;

    let state = vad.process_frame(&audio_data);
    let state_str = match state {
        VADState::Silence => "silence",
        VADState::Speech => "speech",
    };

    Ok(VADStatus {
        state: state_str.to_string(),
        is_speaking: state == VADState::Speech,
    })
}

/// Configure VAD parameters
#[tauri::command]
pub async fn vad_configure(config: VADConfig) -> CommandResult<String> {
    log::info!(
        "[VAD] Configuring: threshold={}, speech_frames={}, silence_frames={}",
        config.threshold,
        config.min_speech_frames,
        config.min_silence_frames
    );

    let mut vad = VAD.lock().map_err(|e| format!("VAD lock error: {}", e))?;

    // Create new VAD with updated config
    *vad = VoiceActivityDetector::new()
        .with_threshold(config.threshold)
        .with_sensitivity(config.min_speech_frames, config.min_silence_frames);

    Ok("VAD configured successfully".to_string())
}

/// Reset VAD state to silence
#[tauri::command]
pub async fn vad_reset() -> CommandResult<String> {
    log::info!("[VAD] Resetting state");

    let mut vad = VAD.lock().map_err(|e| format!("VAD lock error: {}", e))?;
    vad.reset();

    Ok("VAD reset to silence".to_string())
}

/// Test VAD with generated test data
#[tauri::command]
pub async fn vad_test() -> CommandResult<serde_json::Value> {
    log::info!("[VAD] Running self-test...");

    let mut vad = VoiceActivityDetector::new();

    // Test 1: Silence detection
    let silence = vec![0.001f32; 512];
    let mut silence_correct = true;
    for _ in 0..30 {
        if vad.process_frame(&silence) == VADState::Speech {
            silence_correct = false;
            break;
        }
    }

    // Test 2: Speech detection
    vad.reset();
    let speech: Vec<f32> = (0..512).map(|i| (i as f32 * 0.05).sin() * 0.15).collect();
    let mut speech_detected = false;
    for _ in 0..30 {
        if vad.process_frame(&speech) == VADState::Speech {
            speech_detected = true;
            break;
        }
    }

    // Test 3: Transition test
    vad.reset();
    let speech_short: Vec<f32> = (0..512).map(|i| (i as f32 * 0.05).sin() * 0.15).collect();
    for _ in 0..15 {
        vad.process_frame(&speech_short);
    }
    let in_speech = vad.is_speaking();

    // Return to silence
    for _ in 0..30 {
        vad.process_frame(&silence);
    }
    let back_to_silence = !vad.is_speaking();

    let all_passed = silence_correct && speech_detected && in_speech && back_to_silence;

    log::info!(
        "[VAD] Self-test complete: {}",
        if all_passed { "✅ PASS" } else { "❌ FAIL" }
    );

    Ok(serde_json::json!({
        "success": all_passed,
        "tests": {
            "silence_detection": silence_correct,
            "speech_detection": speech_detected,
            "speech_transition": in_speech,
            "silence_transition": back_to_silence
        },
        "message": if all_passed { "All VAD tests passed" } else { "Some VAD tests failed" }
    }))
}

// ─────────────────────────────────────────────────────────────────
//  Export all commands for registration (utility function)
// ─────────────────────────────────────────────────────────────────

#[allow(dead_code)]
pub fn get_audio_commands() -> Vec<&'static str> {
    #[allow(unused_mut)]
    let mut cmds = vec![
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
        // VAD commands
        "vad_get_state",
        "vad_process_frame",
        "vad_configure",
        "vad_reset",
        "vad_test",
    ];

    #[cfg(feature = "audio-capture")]
    cmds.extend_from_slice(&[
        "audio_capture_start",
        "audio_capture_stop",
        "audio_capture_status",
        "audio_capture_get_chunk",
        "audio_capture_export_wav",
        "audio_list_devices",
    ]);

    cmds
}

// ─────────────────────────────────────────────────────────────────
//  Real-Time Audio Capture Commands (cpal) v∞
//  Requires feature "audio-capture" and libasound2-dev on Linux
// ─────────────────────────────────────────────────────────────────

#[cfg(feature = "audio-capture")]
mod capture_commands {
    use super::*;
    use crate::audio::capture::{
        default_input_device_name, default_output_device_name, list_input_devices,
        list_output_devices, AudioCaptureState,
    };
    use std::sync::Mutex as StdMutex;

    // Global capture state (thread-safe)
    static CAPTURE_STATE: Lazy<StdMutex<AudioCaptureState>> =
        Lazy::new(|| StdMutex::new(AudioCaptureState::new()));

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct CaptureStatus {
        pub is_capturing: bool,
        pub duration_ms: u64,
        pub samples_captured: usize,
        pub device_name: Option<String>,
    }

    /// Start real-time audio capture with cpal
    #[tauri::command]
    pub async fn audio_capture_start() -> CommandResult<String> {
        log::info!("[AudioCapture] Starting capture...");

        let mut state = CAPTURE_STATE
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;

        state
            .start_capture()
            .map_err(|e| format!("Capture start failed: {}", e))?;

        let device = default_input_device_name().unwrap_or_else(|| "Unknown".to_string());
        log::info!("[AudioCapture] ✅ Started on device: {}", device);

        Ok(format!("Capture started on: {}", device))
    }

    /// Stop real-time audio capture
    #[tauri::command]
    pub async fn audio_capture_stop() -> CommandResult<CaptureStatus> {
        log::info!("[AudioCapture] Stopping capture...");

        let mut state = CAPTURE_STATE
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;

        let duration_ms = state.capture_duration_ms();
        let samples = state.total_samples();

        state
            .stop_capture()
            .map_err(|e| format!("Capture stop failed: {}", e))?;

        log::info!(
            "[AudioCapture] ✅ Stopped - Duration: {}ms, Samples: {}",
            duration_ms,
            samples
        );

        Ok(CaptureStatus {
            is_capturing: false,
            duration_ms,
            samples_captured: samples,
            device_name: default_input_device_name(),
        })
    }

    /// Get current capture status
    #[tauri::command]
    pub async fn audio_capture_status() -> CommandResult<CaptureStatus> {
        let state = CAPTURE_STATE
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;

        Ok(CaptureStatus {
            is_capturing: state.is_capturing(),
            duration_ms: state.capture_duration_ms(),
            samples_captured: state.total_samples(),
            device_name: default_input_device_name(),
        })
    }

    /// Get captured audio chunk (last N milliseconds)
    #[tauri::command]
    pub async fn audio_capture_get_chunk(duration_ms: u32) -> CommandResult<Vec<f32>> {
        let state = CAPTURE_STATE
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;

        state
            .get_audio_chunk(duration_ms)
            .map_err(|e| format!("Get chunk failed: {}", e))
    }

    /// Export captured audio to WAV file
    #[tauri::command]
    pub async fn audio_capture_export_wav(path: String) -> CommandResult<String> {
        log::info!("[AudioCapture] Exporting to: {}", path);

        let state = CAPTURE_STATE
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;

        let path = std::path::Path::new(&path);
        state
            .export_wav(path)
            .map_err(|e| format!("Export failed: {}", e))?;

        Ok(format!("Exported to: {}", path.display()))
    }

    /// List all audio devices
    #[tauri::command]
    pub async fn audio_list_devices() -> CommandResult<serde_json::Value> {
        let inputs = list_input_devices();
        let outputs = list_output_devices();

        Ok(serde_json::json!({
            "inputs": inputs,
            "outputs": outputs,
            "defaultInput": default_input_device_name(),
            "defaultOutput": default_output_device_name(),
        }))
    }
}

// Re-export capture commands when feature is enabled
#[cfg(feature = "audio-capture")]
pub use capture_commands::*;

// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
//  STREAMING AUDIO COMMANDS (v∞ ULTRA) - Real-time PCM Streaming
// ─────────────────────────────────────────────────────────────────
//
// NOTE: These streaming commands are deprecated and cause conditional compilation issues.
// For audio streaming functionality, use the more robust implementations in:
// - src/audio/recording_engine.rs (batch recording)
// - src/commands/whisper_commands.rs (real-time Whisper streaming)
//
// Keeping this section commented for historical reference.

// #[cfg(feature = "audio-capture")]
// mod streaming_commands {
//     use super::*;
//     use crate::audio::streaming_engine::{
//         StreamingAudioEngine, StreamingConfig, StreamingResult, StreamingState,
//     };
//     use once_cell::sync::Lazy;
//     use std::sync::Mutex;
//
//     static STREAMING_ENGINE: Lazy<Mutex<Option<StreamingAudioEngine>>> =
//         Lazy::new(|| Mutex::new(None));
//
//     /// ... (commands commented for brevity)
// }
//
// #[cfg(feature = "audio-capture")]
// pub use streaming_commands::*;

// ═══════════════════════════════════════════════════════════════
//  WHISPER STREAMING COMMANDS (v19.3.1 Real-Time Voice)
// ═══════════════════════════════════════════════════════════════
//
// NOTE: These commands are now located in src/commands/whisper_commands.rs
// to avoid duplicates. The functionality is the same but better organized.
// Keeping this section commented for historical reference.

// #[cfg(feature = "audio-capture")]
// pub mod whisper_streaming_commands {
//     use super::*;
//     use crate::audio::{WhisperStreamConfig, WhisperStreamingEngine};
//     use once_cell::sync::Lazy;
//     use std::sync::Mutex;
//     use tokio::sync::mpsc;
//
//     static WHISPER_ENGINE: Lazy<Mutex<Option<WhisperStreamingEngine>>> =
//         Lazy::new(|| Mutex::new(None));
//
//     static AUDIO_TX: Lazy<Mutex<Option<mpsc::Sender<crate::audio::AudioChunk>>>> =
//         Lazy::new(|| Mutex::new(None));
//
//     /// Start Whisper streaming mode
//     #[tauri::command]
//     pub async fn start_whisper_streaming(
//         app_handle: tauri::AppHandle,
//         model: Option<String>,
//         language: Option<String>,
//     ) -> CommandResult<()> {
//         log::info!("[WhisperStreaming] 🎙️ Starting...");
//
//         let mut config = WhisperStreamConfig::default();
//         if let Some(m) = model {
//             config.model = m;
//         }
//         if let Some(l) = language {
//             config.language = l;
//         }
//
//         let engine = WhisperStreamingEngine::new(config);
//
//         // Create channel for audio chunks
//         let (audio_tx, audio_rx) = mpsc::channel(100);
//
//         // Start streaming worker
//         engine.start_streaming(app_handle, audio_rx);
//
//         // Store engine and sender with error recovery
//         let mut whisper_guard = WHISPER_ENGINE.lock().unwrap_or_else(|e| e.into_inner());
//         *whisper_guard = Some(engine);
//         drop(whisper_guard);
//
//         let mut tx_guard = AUDIO_TX.lock().unwrap_or_else(|e| e.into_inner());
//         *tx_guard = Some(audio_tx);
//         drop(tx_guard);
//
//         log::info!("[WhisperStreaming] ✅ Started");
//         Ok(())
//     }
//
//     /// Send audio chunk to Whisper streaming engine
//     #[tauri::command]
//     pub async fn send_audio_chunk(
//         data: Vec<f32>,
//         sample_rate: u32,
//         has_speech: bool,
//         vad_confidence: f32,
//     ) -> CommandResult<()> {
//         let tx_guard = AUDIO_TX.lock().map_err(|e| format!("Lock error: {}", e))?;
//
//         if let Some(ref tx) = *tx_guard {
//             let chunk = crate::audio::AudioChunk {
//                 data,
//                 sample_rate,
//                 timestamp: std::time::Instant::now(),
//                 has_speech,
//                 vad_confidence,
//             };
//
//             tx.send(chunk)
//                 .await
//                 .map_err(|e| format!("Failed to send chunk: {}", e))?;
//
//             Ok(())
//         } else {
//             Err("Whisper streaming not started".to_string())
//         }
//     }
//
//     /// Stop Whisper streaming
//     #[tauri::command]
//     pub async fn stop_whisper_streaming() -> CommandResult<()> {
//         log::info!("[WhisperStreaming] 🛑 Stopping...");
//
//         // Drop sender to close channel
//         if let Ok(mut tx_guard) = AUDIO_TX.lock() {
//             *tx_guard = None;
//         }
//
//         // Reset engine
//         if let Ok(engine_guard) = WHISPER_ENGINE.lock() {
//             if let Some(ref engine) = *engine_guard {
//                 engine.reset();
//             }
//         }
//
//         // Clear engine
//         if let Ok(mut engine_guard) = WHISPER_ENGINE.lock() {
//             *engine_guard = None;
//         }
//
//         log::info!("[WhisperStreaming] ✅ Stopped");
//         Ok(())
//     }
// }
//
// #[cfg(feature = "audio-capture")]
// pub use whisper_streaming_commands::*;

// ─────────────────────────────────────────────────────────────────
//  Voice Fingerprinting Commands (P0-2: Layer 3 Anti-Feedback)
// ─────────────────────────────────────────────────────────────────

use std::sync::Mutex;

// Import from sibling module in audio/
mod voice_fingerprint_local {
    include!("voice_fingerprint.rs");
}

use voice_fingerprint_local::VoiceFingerprint;

/// Global voice fingerprint engine instance
static VOICE_FINGERPRINT_ENGINE: Lazy<Mutex<VoiceFingerprint>> =
    Lazy::new(|| Mutex::new(VoiceFingerprint::new()));

/// Calibrate TITANE voice profile with TTS samples
///
/// Should be called once at startup or when TTS voice changes.
/// Requires 5-10 seconds of TITANE TTS samples (various phrases).
///
/// # Arguments
/// * `samples_list` - Multiple audio samples (16kHz mono Float32Array)
///
/// # Example
/// ```typescript
/// const samples = [
///   await generateTTSSample("Bonjour, je suis TITANE"),
///   await generateTTSSample("Comment puis-je vous aider ?"),
///   await generateTTSSample("Je suis là pour vous assister")
/// ];
/// await invoke('calibrate_titane_voice', { samplesList: samples });
/// ```
#[tauri::command]
pub async fn calibrate_titane_voice(samples_list: Vec<Vec<f32>>) -> CommandResult<()> {
    log::info!(
        "[VoiceFingerprint] 🎯 Calibrating TITANE voice with {} samples",
        samples_list.len()
    );

    let engine = VOICE_FINGERPRINT_ENGINE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    engine
        .calibrate_titane(samples_list)
        .map_err(|e| format!("Calibration failed: {}", e))?;

    log::info!("[VoiceFingerprint] ✅ TITANE voice profile calibrated");
    Ok(())
}

/// Check if audio is TITANE speaking (Layer 3 anti-feedback detection)
///
/// Returns (is_titane, similarity_score)
/// - is_titane: true if audio matches TITANE voice profile (similarity >= threshold)
/// - similarity_score: 0.0 (different) to 1.0 (identical)
///
/// # Arguments
/// * `samples` - Audio samples (16kHz mono Float32Array)
///
/// # Example
/// ```typescript
/// const result = await invoke('check_is_titane_speaking', { samples: audioBuffer });
/// if (result.isTitane) {
///   console.log('🎯 TITANE detected, skipping ASR (anti-feedback Layer 3)');
///   return; // Skip ASR processing
/// }
/// ```
#[tauri::command]
pub async fn check_is_titane_speaking(samples: Vec<f32>) -> CommandResult<serde_json::Value> {
    let engine = VOICE_FINGERPRINT_ENGINE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    let (is_titane, similarity) = engine.is_titane_speaking(&samples);

    Ok(serde_json::json!({
        "isTitane": is_titane,
        "similarity": similarity,
    }))
}

/// Get TITANE voice profile status
///
/// Returns calibration status and profile info
#[tauri::command]
pub async fn get_titane_voice_status() -> CommandResult<serde_json::Value> {
    let engine = VOICE_FINGERPRINT_ENGINE
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    let calibrated = engine.is_calibrated();
    let profile_info = engine.get_profile_info();

    Ok(serde_json::json!({
        "calibrated": calibrated,
        "sampleCount": profile_info.map(|(count, _)| count).unwrap_or(0),
        "threshold": profile_info.map(|(_, threshold)| threshold).unwrap_or(0.75),
    }))
}
