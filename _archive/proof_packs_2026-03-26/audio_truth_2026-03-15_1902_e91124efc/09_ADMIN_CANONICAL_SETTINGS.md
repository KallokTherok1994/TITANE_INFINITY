# 09 ADMIN CANONICAL SETTINGS

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Source canonique (Rust)

```rust
// src-tauri/src/config/mod.rs
pub struct AudioDeviceConfig {
    pub input_device_id: String,       // settings.audio.inputDeviceId
    pub input_device_label: String,    // settings.audio.inputDeviceLabel
    pub output_device_id: String,      // settings.audio.outputDeviceId
    pub output_device_label: String,   // settings.audio.outputDeviceLabel
    pub volume: f32,                   // settings.audio.volume
    pub noise_reduction: bool,         // settings.audio.noiseReduction
    pub echo_cancellation: bool,       // settings.audio.echoCancellation
    pub auto_gain_control: bool,       // settings.audio.autoGainControl
}
```

Persisté dans: `<app_data_dir>/audio_device_config.json`
Path réel: `~/.local/share/com.titane.infinity/audio_device_config.json`

## Fichier réel existant

```json
{
  "inputDeviceId": "",
  "inputDeviceLabel": "",
  "outputDeviceId": "48",
  "outputDeviceLabel": "Navi 31 HDMI/DP Audio Stéréo numérique (HDMI)",
  "volume": 1.0,
  "noiseReduction": false,
  "echoCancellation": false,
  "autoGainControl": false
}
```

Observation: outputDeviceId="48" est l'ID de device PipeWire (pas sink).
Les sinks énumérés ont les IDs 33/49/51.
Impact: après reload, le dropdown montrera les sinks (33/49/51), la valeur sauvée (48) ne correspondra à aucune option. Sélection utilisateur requise pour re-synchroniser.
Classification: minor UI drift (persisted ID = device node vs sink node).
Non bloquant: la chaîne fonctionnelle reste intacte.

## ConfigurationHub (src/pages/ConfigurationHub.tsx — tab audio)

- Tab 'audio' présent ✓
- Charge: tauriClient.getAudioDeviceConfig() au mount ✓
- Affiche: inputDeviceId, inputDeviceLabel, outputDeviceId, outputDeviceLabel, volume ✓
- data-testid présents: audio-input-device-id, audio-input-device-label, audio-output-device-id, audio-output-device-label, audio-volume ✓
- Description: "Configuration canonique des entrées/sorties audio. Source unique de vérité — partagée avec la page Audio Center."
- Lecture seule pour noiseReduction/echoCancellation/autoGainControl ✓

## Écriture depuis AudioService

setOutputDevice(id):

1. this.config.output.deviceId = id → localStorage ✓
2. tauriClient.setAudioOutputDevice({deviceId: id}) → wpctl set-default ✓
3. \_resolveDeviceLabel(id, 'output') → nom du device ✓
4. saveAudioDeviceConfig({...current, outputDeviceId: id, outputDeviceLabel}) ✓

setInputDevice(id): même pattern ✓

## PERSISTENCE_NOT_CANONICAL: NONE ✓

## Drift Admin/AudioCenter: NONE ✓
