# NEXT STEPS — v27.2.0 PLANNING (TypeScript Strict Mode Sprint)

## Context

- v27.0.6 COMPLETE (docs-only milestone sealed)
- v27.0.5-prod SAFE (production baseline validated)
- Perfection Lane deferred chantier: TypeScript Strict Mode

## v27.2.0 Sprint Planning

# SUPER PROMPT #6 (vΩ.8) — v27.2.0 TypeScript Strict Mode Sprint

## Mission

Execute deferred Perfection Lane chantier #3 (TypeScript Strict Mode) with dedicated team allocation.

## Scope Discovery (From Perfection Lane vΩ.6)

- **Blocking errors:** 1,217 type errors discovered during audit
- **Estimated effort:** 4-6 hours (requires focused sprint)
- **ROI score:** 50 (high value for codebase health)
- **Risk:** Medium (types only, no runtime logic changes)
- **Policy:** P1 (minor rollback, requires full test suite)

## Prerequisites

1. ✅ v27.0.5-prod immutable (locked)
2. ✅ v27.0.6 docs-only complete (sealed)
3. ✅ Production baseline validated (99.99% uptime)
4. ✅ Governance framework proven (9/9 gates operational)
5. ✅ Registry operational (85 events, immutable)

## Sprint Structure (6 Phases × 1h each)

### Phase 0: Prechecks + Baseline Snapshot (30 min)

- Git state verification
- Create branch: `feature/typescript-strict-v27.2.0`
- Snapshot current compilation warnings
- Document 1,217 error inventory

### Phase 1: Enable Strict Mode + Full Error Audit (1h)

- Set `strict: true` in tsconfig.json
- Run `pnpm run check` → capture full error list
- Categorize errors by type (implicit any, null/undefined, type assertions, etc.)
- Rank by severity (critical → trivial)

### Phase 2: Fix Critical Errors (Ring 1-2: Types + Engines) (1.5h)

- Focus: Core types, engine logic, data models
- Apply explicit type annotations
- Remove unsafe `any` usages
- Fix null/undefined handling

### Phase 3: Fix Service Layer Errors (Ring 3) (1.5h)

- Focus: I/O services, API clients, state management
- Enforce strict type contracts
- Add missing error handling types
- Validate service boundaries

### Phase 4: Fix UI Layer Errors (Ring 4: Modules) (1.5h)

- Focus: React components, hooks, UI utilities
- Type component props correctly
- Fix event handler types
- Resolve context types

### Phase 5: Validation + Proof Generation (1h)

- Run full test suite (pnpm test)
- Execute all 9 governance gates
- Build production binary (smoke test)
- Generate proof artifacts
- Append registry event

### Phase 6: Merge + Tag v27.2.0 (30 min)

- Merge feature branch → main
- Tag v27.2.0 with annotations
- Update changelog
- Prepare Wave 1 deployment plan (3-wave: 5% → 25% → 100%)

## Success Criteria

- ✅ Zero type errors (strict mode fully enforced)
- ✅ All tests PASS (no regression)
- ✅ All gates PASS (9/9)
- ✅ Build successful (production binary generated)
- ✅ Performance baseline maintained (±2% tolerance)

## Rollback Plan

- Policy P1: Full test suite + rollback script
- Rollback trigger: Any gate failure or test regression
- Rollback time: <10 minutes (git revert + rebuild)

## Resource Allocation

- **Duration:** 6-8 hours (single sprint day)
- **Team:** 1 senior engineer + 1 reviewer
- **Approval:** Stop-the-line authority on type safety violations

## Deployment Track (After Sprint Complete)

- Wave 1: 5% early adopters (48h monitoring)
- Wave 2: 25% expanded (48h monitoring)
- Wave 3: 100% GA (if Wave 1+2 PASS)

## Governance

- Policy: P1 (minor changes, full rollback required)
- Gates: All 9 must PASS
- Registry: Append-only events for each phase
- Proof: Full artifact pack generated

---

**Status:** READY_FOR_SPRINT_KICKOFF
**Estimated Completion:** 2026-02-24 (next business day)
**Risk:** MEDIUM (types only, high regression testing)
**ROI:** HIGH (50, improved codebase health + future maintainability)

✅ v27.2.0 Sprint Plan generated
