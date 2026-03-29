# BREAKPOINT_ANALYSIS — P1.12

## Breakpoints encountered this cycle

**NONE** — P1.12 ran cleanly with no blocking conditions discovered.

---

## Pre-cycle risk analysis (resolved before first run)

### Risk 1: payload field name casing (RESOLVED_BEFORE_RUN)

**Risk**: Rust `apply_event_to_state` accesses `payload["amount"]` and `payload["level"]`. If JSON serialization uses different casing, the field lookup would silently return None (→ default 0).

**Resolution**: Confirmed from P1.11 that serde_json uses the exact string key as provided. JS `{ amount: 100 }` → JSON `{"amount":100}` → Rust `payload["amount"]` = `Some(100.0)`. No casing issue.

### Risk 2: `progress` depth saturation at 10 (INAPPLICABLE)

**Risk**: `(payload["level"] as u8).min(10)` would clamp level > 10. Level 7 is safely below ceiling.

**Resolution**: Used level=7. Saturation not triggered. Assertion is exact value (7), not ≥7.

### Risk 3: settings `last_update_ms` identity breaking if another event emitted after settings (INAPPLICABLE)

**Risk**: If any IPC call between the settings emit and the post-state load triggers another event, last_sync_ms would diverge from metrics.last_update_ms.

**Resolution**: No other event is emitted between settings emit and titan_load_state. Protocol is clean.

### Risk 4: WRY session crash (INAPPLICABLE — 0/3 runs crashed)

**Risk**: Pre-existing ~25% WRY crash rate documented in P1.10–P1.11.

**Resolution**: All 3 runs completed cleanly. No retry needed. This is consistent with expected variance.

---

## Cross-run state accumulation (expected behavior, not a breakpoint)

The events.json grows with each run (15 total after X3). This is intentional and correctly handled by the `>` filter in `load_events_since`. Each run's pre-state correctly reflects all prior events replayed from the latest snapshot. The `preTicks + 100` delta assertion accounts for this correctly.

---

## Prior cycle breakpoints (for context — not re-opened)

- BP1 (P1.10c): mock stub `titan_force_snapshot_current` returned Err → fixed, RESOLVED
- BP2 (P1.10c): `snapshots_created` stuck at 0 → fixed by BP1 resolution, RESOLVED
- BP3 (P1.11): No breakpoints discovered
