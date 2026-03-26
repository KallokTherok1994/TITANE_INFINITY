# 02_SCOPE

## Périmètre minimal autorisé (touché)
- src-tauri/src/main.rs
- src-tauri/src/services/mod.rs
- src-tauri/src/commands/db_commands.rs
- src-tauri/src/services/db/*
- src-tauri/src/services/sync/*
- src-tauri/tests/option1_*.rs
- src/hooks/useTitaneDb.ts
- src/hooks/__tests__/useTitaneDb.test.ts
- scripts/gates/g_frontend_no_web.sh
- scripts/gates/g_network_one_door.sh
- scripts/gates/g_no_test_skips.sh
- scripts/lib/run_x3.sh
- scripts/lib/scan_invariants.sh
- scripts/lib/redact_secrets.sh
- scripts/lib/*.ps1
- scripts/run_all.sh
- scripts/run_all.ps1
- proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/*

## Rings touchés
- R3: services DB/sync + commandes IPC backend
- R4: hook UI IPC only
- scripts/docs: gates, wrappers, preuves

## Surfaces interdites explicitement
- Aucune création de fetch/axios/WebSocket côté UI
- Aucun contournement du gateway réseau
- Aucun build/deploy prod token-gated

## Feature flags (DEFAULT OFF)
- OPTION1_LIBSQL_ENABLED=false
- OPTION1_SYNC_ENABLED=false
- OPTION1_SYNC_INTERVAL_MS=120000
