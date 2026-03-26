# 08_IMPLEMENTATION_IMPACT

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `next-run preparation only (no apply)`

C) RISK: `P1`

D) PLAN (<=7):
1. Define next hygiene gate inputs under `KEEP_UNTRACKED`.
2. Define allowed checks.
3. Provide relaunch prompt ready-to-run.

E) PROOFS:

Selected doctrine impact (`KEEP_UNTRACKED`):
1. `proof_packs/` remain evidence artifacts, not mandatory git-tracked content.
2. Hygiene evaluation must use tracked-drift truth as gating signal, not raw untracked presence in `proof_packs/`.
3. No deletion/move/archive action is authorized by default in hygiene gate.

Next run expected actions (do not execute here):
1. Re-open hygiene gate with declared rule `KEEP_UNTRACKED`.
2. Confirm tracked drift = 0.
3. Confirm CI/rechecks remain PASS.
4. Reclassify workspace with explicit exception: `DIRTY_PROOF_ONLY_NON_BLOCKING`.
5. Issue resulting hygiene verdict based on this canonical rule.

Prompt de relance prepare (copier tel quel au run suivant):

```md
# TITANE∞ — HYGIENE RELAUNCH (POST-DOCTRINE)
MODE: LOCAL
CANON_RULE: KEEP_UNTRACKED

Apply canonical doctrine: proof packs under `proof_packs/` are required evidence artifacts but are not required to be git-tracked for hygiene pass/fail.

Required checks only:
1. `git diff --name-only` and `git diff --cached --name-only` must both be empty.
2. Baseline CI for HEAD must have zero non-success completed runs.
3. `bash scripts/autoheal/detect_recurrence.sh` exit 0.
4. `bash scripts/verify_instructions.sh` exit 0.

If all pass:
- classify proof-pack untracked state as `DIRTY_PROOF_ONLY_NON_BLOCKING`
- produce final hygiene verdict (`STABLE` or `SEALED_CANDIDATE` per remaining gates)

Forbidden:
- delete/move/archive proof packs
- modify product/config
```

F) ROLLBACK:
- No implementation applied in this run.
