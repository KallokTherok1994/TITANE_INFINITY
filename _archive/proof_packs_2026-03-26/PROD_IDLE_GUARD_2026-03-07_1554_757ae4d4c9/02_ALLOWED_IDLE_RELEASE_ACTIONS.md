# 02_ALLOWED_IDLE_RELEASE_ACTIONS

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Actions de consultation autorisées en veille release.

C) RISK
- `P1`

D) PLAN (<=7 étapes)
1. Lister les actions strictement autorisées.
2. Borner chaque action.
3. Exclure explicitement toute exécution release.

E) PROOFS
- Baseline canon: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/`
- Baseline idle: `proof_packs/PROD_IDLE_GUARD_2026-03-07_1554_757ae4d4c9/01_PROD_IDLE_REFERENCE.md`

F) ROLLBACK
- N/A (règles de conduite).

Actions autorisées en veille release:
1. Consulter la baseline prod canonique.
But: garder une source unique de vérité.
Borne: lecture seule des packs et manifestes.
Ne permet pas: lancer build/deploy ou modifier des artefacts.

2. Consulter les artefacts/références de release déjà figés.
But: comparer un signal avec l'état validé.
Borne: vérification documentaire des chemins/hashes existants.
Ne permet pas: republier, reconstruire, ou retoucher `deployment/latest`.

3. Relire les invariants post-deploy.
But: vérifier la conformité attendue (`APP_VERSION_MATCH`, `BOOT:READY`, parité version).
Borne: lecture des preuves existantes.
Ne permet pas: revalidation lourde de pipeline.

4. Préparer une future demande release sans l’exécuter.
But: cadrer un dossier de réouverture éventuelle.
Borne: formulation de scope et preuves minimales attendues.
Ne permet pas: ouverture implicite d’un run prod.

5. Comparer un futur signal réel à la baseline canonique.
But: distinguer un incident réel d’un bruit opérationnel.
Borne: analyse différentielle uniquement.
Ne permet pas: patching préventif ni relance "par confort".
