# Rollback Plan
Revert tauri config: git restore -- src-tauri/tauri.conf.json
Remove bundles: rm -rf src-tauri/target/release/bundle
Binary rollback: reinstall prior AppImage (bd45feb87 artifacts)
