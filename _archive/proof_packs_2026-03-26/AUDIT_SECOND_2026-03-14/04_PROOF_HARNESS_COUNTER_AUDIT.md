# 04 — PROOF HARNESS COUNTER-AUDIT

**Date:** 2026-03-14

---

## HARNESS CLASSIFICATION

### PROOF_STRONG

| Test                   | What It Proves                                     | File                                     |
| ---------------------- | -------------------------------------------------- | ---------------------------------------- |
| G_NETWORK_ONE_DOOR     | reqwest only in allowed Rust files                 | scripts/gates/g_network_one_door.sh      |
| G_FRONTEND_NO_WEB      | No fetch/axios/XHR/WebSocket in UI production code | scripts/gates/g_frontend_no_web.sh       |
| G7 allowlist-lock      | No wildcard permissions, 216 commands locked       | scripts/gates/g7-tauri-allowlist-lock.sh |
| G8 provider-api-only   | No hardcoded provider endpoints in UI              | scripts/gates/g8-provider-api-only.sh    |
| verify_instructions    | Instruction layer consistency                      | scripts/verify_instructions.sh           |
| detect_recurrence      | AutoHeal entry format + recurrence guard           | scripts/autoheal/detect_recurrence.sh    |
| IPC contract structure | ok/content/error normalization exists in source    | src/utils/invoke.ts                      |

### PROOF_PARTIAL

| Test                           | What It Proves                             | Gap                                                     |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------- |
| G2 PASS                        | FORCE_LOCAL_PROVIDER not in env/env-files  | Rust WARN check skipped (rg absent)                     |
| G9 PASS                        | Gate script files exist and are executable | Doesn't run gates, verify proof packs, or check version |
| conversationEngine reason_code | OFFLINE paths have reason_code in source   | Runtime behavior unverified (no binary)                 |
| IPC in tauriClient.ts          | Canonical client exists                    | TauriBridge + utils/invoke also call secureInvoke       |

### PROOF_WEAK

| Test                     | Why Weak                                                                   | File                                                        |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| G5 CI wiring             | Checks CI workflow exists, not that gates pass in CI                       | g5-ci-wiring.sh                                             |
| "fallback chain present" | Source shows `pick_fallback_model()` — runtime behavior UNKNOWN            | src-tauri/src/providers/ollama.rs                           |
| STRUCT-1 log patterns    | Checks console.log strings exist in source — not that they fire at runtime | e2e/chat-provider-decision-certification-structural.spec.ts |

### FALSE_PASS

| Test                    | Why False                                                       | File                                                        |
| ----------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| G1 PASS                 | All rg checks silently skipped → passes on 0 evidence           | g1-no-offline-without-reason.sh                             |
| G3 PASS                 | All rg checks silently skipped → passes on 0 evidence           | g3-legacy-divergence.sh                                     |
| rc-network-surface PASS | rg absent → 0-byte log → passes on 0 evidence                   | rc-network-surface-gate.sh                                  |
| STRUCT-2/3/4 PASS       | Validates simulated/hardcoded meta, not real provider decisions | e2e/chat-provider-decision-certification-structural.spec.ts |
| Full E2E cert (default) | Suite skips entirely when `TITANE_E2E_FULL=0` (default)         | e2e/chat-provider-decision-certification.spec.ts            |

---

## answer_is_useful / answer_matches_question AUDIT

### Question: Do any tests verify AI response quality?

**Scan result:** `grep -rn "answer_is_useful\|answerIsUseful\|answer_matches" tests/ e2e/ src/`

Found locations:

- `src/services/unified/VectorStoreClient.ts:408` — `isUseful` field in vector store entry (memory storage)
- `src/services/unified/SQLiteVectorStore.ts:49,132,177,241,663` — DB column `is_useful` for stored memories

**Conclusion:** `is_useful` exists as a **data schema field for stored memories**, not as a test assertion for chat response quality.

**No test in `tests/`, `e2e/`, or `src/__tests__/` validates:**

- That a chat response is useful
- That a chat response matches the question
- That the AI answer is relevant or coherent

**Harness truth:** Chat quality proof = `assistant_text.length > 0` at best. All quality assurance is structural/mock, not product truth.

---

## HARNESS_TRUTH_FAIL Classification

| HARNESS_TRUTH_FAIL | Description                                              | Evidence                                                                   |
| ------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| HTF-01             | P3 structural spec validates simulated provider chain    | `generateSimulatedMeta()` hardcodes provider_used                          |
| HTF-02             | Full E2E cert skipped by default                         | `FULL_E2E_ENABLED = false` → `expect(FULL_E2E_ENABLED).toBe(false)` → PASS |
| HTF-03             | [MOCK_OK] path can bypass entire provider chain in tests | `window.__TITANE_E2E_CHAT_MOCK__ === true` → returns mock response         |
| HTF-04             | No test validates answer_is_useful = true                | Field exists in DB schema, never used in test assertions                   |
| HTF-05             | G1 certifies offline governance on 0 code scans          | rg failure → empty MATCHES → structural false safety                       |
| HTF-06             | G3 certifies legacy isolation on 0 code scans            | rg failure → all checks skipped → structural false safety                  |

---

## X3 RUN ANALYSIS

### What x3 means in TITANE_INFINITY context:

- `chat-provider-decision-certification.spec.ts` runs 3 runs of the real E2E test
- `chat-provider-decision-certification-structural.spec.ts` runs STRUCT-2, STRUCT-3, STRUCT-4 (3 structural tests)

### Are x3 runs real?

- **Full E2E x3**: BLOCKED by default (FULL_E2E_ENABLED=false). x3 only runs if `TITANE_E2E_FULL=1`
- **Structural x3**: Runs but uses hardcoded simulated scenarios (RUN 1=REMOTE, RUN 2=OFFLINE, RUN 3=LOCAL). **NOT real x3**. It's 3 different simulated scenarios validated against themselves.

**Verdict:** x3 as prescribed by doctrine is **NOT executed** in the default configuration. What exists is a simulation of x3, not a real x3.

---

## PROOF PACKS AUDIT

| Proof Pack                                | Complete?        | Misleading? | Notes                                                |
| ----------------------------------------- | ---------------- | ----------- | ---------------------------------------------------- |
| AUDIT_TOTAL_2026-03-14/                   | YES              | PARTIALLY   | Missing: business chain trace, ring-by-ring analysis |
| integration_closure_kernel_cert_20260309/ | UNKNOWN          | BLOCKED     | Referenced in memory but not revalidated here        |
| Latest proof pack (from first audit)      | BLOCKED_APPROVAL | —           | Status: blocked on build environment                 |

**Misleading aspects of AUDIT_TOTAL_2026-03-14:**

1. Claims G1/G2/G3 PASS as structural strengths — they are hollow
2. Over-prioritizes G4 and CSP vs under-prioritizes harness issues
3. States "IPC centralized via tauriClient.ts" without noting TauriBridge/utils/invoke secondary paths
4. Claims "fallback chain present" as a confirmed proof — it's source-level only
