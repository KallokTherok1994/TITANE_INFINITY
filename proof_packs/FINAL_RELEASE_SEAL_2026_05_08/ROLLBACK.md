# Rollback Plan

If this seal package must be rolled back:

1. Revert governed documentation updates:
   - `git restore -- RELEASE_SURFACE_INVENTORY.md`
   - `git restore -- scripts/autoheal/autoheal_rules.jsonl`
2. Remove this proof pack directory:
   - `rm -rf proof_packs/FINAL_RELEASE_SEAL_2026_05_08`
3. Re-run governance validators:
   - `bash scripts/autoheal/detect_recurrence.sh`
   - `bash scripts/verify_instructions.sh`
4. If package installation was applied with sudo later, restore prior package version explicitly:
   - `sudo dpkg -i <previous titane-infinity_*.deb>`
   - `sudo bash scripts/post-build/update-desktop-icons.sh`
