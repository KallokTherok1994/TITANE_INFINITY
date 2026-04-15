---
applyTo: 'docs/**, reports/**, proof_packs/**'
---

# Docs and Registry Instructions

## Invariants rappeles

- Append-only, no destructive rewrites.
- Proof evidence lives under `reports/` (append-only logs) and `proof_packs/` (session packs).
- Every registry entry must reference the fix/change it documents.

## DO

- Keep entries short, factual, and dated.
- Maintain indexes when required.
- Use the full AutoHeal schema for every entry in the canonical AutoHeal JSONL registry:
  - Required fields: `id, date, scope, symptom, root_cause, fix, prevention_test, commands, files_changed, rollback`
  - `prevention_test` must include `detect_recurrence`.
- Add a `registry/ui-events.jsonl` entry for every UI surface change.
- Every proof pack must contain `VERDICT.md` and `ROLLBACK.md`.
- For release artifacts: RELEASE_SURFACE_INVENTORY.md + checksums `SHA256SUMS.txt` / `CHECKSUMS.sha256` + `MANIFEST.json` are mandatory.

## DONT

- Rewrite history or delete proof packs.
- Use shorthand or partial AutoHeal entries (will fail `detect_recurrence.sh`).
- Emit a verdict other than PASS/FAIL/BLOCKED/BLOCKED_APPROVAL/DONE/SEALED.

## Preuves attendues

- VERDICT.md and ROLLBACK.md in proof packs.
- AutoHeal JSONL valid per the recurrence guard.

## Gates specifiques

- Stop-the-line on missing proof files.
- `detect_recurrence.sh` exit 0 required before closing any fix session.

## Rollback

- git restore -- docs reports
