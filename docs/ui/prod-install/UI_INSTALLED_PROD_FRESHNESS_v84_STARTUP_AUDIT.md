# UI_INSTALLED_PROD_FRESHNESS v84 — Startup Audit

**Session**: MISSION TITANE INSTALLED_PROD_UI_FRESHNESS_FUNCTIONALITY_SYNC_REPAIR_v84  
**Date**: 2026-05-12T13:30:09Z  
**Mode**: DURABLE — full Rule 1-18 discipline

---

## A. Git State

| Field | Value |
|-------|-------|
| HEAD commit | `5a61060dc97d72015d526bedea9281d11969a538` |
| Branch | `MAIN` |
| Behind origin | 0 |
| Ahead origin | 0 |
| Dirty files | `memory/memory_core_state.json` (tracked, runtime mutation) |
| Untracked | `artifacts/ui-visual/screenshots/v78,v80`, `memory/test/` |

## B. Installed System State

| Field | Value |
|-------|-------|
| Installed version | 33.0.17 |
| Binary path | `/usr/bin/titane-infinity` |
| SHA256 (binary) | `13b2e3c33e0c74e4a83f0ba9072e6c91e56395ff58c0c8f107d13127f59730c2` |
| OS | Ubuntu 24.04.4 LTS |
| Node runtime | v24.0.0 |
| dpkg status | `install ok installed` |
| Package version | `33.0.17` (matches source) |

## C. Proof Baseline Files

| File | Status |
|------|--------|
| `artifacts/ui-visual/v80-production-visual-capture.jsonl` | ✅ PRESENT |
| `proof_packs/UI_VISUAL_BROKEN_ROUTES_DESKTOP_GAPS_v80/VERDICT.md` | ✅ PRESENT |
| `docs/ui/visual/UI_VISUAL_FINAL_REMOTE_CI_STATUS_v82.md` | ✅ PRESENT |
| `scripts/verify/verify-ui-visual-capture.mjs` | ✅ PRESENT |
| `e2e/production/ui-production-full-visual-capture.spec.ts` | ✅ PRESENT |
| `e2e/desktop/ui-desktop-installed-full-visual-capture.wdio.test.js` | ✅ PRESENT |
| `src/registry/uiSurfaceRegistry.ts` | ✅ PRESENT |
| `package.json` (version 33.0.17) | ✅ PRESENT |

## D. Deployment/Latest Parity

| Artifact | SHA256 (computed) | SHA256 (manifest) | Match |
|----------|------------------|-------------------|-------|
| AppImage 33.0.17 | `6356181854dbef7b4a29fa...` | `6356181854dbef7b4a29fa...` | ✅ |
| DEB 33.0.17 | `78dbc164aa3c9d7129e7ab...` | `78dbc164aa3c9d7129e7ab...` | ✅ |
| Binary /usr/bin | `13b2e3c33e0c74e4a83f...` | `13b2e3c33e0c74e4a83f...` | ✅ |

**Result**: PARITY CONFIRMED — deployment/latest matches installed binary.

## E. Version Sync Verification

- `package.json` → `33.0.17`
- `src-tauri/Cargo.toml` → `33.0.17`
- `src-tauri/tauri.conf.json` → `33.0.17`
- `index.html` (all 4 strings) → `33.0.17` (sync-versions.mjs section 7 fix committed)
- `deployment/latest/VERSION.txt` → `33.0.17`

**VERDICT**: All version strings aligned. No drift detected.
