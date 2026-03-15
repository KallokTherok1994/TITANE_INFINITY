# PROD Deploy Metadata Coherence - 2026-03-15

A deterministic deployment metadata fix was applied and validated.

## What was fixed

- `scripts/deployment/certified-deploy.sh` now deploys newest build artifacts deterministically.
- `MANIFEST.json` version aligns with deployed artifact version when available.
- `CHECKSUMS.sha256`, `SHA256SUMS.txt`, and `SIZES.txt` are regenerated from deployed files.

## Validation snapshot

- Certified deploy: PASS (`216/216` files, `3223/3223` tests)
- AutoHeal recurrence: PASS
- Instruction verification: PASS (`PASS=20 FAIL=0`)

## Proof pack

- `proof_packs/PROD_DEPLOY_METADATA_COHERENCE_2026-03-15_1838_a987137c8`
