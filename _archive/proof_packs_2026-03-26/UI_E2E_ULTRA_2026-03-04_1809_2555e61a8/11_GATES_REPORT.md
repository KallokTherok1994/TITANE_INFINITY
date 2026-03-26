# 11_GATES_REPORT
- Timestamp UTC: 2026-03-04T23:43:00Z

## Gates applicables

| Gate | Statut | Preuve | Note |
|---|---|---|---|
| G_DISCOVERY_COMPLETE | PASS | `02_UI_DISCOVERY.md`, `logs/ui_*` | Discovery exécuté |
| G_UI_COVERAGE_MAP_PRESENT | PASS | `03_UI_COVERAGE_MAP.md` | Mapping produit |
| G_SMOKE_X3 | FAIL | `05_E2E_RUNS_X3.log` | Run1 exit=1, x3 incomplet |
| G_FULL_X3 | BLOCKED | `07_NO_SKIPS_GATE.md` | Non exécuté car smoke FAIL |
| G_NO_SKIPS_REQUIRED_FLOWS | FAIL | `07_NO_SKIPS_GATE.md` | Condition x3 non satisfaite |
| G_DESKTOP_RUNTIME_REAL | PASS | `artifacts/smoke/tauri_driver.log` | Runtime WRY/Tauri réel prouvé |
| G_AH_RULE_CAPTURED_FOR_EACH_FIX | PASS | `08_AUTOHEAL_LOG.md`, `scripts/autoheal/autoheal_rules.jsonl` | Entrées append-only ajoutées |
| G_AH_RECURRENCE_GUARD_PASS | PASS | `logs/_autoheal_checks.txt` | detect_recurrence PASS |
| G_VERIFY_INSTRUCTIONS | PASS | `logs/_autoheal_checks.txt` | verify_instructions PASS |

## Gate bloquante terminale
- `No-silence contract failed: no assistant message and no visible error` (voir `artifacts/smoke/wdio.log`)
