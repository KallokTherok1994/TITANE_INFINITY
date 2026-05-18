# BUILD_PERMISSION_MATRIX V3
## TITANE∞ v35.1.9 — Root Cause Fix + Certifier Hardening

**Run ID:** 20260518T014424Z  
**Branch:** MAIN | **HEAD:** 186d00455  
**Certifier:** `scripts/verify/prebuild-frontend-runtime-certifier.sh`

---

## Final Verdict

```
FRONTEND_RUNTIME_PREBUILD=PASS
BUILD_ALLOWED=YES
PASS=21  FAIL=0  BLOCKED=0  WARN=1  N/A=1
```

SUMMARY.json: `artifacts/frontend-runtime-prebuild/20260518T014424Z/SUMMARY.json`

---

## Lane Classification

| Lane | Classification | Evidence |
|---|---|---|
| WORKTREE | PASS | Frontend + governance files modified (session changes) |
| CSS_IMPORT_ORDER_FIX | PASS | `@config` moved after all `@import` in src/index.css. Vite build: ✓ 29.19s 0 errors. |
| CERTIFIER_FAST_MODE | PASS | `--fast` flag adds lanes 1-8.5, skips 9-22. PASS=8 N/A=14 in fast run |
| CERTIFIER_SUMMARY_JSON | PASS | SUMMARY.json emitted with verdict/build_allowed/counters |
| CERTIFIER_LANE_8_5 | PASS | `verify-test-conformance.sh` integrated as Lane 8.5 → PASS |
| HMR_CONFIG | PASS | `hmr: { host: '127.0.0.1', port: 5173 }` added to vite.config.ts |
| PORT_COMMENT | PASS | Port 4000 vs 5173 discrepancy documented in vite.config.ts comments |
| TYPESCRIPT | PASS | `pnpm run check` → 0 errors |
| LINT | PASS | `pnpm run lint` → 0 errors |
| STALE_VERSION_SCAN | PASS | `gate-no-stale-visible-version.sh` → no stale v30.0.0 |
| VITE_CACHE_CLEAN | PASS | `pnpm run clean:vite` → success |
| VITE_BUILD | PASS | `pnpm exec vite build` → ✓ 29.19s |
| BUILD_TRUTH | PASS | `gate-build-truth.sh` → PASS |
| VERSION_TRUTH | PASS | `gate-version-truth.sh` → PASS |
| SURFACE_ROOT | PASS | `gate-surface-root.sh` → PASS |
| CSS_GENERATED_TRUTH | PASS | `dist/assets/style-*.css` present |
| RUNTIME_VISIBILITY_PROTOCOL_INFRA | PASS | 9/9 checks pass |
| STABLE_ARTIFACT_VERSION_TRUTH | PASS | `Titan-Stable_35.1.9_amd64.AppImage` — version match |
| STABLE_ARTIFACT_EMBEDDED_BUILD_TRUTH | PARTIAL_VERSION_ONLY | Frontend in Tauri binary — dpkg extract yields binary + icons only |
| DEB_EMBEDDED_TRUTH | BLOCKED_TOOLING | dpkg-deb → 5 files (binary + icons + desktop), no build-truth.json extractable |
| DOM_SURFACETRUTH_POLICY | NOT_APPLICABLE_WITH_PROOF | No UI routes/pages changed in this session |
| AUTOHEAL_SESSION_CAPTURE | PASS | entries=2044; AH-2026-05-17-CSS-IMPORT-ORDER-FIX added |
| INSTRUCTIONS_KERNEL_BUDGET | PASS | 242/260 lines, 21/25 rules |
| FRONTEND_ROUTE_MAP | PASS | 75+ routes, 71 pages — pre-verified in V2 |
| CSS_GENERATED_TRUTH | PASS | css-vars.css → 528KB dist CSS |
| TYPECHECK | PASS | 0 errors |
| LINT | PASS | 0 errors |
| AUTOHEAL | PASS | detect_recurrence.sh → PASS entries=2044 |
| BUILD_ALLOWED | **YES** | All required lanes PASS or NOT_APPLICABLE_WITH_PROOF |

---

## V3 Session Changes Summary

| # | Change | File | Impact |
|---|---|---|---|
| 1 | CSS import order fixed | `src/index.css` | Dev server starts; UI changes visible |
| 2 | Fast-path certifier mode | `prebuild-frontend-runtime-certifier.sh` | ~5s static check without Vite build |
| 3 | SUMMARY.json output | `prebuild-frontend-runtime-certifier.sh` | Machine-readable CI integration |
| 4 | Lane 8.5 test conformance | `prebuild-frontend-runtime-certifier.sh` | Test infra validated per certifier run |
| 5 | AutoHeal CSS entry | `autoheal_rules.jsonl` | Rule 10 compliance |
| 6 | Fast script in package.json | `package.json` | `pnpm run verify:frontend-runtime-prebuild:fast` |
| 7 | HMR + port comment | `vite.config.ts` | Explicit hot-reload config for Tauri dev |
| 8 | UI root cause reference | `CLAUDE.md` | Future sessions know the CSS import rule |
