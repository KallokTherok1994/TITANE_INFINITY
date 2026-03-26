A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1 (repo truth), R3 (autoheal/registry read-only), R4 (proof_packs write)
C) RISK: P1
D) PLAN:
E) 1. Detecter collisions AutoHeal.
F) 2. Detecter proof packs redondants/non pushes.
3. Detecter fichiers stale pouvant tromper la phase suivante.
4. Classifier KEEP/ARCHIVE/DELETE/BLOCK.
PROOFS: obtenues = rg sur IDs AH + status untracked + listing proof_packs/registry.
ROLLBACK: `rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

# 06 DUPLICATE REPLAY AUDIT

Elements audites:

1. Collision ID AutoHeal `AH-2026-03-14-0170` local vs origin
- Classification: `BLOCK_PENDING_HUMAN`
- Raison: meme ID, semantique differente, historique append-only sensible.

2. Collision ID AutoHeal `AH-2026-03-14-0171` local vs origin
- Classification: `BLOCK_PENDING_HUMAN`
- Raison: meme ID, scope differente (e2e local vs rust/tests origin).

3. Proof packs locaux non suivis
- `proof_packs/FINAL_CLOSURE_CAMPAIGNS_2026-03-14_163717_3544e53bb/`
- `proof_packs/TIMEOUT_USEFUL_WINDOW_TUNING_2026-03-14_134743_3544e53bb/`
- Classification: `KEEP_HISTORICAL`
- Raison: artefacts potentiellement utiles, non destructifs, mais non canonises tant que sync/main non scelle.

4. Fichier non suivi `deployment/latest/builds/BUILD_REPRODUCIBILITY.md`
- Classification: `ARCHIVE_SAFE`
- Raison: residu probable de generation locale, hors scope sync/seal.

5. Changements locaux sur fileset attendu AH-0170
- Classification: `LOCAL_CONFLICTING_WORK`
- Raison: risque de replay faux-positif et de reapplication involontaire.

Conclusion audit:
- Risque replay/duplicate eleve.
- Stop-the-line maintenu jusqu'a resolution humaine des collisions d'identifiants.
