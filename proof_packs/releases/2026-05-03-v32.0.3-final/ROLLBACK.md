# ROLLBACK

If release v32.0.3 must be reverted quickly:

1. Restore version metadata and release surfaces from git:

```bash
git restore -- package.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json src-tauri/tauri.base.json runtime/stable/manifest.json runtime/stable/tauri.conf.json tauri.base.json
git restore -- deployment/latest/VERSION.txt deployment/latest/MANIFEST.json deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt RELEASE_ARTIFACTS_CHECKSUMS_32.0.3.txt RELEASE_SURFACE_INVENTORY.md
```

2. Restore proof artifacts and AutoHeal entry if rollback invalidates this release:

```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
rm -rf proof_packs/releases/2026-05-03-v32.0.3-final reports/release/release-v32.0.3-final-2026-05-03.md
```

3. Re-run baseline guards:

```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

4. If system package had been installed before rollback:

```bash
sudo dpkg -r titane-infinity || true
sudo apt-get install -f -y || true
```
