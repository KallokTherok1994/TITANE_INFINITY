# Selected Chantier: TypeScript Strict Mode Expansion

## Decision Rationale
**Score**: 50 (tied for highest)
**Selection Reason**: 
- Highest impact on codebase safety (prevent future crashes)
- Zero runtime risk (compile-time only)
- Foundation for all downstream rings
- Measurable proof (warning count)
- Highest leverage: fixes apply to entire codebase

## Chantier Profile

### Ring Impact
- **Primary Ring**: Ring 0 (Types) → cascades to all downstream (Ring 1-3)
- **Scope**: TypeScript compilation, type definitions, JSDoc
- **Surface Exposed**: tsconfig strict flags, ~50-100 warnings across src/

### Goal
Enable TypeScript strict mode compilation with zero new runtime errors, catching null-pointer and type safety issues early.

### Before (Baseline)
```
tsconfig.json strict settings: {
  "noImplicitAny": false,
  "strictNullChecks": false,
  "strictFunctionTypes": false,
  "strictBindCallApply": false,
  "strictPropertyInitialization": false,
  "noImplicitThis": false
}
Detected warnings: ~150+ (estimated, needs audit)
Codebase type safety: PARTIAL
```

### After (Target v27.1.0)
```
tsconfig.json strict settings: {
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true
}
Detected warnings: 0
Codebase type safety: STRICT
Compilation gate: PASS (no errors during build)
```

### Implementation Plan

**Phase 5A: Pre-Flight Audit** (5 min)
1. Run current build, count errors/warnings
2. Run TypeScript with --strict flag, capture warning output
3. Categorize by file (src/types/, src/engines/, src/services/, src/modules/)

**Phase 5B: Enable Strict Mode** (15 min)
1. Update tsconfig.json: enable all strict flags
2. Run pnpm run build -- --strict
3. Capture warning list to WARNINGS_PRE.txt

**Phase 5C: Fix Warnings** (30 min — iterative)
1. For each warning category:
   - noImplicitAny: Add explicit types to variables, function parameters
   - strictNullChecks: Add ! or ? assertions where needed
   - strictFunctionTypes: Fix callback signatures
   - strictPropertyInitialization: Initialize class properties
2. Commit each category together
3. Build after each commit to verify no regressions

**Phase 5D: Validation** (5 min)
1. Run pnpm run build -- --strict with zero errors
2. Run pnpm run test (verify tests still pass)
3. Run pnpm run lint (verify no linting issues)

### Rollback Plan
```bash
# If strict mode breaks anything:
git revert HEAD~5..HEAD  # Revert all strict mode commits
git checkout HEAD -- tsconfig.json  # Restore original tsconfig
pnpm install --frozen-lockfile  # Reset node_modules if needed
```

### Proof of Improvement

**A/B Testing**:
- **Before (Baseline A)**: Current tsconfig, build with pnpm run build
  - Compilation time: T_before (measure)
  - Error count: 0 (already passing)
  - Type safety: PARTIAL
  
- **After (Candidate B)**: Strict tsconfig, build with pnpm run build -- --strict
  - Compilation time: T_after (measure, expect ~0% diff for compile time)
  - Type error count: 0 (STRICT mode forces 0)
  - Type safety: STRICT ✅

**x3 Reproducibility Gate**:
1. Run 1: pnpm run build -- --strict → PASS ✅
2. Run 2: pnpm run build -- --strict → PASS ✅
3. Run 3: pnpm run build -- --strict → PASS ✅

### Required Governance Gates

| Gate | Description | Proof |
|------|-------------|-------|
| G1 | No net policy violations | Allowlist unchanged |
| G2 | No allowlist expansion | New imports must be existing |
| G3 | UI_ATLAS diff = 0 | No UI structure changes |
| G4 | No new files | Only src/ changes, no new files |
| G5 | 4-Ring integrity | No cross-ring shortcuts |
| G6 | Type safety regression | strictness improved, not broken |
| G7 | Build gate | pnpm build passes 0 errors |
| G8 | Test gate | pnpm test passes 100% |
| G9 | Linting gate | pnpm lint passes 0 issues |

### Version Plan Decision

**If PASS (expected)**:
- This is a **Stability/Hardening** change (Ring 0, compile-time)
- **Version Track**: v27.1.0 (feature branch, new SemVer minor)
- **Deployment**: Merge to feat/strict-mode → Create PR → v27.1.0 artifact

**If FAIL**:
- Revert strict mode commits
- Document blocking issues to `$PERF_RUN_DIR/BLOCKING_ISSUES.md`
- Mark Phase 5 BLOCKED

### Files to Modify

| File | Change |
|------|--------|
| tsconfig.json | Enable strict flags |
| src/**/*.ts | Add type annotations, fix null safety |
| src/**/*.tsx | Add type annotations, fix null safety |
| .vscode/settings.json | Optionally enforce strict in editor |

### Success Criteria

✅ **All of**:
1. pnpm build -- --strict returns exit code 0
2. pnpm test returns exit code 0
3. pnpm lint returns exit code 0
4. No type regressions (all src/ type-safe)
5. All 9 governance gates PASS
6. x3 reproducibility test PASS

### Metrics for Proof

**Pre-implementation**:
- `tsc --strict src/ --noEmit 2>&1 | grep "error TS" | wc -l` = N_errors (baseline)

**Post-implementation**:
- `tsc --strict src/ --noEmit 2>&1 | grep "error TS" | wc -l` = 0 (target)
- `pnpm build 2>&1 | grep "error" | wc -l` = 0 (target)
- Test pass rate: 100% (target)

### Estimated Timeline
- **Prep (Phase 5A)**: 5 min
- **Enable (Phase 5B)**: 15 min
- **Fix (Phase 5C)**: 30 min (iterative, per warning category)
- **Validate (Phase 5D)**: 5 min
- **Proof (Phase 6)**: 10 min
- **Total**: ~65 min

