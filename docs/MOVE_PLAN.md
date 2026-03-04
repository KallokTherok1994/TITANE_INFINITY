# MOVE_PLAN

## Règle
Aucune migration massive de dossiers racine dans ce cycle (risque élevé).

## FROM -> TO
| FROM | TO | Catégorie | Justification |
|---|---|---|---|
| README.md (racine) | docs/README.md (lien canonique) | CANON | Orienter la documentation vers /docs sans déplacer l’historique racine |
| docs/README.md | docs/README.md | KEEP | Déjà présent |
| Aucune entrée .md hors docs détectée | N/A | KEEP | Scan baseline = 0 hors exceptions |

## Rollback
- git restore -- README.md docs/README.md
- git restore -- docs/STRUCTURE_RULES.md docs/TARGET_STRUCTURE.md docs/MOVE_PLAN.md
- git clean -fd docs/_evidence/structure_reorg_2026-03-01_133944
