# Rollback

## Principe
Rollback symetrique limite au scope mission docs-only.

## Commandes exactes
- `git restore -- /home/titane-os/Documents/GitHub/TITANE_INFINITY/README.md`
- `rm -rf /home/titane-os/Documents/GitHub/TITANE_INFINITY/proof_packs/DOCS_V28_CANONICAL_FUSION_2026-03-14_1627_90738eb7d`

## Si commit deja cree
- `git revert --no-edit <commit_sha_docs_only>`

## Hors scope
Aucun rollback n'est applique automatiquement sur:
- /home/titane-os/Documents/GitHub/TITANE_INFINITY/scripts/autoheal/autoheal_rules.jsonl
- /home/titane-os/Documents/GitHub/TITANE_INFINITY/deployment/latest/builds/hash_run_1.txt
- /home/titane-os/Documents/GitHub/TITANE_INFINITY/deployment/latest/builds/titane-infinity.run1.normalized
