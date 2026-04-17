# 2026-04-17 — Chat UI Zoom Width Containment

## Scope

- Surface canonique: `/titane?tab=conversation`
- Symptom: l onglet Chat et la page conversation pouvaient sortir a droite de la fenetre sous zoom TopNav navigateur.

## Root Cause

- `AppShell` compensait la hauteur sous `html zoom`, mais pas la largeur.
- `TitanePage.css` gardait encore des largeurs `100vw` sur la surface conversationnelle.

## Fix

- Compensation largeur + hauteur via `--titane-ui-scale` dans `src/components/layout/AppShell.tsx`.
- Realignement parent-bound dans `src/pages/TitanePage.css` et `src/pages/TitanePage-local.css`.
- Ajout d une preuve unitaire `src/components/layout/__tests__/AppShell.test.tsx`.
- Extension des preuves navigateur et desktop aux bornes gauche/droite.

## Proof

- `runTests src/components/layout/__tests__/AppShell.test.tsx src/__tests__/ui/conversation-fullscreen-shell.test.ts`
- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-layout-viewport.spec.ts --reporter=line`
- `TAURI_BINARY_PATH=/usr/bin/titane-infinity TITANE_NATIVE_BINARY_MODE=installed corepack pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/chat-layout-viewport.wdio.test.js`

## Verdict

- PASS — la lane navigateur ne reproduit plus la sortie de fenetre a droite sous zoom 1.1, et la lane Tauri installee reste PASS.