# ROLLBACK — PROD_RELEASE_v29.0.0_2026-04-05

If the `29.0.0` release refresh must be reverted before commit:

```bash
git restore -- \
  ARCHIVE_DECISIONS.md CHANGELOG.md README.md RELEASE_ARTIFACTS_CHECKSUMS.txt \
  RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt RELEASE_SURFACE_INVENTORY.md \
  VERSION_AUTHORITY_MAP.md deployment/latest/CHECKSUMS.sha256 \
  deployment/latest/CHECKSUMS.txt deployment/latest/MANIFEST.json \
  deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt docs/README.md \
  docs/V29_DOCS_INDEX.md runtime/stable/manifest.json runtime/stable/tauri.conf.json \
  scripts/autoheal/autoheal_rules.jsonl scripts/deployment/certified-deploy.sh \
  scripts/sync-versions.mjs src-tauri/Cargo.lock src-tauri/Cargo.toml \
  src-tauri/tauri.conf.json tauri.base.json titane-infinity.desktop
```

If already committed, revert by commit:

```bash
git revert <release-commit-sha>
```

Archived PATCH010 root docs can be restored with:

```bash
git restore --source=HEAD^ -- \
  PROD_DEPLOYMENT_CHECKLIST_PATCH010.md PROD_GATE_REPORT_PATCH010.md \
  PROD_GO_DECISION_PATCH010.md PROD_ROLLBACK_PLAN_v28_PATCH010.md
```
