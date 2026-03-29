# CANONICAL STORE STATUS

Canonical store resolution (src-tauri/src/conversation_engine/commands.rs):
- TITANE_CONVOS_DB_PATH -> XDG_DATA_HOME -> HOME -> data_local_dir

Active runtime store (HOME path):
- /home/titane-os/.local/share/TITANE_INFINITY/runtime/memory/conversation_os_v1.db

Runtime evidence:
- events|4018
- snapshots|2009
- provider_decisions|2009
- max events ts: 2026-03-28 14:29:08 EDT
- max snapshots ts: 2026-03-28 14:29:08 EDT
- max provider_decisions ts: 2026-03-28 14:29:08 EDT

Recent events (tail):
- evt_assistant_cd35d22a-31e8-4d22-ba5d-5a0a795b5896_req_1774722540006_qxryzq | 1774722548319 | assistant_message
- evt_user_cd35d22a-31e8-4d22-ba5d-5a0a795b5896_req_1774722540006_qxryzq | 1774722548318 | user_message

Recent snapshots (tail):
- snap_cd35d22a-31e8-4d22-ba5d-5a0a795b5896_req_1774722540006_qxryzq | 1774722548358

Recent provider decisions (tail):
- dec_cd35d22a-31e8-4d22-ba5d-5a0a795b5896_req_1774722540006_qxryzq | 1774722548320

Repo fallback (not active):
- runtime/memory/conversation_os_v1.db counts 166/83/83

Derived LTM store:
- /home/titane-os/.local/share/TITANE_INFINITY/runtime/memory/unified_memory.db
- memories count: 0

Append-only JSON files:
- /home/titane-os/.local/share/TITANE_INFINITY/persistence/titan_events.events.json lines=0
- /home/titane-os/.local/share/TITANE_INFINITY/persistence/titan_events.snapshots.json lines=0
