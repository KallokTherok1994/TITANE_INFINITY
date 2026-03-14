A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (proof artifacts only)
C) RISK: P0
D) PLAN:
E) 1. Definir rollback non destructif.
F) 2. Preserver travail utilisateur existant.
3. Retirer uniquement ce pack si demande.
PROOFS: obtenues = commandes rollback proposees.
ROLLBACK: voir section ci-dessous.

# 13 ROLLBACK

Rollback minimal de cette session (sans toucher aux modifications utilisateur preexistantes):

1. Supprimer uniquement ce pack de preuve:
`rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

2. Verifier que seul ce scope disparait:
`git status --short`

Interdit dans ce contexte:
- `git reset --hard`
- `git checkout -- .`
- toute commande destructive globale du worktree.
