# 06 TAURI AUDIO STATUS

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## generate_handler registration (main.rs ligne ~1291)

Toutes les commandes audio sont enregistrées:

```rust
audio::commands::tts_speak,
audio::commands::tts_stop,
audio::commands::test_tts,
audio::commands::test_microphone,
audio::commands::get_audio_output_devices,
audio::commands::get_audio_input_devices,
audio::commands::set_audio_output_device,
audio::commands::set_audio_input_device,
audio::commands::vad_get_state,
audio::commands::vad_process_frame,
audio::commands::vad_configure,
audio::commands::vad_reset,
audio::commands::vad_test,
// Audio Capture Commands
audio::commands::audio_capture_start,
audio::commands::audio_capture_stop,
audio::commands::audio_capture_status,
audio::commands::audio_capture_get_chunk,
audio::commands::audio_capture_export_wav,
audio::commands::audio_list_devices,
config::get_audio_device_config,
config::save_audio_device_config,
audio::commands::speak,
audio::commands::start_recording,
audio::commands::stop_recording,
audio::commands::cancel_recording,
audio::commands::transcribe_audio,
audio::commands::is_recording,
audio::commands::stop_speaking,
audio::commands::is_speaking,
```

STATUS: TOUTES ENREGISTRÉES ✓

## Capabilities (src-tauri/capabilities/audio_tts.json)

Allowlist complet:

- tts_speak, tts_stop, test_tts ✓
- speak, stop_speaking, is_speaking ✓
- get_audio_output_devices ✓
- get_audio_input_devices ✓
- set_audio_output_device ✓
- set_audio_input_device ✓
- test_microphone ✓
- get_audio_device_config ✓
- save_audio_device_config ✓
- start_recording, stop_recording, cancel_recording, is_recording ✓
- vad_get_state, vad_process_frame, vad_configure, vad_reset, vad_test ✓

Note: audio_capture_start/stop/status/chunk/wav NON dans audio_tts.json
(sont dans generate_handler mais non exposés UI Audio Center — scope cohérent)

## TAURI_PERMISSION_MISSING: NONE ✓

## TAURI_COMMAND_NOT_REGISTERED: NONE ✓
