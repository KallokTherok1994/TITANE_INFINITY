# STRUCTURE_RULES

## Règles obligatoires
1. Aucun nouveau dossier racine non gouverné.
2. Documentation humaine en priorité sous docs/.
3. Artefacts d'exécution dans reports/ ou proof_packs/.
4. Héritage long terme dans archive/.
5. Aucune suppression silencieuse; migrations via git mv.

## Règles de conformité automatique
- Rejeter les .md versionnés hors docs/, sauf exceptions:
  - README.md
  - .github/**/*.md
- Rejeter les liens markdown internes cassés.
- Rejeter coexistence de dossiers d'archive redondants au même niveau (archive, _archive, .archive, .archive_cleanup) sans justification explicite.
