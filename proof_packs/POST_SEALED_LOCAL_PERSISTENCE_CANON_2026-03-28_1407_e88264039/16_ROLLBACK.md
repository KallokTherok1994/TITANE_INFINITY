# ROLLBACK

## 1. PRODUCT
- No product changes in lanes A/B/C.

## 2. GOVERNANCE
- `git restore -- docs/governance/LOCAL_PERSISTENCE_SPINE_SPEC.md`
- `git restore -- registry/proofpack-index.jsonl`
- `rm -rf proof_packs/POST_SEALED_LOCAL_PERSISTENCE_CANON_2026-03-28_1407_e88264039`

## 3. PERSISTENCE / TEST ARTIFACTS
- No runtime proof artifacts created in this cycle.

## 4. LTM IMPACT
- LTM boundary is now explicit; persistence proof remains blocked.
