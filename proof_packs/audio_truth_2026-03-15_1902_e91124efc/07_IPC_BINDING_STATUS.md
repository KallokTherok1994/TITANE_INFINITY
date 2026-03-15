# 07 IPC BINDING STATUS
# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## TAURI_COMMANDS mapping (src/lib/tauriCommands.ts)

| Constante TS | Valeur string (backend) | Match Rust | Status |
|-------------|------------------------|------------|--------|
| GET_AUDIO_INPUT_DEVICES | 'get_audio_input_devices' | ✓ | OK |
| GET_AUDIO_OUTPUT_DEVICES | 'get_audio_output_devices' | ✓ | OK |
| SET_AUDIO_INPUT_DEVICE | 'set_audio_input_device' | ✓ | OK |
| SET_AUDIO_OUTPUT_DEVICE | 'set_audio_output_device' | ✓ | OK |
| TEST_MICROPHONE | 'test_microphone' | ✓ | OK |
| TEST_TTS | 'test_tts' | ✓ | OK |
| GET_AUDIO_DEVICE_CONFIG | 'get_audio_device_config' | ✓ | OK |
| SAVE_AUDIO_DEVICE_CONFIG | 'save_audio_device_config' | ✓ | OK |

## tauriClient methods (src/lib/tauriClient.ts)

| Méthode TS | Commande invoquée | Status |
|------------|-------------------|--------|
| getAudioOutputDevices() | GET_AUDIO_OUTPUT_DEVICES | OK ✓ |
| getAudioInputDevices() | GET_AUDIO_INPUT_DEVICES | OK ✓ |
| setAudioOutputDevice({deviceId}) | SET_AUDIO_OUTPUT_DEVICE | OK ✓ |
| setAudioInputDevice({deviceId}) | SET_AUDIO_INPUT_DEVICE | OK ✓ |
| testMicrophone({durationMs, deviceId}, options) | TEST_MICROPHONE | OK ✓ |
| testTts({text, settings}) | TEST_TTS | OK ✓ |
| getAudioDeviceConfig() | GET_AUDIO_DEVICE_CONFIG | OK ✓ |
| saveAudioDeviceConfig(config) | SAVE_AUDIO_DEVICE_CONFIG | OK ✓ |

## IPC payload format

- tauriClient utilise invoke wrapper qui sérialise params en camelCase
- Rust serde: `#[serde(rename_all = "camelCase")]` sur tous les structs audio ✓
- Pas de drift camelCase/snake_case détecté ✓

## IPC_PAYLOAD_DRIFT: NONE ✓
## FRONTEND_NOT_BOUND_TO_RUNTIME: NONE ✓
