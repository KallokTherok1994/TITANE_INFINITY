# Rollback Plan — AH-DEPLOY-META-012

## Scope
Rollback tracked deployment metadata synchronization.

## Fast rollback
```bash
git restore -- \
  deployment/latest/CHECKSUMS.sha256 \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/SHA256SUMS_v28.0.0.txt \
  deployment/latest/SIZES.txt \
  scripts/autoheal/autoheal_rules.jsonl
```

## Post-rollback checks
```bash
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

Expected: PASS.
