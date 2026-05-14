# ROLLBACK PLAN — TOTAL_DEV v28.1.0

## Périmètre

Implémentation TOTAL_DEV GOD DEV — version v28.1.0, commit pending sur MAIN.

## Procédure de rollback

```bash
# 1. Supprimer les nouveaux fichiers
rm src-tauri/src/commands/total_dev_commands.rs
rm src-tauri/capabilities/total_dev.json
rm src/pages/TotalDevPage.tsx
rm src/pages/TotalDevPage.css

# 2. Revert les fichiers modifiés
git restore src-tauri/src/main.rs
git restore src/core/commands/TAURI_COMMANDS.ts
git restore src/App.tsx

# 3. Vérifier
cargo check --manifest-path src-tauri/Cargo.toml
pnpm run check
```

## Impact rollback

- Route `/total-dev` disparaît (404 → redirect racine)
- NavItem TOTAL_DEV absent du menu
- 6 commandes IPC retirées de invoke_handler
- Aucune donnée persistante perdue (session runtime seulement)

## Prérequis rollback

- Aucun commit PROD avec token `GO_FOR_PROD_BUILD__TITANE_INFINITY` n'a été émis
- Sécurité : hash SHA-256 "Kanele1994" jamais exposé côté frontend (aucune fuite même après rollback)
