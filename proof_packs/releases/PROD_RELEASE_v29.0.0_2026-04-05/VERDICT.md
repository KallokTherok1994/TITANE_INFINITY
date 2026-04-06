# VERDICT — PROD_RELEASE_v29.0.0_2026-04-05

- **Date:** 2026-04-05
- **Verdict:** PASS
- **Scope:** Major release refresh for `29.0.0` (stable AppImage/DEB build, `deployment/latest` refresh, checksum alignment, docs cleanup, archival)

## Evidence

1. **Stable build**
   - Command: `bash runtime/stable/build.sh`
   - Result: built `Titan-Stable_29.0.0_amd64.AppImage` and `Titan-Stable_29.0.0_amd64.deb`

2. **Certified deployment**
   - Command: `GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY bash scripts/deployment/certified-deploy.sh --target both --deploy-path deployment/latest --manifest-update --verbose`
   - Result: **exit 0**; `274` test files passed, `3938` tests passed; `deployment/latest/MANIFEST.json`, `CHECKSUMS.sha256`, `CHECKSUMS.txt`, `SHA256SUMS.txt`, and `SIZES.txt` refreshed to `29.0.0`

3. **Governance verification**
   - Command: `pnpm run lint && pnpm run format:check && pnpm run check && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh`
   - Result: **exit 0**; `SUMMARY: PASS=23 FAIL=0`

## Artifact hashes

- `Titan-Stable_29.0.0_amd64.AppImage` → `12ed61d6581f7d16d626a8da73dbba8c37b8f56b9f562deca878898170a60a84`
- `Titan-Stable_29.0.0_amd64.deb` → `2bcfc64e57f5f234a6fa43dd810e8240ba1a37c61faee934f8e136b83f04f880`

> Git commit/tag/push finalization is tracked separately from this local proof pack.
