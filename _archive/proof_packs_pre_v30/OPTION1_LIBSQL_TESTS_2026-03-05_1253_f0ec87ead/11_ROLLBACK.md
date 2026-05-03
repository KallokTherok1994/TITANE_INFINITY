# 11_ROLLBACK

## Rollback code
- git restore -SW -- src-tauri/src/main.rs src-tauri/src/services/mod.rs src-tauri/src/commands/db_commands.rs src-tauri/src/services/db src-tauri/src/services/sync src/hooks/useTitaneDb.ts src/hooks/__tests__/useTitaneDb.test.ts scripts/gates scripts/lib scripts/run_all.sh scripts/run_all.ps1

## Feature flags OFF
- OPTION1_LIBSQL_ENABLED=false
- OPTION1_SYNC_ENABLED=false
- OPTION1_SYNC_INTERVAL_MS=120000

## Migration rollback
- Supprimer le fichier DB local option1: `<app_data_dir>/option1_libsql_local.db`.
- Aucun impact sur tables legacy hors ce fichier.

## Retour DB locale-only garanti
- Le sync requiert TURSO_*; sans config, statut `SYNC_MISSING_CONFIG` et CRUD local continue.
