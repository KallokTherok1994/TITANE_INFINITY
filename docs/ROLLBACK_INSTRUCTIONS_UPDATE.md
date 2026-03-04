# ROLLBACK_INSTRUCTIONS_UPDATE

## Objectif

Procédure de rollback non destructive pour les changements de gouvernance et cartographie V3.

## Commandes

```bash
git restore -- .github/copilot-instructions.md \
  docs/MAP_INDEX.md \
  docs/MAP_ARCHITECTURE_4RING.md \
  docs/MAP_SURFACES_NETWORK.md \
  docs/MAP_MERMAID_OVERVIEW.md \
  scripts/map_refresh.sh
```

```bash
git restore --staged .github/copilot-instructions.md \
  docs/MAP_INDEX.md \
  docs/MAP_ARCHITECTURE_4RING.md \
  docs/MAP_SURFACES_NETWORK.md \
  docs/MAP_MERMAID_OVERVIEW.md \
  scripts/map_refresh.sh
```

## Fichiers ajoutés

```bash
git clean -f docs/MAP_IPC_COMMANDS.md docs/MAP_TESTS_GATES.md reports/DIFF_SUMMARY.md
```

## Vérification post-rollback

```bash
git status --short
```

Attendu : aucun fichier gouvernance/cartographie modifié pour cette session.
