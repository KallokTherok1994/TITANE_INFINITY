# 03_CANONICAL_FACTS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `canonical facts registry`

C) RISK: `P1`

D) PLAN (<=7):
1. Record immutable facts.
2. Attach proof and scope for each fact.
3. State allowed/forbidden continuation behavior.

E) PROOFS:

1. Canonical commit
- Enonce: baseline canonique scellee au commit `757ae4d4c`.
- Preuve: `raw/ref_final_seal_VERDICT.md`.
- Portee: point de depart de tout futur cycle.
- Autorise/Interdit: autorise reprise depuis ce commit; interdit redefinition du commit de reference sans drift.

2. System status
- Enonce: statut systeme scelle = `SEALED`.
- Preuve: `raw/ref_final_seal_VERDICT.md`, `raw/ref_seal_conditions_eval.txt`.
- Portee: etat final du cycle courant.
- Autorise/Interdit: autorise canonization documentaire; interdit requalification technique sans nouveau scope.

3. CI status
- Enonce: CI baseline = verte.
- Preuve: `raw/ref_seal_conditions_eval.txt` (`23/23`, `0` non-success).
- Portee: validite de baseline CI pour reprise.
- Autorise/Interdit: autorise demarrage futur sans rerun lourd immediate; interdit claim de CI degradee sans preuves nouvelles.

4. Workspace status
- Enonce: workspace rule = `CLEAN_BY_DOCTRINE`.
- Preuve: `raw/ref_seal_conditions_eval.txt`, `raw/current_workspace_snapshot_metrics.txt`.
- Portee: hygiene validee sous KEEP_UNTRACKED.
- Autorise/Interdit: autorise proof untracked; interdit drift tracked/nonproof untracked.

5. Doctrine proof_packs
- Enonce: doctrine active = `KEEP_UNTRACKED`.
- Preuve: `raw/ref_doctrine_VERDICT.md`.
- Portee: interpretation hygiene des proof packs.
- Autorise/Interdit: autorise proof packs untracked; interdit rouvrir TRACK_ALL vs KEEP_UNTRACKED sans nouvelle contradiction haute autorite.

6. Governance status
- Enonce: governance light checks = `PASS`.
- Preuve: `raw/ref_seal_conditions_eval.txt`.
- Portee: stabilite de gouvernance de fermeture.
- Autorise/Interdit: autorise cloture documentaire; interdit declaration PASS sans captures.

7. Sealed proof chain
- Enonce: chaine doctrinale -> hygiene -> final seal complete.
- Preuve: `raw/ref_doctrine_pack_exists.txt`, `raw/ref_hygiene_pack_exists.txt`, `raw/ref_final_seal_pack_exists.txt`.
- Portee: base de consultation canonique.
- Autorise/Interdit: autorise references normatives; interdit bypass de chaine dans futures reprises.

8. Non-mutation scope during sealing
- Enonce: aucune mutation produit/config/CI/runtime/tests durant fermeture.
- Preuve: `proof_packs/FINAL_SEAL_EXECUTION_2026-03-07_1239_757ae4d4c/ROLLBACK.md` + drift metrics zero.
- Portee: integrite du seal.
- Autorise/Interdit: autorise confiance baseline; interdit attribuer le seal a des corrections techniques non faites.

F) ROLLBACK:
- Canonical facts document only.
