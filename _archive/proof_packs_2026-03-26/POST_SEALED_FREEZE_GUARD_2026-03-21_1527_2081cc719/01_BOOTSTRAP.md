# Bootstrap

- HEAD: 2081cc719 (MAIN, origin/MAIN) — clean
- Branch: MAIN
- git status: CLEAN (0 dirty files)
- Node v20.20.0 / pnpm 10.30.2 / cargo 1.94.0 / rustc 1.94.0

## Version Authority — All Aligned
| Source | Value |
|--------|-------|
| package.json | 28.6.0 |
| src-tauri/Cargo.toml | 28.6.0 |
| src-tauri/tauri.conf.json | 28.6.0 |
| root README.md | v28.6.0 |
| docs/README.md | v28.6.0 (fixed 9f905f7a5) |
| CHANGELOG.md | [28.6.0] |
| RELEASE_v28.6.0_SEALED.txt | present |

## Sealed Release Authority
- Tokens used: GO_FOR_PROD_BUILD + GO_FOR_PROD_DEPLOY (at 43d74641a)
- Build commit: b93675c91
- AppImage: 88M, present, SHA256 on file
- AutoHeal: 512 entries, append-only

## Post-seal commits (all governance/docs/tests — zero product)
- 2081cc719 proof pack POST_PROD_CANON_LOCK
- 9f905f7a5 fix docs/README.md drift (doc-only)
- 700f0ba92 proof pack Omega runtime recert
- 54478c390 proof pack PREPROD_LOCAL_FINAL_GATE
- 2f9461f90 fix Rust test (test-only)
- 5bd4a6448 docs+registry reconciliation
- d15e2a692 governance: native-binary-policy + README + CHANGELOG

## Real HEAD: 2081cc719
## Real Sealed Authority: RELEASE_v28.6.0_SEALED.txt (tokens b93675c91/43d74641a)
## Real Remaining Risk: MINIMAL — deployment/latest/ lacks v28.6.0 copy (historical, non-blocking)
## Next Action: proof pack → verdict → stop
