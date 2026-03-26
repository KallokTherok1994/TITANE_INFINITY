A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (`proof_packs/DOCS_V28_CANONICAL_FUSION_2026-03-14_1414_3544e53bb/01_GIT_SAFETY_GATE.md`, preuves Git dans `_phase0_git_gate.log`)
C) RISK: P0
D) PLAN: 1) capturer verite git 2) classifier etat local 3) evaluer securite docs fusion 4) decider stop/continue.
E) PROOFS: obtenues = commandes Phase 0 exactes; attendues = classification unique de securite.
F) ROLLBACK: suppression du proof pack uniquement.

# 01 GIT SAFETY GATE

## Verite autoritaire

- Branche locale: `MAIN` (`LOCALLY_VERIFIED`)
- HEAD local: `3544e53bb` (`LOCALLY_VERIFIED`)
- Remote autoritaire: `origin/MAIN` (`PROVEN_BY_REPO`)
- `origin/main`: absent (`LOCALLY_VERIFIED`)

## Etat workspace

- Worktree: sale, nombreux changements hors docs (`PROVEN_BY_REPO`)
- Local en retard de `origin/MAIN`: 6 commits (`PROVEN_BY_REPO`)
- Diff HEAD..origin/MAIN: non trivial, zones code/scripts/e2e impactees (`PROVEN_BY_REPO`)

## Classification gate (unique)

- `DIRTY_CONFLICTING`

## Decision de securite

- Documentation-wide rewrite: `BLOCKED`
- Raison: fusion doc large sur base locale non sure risquerait une autorite documentaire fausse.

## Action minimale suivante (<=30 min)

- Creer une preservation explicite du travail local (branche/stash documente), puis fast-forward propre vers `origin/MAIN` avant toute fusion documentaire canonique.
