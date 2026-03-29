# ROLLBACK

## Rollback assessment

### P1.10c fixes — rollback risk: LOW

**commands.rs change**
- Change: Mock stub now calls PERSISTENCE_ENGINE.force_snapshot() instead of returning Err
- Rollback impact: Restoring prior behavior would re-block snapshot emission in mock mode
- Downstream: E2E restore harness would fail again (invokeTauriCommand throws on Err)
- Verdict: Do NOT roll back — fix is correct and proven safe

**mod.rs change (snapshots_created += 1)**
- Change: Counter now increments per snapshot
- Rollback impact: Counter would return to stuck-at-zero behavior
- Downstream: E2E assertion `postStatus.snapshots_created >= preStatus.snapshots_created + 1` would fail
- Verdict: Do NOT roll back — counter behavior is correct

**types.rs change (proof tests)**
- Change: Two new unit tests added
- Rollback impact: Tests removed; proof coverage reduced
- Risk: Zero — tests add no production code
- Verdict: No reason to roll back; retain for ongoing regression protection

---

## If rollback were required (emergency procedure)

```
git revert <P1.10c_commit_hash>
cargo build --manifest-path src-tauri/Cargo.toml
# Re-run E2E to confirm revert state (expect snapshot emission failure)
```

**Note**: Revert would return to the state where snapshot emission was blocked in mock mode. This would be a regression to the pre-P1.10c failure state.

---

## This cycle (P1.10d)

No code changes were made. Nothing to roll back. Proof pack files and registry append are additive (append-only). No rollback needed or applicable.

---

## Sentinel rollback policy

Per POST_SEALED_SENTINEL regime: rollback of proven fixes requires explicit justification and a new proof cycle demonstrating the rollback is safe. The fixes in P1.10c are PROVEN at runtime. Rollback without cause would violate the sentinel protocol.
