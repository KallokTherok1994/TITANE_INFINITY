A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1 (Git authority lock), R4 (proof_packs write)
C) RISK: P1
D) PLAN:
E) 1. Lock local HEAD.
F) 2. Lock origin main truth.
3. Mesurer ahead/behind.
4. Mesurer dirty state.
5. Decider si sync est safe.
PROOFS: obtenues = fetch prune + logs divergence + diffstats + untracked listing.
ROLLBACK: `rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

# 02 GIT AUTHORITY LOCK

Etat autoritaire:
- Branche locale: `MAIN`
- HEAD local: `3544e53bb`
- HEAD distant: `origin/MAIN` = `5edf4152f`
- Relation: local est en retard de 6 commits (`HEAD..origin/MAIN` non vide, `origin/MAIN..HEAD` vide).

Commandes critiques observees:
- `git fetch --all --prune` execute.
- `git log --oneline --decorate HEAD..origin/MAIN` montre les commits incluant:
  - `c1d44ba3a` (AH-0170 attendu)
  - `822976902` (AH-0171 attendu)
- `git diff --stat HEAD..origin/MAIN` montre un delta important incluant le fileset attendu AH-0170 et `src-tauri/tests/omega_p2_performance_test.rs`.

Etat worktree:
- Sale (`git status --short` non vide).
- Changements locaux non commits detectes.
- Non suivis detectes (dont packs de preuve locaux).

Classification autoritaire:
- Etat local global: `DIRTY_WORKTREE_BLOCKING`
- Securite de sync immediate: `BLOCKED`

Decision:
- Aucune commande de sync (`pull`, `merge`, `reset`) ne doit etre executee avant preservation classee et validee.

Action suivante (<= 30 min):
- Classifier chaque changement local selon politique de preservation (USER_WORK_PRESERVE, GENERATED_SAFE, etc.).
