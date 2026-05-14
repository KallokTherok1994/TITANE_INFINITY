# ROLLBACK

If this batch regresses browser degraded-mode behavior, restore the entire slice with:

`git restore -- src/features/system-center/hooks/useSystemDiagnostics.ts src/features/system-center/hooks/__tests__/useSystemDiagnostics.test.ts src/pages/ConfigurationHub.tsx src/pages/__tests__/ConfigurationHub.runtimeConfig.test.ts src/__tests__/pages/ConfigurationHub.test.tsx src/modules/optimization/WebAssemblyCompute.ts src/modules/optimization/__tests__/WebAssemblyCompute.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/runtime-browser-fallback-normalization-2026-05-14.md proof_packs/RUNTIME_BROWSER_FALLBACK_NORMALIZATION_2026-05-14_v35_1_5`