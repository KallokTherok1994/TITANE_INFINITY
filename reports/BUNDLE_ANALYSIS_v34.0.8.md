# Bundle Analysis — TITANE∞ v34.0.8 (Phase R)

**Date**: 2026-05-13
**Verdict**: PASS

## Tooling

- Plugin: `rollup-plugin-visualizer@^6.0.5` (already wired in `vite.config.ts`).
- Output: `dist/stats.html` (sunburst, gzip + brotli sizes) generated on every `pnpm run build`.
- New npm script: `pnpm run analyze:bundle` (= `vite build` + pointer to stats.html).
- Compression: Brotli + gzip enabled via `vite-plugin-compression` (threshold 10 KB).

## Top-20 chunks (uncompressed, snapshot v34.0.7 baseline)

| Rank | Chunk | Size | Notes |
| ---: | --- | ---: | --- |
| 1 | `core-runtime-*.js` | 5.2 MB | Ring 0+3 orchestration core |
| 2 | `vendor-*.js` | 940 KB | React + Zustand + libs |
| 3 | `vendor-onnx-*.js` | 533 KB | ONNX runtime (lazy load candidate) |
| 4 | `ai-transformers-*.js` | 198 KB | transformers.js |
| 5 | `chrono-*.js` | 181 KB | natural-language date parser |
| 6 | `main-*.js` | 76 KB | App bootstrap |
| 7 | `i18n-*.js` | 71 KB | i18next + locales (already lazy) |
| 8 | `validation-*.js` | 68 KB | zod + helpers |
| 9 | `telemetryEngine-*.js` | 55 KB | telemetry pipeline |
| 10 | `SystemCenterPage-*.js` | 43 KB | page bundle |
| 11 | `TimePage-*.js` | 42 KB | page bundle |
| 12 | `GovernanceCenterPage-*.js` | 41 KB | page bundle |
| 13 | `ui-optimization-*.js` | 38 KB | UI optimizer hooks |
| 14 | `index-*.js` | 36 KB | route index |
| 15 | `tauri-vendor-*.js` | 35 KB | Tauri API binding |
| 16 | `ConfigurationHub-*.js` | 34 KB | page bundle |
| 17 | `motion-*.js` | 32 KB | framer-motion |
| 18 | `DevPage-*.js` | 29 KB | page bundle |
| 19 | `TotalDevPage-*.js` | 19 KB | page bundle |
| 20 | `ui-audio-*.js` | 19 KB | audio engine UI |

## React.memo coverage (Phase R)

Applied `React.memo()` to 7 hot stable display components:

1. `src/components/AgentDashboardsPanel.tsx`
2. `src/services/monitoring/MonitoringDashboard.tsx`
3. `src/services/diagnostic/DiagnosticDashboard.tsx`
4. `src/services/explainability/ExplainabilityDashboard.tsx`
5. `src/services/orchestrator/OrchestratorDashboard.tsx`
6. `src/services/security_active/SecurityDashboard.tsx`
7. `src/services/log_analysis/LogAnalysisDashboard.tsx`

These components host the 6 advanced agent dashboards and the panel that
aggregates them. They re-rendered on every parent state change despite
internal `useState` already deduplicating their data. With `React.memo`,
parent-driven re-renders no longer cascade.

Scope is intentionally narrow (Option A in plan v34.0.8) to minimize
regression risk. Future cycles can extend memoization to AppShell, Header,
and runtime indicators after measurement.

## Debt / Follow-up

- `core-runtime-*.js` (5.2 MB) and `vendor-onnx-*.js` (533 KB) are the
  primary candidates for further code-splitting. Defer to a dedicated
  bundle-reduction cycle.
- `chrono-*.js` (181 KB) only consumed by TimePage; investigate dynamic
  import.

## Verification

```bash
pnpm run analyze:bundle
# Then open dist/stats.html in a browser for interactive sunburst.
```

## Rollback

```bash
# Revert React.memo wrappers (7 files):
git restore -- \
  src/components/AgentDashboardsPanel.tsx \
  src/services/monitoring/MonitoringDashboard.tsx \
  src/services/diagnostic/DiagnosticDashboard.tsx \
  src/services/explainability/ExplainabilityDashboard.tsx \
  src/services/orchestrator/OrchestratorDashboard.tsx \
  src/services/security_active/SecurityDashboard.tsx \
  src/services/log_analysis/LogAnalysisDashboard.tsx \
  package.json
```
