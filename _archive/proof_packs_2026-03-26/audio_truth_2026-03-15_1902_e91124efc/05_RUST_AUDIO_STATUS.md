# 05 RUST AUDIO STATUS

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Fichiers inspectés

- src-tauri/src/audio/commands.rs (1892 lignes)
- src-tauri/src/audio/mod.rs
- src-tauri/src/audio/capture.rs
- src-tauri/src/config/mod.rs (AudioDeviceConfig)

## Commandes Rust — Statut

### get_audio_output_devices — OK ✓

- Stratégie: wpctl status → parse Sinks → fallback pactl → fallback aplay
- IDs retournés: wpctl numeric IDs (33, 49, 51) utilisables avec wpctl set-default
- Parsing wpctl: VALIDÉ sur données réelles (Rust + shell concordent)
- Fallback honnête: retourne Err si aucun device trouvé (pas de fake default)

### get_audio_input_devices — OK ✓

- Stratégie: wpctl status → parse Sources → fallback pactl → fallback arecord
- Filtre monitors: OUI (lignes avec "monitor" exclues)
- IDs retournés: 50, 52 (réels OS)
- Fallback honnête: retourne Err si aucun device trouvé

### set_audio_output_device — OK ✓

- wpctl set-default <id> → PASS
- Fallback pactl set-default-sink → SKIP (pactl non installé)
- Acceptation gracieuse si pw-cli présent mais pas pactl/wpctl

### set_audio_input_device — OK ✓

- Même stratégie que set_audio_output_device

### test_microphone — FIXÉ ✓ (was RUST_CAPTURE_NOT_CAUSAL)

**Avant (BROKEN):**

```rust
Command::new("pw-record")
    .args(["--target", id, ...])
    .env("PW_DURATION_LIMIT", "3.0s")  // FAKE: env var non-existant
    .output()  // BLOQUAIT INDÉFINIMENT
```

**Après (FIXÉ):**

```rust
let duration_arg = format!("{:.0}", duration_secs + 1.0);
Command::new("timeout")
    .args([duration_arg.as_str(), "pw-record", "--target", id.as_str(), ...])
    .output()  // Termine après duration_secs+1 secondes max
```

- Preuve runtime: `timeout 3 pw-record --target 52 ...` → 62-94 KB WAV, exit 124 ✓
- Arecord fallback: suppression `-D hw:{wpctl_id},0` (ID wpctl ≠ ID ALSA carte)
- Succès basé sur taille fichier (réaliste, non inventé)

### test_tts / tts_speak — PARTIELLEMENT OK

- Causal: tente réellement piper/espeak/espeak-ng
- piper non installé → fallback espeak
- espeak non installé → Err honnête propagée
- test_tts retourne success=false, errorMessage="..." → PAS de faux succès ✓
- Classification: OS_DEVICE_UNAVAILABLE (TTS engine)

### AudioDeviceConfig (src-tauri/src/config/mod.rs) — OK ✓

```rust
pub struct AudioDeviceConfig {
    pub input_device_id: String,
    pub input_device_label: String,
    pub output_device_id: String,
    pub output_device_label: String,
    pub volume: f32,
    pub noise_reduction: bool,
    pub echo_cancellation: bool,
    pub auto_gain_control: bool,
}
```

- get_audio_device_config: lit app_data_dir/audio_device_config.json ✓
- save_audio_device_config: écrit app_data_dir/audio_device_config.json ✓

## Cargo Check

```
$ cargo check --manifest-path src-tauri/Cargo.toml --message-format short
(0 errors, 0 warnings pour audio/commands.rs)
EXIT: 0 — PASS
```
