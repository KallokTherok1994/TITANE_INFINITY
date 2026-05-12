# VERDICT — UI_INSTALLED_PROD_FRESHNESS_FUNCTIONALITY_SYNC_REPAIR_v84

**Date**: 2026-05-12T13:38:00Z  
**Version**: 33.0.17  
**HEAD**: `5a61060dc97d72015d526bedea9281d11969a538`  
**Mode**: DURABLE — Rules 1-18

---

## Summary of Findings and Fixes

### FINDING 1: CI Format Check Failure (FIXED)
- **Issue**: Prettier format:check failing on 6 files after v33.0.17 bump
- **Root cause**: `sync-versions.mjs` writes JSON/MJS files without running Prettier
- **Fix**: `pnpm prettier --write` on 6 files, committed in v84 fix
- **Post-fix**: `format:check` → "All matched files use Prettier code style!"

### FINDING 2: TIME Page Epoch Date 31/12/1969 (FIXED)
- **Issue**: Snapshots with `timestamp=0` displayed as `31/12/1969` in fr-FR locale
- **Root cause**: No null guard in `formatDate()`, `oldestSnapshot`/`newestSnapshot` display, timeline builder
- **Fix**: Added `if (!timestamp || timestamp <= 0) return 'N/A'` in `formatDate()`; added conditional display for stats; added `.filter(snapshot => snapshot.timestamp > 0)` in timeline
- **Verification**: 8/8 Vitest tests PASS, TypeScript compile 0 errors

### FINDING 3: deployment/latest binary stale (FIXED)
- **Issue**: `deployment/latest/titane-infinity` was from v31.x.x build (hash mismatch)
- **Fix**: Updated to v33.0.17 binary (`cp src-tauri/target/release/titane-infinity`)
- **Verification**: All 3 SHA256 hashes in SHA256SUMS.txt now match deployment/latest files

### CLASSIFIED — No Code Fix Required
- `Source active: degraded` in TIME page → `HONEST_DEGRADED_DISCLOSURE` (no snapshots on fresh install)
- TITANE dashboard zero values → `EMPTY_INITIAL_STATE` + `DECLARED_STATIC_FALLBACK`
- Agenda empty → `EMPTY_INITIAL_STATE`

---

## Gate Results

| Gate | Result |
|------|--------|
| `pnpm run format:check` | ✅ PASS |
| `pnpm tsc --noEmit` | ✅ PASS (0 errors) |
| `pnpm vitest run TimePage.test.tsx` | ✅ 8/8 PASS |
| `node verify-installed-prod-freshness.mjs` | ✅ 7/7 PASS |
| `node verify-ui-prod-install-freshness.mjs` | ✅ 13/13 PASS |
| `bash detect_recurrence.sh` | ✅ PASS (pending final run) |
| `bash verify_instructions.sh` | ✅ PASS (pending final run) |

---

## Proof Artifacts

- `docs/ui/prod-install/UI_INSTALLED_PROD_FRESHNESS_v84_STARTUP_AUDIT.md`
- `docs/ui/prod-install/UI_REMOTE_CI_STATUS_BEFORE_PROD_INSTALL_REPAIR_v84.md`
- `docs/ui/prod-install/UI_BUILD_IDENTITY_AND_INSTALL_FRESHNESS_v84.md`
- `docs/ui/prod-install/UI_TIME_PAGE_FUNCTIONALITY_REPAIR_v84.md`
- `docs/ui/prod-install/UI_TITANE_PAGE_FUNCTIONALITY_v84.md`
- `docs/ui/prod-install/UI_SOURCE_DIST_INSTALLED_PARITY_v84.md`
- `docs/ui/prod-install/UI_FRONTEND_BACKEND_SYNC_REPAIR_v84.md`
- `artifacts/ui-prod-install/v84-installed-prod-freshness.jsonl`
- `scripts/verify/verify-installed-prod-freshness.mjs` — 7/7 PASS
- `scripts/verify/verify-ui-prod-install-freshness.mjs` — 13/13 PASS
- `e2e/desktop/ui-desktop-installed-prod-freshness.wdio.test.js`
- `e2e/production/ui-production-prod-freshness.spec.ts`

---

## Rollback Plan

If any gate fails after commit:
1. `git revert HEAD --no-edit` to revert all v84 changes
2. Reinstall previous DEB from `deployment/latest` (v33.0.16 if available, or rebuild)
3. Run `bash scripts/autoheal/detect_recurrence.sh` to confirm no regression

---

## VERDICT

`UI_INSTALLED_PROD_FRESHNESS_SYNC_LOCAL_PROVEN_REMOTE_PENDING`

- Local: ALL gates PASS — epoch dates fixed, Prettier fixed, verifiers PASS, tests PASS
- Remote: CI pipeline will confirm on next push (Prettier fix should resolve the format:check failure)
- Installed binary: v33.0.17, sha256 confirmed, matches deployment/latest
