# ROLLBACK — Desktop E2E (EXPERIMENTAL)

## Suppression scripts
- Remove scripts/e2e/ensure-linux-desktop-driver.sh
- Remove scripts/e2e/run-e2e-desktop.sh
- Remove wdio.desktop.conf.cjs
- Remove e2e/desktop/*.e2e.js

## Suppression deps
- Remove @wdio/* + webdriverio from devDependencies
- Run pnpm install to refresh lock

## Désinstallation tauri-driver
- cargo uninstall tauri-driver

## Suppression data-testid
- Revert src/components/sections/ConversationSection.tsx

## Registry
- Remove last UI registry entry (ui-022) if rollback performed
