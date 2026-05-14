# V69 Rollback (Operational)

Targeted rollback options:
- Proof-pack only:
  - git restore -- proof_packs/V69_POST_PROD_TRUTH_CLOSURE_20260313_214054_14416abf6b
- Governance commit rollback (if required by release policy):
  - git revert 14416abf6b5a5b3e92341941766e69c30c68f61b
  - git push origin HEAD:MAIN
- Deployment artifact rollback (if required):
  - remove /tmp/titane_v15_wt_20260311_080118/deployment/v68_prod_20260313_212452
  - re-link previous deployment target

Constraint:
- No product-code fix was applied in V69; rollback is bounded to docs/governance/artifact pointers.
