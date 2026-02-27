# GitHub Release Draft (EN)

## Title
`v27.5.1-docs-rz-seal` — R→Z documentation sealing (x3)

## Type
Documentation / Governance (no runtime changes)

## Summary
This release seals the MAX R→Z program with sequential x3 execution, consolidated evidence, and a governed final verdict.

## Highlights
- Sequence executed: `R → S → Y → T → V → U → W → Z → X`
- Validation: `x3` across all phases
- Program verdict: `PASS_QUALIFIED_WITH_RESERVE`
- Explicit reserve: phase `U` (`PASS_X3_WITH_RESERVE`)

## Per-phase final status
- R: `PASS_X3`
- S: `PASS_X3`
- Y: `PASS_X3`
- T: `PASS_X3`
- V: `PASS_X3`
- U: `PASS_X3_WITH_RESERVE`
- W: `PASS_X3`
- Z: `PASS_X3`
- X: `PASS_X3`

## Open reserve (U)
A dedicated executable gate is still required to validate the full `updater/signature/rollback` chain end-to-end.

## Evidence
- Master final verdict: `docs/_evidence/program_max_rz_20260227_171858/09_FINAL_VERDICT.md`
- Master gates: `docs/_evidence/program_max_rz_20260227_171858/04_GATES_MASTER_STATUS.md`
- Master x3 runs: `docs/_evidence/program_max_rz_20260227_171858/05_TEST_RUNS_X3_MASTER.md`
- Phase x3 logs: `docs/_evidence/pR_20260227_171858/06_PROOF_LOGS.txt` through `docs/_evidence/pX_20260227_171858/06_PROOF_LOGS.txt`

## Reference commit
- `4d2c4dc0b` (`docs(changelog): add R→Z x3 sealing entry`)

## Tag
- `v27.5.1-docs-rz-seal`
