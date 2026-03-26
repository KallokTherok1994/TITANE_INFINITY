# GATES REPORT
## Proof Pack: POST_SEAL_CORRECTION_2026-03-21_1228_9b50cc67e

---

## Gate Results

| Gate | Status | Evidence |
|---|---|---|
| G_BOOT_TRUTH | PASS | HEAD=9b50cc67e, working tree clean |
| G_LOCKFILE_RESOLVED | PASS | DEPENDENCY_DRIFT_PROVEN — patch/minor deps, no breaking change |
| G_DEP_SAFE | PASS | 0 major bumps; dompurify security patch included |
| G_MEMORY_CONSUMPTION_PROVEN | **NEW PASS** | memory-consumption-truth.test.ts 6/6 × 3 runs |
| G_RESPONSE_ASSEMBLY_PROVEN | **NEW PASS** | response-assembly-truth.test.ts 9/9 × 3 runs |
| G_X3_STABILITY | PASS | 40/40 × 3 = 120 executions, 0 failures, 0 flaky |
| G_FULL_SUITE_NO_REGRESSION | PASS | 3399/3399 vitest PASS (3384+15 new) |
| G_RUST_SUITE | PASS | 26/26 active Rust tests PASS |
| G_VERIFY_INSTRUCTIONS | PASS | 20/0 (via verify_instructions.sh) |
| G_AH_RECURRENCE_GUARD | PASS | 505 entries, no recurrence (via detect_recurrence.sh) |
| G_GLOBAL_SYSTEM | PASS | Node v20.20.0 / Rust 1.94.0 / Tauri CLI / pnpm 10.30.2 |
| G_NO_KEY_ENV_HONEST | HONEST FAIL | verify_chat_online.sh — no API keys in env, documented not masked |
| G_PROOF_PACK_COMPLETE | PASS | 8/8 deliverables present |
| G_ROLLBACK_READY | PASS | see ROLLBACK section |

---

## Gate Summary

```
PASS:         13
HONEST FAIL:   1 (G_NO_KEY_ENV_HONEST — expected in dev, not a regression)
NEW PASS:      2 (G_MEMORY_CONSUMPTION_PROVEN, G_RESPONSE_ASSEMBLY_PROVEN)
REGRESSIONS:   0
```

---

## Honest Fail Detail

**G_NO_KEY_ENV_HONEST** (`verify_chat_online.sh`):
```
[FAIL] No external provider configured (set at least one API key)
[FAIL] Online providers check failed
```
**Cause:** GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY all unset in this environment.
**Classification:** `NO_KEY_ENV_HONEST_FAIL` — expected in dev/CI without secrets.
**Action:** None. Masking this would violate I7 (no silent fallback).

---

## AutoHeal Capture

Per Rule 10, the two gap closures are captured in autoheal_rules.jsonl (see VERDICT.md).
`detect_recurrence.sh` confirms no regression: `G_AH_RECURRENCE_GUARD_PASS`.
