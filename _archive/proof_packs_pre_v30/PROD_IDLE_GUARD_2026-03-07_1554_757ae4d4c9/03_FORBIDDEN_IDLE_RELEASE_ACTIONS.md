# 03_FORBIDDEN_IDLE_RELEASE_ACTIONS

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Interdits en veille release sans trigger valide.

C) RISK
- `P1`

D) PLAN (<=7 étapes)
1. Énumérer les actions interdites.
2. Donner la raison d'interdiction.
3. Définir le trigger rendant l'action recevable.
4. Donner le type de prompt à utiliser le jour venu.

E) PROOFS
- Baseline canon active: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/VERDICT.md`
- Idle state validé: `proof_packs/PROD_IDLE_GUARD_2026-03-07_1554_757ae4d4c9/01_PROD_IDLE_REFERENCE.md`

F) ROLLBACK
- N/A (politique de non-action).

Actions interdites en état idle:
1. Relancer build prod.
Pourquoi interdit: réouverture implicite d'un cycle clos.
Trigger requis: `EXPLICIT_NEW_RELEASE_SCOPE` ou `PROVEN_PROD_DRIFT` ou `CRITICAL_PROD_FAILURE`.
Prompt futur: prompt gouverné de réentrée release.

2. Relancer deploy prod.
Pourquoi interdit: mutation production sans nécessité prouvée.
Trigger requis: incident critique documenté ou scope release explicite.
Prompt futur: prompt release d'exécution ciblé avec preuves.

3. Modifier la version `27.2.0`.
Pourquoi interdit: casse la baseline canonique validée.
Trigger requis: nouvelle release explicite validée.
Prompt futur: prompt de cycle release versionné.

4. Toucher aux artefacts distribués.
Pourquoi interdit: risque de dérive non gouvernée.
Trigger requis: drift prouvé ou incident critique.
Prompt futur: prompt de correction artefact avec plan de rollback.

5. Retester toute la pipeline "par sécurité".
Pourquoi interdit: charge inutile sans signal nouveau.
Trigger requis: anomalie réelle et mesurable.
Prompt futur: prompt d’investigation ciblée.

6. Rescanner toute la prod sans signal.
Pourquoi interdit: inflation d'activité non justifiée.
Trigger requis: événement externe critique ou alerte validée.
Prompt futur: prompt de diagnostic borné.

7. Corriger un détail release non demandé.
Pourquoi interdit: patching préventif hors scope.
Trigger requis: preuve de défaut impactant prod.
Prompt futur: prompt de fix minimal gouverné.

8. Créer une nouvelle chaîne de prompts release actifs.
Pourquoi interdit: récursion opérationnelle sur baseline stable.
Trigger requis: déclencheur de réentrée autorisé et prouvé.
Prompt futur: unique prompt de réouverture release, scope explicite.
