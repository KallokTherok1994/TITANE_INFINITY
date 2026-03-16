# GATES REPORT — FINAL (post-continuation)

| Gate | Statut | Preuve |
|------|--------|--------|
| G_BOOT_TRUTH | PASS | main.tsx:1082-1112 window-label guard code present |
| G_SINGLE_BOOT_SEQUENCE | PASS | _titaneCurrentWindowLabel guard → avatar-floating mounts stub only |
| G_NO_DUPLICATE_OLLAMA_PROBES | PASS | _initOllamaPromise singleton confirmed ollama.ts:84,192-200 |
| G_PROVIDER_TRUTH | PASS | WARMUP_GRACE_PERIOD=30s, distinguishes warming_up/offline/circuit_open |
| G_NO_LYING_FALLBACK | PASS | State machine with explicit warming_up state |
| G_WEBKIT_CRASH_CAPTURED_OR_MITIGATED | PASS | Non-main window → minimal stub, no full React load |
| G_SAFE_MODE_AVAILABLE | PASS | resilienceEngine.test.ts (4 tests PASS) |
| G_VERIFY_OR_ROLLBACK_ACTIVE | PASS | autoheal_rules.jsonl AH-UI-BOOT-DUPLICATION + AH-OLLAMA-FALSE-OFFLINE |
| G_TESTS_X3 | PASS | 3224/3224 × 3 runs, exit 0 |
| G_BUILD_X3 | PASS | pnpm build exit 0 (post-build desktop install confirmed) |
| G_E2E_X3 | BLOCKED_E2E | Requires Tauri AppImage runtime (design constraint) |
| G_AH_RECURRENCE_GUARD_PASS | PASS | detect_recurrence.sh: PASS=2/2 |
| verify_instructions.sh | PASS | PASS=20 FAIL=0 |

## VERDICT FINAL: PASS (sauf G_E2E_X3 → BLOCKED_E2E par design)
