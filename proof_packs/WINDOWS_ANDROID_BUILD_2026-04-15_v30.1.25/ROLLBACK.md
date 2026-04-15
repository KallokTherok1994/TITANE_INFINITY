# ROLLBACK

1. Restore the version surfaces if v30.1.25 should not remain the active working version:
   `git restore -- package.json runtime/stable/manifest.json runtime/stable/tauri.conf.json src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/tauri.base.json src-tauri/tauri.conf.json tauri.base.json RELEASE_SURFACE_INVENTORY.md scripts/autoheal/autoheal_rules.jsonl`
2. Remove the report and proof pack if this build qualification session is intentionally discarded before commit:
   `rm -rf proof_packs/WINDOWS_ANDROID_BUILD_2026-04-15_v30.1.25 reports/WINDOWS_ANDROID_BUILD_2026-04-15_v30.1.25.md`
3. Stop the still-attached Android build terminal if it remains active after review.