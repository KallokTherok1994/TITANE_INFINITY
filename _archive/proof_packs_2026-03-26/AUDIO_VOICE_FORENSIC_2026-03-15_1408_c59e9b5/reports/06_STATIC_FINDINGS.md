# 06 — FINDINGS STATIQUES (STATIC_PROVEN)

## SF-001 [RÉSOLU] : stop_speaking + is_speaking absents de generate_handler![]
Handlers `#[cfg(not(feature = "mock"))]` définis dans audio/commands.rs (l.1116, l.1124),
allowlistés dans capabilities/audio_tts.json, mais absents de generate_handler![] + aucun mock stub.
**Fix appliqué** : mock stubs ajoutés + enregistrement dans generate_handler![].
Preuve textuelle : raw/validation/001_fix_textual_check.txt (lignes 174, 180, 1924, 1925).

## SF-002 [RÉSOLU] : transcribe_audio + is_recording sans mock stub (BUILD_RISK)
Ajoutés au generate_handler![] dans c59e9b5 (l.1919-1920 de main.rs) sans mock stubs.
Feature "mock" incluse dans default features → risque compile error en mode dev standard.
**Fix appliqué** : mock stubs ajoutés (l.188-196 de main.rs post-fix).
Preuve textuelle : raw/validation/001_fix_textual_check.txt (lignes 188, 194).

## SF-003 [QUARANTAINE] : voice_synthesize_speech deprecated dans allowlist
Dépréciée depuis v20.0, remplacée par `speak()`. Stub retourne 16KB silence.
Présente dans audio_tts.json mais intentionnellement hors generate_handler![].
Allowlist gelée → PR requise.

## SF-004 [QUARANTAINE] : get_recording_status non enregistré, appelé via audioSelfHeal
audioSelfHeal.ts ligne ~150 : `secureInvoke<any>('get_recording_status', {})`.
Handler présent dans audio/commands.rs (l.1042) mais absent de allowlist ET generate_handler![].
Gestion gracieuse (catch), impact limité.

## SF-005 [INFO] : Architecture STT/TTS via subprocess
TTS : subprocess espeak/piper/paplay. STT : subprocess ~/.local/bin/whisper (Python openai-whisper).
Fallback multi-niveau présent dans le code.
pactl absent → paplay non fonctionnel → fallback aplay/espeak actif.

## SF-006 [INFO] : AudioContext dans moteurs internes frontend
holophonicEngine.ts, RealTimeExecutionEngine.ts, notificationSystem.ts — usage valide pour résilience.
Pas dans chemin TTS principal. Pattern hybride acceptable.

## SF-007 [INFO] : 3 stubs dans voice_engine.rs
voice_play_audio (log sans lecture), voice_calibrate_microphone (hardcodé), voice_detect_wake_word (always false).
Tous enregistrés dans generate_handler![] → réponse IPC possible mais comportement factice.

## SF-008 [OK] : Architecture audio bien structurée
21 commandes audio::commands enregistrées. 17 voice_engine. 3 whisper_streaming.
Feature-gating cpal correct. Pattern mock stubs cohérent.

## SF-009 [OK] : Whisper streaming opérationnel (STATIC)
AtomicBool + Mutex<Vec<Vec<u8>>>, state machine correcte, enregistré dans handler.

## SF-010 [OK] : VoiceEngineState avec lock_or_recover!
Arc<Mutex<>> + récupération mutex poisoned → résilience correcte.
