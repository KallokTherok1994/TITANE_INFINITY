# CANONICAL_STORE_STATUS

## Canonical runtime store
- Chat/turn canon: /home/titane-os/.local/share/TITANE_INFINITY/runtime/memory/conversation_os_v1.db
- Persistence engine store (snapshots/events): /home/titane-os/.local/share/TITANE_INFINITY/persistence/titan_events.db

## Status
- Canonical chat store: PROVEN in prior runtime proof pack.
- Persistence engine snapshots: EMPTY (titan_load_state returns None; titan_list_snapshots empty).

## Evidence
- Restore harness failures in run1/run2/run3: "titan_load_state returned empty state; no snapshots available in persistence engine".
