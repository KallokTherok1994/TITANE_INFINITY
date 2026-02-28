# 07_RISKS_MASTER.md

Statut: BLOCKED

## Top risques
1. Démarrage des phases malgré gate d’entrée FAIL (bris constitutionnel).
2. Mélange runtime/tests/docs dans les scans bruts générant faux positifs non qualifiés.
3. Passage en force sans PASS x3, incompatible avec gouvernance.

## Mitigations
- Maintien strict du stop-the-line.
- Introduire un audit runner classifiant runtime vs test/docs avant relance.
- Rejouer précheck puis seulement lancer R→X.

