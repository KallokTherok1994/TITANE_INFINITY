# GATE 12 — MIGRATION ROLLBACK

**Date:** 2026-05-29
**Gate:** GATE_12

---

## Rollback Command

```powershell
# Remove all Gate 12 additions
Remove-Item -Force "src\lib\routeIndex.ts"
Remove-Item -Recurse -Force "src\components\NexusShell\"
Remove-Item -Force "tests\unit\navigation\routeIndex.test.ts"

# Restore modified file
git restore -- "src\components\palette\commands\routes.ts"
```

## What rollback removes

| File | Action |
|------|--------|
| `src/lib/routeIndex.ts` | DELETE (new file) |
| `src/components/NexusShell/NexusShell.tsx` | DELETE (new file) |
| `src/components/NexusShell/useNexusMode.ts` | DELETE (new file) |
| `tests/unit/navigation/routeIndex.test.ts` | DELETE (new file) |
| `src/components/palette/commands/routes.ts` | RESTORE to pre-Gate-12 (12-route version) |

## What rollback does NOT affect

- `src/App.tsx` — never modified in Gate 12
- `src/hooks/useTopNavigation.ts` — Gate 11, not Gate 12
- `src/lib/navigationMode.ts` — Gate 11, not Gate 12
- `src-tauri/**` — never touched in P2
- All route aliases and App.tsx Route declarations

## Safety

Gate 12 was purely additive (new files + PALETTE_ROUTES expansion). No existing product code was deleted or renamed. Rollback is fully reversible via the commands above.

## Post-Rollback Verification

```powershell
node scripts/titane-dev/guard-scope.mjs
node scripts/titane-dev/guard-surface-matrix.mjs --phase GATE_12
corepack pnpm tsc --noEmit
```
