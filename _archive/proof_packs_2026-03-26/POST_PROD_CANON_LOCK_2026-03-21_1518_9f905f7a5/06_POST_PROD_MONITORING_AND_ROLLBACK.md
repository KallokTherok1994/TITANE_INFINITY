# Post-Prod Monitoring and Rollback

## Rollback Commands

### This session's doc patch
git revert 9f905f7a5 --no-edit
git push origin MAIN

### Full v28.6.0 release rollback
git revert 9f905f7a5 2f9461f90 5bd4a6448 d15e2a692 --no-edit  # post-seal governance
# If reverting the release itself:
git revert 43d74641a b93675c91 --no-edit
gh release delete v28.6.0 --repo KallokTherok1994/TITANE_INFINITY --yes

### Rollback binary
Previous stable: deployment/latest/TITANE-Infinity_28.5.0_amd64.AppImage (90M, 2026-03-20)

## Artifact Locations
- Canonical AppImage: src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage
- Canonical .deb: src-tauri/target/release/bundle/deb/TITANE-Infinity_28.6.0_amd64.deb
- Checksum reference: RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt
- Release seal: RELEASE_v28.6.0_SEALED.txt

## Available Monitoring / Verification Scripts
| Script | Purpose |
|--------|---------|
| bash scripts/verify/verify-native-binary-freshness.sh | Confirm binary freshness |
| bash scripts/verify_instructions.sh | Governance layer (PASS=20/0) |
| bash scripts/autoheal/detect_recurrence.sh | AutoHeal recurrence guard |
| bash scripts/verify/smoke_boot.sh | Boot smoke check |
| bash scripts/verify/verify-seal-post-certification.sh | Post-cert seal check |
| sha256sum src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage | Artifact integrity |
| cargo test --lib (src-tauri/) | Rust unit tests (4463 PASS) |
| pnpm test | Frontend tests (3399 PASS) |

## Monitoring Gap
- No automated post-deploy health check running continuously. Manual verification required.
- No GitHub Actions smoke test triggered on prod binary. Classification: SHOULD_FIX_NEXT_CYCLE.
- Desktop E2E requires Ollama running locally. Not automated in CI. Classification: NON_BLOCKING_MONITOR.
