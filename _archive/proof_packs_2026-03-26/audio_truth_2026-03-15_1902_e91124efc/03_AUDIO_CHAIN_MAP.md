# 03 AUDIO CHAIN MAP

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Chaîne complète Ubuntu → UI

```
Ubuntu PipeWire 1.0.5
  └─ Devices: Built-in Audio (46), K66 (47), Navi 31 HDMI (48)
  └─ Sinks: 33(HDMI/default), 49(Built-in), 51(K66)
  └─ Sources: 50(Built-in), 52(K66/default)
       │
       │  via: wpctl, arecord, aplay, pw-record, pw-play
       ▼
Rust Audio Layer (src-tauri/src/audio/)
  ├─ commands.rs          ← PATCH-01 ici
  │    get_audio_output_devices()  → wpctl status → parse Sinks
  │    get_audio_input_devices()   → wpctl status → parse Sources
  │    set_audio_output_device()   → wpctl set-default <id>
  │    set_audio_input_device()    → wpctl set-default <id>
  │    test_microphone()           → timeout + pw-record --target <id>
  │    tts_speak()                 → piper → pw-play / espeak → OS default
  │    test_tts()                  → tts_speak() → résultat structuré
  ├─ capture.rs           (gated: feature=audio-capture, CPAL)
  ├─ mod.rs               (exports, AudioConfig)
  └─ vad.rs, recorder.rs, streaming_engine.rs (non utilisés Audio Center)
       │
       │  via: tauri invoke (IPC)
       ▼
Tauri Command Registration (main.rs generate_handler!)
  audio::commands::get_audio_output_devices  ← enregistré ✓
  audio::commands::get_audio_input_devices   ← enregistré ✓
  audio::commands::set_audio_output_device   ← enregistré ✓
  audio::commands::set_audio_input_device    ← enregistré ✓
  audio::commands::test_microphone           ← enregistré ✓
  audio::commands::tts_speak                 ← enregistré ✓
  audio::commands::test_tts                  ← enregistré ✓
  config::get_audio_device_config            ← enregistré ✓
  config::save_audio_device_config           ← enregistré ✓
       │
       │  via: capabilities/audio_tts.json (allowlist)
       ▼
Capabilities Allowlist (src-tauri/capabilities/audio_tts.json)
  Tous les commandes ci-dessus: allowlistés ✓
       │
       │  via: src/lib/tauriClient.ts (invoke wrapper)
       ▼
Frontend IPC Bridge (tauriClient.ts + tauriCommands.ts)
  tauriClient.getAudioOutputDevices() → 'get_audio_output_devices' ✓
  tauriClient.getAudioInputDevices()  → 'get_audio_input_devices'  ✓
  tauriClient.setAudioOutputDevice()  → 'set_audio_output_device'  ✓
  tauriClient.setAudioInputDevice()   → 'set_audio_input_device'   ✓
  tauriClient.testMicrophone()        → 'test_microphone'          ✓
  tauriClient.testTts()               → 'test_tts'                 ✓
  tauriClient.getAudioDeviceConfig()  → 'get_audio_device_config'  ✓
  tauriClient.saveAudioDeviceConfig() → 'save_audio_device_config' ✓
       │
       │  via: audioService.ts (couche service)
       ▼
AudioService (src/features/audio-center/services/audioService.ts)
  getOutputDevices()    → tauriClient.getAudioOutputDevices()  ✓
  getInputDevices()     → tauriClient.getAudioInputDevices()   ✓
  setOutputDevice()     → tauriClient.setAudioOutputDevice()   + saveAudioDeviceConfig() ✓
  setInputDevice()      → tauriClient.setAudioInputDevice()    + saveAudioDeviceConfig() ✓
  testMicrophone()      → tauriClient.testMicrophone()         ✓
  testSpeaker()         → tauriClient.testTts()                ✓
  localStorage cache    → STORAGE_KEY='titane_audio_config'    ✓
       │
       │  via: useAudio hook
       ▼
useAudio Hook (src/features/audio-center/hooks/useAudio.ts)
  outputDevices, inputDevices, testSpeaker, testMicrophone, setOutputDevice, setInputDevice...
       │
       ▼
Admin Audio Page (src/features/audio-center/AudioCenterPage.tsx)
  DeviceSelector input/output  → useAudio.inputDevices/outputDevices ✓
  testSpeaker button            → useAudio.testSpeaker()               ✓
  testMicrophone button         → useAudio.testMicrophone()            ✓
       │
       │  via: tauriClient.getAudioDeviceConfig / saveAudioDeviceConfig
       ▼
Admin Config Hub (src/pages/ConfigurationHub.tsx — tab 'audio')
  audioConfig.inputDeviceId/Label   ← get_audio_device_config ✓
  audioConfig.outputDeviceId/Label  ← get_audio_device_config ✓
  audioConfig.volume, noise*...     ← get_audio_device_config ✓
       │
       ▼
Canonical Persistence
  ~/.local/share/com.titane.infinity/audio_device_config.json
  Contenu réel: {"outputDeviceId":"48","outputDeviceLabel":"Navi 31 HDMI/DP Audio..."}
```
