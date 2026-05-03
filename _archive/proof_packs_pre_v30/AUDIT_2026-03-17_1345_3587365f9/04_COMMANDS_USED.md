# COMMANDS USED
grep -n "get_nexus_state|..." src/services/tauri/backend-v17.2.commands.ts
grep -n "engine_get_nexus_state|..." src-tauri/src/main.rs
grep -n "\.expect(" src-tauri/src/lib.rs
bash scripts/verify_instructions.sh → PASS=20 FAIL=0
bash scripts/autoheal/detect_recurrence.sh → PASS entries=357
