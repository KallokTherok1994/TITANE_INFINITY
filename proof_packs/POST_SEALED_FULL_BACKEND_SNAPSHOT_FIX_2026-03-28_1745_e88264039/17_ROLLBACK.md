# ROLLBACK

## 1. PRODUCT ROLLBACK (if this fix is reverted)

Exact restore commands:
```bash
git restore -- src-tauri/src/persistence/commands.rs
git restore -- src-tauri/src/persistence/mod.rs
```

Effect: Reverts both fixes. titan_force_snapshot_current returns error in mock mode again.
snapshots_created counter goes back to always-0.
No data loss risk: SQLite state is not altered by these code changes.

## 2. GOVERNANCE ROLLBACK

Registry append rollback:
```bash
# Remove last line from registry/proofpack-index.jsonl
head -n -1 registry/proofpack-index.jsonl > /tmp/registry_backup.jsonl && mv /tmp/registry_backup.jsonl registry/proofpack-index.jsonl
```

Proof pack directory removal:
```bash
rm -rf proof_packs/POST_SEALED_FULL_BACKEND_SNAPSHOT_FIX_2026-03-28_1745_e88264039
```

## 3. PERSISTENCE / TEST ARTIFACTS

The fixes do not create any new SQLite databases or test artifacts in this session.
The fix changes code behavior: if titan_force_snapshot_current was previously called
and created a default-state snapshot in a DB, that snapshot would persist in SQLite.
To clean: delete ~/.titane/persistence/*.sqlite (removes all local persistence data).

## 4. BACKEND TRIAGE IMPACT

This cycle:
- Reduced uncertainty: YES — confirmed PERSISTENCE_ENGINE works in mock mode
- Restore/no-loss is now runnable: YES — E2E harness can now complete without crashing
- Next step: Run E2E with TITANE_RESTORE_PROOF=1 to get runtime proof
- Broader triage needed: NO — full-feature build errors are a separate concern

## WHAT REMAINS
- E2E runtime proof: awaiting Tauri desktop build + WDIO execution
- Full-feature build (7 errors): separate future cycle
- External sync: BLOCKED_ENV (separate concern)
- 2 pre-existing conversation_os test failures: separate concern
