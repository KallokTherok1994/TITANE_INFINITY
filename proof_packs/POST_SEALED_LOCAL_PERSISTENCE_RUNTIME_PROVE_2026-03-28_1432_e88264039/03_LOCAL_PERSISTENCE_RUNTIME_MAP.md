# LOCAL PERSISTENCE RUNTIME MAP

| Stage | Canonical owner | Runtime proof source | Status | Risk | Action |
| --- | --- | --- | --- | --- | --- |
| Chat write (user/assistant) | Conversation engine | events table + wdio logs | PROVEN | Low | None |
| Orchestrator decision | Conversation engine | provider_decisions table | PROVEN | Low | None |
| Memory write/persist | Conversation engine | snapshots + memory UI evidence | PARTIAL | LTM not persisted | Prove LTM path |
| Module/engine sync | Modules/engines | No runtime evidence | UNKNOWN | Parallel truth risk | Instrument sync |
| LTM persistence | unified_memory.db | memories table empty | WIRED_BUT_UNPROVEN | LTM unproven | Prove or bound |
| Snapshot create | snapshots table | latest snapshot ts | PROVEN | Low | None |
| Restore | restore harness | No runtime restore | UNKNOWN | No-loss blocked | Add restore proof |
| No-loss verification | replay + restore | Not executed | WIRED_BUT_UNPROVEN | No-loss unproven | Add no-loss proof |
