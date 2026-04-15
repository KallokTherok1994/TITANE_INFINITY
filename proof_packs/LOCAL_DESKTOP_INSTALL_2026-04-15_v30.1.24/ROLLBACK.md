# ROLLBACK

1. Reinstall the previous DEB with `sudo dpkg -i <previous_deb>` if host rollback is required.
2. Re-run `bash scripts/post-build/update-desktop-icons.sh` after reinstall to realign user/system launchers.
3. Restore repository version files if this local install should not remain the active working version:
   `git restore -- package.json runtime/stable/manifest.json runtime/stable/tauri.conf.json src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/tauri.base.json src-tauri/tauri.conf.json tauri.base.json RELEASE_SURFACE_INVENTORY.md scripts/autoheal/autoheal_rules.jsonl`
4. Remove the proof pack/report if this session is intentionally discarded before commit:
   `rm -rf proof_packs/LOCAL_DESKTOP_INSTALL_2026-04-15_v30.1.24 reports/LOCAL_DESKTOP_INSTALL_2026-04-15_v30.1.24.md`
