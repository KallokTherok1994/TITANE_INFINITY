VERDICT_UNIQUE: `DOCTRINE_RESOLVED_KEEP_UNTRACKED`

DECISION_RULE: `KEEP_UNTRACKED`

WHY:
- No high-authority source mandates TRACK_ALL for `proof_packs/`.
- Canonical docs require append-only proof existence, and certification precheck explicitly tolerates untracked proof packs.

NEXT:
- Relaunch hygiene gate under `CANON_RULE=KEEP_UNTRACKED` with tracked-drift + light-governance checks only.
