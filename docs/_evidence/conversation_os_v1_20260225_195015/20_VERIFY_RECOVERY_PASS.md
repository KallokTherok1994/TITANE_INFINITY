# 20_VERIFY_RECOVERY_PASS.md

## Contexte
Le run `pnpm run verify` complet a été interrompu (`exit 130`) en terminal interactif. Une exécution décomposée des sous-gates `verify:*` a été utilisée pour obtenir un verdict déterministe.

## Correctifs appliqués
- `package.json`
  - `scripts.dev` aligné sur `tauri dev` pour satisfaire `verify:tauri-only`.
- `.github/copilot-instructions.md`
  - ajout des tokens exacts exigés par `verify:instructions`:
    - `Local-first`
    - `diagnose -> plan -> apply -> verify -> report`

## Preuve
- `reports/conversation_os_verify_gates_decomposed_round2.log`

## Résultats
- `TAURI_ONLY_EXIT:0`
- `ONLINE_FIRST_EXIT:0`
- `NETWORK_GUARD_EXIT:0`
- `INSTRUCTIONS_EXIT:0`
- `MERMAID_EXIT:0`
- `TAURI_CONFIGS_EXIT:0`

## Décision
- Vérification de reprise: **PASS**
- État campagne: **QUALIFIED + ALL GREEN maintenu**
