---
applyTo: 'docs/**, reports/**'
---

# Docs and Registry Instructions

## Invariants rappeles

- Append-only, no destructive rewrites.
- Proofs live under reports/.

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
