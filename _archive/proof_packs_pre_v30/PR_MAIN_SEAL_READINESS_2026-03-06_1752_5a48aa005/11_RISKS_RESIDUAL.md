# 11 Residual Risks

## R1

- ID: `R1-MISSING-PR`
- Severity: `P1`
- Evidence: `raw_gh_pr_status.txt`, `raw_gh_pr_view.err`
- Impact: no PR object, so no review/mergeability/check-rollup truth for this work package.
- Blocker for:
  - PR: yes
  - Main: yes
  - Seal: yes

## R2

- ID: `R2-CI-NOT-FULL-GREEN`
- Severity: `P1`
- Evidence: `raw_gh_run_list.json` includes failed run `Rust Tests (Docker)` (`22778120902`).
- Impact: external CI truth is not uniformly green.
- Blocker for:
  - PR: yes
  - Main: yes
  - Seal: yes

## R3

- ID: `R3-WORKTREE-DIRTY`
- Severity: `P1`
- Evidence: `raw_git_status.txt`
- Impact: not in clean handoff state (`ahead 1` plus local modifications and untracked proof packs).
- Blocker for:
  - PR: yes
  - Main: yes
  - Seal: yes

## R4

- ID: `R4-REQUIRED-CHECKS-VISIBILITY`
- Severity: `P2`
- Evidence: `raw_branch_protection.err` (`Branch not protected`), no required checks policy captured.
- Impact: required-check governance is partially unknown externally.
- Blocker for:
  - PR: conditional
  - Main: conditional
  - Seal: yes (until explicitly clarified)
