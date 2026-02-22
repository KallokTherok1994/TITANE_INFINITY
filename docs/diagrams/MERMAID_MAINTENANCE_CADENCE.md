# Mermaid Maintenance Cadence

## Frequence recommandee

- Review complete: 1 fois / 30 jours
- Review legere: apres changement reseau uniquement

## Ce qu'on verifie

- Drift strict
- Baseline guard
- Change request compliance
- Registry integrity

## Ce qu'on ne fait pas

- Refactor diagrammes sans raison
- Optimisation esthetique inutile
- Ajout de guards supplementaires

## Stability > Novelty

La stabilite et la sobriete priment sur la nouveaute.

## Reactivation Trigger Matrix

| Événement | Action | Mermaid requis ? |
|-----------|--------|------------------|
| Changement UI | Non | ❌ |
| Refactor interne non réseau | Non | ❌ |
| Nouveau endpoint /api | Oui | ✅ |
| Nouveau provider externe | Oui | ✅ |
| Changement architecture engines | Oui | ✅ |
| Bug drift détecté | Oui | ✅ |
