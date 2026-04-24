# 03 — GATE COUNTER-AUDIT — RELIABILITY ANALYSIS

**Date:** 2026-03-14

---

## GATE RELIABILITY TABLE

| Gate                | Applicable?     | Correctly Executed? | Tool Missing?      | Invocation Correct? | Depth                 | False PASS Risk | Corrected Status                   |
| ------------------- | --------------- | ------------------- | ------------------ | ------------------- | --------------------- | --------------- | ---------------------------------- |
| G1                  | YES             | ❌ NO               | rg absent          | bash ✅             | HOLLOW                | **HIGH**        | FALSE_PASS                         |
| G2                  | YES             | ⚠️ PARTIAL          | rg for Check 4     | bash ✅             | PARTIAL               | MEDIUM          | WEAK_PROOF                         |
| G3                  | YES             | ❌ NO               | rg for all checks  | bash ✅             | HOLLOW                | **HIGH**        | FALSE_PASS                         |
| G4                  | YES             | ✅ Correctly FAIL   | —                  | bash ✅             | Evidence-based        | LOW             | CONFIRMED FAIL (but P2 local-only) |
| G5                  | YES             | ✅ YES              | —                  | bash ✅             | CI wiring check       | LOW             | CONFIRMED PASS                     |
| G6                  | YES             | ⚠️ BLOCKED          | cargo absent       | bash ✅             | N/A                   | N/A             | BLOCKED (env)                      |
| G7                  | YES             | ✅ YES              | —                  | bash ✅             | Uses grep+python      | LOW             | CONFIRMED PASS                     |
| G8                  | YES             | ✅ YES              | —                  | bash ✅             | Uses grep             | LOW             | CONFIRMED PASS                     |
| G9                  | YES             | ⚠️ INCOMPLETE       | —                  | bash ✅             | Partial — exits early | MEDIUM          | WEAK_PROOF                         |
| CSP-baseline        | YES (CI-waived) | ✅ YES              | —                  | node ✅             | Full check            | LOW             | CONFIRMED (P2 in CI)               |
| G_FRONTEND_NO_WEB   | YES             | ✅ YES              | —                  | bash ✅             | Uses grep             | LOW             | CONFIRMED PASS                     |
| G_NO_TEST_SKIPS     | YES             | ✅ YES              | —                  | bash ✅             | Uses grep             | LOW             | CONFIRMED PASS                     |
| G_NETWORK_ONE_DOOR  | YES             | ✅ YES              | —                  | bash ✅             | Uses grep             | LOW             | CONFIRMED PASS                     |
| rc-network-surface  | YES             | ❌ NO               | rg for both checks | bash ✅             | HOLLOW (0-byte log)   | **HIGH**        | FALSE_PASS                         |
| UI-INDEX-GATE       | YES             | ✅ YES (CI)         | —                  | node ✅             | CI-run                | LOW             | CONFIRMED PASS                     |
| FORBIDDEN-SCRIPTS   | YES             | ✅ YES (CI)         | —                  | node ✅             | CI-run                | LOW             | CONFIRMED PASS                     |
| verify_instructions | YES             | ✅ YES              | —                  | bash ✅             | 20 checks             | LOW             | CONFIRMED PASS=20                  |
| detect_recurrence   | YES             | ✅ YES              | —                  | bash ✅             | AutoHeal guard        | LOW             | CONFIRMED PASS                     |
| ring-integrity-gate | YES             | ❌ NO               | gate MISSING       | N/A                 | N/A                   | **HIGH**        | ABSENT                             |

---

## FALSE PASS DETAILED EVIDENCE

### FALSE_PASS: G1 (no-offline-without-reason)

**Mechanism:**

```bash
MATCHES=$(rg -n "hors ligne|offline" src/ --type ts ... || true)
if [ -n "$MATCHES" ]; then
  # check reason_code context
fi
# if rg absent: MATCHES = "" → never enters branch → falls through to PASS
echo "✅ GATE G1: PASS"
```

**Proof:** `bash scripts/gates/g1-no-offline-without-reason.sh` output:

- `rg: command not found` × 3
- `✅ No setError with offline found (expected if using modern pattern)` — on 0 checks
- `✅ GATE G1: PASS`

**Reality:** grep-based scan found these offline paths in production code:

- `src/components/system/BackendDownIndicator.tsx:124` — "hors ligne" without visible reason_code check
- `src/services/conversationEngine.ts:163` — mode OFFLINE logic
- `src/hooks/useConversationEngine.ts:361` — OFFLINE mode with reasonCode (this one IS correct)
- `src/services/devices/deviceHealthService.ts:276` — 'Mode hors ligne détecté' without reason_code

**Verdict:** Gate passed without executing. Some paths may be fine, some may not be — **unknown**.

---

### FALSE_PASS: G3 (legacy-divergence)

**Critical risk:** Check 2 is the HARD FAIL check (modern system importing tauriChat):

```bash
MODERN_IMPORT=$(rg "from.*tauriChat|import.*tauriChat" src/hooks/useConversationEngine.ts ... || true)
if [ -n "$MODERN_IMPORT" ]; then
  echo "❌ FAIL"
  FAIL=1
fi
```

**Proof:** With rg absent, MODERN_IMPORT = "" → never detects any import → always PASS.

**Manual verification:**

```bash
grep -rn "from.*tauriChat\|import.*tauriChat" src/hooks/useConversationEngine.ts src/services/conversationEngine.ts 2>/dev/null
# Returns: (no output) — No imports found
```

**Finding:** The actual check happens to be correct (no legacy import in modern code), BUT the gate reached the right answer for the wrong reason — by silently skipping all checks.

---

### FALSE_PASS: rc-network-surface

**Mechanism:** Both `rg` calls fail silently → exec.log is empty (0 bytes) → `-s` test fails → PASS

```bash
rg ... >"$RAW_LOG" || true   # rg not found → 0 bytes
rg ... >"$EXEC_LOG" || true  # rg not found → 0 bytes
if [[ -s "$EXEC_LOG" ]]; then  # -s = non-empty? No → PASS
  echo "❌ FAIL"
fi
echo "✅ RC network gate PASS: no executable network patterns found"
```

**Proof:** `ls -la /tmp/rc_network_exec.log` → 0 bytes

---

## GATE GAPS: WHAT'S MISSING

### ring-integrity-gate — ABSENT

- First audit referenced `ring-integrity-gate.sh` as UNKNOWN
- Second audit confirms: **script does not exist** in `scripts/gates/`
- Ring integrity (Ring 1/2/3/4 import boundaries) is completely unverified by automation
- Manual scan: no automated check for inverse imports exists

### G1/G2/G3 — Need rg OR grep conversion

- Fix: Replace `rg` with `grep -rn` + add `|| true` and proper fallback logic
- These gates protect critical governance invariants (offline-without-reason, force-local, legacy-divergence)
- Currently providing false confidence

### answer_is_useful gate — ABSENT

- No gate or test verifies that AI responses are useful/relevant
- Only verification: assistant_text non-empty (insufficient)
- NEEDS: a harness test that validates actual response relevance

---

## G9 PARTIAL EXECUTION ANALYSIS

G9 script (`scripts/gates/g9-release-seal.sh`, 248 lines) exits after ~5 lines of output in this environment. The exit code is 0 but nearly all checks are skipped. Investigation shows `set -euo pipefail` may cause silent exit on an intermediate command. G9 Check 1 (gate files exist) runs, then stops. Checks 2-8 (run all gates, verify proof packs, check version sync, etc.) do not execute.

**Verdict:** G9 PASS is based on checking that gate scripts exist (not that they pass). WEAK_PROOF.
