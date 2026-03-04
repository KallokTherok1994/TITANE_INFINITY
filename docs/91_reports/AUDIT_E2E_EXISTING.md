# AUDIT_E2E_EXISTING — Desktop Harness

Date: 2026-02-08

## Détection
- Playwright: présent (playwright.config.ts, scripts test:e2e)
- E2E dossier: e2e/ (web-only)
- WDIO: absent avant ajout
- tauri-driver: attendu via @tauri-apps/cli

## Décision
- Harness choisi: WebdriverIO + tauri-driver (desktop)
- Statut: EXPERIMENTAL

## Run attempt
- pnpm run e2e:desktop → FAIL
- Cause: tauri-driver introuvable dans node_modules/.bin
