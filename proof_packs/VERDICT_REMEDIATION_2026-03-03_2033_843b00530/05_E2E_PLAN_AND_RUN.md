# E2E PLAN AND RUN (TAURI RUNTIME)

## Détection scripts

- `package.json` expose `test:e2e`, `test:e2e:playwright`, `e2e:desktop`, `e2e:desktop:run`.
- Wrapper natif présent: `scripts/e2e/tauri-wrapper.sh`.

## Renforcement appliqué

- Ajout `scripts/e2e/run_e2e_tauri.sh`:
	- timeout borné (`MAX_TIMEOUT_SECONDS`, défaut 1800s)
	- logs + fichier statut dans proof-pack
	- verdict explicite: `PASS_E2E_RUNTIME` / `FAIL_E2E_RUNTIME` / `BLOCKED_E2E_RUNTIME`

## Exécution réelle

- Run x1: PASS.
- Run x3: PASS (3/3).
- Commande exécutée: `pnpm run e2e:desktop` via wrapper.
- Runtime réel prouvé: `tauri-driver`, `WebKitWebDriver`, exécution `node scripts/e2e/run-desktop-suite.js`.

## Preuves

- `09_LOGS_E2E.md`
- `e2e_tauri_runtime.status`
