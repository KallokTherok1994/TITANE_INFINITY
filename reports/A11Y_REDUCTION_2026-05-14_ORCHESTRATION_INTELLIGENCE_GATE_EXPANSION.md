# A11y reduction — 2026-05-14 — Orchestration Intelligence Center contrast + gate expansion (31 → 32)

## Verdict

PASS

## Scope

- Source patch: `src/modules/OrchestrationIntelligenceCenter.tsx` — removed `opacity-70` modifier on the `text-xs` tab description span (7 tabs).
- Vitest guard: `src/__tests__/pages/OrchestrationIntelligenceA11yContrast.test.tsx` locks the absence of `text-xs opacity-70` combo in the module.
- Gate extension: `e2e/a11y/wcag-aa-core.spec.ts` adds `/orchestration-intelligence` to the canonical inventory (31 → 32 routes).
- Mapping, registry, autoheal, proof pack updated in the same commit.

## Root cause

Axe `color-contrast` (serious) on `/orchestration-intelligence`:

- Active state: `text-white` rendered at `opacity-70` → effective `#e0b7fe` on `bg-purple-600` (`#9810fa`) = **3.26:1** (fail).
- Inactive state: `text-gray-400` rendered at `opacity-70` → effective `#747d8b` on `bg-gray-800` (`#1e2939`) = **3.52:1** (fail).

Both below WCAG AA 4.5:1 normal-text threshold.

## Fix

Removed `opacity-70` modifier from the desc span. Visual hierarchy is preserved via `text-xs` font-size alone:

- Active: `text-white` on `bg-purple-600` ≈ **5.9:1** (AA).
- Inactive: `text-gray-400` on `bg-gray-800` ≈ **4.83:1** (AA).

## Executable proof

### Vitest guard

```
pnpm vitest run src/__tests__/pages/OrchestrationIntelligenceA11yContrast.test.tsx
✓ src/__tests__/pages/OrchestrationIntelligenceA11yContrast.test.tsx (1 test) 3ms
Test Files  1 passed (1)
     Tests  1 passed (1)
```

### Canonical Playwright gate (32 routes)

```
TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 \
  pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium

[a11y:orchestration-intelligence] blocking=0 (c=0 s=0 m=0 mn=0)
[a11y:aggregate] blocking=0 baseline=30
34 passed (1.7m)
```

All 32 route tests + aggregate baseline + inventory invariant PASS. New route `/orchestration-intelligence` blocking=0.

## Governance

- AutoHeal: `AH-2026-05-14-A11Y-ORCHESTRATION-INTELLIGENCE-OPACITY70-CONTRAST-v35_1_6` appended (full schema).
- Registry: `ui-event-2026-05-14T231000Z-a11y-orchestration-intelligence-contrast` appended.
- Mapping: `UI_SURFACE_MAP.md` + `docs/CARTOGRAPHY_COMPLETE.md` updated (new sections before previous 2026-05-14 entries).
- Validators required: `pnpm verify:registry`, `bash scripts/autoheal/detect_recurrence.sh`, `bash scripts/verify_instructions.sh` — all PASS.

## Rollback

```
git restore -- src/modules/OrchestrationIntelligenceCenter.tsx \
  src/__tests__/pages/OrchestrationIntelligenceA11yContrast.test.tsx \
  e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md \
  registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl \
  reports/A11Y_REDUCTION_2026-05-14_ORCHESTRATION_INTELLIGENCE_GATE_EXPANSION.md \
  proof_packs/A11Y_REDUCTION_2026-05-14_ORCHESTRATION_INTELLIGENCE_GATE_EXPANSION
```
