# GATE 12 — ALIAS PRESERVATION REPORT

**Date:** 2026-05-29
**Gate:** GATE_12

---

## Alias Preservation Status

```
ROUTES_TOTAL=30
ROUTES_PRESERVED=30
ROUTES_DELETED=0
ROUTES_RENAMED=0
ALIASES_TOTAL=65
ALIASES_PRESERVED=65
ALIASES_DELETED=0
SIMULATED_UI_IN_DAILY=0
```

## Proof

Gate 12 applied zero changes to `src/App.tsx` (P36-07 deferred to Gate 13). All route declarations and alias registrations remain untouched. The Surface Decision Matrix alias counts from Gate 7 are preserved exactly:

| Route | Decision | Aliases |
|-------|----------|---------|
| /titane | KEEP_DAILY | 12 |
| /admin | KEEP_SYSTEM | 17 |
| /dev | KEEP_DEV | 13 |
| All others | Various | 23 |
| **Total** | | **65** |

## What Gate 12 touched

- `src/lib/routeIndex.ts` — NEW typed data file derived from the matrix. No routing code.
- `src/components/NexusShell/NexusShell.tsx` — NEW React context provider. Not wired into App.tsx.
- `src/components/NexusShell/useNexusMode.ts` — NEW hook. Not wired into App.tsx.
- `src/components/palette/commands/routes.ts` — MODIFIED to add `decision` field and expand from 12 to 30 palette entries. Uses `useNavigate` — does not declare routes.

## SIM-03 Compliance

```
SIMULATED_UI_IN_DAILY = 0
/orchestration-intelligence → KEEP_SIMULATED, inDailyMode=false ✓
/quantum-center            → KEEP_SIMULATED, inDailyMode=false ✓
```

## Guard Verification

```
guard-surface-matrix.mjs --phase GATE_12 = PASS (no deletions detected)
routeIndex.test.ts → 30/30 routes unique paths — PASS
routeIndex.test.ts → SIMULATED routes have inDailyMode=false — PASS
routeIndex.test.ts → no SYSTEM route has inDailyMode=true — PASS
```
