# 05 — MATRICE DES NIVEAUX DE PREUVE

| ID | Finding | Niveau Preuve | Statut | Source |
|---|---|---|---|---|
| D3-001 | stop_speaking absent generate_handler | STATIC_PROVEN | **RÉSOLU** | raw/grep/B03 + fix textual recheck |
| D3-002 | is_speaking absent generate_handler | STATIC_PROVEN | **RÉSOLU** | raw/grep/B03 + fix textual recheck |
| D4-001 | transcribe_audio sans mock stub | STATIC_PROVEN | **RÉSOLU (STATIC)** | raw/grep/B04 + fix |
| D4-002 | is_recording sans mock stub | STATIC_PROVEN | **RÉSOLU (STATIC)** | raw/grep/B04 + fix |
| D5-001 | voice_synthesize_speech deprecated allowlisté | STATIC_PROVEN | QUARANTAINE | raw/grep/H01 |
| D2-001 | get_recording_status hors allowlist + handler | STATIC_PROVEN | QUARANTAINE | raw/grep/C03 |
| D13-001 | voice_play_audio stub | STUB | QUARANTAINE | voice_engine.rs (lu) |
| D13-002 | voice_calibrate_microphone stub | STUB | QUARANTAINE | voice_engine.rs (lu) |
| D13-003 | voice_detect_wake_word stub | STUB | QUARANTAINE | voice_engine.rs (lu) |
| D15-001 | STT subprocess Python | STATIC_PROVEN | INFO | audio/commands.rs (lu) |
| D15-002 | TTS subprocess paplay/aplay | STATIC_PROVEN | INFO | audio/commands.rs (lu) |
| D8-001 | AudioContext moteurs internes | STATIC_PROVEN | INFO | raw/grep/D01 |
| ENV-001 | node v18 incompatible | STATIC_PROVEN | INFO | raw/env/004 |
| ENV-002 | pactl non disponible | STATIC_PROVEN | INFO | raw/env/013 |
| GATE-001 | verify_instructions.sh PASS=20 FAIL=0 | STATIC_PROVEN | PASS | raw/validation/005 |
| GATE-002 | detect_recurrence.sh PASS | STATIC_PROVEN | PASS | raw/validation/004 |
| BUILD-001 | cargo build non exécuté | BLOCKED_ENV | PENDING | — |
| RUNTIME-001 | IPC invocation non testée | BLOCKED_ENV | PENDING | — |
| DEVICE-001 | audio device capture non testée | BLOCKED_ENV | PENDING | — |

## Légende
- **STATIC_PROVEN** : prouvé par lecture directe de fichiers et/ou grep
- **STUB** : implémentation placeholder identifiée par lecture
- **BLOCKED_ENV** : non testable dans cette session
- **TEXTUAL_RECHECK** : persistance textuelle du fix confirmée (raw/validation/001)
