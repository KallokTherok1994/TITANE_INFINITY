A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (inventaire `README.md`, `docs/**`, `docs/diagrams/**` en lecture; rapport dans ce pack)
C) RISK: P1
D) PLAN: 1) inventaire readme 2) inventaire docs 3) inventaire mermaid 4) inventaire mentions version 5) zones dupliquees.
E) PROOFS: obtenues = `_docs_readme_list.log`, `_docs_nav_candidates.log`, `_phase1_inventory_excerpt.log`, `_version_mentions_focus.log`.
F) ROLLBACK: suppression du proof pack uniquement.

# 02 DOCS SURFACE INVENTORY

## Surfaces principales

- Front door racine: `README.md` (`PROVEN_BY_REPO`)
- Hub documentaire: `docs/README.md` (`PROVEN_BY_REPO`)
- Index Mermaid: `docs/diagrams/README.md` (`PROVEN_BY_REPO`)

## Volume observe

- README-like sous `docs/` (profondeur <=4): 80 fichiers (`LOCALLY_VERIFIED`)
- Candidats navigation/index/diagram/release/install: 2114 chemins (`LOCALLY_VERIFIED`)
- Mentions versions/statut ciblees (echantillon borne): nombreuses et heterogenes (`PARTIAL`)

## Zones probables de duplication

- `docs/00_core/README*.md` (multiples variantes legacy/v27)
- `docs/90_release/*.md` (coexistence de changelogs multi-generations)
- `docs/archive/**`, `docs/99_ARCHIVE/**`, `docs/backup_*/**` (archives qui peuvent mimer du courant)

## Classes d'etat (surface)

- `README.md`: actif (`PROVEN_BY_REPO`)
- `docs/README.md`: actif (`PROVEN_BY_REPO`)
- `docs/diagrams/**`: actif technique (`PROVEN_BY_REPO`)
- `docs/archive/**`, `docs/99_ARCHIVE/**`, `docs/backup_*/**`: `ARCHIVE` / `LEGACY`
