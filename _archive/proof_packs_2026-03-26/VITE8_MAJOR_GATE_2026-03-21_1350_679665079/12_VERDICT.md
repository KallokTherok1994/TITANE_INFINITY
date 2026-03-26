# 12 — VERDICT

## VERDICT: QUALIFIED — SHADOW_ONLY_ALLOWED

---

## Rationale

### What was proven (read-only, no installs)

1. **vite@8.0.1 is available** and its Node engine requirement (^20.19.0 || >=22.12.0) is satisfied by v20.20.0 ✅
2. **vite@8 uses rolldown@1.0.0-rc.10** as default bundler — this is a significant internal change from rollup
3. **Champion (vite@7.3.1 stack) is intact**: TSC ✅, build ✅, tests 3399/3399 ✅, gates PASS=20/20 ✅

### Blockers found (all have workarounds)

| Blocker | Type | Severity | Workaround |
|---------|------|----------|------------|
| vitest@4.0.18 dep: vite ^6.0.0 \|\| ^7.0.0 | TEST_CHAIN_BLOCK | HARD | YES — upgrade to 4.1.0 |
| @vitejs/plugin-react@5.1.4 peer ends at ^7.0.0 | PLUGIN_CHAIN_BLOCKED | HARD | YES — upgrade to 5.2.0 |
| rollupOptions.treeshake rolldown compat | CONFIG_MODE_BLOCK | SOFT | NEEDS_CONFIG — trial required |

### Packages cleared (no blocker)

@storybook/builder-vite ✅, @storybook/react-vite ✅, storybook ✅, vite-tsconfig-paths ✅, rollup-plugin-visualizer ✅ (rolldown peer ok), vite-plugin-compression ✅, @tauri-apps/cli ✅

---

## Verdict Explanation

- **QUALIFIED**: migration is technically feasible; all peer/dep blockers have available upgrade paths
- **SHADOW_ONLY_ALLOWED**: no production deployment on MAIN until isolated trial branch fully validates rolldown bundler compatibility with existing `rollupOptions.treeshake` config and confirms vitest 4.1.0 stability
- **Champion retained on MAIN**: vite@7.3.1, @vitejs/plugin-react@5.1.4, vitest@4.0.18 — unchanged
- **ESLint 10 isolation confirmed**: not mixed with this gate

---

## Next Steps to Complete Migration

1. Create branch `trial/vite8-migration`
2. Install: vite@8.0.1, @vitejs/plugin-react@5.2.0, vitest@4.1.0-suite
3. Test: TSC, pnpm build (check rolldown treeshake warnings), vitest 4.1.0 full run
4. If G_VITE8_ROLLDOWN_CONFIG PASS → classify PASS, merge to MAIN
5. If rolldown config failures → adjust treeshake options or remove, re-test

---

## Gate Summary

```
G_CHAMPION_BASELINE:     PASS
G_VERIFY_INSTRUCTIONS:   PASS (20/20)
G_AH_RECURRENCE:         PASS
G_VITE8_NODE_ENGINE:     PASS
G_VITE8_STORYBOOK:       PASS
G_VITE8_VITEST:          BLOCKED (upgrade required → workaround available)
G_VITE8_PLUGIN_REACT:    BLOCKED (upgrade required → workaround available)
G_VITE8_ROLLDOWN_CONFIG: BLOCKED (soft — trial validation pending)
G_ESLINT_ISOLATION:      PASS

FINAL VERDICT: QUALIFIED — SHADOW_ONLY_ALLOWED
```

---

*Proof pack: VITE8_MAJOR_GATE_2026-03-21_1350_679665079*  
*Analyst: Copilot governed agent — 2026-03-21 13:50 UTC*
