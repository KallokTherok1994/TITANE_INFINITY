A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (matrice sur `README.md`, `docs/**`)
C) RISK: P1
D) PLAN: 1) selectionner fichiers pertinents 2) marquer duplicate/contradiction 3) proposer action KEEP/MERGE/ARCHIVE/BLOCK.
E) PROOFS: obtenues = inventaires + audit version + lectures ciblées.
F) ROLLBACK: suppression du proof pack uniquement.

# 05 DUPLICATE AND CONTRADICTION MATRIX

| Path | Topic | Version mentionnee | Authority class | Duplicate | Contradiction | Action |
|---|---|---|---|---|---|---|
| `README.md` | Front door public | v27.2.0 + v27.0.5 | ROOT_CANONICAL | no | yes | `MERGE_INTO_ROOT` (future clean rewrite) |
| `docs/README.md` | Hub docs | v27.2.0 + legacy refs | DOCS_CANONICAL | no | yes | `MERGE_INTO_DOCS_CANON` |
| `docs/diagrams/README.md` | Mermaid index | no hard V claim | SUBSYSTEM_CANONICAL | no | no | `KEEP_SUBSYSTEM_LOCAL` |
| `docs/00_core/README.md` | Ancien hub | v27 legacy | LEGACY | yes | yes | `DEPRECATE` |
| `docs/00_core/README_v27.0.0.md` | Legacy release readme | v27.0.0 | LEGACY | yes | no | `ARCHIVE` |
| `docs/user/README.md` | User docs local | variable | SUPPORTIVE | no | partial | `KEEP_SUBSYSTEM_LOCAL` |
| `docs/api/README.md` | API docs | variable | SUBSYSTEM_CANONICAL | no | unknown | `KEEP_SUBSYSTEM_LOCAL` |
| `docs/archive/root/README_ROADMAP_V27.md` | Archive roadmap | v27 | ARCHIVE | yes | no | `ARCHIVE` |
| `docs/99_ARCHIVE/**` | Archives historiques | multi | ARCHIVE | yes | no | `ARCHIVE` |
| `docs/backup_*/README*.md` | Backups | multi | ARCHIVE | yes | no | `ARCHIVE` |
| `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` | Release claim | v28 title + 27.0.0 artifacts | CONTRADICTORY | no | yes | `BLOCK` |
| `docs/90_release/CHANGELOG_v27.1.0.md` | Release history | v27.* | SUPPORTIVE | no | partial | `KEEP` |

Synthese:
- Duplicates: presents
- Contradictions: presentes
- Action de fusion globale: `BLOCK` tant que gate git local est bloque.
