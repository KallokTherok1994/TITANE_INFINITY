# EXEC_SUMMARY — AUDIT_2026-03-17_1345_3587365f9

Date: 2026-03-17T13:45Z SHA: 3587365f9 Branch: MAIN

## VERROU PRINCIPAL

CHAIN_BROKEN — 4 IPC commands in backend-v17.2.commands.ts not registered in generate_handler![]:

- `get_nexus_state` → absent (registered: `engine_get_nexus_state` main.rs:2077)
- `get_harmonia_state` → absent (registered: `engine_get_harmonia_state` main.rs:2078)
- `get_sentinel_state` → absent (registered: `engine_get_sentinel_state` main.rs:2079)
- `get_full_system_state` → absent (registered: `get_system_state` main.rs:1409)

## VIOLATION SECONDAIRE

- I10: lib.rs:418 `.expect()` in mobile entry point

## PATCH APPLIQUÉ

- FIX-001: 6 IPC call sites remapped (backend-v17.2.commands.ts)
- FIX-002: .expect() → .unwrap_or_else() (lib.rs)

## VALIDATORS

- verify_instructions.sh: PASS=20 FAIL=0 ✅
- detect_recurrence.sh: PASS entries=357 ✅
