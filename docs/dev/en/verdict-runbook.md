# TITANE∞ — Verdict Runbook (EN)

**Version:** 33.0.0  
**Status:** QUALIFIED  
**Date:** 2026-05-03

> Operational runbook for choosing and writing the final verdict of a governed fix or verification session.

---

## Allowed verdicts

Use one status vocabulary only:

| Verdict | Use when |
|---|---|
| PASS | Required proof ran and succeeded for the scoped gate or fix |
| FAIL | A required gate ran and failed; stop-the-line applies |
| BLOCKED | A required gate could not run because an external prerequisite is missing |
| BLOCKED_APPROVAL | Execution is waiting for explicit human approval |
| DONE | Work is complete but not yet sealed as a governed closure |
| SEALED | Governed session closed with proof pack, rollback, and final trace in place |

Never invent another label.

---

## Fast decision path

1. Confirm the exact scope of the change or verification session.
2. List the mandatory proofs for that scope.
3. Separate executed proof from assumed proof.
4. If a mandatory proof failed, verdict is FAIL.
5. If a mandatory proof cannot run, verdict is BLOCKED with the next action.
6. If all mandatory proofs passed, verdict is PASS for the scoped gate or fix.
7. Use DONE only for work completion before the governed closure is fully assembled.
8. Use SEALED only when the proof pack, rollback note, and final governed trace are all present.

---

## Mandatory checks before PASS

- Exact targeted tests for the modified scope
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- Required mapping/cartography updates for the touched surface
- Proof artifacts written under `reports/` and `proof_packs/` when the session is governed

If one of these is missing, do not claim PASS.

---

## Mandatory content before SEALED

- A scoped report in `reports/`
- A proof pack with at least `GATE_REPORT.md`, `VERDICT.md`, and `ROLLBACK.md`
- A rollback command that targets only the scoped lot
- Executable proof already run and recorded honestly
- No contradiction between git state, proof files, and reported verdict

If any item is missing, remain at PASS, DONE, FAIL, or BLOCKED as appropriate.

---

## BLOCKED vs FAIL

Use FAIL when the gate ran and the result is bad.

Use BLOCKED when the gate did not run because of an external constraint such as:

- locked runner or artifact directory
- missing device or runner
- unavailable credential or approval
- required binary, fixture, or environment not present

Every BLOCKED verdict must include a next action that is realistically executable in 30 minutes or less.

---

## Minimal verdict templates

### PASS

```md
- Status: PASS
- Scope: <scoped lot>
- Proof: <commands that ran successfully>
```

### FAIL

```md
- Status: FAIL
- Scope: <scoped lot>
- Failed gate: <command or check>
- Stop line reason: <short factual reason>
```

### BLOCKED

```md
- Status: BLOCKED
- Scope: <scoped lot>
- Missing prerequisite: <external blocker>
- Next action: <bounded next step>
```

### SEALED

```md
- Status: SEALED
- Scope: <scoped lot or session>
- Proof pack: <path>
- Rollback: <path or command>
```

---

## Common mistakes to avoid

- Marking PASS after code edits but before running the mandatory gates
- Marking FAIL when the check never actually ran
- Marking BLOCKED without a concrete next action
- Marking SEALED before the proof pack is complete
- Mixing session-wide claims with a smaller scoped lot

---

*French documentation: [docs/dev/fr/runbook-verdict.md](../fr/runbook-verdict.md)*
