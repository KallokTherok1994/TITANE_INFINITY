---
applyTo: 'docs/**, reports/**, proof_packs/**'
---

# Docs and Registry Instructions

## Invariants rappeles

- Append-only, no destructive rewrites.
- Proof evidence lives under `reports/` (append-only logs) and `proof_packs/` (session packs).

## DO

- Keep entries short, factual, and dated.
- Maintain indexes when required.

## DONT

- Rewrite history or delete proof packs.

## Preuves attendues

- VERDICT.md and ROLLBACK.md in proof packs.

## Gates specifiques

- Stop-the-line on missing proof files.

## Rollback

- git restore -- docs reports
