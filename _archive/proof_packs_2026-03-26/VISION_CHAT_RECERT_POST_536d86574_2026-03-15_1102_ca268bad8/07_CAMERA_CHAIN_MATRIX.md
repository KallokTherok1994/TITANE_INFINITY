# 07_CAMERA_CHAIN_MATRIX

## Réponse Q2: CameraPage — plus honnête ou plus fonctionnelle?

**Plus honnête seulement.**

Changements fonctionnels: AUCUN.
- Aucun modèle ML chargé
- Aucune caméra branchée (hardware absent)
- estimationCount reste 0 (valeur par défaut constante)
- landmarksDetected reste false (jamais mis à jour)

Ce commit évite l'affichage de métriques fictives. Il n'ajoute pas de fonctionnalité réelle.

## Réponse Q5: Chaîne caméra prouvée en runtime desktop?

**NON** — BLOCKED_HARDWARE.

| Action | Résultat attendu | Résultat réel | Classification | Bloqueur |
|---|---|---|---|---|
| Naviguer vers /camera | Page chargée | STATIC_OK | N/A | N/A |
| Énumérer devices | Liste webcams | Hardware absent | BLOCKED_HARDWARE | Pas de device |
| Sélectionner device | Sélecteur change | BLOCKED_HARDWARE | BLOCKED_HARDWARE | N/A |
| Ouvrir preview | getUserMedia OK | BLOCKED_HARDWARE | BLOCKED_HARDWARE | N/A |
| Recevoir frame | Canvas frame | BLOCKED_HARDWARE | BLOCKED_HARDWARE | N/A |
| Analyse body/affect | Métriques calculées | NO_DEVICE | SYMBOLIC_ONLY | Aucun modèle ML |

## Classifications finales

```
classify: BLOCKED_HARDWARE (camera chain)
classify: SYMBOLIC_ONLY (energy / body analysis — aucun modèle, valeurs constantes)
```
