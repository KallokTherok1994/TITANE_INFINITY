A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R3 (scripts/autoheal read-only), R4 (proof_packs write)
C) RISK: P1
D) PLAN:
E) 1. Identifier verite canonique origin.
F) 2. Identifier artefacts redondants locaux.
3. Preserver append-only sans rewrite.
4. Decider archive/suppression minimale.
PROOFS: obtenues = comparaison autoheal local/origin + presence commits + inventaire proof packs.
ROLLBACK: `rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

# 07 AUTOHEAL PROOFPACK RECONCILIATION

Canoniques (source de verite main distante):
- Commit `c1d44ba3a` (AH-0170 attendu, CI/prettier).
- Commit `822976902` (AH-0171 attendu, rust/tests).
- AutoHeal correspondant dans `origin/MAIN`.

Redondants / divergents locaux:
- Entrees locales `AH-0170` et `AH-0171` avec semantique differente de `origin/MAIN`.
- Proof packs locaux non suivis relies a ces IDs mais hors canon main actuel.

Stale uniquement:
- `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` non suivi, hors scope direct du scellage main sync.

Actions effectuees:
- Preserve: oui (aucune suppression destructive de l'historique local).
- Archive: non appliquee automatiquement dans cette session.
- Remove: aucune suppression effectuee.

Integrite append-only:
- `INTACTE` dans le sens ou aucun historique committe n'a ete reecrit.
- `NON RECONCILIEE` localement a cause de collisions ID non resolues.
