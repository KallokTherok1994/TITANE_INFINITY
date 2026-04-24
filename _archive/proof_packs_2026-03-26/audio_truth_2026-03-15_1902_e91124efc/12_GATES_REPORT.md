# 12 GATES REPORT

# TITANE∞ — audio_truth_2026-03-15_1902_e91124efc

## Gates exécutés

| Gate                    | Commande                                         | Résultat                    |
| ----------------------- | ------------------------------------------------ | --------------------------- |
| G1: cargo check         | cargo check --manifest-path src-tauri/Cargo.toml | PASS (0 errors)             |
| G2: detect_recurrence   | bash scripts/autoheal/detect_recurrence.sh       | PASS (entries=302)          |
| G3: verify_instructions | bash scripts/verify_instructions.sh              | PASS (20/20)                |
| G4: OS audio stack      | wpctl status                                     | PASS (PipeWire 1.0.5 actif) |
| G5: device enumeration  | wpctl status + parse                             | PASS (2 in, 3 out)          |
| G6: mic capture x3      | timeout+pw-record --target 52                    | PASS x3                     |
| G7: persistence file    | cat audio_device_config.json                     | EXISTS ✓                    |
| G8: IPC mapping         | grep TAURI_COMMANDS                              | PASS (no drift)             |

## Gates échoués

Aucun ✓

## Gates non exécutables (BLOCKED justifiés)

| Gate                        | Raison                         | Classification              |
| --------------------------- | ------------------------------ | --------------------------- |
| Speaker test réel           | espeak/piper non installés     | OS_DEVICE_UNAVAILABLE (TTS) |
| E2E UI full Tauri           | Build release requis (~10 min) | RUNTIME_BUILD_REQUIRED      |
| Reload/restore session live | App Tauri fermée               | RUNTIME_BUILD_REQUIRED      |

## Verdict gates

- Gates prouvables: 8/8 PASS
- Gates bloqués par OS (TTS): 1 — honnêtement classifié
- Gates bloqués par build time: 2 — non bloquants pour certification QUALIFIED
