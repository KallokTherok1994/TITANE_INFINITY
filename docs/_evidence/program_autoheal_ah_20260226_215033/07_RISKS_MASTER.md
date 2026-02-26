# 07_RISKS_MASTER.md

Statut: OPEN_BLOCKING

Top risques bloquants:
1. Dérive de surface réseau/non-governed non exclue par preuve stricte.
2. Risque de faux PASS si phases exécutées malgré précheck FAIL.
3. Risque de fuite de patterns sensibles dans traces/support packs.

Mesures:
- Stop-the-line maintenu.
- Re-baseline stricte des invariants avant tout redémarrage.
- Revue ciblée des surfaces `src/**` et secrets patterns.
