# 08 ADMIN AUDIO TRUTH

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## AudioCenterPage (src/features/audio-center/AudioCenterPage.tsx)

### Composant DeviceSelector

- Affiche les devices retournés par useAudio.outputDevices / inputDevices ✓
- selectedId vient de config.output.deviceId / config.input.deviceId ✓
- onSelect appelle setOutputDevice(id) / setInputDevice(id) ✓
- Avertissement isMuted affiché si périphérique muet au niveau OS ✓
- data-testid="audio-output-device-selector" / "audio-input-device-selector" ✓

### Bouton Test Haut-parleur

- data-testid="btn-audio-test-speaker" ✓
- onClick: testSpeaker('Test du haut-parleur. Un, deux, trois.') ✓
- Causal: appelle audioService.testSpeaker() → tauriClient.testTts() → test_tts Rust ✓
- outputDeviceId passé dans settings ✓

### Bouton Test Microphone

- data-testid="btn-audio-test-mic" (attendu — à vérifier)
- onClick: testMicrophone() ✓
- Causal: appelle audioService.testMicrophone() → tauriClient.testMicrophone() → test_microphone Rust ✓
- deviceId passé depuis config.input.deviceId ✓

### TestResult Component

- Affiche success ✅ ou ❌ avec errorMessage honnête ✓
- PAS de toast "succès" sans preuve ✓

## Tabs actifs AudioCenterPage

- 'voice': TTS engine selection ✓
- 'devices': DeviceSelector input/output ✓
- 'diagnostics': AudioDiagnosticsPanel ✓
- 'advanced': Paramètres avancés ✓

## useAudio hook (src/features/audio-center/hooks/useAudio.ts)

- loadData(): charge outputDevices + inputDevices au mount ✓
- setOutputDevice(): délègue à audioService.setOutputDevice() ✓
- setInputDevice(): délègue à audioService.setInputDevice() ✓
- testSpeaker(): délègue à audioService.testSpeaker() ✓
- testMicrophone(): délègue à audioService.testMicrophone() ✓
- refreshDevices(): invalide cache + rechargement ✓

## ADMIN_AUDIO_DRIFT: NONE ✓

## UI_ONLY_SUCCESS: NONE ✓
