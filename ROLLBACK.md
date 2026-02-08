# ROLLBACK — E2E Desktop Robustify

## Objectif
Documenter un rollback simple et les actions pour passer de AUTO_UI_LIMITED à AUTO_UI_FULL.

## Rollback rapide (code)
1. Revenir aux scripts/runner précédents (ex: revert du commit courant).
2. Vérifier que `pnpm run e2e:desktop` retourne au comportement antérieur.

## Passer de LIMITED → FULL (Linux)
### 1) Installer le native driver WebKit
Ubuntu/Pop!_OS:
- sudo apt update
- sudo apt install -y webkit2gtk-driver

Vérifier:
- which WebKitWebDriver

### 2) Relancer la certification desktop
- pnpm run e2e:desktop

## Vérification des modes
Le mode est écrit dans:
- reports/e2e-desktop/DESKTOP_E2E_MODE.json

Un run FULL exige:
- tauri-driver: OK
- native driver: OK

## Notes
- Aucun build/déploiement n’est exécuté ici (mode dev uniquement).
