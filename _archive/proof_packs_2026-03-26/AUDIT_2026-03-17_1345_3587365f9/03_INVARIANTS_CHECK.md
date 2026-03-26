# INVARIANTS CHECK
I1 Tauri-only: PASS — no new HTTP added
I2 No direct frontend network: PASS
I3 Honest fallback: PASS — safeInvoke already has error handling
I4 4-Ring: PASS — only Ring4 IPC consumer touched
I5 Allowlist: N/A — no new commands added
I6 IPC canonical: PASS — remapped to existing registered commands
I7 Single invoke path: PASS
I10 Minimal patch: PASS — 6+1 lines changed
I12 No lying autoheal: PASS — fix resolves actual CHAIN_BROKEN, not masks it
I15 Runtime core: PASS — fixing existing commands, not adding new ones
