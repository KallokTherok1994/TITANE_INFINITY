# 02 — SCOPE FREEZE

## Périmètre Autorisé (Ring 4 + Ring 3)

### Fichiers code modifiés (1/5 max)
1. `src-tauri/src/main.rs` — ajout mock stubs + enregistrement generate_handler![]

### Registry modifiée (1/1 max)
- `scripts/autoheal/autoheal_rules.jsonl` — 1 entrée ajoutée après schéma validé et fix appliqué

### Cycles autoheal (1/2 max)
- 1 cycle appliqué (AH-2026-03-15-AUDIO-001)

## Périmètre INTERDIT (respecté)
- `src-tauri/capabilities/` — allowlist gelée ✅ NON TOUCHÉ
- `src-tauri/tauri.conf.json` — configuration Tauri gelée ✅ NON TOUCHÉ
- Nouveaux moteurs audio ✅ AUCUN
- Réécriture STT/TTS ✅ AUCUNE
- Réécriture des hooks browser audio ✅ AUCUNE

## Corrections Minimales Autorisées — Appliquées
- D3-001 : stop_speaking → mock stub + enregistrement ✅
- D3-002 : is_speaking → mock stub + enregistrement ✅
- D4-001 : transcribe_audio → mock stub ajouté ✅
- D4-002 : is_recording → mock stub ajouté ✅

## Non Corrigé dans ce Scope (Quarantaine)
- D5-001 : voice_synthesize_speech dans allowlist (allowlist gelée)
- D2-001 : get_recording_status non enregistré + hors allowlist (double gel)
- D13-001/3 : stubs voice_play_audio/calibrate/wake_word (architecture)
