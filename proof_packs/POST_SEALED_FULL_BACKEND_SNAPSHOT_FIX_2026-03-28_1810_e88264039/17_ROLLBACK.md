# ROLLBACK

## 1. PRODUCT ROLLBACK (this cycle — test-only changes)

To undo proof tests added this cycle:
```bash
git restore -- src-tauri/src/persistence/types.rs
```

To undo all changes including P1.10c production fixes:
```bash
git restore -- src-tauri/src/persistence/commands.rs
git restore -- src-tauri/src/persistence/mod.rs
git restore -- src-tauri/src/persistence/types.rs
```

## 2. GOVERNANCE ROLLBACK

Registry rollback:
```bash
# Remove last line (this cycle)
head -n -1 registry/proofpack-index.jsonl > /tmp/r.jsonl && mv /tmp/r.jsonl registry/proofpack-index.jsonl
# Remove P1.10c line too
head -n -1 registry/proofpack-index.jsonl > /tmp/r.jsonl && mv /tmp/r.jsonl registry/proofpack-index.jsonl
```

Proof pack removal:
```bash
rm -rf proof_packs/POST_SEALED_FULL_BACKEND_SNAPSHOT_FIX_2026-03-28_1810_e88264039
rm -rf proof_packs/POST_SEALED_FULL_BACKEND_SNAPSHOT_FIX_2026-03-28_1745_e88264039
```

## 3. PERSISTENCE / TEST ARTIFACTS

No new runtime artifacts created in this session.
Existing DB files: ~/.local/share/TITANE_INFINITY/persistence/*.json — unchanged (still empty).
The proof tests run in-memory only; no DB writes during test execution.

## 4. BACKEND TRIAGE IMPACT

This cycle:
- Reduced uncertainty: YES — serialization roundtrip proven at unit test level
- Restore/no-loss runnable: YES — code path fully wired, requires Tauri app execution
- Next step: Build Tauri app and run with TITANE_RESTORE_PROOF=1

## What this cycle has proven (cumulative P1.10c + this cycle)
1. titan_force_snapshot_current (mock) emits SingularityState::default() — PROVEN
2. status.snapshots_created increments — PROVEN
3. Snapshot::from_state → to_state JSON equality — PROVEN
4. Full persistence suite: 87/87 PASS — PROVEN
5. DB files exist and are accessible — CONFIRMED

## What remains
1. Tauri runtime E2E with TITANE_RESTORE_PROOF=1 → SNAPSHOT_RESTORE_PROVEN
2. Full-feature build errors (7 pre-existing) → separate cycle
3. External sync TURSO_URL → BLOCKED_ENV (separate concern)
