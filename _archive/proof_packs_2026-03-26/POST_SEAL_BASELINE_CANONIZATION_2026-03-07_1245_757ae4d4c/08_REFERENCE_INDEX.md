# 08_REFERENCE_INDEX

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `canonical reference inventory`

C) RISK: `P1`

D) PLAN (<=7):
1. Index canonical packs.
2. Index master verdict files.
3. State why and when to consult each.

E) PROOFS:

1. `DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c`
- Role: resolves tracking doctrine.
- Why canonical: establishes `KEEP_UNTRACKED` with authority hierarchy.
- Consult when: workspace/proof-pack doctrine is questioned.

2. `HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c`
- Role: applies doctrine to real workspace gate.
- Why canonical: proves `HYGIENE_GATE=PASS` under doctrine.
- Consult when: validating cleanliness criteria for next cycles.

3. `FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c`
- Role: documentary sealing execution.
- Why canonical: declares and certifies `SYSTEM_STATUS=SEALED`.
- Consult when: needing final closure truth and certificate.

4. Master verdict files:
- `proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/VERDICT.md`
- `proof_packs/HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c/VERDICT.md`
- `proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/VERDICT.md`
- Why canonical: single-line authoritative states for each phase.
- Consult when: fast baseline validation before any new execution.

5. Master evidence files:
- `proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/raw/seal_conditions_eval.txt`
- `proof_packs/HYGIENE_RERUN_KEEP_UNTRACKED_2026-03-07_1233_757ae4d4c/raw/workspace_classification_full.tsv`
- Why canonical: machine-readable condition proofs.
- Consult when: auditing drift claims.

Index counts snapshot:
- `raw/reference_index_counts.txt` -> doctrine `54`, hygiene `44`, final seal `43` files indexed.

F) ROLLBACK:
- Reference index file only.
