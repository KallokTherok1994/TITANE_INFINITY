## Rollback

If the 31.0.3 desktop publication needs to be reverted:

1. Restore release surfaces from git:
   git restore -- package.json runtime/stable/manifest.json runtime/stable/tauri.conf.json src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/tauri.base.json src-tauri/tauri.conf.json tauri.base.json deployment/latest/MANIFEST.json deployment/latest/CHECKSUMS.sha256 deployment/latest/CHECKSUMS.txt deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt RELEASE_SURFACE_INVENTORY.md reports/BUILD_ALL_2026-04-19_v31.0.3_DESKTOP.md proof_packs/BUILD_ALL_2026-04-19_v31.0.3_DESKTOP/GATE_REPORT.md proof_packs/BUILD_ALL_2026-04-19_v31.0.3_DESKTOP/VERDICT.md proof_packs/BUILD_ALL_2026-04-19_v31.0.3_DESKTOP/ROLLBACK.md scripts/autoheal/autoheal_rules.jsonl
2. Remove copied 31.0.3 deployment artifacts if they should no longer be published locally:
   rm -f deployment/latest/'TITANE Infinity_31.0.3_amd64.AppImage' deployment/latest/'TITANE Infinity_31.0.3_amd64.deb' deployment/latest/'TITANE Infinity-31.0.3-1.x86_64.rpm' deployment/latest/titane-infinity
3. Re-run publication validators:
   bash scripts/autoheal/detect_recurrence.sh
   bash scripts/verify_instructions.sh