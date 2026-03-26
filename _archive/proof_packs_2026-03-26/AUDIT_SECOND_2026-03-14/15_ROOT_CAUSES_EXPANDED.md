# 15 — ROOT CAUSES EXPANDED

**Date:** 2026-03-14

---

## ROOT CAUSES

---

### RC-E01

**ROOT_CAUSE_ID:** RC-E01  
**TYPE:** GATE  
**DESCRIPTION:** G1, G2, G3, rc-network-surface gates use `rg` without grep fallback. When rg is absent, all checks silently produce empty results → unconditional PASS.  
**PROOFS_FOR:** Re-run output shows `rg: command not found` × N, followed by ✅ PASS. Empty variable check (`[ -n "$MATCHES" ]`) always false. 0-byte exec.log from rc-network.  
**PROOFS_AGAINST:** None — mechanism is structural in script logic.  
**CURRENT_IMPACT:** G1, G3, rc-network provide no actual verification. Governance invariants (offline-without-reason, legacy-divergence, network surface) are unverified.  
**PATCH_CLASS:** GATE_FIX — Replace `rg` with `grep -rn` in G1, G3, rc-network-surface; add explicit "tool missing → FAIL" guard in G2.  
**STATUS:** PROVED

---

### RC-E02

**ROOT_CAUSE_ID:** RC-E02  
**TYPE:** HARNESS  
**DESCRIPTION:** The P3 certification approach used `generateSimulatedMeta()` (hardcoded values) instead of real runtime data. This was done intentionally ("Zéro infrastructure requise") but was not clearly labeled as a simulation-only exercise.  
**PROOFS_FOR:** `chat-provider-decision-certification-structural.spec.ts` lines 56-113: function hardcodes provider_used values based on runId. File header says "Avantage: Zéro infrastructure requise."  
**PROOFS_AGAINST:** The simulation does validate that invariants are logically consistent (OFFLINE requires reason_code, etc.) — this has structural value.  
**CURRENT_IMPACT:** G4 "FAIL" from first audit is due to missing evidence files — but the evidence files that would be generated would come from running structural tests that validate synthetic data. The certification chain is circular.  
**PATCH_CLASS:** HARNESS_FIX — Label structural spec as INVARIANT_VALIDATION, not CERTIFICATION. Require `FULL_E2E_ENABLED=1` run for actual certification evidence.  
**STATUS:** PROVED

---

### RC-E03

**ROOT_CAUSE_ID:** RC-E03  
**TYPE:** PRODUCT  
**DESCRIPTION:** `[MOCK_OK]` response path exists in production `conversationEngine.ts` and `services/api/chat.ts`. Activated via `window.__TITANE_E2E_CHAT_MOCK__ === true`. If E2E tests use this path, provider chain is bypassed.  
**PROOFS_FOR:** `grep -n "MOCK_OK" src/services/conversationEngine.ts` → line 325; `grep -n "MOCK_OK" src/services/api/chat.ts` → line 188.  
**PROOFS_AGAINST:** Guard requires explicit window flag (not set by default in runtime). The mock is intentional for E2E harness use.  
**CURRENT_IMPACT:** Any E2E test that sets `__TITANE_E2E_CHAT_MOCK__` while also asserting provider_used values is testing the mock, not the real chain.  
**PATCH_CLASS:** HARNESS_FIX — Add assertion in E2E cert tests: `expect(provider_used).not.toBe('e2e-mock')` to fail if mock path was used instead of real provider.  
**STATUS:** PROVED

---

### RC-E04

**ROOT_CAUSE_ID:** RC-E04  
**TYPE:** HARNESS  
**DESCRIPTION:** No test anywhere validates `answer_is_useful` or `answer_matches_question` for chat AI responses. `is_useful` exists as a DB column for stored memories, not chat response quality.  
**PROOFS_FOR:** `grep -rn "answer_is_useful\|answerIsUseful\|answer_matches" tests/ e2e/ src/` → only VectorStoreClient + SQLiteVectorStore.  
**PROOFS_AGAINST:** Product may be tested qualitatively by human reviewers. No automated evidence.  
**CURRENT_IMPACT:** AI response quality is entirely unverified by automation. Test coverage is structural (does the chain run?) but not product (is the answer good?).  
**PATCH_CLASS:** HARNESS_FIX — Add at minimum one E2E test that validates response content relevance (keyword match, non-mock provider, non-empty useful content).  
**STATUS:** PROVED

---

### RC-E05

**ROOT_CAUSE_ID:** RC-E05  
**TYPE:** GATE  
**DESCRIPTION:** ring-integrity-gate does not exist. Ring boundary enforcement (R1 types → R2 engines → R3 services → R4 UI) has no automated gate.  
**PROOFS_FOR:** `ls scripts/gates/` → no file matching `ring-integrity*`.  
**PROOFS_AGAINST:** TypeScript module boundaries may implicitly enforce some ring separation. ESLint import rules may partially cover this.  
**CURRENT_IMPACT:** Any inverse import (UI importing directly from types/ over services/) would not be caught by automation.  
**PATCH_CLASS:** GATE_FIX — Create `ring-integrity-gate.sh` that checks for inverse import patterns, OR document that TS/ESLint enforce ring boundaries and create a test for that.  
**STATUS:** PROVED

---

### RC-E06

**ROOT_CAUSE_ID:** RC-E06  
**TYPE:** ENVIRONMENT  
**DESCRIPTION:** G6 (build reproducibility) permanently blocked by absent Rust toolchain in audit/CI environments. No binary validation possible.  
**PROOFS_FOR:** `cargo`: not found; no dist/ directory.  
**PROOFS_AGAINST:** CI rust.yml workflow runs cargo build. Binary produced in CI, not in local audit env.  
**CURRENT_IMPACT:** All "confirmed" structural claims (fallback chain, IPC contract, provider routing) are source-level only. Runtime behavior is unproven in current environment.  
**PATCH_CLASS:** BLOCKED_NEEDS_ENV — Requires actual Tauri build environment. Not fixable in audit context.  
**STATUS:** PROVED (env constraint)

---

### RC-E07

**ROOT_CAUSE_ID:** RC-E07  
**TYPE:** GOVERNANCE  
**DESCRIPTION:** First audit over-prioritized local-only gate failures (G4, CSP) while under-prioritizing hollow gate patterns and harness quality. This misprioritization could lead teams to fix the wrong things first.  
**PROOFS_FOR:** G4 not in CI; CSP in CI with waiver; G1/G3/rc-network hollow but labeled PASS.  
**PROOFS_AGAINST:** G4 documentation value is real even if non-blocking. CSP risk is genuine even if waived.  
**CURRENT_IMPACT:** Development effort directed toward G4 evidence generation (simulated anyway) and CSP (already waived in CI) instead of hollow gate fixes and harness improvements.  
**PATCH_CLASS:** DOCTRINE_FIX — Update priority framework: P1 = hollow gates + harness truth; P2 = local-only documentation gaps.  
**STATUS:** PROVED
