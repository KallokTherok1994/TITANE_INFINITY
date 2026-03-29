# ALIGNMENT_OR_FIXES

## Applied fix (bounded)
- File: e2e/desktop/online-chat-proof-ui.wdio.test.js
- Change: Added restore/no-loss harness step guarded by TITANE_RESTORE_PROOF=1.
- IPC invoked: titan_persistence_init, titan_get_persistence_status, titan_list_snapshots, titan_load_state, titan_recover_state, titan_force_snapshot.
- Purpose: unblock restore/no-loss runtime proof without changing product behavior.

## Not applied
- No product/runtime subsystem changes.
- No autoheal rule updates.
- No external sync configuration changes.
