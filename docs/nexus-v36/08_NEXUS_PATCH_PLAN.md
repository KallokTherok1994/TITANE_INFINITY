# GATE 8 — NEXUS PATCH PLAN

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC — no patches applied until APPROVE_P2_GATE_10

---

## Patch Plan Overview

This document enumerates the exact file changes required for NEXUS v36 implementation.  
**Zero patches are applied in Gate 8.** This is a planning-only document.

---

## Patch Classification

| Patch ID | File | Type | Risk | Gate |
|----------|------|------|------|------|
| P36-01 | `src/components/NexusShell/NexusShell.tsx` | NEW | LOW | Gate 10 |
| P36-02 | `src/components/CommandPalette/CommandPalette.tsx` | NEW | LOW | Gate 10 |
| P36-03 | `src/components/CommandPalette/useCommandPalette.ts` | NEW | LOW | Gate 10 |
| P36-04 | `src/components/CommandPalette/routeIndex.ts` | NEW | LOW | Gate 10 |
| P36-05 | `src/components/TruthBadge/TruthBadge.tsx` | NEW | LOW | Gate 10 |
| P36-06 | `src/components/EmptyStateTruth/EmptyStateTruth.tsx` | NEW | LOW | Gate 10 |
| P36-07 | `src/App.tsx` | MODIFY | MEDIUM | Gate 11 |
| P36-08 | `src/index.css` | MODIFY | LOW | Gate 11 |
| P36-09 | `src/lib/routeIndex.ts` | NEW | LOW | Gate 10 |

---

## Patch Details

### P36-01 — NexusShell

**Purpose:** Wrapper component providing mode context (Daily/System/Dev) to all child routes.  
**What it touches:** Wraps existing router outlet; does not modify page components.  
**Risk:** LOW — additive wrapper; existing pages unchanged.  
**Rollback:** Delete `src/components/NexusShell/`

### P36-02 — CommandPalette

**Purpose:** New overlay component triggered by Ctrl+K.  
**What it touches:** New file only; registered as keyboard listener in NexusShell.  
**Risk:** LOW — new component, no existing code modified.  
**Rollback:** Delete `src/components/CommandPalette/`

### P36-03 — useCommandPalette

**Purpose:** React hook managing palette open/close state and route search.  
**Risk:** LOW — new hook.  
**Rollback:** Delete file.

### P36-04 — routeIndex.ts (CommandPalette)

**Purpose:** Static import of route data from Surface Decision Matrix.  
**Source:** Generated from `docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json` at build time.  
**Risk:** LOW — static data file.  
**Rollback:** Delete file.

### P36-05 — TruthBadge

**Purpose:** Truth badge overlay component.  
**Risk:** LOW — new component.  
**Rollback:** Delete `src/components/TruthBadge/`

### P36-06 — EmptyStateTruth

**Purpose:** Standardized empty state component.  
**Risk:** LOW — new component.  
**Rollback:** Delete `src/components/EmptyStateTruth/`

### P36-07 — src/App.tsx

**Purpose:** Wrap router with `<NexusShell>` and register `<CommandPalette>`.  
**Risk:** MEDIUM — modifies top-level app entry. Requires certifier run before and after.  
**Pre-patch:** `bash scripts/verify/prebuild-frontend-runtime-certifier.sh`  
**Post-patch:** `bash scripts/verify/prebuild-frontend-runtime-certifier.sh`  
**Rollback:** `git restore -- src/App.tsx`

### P36-08 — src/index.css

**Purpose:** Add CSS variables for truth badge colors.  
**Risk:** LOW — CSS variables only; no @import changes; all imports before @config preserved.  
**Rollback:** `git restore -- src/index.css`

### P36-09 — src/lib/routeIndex.ts

**Purpose:** Central route index for runtime use (command palette + NexusShell).  
**Risk:** LOW — new lib file.  
**Rollback:** Delete file.

---

## Patch Sequencing (Gate 10 order)

1. P36-09 (routeIndex) — no dependencies
2. P36-04 (CommandPalette routeIndex) — no dependencies
3. P36-01 (NexusShell) — depends on P36-09
4. P36-02 (CommandPalette component) — depends on P36-04, P36-03
5. P36-03 (useCommandPalette) — depends on P36-04
6. P36-05 (TruthBadge) — no dependencies
7. P36-06 (EmptyStateTruth) — no dependencies
8. P36-08 (index.css) — no dependencies
9. P36-07 (App.tsx) — depends on all above; run certifier after

---

## Pre-Patch Gate Requirements

Before Gate 10 execution:
- [ ] `APPROVE_P2_GATE_10` received from Kevin
- [ ] guard-scope.mjs: PASS
- [ ] guard-surface-matrix.mjs --phase GATE_10: PASS
- [ ] prebuild-frontend-runtime-certifier.sh: FRONTEND_RUNTIME_PREBUILD=PASS
- [ ] Visual capture baseline: PENDING (44 captures required)

---

## Verdict

```
PATCHES_PLANNED=9
PATCHES_APPLIED=0
MEDIUM_RISK_PATCHES=1 (P36-07 App.tsx)
LOW_RISK_PATCHES=8
P2_GATE_REQUIREMENT=APPROVE_P2_GATE_10
NEXUS_PATCH_PLAN=COMPLETE
```
