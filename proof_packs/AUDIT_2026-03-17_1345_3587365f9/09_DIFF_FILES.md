# DIFF FILES

## backend-v17.2.commands.ts (FIX-001)
- line 159: `get_full_system_state` → `get_system_state`
- line 166: `get_nexus_state` → `engine_get_nexus_state`
- line 173: `get_harmonia_state` → `engine_get_harmonia_state`
- line 180: `get_sentinel_state` → `engine_get_sentinel_state`
- line 203: `get_full_system_state` → `get_system_state` (composite.getDashboard)
- line 215: `get_full_system_state` → `get_system_state` (composite.captureSnapshot)

## lib.rs (FIX-002)
- line 418: `.expect("error while running tauri application")` → `.unwrap_or_else(|e| { eprintln!(...); exit(1) })`
