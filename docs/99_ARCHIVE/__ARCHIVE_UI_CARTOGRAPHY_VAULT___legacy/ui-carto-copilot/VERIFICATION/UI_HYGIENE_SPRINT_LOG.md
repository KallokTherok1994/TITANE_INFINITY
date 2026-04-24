# TITANE∞ — UI HYGIENE SPRINT LOG
**Date:** 2026-02-07  
**Mode:** Patch minimal, proof-driven, rollback-ready  
**Scope:** Frontend only  
**Authority:** docs/ui-carto-copilot/UI_ARBITRATION_LOG.md

## 0) Preflight Check ✅

**Authority Document:**
- Path: `docs/ui-carto-copilot/UI_ARBITRATION_LOG.md`
- Referenced decisions: P1-1 (Dual Router), P1-2 (Silent IPC)

**Sprint Goals:**
1. FIX_NOW #1: Dual Router Confusion (P1-1)
2. FIX_NOW #2: Silent IPC Failures (P1-2)

## 1) FIX_NOW #1 — Dual Router Confusion Analysis

### A) Canonical Router Proof

**Runtime Router:**
- File: `src/AppRoutes.tsx`
- Size: 197 lines
- Used by: `src/App.tsx:70`
- Pattern: Lazy imports with React Suspense
- Proof: `const AppRoutes = lazy(() => import('./AppRoutes'));`

**Router Usage in App.tsx:**
```typescript
// src/App.tsx:70
<React.Suspense fallback={<ErrorLoadingSuspenseIndicator />}>
  <AppRoutes />
</React.Suspense>
```

### B) Dead Router State

**Dead Router:**
- File: `src/router.tsx`
- Size: 172 lines
- Import count: **0** (confirmed via grep/search)
- Last modified: Historical artifact
- Status: **DEAD CODE CONFIRMED**

**Proof (no imports found):**
```bash
$ grep -rn "from.*router" src --include="*.ts" --include="*.tsx" | grep -v "AppRoutes" | grep "router.tsx"
# Result: 0 matches (excluding AppRoutes)
```

### C) Action Decision

**Chosen: Voie 1 (Deprecation)**
- Move: `src/router.tsx` → `src/_deprecated/router.tsx`
- Add deprecation header comment
- Rationale: Preserves history, allows rollback if needed, clear signal

## 2) FIX_NOW #2 — Silent IPC Failures Analysis

### A) Empty Catch Blocks Located

**Method:**
```bash
$ grep -rn "} catch" src --include="*.ts" --include="*.tsx"
$ Manual inspection for empty/minimal handlers
```

### B) 10 Silent Catch Blocks Identified

| # | File | Line | Context | Current Behavior | Risk |
|---|------|------|---------|------------------|------|
| 1 | `panelsStore.ts` | 646 | localStorage.removeItem | Silent ignore | P2 - acceptable (browser compat) |
| 2 | `useVisionStore.ts` | 292 | Device enumeration permission | Silent with comment | P2 - acceptable (expected) |
| 3 | `useVisionStore.ts` | 522 | Device enumeration permission | Silent with comment | P2 - acceptable (expected) |
| 4 | `usePerformanceStore.ts` | 279 | Optimization apply | Returns false | P2 - has fallback |
| 5 | `effectsStore.ts` | 483 | localStorage.removeItem | Silent ignore | P2 - acceptable |
| 6 | `useSelfHealingStore.ts` | 386 | Repair execution | Sets failed state | P1 - **needs log** |
| 7 | `aiPredictiveEngine.ts` | 533 | Network latency | Returns default 1000ms | P2 - has fallback |
| 8 | `panelsStore.ts` | 646 | Reset localStorage | Comment: "ignore" | P2 - acceptable |
| 9 | `useVisionStore.ts` | 292 | Device permission | Comment: "normal" | P2 - acceptable |
| 10 | `usePerformanceStore.ts` | 279 | Apply suggestion | Returns false | P2 - has fallback |

### C) Classification

**Truly Silent (Need Fix - P1):**
1. `useSelfHealingStore.ts:386` - Repair fails silently, state changes but no log

**Silent with Comment (Acceptable - P2):**
2. `panelsStore.ts:646` - Comment: "ignore (non-browser / restricted storage)"
3. `useVisionStore.ts:292` - Comment: "Permission pas encore accordée, normal"
4. `useVisionStore.ts:522` - Comment: "Silencieux si pas de permission"
5. `effectsStore.ts:483` - Comment: "ignore"

**Silent with Fallback (Acceptable - P2):**
6. `usePerformanceStore.ts:279` - Returns false on error
7. `aiPredictiveEngine.ts:533` - Returns default latency value

**Total Found:** 7 unique locations (some duplicates in count)

**Action Required:** Add console.error to truly silent catch (useSelfHealingStore.ts:386)

### D) Fix Strategy

**Minimal Changes:**
1. Add console.error to truly silent catches
2. Preserve existing fallback behavior
3. No architectural changes
4. No new dependencies

**Pattern:**
```typescript
} catch (error) {
  console.error('[Store/Module] Operation failed:', error);
  // existing fallback behavior preserved
}
```

## 3) Commands Executed

```bash
# Router analysis
$ grep -rn "from.*AppRoutes" src
$ grep -rn "from.*router" src | grep "router.tsx"
$ wc -l src/router.tsx src/AppRoutes.tsx

# Catch block analysis
$ grep -rn "} catch" src --include="*.ts" --include="*.tsx" | head -100
$ Manual inspection of each catch block context
```

## 4) Files Modified (Planned)

**Phase 1 - Dual Router:**
- [ ] Move: `src/router.tsx` → `src/_deprecated/router.tsx`
- [ ] Update: `docs/ui-carto-copilot/10-navigation/15-redirects-and-deadcode.md`
- [ ] Update: `docs/ui-carto-copilot/09_MANIFEST.json`

**Phase 2 - Silent Catches:**
- [ ] Fix: `src/stores/useSelfHealingStore.ts:386` (add console.error)
- [ ] Update: `docs/ui-carto-copilot/35-states/38-empty-loading-error-catalog.md`
- [ ] Update: `docs/ui-carto-copilot/50-audit/50-issues-register.md`

## 5) Risk Assessment

**Dual Router Fix:**
- Risk: LOW (file unused, 0 imports)
- Rollback: Simple (move file back)
- Impact: None (dead code removal)

**Silent Catches Fix:**
- Risk: LOW (additive only, preserves behavior)
- Rollback: Simple (remove console.error lines)
- Impact: Positive (visibility without behavior change)

## 6) Next Steps

1. Execute dual router deprecation
2. Execute silent catch fixes
3. Run tests (lint, typecheck, build)
4. Create UI_HYGIENE_PROOF.md
5. Final commit

---

**Status:** Analysis Phase Complete ✅  
**Ready for:** Execution Phase
