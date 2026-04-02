# 04 — TAXONOMIE DES DÉFAUTS

## D3-001 — stop_speaking absent de generate_handler![]
- **Preuve :** raw/grep/B03_stop_is_speaking.txt + raw/grep/B05_handler_end.txt
- **Niveau :** STATIC_PROVEN
- **Fichiers :** audio/commands.rs (l.1116), main.rs generate_handler (absent avant fix)
- **Corrigible :** OUI — mock stub + enregistrement handler
- **Auto-fix :** OUI ✅ **APPLIQUÉ**
- **Auto-heal :** OUI ✅ **APPLIQUÉ** (AH-2026-03-15-AUDIO-001)
- **Statut :** **RÉSOLU**

## D3-002 — is_speaking absent de generate_handler![]
- **Preuve :** raw/grep/B03_stop_is_speaking.txt
- **Niveau :** STATIC_PROVEN
- **Fichiers :** audio/commands.rs (l.1124), main.rs
- **Corrigible :** OUI
- **Auto-fix :** OUI ✅ **APPLIQUÉ**
- **Statut :** **RÉSOLU**

## D4-001 — transcribe_audio enregistré sans mock stub (BUILD_RISK)
- **Preuve :** raw/grep/C01_audio_commands_audio_fns.txt + raw/grep/B04_mock_stubs.txt
- **Niveau :** STATIC_PROVEN (BUILD_RISK non confirmable sans cargo build)
- **Fichiers :** audio/commands.rs (l.728), main.rs (stub absent avant fix)
- **Corrigible :** OUI — ajout mock stub
- **Auto-fix :** OUI ✅ **APPLIQUÉ**
- **Statut :** **RÉSOLU (STATIC) — BUILD_PROVEN nécessite cargo build**

## D4-002 — is_recording enregistré sans mock stub (BUILD_RISK)
- **Preuve :** raw/grep/C02_audio_cfg_gates.txt (l.1031) + main.rs absence stub
- **Niveau :** STATIC_PROVEN
- **Fichiers :** audio/commands.rs (l.1033), main.rs
- **Corrigible :** OUI
- **Auto-fix :** OUI ✅ **APPLIQUÉ**
- **Statut :** **RÉSOLU (STATIC)**

## D5-001 — voice_synthesize_speech deprecated dans allowlist (QUARANTAINE)
- **Preuve :** raw/grep/H01_audio_tts_capabilities.txt + voice_engine.rs #[deprecated]
- **Niveau :** STATIC_PROVEN
- **Fichiers :** capabilities/audio_tts.json (line "voice_synthesize_speech"), overdrive/voice_engine.rs
- **Corrigible :** OUI — retrait de l'allowlist (gelée dans ce scope)
- **Auto-fix :** NON (allowlist gelée)
- **Condition d'arrêt :** PR dédiée + grep frontend confirmant aucun appel

## D2-001 — get_recording_status appelé frontend, hors allowlist + hors handler (QUARANTAINE)
- **Preuve :** raw/grep/C03_frontend_audio_invoke.txt (audioSelfHeal.ts ~l.150) + main.rs absence
- **Niveau :** STATIC_PROVEN
- **Fichiers :** src/services/audio/audioSelfHeal.ts, audio/commands.rs (handler existe), main.rs (non enregistré)
- **Corrigible :** PARTIELLE — nécessite allowlist (gelée) + handler
- **Auto-fix :** NON
- **Condition d'arrêt :** PR capabilities + enregistrement handler + mock stub

## D13-001 — voice_play_audio stub (QUARANTAINE)
- **Preuve :** Lecture voice_engine.rs (log sans lecture réelle)
- **Niveau :** STATIC_PROVEN / STUB
- **Auto-heal :** NON (D13 interdit)

## D13-002 — voice_calibrate_microphone stub (QUARANTAINE)
- **Niveau :** STATIC_PROVEN / STUB (simulated_ambient_db hardcodé)

## D13-003 — voice_detect_wake_word stub (QUARANTAINE)
- **Niveau :** STATIC_PROVEN / STUB (always false)

## D15-001 — STT via subprocess Python (INFORMATION)
- **Niveau :** STATIC_PROVEN — subprocess ~/.local/bin/whisper (openai-whisper)
- **Impact :** dépendance externe, silencieusement dégradé si absent

## D15-002 — TTS via subprocess paplay/aplay (INFORMATION)
- **Niveau :** STATIC_PROVEN
- **Impact :** paplay non disponible (pactl absent) → fallback aplay/espeak

## D8-001 — AudioContext dans moteurs internes frontend (INFORMATION)
- **Niveau :** STATIC_PROVEN
- **Impact :** Double pipeline holophonique/RT — valide pour résilience, non critique
