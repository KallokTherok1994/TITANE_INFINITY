# Frozen Boundary Map

## A. FROZEN_PRODUCT (do not touch)
| Item | Location | Status |
|------|----------|--------|
| Release binary | src-tauri/target/release/titane-infinity (40M) | FROZEN |
| AppImage v28.6.0 | src-tauri/target/release/bundle/appimage/ (88M) | FROZEN |
| .deb v28.6.0 | src-tauri/target/release/bundle/deb/ (18M) | FROZEN |
| Checksums | RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt | FROZEN |
| Sealed release doc | RELEASE_v28.6.0_SEALED.txt | FROZEN |
| Version authority | package.json, Cargo.toml, tauri.conf.json at 28.6.0 | FROZEN |
| IPC contract | { ok, content, error } in src-tauri/src/ | FROZEN |
| All src/ product code | src/components, src/pages, src/hooks, src/services | FROZEN |
| All src-tauri/src/ code | Rust commands, IPC, OllamaClient | FROZEN |
| Routes | App.tsx route table | FROZEN |
| UI surfaces | All sealed surfaces at sealed commit | FROZEN |

## B. FROZEN_DOC_CANON (verified aligned, no further changes needed)
| Item | Status |
|------|--------|
| root README.md | FROZEN at v28.6.0 |
| docs/README.md | FROZEN at v28.6.0 (patched 9f905f7a5) |
| CHANGELOG.md | FROZEN — [28.6.0] entry present |
| RELEASE_v28.6.0_SEALED.txt | FROZEN |
| RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt | FROZEN |
| registry/ui-events.jsonl | FROZEN (append-only, last event = PROD_RELEASE v28.6.0) |
| Proof packs | FROZEN — append-only historical record |

## C. NON_FROZEN_BUT_ALLOWED (safe to add without reopening product)
- Monitoring notes / observations
- Next-cycle debt register entries
- Historical artifact copies (deployment/latest/)
- Future release prep skeleton (only if clearly labelled)
- AutoHeal entries for newly discovered (non-product) patterns

## D. FORBIDDEN_POST_SEALED (hard stop)
- Any change to src/, src-tauri/src/, e2e/ product specs
- Route changes, IPC changes, UI component changes
- Build/deploy script changes
- Version bumps
- Replacing sealed artifacts without a new governed build
- Silent doc rewrites (rewriting history)
- Any "optimization" without proven production defect
