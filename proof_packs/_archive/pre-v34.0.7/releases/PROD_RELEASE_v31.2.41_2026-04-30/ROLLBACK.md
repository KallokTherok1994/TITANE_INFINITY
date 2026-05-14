# ROLLBACK

```bash
git restore --source=HEAD -- \
  package.json \
  src-tauri/Cargo.toml \
  src-tauri/tauri.conf.json \
  runtime/stable/tauri.conf.json \
  tauri.base.json \
  src-tauri/tauri.base.json \
  runtime/stable/manifest.json \
  deployment/latest/VERSION.txt \
  deployment/latest/MANIFEST.json \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/SIZES.txt \
  deployment/latest/titane-infinity \
  deployment/latest/titane-infinity_31.2.41_amd64.AppImage \
  deployment/latest/titane-infinity_31.2.41_amd64.deb \
  deployment/latest/titane-infinity-31.2.41-1.x86_64.rpm \
  RELEASE_ARTIFACTS_CHECKSUMS_31.2.41.txt \
  RELEASE_SURFACE_INVENTORY.md \
  CHANGELOG.md \
  reports/BUILD_RELEASE_31.2.41_2026-04-30.md \
  proof_packs/releases/PROD_RELEASE_v31.2.41_2026-04-30/GATE_REPORT.md \
  proof_packs/releases/PROD_RELEASE_v31.2.41_2026-04-30/VERDICT.md \
  proof_packs/releases/PROD_RELEASE_v31.2.41_2026-04-30/ROLLBACK.md \
  scripts/autoheal/autoheal_rules.jsonl
```

Pour revenir aussi sur le binaire installé système, réinstalle explicitement l’artefact précédent avec `sudo dpkg -i` ou recopiez l’ancien binaire vers `/usr/bin/titane-infinity`.
