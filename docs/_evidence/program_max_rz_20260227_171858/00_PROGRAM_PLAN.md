# 00_PROGRAM_PLAN.md

Statut: BLOCKED
Ring impacté: Ring 3 (Services) + Ring 4 (Modules/UI) — audit documentaire
Qualification: QUALIFIED

## Objectif
Exécuter le programme R→Z en mode industriel gouverné, avec preuves PASS x3, stop-the-line strict et zéro dérive.

## Séquence immuable
R → S → Y → T → V → U → W → Z → X

## Exécution réelle
1. Pack maître + dossiers de phase créés.
2. Précheck maître exécuté et journalisé dans `06_PROOF_LOGS_MASTER.txt`.
3. Prérequis historiques détectés (`program_p6_13`, `program_p14_20`, `program_p21_27`, `program_autoheal`, `program_max_iq`).
4. Scan invariants brut (`src`) non propre (`fetch|axios|http(s)` et motifs secrets/tokens) => stop-the-line.
5. Programme scellé en `BLOCKED` sans démarrer les phases techniques.

## Règle appliquée
Aucune implémentation code R→Z tant que la porte d’entrée invariants n’est pas propre selon ce runbook strict.
