# PROOF_SCENARIOS

## Scenario A - Chat write persist recheck
- Status: PARTIAL (not re-run in this cycle)
- Prior proof pack shows events append in conversation_os_v1.db.

## Scenario B - Memory write persist recheck
- Status: PARTIAL (not re-run in this cycle)
- Prior proof pack shows derived memory surface updates.

## Scenario C - Restart survival
- Status: BLOCKED (restore harness fails before restart verification).

## Scenario D - Snapshot / restore
- Harness now invokes titan_load_state / titan_list_snapshots / titan_recover_state.
- Result (run1/run2/run3): FAIL at titan_load_state empty (no snapshots).
- Status: BLOCKED by missing snapshots in persistence engine.

## Scenario E - Sync contract runtime
- Local sync: PARTIAL (chat/orch not revalidated here).
- External sync: BLOCKED_ENV (no TURSO/Option1 config detected).

## Scenario F - No-loss check
- Status: BLOCKED (depends on snapshot/restore).

## Scenario G - Accidental artifact cleanup
- Classified zero-byte files in repo root as accidental artifacts.
- Removed safely: B{Restore, CE[Conversation, CREATE[Append, IPC[IPC], Match, Mismatch, No, RESTORE{Restore, Yes.
- Rollback: recreate from backup or note removal in rollback file.
