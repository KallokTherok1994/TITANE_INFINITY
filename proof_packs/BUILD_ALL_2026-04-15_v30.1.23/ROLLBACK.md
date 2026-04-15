# ROLLBACK

1. Restore the release surfaces and version files:
   `git restore -- package.json runtime/stable/manifest.json runtime/stable/tauri.conf.json src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/tauri.base.json src-tauri/tauri.conf.json tauri.base.json deployment/latest/MANIFEST.json deployment/latest/CHECKSUMS.txt deployment/latest/CHECKSUMS.sha256 deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt RELEASE_ARTIFACTS_CHECKSUMS.txt RELEASE_SURFACE_INVENTORY.md scripts/autoheal/autoheal_rules.jsonl`
2. Remove the v30.1.23 proof/report files if rollback occurs before commit:
   `rm -rf proof_packs/BUILD_ALL_2026-04-15_v30.1.23 reports/BUILD_ALL_2026-04-15_v30.1.23.md RELEASE_v30.1.23.md RELEASE_ARTIFACTS_CHECKSUMS_30.1.23.txt`
3. If the host install is later attempted and must be reversed, reinstall the previous DEB and rerun launcher sync.