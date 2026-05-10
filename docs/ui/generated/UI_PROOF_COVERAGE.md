# UI Proof Coverage Report
<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- Source: src/registry/uiSurfaceRegistry.ts -->
<!-- Mission: UI_BACKEND_TRUTH_CERTIFICATION_v46 -->
<!-- Generation date: 2025-07 -->
<!-- Runtime: STATIC_ANALYSIS_ONLY — No Tauri runtime was available during generation -->

> **IMPORTANT**: `LIVE_*` proof lanes require active Tauri runtime to verify.
> All live-proof lanes below are classified as `STATIC_TYPESCRIPT` (type-checked import) only.
> Runtime proof requires Tauri dev build + IPC trace.

## Proof Lane Coverage Matrix

| Route | Static TS | E2E TestId | IPC Contract | Runtime IPC | Verdict |
|---|---|---|---|---|---|
| `/titane` | ✅ | ✅ (`page-titane`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/experience` | ✅ | ✅ (`page-experience`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/time` | ✅ | ✅ (`page-time`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/admin` | ✅ | ✅ (`page-admin`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/dev` | ✅ | ✅ (`page-dev`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/fusion` | ✅ | ✅ (`page-fusion`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/optimization` | ✅ | ✅ (`page-optimization`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/total-dev` | ✅ | ✅ (`page-total-dev`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/orchestration-intelligence` | ✅ | ✅ (`page-orchestration-intelligence`) | ✅ | ✅ SIMULATED | SIMULATED_PROVEN |
| `/orchestration-center` | ✅ | ✅ (`page-orchestration-meta-center`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/reality-center` | ✅ | ✅ (`page-reality-center`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/hyper-center` | ✅ | ✅ (`page-hyper-center`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/quantum-center` | ✅ | ✅ (`page-quantum-center`) | ✅ | ✅ SIMULATED | SIMULATED_PROVEN |
| `/twins` | ✅ | ✅ (`page-twins`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/cloud` | ✅ | ✅ (`page-cloud-center`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/memory` | ✅ | ✅ (`page-memory`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/research` | ✅ | ✅ (`research-page`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/doc-center` | ✅ | ✅ (`doc-center-page`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/singularity` | ✅ | ✅ (`page-singularity-monitor`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/sentinel` | ✅ | ✅ (`page-sentinel`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/watchdog` | ✅ | ✅ (`page-watchdog`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/selfheal` | ✅ | ✅ (`page-selfheal`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/adaptive` | ✅ | ✅ (`page-adaptive-engine`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/skills` | ✅ | ✅ (`page-skills`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/knowledge` | ✅ | ✅ (`page-knowledge`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/creation` | ✅ | ✅ (`page-creation-studio`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/evolution` | ✅ | ✅ (`page-evolution-monitor`) | ✅ | ⬜ pending | STATIC_COMPLETE |
| `/performance` | ✅ | ✅ (`page-performance-test`) | n/a | n/a DISPLAY | DISPLAY_PROVEN |
| `/htf` | ✅ | ⬜ exempt | n/a | n/a | STATIC_ONLY |

## Summary

| Verdict | Count |
|---|---|
| STATIC_COMPLETE | 26 |
| SIMULATED_PROVEN | 2 |
| DISPLAY_PROVEN | 1 |
| STATIC_ONLY (no E2E) | 1 (htf) |
| RUNTIME_PROVEN | 0 (requires Tauri build) |

## Proof Lanes Legend

| Lane | Description |
|---|---|
| Static TS | TypeScript import compiles without errors |
| E2E TestId | `data-testid` exists in component and in uiPages.po.js |
| IPC Contract | Commands declared in `src/lib/security.ts` allowlist |
| Runtime IPC | Live IPC trace from Tauri dev session |

## Next Steps for Runtime Proof

1. Run `pnpm run dev:tauri` in a development session
2. Navigate to each route
3. Capture IPC traces in `logs/ipc-trace-<date>.jsonl`
4. Update `requiredProofLanes` in registry from `STATIC_TYPESCRIPT` to `RUNTIME_IPC`
5. Update verdict column from `STATIC_COMPLETE` to `RUNTIME_PROVEN`
