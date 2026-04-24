# 17 — CORRECTED ACTION PLAN

**Date:** 2026-03-14

---

## PLAN A — QUICK WINS ≤30 MIN

### QW-01: Fix G1, G3, rc-network-surface: Replace rg with grep

**Priority:** P1  
**Risk:** LOW — grep is installed, behavior equivalent  
**Proof expected:** Re-run gates, they now actually check code  
**Files:** `scripts/gates/g1-no-offline-without-reason.sh`, `scripts/gates/g3-legacy-divergence.sh`, `scripts/gates/rc-network-surface-gate.sh`  
**Change:** Replace `rg -n "pattern" dir/ --type ts` with `grep -rn "pattern" dir/ --include="*.ts"`  
**Rollback:** `git restore -- scripts/gates/g1-no-offline-without-reason.sh scripts/gates/g3-legacy-divergence.sh scripts/gates/rc-network-surface-gate.sh`

### QW-02: Fix port mismatch tauri.base.json

**Priority:** P2  
**Risk:** LOW — base.json is a template, not active config  
**Proof expected:** `grep devUrl src-tauri/tauri.base.json` → 1420  
**Files:** `src-tauri/tauri.base.json`  
**Change:** Update `"devUrl": "http://localhost:5173"` → `"http://localhost:1420"` and beforeDevCommand port  
**Rollback:** `git restore -- src-tauri/tauri.base.json`

### QW-03: Add anti-mock assertion in structural cert spec

**Priority:** P1  
**Risk:** LOW — adds safety check  
**Proof expected:** Structural spec fails if provider_used='e2e-mock'  
**Files:** `e2e/chat-provider-decision-certification-structural.spec.ts`  
**Change:** After meta generation, add: `expect(meta.provider_used).not.toBe('e2e-mock')` with comment  
**Rollback:** `git restore -- e2e/chat-provider-decision-certification-structural.spec.ts`

### QW-04: Mark G4 as local-only + P2 in first audit verdict update

**Priority:** P2  
**Risk:** NONE — documentation only  
**Files:** `proof_packs/AUDIT_TOTAL_2026-03-14/00_EXEC_SUMMARY.md`  
**Change:** Reclassify G4 from HIGH to P2 LOCAL-ONLY in CRITICAL FINDINGS

---

## PLAN B — STRUCTURAL FIXES

### SF-01: Create ring-integrity-gate.sh

**Priority:** P2  
**Description:** Create a gate that checks for inverse imports (R4 UI importing from R1 types directly, bypassing R2/R3 boundaries)  
**Approach:** `grep -rn "from.*@/types\|from.*../types" src/components/ src/pages/ --include="*.tsx"` and flag unexpected patterns  
**Files:** `scripts/gates/ring-integrity-gate.sh` (new)  
**Evidence expected:** gate exits 0 when no violations, 1 when violations found

### SF-02: Fix G9 early exit

**Priority:** P2  
**Description:** Investigate why `set -euo pipefail` causes G9 to exit after first section. Add explicit error capture.  
**Files:** `scripts/gates/g9-release-seal.sh`  
**Investigation:** Find unbound variable or subshell failure causing premature exit

### SF-03: Add answer_relevance harness test

**Priority:** P1  
**Description:** Create one test that sends a specific question and validates that the response contains expected keywords (not just non-empty)  
**Files:** `tests/integration/chat-quality.test.ts` (new) or add to existing chat workflow tests  
**Proof expected:** Test FAILs if response is `[MOCK_OK]` or empty or unrelated to question

### SF-04: Label structural cert clearly as INVARIANT_VALIDATION

**Priority:** P1 (documentation + code comment)  
**Description:** Update header of `chat-provider-decision-certification-structural.spec.ts` to explicitly state this is invariant validation with simulated data, NOT real certification evidence  
**Files:** `e2e/chat-provider-decision-certification-structural.spec.ts`

---

## PLAN C — BLOCKED PROOFS NEEDED

### BP-01: Real x3 provider decision certification

**Status:** BLOCKED_NEEDS_ENV  
**Required:** Tauri binary + network access + actual Ollama/Gemini credentials  
**Command:** `TITANE_E2E_FULL=1 OFFLINE_SIM=0 npx playwright test e2e/chat-provider-decision-certification.spec.ts`  
**Expected artifact:** `proof_packs/P3_CERT_REAL_YYYYMMDD/` with actual CONV_SEND/CONV_RECV logs

### BP-02: Build reproducibility (G6)

**Status:** BLOCKED_NEEDS_ENV  
**Required:** Rust toolchain + Tauri system deps  
**Command:** `apt-get install libwebkit2gtk-4.1-dev ... && cargo build --release`  
**Expected artifact:** Binary hash, AppImage, .deb

### BP-03: Runtime truth observability

**Status:** BLOCKED_NEEDS_ENV  
**Required:** Running Tauri binary  
**Command:** `OFFLINE_SIM=0 TAURI_BINARY_PATH=... npx wdio run wdio.desktop.conf.cjs --spec e2e/desktop/v26_real_online_chat_truth.wdio.test.js`  
**Expected artifact:** Chat DOM state, provider tags, runtime panel attributes

### BP-04: answer_is_useful at runtime

**Status:** NEEDS_RUNTIME_PROOF  
**Required:** Running app + real AI provider  
**Test:** Send "What is the capital of France?" → validate response contains "Paris"  
**Expected artifact:** Playwright test result with response content assertion
