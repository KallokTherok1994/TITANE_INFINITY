# Mermaid Evolution Policy

## Principes

- Changer un `.mmd` implique de mettre a jour le registry via `bash scripts/verify/mermaid-hash-registry.sh`.
- Toute modif reseau doit mettre a jour `docs/diagrams/sources/network_surface_online_first.mmd`.
- Si le drift strict echoue: mettre a jour le diagramme ou ajouter une allowlist justifiee.
- Process PR: `pnpm run op:mermaid` obligatoire + proof pack.
- Aucun champ volatile dans le registry.

## Conflits merge sur le registry

1. Conserver l'append-only: ne jamais supprimer d'entrees `history[]`.
2. Fusionner les history et trier chronologiquement.
3. Verifier avec `bash scripts/verify/mermaid-hash-registry.sh --check`.
