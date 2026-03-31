# 02 SCOPE
# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Rings impactés

| Ring | Périmètre | Fichiers clés |
|------|-----------|---------------|
| R2 | Backend Rust audio | src-tauri/src/audio/commands.rs, capture.rs, mod.rs |
| R3 | IPC bridge | src-tauri/src/main.rs (generate_handler), src-tauri/capabilities/audio_tts.json |
| R4 | Frontend | src/features/audio-center/*, src/lib/tauriClient.ts |
| R4 | Admin config | src/pages/ConfigurationHub.tsx, src-tauri/src/config/mod.rs |

## Fichiers source de vérité audio

| Fichier | Rôle |
|---------|------|
| src-tauri/src/audio/commands.rs | Découverte devices, test capture, TTS |
| src-tauri/src/config/mod.rs | AudioDeviceConfig + save/load |
| src/features/audio-center/services/audioService.ts | Service IPC couche métier |
| src/features/audio-center/hooks/useAudio.ts | État React audio |
| src/features/audio-center/AudioCenterPage.tsx | UI Audio Admin |
| src/pages/ConfigurationHub.tsx | Config Admin canonique (tab audio) |
| src/lib/tauriClient.ts | Wrapper IPC |
| src/lib/tauriCommands.ts | Constantes commandes |

## Hors scope (non modifié)

- src-tauri/src/audio/recorder.rs, streaming_engine.rs, vad.rs (fonctionnalités avancées)
- src-tauri/src/tts/ (TTS cloud — hors scope audio center)
- src-tauri/src/duplex/ (audio duplex — non impacté)
- src/services/ai/ (non audio)
- e2e/ tests (non audio center)

## Surfaces réseau

Aucune — audio est entièrement local.
