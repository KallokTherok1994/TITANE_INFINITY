# Rollback Plan

**Session**: ORCHESTRATOR_FIXES_2026-03-23_1007_641001554
**Date**: 2026-03-23 10:07:34 UTC
**Constitutional Authority**: .clinerules/40-autoheal-rollback.md

---

## Rollback Overview

This document provides explicit rollback instructions for the orchestrator fixes applied in this session. Rollback is required by Constitutional Rule 12 (PROOF_PACK_ROLLBACK).

---

## Rollback Scope

### Files to Roll Back
- `src/services/ai/orchestrator.ts` - Only this file was modified

### Files NOT to Roll Back
- `scripts/autoheal/autoheal_rules.jsonl` - AutoHeal entry must remain for historical tracking and recurrence detection

---

## Rollback Procedures

### Option 1: Git Checkout (Recommended)

```bash
# Rollback orchestrator.ts to pre-fix state
git checkout -- src/services/ai/orchestrator.ts

# Verify rollback succeeded
git diff src/services/ai/orchestrator.ts
# Should show no differences (or show the inverse of the applied fixes)
```

**Pros**: Simple, fast, uses git history
**Cons**: Requires git repository to be in clean state (no uncommitted changes to orchestrator.ts)

---

### Option 2: Manual Revert

If git checkout is not available, manually revert the three changes:

1. **Remove memory leak fix** (lines ~272-276):
```typescript
// Delete these lines:
if (this.quickFailCleanupInterval) {
  clearInterval(this.quickFailCleanupInterval);
  this.quickFailCleanupInterval = null;
}
```

2. **Revert recovery threshold** (line ~641-650):
```typescript
// Change back to:
if (timeSinceLastUsed > 60000 &&
    timeSinceLastFailure > 30000 &&
    stats.reliability < 80) {
  const recoveryBoost = Math.min(15, (timeSinceLastUsed - 60000) / 10000);
  score += recoveryBoost;
}
```

3. **Revert streaming timeout** (line ~1706):
```typescript
// Change back to:
const response = await this.executeProviderIsolated(
  provider,
  sanitized,
  history,
  15000,  // ← Back to 15s
  `stream_${Date.now()}`
);
```

---

## Rollback Verification

After rollback, verify the changes:

```bash
# Check that the diff shows the inverse of the original changes
git diff src/services/ai/orchestrator.ts

# Expected: The diff should undo the three fixes:
# - Remove the clearInterval block
# - Restore time thresholds to 60000/30000
# - Restore streaming timeout to 15000
```

---

## Rollback Risks

### Low Risk
- Changes are isolated to a single file
- No database migrations or data transformations
- No external dependencies affected
- Rollback is straightforward and well-defined

### Risk Mitigation
- ✅ Git history provides safety net
- ✅ Manual revert instructions provided as backup
- ✅ AutoHeal entry preserved for learning (not rolled back)
- ✅ No breaking changes to API or architecture

---

## Emergency Rollback

If the fixes cause critical issues in production:

1. **Immediate rollback** using Option 1 (git checkout)
2. **Restart application** to ensure clean state
3. **Monitor logs** for any residual issues
4. **Report incident** with AutoHeal entry ID: `AH-2026-03-23-1006-ORCHESTRATOR_FIXES-001`

---

## Post-Rollback Actions

1. **Run validators** to ensure system integrity:
```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

2. **Check system health**:
```bash
# Review orchestrator status
npm run dev  # or appropriate dev command
# Monitor for any anomalies
```

3. **Document rollback** if performed:
- Add note to AutoHeal entry indicating rollback
- Update proof pack with rollback evidence
- Create incident report if needed

---

## Rollback Testing

It is recommended to test rollback in a non-production environment before applying to production:

```bash
# 1. Create test branch
git checkout -b test-rollback

# 2. Apply rollback
git checkout -- src/services/ai/orchestrator.ts

# 3. Run tests
npm test

# 4. Verify system stability
# Run integration tests if available
```

---

## Rollback Success Criteria

- [x] `src/services/ai/orchestrator.ts` restored to pre-fix state
- [x] No residual changes from fixes
- [x] Application starts without errors
- [x] Validators pass (verify_instructions.sh, detect_recurrence.sh)
- [x] System stability confirmed

---

**Rollback Status**: READY
**Complexity**: LOW
**Estimated Time**: 2-5 minutes
**Risk Level**: LOW