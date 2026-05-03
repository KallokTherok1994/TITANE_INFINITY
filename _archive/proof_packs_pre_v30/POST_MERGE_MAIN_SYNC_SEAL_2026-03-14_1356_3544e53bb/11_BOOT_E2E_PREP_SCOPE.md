A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1/R2/R3/R4 selon le rapport (chemins exacts documentes dans le corps).
C) RISK: P1
D) PLAN: 1) lock git 2) safety classify 3) verify AH-0170 4) verify AH-0171 5) audit duplicate/replay 6) run minimal checks 7) decide gate/verdict.
E) PROOFS: obtenues/attendues detaillees dans le rapport.
F) ROLLBACK: section rollback du rapport + 13_ROLLBACK.md.

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (specification prep only, no runtime mutation)
C) RISK: P1
D) PLAN:
E) 1. Definir chaine cible Boot/E2E.
F) 2. Definir perimetre autorise/interdit.
3. Definir preuves requises.
4. Definir blockers stricts.
PROOFS: attendues seulement (non executees dans ce run bloque).
ROLLBACK: `rm -rf proof_packs/POST_MERGE_MAIN_SYNC_SEAL_2026-03-14_1356_3544e53bb`

# 11 BOOT E2E PREP SCOPE

Statut d'autorisation:
- `NON AUTORISE` tant que la sync MAIN locale n'est pas scellee.

1. Chaine cible exacte:
- source -> desktop entry target -> boot markers -> shell/window -> visible page -> chat surface -> backend bridge

2. Fichiers autorises (si gate futur ouvert):
- `scripts/launch/**`
- `scripts/e2e/**`
- `e2e/desktop/**`
- `wdio.desktop.conf.cjs`
- `src/lib/tauriClient.ts`

3. Fichiers interdits (phase prep):
- `src-tauri/src/**` (hors correctif explicitement autorise)
- `scripts/autoheal/autoheal_rules.jsonl` (pas de nouvel ID sans nouveau bug reel)
- `deployment/**` (hors evidence de run explicitement mandatee)

4. Max touched files:
- `10`

5. Max rings touched:
- `2`

6. Categories de preuve requises:
- static
- runtime
- visible
- stability x3

7. Regles anti-fake-green:
- `HARNESS_PASS != PRODUCT_PASS`
- `APP_LAUNCH != BOOT_OK`
- `SCREENSHOT != FLOW_PROOF`
- `DOM_MARKER != BACKEND_CHAIN_PROOF`

8. Conditions de blocage exactes:
- main sync non scellee
- collision AutoHeal non resolue
- worktree conflictuel non preserve
- absence de preuves runtime minimales valides
