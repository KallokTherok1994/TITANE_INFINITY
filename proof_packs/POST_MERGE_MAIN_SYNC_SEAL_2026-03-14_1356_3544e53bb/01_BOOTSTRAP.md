A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1 (repo root Git commands), R4 (proof_packs write)
C) RISK: P1
D) PLAN:
E) 1. Capturer etat local exact.
F) 2. Capturer etat distant exact.
3. Qualifier worktree clean/dirty.
4. Evaluer securite de sync.
5. Proposer action <= 30 min.
PROOFS: obtenues = `git status`, `git status --short`, `git rev-parse`, `git fetch`, `git log`, `git diff --stat`.
ROLLBACK: `rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

# 01 BOOTSTRAP

- Date: `2026-03-14`
- Heure: `13:56`
- Branche checkout: `MAIN`
- HEAD local: `3544e53bb`
- Ref distant canonique: `origin/MAIN` = `5edf4152f`
- Note de ref: `origin/main` est inexistant dans ce depot (branche distante uppercase).

Classification locale bootstrap: `DIRTY_WORKTREE_BLOCKING`

Justification:
- `git status` indique `MAIN` en retard de 6 commits, fast-forward possible sur arbre propre.
- Worktree sale avec modifications sur `deployment/**`, `docs/**`, `e2e/**`, `scripts/**`, `src-tauri/**`, `src/**`, `wdio.desktop.conf.cjs`.
- Fichiers non suivis presents dont proof packs non commits.

Risque principal:
- P1 false sync et replay de correctifs si sync est tente sans preservation explicite.

Action suivante (<= 30 min):
- Finaliser la classification de securite locale et bloquer toute operation de sync tant que preservation explicite n'est pas documentee.
