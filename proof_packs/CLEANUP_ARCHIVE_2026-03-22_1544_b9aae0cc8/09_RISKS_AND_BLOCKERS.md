# 09_RISKS_AND_BLOCKERS.md — Risques et blocages

## Risques identifiés

| Risque | Niveau | Mitigation |
|--------|--------|-----------|
| Référence README vers fichiers déplacés | FAIBLE | Vérification exhaustive faite — 0 références aux v28.6.0–v28.80.0 |
| Breakage script generate-release-checksums.sh | FAIBLE | Script génère les fichiers à la racine — pattern préservé pour nouvelles versions |
| Perte de preuve historique | NUL | `git mv` préserve l'historique complet — contenu accessible via git |

## Blocages résiduels

| Fichier / Groupe | Blocage | Recommandation |
|-----------------|---------|---------------|
| build_log.txt + dev logs | Référencé dans scripts/ | Laisser en place; à reévaluer si scripts/advanced-diagnostic.sh est mis à jour |
| CAMPAIGN_*.txt, MISSION_*.txt | Impact non prouvé | Laisser en place — classer en future session si nécessaire |
| baseline_measurements_*.json | Inconnu | Laisser en place — I UNKNOWN |
| PHASE_C1_COMPLETION_REPORT.ts | Inconnu | Laisser en place — I UNKNOWN |

## Constat sur bruit résiduel

La racine conserve encore ~40 fichiers .txt/.md/.sh/.json non-product. Ce bruit résiduel est jugé hors périmètre de cette session car:
- Chaque fichier nécessite une preuve de non-référencement spécifique
- Risque faible mais existant pour chaque script historique
- Recommandation: session dédiée par catégorie (scripts v27, logs dev, snapshots)
