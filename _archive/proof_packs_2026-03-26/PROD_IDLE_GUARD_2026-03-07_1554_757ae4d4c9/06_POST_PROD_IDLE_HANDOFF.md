# 06_POST_PROD_IDLE_HANDOFF

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Handoff opérateur post-prod en état idle.

C) RISK
- `P1`

D) PLAN (<=7 étapes)
1. Résumer l'état actuel.
2. Indiquer l'action immédiate correcte.
3. Indiquer les actions à éviter.
4. Borner l'unique exception de réouverture.

E) PROOFS
- Baseline canon: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/`
- Pack idle actuel: `proof_packs/PROD_IDLE_GUARD_2026-03-07_1554_757ae4d4c9/`

F) ROLLBACK
- N/A (handoff opérationnel).

État actuel:
- Production validée, baseline canon figée (`757ae4d4c9`, `27.2.0`).

Ce qu’il faut faire maintenant:
- Maintenir un mode veille release en lecture/consultation uniquement.

Ce qu’il ne faut plus faire:
- Aucune relance build/deploy/pipeline sans trigger autorisé.

Unique exception de réouverture:
- `EXPLICIT_NEW_RELEASE_SCOPE` ou `PROVEN_PROD_DRIFT` ou `CRITICAL_PROD_FAILURE` avec preuve minimale.

Type de signal attendu:
- Signal factuel, mesurable, documenté, comparé explicitement à la baseline canonique.
