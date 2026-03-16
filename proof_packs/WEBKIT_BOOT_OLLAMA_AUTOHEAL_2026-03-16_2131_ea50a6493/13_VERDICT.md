# VERDICT FINAL — 2026-03-16

## Gates
| Gate | Statut |
|------|--------|
| G_BOOT_TRUTH | PASS |
| G_SINGLE_BOOT_SEQUENCE | PASS |
| G_NO_DUPLICATE_OLLAMA_PROBES | PASS |
| G_PROVIDER_TRUTH | PASS |
| G_NO_LYING_FALLBACK | PASS |
| G_WEBKIT_CRASH_CAPTURED_OR_MITIGATED | PASS |
| G_SAFE_MODE_AVAILABLE | PASS |
| G_VERIFY_OR_ROLLBACK_ACTIVE | PASS |
| G_TESTS_X3 | PASS — 3224/3224 × 3 runs |
| G_BUILD_X3 | PASS |
| G_E2E_X3 | BLOCKED_E2E (design constraint, documented) |
| G_AH_RECURRENCE_GUARD_PASS | PASS |
| verify_instructions.sh | PASS=20 FAIL=0 |

---EXEC_DECISION---
MODE: LOCAL
WHY: 3 fixes TypeScript frontend + 2 autoheal entries. Build PASS. Tests 3224/3224 × 3 runs. Gates PASS.
RISK: P1
PROOFS:
  - src/main.tsx:1085-1112 → _titaneCurrentWindowLabel guard confirmed
  - src/services/ai/providers/ollama.ts:84,192-200 → singleton probe confirmed
  - src/services/ai/providers/ollama.ts:169-171,463-467 → warmup grace period confirmed
  - scripts/autoheal/autoheal_rules.jsonl → AH-UI-BOOT-DUPLICATION + AH-OLLAMA-FALSE-OFFLINE
  - pnpm test --run × 3: 216 files, 3224 tests, EXIT 0
  - pnpm build: EXIT 0
  - detect_recurrence.sh: G_AH_RECURRENCE_GUARD_PASS
  - verify_instructions.sh: PASS=20 FAIL=0
ROLLBACK: git restore -- src/main.tsx src/services/ai/providers/ollama.ts scripts/autoheal/autoheal_rules.jsonl
VERDICT: PASS
NEXT_LOCK: G_E2E_X3 (BLOCKED_E2E — requires Tauri AppImage runtime smoke test)
---
