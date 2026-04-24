# TITANE∞ — Navigation: Redirects & Dead Code

**Updated:** 2026-02-07 (UI Hygiene Sprint)  
**Authority:** UI_ARBITRATION_LOG.md (P1-1 Dual Router)

## Canonical Router (ACTIVE)

**File:** `src/AppRoutes.tsx`  
**Status:** ✅ ACTIVE - Used by production  
**Usage:** `src/App.tsx:70` - Wrapped in React.Suspense  
**Pattern:** Lazy loading with ErrorBoundary fallbacks  
**Size:** 197 lines  
**Routes:** 87 routes (9 active pages + 78 tab routes)

**Proof:**
```typescript
// src/App.tsx:70
<React.Suspense fallback={<ErrorLoadingSuspenseIndicator />}>
  <AppRoutes />
</React.Suspense>
```

## Dead Router (DEPRECATED)

**File:** `src/_deprecated/router.tsx`  
**Previous Location:** `src/router.tsx`  
**Status:** ❌ DEPRECATED - Not used (0 imports)  
**Size:** 172 lines  
**Moved:** 2026-02-07 (UI Hygiene Sprint)  
**Reason:** Dead code confirmed via codebase scan

**Decision History:**
- **Detection:** MASTER_COHERENCE_ANALYSIS.md (P1-1 Dual Router Confusion)
- **Arbitration:** UI_ARBITRATION_LOG.md (Decision: FIX_NOW)
- **Execution:** UI_HYGIENE_SPRINT_LOG.md

**Verification:**
```bash
# No imports found in codebase (proof of dead code)
$ grep -rn "from.*router" src --include="*.ts" --include="*.tsx" | grep "router.tsx"
# Result: 0 matches

# File moved to deprecated
$ ls src/_deprecated/router.tsx
# Exists with deprecation notice in header
```

## Redirects Map

All redirects are handled in `src/AppRoutes.tsx` via route configuration.

**Pattern:**
- Old routes redirect to new canonical paths
- Example: `/dashboard` → `/` (home)
- All redirects are documented in AppRoutes.tsx route definitions

## Legacy Routes (None Active)

No legacy routes found. All historical routing code has been:
- Removed (router.tsx)
- Consolidated into AppRoutes.tsx
- Documented in this file

## Cleanup Status

- ✅ Dead code identified and moved
- ✅ Canonical router documented
- ✅ No orphaned route files
- ✅ All navigation flows use AppRoutes.tsx

## Future Cleanup (Not Required)

If router.tsx remains unused for 3+ months:
- **Option:** Delete `src/_deprecated/router.tsx` entirely
- **Requires:** Confirmation that no rollback needed
- **Timeline:** Sprint N+6 or later

---

**Last Verified:** 2026-02-07  
**Verification Method:** Codebase scan + import analysis  
**Status:** ✅ CLEAN (no confusion, single canonical router)
