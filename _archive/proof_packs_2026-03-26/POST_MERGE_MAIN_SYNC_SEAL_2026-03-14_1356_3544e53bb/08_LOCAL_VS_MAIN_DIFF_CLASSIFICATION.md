A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1 (Git diff truth), R4 (proof_packs write)
C) RISK: P1
D) PLAN:
E) 1. Evaluer diff apres reconciliation documentaire.
F) 2. Classifier selon taxonomy stricte.
3. Eviter cleanup hors scope.
PROOFS: obtenues = `git diff --stat HEAD..origin/MAIN` + `git status --short`.
ROLLBACK: `rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

# 08 LOCAL VS MAIN DIFF CLASSIFICATION

Classification finale de diff:
- `LOCAL_CONFLICTING_WORK`

Raisons:
- Worktree sale contenant des modifications dans des zones impactees par les deltas merges.
- Local derriere `origin/MAIN` de 6 commits incluant fixes attendus.
- Collisions AutoHeal sur IDs critiques AH-0170/AH-0171.

Scope de non-action:
- Aucun cleanup broad.
- Aucun refactor opportuniste.
- Aucun overwrite des changements locaux.
