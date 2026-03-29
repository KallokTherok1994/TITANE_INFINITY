# APPEND_ONLY_EVENT_TRUTH_MAP

## Event emission path

| Layer | Component | File | Status |
|-------|-----------|------|--------|
| IPC command | titan_persist_event(event: TitanEventDto) | persistence/commands.rs:69 | PROVEN |
| Capability | "titan_persist_event" in commands.allow | capabilities/persistence.json:15 | PROVEN |
| main.rs registration | persistence::commands::titan_persist_event | main.rs:2220 | PROVEN |
| Engine call | PersistenceEngine::persist_event(TitanEvent) | persistence/mod.rs:128 | PROVEN |
| Idempotence check | event_log.has_event(&event.id) | persistence/mod.rs:131 | WIRED (not tested this cycle) |
| DB write | db.insert_event(&event) | persistence/database.rs:145 | PROVEN |
| File write | atomic write to titan_events.events.json | persistence/database.rs:163-170 | PROVEN |
| In-memory log | event_log.append(event.clone()) | persistence/mod.rs:143 | PROVEN |
| Counter | status.events_persisted += 1 | persistence/mod.rs:146 | PROVEN |
| Dirty flag | status.dirty = true | persistence/mod.rs:148 | PROVEN |

## Event structure (TitanEvent)

- id: UUID generated at creation
- timestamp: Utc::now().timestamp_millis() (milliseconds)
- module: string (e.g. "memory")
- event_type: string (e.g. "add")
- payload: serde_json::Value
- origin: EventOrigin enum (User/Engine/SelfHeal/System/Migration)
- schema_version: u32

## Canonical sink

File: ~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json
Format: JSON array of TitanEvent objects (append-only semantics via full-read + push + atomic write)
Observed: 3 events after P1.11 X3 runs

## Proof source

Runtime: X3 E2E runs, all calling titan_persist_event via Tauri IPC
File inspection: events.json contains 3 events with expected module/event_type/payload/timestamp

## Risk

- events.json atomic write uses .tmp file → rename: safe ✓
- Idempotence by UUID: tested in unit tests, not tested for collision at runtime (low risk)
- events.json grows unboundedly (no compaction in this cycle) — future concern

## Action

No action needed. Event emission is PROVEN at runtime.
