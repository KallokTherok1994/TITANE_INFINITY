A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (plan cible pour `README.md`, sans execution)
C) RISK: P1
D) PLAN: 1) definir front door compact 2) purger redondances 3) pointer docs canon 4) neutraliser claims non prouves.
E) PROOFS: obtenues = audit authority/version; attendues = rewrite applique apres gate safe.
F) ROLLBACK: non applicable (plan uniquement).

# 06 ROOT README REWRITE PLAN

Statut execution: `BLOCKED` (gate local).

Plan de rewrite cible (a executer apres workspace safe):

1. Header compact: produit + statut prouve (`v27.2.0` tant que V28 non prouve).
2. Quick start court: installation + lancement + lien vers `docs/README.md`.
3. Architecture haut niveau (sans duplication profonde).
4. Supprimer timeline contradictoire et claims mixtes v27.0.5/v27.2.0 en concurrent.
5. Ajouter section "Version Authority" pointant `package.json` + `CHANGELOG.md`.
6. Marquer legacy vers `docs/archive/**` sans suppression.

Classes verite associees:
- Etat courant: `CONTRADICTORY`
- Etat cible: `PROVEN_BY_REPO` + `LOCALLY_VERIFIED`.
