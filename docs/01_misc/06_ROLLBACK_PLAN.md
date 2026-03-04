# Phase B Rollback Plan

## Context
If guard re-run (Phase D) fails, this rollback procedure restores the pre-patch state.

## Rollback Procedure

### Single Command Restore
```bash
git restore src/services/ai/providers/ollama.ts
```

### Verification
```bash
# Verify ollama.ts is restored
git status src/services/ai/providers/ollama.ts
# Expected: working tree clean (no changes)

# Re-run guard to confirm we're back to original FAIL state
pnpm run guard:ollama-proxy
# Expected: EXIT_CODE=1 (same as P10.3 initial failure)
```

### Proof Document
- Pre-restore git status: `git status --porcelain`
- Post-restore diff: `git diff src/services/ai/providers/ollama.ts`
- Guard output: `pnpm run guard:ollama-proxy`

## Expected Behavior After Rollback
- ✅ Filed restored to original state (with direct localhost endpoint)
- ✅ Guard fails at same line (39) with same pattern
- ✅ Can attempt alternative patch if strategy needs revision

## Trigger Conditions
- Guard re-run (Phase D) still EXIT_CODE=1
- Syntax validation fails
- Unexpected test failures emerge

