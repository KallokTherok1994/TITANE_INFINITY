# TITANE∞ v28.7.0 — Production Release

**Seal date:** 2026-03-21T16:46:00Z  
**Session:** V28_7_0_GOVERNANCE_STABILITY_2026-03-21  
**Git SHA (build):** ac0b7ffc3  
**Governance tokens:** GO_FOR_PROD_BUILD__TITANE_INFINITY + GO_FOR_PROD_DEPLOY__TITANE_INFINITY  
**Final verdict:** SEALED / SEALED_SENTINEL_CLEAR

---

## Changes since v28.6.0

- `test(design-center)`: add `afterEach` DOM cleanup for parallel-suite test isolation
- `chore(deployment)`: copy v28.6.0 AppImage to `deployment/latest/` (staging sync)
- `docs(90_release)`: create `PRODUCTION_RELEASE_v28.6.0.md` canonical release doc
- `chore(version)`: bump 28.6.0 → 28.7.0

## Gate results at seal

| Gate | Status |
|------|--------|
| tsc --noEmit | PASS |
| eslint | PASS |
| vitest 3399/3399 | PASS |
| cargo test --lib 4463/4463 | PASS |
| G_NATIVE_BINARY_FRESHNESS | PASS (FRESH_RELEASE_BINARY) |
| verify_instructions PASS=20/0 | PASS |
| detect_recurrence G_AH_RECURRENCE_GUARD (515) | PASS |

## Artifacts

| Artifact | SHA256 |
|----------|--------|
| TITANE-Infinity_28.7.0_amd64.AppImage | `950c8beb7c4bb170e369c4fa1f26e5566ca88bf6438c86f5317ff6bc66655b45` |
| TITANE-Infinity_28.7.0_amd64.deb | `52695b634b54caf2a72419d8a250c85595d29a032260b923a261f62442ea79af` |
| TITANE-Infinity-28.7.0-1.x86_64.rpm | `72377fb5684690df9071f0cf5279a3e7537cd28eaa816954b75a9cf73f90bbe6` |

AppImage path: `src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.7.0_amd64.AppImage`

## Known non-blockers at seal

- ESLint 10: `PEER_BLOCKED` — `eslint-plugin-react` caps at `^9.7`. Upstream constraint.
- `cargo test --release`: linker failure (`tauri_plugin_dialog`). Production binary unaffected.
- `src-tauri/src/ollama.rs`: orphaned dead file. Not in module tree.
- Chat path: PARTIAL_CHAIN (desktop E2E) — browser + API + IPC proven, full desktop E2E x3 pending.

## Rollback

```
git revert HEAD
```

## Proof packs

- `proof_packs/V28_7_0_GOVERNANCE_STABILITY_2026-03-21_1646_ac0b7ffc3/` — STABLE
- `proof_packs/POST_PROD_CANON_LOCK_28.7.0_2026-03-21_1650_00841c034/` — SEALED
- `proof_packs/POST_SEALED_SENTINEL_28.7.0_2026-03-21_1655_9cce755f3/` — SEALED_SENTINEL_CLEAR
