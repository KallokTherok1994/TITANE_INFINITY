# Phase P6 — Evals & Red Team

<!-- APPEND-ONLY -->

## Status: BLOCKED_INSTRUMENTATION (until VS Code execution)

## Objectives

- Run red team x3 adversarial sessions (G10)
- Run evals regression suite x3 (G11)
- Assert zero regression and zero jailbreaks

## Checklist

- [ ] `bash checks/check_G10_REDTEAM_X3.sh` — BLOCKED_INSTRUMENTATION → run manually
- [ ] `bash checks/check_G11_EVALS_REGRESSION_NONE.sh` — BLOCKED_INSTRUMENTATION → run manually
- [ ] Red team run 1: `proof_packs/G10_REDTEAM_X3/redteam_run1.jsonl`
- [ ] Red team run 2: `proof_packs/G10_REDTEAM_X3/redteam_run2.jsonl`
- [ ] Red team run 3: `proof_packs/G10_REDTEAM_X3/redteam_run3.jsonl`
- [ ] Evals run 1–3 in `proof_packs/G11_EVALS_REGRESSION_NONE/`

## BLOCKED_INSTRUMENTATION

**Cause:** Adversarial testing and eval suites require LLM endpoints and human reviewers.  
**Next action:** Perform after merge in VS Code with Tauri runtime active.

## Evidence

> To be filled after VS Code execution.
