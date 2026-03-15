# ROLLBACK

If this deployment/latest synchronization must be reverted:

`git restore -- deployment/latest/MANIFEST.json deployment/latest/CHECKSUMS.sha256 deployment/latest/SHA256SUMS.txt deployment/latest/SIZES.txt scripts/autoheal/autoheal_rules.jsonl`

Then redeploy the intended baseline artifacts before any publication step.
