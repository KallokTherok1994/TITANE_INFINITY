A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1 (worktree safety), R4 (proof write)
C) RISK: P0
D) PLAN:
E) 1. Classifier chaque changement local.
F) 2. Isoler risques de perte de donnees.
3. Definir actions de preservation non destructives.
PROOFS: obtenues = `git status --short` et `git status`.
ROLLBACK: aucun changement sur fichiers utilisateur; suppression possible du pack uniquement.

# 17 UNCOMMITTED WORK SAFETY REPORT

Classification des changements suivis:

- `deployment/latest/builds/hash_run_1.txt` -> `GENERATED_SAFE`
- `deployment/latest/builds/titane-infinity.run1.normalized` -> `GENERATED_SAFE`
- `docs/_evidence/g7-tauri-allowlist-lock-report.md` -> `USER_WORK_PRESERVE`
- `docs/_evidence/g8-provider-api-only-report.md` -> `USER_WORK_PRESERVE`
- `e2e/desktop/online-chat-proof-ui.wdio.test.js` -> `CONFLICTING_WORK`
- `e2e/desktop/online-chat-proof.wdio.test.js` -> `UNKNOWN_HUMAN_WORK`
- `scripts/autoheal/autoheal_rules.jsonl` -> `CONFLICTING_WORK`
- `scripts/e2e/tauri-wrapper.sh` -> `UNKNOWN_HUMAN_WORK`
- `scripts/gates/g5-ci-wiring.sh` -> `UNKNOWN_HUMAN_WORK`
- `scripts/gates/g7-tauri-allowlist-lock.sh` -> `UNKNOWN_HUMAN_WORK`
- `scripts/gates/run-all.sh` -> `UNKNOWN_HUMAN_WORK`
- `src-tauri/src/conversation_engine/mod.rs` -> `UNKNOWN_HUMAN_WORK`
- `src/lib/tauriClient.ts` -> `UNKNOWN_HUMAN_WORK`
- `wdio.desktop.conf.cjs` -> `UNKNOWN_HUMAN_WORK`

Classification des non suivis:

- `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` -> `TEMP_SAFE`
- `proof_packs/FINAL_CLOSURE_CAMPAIGNS_2026-03-14_163717_3544e53bb/` -> `USER_WORK_PRESERVE`
- `proof_packs/TIMEOUT_USEFUL_WINDOW_TUNING_2026-03-14_134743_3544e53bb/` -> `USER_WORK_PRESERVE`

Decision securite:
- Aucun discard.
- Aucune commande destructive.
- Preservation prioritaire du travail local.

Resultat:
- Etat: `DIRTY_WORKTREE_BLOCKED`
