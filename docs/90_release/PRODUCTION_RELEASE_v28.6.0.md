# TITANE∞ v28.6.0 — Production Release

**Seal date:** 2026-03-21T14:39:10Z  
**Session:** LOCAL_FINAL_SEAL_2026-03-21_1035_0f348f8e2  
**Git SHA (build):** b93675c91  
**Governance tokens:** GO_FOR_PROD_BUILD__TITANE_INFINITY + GO_FOR_PROD_DEPLOY__TITANE_INFINITY  
**Final verdict:** SEALED

---

## Changes since v28.5.0

- `fix(provider)`: circuit breaker deadlock resolved
- `feat(build)`: Vite 8.0.1 + rolldown (zero config changes)
- `chore(deps)`: vitest 4.1, storybook 10.3, jsdom 29, eslint 9.39.4
- `chore(deps)`: @vitejs/plugin-react 5.2.0

## Gate results at seal

| Gate | Status |
|------|--------|
| tsc --noEmit | PASS |
| eslint | PASS |
| vitest 3399/3399 | PASS |
| pnpm build (rolldown) | PASS |
| cargo check | PASS |
| verify_instructions PASS=20/0 | PASS |
| detect_recurrence G_AH_RECURRENCE_GUARD | PASS |

## Artifacts

| Artifact | SHA256 |
|----------|--------|
| TITANE-Infinity_28.6.0_amd64.AppImage | `27692dd09bc0024982eb86c6dd2588cd01390a5e0870ac64a401ecdaa0b619c2` |
| TITANE-Infinity_28.6.0_amd64.deb | `8a6723ee1910f295841a3c6a1c0069c350e857a98c002bf6e478fc94015b539c` |
| TITANE-Infinity-28.6.0-1.x86_64.rpm | `24a15654ed8403055d5c01b4adc03f7ce4405ee280732561aa4c4e8352daf01c` |

AppImage path: `src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage`  
Deployment copy: `deployment/latest/TITANE-Infinity_28.6.0_amd64.AppImage`

## Known non-blockers at seal

- ESLint 10: `PEER_BLOCKED` — `eslint-plugin-react` caps at `^9.7`. Upstream constraint, no fix available.
- `cargo test --release`: linker failure (`tauri_plugin_dialog`). Production binary unaffected; use `cargo test --lib`.
- `src-tauri/src/ollama.rs`: orphaned dead file (`#[allow(dead_code)]`). Not in module tree.

## Rollback

```
git revert HEAD
gh release delete v28.6.0 --repo KallokTherok1994/TITANE_INFINITY --yes
```

## Proof pack

`proof_packs/PREPROD_LOCAL_FINAL_GATE_2026-03-21_1500_2f9461f90/` — 15 files, STABLE  
`proof_packs/POST_PROD_CANON_LOCK_2026-03-21_1518_9f905f7a5/` — 13 files, SEALED  
`proof_packs/POST_SEALED_FREEZE_GUARD_2026-03-21_1527_2081cc719/` — 12 files, SEALED_GUARD_CONFIRMED  
`proof_packs/POST_SEALED_SENTINEL_2026-03-21_1538_fb1e67a88/` — 11 files, SEALED_SENTINEL_CLEAR  

## GitHub release

<https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v28.6.0>
