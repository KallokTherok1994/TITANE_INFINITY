# Rollback Plan

If rollback is required, run:

```bash
git restore -- scripts/deployment/certified-deploy.sh \
  deployment/latest/MANIFEST.json \
  deployment/latest/CHECKSUMS.sha256 \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/SIZES.txt \
  scripts/autoheal/autoheal_rules.jsonl
```

Then re-run validation:

```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```
