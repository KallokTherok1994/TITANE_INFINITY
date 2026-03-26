# Rollback Plan — E2E Timeout Hardening (AH-E2E-TIMEOUT-010)

**Date**: 2026-03-16  
**Cycle**: AH-E2E-TIMEOUT-010  
**Commit**: b7b2552bc  
**AutoHeal ID**: AH-E2E-TIMEOUT-010  

---

## Quick Rollback

If urgent regression detected or E2E specs fail unexpectedly after this commit:

```bash
# Step 1: Revert all files to pre-commit state
git restore -- e2e/desktop/chat-ar20.wdio.test.js \
  e2e/desktop/diagnostic-tauri-api.wdio.test.js \
  e2e/desktop/online-chat-proof.wdio.test.js \
  e2e/desktop/ui-chat-360-autofix.wdio.test.cjs \
  e2e/desktop/ui-driver.wdio.js \
  scripts/e2e/run-desktop-suite.js

# Step 2: Revert AutoHeal entry
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Step 3: Verify clean state
git status --short  # Should show no modified E2E files

# Step 4: Reset MAIN to previous commit (ff6340b49)
git reset --hard ff6340b49

# Step 5: Verify rollback
git log --oneline -3
# Should show ff6340b49 as HEAD
```

---

## Full Revert Commands (Automated)

```bash
#!/bin/bash
set -e

cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Rollback all 7 modified files
git restore -- \
  e2e/desktop/chat-ar20.wdio.test.js \
  e2e/desktop/diagnostic-tauri-api.wdio.test.js \
  e2e/desktop/online-chat-proof.wdio.test.js \
  e2e/desktop/ui-chat-360-autofix.wdio.test.cjs \
  e2e/desktop/ui-driver.wdio.js \
  scripts/e2e/run-desktop-suite.js \
  scripts/autoheal/autoheal_rules.jsonl

# Hard reset to parent (ff6340b49)
git reset --hard ff6340b49

# Confirm
git log --oneline -2
echo "Rollback complete. HEAD is at $(git rev-parse --short HEAD)"
```

---

## Risk Assessment

### Rollback Safety: **HIGH**

- ✅ No database schema changes
- ✅ No API contract changes
- ✅ No configuration format changes
- ✅ No autoheal dependency on other systems
- ✅ No external state mutation

### Rollback Time: **<2 minutes**

- `git reset --hard`: ~1s
- `git restore`: ~100ms
- Verification: ~30s

### Rollback Impact

| Component | Impact | Notes |
|---|---|---|
| E2E Specs | Reverts to static 30s/20s timeouts | May re-experience WebKit session timeout after 34min |
| AutoHeal Registry | AH-E2E-TIMEOUT-010 removed from JSONL | entries count returns to 318 |
| MAIN Branch | Reset to commit ff6340b49 | Origin/MAIN unchanged (c2ecb83ba) |
| Product Code | **ZERO** | No src-tauri/* or src/* changes |

---

## Rollback Triggers

**Automatic rollback recommended if**:
1. E2E specs fail with "unrecognized env var" (typo in parsePositiveInt usage)
2. `detect_recurrence.sh` reports duplicate AH-* IDs
3. WDIO workers crash with FORCE_LOCAL_PROVIDER env binding error
4. chat-ready fallback causes spurious "UI not ready" assertions

**Manual investigation needed if**:
1. Individual spec timeouts still insufficient (increase AR20_IPC_TIMEOUT_MS / DIAG_IPC_SCRIPT_TIMEOUT_MS)
2. Session recovery not triggering (debug recoverProofSession / recoverDiagnosticSession logic)
3. isThinking filter too aggressive (refine normalized text check in ui-chat-360)

---

## Post-Rollback Recovery

If rolled back, document:
1. **What triggered the rollback** (exact failure mode)
2. **Which spec failed** (chat-ar20, diagnostic, online-proof, ui-chat-360, ui-driver, run-suite)
3. **New PR with incremental fix** (address only the failing spec, not all 6)

**Example**:
```
If chat-ar20 fails on AR20_IPC_TIMEOUT_MS undefined:
  → git diff HEAD^ HEAD e2e/desktop/chat-ar20.wdio.test.js
  → Isolate the parsePositiveInt logic
  → Create new PR with AR20-specific timeout fix only
```

---

## Validation After Rollback

```bash
# 1. Verify git state
git log --oneline -1  # Should be ff6340b49
git status --short     # Should be clean

# 2. Re-run gates (optional, pre-rollback state)
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh

# 3. Expected: entries=318, PASS (20/20)
```

---

## Prior Commit (No Rollback Needed)

**Previous stable state**: `ff6340b49` (fix(e2e): correct infinite loop in ai-verification sendPrompt detection)
- E2E AI-VERIFICATION was PASS (5/5)
- AutoHeal entries: 318
- No WebKit session hardening (pre-existing issue)

**Recommendation**: If rollback triggers, stay at `ff6340b49` and plan separate, isolated PR for each E2E spec hardening.

---

## Escalation Path

1. **Gate failure** → Review `09_GATES_REPORT.md`; if FAIL detected, halt merge
2. **Spec failure** → Check specific env var override; adjust timeouts in `.sh` wrapper
3. **Session crash** → Consider `wry 0.54.2` session time-boxing (separate issue, out of scope)
4. **Hotfix needed** → Create new PR, do NOT re-apply full AH-E2E-TIMEOUT-010 patch

---

**Proof-pack Status**: Rollback plan documented and accessible.
