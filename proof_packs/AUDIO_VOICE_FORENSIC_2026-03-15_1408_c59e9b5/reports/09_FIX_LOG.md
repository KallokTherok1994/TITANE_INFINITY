# 09 — JOURNAL DES CORRECTIONS

## FIX-001 — D3-001/D3-002 : stop_speaking + is_speaking

```
FIX_ID           : FIX-001
DEFECT_CLASS     : D3 COMMAND_REGISTRATION_MISSING
PROOF_LEVEL_BEFORE : STATIC_PROVEN (handlers présents, non enregistrés)
PROOF_LEVEL_AFTER  : STATIC_PROVEN + TEXTUAL_RECHECK (BUILD_PROVEN requis pour closure)
FILES_CHANGED    : src-tauri/src/main.rs
RAW_EVIDENCE     : raw/grep/B03_stop_is_speaking.txt, raw/grep/B05_handler_end.txt
DIFF_PATH        : raw/diffs/001_main_rs.patch
VALIDATION_TIER  : Tier 4 (TEXTUAL_RECHECK) — grep lignes 174, 180, 1924, 1925 confirmés
ROLLBACK         : git restore -- src-tauri/src/main.rs
RESIDUAL_RISK    : BUILD_PROVEN non confirmé (cargo build non exécuté)
```

**Changements appliqués dans main.rs :**
1. Ajout mock stubs `stop_speaking()` et `is_speaking()` dans le bloc `#[cfg(feature = "mock")]` du module `audio::commands` (après `cancel_recording`, lignes 170-183)
2. Enregistrement `audio::commands::stop_speaking` et `audio::commands::is_speaking` dans `generate_handler![]` (lignes 1921-1925)

---

## FIX-002 — D4-001/D4-002 : transcribe_audio + is_recording mock stubs

```
FIX_ID           : FIX-002
DEFECT_CLASS     : D4 PAYLOAD_SCHEMA_MISMATCH (mock feature gate manquant)
PROOF_LEVEL_BEFORE : STATIC_PROVEN (enregistrés sans stubs → BUILD_RISK)
PROOF_LEVEL_AFTER  : STATIC_PROVEN + TEXTUAL_RECHECK
FILES_CHANGED    : src-tauri/src/main.rs
RAW_EVIDENCE     : raw/grep/C01_audio_commands_audio_fns.txt, raw/grep/B04_mock_stubs.txt
DIFF_PATH        : raw/diffs/001_main_rs.patch
VALIDATION_TIER  : Tier 4 (TEXTUAL_RECHECK) — grep lignes 188, 194 confirmés
ROLLBACK         : git restore -- src-tauri/src/main.rs
RESIDUAL_RISK    : BUILD_PROVEN requis pour confirmer absence d'erreur compilation
```

**Changements appliqués dans main.rs :**
- Ajout mock stub `transcribe_audio(_audio_data: Vec<u8>) -> Result<String, String>` retournant `"(mock-transcription)"`
- Ajout mock stub `is_recording() -> Result<bool, String>` retournant `false`
- Tous deux dans le bloc `#[cfg(feature = "mock")]` du module `audio::commands` (lignes 184-196)

---

## AutoHeal
- `AH-2026-03-15-AUDIO-001` ajouté à `scripts/autoheal/autoheal_rules.jsonl` (ligne 262)
- Gates post-fix : `detect_recurrence.sh` PASS, `verify_instructions.sh` PASS=20 FAIL=0
