# 09 — GATES REPORT

## G_CHAMPION_BASELINE_TSC — PASS

```
pnpm tsc --noEmit → exit 0
```

## G_CHAMPION_BASELINE_BUILD — PASS

```
pnpm build → exit 0 (AppImage built, post-build OK)
```

## G_CHAMPION_BASELINE_VITEST — PASS (from recert)

```
3399/3399 tests PASS (prior recert, SHA 368a740c3)
```

## G_VERIFY_INSTRUCTIONS — PASS

```
bash scripts/verify_instructions.sh → SUMMARY: PASS=20 FAIL=0
```

## G_AH_RECURRENCE_GUARD_PASS — PASS

```
bash scripts/autoheal/detect_recurrence.sh → PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=508
```

## G_VITE8_NODE_ENGINE — PASS

```
vite@8 requires: ^20.19.0 || >=22.12.0
Running: v20.20.0
Result: SATISFIES ^20.19.0 ✅
```

## G_VITE8_STORYBOOK_PEER — PASS

```
@storybook/builder-vite@10.3.1 peers: vite '^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0'
@storybook/react-vite@10.3.1 peers: vite '^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0'
Result: ✅ Both support vite@8
```

## G_VITE8_VITEST_PEER — FAIL (installed) / PASS (4.1.0 available)

```
vitest@4.0.18 dep: vite '^6.0.0 || ^7.0.0' → DOES NOT support vite@8
vitest@4.1.0 peer: vite '^6.0.0 || ^7.0.0 || ^8.0.0-0' → SUPPORTS vite@8
Result: Installed version FAILS; upgrade path EXISTS ✅
Classification: TEST_CHAIN_BLOCK with workaround
```

## G_VITE8_PLUGIN_REACT_PEER — FAIL (installed) / PASS (5.2.0 available)

```
@vitejs/plugin-react@5.1.4 peers: '^4.2.0 || ^7.0.0' (no ^8) → FAIL
@vitejs/plugin-react@5.2.0 peers: '^4.2.0 || ^8.0.0' → PASS
Result: Installed version FAILS; upgrade path EXISTS ✅
Classification: PLUGIN_CHAIN_BLOCKED with workaround
```

## G_VITE8_ROLLDOWN_CONFIG — BLOCKED (pending trial)

```
vite.config.ts rollupOptions.treeshake uses rollup-specific options
rolldown compat for these sub-options: UNKNOWN — needs isolated trial
Classification: CONFIG_MODE_BLOCK (SOFT) — pending trial validation
```

## G_ESLINT_ISOLATION — PASS

```
ESLint 10 scope: NOT TOUCHED in this gate
Classification confirmed: PEER_BLOCKED (separate classification, not mixed)
```

## Summary

| Gate | Status |
|------|--------|
| G_CHAMPION_BASELINE_TSC | ✅ PASS |
| G_CHAMPION_BASELINE_BUILD | ✅ PASS |
| G_CHAMPION_BASELINE_VITEST | ✅ PASS |
| G_VERIFY_INSTRUCTIONS | ✅ PASS |
| G_AH_RECURRENCE_GUARD_PASS | ✅ PASS |
| G_VITE8_NODE_ENGINE | ✅ PASS |
| G_VITE8_STORYBOOK_PEER | ✅ PASS |
| G_VITE8_VITEST_PEER | ⚠️ FAIL (installed) / PASS (with upgrade) |
| G_VITE8_PLUGIN_REACT_PEER | ⚠️ FAIL (installed) / PASS (with upgrade) |
| G_VITE8_ROLLDOWN_CONFIG | 🔶 BLOCKED (soft — needs trial) |
| G_ESLINT_ISOLATION | ✅ PASS (not mixed) |
