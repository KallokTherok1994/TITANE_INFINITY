# Fixes Applied — v28.7.0

## FIX-1: DesignCenter.truth-chain.test.tsx — afterEach DOM isolation

**Root cause:** `beforeEach` cleaned DOM state but no `afterEach`. If a test fails mid-way (async timeout under high CPU), CSS custom properties from that test persist into the next test's execution window.

**Patch:**
- Added `afterEach` with `document.documentElement.removeAttribute('class'/'style')` + `vi.clearAllMocks()`
- Also imported `afterEach` from vitest

**File:** `src/features/design-center/__tests__/DesignCenter.truth-chain.test.tsx`

**Verification:** `pnpm exec vitest run src/features/design-center/__tests__/DesignCenter.truth-chain.test.tsx` → 6/6 PASS

---

## FIX-2: deployment/latest/ — v28.6.0 AppImage copy

**Root cause:** Release checklist missing explicit step to copy bundle artifact to `deployment/latest/`.

**Patch:** Copied `TITANE-Infinity_28.6.0_amd64.AppImage` from bundle dir to `deployment/latest/`.

**Verification:** `ls -lh deployment/latest/*.AppImage` → file present (88M, 2026-03-21)

---

## FIX-3: docs/90_release/ — PRODUCTION_RELEASE_v28.6.0.md

**Root cause:** docs/90_release/ pattern not enforced at v28.6.0 seal time. Root `RELEASE_v28.6.0_SEALED.txt` existed but canonical docs/90_release/ doc missing.

**Patch:** Created `docs/90_release/PRODUCTION_RELEASE_v28.6.0.md` with full release details (seal date, SHA, artifacts + checksums, gate results, rollback, proof pack refs).

**Verification:** `ls docs/90_release/ | grep PRODUCTION_RELEASE_v28.6.0` → file present

---

## VERSION BUMP: 28.6.0 → 28.7.0

Files updated:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `README.md`
- `docs/README.md`
- `CHANGELOG.md` — [28.7.0] entry prepended

## AutoHeal entries appended (515 total)

- `AH-2026-03-21-DESIGNCENTER-DOM-BLEED`
- `AH-2026-03-21-DEPLOYMENT-LATEST-MISSING`
- `AH-2026-03-21-DOCS-90-RELEASE-MISSING`
