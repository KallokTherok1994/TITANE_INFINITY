# PHASE 4 - HUMAN-CONTROLLED NEXT ACTIONS

No option below is executed in this lane.

## Option 1 - Real Push Now

- Action name: `PUSH_MAIN_NOW`
- Preconditions: operator confirms publication intent; branch is `MAIN`; local review done.
- Command(s): `git push origin MAIN`
- Risk level: `P1`
- Rollback/undo note: use revert commit workflow if rollback is needed post-push.
- Writes remotely: `YES`
- Scope relation: outside proven current scope (human-controlled).

## Option 2 - Branch Verification Before Real Push

- Action name: `VERIFY_THEN_PUSH`
- Preconditions: operator wants one manual confirmation pass.
- Command(s):
	- `git status -sb`
	- `git log -3 --oneline`
	- `git push origin MAIN`
- Risk level: `P0` for verification, `P1` for push step.
- Rollback/undo note: same as Option 1 after real push.
- Writes remotely: verification `NO`, push `YES`.
- Scope relation: verification inside proof-style behavior; push outside current proven scope.

## Option 3 - PR Creation Preparation

- Action name: `PREPARE_PR_FLOW`
- Preconditions: operator chooses PR-based publication instead of direct push.
- Command(s):
	- `git branch --show-current`
	- `git remote -v`
	- (optional) create/switch integration branch per team policy.
- Risk level: `P0`
- Rollback/undo note: local branch operations are reversible.
- Writes remotely: `NO` (unless user later publishes branch manually).
- Scope relation: outside current push proof scope, human-controlled planning.

## Option 4 - Archive Terminal Proof Pack

- Action name: `ARCHIVE_TERMINAL_PROOF_PACK`
- Preconditions: operator wants local archival hygiene.
- Command(s): policy-defined archival command only (no deletion required in this lane).
- Risk level: `P0`
- Rollback/undo note: keep append-only copy before any move.
- Writes remotely: `NO`.
- Scope relation: optional post-proof housekeeping.

## Option 5 - Stop Here

- Action name: `NO_FURTHER_ACTION`
- Preconditions: operator accepts closure state with no immediate publication.
- Command(s): none.
- Risk level: `P0`
- Rollback/undo note: none needed.
- Writes remotely: `NO`.
- Scope relation: fully inside current closure decision boundary.

