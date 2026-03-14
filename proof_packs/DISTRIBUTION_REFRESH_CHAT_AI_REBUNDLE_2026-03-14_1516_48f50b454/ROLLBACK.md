# ROLLBACK

Status: READY

## Commands

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

git restore -- \
  deployment/latest/CHECKSUMS.sha256 \
  deployment/latest/MANIFEST.json \
  deployment/latest/MANIFEST_v27.2.0.json \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/SHA256SUMS_v27.2.0.txt \
  deployment/latest/SIZES.txt \
  deployment/latest/SIZES_v27.2.0.txt \
  deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage \
  deployment/latest/TITANE-Infinity_27.2.0_amd64.deb \
  deployment/latest/titane-infinity \
  reports/DISTRIBUTION_REFRESH_CHAT_AI_REBUNDLE_2026-03-14.md \
  proof_packs/DISTRIBUTION_REFRESH_CHAT_AI_REBUNDLE_2026-03-14_1516_48f50b454 \
  scripts/autoheal/autoheal_rules.jsonl
```

## Intent

Restore the previous `deployment/latest` payload and remove this session's report/proof artifacts if the refreshed distribution must be reverted.
