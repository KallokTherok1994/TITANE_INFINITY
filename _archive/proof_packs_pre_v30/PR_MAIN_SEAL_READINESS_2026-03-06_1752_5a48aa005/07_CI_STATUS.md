# 07 CI Status

## CI_TRUTH

- Source: `raw_gh_run_list.json` (`gh run list -R ... --limit 10 --json ...`)
- Recent MAIN runs include mixed conclusions:
  - Success examples: `Codespaces Prebuilds`, `GitGuardian Secret Scanning`, `P5-RUNTIME-GOVERNANCE-GATE`, `Constitution Audit`, `CodeQL Security Analysis`
  - Failure observed: `Rust Tests (Docker)` (run `22778120902`)

## External policy visibility

- Branch protection probe on `MAIN` returned 404 with message `Branch not protected`.
- Required-check policy could not be asserted as protected-rule truth.

## Classification

- `CI_STATUS: CI_BLOCKED`
- `EXTERNAL_POLICY_VISIBILITY: UNKNOWN_EXTERNAL`
