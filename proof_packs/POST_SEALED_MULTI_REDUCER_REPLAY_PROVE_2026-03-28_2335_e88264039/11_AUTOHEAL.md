# AUTOHEAL — P1.12

## New autoheal rules this cycle

**NONE** — No new blocking condition discovered. No autoheal rule is warranted.

Per the governance rule in LOCAL_EVENT_REPLAY_PROOF_SPEC.md §7:
> Only add autoheal rule if a real blocking condition is discovered.
> Do not add rules for WIRED_BUT_UNPROVEN paths unless they block local proof.
> Mark prior autoheal rules RESOLVED when runtime proof closes the gap.

---

## Prior autoheal rules now RESOLVED by P1.12

### AUTOHEAL_RULE: REDUCER_WIRED_BUT_UNPROVEN (from P1.11 residual)

**Status prior to P1.12**: OPEN — xp, progress, knowledge, settings reducers were WIRED_BUT_UNPROVEN

**Resolution**: P1.12 X3 runs prove all 4 reducers at runtime. This rule is now **RESOLVED**.

---

## Autoheal rules remaining OPEN (from prior cycles)

See `scripts/autoheal/autoheal_rules.jsonl` for canonical list. P1.12 does not modify that file.

The following categories remain open (for reference, not modified here):
- External sync: BLOCKED_ENV (TURSO_URL absent) — not a fixable autoheal condition
- LTM encrypted layer: MOCK_MODE — separate future cycle

---

## Summary

P1.12 closes the last WIRED_BUT_UNPROVEN reducer gap. All 5 reducers in `apply_event_to_state` are now PROVEN at runtime. The local persistence proof matrix for event replay is complete.
