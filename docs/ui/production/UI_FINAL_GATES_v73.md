## FINAL GATES v73
date: 2026-05-11T10:15:16-04:00

### pnpm run check

> titane-infinity@33.0.15 check /home/titane-os/Documents/GitHub/TITANE_INFINITY
> tsc --noEmit

EXIT:0

### pnpm run lint

> titane-infinity@33.0.15 lint /home/titane-os/Documents/GitHub/TITANE_INFINITY
> eslint "src/**/*.{ts,tsx,js,jsx}"

EXIT:0

### pnpm run verify:ui-surface-registry

> titane-infinity@33.0.15 verify:ui-surface-registry /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/verify/verify-ui-surface-registry.mjs


🔍 TITANE UI Surface Registry Verifier
============================================================
App.tsx canonical routes: 29
Registry canonical routes: 29
uiPages.po.js routes: 28
moduleRouteContext routes: 31
Simulated routes: 2

  ✅ SIMULATED_DISCLOSURE_CONFIRMED: '/orchestration-intelligence' has banner applied
  ✅ SIMULATED_DISCLOSURE_CONFIRMED: '/quantum-center' has banner applied

✅ PASS — All surface registry checks passed
EXIT:0

### pnpm run generate:ui-surface-docs

> titane-infinity@33.0.15 generate:ui-surface-docs /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/generate/generate-ui-surface-docs.mjs


📄 TITANE UI Surface Docs Generator
============================================================
Source: src/registry/uiSurfaceRegistry.ts
Output: docs/ui/generated/
Date: 2026-05-11

Registry stats:
  Canonical routes: 29
  Aliases: 65
  Tabs: 22
  Actions: 48

  ✅ Generated: docs/ui/generated/UI_ROUTE_INVENTORY.md
  ✅ Generated: docs/ui/generated/UI_TAB_MATRIX.md
  ✅ Generated: docs/ui/generated/UI_ACTION_BACKEND_MATRIX.md
  ✅ Generated: docs/ui/generated/UI_PROOF_COVERAGE.md
  ✅ Generated: docs/ui/generated/UI_LEGACY_ALIAS_MAP.md

✅ All docs generated successfully
   Run: node scripts/verify/verify-ui-surface-registry.mjs to validate
EXIT:0

### pnpm run verify:ui-surface-registry

> titane-infinity@33.0.15 verify:ui-surface-registry /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/verify/verify-ui-surface-registry.mjs


🔍 TITANE UI Surface Registry Verifier
============================================================
App.tsx canonical routes: 29
Registry canonical routes: 29
uiPages.po.js routes: 28
moduleRouteContext routes: 31
Simulated routes: 2

  ✅ SIMULATED_DISCLOSURE_CONFIRMED: '/orchestration-intelligence' has banner applied
  ✅ SIMULATED_DISCLOSURE_CONFIRMED: '/quantum-center' has banner applied

✅ PASS — All surface registry checks passed
EXIT:0

### pnpm run verify:ui-desktop-coverage

> titane-infinity@33.0.15 verify:ui-desktop-coverage /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/verify/verify-ui-desktop-coverage.mjs


=== TITANE UI Desktop Coverage Verifier v50 ===

Gate 1: Required Test Files
  ✅ Test file exists: e2e/desktop/ui-desktop-all-routes.wdio.test.js
  ✅ Test file exists: e2e/desktop/ui-desktop-all-tabs.wdio.test.js
  ✅ Test file exists: e2e/desktop/ui-desktop-control-inventory.wdio.test.js
  ✅ Test file exists: e2e/desktop/ui-desktop-safe-actions.wdio.test.js
  ✅ Test file exists: e2e/desktop/ui-desktop-agent-chat-context.wdio.test.js
  ✅ Test file exists: e2e/desktop/ui-desktop-error-boundary-and-empty-state.wdio.test.js
  ✅ Test file exists: e2e/desktop/ui-desktop-sensitive-actions-guarded.wdio.test.js

Gate 2: Required Helper Files
  ✅ Helper exists: e2e/desktop/helpers/uiDesktopManifest.js
  ✅ Helper exists: e2e/desktop/helpers/uiDesktopSelectors.js
  ✅ Helper exists: e2e/desktop/helpers/uiDesktopActions.js
  ✅ Helper exists: e2e/desktop/helpers/uiDesktopAssertions.js
  ✅ Helper exists: e2e/desktop/helpers/uiDesktopScreenshots.js

Gate 3: Required Docs / Manifests
  ✅ Doc exists: docs/ui/desktop/UI_DESKTOP_FULL_COVERAGE_v50_STARTUP_AUDIT.md
  ✅ Doc exists: docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json
  ✅ Doc exists: docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.json
  ✅ Doc exists: docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_v50.md
  ✅ Doc exists: docs/ui/desktop/generated/UI_DESKTOP_ACTION_CLASSIFICATION_v50.md
  ✅ Doc exists: docs/ui/desktop/generated/UI_DESKTOP_FRONTEND_BACKEND_MAP_v50.md
  ✅ Doc exists: docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md

Gate 4: Manifest Integrity
  ✅ Manifest has routeCount field
  ✅ Manifest routeCount = 29
  ✅ Manifest tabCount = 22
  ✅ Manifest aliasCount = 65
  ✅ Manifest mission = UI_DESKTOP_FULL_COVERAGE_v50
  ✅ Manifest has routes array
  ✅ Manifest routes.length = 29
  ✅ All routes have rootTestId
  ✅ All routes have truthClass
  ✅ All truthClass values are valid
  ✅ All routes have pageId
  ✅ All routes have pageComponent
  ✅ Exactly 2 SIMULATED_UI routes
  ✅ /orchestration-intelligence is simulated
  ✅ /quantum-center is simulated
  ✅ Exactly 4 routes have tabs
  ✅ Total tab count = 22 (got 22)
  ✅ All actions have safeActionPolicy
  ✅ All safeActionPolicy values are valid
  ✅ Safe actions = 35 (got 35)
  ✅ Sensitive actions = 13 (got 13)
  ✅ All routes have testCoverage.routeTest

Gate 5: Registry Consistency
  ✅ Registry still has 29 routes (got 29)
  ✅ Registry has 2 SIMULATED_UI routes (got 2)

Gate 6: Test File Content Checks
  ✅ e2e/desktop/ui-desktop-all-routes.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-all-routes.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-all-routes.wdio.test.js: has L1 static tests
  ✅ e2e/desktop/ui-desktop-all-tabs.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-all-tabs.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-all-tabs.wdio.test.js: has L1 static tests
  ✅ e2e/desktop/ui-desktop-control-inventory.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-control-inventory.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-control-inventory.wdio.test.js: has L1 static tests
  ✅ e2e/desktop/ui-desktop-safe-actions.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-safe-actions.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-safe-actions.wdio.test.js: has L1 static tests
  ✅ e2e/desktop/ui-desktop-agent-chat-context.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-agent-chat-context.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-agent-chat-context.wdio.test.js: has L1 static tests
  ✅ e2e/desktop/ui-desktop-error-boundary-and-empty-state.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-error-boundary-and-empty-state.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-error-boundary-and-empty-state.wdio.test.js: has L1 static tests
  ✅ e2e/desktop/ui-desktop-sensitive-actions-guarded.wdio.test.js: has describe blocks
  ✅ e2e/desktop/ui-desktop-sensitive-actions-guarded.wdio.test.js: has test cases (it)
  ✅ e2e/desktop/ui-desktop-sensitive-actions-guarded.wdio.test.js: has L1 static tests

=== VERIFICATION SUMMARY ===

  PASS:     64
  WARN:     0
  FAIL:     0

VERDICT: PASS
[verify-ui-desktop-coverage] All gates passed.
EXIT:0

### pnpm run verify:tauri-only

> titane-infinity@33.0.15 verify:tauri-only /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/verify/enforce-tauri-only.sh

🔍 Vérification Tauri-Only...
📡 Check: Pas de serveurs HTTP...
🚫 Check: Pas de vite preview...
📜 Check: Scripts de lancement conformes...
🌐 Check: Pas de framework standalone web...
⚙️ Check: dev script utilise tauri dev...
✅ Tauri-only enforced: 0 erreurs
EXIT:0

### pnpm run verify:online-first

> titane-infinity@33.0.15 verify:online-first /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/verify/enforce-online-first.sh

🌐 ONLINE-FIRST GOVERNANCE CHECK
================================

✓ Check 1: Doctrine 'local-first only' removed...
  PASS

✓ Check 2: Old gate 'verify:local-first' removed...
  PASS

✓ Check 3: New gate 'verify:online-first' exists...
  PASS

✓ Check 4: Network policy documented...
  PASS

================================
SUMMARY: 0 failures, 0 warnings

✅ ONLINE-FIRST CHECK PASSED
EXIT:0

### pnpm run guard:ipc-contract

> titane-infinity@33.0.15 guard:ipc-contract /home/titane-os/Documents/GitHub/TITANE_INFINITY
> cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run tests/contract/tauri-ipc-contract.test.ts


[1m[30m[46m RUN [49m[39m[22m [36mv4.1.4 [39m[90m/home/titane-os/Documents/GitHub/TITANE_INFINITY[39m

 [32m✓[39m [30m[45m core [49m[39m tests/contract/tauri-ipc-contract.test.ts [2m([22m[2m42 tests[22m[2m)[22m[32m 53[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m42 passed[39m[22m[90m (42)[39m
[2m   Start at [22m 10:16:29
[2m   Duration [22m 741ms[2m (transform 196ms, setup 194ms, import 231ms, tests 53ms, environment 161ms)[22m

EXIT:0

### pnpm run build

> titane-infinity@33.0.15 build /home/titane-os/Documents/GitHub/TITANE_INFINITY
> pnpm exec vite build

vite v7.3.2 building client environment for production...
transforming...
✓ 3950 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                             11.85 kB │ gzip:     4.08 kB
dist/assets/titane-reactor-awen-CDlleqco.svg                13.92 kB │ gzip:     2.51 kB
dist/assets/titane-arc-emerald-DnTwtDxb.svg                 18.50 kB │ gzip:     3.32 kB
dist/.vite/manifest.json                                    30.79 kB │ gzip:     2.99 kB
dist/assets/style-i_Gs1SpC.css                             570.00 kB │ gzip:    92.95 kB
dist/assets/PerformanceTest-CSlAtSaw.js                      0.42 kB │ gzip:     0.29 kB
dist/assets/index-BTgUc3lC.js                                1.28 kB │ gzip:     0.66 kB
dist/assets/ui-experience-Cn5aiWio.js                        1.36 kB │ gzip:     0.73 kB
dist/assets/Memory-CQKmOOnj.js                               1.48 kB │ gzip:     0.79 kB
dist/assets/Watchdog-DLqE4JpQ.js                             1.50 kB │ gzip:     0.69 kB
dist/assets/SelfHeal-CD6yx1MB.js                             1.53 kB │ gzip:     0.70 kB
dist/assets/AdaptiveEngine-CmOE-qBF.js                       1.55 kB │ gzip:     0.69 kB
dist/assets/Sentinel-haNAQFxi.js                             1.59 kB │ gzip:     0.72 kB
dist/assets/ui-branding-DspoUxD8.js                          1.63 kB │ gzip:     0.95 kB
dist/assets/fr-B9WWuK6F.js                                   1.86 kB │ gzip:     0.96 kB
dist/assets/en-Daorm0d3.js                                   2.19 kB │ gzip:     1.05 kB
dist/assets/DetectionOverlay-u0pET_6k.js                     3.17 kB │ gzip:     1.39 kB
dist/assets/DocCenterPage-B-8bmd6U.js                        3.23 kB │ gzip:     1.59 kB
dist/assets/index-oKaQuBvm.js                                3.34 kB │ gzip:     1.36 kB
dist/assets/cameraChatIntegration-DAp8-7zf.js                3.49 kB │ gzip:     1.37 kB
dist/assets/RealTimeCharts-BhXBWqZM.js                       3.58 kB │ gzip:     0.92 kB
dist/assets/HTFPage-e9QKruo7.js                              4.07 kB │ gzip:     1.64 kB
dist/assets/logLevelConfig-Hz0t7zGe.js                       4.12 kB │ gzip:     1.38 kB
dist/assets/app-undkPIL3.js                                  4.51 kB │ gzip:     1.99 kB
dist/assets/MemorySearchPanel-Bj6R0d_C.js                    6.11 kB │ gzip:     2.41 kB
dist/assets/VisionMetricsChart-Dq5NVLIZ.js                   6.26 kB │ gzip:     1.49 kB
dist/assets/AdminPage-B1OLlg0L.js                            6.82 kB │ gzip:     2.22 kB
dist/assets/EvolutionTimeline-CkwI_WgS.js                    6.85 kB │ gzip:     2.89 kB
dist/assets/ProductionHealthPanel-Rma3ARYf.js                6.87 kB │ gzip:     2.30 kB
dist/assets/TitanePage-Ht6ckHdx.js                           6.97 kB │ gzip:     2.23 kB
dist/assets/Experience-D1zNRA1T.js                           7.56 kB │ gzip:     2.41 kB
dist/assets/PerfectFusionDashboard-C7rToR6l.js               7.58 kB │ gzip:     2.20 kB
dist/assets/CreationStudio-BtNLetaP.js                       8.20 kB │ gzip:     2.42 kB
dist/assets/EvolutionMonitor-CB0z2sN-.js                     8.78 kB │ gzip:     2.48 kB
dist/assets/TwinsPage-CXA2NqMl.js                            9.00 kB │ gzip:     2.28 kB
dist/assets/TransformationRoadmap-CXediTfM.js                9.56 kB │ gzip:     3.36 kB
dist/assets/ResearchPage-BLLrxoiA.js                         9.95 kB │ gzip:     3.34 kB
dist/assets/RealityCenter-CvLdQiXq.js                       10.37 kB │ gzip:     2.61 kB
dist/assets/VocalDevConsoleEngine-CNoVWP52.js               10.46 kB │ gzip:     3.52 kB
dist/assets/LiveDebuggerEngine-dI7mFowg.js                  11.23 kB │ gzip:     3.88 kB
dist/assets/SingularityMonitor-BcDv8za2.js                  11.24 kB │ gzip:     2.88 kB
dist/assets/ui-dev-BEYrrEbC.js                              11.29 kB │ gzip:     3.22 kB
dist/assets/UltimateOptimizationDashboard-D82iZZCe.js       11.49 kB │ gzip:     3.23 kB
dist/assets/ui-memory-evolution-DOgi8nxF.js                 12.25 kB │ gzip:     3.49 kB
dist/assets/web-vitals-J_E3b7Hg.js                          12.60 kB │ gzip:     3.86 kB
dist/assets/OrchestrationIntelligenceCenter-3o3oFZAy.js     13.82 kB │ gzip:     3.48 kB
dist/assets/d3-tree-BgEqgDEC.js                             14.48 kB │ gzip:     4.30 kB
dist/assets/ui-hyper-CejMmDsf.js                            15.66 kB │ gzip:     5.02 kB
dist/assets/ui-quantum-GlNyzLg9.js                          17.77 kB │ gzip:     3.77 kB
dist/assets/OrchestrationMetaCenter-BmPmXpX3.js             17.93 kB │ gzip:     4.40 kB
dist/assets/index-Dq2AABrs.js                               18.11 kB │ gzip:     5.38 kB
dist/assets/MemoryTreeViewer-CCVkUWCQ.js                    18.33 kB │ gzip:     4.90 kB
dist/assets/ui-audio-DXTHMCVB.js                            18.92 kB │ gzip:     5.28 kB
dist/assets/TotalDevPage-C7PmPr5b.js                        19.01 kB │ gzip:     5.90 kB
dist/assets/DevPage-neKzMDKH.js                             29.38 kB │ gzip:     8.06 kB
dist/assets/index-lJlX065n.js                               30.78 kB │ gzip:     7.49 kB
dist/assets/motion-AkM2Fd2a.js                              32.23 kB │ gzip:    11.17 kB
dist/assets/ConfigurationHub-Dh1MIdLT.js                    34.59 kB │ gzip:     8.78 kB
dist/assets/tauri-vendor-KyqfgcBs.js                        35.71 kB │ gzip:     8.01 kB
dist/assets/index-D8HNVdEh.js                               36.63 kB │ gzip:     7.97 kB
dist/assets/ui-optimization-DnbA3H64.js                     38.36 kB │ gzip:     9.95 kB
dist/assets/GovernanceCenterPage-BtJijUTy.js                41.78 kB │ gzip:     9.88 kB
dist/assets/TimePage-C2BnSNXw.js                            42.36 kB │ gzip:    11.07 kB
dist/assets/SystemCenterPage-D9m6n2yD.js                    43.89 kB │ gzip:    10.02 kB
dist/assets/telemetryEngine-Cd2fTYVO.js                     56.32 kB │ gzip:    16.61 kB
dist/assets/validation-D4ZC7LYL.js                          69.48 kB │ gzip:    18.87 kB
dist/assets/i18n-jjj6gbc-.js                                72.13 kB │ gzip:    24.17 kB
dist/assets/main-UxdRKuL4.js                                77.01 kB │ gzip:    22.43 kB
dist/assets/chrono-BOU3IMM7.js                             184.96 kB │ gzip:    55.84 kB
dist/assets/ai-transformers-BbHON6kw.js                    202.70 kB │ gzip:    56.91 kB
dist/assets/vendor-onnx-DvOc_54P.js                        544.95 kB │ gzip:   130.28 kB
dist/assets/vendor-D-qmPSyW.js                             961.79 kB │ gzip:   314.06 kB
dist/assets/core-runtime-DFc4JJqx.js                     5,344.59 kB │ gzip: 1,861.36 kB
✓ built in 17.47s
✅ Workbox: 69 files precached (3426.04 KB)

✨ [vite-plugin-compression]:algorithm=gzip - compressed file successfully: 
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/.vite/manifest.json.gz                                  30.07kb / gzip: 2.91kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ConfigurationHub-Dh1MIdLT.js.gz                  33.78kb / gzip: 8.56kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/GovernanceCenterPage-BtJijUTy.js.gz              40.80kb / gzip: 9.61kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/DevPage-neKzMDKH.js.gz                           28.69kb / gzip: 7.84kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/LiveDebuggerEngine-dI7mFowg.js.gz                10.97kb / gzip: 3.79kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/OrchestrationIntelligenceCenter-3o3oFZAy.js.gz   13.49kb / gzip: 3.39kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/SingularityMonitor-BcDv8za2.js.gz                10.97kb / gzip: 2.80kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/MemoryTreeViewer-CCVkUWCQ.js.gz                  17.90kb / gzip: 4.77kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/RealityCenter-CvLdQiXq.js.gz                     10.13kb / gzip: 2.54kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/OrchestrationMetaCenter-BmPmXpX3.js.gz           17.51kb / gzip: 4.29kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/UltimateOptimizationDashboard-D82iZZCe.js.gz     11.22kb / gzip: 3.14kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/TotalDevPage-C7PmPr5b.js.gz                      18.57kb / gzip: 5.76kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/VocalDevConsoleEngine-CNoVWP52.js.gz             10.22kb / gzip: 3.43kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/d3-tree-BgEqgDEC.js.gz                           14.14kb / gzip: 4.19kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/TimePage-C2BnSNXw.js.gz                          41.36kb / gzip: 10.78kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/SystemCenterPage-D9m6n2yD.js.gz                  42.87kb / gzip: 9.74kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/index-Dq2AABrs.js.gz                             17.68kb / gzip: 5.24kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/index-D8HNVdEh.js.gz                             35.77kb / gzip: 7.76kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/index-lJlX065n.js.gz                             30.06kb / gzip: 7.28kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/motion-AkM2Fd2a.js.gz                            31.47kb / gzip: 10.88kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/tauri-vendor-KyqfgcBs.js.gz                      34.87kb / gzip: 7.80kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-audio-DXTHMCVB.js.gz                          18.48kb / gzip: 5.15kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-memory-evolution-DOgi8nxF.js.gz               11.97kb / gzip: 3.41kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-dev-BEYrrEbC.js.gz                            11.03kb / gzip: 3.14kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-hyper-CejMmDsf.js.gz                          15.29kb / gzip: 4.90kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-quantum-GlNyzLg9.js.gz                        17.35kb / gzip: 3.65kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/web-vitals-J_E3b7Hg.js.gz                        12.30kb / gzip: 3.76kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-optimization-DnbA3H64.js.gz                   37.46kb / gzip: 9.70kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/index.html.gz                                           11.57kb / gzip: 3.99kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/sw.js.gz                                                15.48kb / gzip: 3.60kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/i18n-jjj6gbc-.js.gz                              70.44kb / gzip: 23.59kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/main-UxdRKuL4.js.gz                              75.21kb / gzip: 21.86kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/telemetryEngine-Cd2fTYVO.js.gz                   55.00kb / gzip: 16.20kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/validation-D4ZC7LYL.js.gz                        67.85kb / gzip: 18.39kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ai-transformers-BbHON6kw.js.gz                   197.95kb / gzip: 55.48kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/chrono-BOU3IMM7.js.gz                            180.63kb / gzip: 54.41kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/style-i_Gs1SpC.css.gz                            556.64kb / gzip: 89.85kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/vendor-onnx-DvOc_54P.js.gz                       532.17kb / gzip: 126.75kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/stats.html.gz                                           2064.42kb / gzip: 213.20kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/vendor-D-qmPSyW.js.gz                            939.25kb / gzip: 306.19kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/core-runtime-DFc4JJqx.js.gz                      5219.33kb / gzip: 1816.53kb



✨ [vite-plugin-compression]:algorithm=brotliCompress - compressed file successfully: 
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/DevPage-neKzMDKH.js.br                           28.69kb / brotliCompress: 6.93kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/.vite/manifest.json.br                                  30.07kb / brotliCompress: 2.50kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ConfigurationHub-Dh1MIdLT.js.br                  33.78kb / brotliCompress: 7.61kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/LiveDebuggerEngine-dI7mFowg.js.br                10.97kb / brotliCompress: 3.39kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/GovernanceCenterPage-BtJijUTy.js.br              40.80kb / brotliCompress: 8.54kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/MemoryTreeViewer-CCVkUWCQ.js.br                  17.90kb / brotliCompress: 4.28kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/OrchestrationIntelligenceCenter-3o3oFZAy.js.br   13.49kb / brotliCompress: 3.00kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/RealityCenter-CvLdQiXq.js.br                     10.13kb / brotliCompress: 2.22kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/SingularityMonitor-BcDv8za2.js.br                10.97kb / brotliCompress: 2.46kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/OrchestrationMetaCenter-BmPmXpX3.js.br           17.51kb / brotliCompress: 3.83kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/TotalDevPage-C7PmPr5b.js.br                      18.57kb / brotliCompress: 5.13kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/UltimateOptimizationDashboard-D82iZZCe.js.br     11.22kb / brotliCompress: 2.81kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/VocalDevConsoleEngine-CNoVWP52.js.br             10.22kb / brotliCompress: 3.10kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/TimePage-C2BnSNXw.js.br                          41.36kb / brotliCompress: 9.60kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/d3-tree-BgEqgDEC.js.br                           14.14kb / brotliCompress: 3.78kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/index-Dq2AABrs.js.br                             17.68kb / brotliCompress: 4.63kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/SystemCenterPage-D9m6n2yD.js.br                  42.87kb / brotliCompress: 8.56kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/index-D8HNVdEh.js.br                             35.77kb / brotliCompress: 6.93kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/index-lJlX065n.js.br                             30.06kb / brotliCompress: 6.45kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/motion-AkM2Fd2a.js.br                            31.47kb / brotliCompress: 9.84kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/tauri-vendor-KyqfgcBs.js.br                      34.87kb / brotliCompress: 6.95kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-dev-BEYrrEbC.js.br                            11.03kb / brotliCompress: 2.73kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/telemetryEngine-Cd2fTYVO.js.br                   55.00kb / brotliCompress: 14.15kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-audio-DXTHMCVB.js.br                          18.48kb / brotliCompress: 4.62kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-memory-evolution-DOgi8nxF.js.br               11.97kb / brotliCompress: 3.02kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-hyper-CejMmDsf.js.br                          15.29kb / brotliCompress: 4.32kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-quantum-GlNyzLg9.js.br                        17.35kb / brotliCompress: 3.23kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ui-optimization-DnbA3H64.js.br                   37.46kb / brotliCompress: 8.64kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/web-vitals-J_E3b7Hg.js.br                        12.30kb / brotliCompress: 3.32kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/index.html.br                                           11.57kb / brotliCompress: 3.22kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/sw.js.br                                                15.48kb / brotliCompress: 3.04kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/i18n-jjj6gbc-.js.br                              70.44kb / brotliCompress: 20.92kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/main-UxdRKuL4.js.br                              75.21kb / brotliCompress: 18.98kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/validation-D4ZC7LYL.js.br                        67.85kb / brotliCompress: 16.33kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/ai-transformers-BbHON6kw.js.br                   197.95kb / brotliCompress: 47.55kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/chrono-BOU3IMM7.js.br                            180.63kb / brotliCompress: 46.90kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/style-i_Gs1SpC.css.br                            556.64kb / brotliCompress: 69.26kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/vendor-onnx-DvOc_54P.js.br                       532.17kb / brotliCompress: 99.51kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/vendor-D-qmPSyW.js.br                            939.25kb / brotliCompress: 260.26kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/stats.html.br                                           2064.42kb / brotliCompress: 144.89kb
dist//home/titane-os/Documents/GitHub/TITANE_INFINITY/assets/core-runtime-DFc4JJqx.js.br                      5219.33kb / brotliCompress: 1397.30kb



> titane-infinity@33.0.15 postbuild /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/post-build.sh


🔄 Post-Build: Mise à jour automatique de l'icône desktop...

[0;34m╔═══════════════════════════════════════════════════════════════╗[0m
[0;34m║        TITANE∞ - Desktop Icon Auto-Update                    ║[0m
[0;34m╚═══════════════════════════════════════════════════════════════╝[0m

[1;33m[1/4][0m Mise à jour du fichier .desktop avec chemins actuels...
      ✓ Binaire installé trouvé (/usr/bin)
[1;33m[2/4][0m Copie du fichier .desktop dans les applications...
      ✓ Fichiers copiés vers:
        - /home/titane-os/.local/share/applications/titane-infinity.desktop
      ✓ Alias obsolète supprimé si présent: /home/titane-os/.local/share/applications/TITANE-Infinity.desktop
      [1;33m⚠ Synchronisation systeme bloquee: sudo non interactif requis[0m
[1;33m[3/4][0m Mise à jour du cache des icônes...
      ✓ Cache des applications mis à jour
      ✓ Cache des icônes GTK mis à jour
[1;33m[4/4][0m Vérification de l'installation...
[0;32m✓ Installation réussie![0m

Détails de l'installation:
  • Fichier .desktop: [0;32m/home/titane-os/.local/share/applications/titane-infinity.desktop[0m
  • Binaire: [0;32m/usr/bin/titane-infinity[0m
  • Icône: [0;32mtitane-infinity[0m
  • Sync système: [0;32mBLOCKED_SUDO_REQUIRED[0m

[0;34mℹ[0m L'application TITANE∞ est maintenant disponible dans votre menu d'applications
[0;34mℹ[0m Vous pouvez la lancer en cherchant 'TITANE' dans le lanceur d'applications

[1;33mNote:[0m L'icône se mettra automatiquement à jour à chaque build.
      Lancez ce script après chaque compilation pour synchroniser.

✅ Post-Build terminé
EXIT:0

### TITANE_PROOF_ARTIFACT=artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl pnpm run verify:backend-proof-depth:strict

> titane-infinity@33.0.15 verify:backend-proof-depth:strict /home/titane-os/Documents/GitHub/TITANE_INFINITY
> node scripts/verify/verify-backend-proof-depth.mjs --strict


=== TITANE Backend Proof-Depth Verifier ===
MODE: --strict (v60+ schema enforcement active)

Validating: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl
Validating: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
Validating: artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl
Validating: artifacts/backend-proof-depth/v61-tier1-blocker-reduction.jsonl
Validating: artifacts/backend-proof-depth/v62-tauri-ipc-probe-bridge.jsonl
Validating: artifacts/backend-proof-depth/v62-tauri-ipc-response.jsonl
Validating: artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl

--- Proof Level Distribution ---

artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl (492 records):
  ✓ DEGRADED_WITH_UI_PROOF: 17
  ✓ GUARDED_WITH_UI_PROOF: 30
  ✓ PROOF_DEPTH_BLOCKED_BY_RUNTIME: 272
  ✓ PROOF_DEPTH_DEGRADED_VISIBLE: 39
  ✓ PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED: 45
  ✓ PROOF_DEPTH_GUARDED_ONLY: 51
  ✓ SANDBOXED_MUTATION_PROVEN: 6
  ✓ UI_REFLECTS_BACKEND_RESULT: 32

artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl (224 records):
  ✓ PROOF_DEPTH_BLOCKED_BY_RUNTIME: 135
  ✓ PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED: 20
  ✓ PROOF_DEPTH_GUARDED_ONLY: 34
  ✓ UI_REFLECTS_BACKEND_RESULT: 35

artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl (53 records):
  ✓ PROOF_DEPTH_BLOCKED_BY_RUNTIME: 25
  ✓ PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED: 7
  ✓ PROOF_DEPTH_GUARDED_ONLY: 8
  ✓ SANDBOXED_MUTATION_PROVEN: 1
  ✓ UI_REFLECTS_BACKEND_RESULT: 12

artifacts/backend-proof-depth/v61-tier1-blocker-reduction.jsonl (18 records):
  ✓ DEGRADED_WITH_UI_PROOF: 5
  ✓ GUARDED_WITH_UI_PROOF: 10
  ✓ PROOF_DEPTH_BLOCKED_BY_RUNTIME: 2
  ✓ SANDBOXED_MUTATION_PROVEN: 1

artifacts/backend-proof-depth/v62-tauri-ipc-probe-bridge.jsonl (11 records):
  ✓ IPC_BRIDGE_REGISTERED: 6
  ✓ IPC_RESPONSE_PROVEN: 3
  ✓ PROOF_DEPTH_BLOCKED_BY_RUNTIME: 2

artifacts/backend-proof-depth/v62-tauri-ipc-response.jsonl (18 records):
  ✓ IPC_RESPONSE_PROVEN: 14
  ✓ PROOF_DEPTH_BLOCKED_BY_MISSING_SAFE_COMMAND: 3
  ✓ PROOF_DEPTH_BLOCKED_BY_RUNTIME: 1

artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl (20 records):
  ✓ IPC_RESPONSE_PROVEN: 20

--- Verification Summary ---
PASS: Artifact exists with 492 records: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl
PASS: All 492 records parse cleanly: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl
PASS: Artifact exists with 224 records: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
PASS: All 224 records parse cleanly: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
PASS: Artifact exists with 53 records: artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl
PASS: All 53 records parse cleanly: artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl
PASS: Artifact exists with 18 records: artifacts/backend-proof-depth/v61-tier1-blocker-reduction.jsonl
PASS: All 18 records parse cleanly: artifacts/backend-proof-depth/v61-tier1-blocker-reduction.jsonl
PASS: Artifact exists with 11 records: artifacts/backend-proof-depth/v62-tauri-ipc-probe-bridge.jsonl
PASS: All 11 records parse cleanly: artifacts/backend-proof-depth/v62-tauri-ipc-probe-bridge.jsonl
PASS: Artifact exists with 18 records: artifacts/backend-proof-depth/v62-tauri-ipc-response.jsonl
PASS: All 18 records parse cleanly: artifacts/backend-proof-depth/v62-tauri-ipc-response.jsonl
PASS: Artifact exists with 20 records: artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl
PASS: All 20 records parse cleanly: artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L1: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L2: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L3: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L4: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L5: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L6: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L7: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L8: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L9: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L10: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L11: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L12: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L13: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L14: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L15: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L16: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L17: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L18: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L19: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L20: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L21: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L22: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L23: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L24: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L25: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L26: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L27: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L28: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L29: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L30: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L31: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L32: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L33: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L34: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L35: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L36: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L37: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L38: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L39: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L40: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L41: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L42: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L43: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L44: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L45: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L46: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L47: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L48: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L49: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L50: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L51: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L52: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L53: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L54: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L55: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L56: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L57: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L58: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L59: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L60: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L61: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L62: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L63: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L64: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L65: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L66: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L67: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L68: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L69: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L70: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L71: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L72: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L73: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L74: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L75: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L76: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L77: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L78: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L79: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L80: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L81: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L82: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L83: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L84: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L85: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L86: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L87: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L88: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L89: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L90: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L91: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L92: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L93: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L94: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L95: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L96: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L97: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L98: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L99: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L100: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L101: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L102: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L103: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L104: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L105: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L106: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L107: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L108: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L109: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L110: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L111: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L112: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L113: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L114: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L115: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L116: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L117: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L118: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L119: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L120: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L121: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L122: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L123: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L124: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L125: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L126: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L127: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L128: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L129: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L130: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L131: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L132: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L133: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L134: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L135: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L136: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L137: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L138: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L139: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L140: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L141: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L142: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L143: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L144: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L145: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L146: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L147: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L148: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L149: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L150: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L151: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L152: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L153: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L154: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L155: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L156: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L157: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L158: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L159: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L160: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L161: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L162: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L163: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L164: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L165: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L166: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L167: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L168: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L169: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L170: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L171: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L172: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L173: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L174: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L175: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L176: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L177: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L178: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L179: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L180: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L181: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L182: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L183: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L184: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L185: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L186: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L187: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L188: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L189: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L190: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L191: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L192: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L193: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L194: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L195: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L196: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L197: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L198: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L199: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L200: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L201: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L202: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L203: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L204: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L276: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L277: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L278: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L279: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L280: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L281: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L282: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L283: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L284: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L285: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L286: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L287: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L288: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L289: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L290: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L291: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L292: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L293: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L294: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L295: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L296: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L297: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L338: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L339: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L340: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L341: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L342: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L343: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L344: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L345: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L346: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L347: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L348: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L349: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L350: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L351: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L352: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L353: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L372: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L373: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L374: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L375: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L376: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L377: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L378: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L379: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L380: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L381: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L382: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L383: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L384: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L385: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L386: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L387: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L388: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L389: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L390: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L391: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L392: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L393: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L394: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L395: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L396: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L397: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L398: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L399: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L400: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L401: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L402: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L403: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L404: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L405: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L406: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L407: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L408: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L409: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L410: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L411: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L412: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L413: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L414: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L415: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L416: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L417: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L418: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L419: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L420: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl:L421: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L10: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L11: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L17: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L29: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L40: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L41: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L47: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L49: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L50: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L52: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L61: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L62: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L63: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L64: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L65: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L70: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L82: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L93: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L94: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L100: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L102: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L103: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L105: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L114: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L115: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L116: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L117: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L118: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L123: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L135: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L141: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L143: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L144: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L146: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L155: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L156: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L157: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L158: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L159: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L169: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L170: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L176: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L188: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L199: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L200: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L206: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L208: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L209: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L211: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L220: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L221: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L222: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L223: missing sourceSpec — recommended for traceability
WARN: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl:L224: missing sourceSpec — recommended for traceability

PASS: 14 | WARN: 346 | FAIL: 0

✅ VERDICT: PASS

EXIT:0

