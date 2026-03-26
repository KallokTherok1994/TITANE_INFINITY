# 07 — TRIAL PLAN

## Decision: TRIAL TECHNICALLY FEASIBLE — SHADOW ONLY ALLOWED ON MAIN

All blockers have workarounds. No NO_WORKAROUND hard blocks found. Trial can proceed on an isolated branch only.

---

## Minimal Trial Package Set

### Step T1: Create isolated branch

```bash
git checkout -b trial/vite8-migration
```

### Step T2: Upgrade packages (pnpm)

```bash
pnpm add -D vite@8.0.1 \
  @vitejs/plugin-react@5.2.0 \
  vitest@4.1.0 \
  @vitest/browser@4.1.0 \
  @vitest/coverage-v8@4.1.0 \
  @vitest/ui@4.1.0 \
  @vitest/browser-playwright@4.1.0
```

**Rationale:**
- `vite@8.0.1` — target
- `@vitejs/plugin-react@5.2.0` — minimum version with vite@8 peer support; avoids @rolldown/plugin-babel dependency (6.0.1)
- `vitest@4.1.0` + suite — first version with `vite: '^6.0.0 || ^7.0.0 || ^8.0.0-0'` peer support

### Step T3: Config changes to investigate

```ts
// vite.config.ts — rollupOptions.treeshake
// Risk: rolldown may not support these rollup-specific sub-options
// Action: run build and check for warnings/errors; if treeshake errors, remove or simplify:
treeshake: {
  moduleSideEffects: false,        // test if rolldown accepts
  propertyReadSideEffects: false,  // test if rolldown accepts
  tryCatchDeoptimization: false,   // test if rolldown accepts
},
// Fallback if errors: remove treeshake block entirely (use rolldown defaults)
```

### Step T4: Validation gates

```bash
pnpm tsc --noEmit 2>&1
echo "TSC_EXIT:$?"

pnpm build 2>&1
echo "BUILD_EXIT:$?"

pnpm test:unit 2>&1 | tail -10
echo "UNIT_EXIT:$?"

bash scripts/verify_instructions.sh 2>&1 | tail -3
bash scripts/autoheal/detect_recurrence.sh 2>&1 | tail -3
```

### Go/No-Go Criteria

| Criterion | Required |
|-----------|---------|
| TSC exit 0 | MANDATORY |
| `pnpm build` exit 0 with no new errors | MANDATORY |
| Build output size delta < ±20% | MANDATORY |
| vitest unit suite pass rate ≥ 3399/3399 | MANDATORY |
| verify_instructions PASS=20 FAIL=0 | MANDATORY |
| No new PEER_CONFLICTS in pnpm install output | MANDATORY |
| rolldown treeshake options: no FAIL | MANDATORY |
| Tauri build (`pnpm tauri build`) exit 0 | MANDATORY before PROD |

### Rollback from trial branch

```bash
git checkout MAIN
git branch -D trial/vite8-migration
```

---

## What Is NOT in Scope for This Trial

- ESLint 10 (PEER_BLOCKED — DO NOT TOUCH)
- @vitejs/plugin-react@6 Babel compiler features (use 5.2.0 not 6.0.1)
- storybook version changes (10.3.1 already supports vite@8)
- Tauri CLI / src-tauri changes

---

## Re-evaluation Trigger

If vitest@4.1.0 proves unstable or storybook@10.3.1 shows unexpected incompatibility with rolldown build outputs, re-classify as BLOCKED and open dedicated investigation.
