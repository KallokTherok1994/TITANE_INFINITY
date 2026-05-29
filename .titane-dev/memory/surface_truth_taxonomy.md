# SURFACE TRUTH TAXONOMY

**Project:** TITANE_INFINITY  
**Purpose:** Define what counts as valid proof for UI surface state.

---

## PROOF HIERARCHY (most to least authoritative)

```
1. DOM SurfaceTruth — actual rendered DOM in running app (WDIO / Playwright capture)
2. Launcher proof   — verified that the launcher started and reached the correct route
3. AppImage proof   — verified the AppImage binary is correct and runnable
4. dist/ output     — build artifact (does NOT prove launcher or DOM)
5. Source code      — shows intent (does NOT prove runtime)
6. Screenshot       — visual evidence (does NOT substitute for DOM proof)
7. Narrative PASS   — forbidden as proof
```

## SURFACE CLASSIFICATION

```
KEEP        — production surface, required in product
KEEP_DAILY  — production surface shown by default
ARCHIVE     — deprecated, hidden but not deleted
REMOVE      — approved for deletion after Surface Decision Matrix + Kevin approval
SIMULATED_UI — dev/demo surface, must not appear in daily mode without approval
UNKNOWN     — unclassified, requires audit
```

## UI_SURFACE_REGISTRY authority

The canonical source of truth for surface classification is:
- `src/registry/uiSurfaceRegistry.ts`
- `docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json`

## SURFACE MUTATION RULES

- No route rename without Surface Decision Matrix PASS + Kevin approval.
- No route deletion without Surface Decision Matrix PASS + Kevin approval.
- No SIMULATED_UI promoted to KEEP_DAILY without Kevin approval.
- No new route added without IPC whitelist check (if route uses Tauri commands).

## NEXUS v36/v37 SURFACE CONTEXT

The Surface Decision Matrix (workflow 03) will classify all routes in the current manifest.
Until that matrix is completed and approved, no route changes are permitted.
