# 00 — SECOND AUDIT EXECUTIVE SUMMARY — TITANE_INFINITY

**Date:** 2026-03-14  
**Branch:** copilot/audit-total-repo-titane  
**HEAD:** ccc75353a  
**First Audit HEAD:** e8b2c27b (reviewed as hypothesis)  
**Verdict:** FAIL (deeper than first audit revealed)

---

## A) EXEC_MODE: BACKGROUND (scans, gate reruns, deep analysis executed)

## B) SCOPE_RING: R1+R2+R3+R4 — src/, src-tauri/, scripts/, e2e/, tests/, .github/

## C) RISK: P1 (multiple FALSE_PASS gates + simulated certification)

## D) PLAN

1. Revalidate all first audit claims — DONE
2. Re-run all gates and analyze script contents — DONE
3. Deep scan for answer_is_useful, provider_used, mock leakage — DONE
4. Audit structural certification spec (P3) — DONE
5. Analyze FALSE_PASS gate patterns (rg-dependent) — DONE
6. Produce expanded matrices — DONE
7. AutoHeal + validators — DONE

## E) PROOFS OBTAINED

- G1/G2/G3 re-run: all use `rg`, all fail silently, all return PASS → **FALSE_PASS confirmed**
- rc-network-surface: uses `rg`, produces empty file → **FALSE_PASS confirmed**
- Structural cert spec: calls `generateSimulatedMeta()` with hardcoded values → **NOT real E2E**
- Full E2E cert: disabled by default (`FULL_E2E_ENABLED = false`) → **skipped unless TITANE_E2E_FULL=1**
- G9 exits after 1 line of output → **incomplete execution**
- `[MOCK_OK]` in production `conversationEngine.ts` and `services/api/chat.ts` → **mock in prod**
- Port mismatch: `tauri.conf.json` uses 1420, `tauri.base.json` uses 5173 → **dev config drift**
- G1-G8 NOT in CI unified workflow → **local-only gates, CI does NOT run them**
- CSP: CI runs with `CSP_ALLOW_UNSAFE=1` → first audit over-prioritized this as HIGH
- `ring-integrity-gate` not found at expected path → **gate missing**

## F) ROLLBACK

```bash
git restore -- proof_packs/AUDIT_SECOND_2026-03-14/
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

---

## TL;DR — SECOND AUDIT KEY FINDINGS

The first audit correctly identified G4 FAIL and CSP FAIL, but **missed four structural problems more serious than those**:

### 🔴 CRITICAL (over-classified by first audit)

**FALSE_PASS-01 — G1, G2, G3, rc-network-surface are hollow gates (rg-dependent)**

- All four gates depend entirely on `rg` (ripgrep). When `rg` is absent, all checks return empty strings → all branch to PASS unconditionally.
- G1 PASS means nothing: it didn't check a single line of code.
- rc-network-surface PASS means nothing: it produced a 0-byte exec.log.
- **First audit labeled these PASS with note "rg missing but grep fallback OK" — this is FALSE.**
- There is NO grep fallback in these scripts. PASS = hollow.

**FALSE_PASS-02 — P3 Certification is simulated, not real**

- `chat-provider-decision-certification-structural.spec.ts` calls `generateSimulatedMeta()` which **hardcodes** provider values (run 1 = 'gemini', run 2 = 'offline', run 3 = 'ollama').
- This test validates a simulation against itself. It proves nothing about the real provider chain.
- `chat-provider-decision-certification.spec.ts` (real E2E) is disabled by default: `FULL_E2E_ENABLED = false` → skips entire test suite unless `TITANE_E2E_FULL=1`.
- First audit classified G4 as the key blocker. But G4's evidence would come from running the structural test that is itself fake.

**FALSE_PASS-03 — [MOCK_OK] path in production code**

- `src/services/conversationEngine.ts:325` and `src/services/api/chat.ts:188` both contain `[MOCK_OK]` response paths activated via `window.__TITANE_E2E_CHAT_MOCK__ === true`.
- If an E2E test sets this window flag, the entire provider chain (IPC, Rust backend, Ollama) is bypassed.
- Any E2E test that validates assistant_text non-empty while mock is active is a FALSE_PASS.

### 🟠 MISPRIORITIZED (by first audit)

**MISPRIORITY-01 — CSP FAIL over-prioritized as HIGH**

- CI runs CSP gate with `CSP_ALLOW_UNSAFE: '1'` → CSP check passes in CI.
- Verified memory: "CSP gate local FAIL is P2 non-blocking." First audit treated it as HIGH = overclaim.

**MISPRIORITY-02 — G1-G8 gate failures not recognized as local-only**

- G1-G8 are NOT in ci-unified.yml. They run in `run-all.sh` (local only).
- Memory confirms: "G4 gate, proof-requirements-v2.sh are local-only scripts NOT in any CI workflow."
- First audit did not note this clearly, treating G4 local FAIL as blocking production concern.

### 🟡 NEW FINDINGS (not in first audit)

**NEW-01 — Port mismatch: tauri.conf.json (1420) vs tauri.base.json (5173)**

- Production config uses 1420; base template uses 5173. Dev divergence risk if base.json is used.

**NEW-02 — ring-integrity-gate missing**

- First audit marked it UNKNOWN. Confirmed: no `ring-integrity-gate.sh` at `scripts/gates/`. Gate is absent.

**NEW-03 — G9 incomplete execution**

- G9 exits after listing gate files. Doesn't complete proof pack checks. Status: likely PASS by partial check.

**NEW-04 — answer_is_useful / answer_matches_question: not verified anywhere in tests**

- Found in `VectorStoreClient.ts` as a data field, but NO test asserts `answer_is_useful = true` for chat responses.
- Tests validate `assistant_text non-empty` or mock responses. Product truth depth: LOW.

---

## REPRIORITIZATION SUMMARY

| Item                        | First Audit Priority | Corrected Priority | Reason                                       |
| --------------------------- | -------------------- | ------------------ | -------------------------------------------- |
| G4 FAIL (missing evidence)  | HIGH                 | P2 LOCAL-ONLY      | Gate not in CI; evidence is simulated anyway |
| CSP FAIL                    | HIGH                 | P2 CI-WAIVED       | CI runs with CSP_ALLOW_UNSAFE=1              |
| G1/G2/G3 hollow (rg)        | NOT RAISED           | P1 FALSE_PASS      | Core governance gates are hollow             |
| P3 cert is simulated        | NOT RAISED           | P1 FALSE_PASS      | Provider chain certification is fake         |
| [MOCK_OK] in prod           | NOT RAISED           | P1 PRODUCT_TRUTH   | Mock path bypasses entire chain              |
| guardian.agent.md           | MEDIUM               | P2 FIXED           | Fixed in first audit                         |
| Port mismatch               | NOT RAISED           | P2 DEV_DRIFT       | dev config divergence                        |
| ring-integrity-gate missing | UNKNOWN              | P2 GATE_MISSING    | Gate referenced but absent                   |
| answer_is_useful unverified | NOT RAISED           | P1 HARNESS         | No test validates answer quality             |
