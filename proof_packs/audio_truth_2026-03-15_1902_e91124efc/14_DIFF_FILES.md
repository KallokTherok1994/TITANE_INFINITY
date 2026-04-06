# 14 DIFF FILES
# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Fichiers modifiés dans cette session

### 1. src-tauri/src/audio/commands.rs

**Lignes touchées**: ~660-700
**Nature**: Fix RUST_CAPTURE_NOT_CAUSAL
**Changement**:
- Remplacement `Command::new("pw-record")` par `Command::new("timeout")` avec duration_arg
- Suppression `.env("PW_DURATION_LIMIT", ...)` (inventé, sans effet)
- Suppression `-D "hw:{id},0"` dans arecord fallback (ID wpctl ≠ ID ALSA)
- Arecord fallback utilise désormais OS default (wpctl set-default déjà appelé)

**diff résumé**:
```
src-tauri/src/audio/commands.rs | ~15 lignes modifiées
```

### 2. scripts/autoheal/autoheal_rules.jsonl

**Nature**: Append obligatoire (AH-2026-03-15-0211)
**Changement**: +1 entry complète (champs: id, date, scope, symptom, root_cause, fix, prevention_test, commands, files_changed, rollback)

## Fichiers non modifiés (vérifiés intacts)

- src/features/audio-center/AudioCenterPage.tsx (aucun bug frontend détecté)
- src/features/audio-center/services/audioService.ts (bindings corrects)
- src/features/audio-center/hooks/useAudio.ts (correct)
- src/lib/tauriClient.ts (IPC correct)
- src/lib/tauriCommands.ts (constants corrects)
- src-tauri/src/config/mod.rs (AudioDeviceConfig canonical intact)
- src/pages/ConfigurationHub.tsx (Audio tab intact)
- src-tauri/capabilities/audio_tts.json (allowlist intact)
- src-tauri/src/main.rs (generate_handler intact)

## Scope respecté

Aucun refactor cosmétique hors scope.
Aucune modification frontend si cause était backend.
Aucune duplication de source de vérité.
