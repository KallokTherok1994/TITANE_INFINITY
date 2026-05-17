# Frontend UI Procedure Lock
**Locked at:** 2026-05-17  
**Seal commit:** 0bc6c5433  
**Version:** 35.1.7

This document locks the mandatory UI procedure established by the RUNTIME VISIBILITY ROOT CAUSE SEAL v2. Every visible UI/frontend change to this repo MUST follow this procedure before commit to MAIN.

---

## Locked Procedure (from frontend.instructions.md)

1. **Reproduce runtime truth first** — validate issue on real active surface; distinguish source truth from stale build/runtime truth.
2. **Patch the smallest layout chain** — fix the container/shell; avoid cosmetic-only CSS.
3. **Preserve user-visible truth** — no silent fallback, no hidden error, no fake ready state.
4. **Add or update proof selectors and tests** — unit/Vitest for helpers; E2E for user-facing behaviors.
5. **Update governance artifacts in the same patch** — `UI_SURFACE_MAP.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `registry/ui-events.jsonl`, AutoHeal registry.
6. **Run mandatory validation:**
   - Targeted unit tests
   - Targeted E2E/browser or desktop proof
   - `bash scripts/autoheal/detect_recurrence.sh`
   - `bash scripts/verify_instructions.sh`
   - `bash scripts/verify/verify_frontend_ui_visible_change_protocol.sh`

---

## Locked Runtime Visibility Protocol (Rule 20)

**Every visible UI change must pass this full chain before commit:**

```
source change
→ static tests (TypeScript, ESLint, Vitest)
→ web UI capture (Playwright)
→ pnpm exec vite build
→ gate-build-truth.sh
→ gate-no-stale-visible-version.sh
→ bash runtime/stable/build.sh
→ gate-stable-artifact-freshness.sh
→ gate-stable-launcher-truth.sh (reapply AppImage launcher if overwritten)
→ gate-runtime-identity-truth.sh
→ gate-stable-window-truth.sh
→ SurfaceTruth DOM proof (WDIO e2e/desktop/stable-surface-truth.wdio.test.js)
→ gate-console-runtime-noise.sh
→ screenshot proof (proof_packs/)
→ AutoHeal entry + governance validators
→ commit only after all gates PASS
```

Validator: `bash scripts/verify/verify_frontend_ui_visible_change_protocol.sh`

---

## Hard Rules (Non-Negotiable)

| Rule | Detail |
|------|--------|
| Browser preview ≠ Tauri proof | `http://localhost:1420` proof does NOT substitute for Tauri stable window proof |
| dist/ ≠ embedded binary | Rebuilding Tauri binary is required after every Vite build |
| No stale version strings | Console must never show `v30.0.0`; always use `__APP_VERSION__` |
| Launcher must be repointed | Run `update-desktop-icon.sh` after every stable build |
| No React dev build in stable | `react-dom-client.development.js` in stable artifact = FAIL |
| SurfaceTruth required | Every new canonical surface must expose `data-surface-truth` via SurfaceRoot |

---

## Root Causes Sealed (2026-05-16)

- **RC-1:** 12 stale `v30.0.0` runtime log strings → replaced with `__APP_VERSION__`
- **RC-2:** `conversationStorage` init race → hoisted before `ReactDOM.render`
- **RC-3:** `browser runtime detected` → `TAURI_BOOT_RACE`, classified and documented
- **RC-4:** `react-dom-client.development.js` → browser preview only, not in stable
- **RC-5:** Memory flush noise → downgraded to `logger.debug`

---

## Locked Gate Baseline (v35.1.7)

| Gate | Baseline |
|------|----------|
| gate-build-truth | PASS=8 |
| gate-no-stale-visible-version | PASS |
| gate-runtime-identity-truth | PASS=5 |
| gate-stable-artifact-freshness | PASS=5 |
| gate-stable-launcher-truth | USER_LOCAL_LAUNCHER_FRESH |
| gate-stable-window-truth | STABLE_WINDOW_OBSERVED (title: Titan-Stable v35.1.7) |
| gate-console-runtime-noise | PASS=3 |
| verify_frontend_ui_visible_change_protocol | PASS=9 |
| Vitest | 9514/9514 PASS |
| detect_recurrence + verify_instructions | PASS=57 |

Any regression below this baseline = FAIL → Stop-the-line (Rule 8).
