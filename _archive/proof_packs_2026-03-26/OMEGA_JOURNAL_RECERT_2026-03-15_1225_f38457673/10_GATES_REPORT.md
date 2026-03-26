# 10_GATES_REPORT

## Gates — OMEGA_JOURNAL_RECERT 2026-03-15 12:25 HEAD f38457673

| Gate | Résultat | Preuve |
|------|----------|--------|
| G_BOOT_TRUTH | **PASS** | HEAD f38457673, MAIN, node v24, pnpm 10.30.2, rustc 1.94.0 |
| G_RUNTIME_TARGET_TRUTH | **PASS** | Source code identifié, pas de binaire requis pour recertification |
| G_PATCH_PRESENCE_TRUTH | **PASS** | Tous les patches session #1 présents dans staged (diff confirmé) |
| G_DURATION_TRUTH | **PASS** | providerStatus.latency/1000 câblé post-load, chain Chat.tsx→ThinkingPanel ✅ |
| G_SYSTEM_FILE_TRUTH | **PASS** | oj-non-capture conditionnel sur systemPromptSources.length, libellé honnête |
| G_QUALITY_SCORE_TRUTH | **PASS** | Score completion-based sur steps réels; null→NON INSTRUMENTÉ quand non disponible |
| G_XP_PROGRESSION_TRUTH | **PASS** | lastGainAmount utilisé dans toutes les sections XP (résiduel runtime grid corrigé) |
| G_SCROLL_WHEEL_TRUTH | **PASS** | .oj-journal-body { max-height:480px; overflow-y:auto; overscroll-behavior:contain } |
| G_AUTOHEAL_GOVERNED | **PASS** | 6 règles OMEGA_JOURNAL (001–006), format correct, append-only |
| G_VISIBLE_UI_TRUTH | **QUALIFIED** | Vérification source code; UI visuelle non testée (Tauri non lancé) |
| G_RECURRENCE_GUARD | **PASS** | detect_recurrence.sh → G_AH_RECURRENCE_GUARD_PASS entries=284 |
| G_TESTS_X3 | **PASS** | devSudo 89/89 × 3 runs stables |
| G_BUILD_X3 | **QUALIFIED** | tsc --noEmit exit 0 × 2 (avant + après patch résiduel) |
| G_ROLLBACK_READY | **PASS** | Voir 11_ROLLBACK.md |
| G_VERIFY_INSTRUCTIONS | **PASS** | verify_instructions.sh PASS=20 FAIL=0 |

## Bilan

- PASS : 13/15
- QUALIFIED : 2/15 (G_VISIBLE_UI_TRUTH + G_BUILD_X3 — limitations documentées)
- FAIL : 0
- BLOCKED : 0
