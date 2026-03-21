# TITANE∞ v28.8.0 — Production Release

**Seal date:** 2026-03-21T17:10:00Z  
**Session:** V28_8_0_GOVERNANCE_2026-03-21  
**Git SHA (build):** 1ce332704  
**Governance tokens:** GO_FOR_PROD_BUILD__TITANE_INFINITY + GO_FOR_PROD_DEPLOY__TITANE_INFINITY  
**Final verdict:** SEALED / SEALED_SENTINEL_CLEAR

---

## Changes since v28.7.0

- `docs(90_release)`: create `PRODUCTION_RELEASE_v28.7.0.md` canonical release doc
- `chore(deployment)`: sync `deployment/latest/` with v28.7.0 AppImage
- `chore(version)`: bump 28.7.0 → 28.8.0

## Gate results at seal

| Gate | Status |
|------|--------|
| tsc --noEmit | PASS |
| eslint | PASS |
| vitest 3399/3399 | PASS |
| cargo test --lib 4463/4463 | PASS |
| G_NATIVE_BINARY_FRESHNESS | PASS (FRESH_RELEASE_BINARY) |
| verify_instructions PASS=20/0 | PASS |
| detect_recurrence G_AH_RECURRENCE_GUARD (516) | PASS |

## Artifacts

| Artifact | SHA256 |
|----------|--------|
| TITANE-Infinity_28.8.0_amd64.AppImage | `70225ec1bcc609a39f7352594e3a00f7c6a3f56c32d07b112f53eddd0f4f8210` |
| TITANE-Infinity_28.8.0_amd64.deb | `bcdd98cd628dc05822cca80be1564859f2355b2ee2e379239552f301431aa25d` |
| TITANE-Infinity-28.8.0-1.x86_64.rpm | `8fe149a8a70dd43bd3001bab0bb6e26c044f02960d192ac453255f59576bfc9d` |

AppImage path: `src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.8.0_amd64.AppImage`

## Known non-blockers at seal

- ESLint 10: `PEER_BLOCKED` — upstream constraint, no fix available.
- `cargo test --release`: linker failure. Production binary unaffected.
- `src-tauri/src/ollama.rs`: orphaned dead file. Not in module tree.
- Chat path: PARTIAL_CHAIN (desktop E2E) — browser + API + IPC proven, full desktop E2E x3 pending.

## Rollback

```
git revert HEAD
```

## Proof packs

- `proof_packs/V28_8_0_GOVERNANCE_2026-03-21_1710_1ce332704/` — STABLE
- `proof_packs/POST_PROD_SEALED_SENTINEL_28.8.0_2026-03-21_0bbad7e8e/` — SEALED_SENTINEL_CLEAR
