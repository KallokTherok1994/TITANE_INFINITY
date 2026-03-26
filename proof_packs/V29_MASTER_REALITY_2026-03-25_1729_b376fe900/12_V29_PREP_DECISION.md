# 12_V29_PREP_DECISION

## Politique de bump V29

| Condition | Etat |
|---|---|
| 1. baseline actuel prouve | OUI |
| 2. locks v28 causaux fermes ou bloques explicitement | NON |
| 3. tests pertinents passent | OUI |
| 4. runtime pertinent prouve ou bloque honnetement | OUI |
| 5. docs et surfaces de version alignees | OUI, pour les surfaces actives et canoniques |
| 6. release notes pourraient etre factuelles maintenant | NON |
| 7. rollback clair | OUI |

## Decision

- bump `V29.0.0`: REFUSE
- mode retenu: rester en recertification `v28.x`
- raison dominante: locks `v28.x` restants hors version

## Etat complementaire

- le chemin release est plus strict qu'au debut de session
- cela ne suffit pas a lever le blocage supply-chain, car SBOM reste absent et signing reste conditionne a des secrets CI externes
