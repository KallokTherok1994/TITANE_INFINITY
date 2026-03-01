# UNBLOCK_TAURI_DRIVER_AUDIT — Desktop E2E

Date: 2026-02-08

## Fichiers inspectés
- scripts/e2e/ensure-linux-desktop-driver.sh
- scripts/e2e/run-e2e-desktop.sh
- wdio.desktop.conf.cjs
- reports/e2e-desktop/BOOT_DESKTOP_SMOKE.md

## Constat
- Dépendance à node_modules/.bin supprimée
- Résolution binaire par PATH / ~/.cargo/bin / target/release
- Auto-install cargo ajoutée
- Détection WebKitWebDriver (Linux) ajoutée
