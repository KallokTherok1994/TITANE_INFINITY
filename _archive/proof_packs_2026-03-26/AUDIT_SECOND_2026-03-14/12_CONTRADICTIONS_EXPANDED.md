# 12 — CONTRADICTIONS EXPANDED

**Date:** 2026-03-14

---

## CONTRADICTIONS_EXPANDED

### CONTRADICTION-E01 — G1 PASS vs Governance Reality

|              |                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **Source A** | `proof_packs/AUDIT_TOTAL_2026-03-14/20_GATES_REPORT.md`: "G1 PASS (rg missing but grep fallback OK)"    |
| **Source B** | `scripts/gates/g1-no-offline-without-reason.sh`: No grep fallback exists. All checks use `rg \|\| true` |
| **Type**     | Gate claim vs script implementation                                                                     |
| **Gravity**  | HIGH — false safety on offline governance                                                               |
| **Proof**    | `bash g1-no-offline-without-reason.sh` → `rg: command not found` × 3 → `✅ GATE G1: PASS` on 0 checks   |
| **Canon**    | Script wins. G1 is a FALSE_PASS.                                                                        |
| **Fix**      | Replace `rg` with `grep -rn` in G1, G2, G3, rc-network-surface scripts                                  |

---

### CONTRADICTION-E02 — P3 Certification "structural" vs Doctrine meaning of certification

|              |                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source A** | `e2e/chat-provider-decision-certification-structural.spec.ts`: "Zéro infrastructure requise. Test reproductible x3." — validates `generateSimulatedMeta()` |
| **Source B** | Kernel doctrine: certification requires real chain proof (provider_requested → provider_used → network_used → answer)                                      |
| **Type**     | Test reality vs certification doctrine                                                                                                                     |
| **Gravity**  | HIGH — the P3 certification evidence would be based on synthetic data                                                                                      |
| **Proof**    | `generateSimulatedMeta(runId)` hardcodes `meta.provider_used = 'gemini'` for run 1 etc.                                                                    |
| **Canon**    | Doctrine wins. Structural spec is a validation harness exercise, not real certification.                                                                   |
| **Fix**      | Mark structural spec as `HARNESS_EXERCISE`, require `FULL_E2E_ENABLED=1` for real certification                                                            |

---

### CONTRADICTION-E03 — [MOCK_OK] in production code vs "no mock in production" principle

|              |                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source A** | `src/services/conversationEngine.ts:325`: `assistant_message: '[MOCK_OK] ${userMessage}'` in non-test file                                        |
| **Source B** | Product truth principle: runtime response should come from real provider chain                                                                    |
| **Type**     | Product truth vs runtime contamination                                                                                                            |
| **Gravity**  | HIGH — any test setting `window.__TITANE_E2E_CHAT_MOCK__ = true` bypasses all provider logic                                                      |
| **Proof**    | `grep -n "MOCK_OK" src/services/conversationEngine.ts` → line 325; guarded by `isE2EChatMockEnabled()` → `window[E2E_CHAT_MOCK_FLAG] === true`    |
| **Canon**    | The guard condition is reasonable (window flag required). Risk is: E2E tests using this flag claim to test provider chain but actually test mock. |
| **Fix**      | Ensure E2E tests that use `__TITANE_E2E_CHAT_MOCK__` are NOT used to certify provider decisions                                                   |

---

### CONTRADICTION-E04 — tauri.conf.json port 1420 vs tauri.base.json port 5173

|              |                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Source A** | `src-tauri/tauri.conf.json`: `"devUrl": "http://localhost:1420"`, `--port 1420`                               |
| **Source B** | `src-tauri/tauri.base.json`: `"devUrl": "http://localhost:5173"`, `--port 5173`                               |
| **Type**     | Dev config divergence                                                                                         |
| **Gravity**  | MEDIUM — if base.json is used (e.g., for CI or template regeneration), dev server won't bind to expected port |
| **Proof**    | `grep devUrl src-tauri/tauri.conf.json` → 1420; `grep devUrl src-tauri/tauri.base.json` → 5173                |
| **Canon**    | tauri.conf.json wins (active config). base.json should be updated to match.                                   |
| **Fix**      | Align tauri.base.json port to 1420 to match active config                                                     |

---

### CONTRADICTION-E05 — ring-integrity-gate "UNKNOWN" vs "ABSENT"

|              |                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Source A** | `proof_packs/AUDIT_TOTAL_2026-03-14/20_GATES_REPORT.md`: "ring-integrity-gate: Script not found at expected path → UNKNOWN" |
| **Source B** | `ls scripts/gates/` — confirmed: no file matching `ring-integrity*` exists                                                  |
| **Type**     | Classification error: UNKNOWN vs ABSENT                                                                                     |
| **Gravity**  | LOW for product (not blocking), MEDIUM for governance (ring integrity unverified)                                           |
| **Proof**    | `ls scripts/gates/ \| grep ring` → only `g5-ci-wiring.sh` (g5 has some wiring checks)                                       |
| **Canon**    | Gate is ABSENT, not UNKNOWN.                                                                                                |
| **Fix**      | Create ring-integrity-gate.sh OR document that ring integrity is enforced by TypeScript module boundaries                   |

---

### CONTRADICTION-E06 — "autoheal entries 158-162 have empty fields" vs reality

|              |                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Source A** | `proof_packs/AUDIT_TOTAL_2026-03-14/00_EXEC_SUMMARY.md`: "Autoheal Entries AH-0158→0162: Empty description/status fields" |
| **Source B** | Direct parse: lines 156-162 have full symptom/fix content (AH-2026-03-11-0702 through 0708, all with meaningful content)  |
| **Type**     | Factual error in first audit                                                                                              |
| **Gravity**  | LOW — doesn't affect product safety                                                                                       |
| **Proof**    | `python3 -c "..."` → each line has 60+ chars of symptom and fix content                                                   |
| **Canon**    | First audit claim is INCORRECT. Entries are populated.                                                                    |
| **Fix**      | Retract FINDING-06 from first audit. No action needed.                                                                    |

---

### CONTRADICTION-E07 — First audit "G9 PASS" vs G9 not completing execution

|              |                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Source A** | `proof_packs/AUDIT_TOTAL_2026-03-14/20_GATES_REPORT.md`: "G9 — release-seal — ✅ PASS"                             |
| **Source B** | `bash scripts/gates/g9-release-seal.sh` only outputs 1 line then exits. 248-line script, ~240 lines never execute. |
| **Type**     | Gate execution completeness                                                                                        |
| **Gravity**  | MEDIUM — G9 is supposed to verify proof pack completeness, version sync, etc.                                      |
| **Proof**    | `timeout 30 bash scripts/gates/g9-release-seal.sh` → only shows "Verifying gates G1-G8 exist..."                   |
| **Canon**    | G9 exit code 0 but via partial execution. WEAK_PROOF not PASS.                                                     |
| **Fix**      | Investigate why G9 exits early. Likely `set -euo pipefail` + unbound variable or subshell failure.                 |

---

### CONTRADICTION-E08 — "CSP HIGH priority" vs CI CSP waiver

|              |                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Source A** | `proof_packs/AUDIT_TOTAL_2026-03-14/00_EXEC_SUMMARY.md`: "CSP FAIL: unsafe-inline in script-src [PRIORITY: HIGH]" |
| **Source B** | `.github/workflows/ci-unified.yml:127`: `CSP_ALLOW_UNSAFE: '1'` — CI explicitly waives CSP check                  |
| **Type**     | Priority misprioritization                                                                                        |
| **Gravity**  | LOW — documented waiver exists, CSP risk is real but P2 not P1                                                    |
| **Proof**    | `grep -n "CSP_ALLOW_UNSAFE" .github/workflows/ci-unified.yml` → line 127                                          |
| **Canon**    | CI waiver wins. CSP is P2 non-blocking. First audit over-prioritized.                                             |
| **Fix**      | No code fix needed. Document waiver in VERDICT.                                                                   |
