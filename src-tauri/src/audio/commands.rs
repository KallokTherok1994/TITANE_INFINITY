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
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());

    match settings.engine.as_str() {
        "piper" => {
            let piper_bin = format!("{}/.local/bin/piper", home);
            let model_path = format!(
                "{}/.local/share/piper/voices/{}.onnx",
                home, settings.voice_id
            );

            // Check if piper and model exist
            if !std::path::Path::new(&piper_bin).exists() {
                if settings.auto_fallback {
                    return tts_speak_espeak(&text, &settings).await;
                }
                return Err("Piper non installé".into());
            }

            if !std::path::Path::new(&model_path).exists() {
                if settings.auto_fallback {
                    return tts_speak_espeak(&text, &settings).await;
                }
                return Err(format!("Modèle Piper non trouvé: {}", settings.voice_id));
            }

            let output_path = std::env::temp_dir().join("titane_tts_output.wav");
            let output_str = output_path.to_string_lossy().to_string();

            // Generate audio with piper
            let piper_output = Command::new("bash")
                .arg("-c")
                .arg(format!(
                    "echo '{}' | '{}' --model '{}' --output_file '{}'",
                    text.replace('\'', "\\'"),
                    piper_bin,
                    model_path,
                    output_str
                ))
                .output()
                .map_err(|e| format!("Erreur Piper: {}", e))?;

            if !piper_output.status.success() {
                let stderr = String::from_utf8_lossy(&piper_output.stderr);
                if settings.auto_fallback {
                    return tts_speak_espeak(&text, &settings).await;
                }
                return Err(format!("Piper a échoué: {}", stderr));
            }

            // Play audio
            Command::new("aplay")
                .arg(&output_str)
                .output()
                .map_err(|e| format!("Erreur lecture audio: {}", e))?;

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
    let duration_secs = (duration_ms as f64 / 1000.0).max(1.0);
    let output_path = std::env::temp_dir().join("titane_mic_test.wav");
    let output_str = output_path.to_string_lossy().to_string();

    // Record audio with arecord
    let record_result = Command::new("arecord")
        .args([
            "-d", &format!("{:.0}", duration_secs),
            "-f", "S16_LE",
            "-r", "44100",
            "-c", "1",
            &output_str,
        ])
        .output();

    match record_result {
        Ok(output) => {
            if !output.status.success() {
                return Ok(MicrophoneTestResult {
                    success: false,
                    peak_level: 0.0,
                    noise_floor: 0.0,
                    signal_to_noise: 0.0,
                    error_message: Some("Échec de l'enregistrement".to_string()),
                });
            }

            // Check if file was created and has content
            if let Ok(metadata) = std::fs::metadata(&output_path) {
                let file_size = metadata.len();
                let expected_min_size = (44100 * 2 * duration_secs as u64) / 2; // Half expected

                if file_size > expected_min_size {
                    // Simple analysis: assume success if file is big enough
                    // TODO: Implement proper audio analysis with cpal
                    Ok(MicrophoneTestResult {
                        success: true,
                        peak_level: 0.5, // Placeholder
                        noise_floor: 0.1,
                        signal_to_noise: 14.0, // ~14dB is acceptable
                        error_message: None,
                    })
                } else {
                    Ok(MicrophoneTestResult {
                        success: false,
                        peak_level: 0.0,
                        noise_floor: 0.0,
                        signal_to_noise: 0.0,
                        error_message: Some("Aucun signal audio détecté".to_string()),
                    })
                }
            } else {
                Ok(MicrophoneTestResult {
                    success: false,
                    peak_level: 0.0,
                    noise_floor: 0.0,
                    signal_to_noise: 0.0,
                    error_message: Some("Fichier audio non créé".to_string()),
                })
            }
        }
        Err(e) => Ok(MicrophoneTestResult {
            success: false,
            peak_level: 0.0,
            noise_floor: 0.0,
            signal_to_noise: 0.0,
            error_message: Some(format!("Erreur microphone: {}", e)),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────
//  Audio Transcription (STT/ASR)
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn transcribe_audio(audio_data: Vec<u8>) -> CommandResult<String> {
    // Utilise Vosk pour la transcription offline
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home".to_string());
    let model_path = format!("{}/.local/share/vosk/vosk-model-small-fr-0.22", home);

    // Check if Vosk model exists
    if !std::path::Path::new(&model_path).exists() {
        return Err("Modèle Vosk non installé. Veuillez télécharger vosk-model-small-fr-0.22".into());
    }

    // Save audio to temp file
    let temp_audio = std::env::temp_dir().join("titane_stt_input.wav");
    std::fs::write(&temp_audio, &audio_data)
        .map_err(|e| format!("Erreur écriture audio: {}", e))?;

    // Use Python vosk for transcription (more reliable than CLI)
    let script = format!(
        r#"
import json
import sys
from vosk import Model, KaldiRecognizer
import wave

try:
    model = Model("{}")
    wf = wave.open("{}", "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            if result.get("text"):
                results.append(result["text"])

    final = json.loads(rec.FinalResult())
    if final.get("text"):
        results.append(final["text"])

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
        .map_err(|e| format!("Erreur Python/Vosk: {}", e))?;

    // Clean up temp file
    let _ = std::fs::remove_file(&temp_audio);

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Vosk transcription failed: {}", stderr));
    }

    let transcript = String::from_utf8_lossy(&output.stdout).trim().to_string();

    if transcript.is_empty() {
        Ok("(Aucune parole détectée)".to_string())
    } else {
        Ok(transcript)
    }
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
    ]
}
