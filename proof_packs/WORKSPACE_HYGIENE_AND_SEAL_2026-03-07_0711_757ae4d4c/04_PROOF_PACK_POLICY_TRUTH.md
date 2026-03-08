# 04_PROOF_PACK_POLICY_TRUTH

Policy evidence set:
- `raw/docs_registry_instructions.md`
- `raw/copilot_instructions.md`
- `raw/lib_cert.sh`
- `raw/run-p10-desktop-cert.sh`
- `raw/policy_markers_rg.txt`
- `raw/proof_pack_tracking_mode_sample.txt`

What is explicit and stable:
1. Proof evidence must live under `proof_packs/` and include `VERDICT.md` + `ROLLBACK.md`.
2. Proof packs are append-only and must not be deleted as a normal hygiene action.

What is contradictory/ambiguous for this task:
1. `scripts/certification/lib_cert.sh` precheck treats untracked proof outputs as expected.
2. Repository practice is mixed: some proof packs are tracked, others untracked (`raw/proof_pack_tracking_mode_sample.txt`).
3. `scripts/certification/run-p10-desktop-cert.sh` contains conditional rollback text that assumes proof packs may be uncommitted.

Doctrine determination:
- TRACKING_MODE = `UNRESOLVED`.
- Required outcome under stop-the-line doctrine = `BLOCKED_DOCTRINE`.
